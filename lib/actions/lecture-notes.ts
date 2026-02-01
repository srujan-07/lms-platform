'use server';

import { createClient } from '@/lib/supabase/server';
import { requireAuth } from '@/lib/auth/rbac';
import { uploadPDF, getSignedURL, deletePDF } from '@/lib/supabase/storage';
import { logAction } from './audit';
import { revalidatePath } from 'next/cache';

/**
 * Get lecture notes for a course
 */
export async function getLectureNotes(courseId: string) {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('lecture_notes')
        .select(`
      *,
      uploader:users!lecture_notes_uploaded_by_fkey(id, name, email)
    `)
        .eq('course_id', courseId)
        .order('created_at', { ascending: false });

    if (error) {
        return { success: false, error: error.message, data: null };
    }

    return { success: true, data, error: null };
}

/**
 * Upload a lecture note (PDF)
 */
export async function uploadLectureNote(
    courseId: string,
    title: string,
    description: string,
    fileData: FormData
) {
    const user = await requireAuth();

    // Check if user is lecturer of this course or admin
    const supabase = await createClient();
    const { data: course } = await supabase
        .from('courses')
        .select('lecturer_id')
        .eq('id', courseId)
        .single() as any;

    if (!course) {
        return { success: false, error: 'Course not found', data: null };
    }

    if (user.role !== 'admin' && course.lecturer_id !== user.id) {
        return { success: false, error: 'Unauthorized', data: null };
    }

    // Get file from FormData
    const file = fileData.get('file') as File;
    if (!file) {
        return { success: false, error: 'No file provided', data: null };
    }

    // Upload to storage
    const uploadResult = await uploadPDF(file, courseId, user.id);

    if (!uploadResult.success || !uploadResult.filePath) {
        return { success: false, error: uploadResult.error || 'Upload failed', data: null };
    }

    // Save metadata to database
    const { data, error } = await supabase
        .from('lecture_notes')
        .insert({
            course_id: courseId,
            title,
            description,
            file_path: uploadResult.filePath,
            file_size: file.size,
            uploaded_by: user.id,
        } as any)
        .select()
        .single();

    if (error) {
        // Clean up uploaded file if database insert fails
        await deletePDF(uploadResult.filePath);
        return { success: false, error: error.message, data: null };
    }

    await logAction(user.id, 'lecture_note.uploaded', 'lecture_note', (data as any).id, {
        title,
        course_id: courseId,
        file_size: file.size,
    });

    revalidatePath(`/lecturer/courses/${courseId}`);
    revalidatePath(`/dashboard/courses/${courseId}`);

    return { success: true, data, error: null };
}

/**
 * Get download URL for a lecture note
 */
export async function getDownloadURL(noteId: string) {
    const user = await requireAuth();

    const supabase = await createClient();

    // Get note details
    const { data: note, error } = await supabase
        .from('lecture_notes')
        .select('file_path, title, course_id')
        .eq('id', noteId)
        .single() as any;

    if (error || !note) {
        return { success: false, error: 'Lecture note not found', url: null };
    }

    // Check if user has access (enrolled student, course lecturer, or admin)
    const { data: enrollment } = await supabase
        .from('enrollments')
        .select('id')
        .eq('student_id', user.id)
        .eq('course_id', note.course_id)
        .single();

    const { data: course } = await supabase
        .from('courses')
        .select('lecturer_id')
        .eq('id', note.course_id)
        .single() as any;

    const hasAccess =
        enrollment ||
        (course && course.lecturer_id === user.id) ||
        user.role === 'admin';

    if (!hasAccess) {
        return { success: false, error: 'Unauthorized', url: null };
    }

    // Generate signed URL
    const urlResult = await getSignedURL(note.file_path);

    if (!urlResult.success || !urlResult.url) {
        return { success: false, error: urlResult.error || 'Failed to generate URL', url: null };
    }

    // Log download
    await logAction(user.id, 'lecture_note.downloaded', 'lecture_note', noteId, {
        title: note.title,
    });

    return { success: true, url: urlResult.url, error: null };
}

/**
 * Delete a lecture note
 */
export async function deleteLectureNote(noteId: string) {
    const user = await requireAuth();

    const supabase = await createClient();

    // Get note details
    const { data: note } = await supabase
        .from('lecture_notes')
        .select('file_path, uploaded_by, course_id, title')
        .eq('id', noteId)
        .single() as any;

    if (!note) {
        return { success: false, error: 'Lecture note not found' };
    }

    // Check permissions
    if (user.role !== 'admin' && note.uploaded_by !== user.id) {
        return { success: false, error: 'Unauthorized' };
    }

    // Delete from storage
    await deletePDF(note.file_path);

    // Delete from database
    const { error } = await supabase
        .from('lecture_notes')
        .delete()
        .eq('id', noteId);

    if (error) {
        return { success: false, error: error.message };
    }

    await logAction(user.id, 'lecture_note.deleted', 'lecture_note', noteId, {
        title: note.title,
    });

    revalidatePath(`/lecturer/courses/${note.course_id}`);
    revalidatePath(`/dashboard/courses/${note.course_id}`);

    return { success: true };
}

/**
 * Update lecture note metadata
 */
export async function updateLectureNote(
    noteId: string,
    updates: { title?: string; description?: string }
) {
    const user = await requireAuth();

    const supabase = await createClient();

    // Check permissions
    const { data: note } = await supabase
        .from('lecture_notes')
        .select('uploaded_by')
        .eq('id', noteId)
        .single() as any;

    if (!note) {
        return { success: false, error: 'Lecture note not found', data: null };
    }

    if (user.role !== 'admin' && note.uploaded_by !== user.id) {
        return { success: false, error: 'Unauthorized', data: null };
    }

    const { data, error } = await supabase
        .from('lecture_notes')
        // @ts-ignore - Supabase type inference issue with dynamic updates
        .update(updates)
        .eq('id', noteId)
        .select()
        .single();

    if (error) {
        return { success: false, error: error.message, data: null };
    }

    await logAction(user.id, 'lecture_note.updated', 'lecture_note', noteId, updates);

    return { success: true, data, error: null };
}
