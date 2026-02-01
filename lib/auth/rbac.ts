import { stackServerApp } from './stackauth';
import { createClient } from '@/lib/supabase/server';
import type { UserRole } from '@/types/database';
import { redirect } from 'next/navigation';

/**
 * Get the current user's role from the database
 */
export async function getUserRole(userId: string): Promise<UserRole | null> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('users')
        .select('role')
        .eq('id', userId)
        .single();

    if (error || !data) {
        return null;
    }

    return data.role as UserRole;
}

/**
 * Get the current authenticated user with role
 */
export async function getCurrentUser() {
    const user = await stackServerApp.getUser();

    if (!user) {
        return null;
    }

    const role = await getUserRole(user.id);

    return {
        id: user.id,
        email: user.primaryEmail || '',
        name: user.displayName || user.primaryEmail || 'User',
        role: role || 'student',
    };
}

/**
 * Require authentication - redirect to sign in if not authenticated
 */
export async function requireAuth() {
    const user = await getCurrentUser();

    if (!user) {
        redirect('/handler/sign-in');
    }

    return user;
}

/**
 * Require a specific role - redirect if user doesn't have permission
 */
export async function requireRole(allowedRoles: UserRole | UserRole[]) {
    const user = await requireAuth();

    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

    if (!roles.includes(user.role)) {
        // Redirect to appropriate dashboard based on role
        switch (user.role) {
            case 'admin':
                redirect('/admin/dashboard');
            case 'lecturer':
                redirect('/lecturer/dashboard');
            case 'student':
                redirect('/dashboard');
            default:
                redirect('/');
        }
    }

    return user;
}

/**
 * Check if user has permission for a specific action
 */
export async function hasPermission(
    userId: string,
    permission: 'manage_users' | 'manage_courses' | 'upload_content' | 'view_audit_logs'
): Promise<boolean> {
    const role = await getUserRole(userId);

    if (!role) return false;

    const permissions: Record<UserRole, string[]> = {
        admin: ['manage_users', 'manage_courses', 'upload_content', 'view_audit_logs'],
        lecturer: ['upload_content', 'manage_courses'],
        student: [],
    };

    return permissions[role]?.includes(permission) || false;
}

/**
 * Sync user from StackAuth to Supabase database
 */
export async function syncUserToDatabase(
    userId: string,
    email: string,
    name: string,
    role: UserRole = 'student'
) {
    const supabase = await createClient();

    const { error } = await supabase
        .from('users')
        .upsert({
            id: userId,
            email,
            name,
            role,
        }, {
            onConflict: 'id',
        });

    if (error) {
        console.error('Error syncing user to database:', error);
        throw error;
    }
}
