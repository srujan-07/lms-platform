'use server';

import { createAdminClient } from '@/lib/supabase/server';
import { requireRole } from '@/lib/auth/rbac';

export interface GlobalAnalytics {
    totalStudents: number;
    totalCourses: number;
    totalEnrollments: number;
    totalMaterials: number;
}

export interface CourseAnalytics {
    courseId: string;
    courseTitle: string;
    enrollmentCount: number;
    materialCount: number;
    students: Array<{
        id: string;
        name: string;
        email: string;
        class?: string;
        section?: string;
        enrolled_at: string;
    }>;
}

/**
 * Get global analytics (admin only)
 */
export async function getGlobalAnalytics(): Promise<{ success: boolean; data: GlobalAnalytics | null; error: string | null }> {
    await requireRole('admin');

    const supabase = createAdminClient();

    try {
        const [studentsResult, coursesResult, enrollmentsResult, materialsResult] = await Promise.all([
            supabase.from('users').select('id', { count: 'exact' }).eq('role', 'student'),
            supabase.from('courses').select('id', { count: 'exact' }),
            supabase.from('enrollments').select('id', { count: 'exact' }),
            supabase.from('lecture_notes').select('id', { count: 'exact' }),
        ]);

        return {
            success: true,
            data: {
                totalStudents: studentsResult.count || 0,
                totalCourses: coursesResult.count || 0,
                totalEnrollments: enrollmentsResult.count || 0,
                totalMaterials: materialsResult.count || 0,
            },
            error: null,
        };
    } catch (error: any) {
        return { success: false, data: null, error: error.message };
    }
}

/**
 * Get analytics for a specific course (admin only)
 */
export async function getCourseAnalytics(courseId: string): Promise<{ success: boolean; data: CourseAnalytics | null; error: string | null }> {
    await requireRole('admin');

    const supabase = createAdminClient();

    try {
        // Get course details
        const { data: course, error: courseError } = await supabase
            .from('courses')
            .select('id, title')
            .eq('id', courseId)
            .single();

        if (courseError || !course) {
            return { success: false, data: null, error: 'Course not found' };
        }

        // Get enrollments with student details and profiles
        const { data: enrollments, error: enrollmentsError } = await supabase
            .from('enrollments')
            .select(`
                enrolled_at,
                student:users!enrollments_student_id_fkey(
                    id,
                    name,
                    email
                )
            `)
            .eq('course_id', courseId);

        if (enrollmentsError) {
            return { success: false, data: null, error: enrollmentsError.message };
        }

        // Get student profiles for class/section info
        const studentIds = (enrollments as any[])?.map(e => e.student.id) || [];
        const { data: profiles } = await supabase
            .from('student_profiles')
            .select('user_id, class, section')
            .in('user_id', studentIds);

        const profileMap = new Map((profiles as any[])?.map(p => [p.user_id, p]) || []);

        // Get material count
        const { count: materialCount } = await supabase
            .from('lecture_notes')
            .select('id', { count: 'exact' })
            .eq('course_id', courseId);

        // Combine data
        const students = (enrollments as any[])?.map(e => {
            const profile = profileMap.get(e.student.id);
            return {
                id: e.student.id,
                name: e.student.name,
                email: e.student.email,
                class: profile?.class,
                section: profile?.section,
                enrolled_at: e.enrolled_at,
            };
        }) || [];

        return {
            success: true,
            data: {
                courseId: (course as any).id,
                courseTitle: (course as any).title,
                enrollmentCount: students.length,
                materialCount: materialCount || 0,
                students,
            },
            error: null,
        };
    } catch (error: any) {
        return { success: false, data: null, error: error.message };
    }
}

/**
 * Get all student profiles with user details (admin only)
 */
export async function getAllStudentProfilesWithDetails() {
    await requireRole('admin');

    const supabase = createAdminClient();

    const { data, error } = await supabase
        .from('student_profiles')
        .select(`
            *,
            user:users!student_profiles_user_id_fkey(id, name, email, created_at)
        `)
        .order('created_at', { ascending: false });

    if (error) {
        return { success: false, error: error.message, data: null };
    }

    return { success: true, data, error: null };
}

/**
 * Get enrollment statistics per course (admin only)
 */
export async function getEnrollmentStatistics() {
    await requireRole('admin');

    const supabase = createAdminClient();

    const { data, error } = await supabase
        .from('courses')
        .select(`
            id,
            title,
            lecturer:users!courses_lecturer_id_fkey(name),
            created_at
        `);

    if (error) {
        return { success: false, error: error.message, data: null };
    }

    // Get enrollment counts for each course
    const coursesWithCounts = await Promise.all(
        (data as any[]).map(async (course) => {
            const { count } = await supabase
                .from('enrollments')
                .select('id', { count: 'exact' })
                .eq('course_id', course.id);

            return {
                ...course,
                enrollment_count: count || 0,
            };
        })
    );

    return { success: true, data: coursesWithCounts, error: null };
}
