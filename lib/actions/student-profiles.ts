'use server';

import { createClient, createAdminClient } from '@/lib/supabase/server';
import { requireAuth, requireRole } from '@/lib/auth/rbac';
import { logAction } from './audit';
import { revalidatePath } from 'next/cache';

export interface StudentProfile {
    id: string;
    user_id: string;
    class: string;
    section: string;
    onboarding_completed_at: string | null;
    created_at: string;
    updated_at: string;
}

export interface StudentProfileInput {
    class: string;
    section: string;
}

/**
 * Get student profile for a user
 */
export async function getStudentProfile(userId: string) {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('student_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

    if (error) {
        // Not found is not an error for this use case
        if (error.code === 'PGRST116') {
            return { success: true, data: null, error: null };
        }
        return { success: false, error: error.message, data: null };
    }

    return { success: true, data: data as StudentProfile, error: null };
}

/**
 * Check if user has completed onboarding
 */
export async function checkOnboardingStatus(userId: string) {
    const result = await getStudentProfile(userId);

    if (!result.success) {
        return { success: false, completed: false, error: result.error };
    }

    const completed = result.data !== null && result.data.onboarding_completed_at !== null;
    return { success: true, completed, error: null };
}

/**
 * Create or update student profile (onboarding)
 */
export async function createOrUpdateStudentProfile(input: StudentProfileInput) {
    const user = await requireAuth();

    // Only students can create their own profile
    if (user.role !== 'student') {
        return { success: false, error: 'Only students can complete onboarding', data: null };
    }

    const supabase = await createClient();

    // Check if profile already exists
    const { data: existing } = await supabase
        .from('student_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

    let result;

    if (existing) {
        // Update existing profile
        // @ts-ignore - Supabase type inference issue
        result = (await supabase
            .from('student_profiles')
            .update({
                class: input.class,
                section: input.section,
                onboarding_completed_at: new Date().toISOString(),
            })
            .eq('user_id', user.id)
            .select()
            .single()) as any;
    } else {
        // Create new profile
        result = await supabase
            .from('student_profiles')
            .insert({
                user_id: user.id,
                class: input.class,
                section: input.section,
                onboarding_completed_at: new Date().toISOString(),
            } as any)
            .select()
            .single();
    }

    if (result.error) {
        return { success: false, error: result.error.message, data: null };
    }

    await logAction(user.id, 'student_profile.created', 'student_profile', (result.data as any).id, {
        class: input.class,
        section: input.section,
    });

    revalidatePath('/dashboard');
    revalidatePath('/onboarding');

    return { success: true, data: result.data as StudentProfile, error: null };
}

/**
 * Get all student profiles (admin only)
 */
export async function getAllStudentProfiles() {
    await requireRole('admin');

    const supabase = createAdminClient();

    const { data, error } = await supabase
        .from('student_profiles')
        .select(`
            *,
            user:users!student_profiles_user_id_fkey(id, name, email)
        `)
        .order('created_at', { ascending: false });

    if (error) {
        return { success: false, error: error.message, data: null };
    }

    return { success: true, data, error: null };
}

/**
 * Get student profile with user details (admin only)
 */
export async function getStudentProfileWithUser(userId: string) {
    await requireRole('admin');

    const supabase = createAdminClient();

    const { data, error } = await supabase
        .from('student_profiles')
        .select(`
            *,
            user:users!student_profiles_user_id_fkey(id, name, email, role)
        `)
        .eq('user_id', userId)
        .single();

    if (error) {
        if (error.code === 'PGRST116') {
            return { success: true, data: null, error: null };
        }
        return { success: false, error: error.message, data: null };
    }

    return { success: true, data, error: null };
}
