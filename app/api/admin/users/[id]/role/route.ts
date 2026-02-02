import { NextRequest, NextResponse } from 'next/server';
import { updateUserRole } from '@/lib/actions/users';
import { stackServerApp } from '@/lib/auth/stackauth';
import { z } from 'zod';

const updateRoleSchema = z.object({
    role: z.enum(['student', 'lecturer', 'admin']),
});

export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        // Check authentication
        const user = await stackServerApp.getUser();
        if (!user) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized', data: null },
                { status: 401 }
            );
        }

        // Check if user is admin
        const hasAdminRole = user.serverMetadata?.role === 'admin';
        if (!hasAdminRole) {
            return NextResponse.json(
                { success: false, error: 'Forbidden - Admin access required', data: null },
                { status: 403 }
            );
        }

        // Parse and validate request body
        const body = await request.json();
        const validation = updateRoleSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json(
                { success: false, error: 'Invalid request body', data: validation.error.errors },
                { status: 400 }
            );
        }

        const { role } = validation.data;
        const userId = params.id;

        // Update user role
        const result = await updateUserRole(userId, role);

        if (!result.success) {
            return NextResponse.json(
                { success: false, error: result.error, data: null },
                { status: 400 }
            );
        }

        return NextResponse.json(result, { status: 200 });
    } catch (error) {
        console.error('Error in PATCH /api/admin/users/[id]/role:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error', data: null },
            { status: 500 }
        );
    }
}
