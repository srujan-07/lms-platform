import { stackServerApp } from './stackauth';
import { createClient } from '@/lib/supabase/server';
import type { UserRole } from '@/types/database';
import { redirect } from 'next/navigation';

/**
 * Get the current authenticated user with role from StackAuth
 * Roles are stored in StackAuth's serverMetadata.role
 */
export async function getCurrentUser() {
    const user = await stackServerApp.getUser();

    if (!user) {
        return null;
    }

    // Read role from StackAuth serverMetadata
    // Default to 'student' if no role is set
    const role = (user.serverMetadata?.role as UserRole) || 'student';

    return {
        id: user.id,
        email: user.primaryEmail || '',
        name: user.displayName || user.primaryEmail || 'User',
        role,
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
 * Check if current user has permission for a specific action
 * Note: This checks the currently authenticated user, not a specific userId
 */
export async function hasPermission(
    permission: 'manage_users' | 'manage_courses' | 'upload_content' | 'view_audit_logs'
): Promise<boolean> {
    const user = await getCurrentUser();

    if (!user) return false;

    const permissions: Record<UserRole, string[]> = {
        admin: ['manage_users', 'manage_courses', 'upload_content', 'view_audit_logs'],
        lecturer: ['upload_content', 'manage_courses'],
        student: [],
    };

    return permissions[user.role]?.includes(permission) || false;
}

/**
 * Sync user basic info to Supabase database (for relational data)
 * Note: Roles are NOT stored in Supabase - they come from StackAuth
 */
export async function syncUserToDatabase(
    userId: string,
    email: string,
    name: string
) {
    const supabase = await createClient();

    const { error } = await supabase
        .from('users')
        .upsert({
            id: userId,
            email,
            name,
            // Role is intentionally NOT included - it comes from StackAuth
        } as any, {
            onConflict: 'id',
        });

    if (error) {
        console.error('Error syncing user to database:', error);
        throw error;
    }
}
