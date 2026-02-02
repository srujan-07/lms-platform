import { NextRequest, NextResponse } from 'next/server';
import { getUnenrolledStudents } from '@/lib/actions/users';
import { stackServerApp } from '@/lib/auth/stackauth';

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
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

        const result = await getUnenrolledStudents(params.id);

        if (!result.success) {
            return NextResponse.json(
                { success: false, error: result.error, data: null },
                { status: 400 }
            );
        }

        return NextResponse.json(result, { status: 200 });
    } catch (error) {
        console.error('Error in GET /api/courses/[id]/unenrolled-students:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error', data: null },
            { status: 500 }
        );
    }
}
