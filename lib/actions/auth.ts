'use server';

import { getCurrentUser } from '@/lib/auth/rbac';

export async function getUserProfile() {
    try {
        const user = await getCurrentUser();
        return { success: true, data: user, error: null };
    } catch (error) {
        console.error('Error fetching user profile:', error);
        return { success: false, data: null, error: 'Failed to fetch user profile' };
    }
}
