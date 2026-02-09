import { NextRequest, NextResponse } from 'next/server';
import { getAllLecturers } from '@/lib/actions/lecturers';
import { requireRole } from '@/lib/auth/rbac';

/**
 * GET /api/admin/lecturers
 * Get all users with lecturer role
 */
export async function GET(request: NextRequest) {
    try {
        // Admin only
        await requireRole(['admin']);

        const result = await getAllLecturers();

        if (!result.success) {
            return NextResponse.json(
                { success: false, error: result.error, data: null },
                { status: 400 }
            );
        }

        return NextResponse.json(result, { status: 200 });
    } catch (error) {
        console.error('Error in GET /api/admin/lecturers:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error', data: null },
            { status: 500 }
        );
    }
}
