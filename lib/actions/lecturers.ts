'use server';

import { createClient } from '@/lib/supabase/server';
import { requireAuth } from '@/lib/auth/rbac';
import { logAction } from './audit';

/**
 * Get all lecturers (users with lecturer role)
 */
export async function getAllLecturers() {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('users')
        .select('id, name, email, role, created_at')
        .eq('role', 'lecturer')
        .order('name', { ascending: true });

    if (error) {
        console.error('Error fetching lecturers:', error);
        return { success: false, error: error.message, data: null };
    }

    return { success: true, data, error: null };
}

/**
 * Get lecturers assigned to a specific course
 */
export async function getCourseLecturers(courseId: string) {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('course_lecturers')
        .select(`
            lecturer_id,
            created_at,
            user:users(id, name, email, role)
        `)
        .eq('course_id', courseId);

    if (error) {
        console.error('Error fetching course lecturers:', error);
        return { success: false, error: error.message, data: null };
    }

    return { success: true, data, error: null };
}

/**
 * Add a lecturer to a course
 * Admin only
 */
export async function addLecturerToCourse(courseId: string, lecturerId: string) {
    const user = await requireAuth();

    // Only admins can manage course lecturers
    if (user.role !== 'admin') {
        return { success: false, error: 'Unauthorized - Admin access required', data: null };
    }

    const supabase = await createClient();

    // Verify the course exists
    const { data: course, error: courseError } = await supabase
        .from('courses')
        .select('id, title')
        .eq('id', courseId)
        .single() as any;

    if (courseError || !course) {
        return { success: false, error: 'Course not found', data: null };
    }

    // Verify the user exists and is a lecturer
    const { data: lecturer, error: lecturerError } = await supabase
        .from('users')
        .select('id, name, email, role')
        .eq('id', lecturerId)
        .single() as any;

    if (lecturerError || !lecturer) {
        return { success: false, error: 'Lecturer not found', data: null };
    }

    if (lecturer.role !== 'lecturer' && lecturer.role !== 'admin') {
        return { success: false, error: 'User is not a lecturer', data: null };
    }

    // Check if already assigned
    const { data: existing } = await supabase
        .from('course_lecturers')
        .select('course_id')
        .eq('course_id', courseId)
        .eq('lecturer_id', lecturerId)
        .single();

    if (existing) {
        return { success: false, error: 'Lecturer already assigned to this course', data: null };
    }

    // Use admin client to bypass RLS for INSERT operation
    const { createAdminClient } = await import('@/lib/supabase/server');
    const adminClient = createAdminClient();

    // Add the lecturer to the course
    const { data, error } = await adminClient
        .from('course_lecturers')
        .insert({
            course_id: courseId,
            lecturer_id: lecturerId,
        } as any)
        .select()
        .single();

    if (error) {
        console.error('Error adding lecturer to course:', error);
        return { success: false, error: error.message, data: null };
    }

    // Log action
    await logAction(user.id, 'course.lecturer_added', 'course', courseId, {
        lecturer_id: lecturerId,
        lecturer_name: lecturer.name,
        course_title: course.title,
    });

    return { success: true, data, error: null };
}

/**
 * Remove a lecturer from a course
 * Admin only
 */
export async function removeLecturerFromCourse(courseId: string, lecturerId: string) {
    const user = await requireAuth();

    // Only admins can manage course lecturers
    if (user.role !== 'admin') {
        return { success: false, error: 'Unauthorized - Admin access required', data: null };
    }

    const supabase = await createClient();

    // Get course and lecturer info for logging
    const [courseResult, lecturerResult] = await Promise.all([
        supabase.from('courses').select('id, title').eq('id', courseId).single(),
        supabase.from('users').select('id, name').eq('id', lecturerId).single(),
    ]) as any[];

    // Use admin client to bypass RLS for DELETE operation
    const { createAdminClient } = await import('@/lib/supabase/server');
    const adminClient = createAdminClient();

    // Delete the assignment
    const { error } = await adminClient
        .from('course_lecturers')
        .delete()
        .eq('course_id', courseId)
        .eq('lecturer_id', lecturerId);

    if (error) {
        console.error('Error removing lecturer from course:', error);
        return { success: false, error: error.message };
    }

    // Log action
    if (courseResult.data && lecturerResult.data) {
        await logAction(user.id, 'course.lecturer_removed', 'course', courseId, {
            lecturer_id: lecturerId,
            lecturer_name: lecturerResult.data.name,
            course_title: courseResult.data.title,
        });
    }

    return { success: true };
}
