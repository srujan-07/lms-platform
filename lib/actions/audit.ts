'use server';

import { createAdminClient } from '@/lib/supabase/server';
import { requireRole } from '@/lib/auth/rbac';

/**
 * Log an action to the audit log
 */
export async function logAction(
    userId: string,
    action: string,
    resourceType?: string,
    resourceId?: string,
    metadata?: Record<string, any>
) {
    try {
        const supabase = createAdminClient();

        await supabase.from('audit_logs').insert({
            user_id: userId,
            action,
            resource_type: resourceType || null,
            resource_id: resourceId || null,
            metadata: metadata || null,
            ip_address: null, // Can be populated from request headers
            user_agent: null, // Can be populated from request headers
        });
    } catch (error) {
        console.error('Failed to log action:', error);
        // Don't throw - logging failures shouldn't break the main operation
    }
}

/**
 * Get audit logs (admin only)
 */
export async function getAuditLogs(limit = 100, offset = 0) {
    await requireRole('admin');

    const supabase = createAdminClient();

    const { data, error, count } = await supabase
        .from('audit_logs')
        .select(`
      *,
      user:users(id, name, email)
    `, { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

    if (error) {
        return { success: false, error: error.message, data: null, total: 0 };
    }

    return { success: true, data, error: null, total: count || 0 };
}

/**
 * Get audit logs for a specific user (admin only)
 */
export async function getUserAuditLogs(userId: string, limit = 50) {
    await requireRole('admin');

    const supabase = createAdminClient();

    const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

    if (error) {
        return { success: false, error: error.message, data: null };
    }

    return { success: true, data, error: null };
}

/**
 * Get audit logs by action type (admin only)
 */
export async function getAuditLogsByAction(action: string, limit = 50) {
    await requireRole('admin');

    const supabase = createAdminClient();

    const { data, error } = await supabase
        .from('audit_logs')
        .select(`
      *,
      user:users(id, name, email)
    `)
        .eq('action', action)
        .order('created_at', { ascending: false })
        .limit(limit);

    if (error) {
        return { success: false, error: error.message, data: null };
    }

    return { success: true, data, error: null };
}
