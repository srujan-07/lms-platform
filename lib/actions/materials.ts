'use server';

import { createClient, createAdminClient } from '@/lib/supabase/server';
import { requireAuth, requireRole } from '@/lib/auth/rbac';
import { logAction } from './audit';
import { revalidatePath } from 'next/cache';

export interface CourseMaterial {
    id: string;
    course_id: string;
    title: string;
    description: string | null;
    file_path: string;
    file_size: number | null;
    uploaded_by: string;
    created_at: string;
    updated_at: string;
}

/**
 * Get materials for a course
 * Students can only access materials for enrolled courses
 */
export async function getCourseMaterials(courseId: string) {
    const user = await requireAuth();
    const supabase = await createClient();

    // Check if user has access to this course
    if (user.role === 'student') {
        const { data: enrollment } = await supabase
            .from('enrollments')
            .select('id')
            .eq('student_id', user.id)
            .eq('course_id', courseId)
            .single();

        if (!enrollment) {
            return { success: false, error: 'You are not enrolled in this course', data: null };
        }
    }

    const { data, error } = await supabase
        .from('lecture_notes')
        .select('*')
        .eq('course_id', courseId)
        .order('created_at', { ascending: false });

    if (error) {
        return { success: false, error: error.message, data: null };
    }

    return { success: true, data: data as CourseMaterial[], error: null };
}

/**
 * Upload course material (PDF)
 * Admin/Lecturer only
 */
export async function uploadCourseMaterial(
    courseId: string,
    file: File,
    title: string,
    description?: string
) {
    const user = await requireAuth();

    // Check permissions
    if (user.role === 'student') {
        return { success: false, error: 'Students cannot upload materials', data: null };
    }

    // If lecturer, verify they own the course
    if (user.role === 'lecturer') {
        const supabase = await createClient();
        const { data: course } = await supabase
            .from('courses')
            .select('lecturer_id')
            .eq('id', courseId)
            .single() as any;

        if (!course || course.lecturer_id !== user.id) {
            return { success: false, error: 'You do not have permission to upload to this course', data: null };
        }
    }

    const supabase = await createClient();

    // Upload file to Supabase Storage
    const fileExt = file.name.split('.').pop();
    const fileName = `${courseId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
        .from('course-materials')
        .upload(fileName, file, {
            contentType: file.type,
            upsert: false
        });

    if (uploadError) {
        return { success: false, error: `Upload failed: ${uploadError.message}`, data: null };
    }

    // Create database record
    const { data, error } = await supabase
        .from('lecture_notes')
        .insert({
            course_id: courseId,
            title,
            description,
            file_path: uploadData.path,
            file_size: file.size,
            uploaded_by: user.id,
        } as any)
        .select()
        .single();

    if (error) {
        // Clean up uploaded file if database insert fails
        await supabase.storage.from('course-materials').remove([fileName]);
        return { success: false, error: error.message, data: null };
    }

    await logAction(user.id, 'material.uploaded', 'lecture_note', (data as any).id, {
        course_id: courseId,
        title,
        file_size: file.size,
    });

    revalidatePath(`/admin/courses/${courseId}/materials`);
    revalidatePath(`/lecturer/courses/${courseId}/materials`);
    revalidatePath(`/dashboard/courses/${courseId}`);

    return { success: true, data: data as CourseMaterial, error: null };
}

/**
 * Get signed URL for material download
 * Enforces enrollment check for students
 */
export async function getMaterialSignedUrl(materialId: string) {
    const user = await requireAuth();
    const supabase = await createClient();

    // Get material details
    const { data: material, error: materialError } = await supabase
        .from('lecture_notes')
        .select('*, course:courses(id, lecturer_id)')
        .eq('id', materialId)
        .single() as any;

    if (materialError || !material) {
        return { success: false, error: 'Material not found', data: null };
    }

    // Check access permissions
    if (user.role === 'student') {
        const { data: enrollment } = await supabase
            .from('enrollments')
            .select('id')
            .eq('student_id', user.id)
            .eq('course_id', material.course_id)
            .single();

        if (!enrollment) {
            return { success: false, error: 'You are not enrolled in this course', data: null };
        }
    } else if (user.role === 'lecturer') {
        if (material.course.lecturer_id !== user.id) {
            return { success: false, error: 'You do not have permission to access this material', data: null };
        }
    }

    // Generate signed URL (valid for 1 hour)
    const { data: signedUrlData, error: signedUrlError } = await supabase.storage
        .from('course-materials')
        .createSignedUrl(material.file_path, 3600);

    if (signedUrlError) {
        return { success: false, error: 'Failed to generate download link', data: null };
    }

    await logAction(user.id, 'material.downloaded', 'lecture_note', materialId, {
        course_id: material.course_id,
        title: material.title,
    });

    return { success: true, data: { signedUrl: signedUrlData.signedUrl }, error: null };
}

/**
 * Delete course material
 * Admin/Lecturer only
 */
export async function deleteMaterial(materialId: string) {
    const user = await requireAuth();
    const supabase = await createClient();

    // Get material details
    const { data: material, error: fetchError } = await supabase
        .from('lecture_notes')
        .select('*, course:courses(lecturer_id)')
        .eq('id', materialId)
        .single() as any;

    if (fetchError || !material) {
        return { success: false, error: 'Material not found' };
    }

    // Check permissions
    if (user.role === 'lecturer' && material.course.lecturer_id !== user.id) {
        return { success: false, error: 'You do not have permission to delete this material' };
    }

    if (user.role === 'student') {
        return { success: false, error: 'Students cannot delete materials' };
    }

    // Delete from storage
    const { error: storageError } = await supabase.storage
        .from('course-materials')
        .remove([material.file_path]);

    if (storageError) {
        console.error('Failed to delete file from storage:', storageError);
        // Continue with database deletion even if storage deletion fails
    }

    // Delete from database
    const { error } = await supabase
        .from('lecture_notes')
        .delete()
        .eq('id', materialId);

    if (error) {
        return { success: false, error: error.message };
    }

    await logAction(user.id, 'material.deleted', 'lecture_note', materialId, {
        course_id: material.course_id,
        title: material.title,
    });

    revalidatePath(`/admin/courses/${material.course_id}/materials`);
    revalidatePath(`/lecturer/courses/${material.course_id}/materials`);

    return { success: true };
}
