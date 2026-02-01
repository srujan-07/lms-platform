'use server';

import { createClient, createAdminClient } from '@/lib/supabase/server';
import { requireRole } from '@/lib/auth/rbac';
import { logAction } from './audit';
import { revalidatePath } from 'next/cache';
import type { UserRole } from '@/types/database';

/**
 * Get all users (admin only)
 */
export async function getAllUsers() {
    await requireRole('admin');

    const supabase = createAdminClient();

    const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        return { success: false, error: error.message, data: null };
    }

    return { success: true, data, error: null };
}

/**
 * Update user role (admin only)
 */
export async function updateUserRole(userId: string, newRole: UserRole) {
    const user = await requireRole('admin');

    const supabase = createAdminClient();

    const { data, error } = await supabase
        .from('users')
        .update({ role: newRole })
        .eq('id', userId)
        .select()
        .single();

    if (error) {
        return { success: false, error: error.message, data: null };
    }

    await logAction(user.id, 'user.role_updated', 'user', userId, {
        new_role: newRole,
    });

    revalidatePath('/admin/dashboard');

    return { success: true, data, error: null };
}

/**
 * Create enrollment (admin only)
 */
export async function createEnrollment(studentId: string, courseId: string) {
    const user = await requireRole('admin');

    const supabase = createAdminClient();

    // Check if enrollment already exists
    const { data: existing } = await supabase
        .from('enrollments')
        .select('id')
        .eq('student_id', studentId)
        .eq('course_id', courseId)
        .single();

    if (existing) {
        return { success: false, error: 'Student already enrolled in this course', data: null };
    }

    const { data, error } = await supabase
        .from('enrollments')
        .insert({
            student_id: studentId,
            course_id: courseId,
        })
        .select()
        .single();

    if (error) {
        return { success: false, error: error.message, data: null };
    }

    await logAction(user.id, 'enrollment.created', 'enrollment', data.id, {
        student_id: studentId,
        course_id: courseId,
    });

    revalidatePath('/admin/dashboard');
    revalidatePath('/dashboard');

    return { success: true, data, error: null };
}

/**
 * Remove enrollment (admin only)
 */
export async function removeEnrollment(enrollmentId: string) {
    const user = await requireRole('admin');

    const supabase = createAdminClient();

    // Get enrollment details for logging
    const { data: enrollment } = await supabase
        .from('enrollments')
        .select('student_id, course_id')
        .eq('id', enrollmentId)
        .single();

    const { error } = await supabase
        .from('enrollments')
        .delete()
        .eq('id', enrollmentId);

    if (error) {
        return { success: false, error: error.message };
    }

    if (enrollment) {
        await logAction(user.id, 'enrollment.deleted', 'enrollment', enrollmentId, {
            student_id: enrollment.student_id,
            course_id: enrollment.course_id,
        });
    }

    revalidatePath('/admin/dashboard');
    revalidatePath('/dashboard');

    return { success: true };
}

/**
 * Get all enrollments for a course (admin/lecturer)
 */
export async function getCourseEnrollments(courseId: string) {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('enrollments')
        .select(`
      *,
      student:users!enrollments_student_id_fkey(id, name, email)
    `)
        .eq('course_id', courseId);

    if (error) {
        return { success: false, error: error.message, data: null };
    }

    return { success: true, data, error: null };
}

/**
 * Get students not enrolled in a specific course (admin only)
 */
export async function getUnenrolledStudents(courseId: string) {
    await requireRole('admin');

    const supabase = createAdminClient();

    // Get all students
    const { data: allStudents } = await supabase
        .from('users')
        .select('id, name, email')
        .eq('role', 'student');

    // Get enrolled students
    const { data: enrollments } = await supabase
        .from('enrollments')
        .select('student_id')
        .eq('course_id', courseId);

    if (!allStudents) {
        return { success: false, error: 'Failed to fetch students', data: null };
    }

    const enrolledIds = new Set(enrollments?.map(e => e.student_id) || []);
    const unenrolled = allStudents.filter(s => !enrolledIds.has(s.id));

    return { success: true, data: unenrolled, error: null };
}
