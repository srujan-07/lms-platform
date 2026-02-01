'use server';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/server';
import { requireAuth } from '@/lib/auth/rbac';
import { logAction } from './audit';
import { revalidatePath } from 'next/cache';

/**
 * Get all courses
 */
export async function getCourses() {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('courses')
        .select(`
      *,
      lecturer:users!courses_lecturer_id_fkey(id, name, email)
    `)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching courses:', error);
        return { success: false, error: error.message, data: null };
    }

    return { success: true, data, error: null };
}

/**
 * Get courses by lecturer
 */
export async function getCoursesByLecturer(lecturerId: string) {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('lecturer_id', lecturerId)
        .order('created_at', { ascending: false });

    if (error) {
        return { success: false, error: error.message, data: null };
    }

    return { success: true, data, error: null };
}

/**
 * Get enrolled courses for a student
 */
export async function getEnrolledCourses(studentId: string) {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('enrollments')
        .select(`
      *,
      course:courses(
        *,
        lecturer:users!courses_lecturer_id_fkey(id, name, email)
      )
    `)
        .eq('student_id', studentId);

    if (error) {
        return { success: false, error: error.message, data: null };
    }

    return { success: true, data, error: null };
}

/**
 * Create a new course
 */
export async function createCourse(title: string, description: string, lecturerId?: string) {
    const user = await requireAuth();

    // Determine lecturer ID
    const finalLecturerId = lecturerId || user.id;

    // Check permissions
    if (user.role !== 'admin' && user.role !== 'lecturer') {
        return { success: false, error: 'Unauthorized', data: null };
    }

    if (user.role === 'lecturer' && finalLecturerId !== user.id) {
        return { success: false, error: 'Lecturers can only create courses for themselves', data: null };
    }

    const supabase = await createClient();

    const { data, error } = await supabase
        .from('courses')
        .insert({
            title,
            description,
            lecturer_id: finalLecturerId,
        } as any)
        .select()
        .single();

    if (error) {
        return { success: false, error: error.message, data: null };
    }

    // Log action
    await logAction(user.id, 'course.created', 'course', (data as any).id, { title });

    revalidatePath('/lecturer/dashboard');
    revalidatePath('/admin/dashboard');

    return { success: true, data, error: null };
}

/**
 * Update a course
 */
export async function updateCourse(
    courseId: string,
    updates: { title?: string; description?: string; lecturer_id?: string }
) {
    const user = await requireAuth();

    const supabase = await createClient();

    // Check if user owns this course or is admin
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

    const { data, error } = await supabase
        .from('courses')
        .update(updates as any)
        .eq('id', courseId)
        .select()
        .single() as any;

    if (error) {
        return { success: false, error: error.message, data: null };
    }

    await logAction(user.id, 'course.updated', 'course', courseId, updates);

    revalidatePath('/lecturer/dashboard');
    revalidatePath('/admin/dashboard');

    return { success: true, data, error: null };
}

/**
 * Delete a course
 */
export async function deleteCourse(courseId: string) {
    const user = await requireAuth();

    const supabase = await createClient();

    // Check if user owns this course or is admin
    const { data: course } = await supabase
        .from('courses')
        .select('lecturer_id, title')
        .eq('id', courseId)
        .single() as any;

    if (!course) {
        return { success: false, error: 'Course not found' };
    }

    if (user.role !== 'admin' && course.lecturer_id !== user.id) {
        return { success: false, error: 'Unauthorized' };
    }

    const { error } = await supabase
        .from('courses')
        .delete()
        .eq('id', courseId);

    if (error) {
        return { success: false, error: error.message };
    }

    await logAction(user.id, 'course.deleted', 'course', courseId, { title: course.title });

    revalidatePath('/lecturer/dashboard');
    revalidatePath('/admin/dashboard');

    return { success: true };
}

/**
 * Get course details with enrollment count
 */
export async function getCourseDetails(courseId: string) {
    const supabase = await createClient();

    const [courseResult, enrollmentResult] = await Promise.all([
        supabase
            .from('courses')
            .select(`
        *,
        lecturer:users!courses_lecturer_id_fkey(id, name, email)
      `)
            .eq('id', courseId)
            .single(),
        supabase
            .from('enrollments')
            .select('id', { count: 'exact' })
            .eq('course_id', courseId),
    ]);

    if (courseResult.error) {
        return { success: false, error: courseResult.error.message, data: null };
    }

    return {
        success: true,
        data: {
            ...(courseResult.data as any),
            enrollment_count: enrollmentResult.count || 0,
        },
        error: null,
    };
}
