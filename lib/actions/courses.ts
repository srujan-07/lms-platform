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
export async function createCourse(
    title: string,
    description: string,
    lecturerId?: string,
    accessCode?: string
) {
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

    // Generate access code if not provided
    const finalAccessCode = accessCode || generateAccessCode();

    const supabase = await createClient();

    const { data, error } = await supabase
        .from('courses')
        .insert({
            title,
            description,
            lecturer_id: finalLecturerId,
            access_code: finalAccessCode.toUpperCase(),
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
        // @ts-ignore - Supabase type inference issue with dynamic updates
        .update(updates)
        .eq('id', courseId)
        .select()
        .single();

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

/**
 * Generate a random access code
 */
function generateAccessCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code.toUpperCase();
}

/**
 * Get course by access code
 */
export async function getCourseByAccessCode(accessCode: string) {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('courses')
        .select(`
            *,
            lecturer:users!courses_lecturer_id_fkey(id, name, email)
        `)
        .eq('access_code', accessCode.toUpperCase())
        .single();

    // Fallback: Try with raw access code (for legacy mixed-case codes)
    if (error && error.code === 'PGRST116') {
        const { data: legacyData, error: legacyError } = await supabase
            .from('courses')
            .select(`
                *,
                lecturer:users!courses_lecturer_id_fkey(id, name, email)
            `)
            .eq('access_code', accessCode)
            .single();

        if (!legacyError && legacyData) {
            return { success: true, data: legacyData, error: null };
        }
    }

    if (error) {
        if (error.code === 'PGRST116') {
            return { success: false, error: 'Invalid access code', data: null };
        }
        return { success: false, error: error.message, data: null };
    }

    return { success: true, data, error: null };
}

/**
 * Enroll student in course using access code
 */
export async function enrollWithAccessCode(accessCode: string) {
    const user = await requireAuth();

    // Only students can enroll
    if (user.role !== 'student') {
        return { success: false, error: 'Only students can enroll in courses', data: null };
    }

    // Get course by access code
    const courseResult = await getCourseByAccessCode(accessCode);
    if (!courseResult.success || !courseResult.data) {
        return { success: false, error: 'Invalid access code', data: null };
    }

    const course = (courseResult as any).data;
    const supabase = await createClient();

    // Check if already enrolled
    const enrollmentCheck = await supabase
        .from('enrollments')
        .select('id')
        .eq('student_id', user.id)
        .eq('course_id', course.id)
        .single();

    if (enrollmentCheck.data) {
        return { success: false, error: 'You are already enrolled in this course', data: null };
    }

    // Create enrollment
    const { data, error } = await supabase
        .from('enrollments')
        .insert({
            student_id: user.id,
            course_id: course.id,
        } as any)
        .select()
        .single();

    if (error) {
        return { success: false, error: error.message, data: null };
    }

    await logAction(user.id, 'enrollment.created', 'enrollment', (data as any).id, {
        course_id: course.id,
        course_title: course.title,
    });

    revalidatePath('/dashboard');

    return { success: true, data: { ...(data as any), course }, error: null };
}
