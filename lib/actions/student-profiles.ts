'use server';

import { createClient, createAdminClient } from '@/lib/supabase/server';
import { requireAuth, requireRole } from '@/lib/auth/rbac';
import { logAction } from './audit';
import { revalidatePath } from 'next/cache';

export interface StudentProfile {
    id: string;
    user_id: string;
    phone_no: string | null;
    school: string | null;
    branch: string | null;
    section: string | null;
    onboarding_completed_at: string | null;
    created_at: string;
    updated_at: string;
}

export interface StudentProfileInput {
    phone_no?: string;
    school?: string;
    branch?: string;
    section?: string;
    name?: string;
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

    // Use admin client for onboarding inserts since StackAuth users don't have Supabase auth context
    // Authentication is already verified by requireAuth() above
    const supabase = createAdminClient();

    // Check if profile already exists
    const { data: existing } = await supabase
        .from('student_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

    // Prepare update data - only allow specific fields
    const profileData = {
        phone_no: input.phone_no,
        school: input.school,
        branch: input.branch,
        section: input.section,
        onboarding_completed_at: new Date().toISOString(),
    };

    let result;

    if (existing) {
        // Update existing profile
        result = await supabase
            .from('student_profiles')
            // @ts-expect-error - Supabase type inference issue with update
            .update(profileData)
            .eq('user_id', user.id)
            .select()
            .single();
    } else {
        // Create new profile
        result = await supabase
            .from('student_profiles')
            .insert({
                user_id: user.id,
                ...profileData,
            } as any)
            .select()
            .single();
    }

    if (result.error) {
        return { success: false, error: result.error.message, data: null };
    }

    // If name provided, persist to users table as well (allows students to update their display name)
    if (input.name) {
        const upsertRes = await supabase
            .from('users')
            .upsert({ id: user.id, name: input.name } as any, { onConflict: 'id' })
            .select();

        if (upsertRes.error) {
            // Log but don't block profile update
            console.error('Failed to update user name:', upsertRes.error.message);
        }
    }

    await logAction(user.id, 'student_profile.created', 'student_profile', (result.data as any).id, {
        phone_no: input.phone_no,
        school: input.school,
        branch: input.branch,
        section: input.section,
        name: input.name,
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

/**
 * Check if student profile is complete
 */
export async function isProfileComplete(userId: string) {
    const result = await getStudentProfile(userId);

    if (!result.success || !result.data) {
        return { success: true, complete: false };
    }

    const profile = result.data;
    const isComplete = 
        profile.phone_no && 
        profile.school && 
        profile.branch && 
        profile.section;

    return { success: true, complete: Boolean(isComplete) };
}

/**
 * Get current authenticated user and their student profile using admin client.
 * This is intended for server-side checks where RLS would otherwise block reads.
 */
export async function getCurrentUserProfile() {
    const user = await requireAuth();

    const supabase = createAdminClient();
    const { data, error } = await supabase
        .from('student_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

    if (error && error.code !== 'PGRST116') {
        throw new Error(error.message);
    }

    const profile = data || null;
    const complete = Boolean(profile && profile.phone_no && profile.school && profile.branch && profile.section);

    return { user, profile, complete };
}
