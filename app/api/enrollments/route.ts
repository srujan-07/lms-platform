import { NextRequest, NextResponse } from 'next/server';
import { createEnrollment, removeEnrollment } from '@/lib/actions/users';
import { stackServerApp } from '@/lib/auth/stackauth';
import { z } from 'zod';

const createEnrollmentSchema = z.object({
    studentId: z.string().uuid('Invalid student ID'),
    courseId: z.string().uuid('Invalid course ID'),
});

export async function POST(request: NextRequest) {
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

        const body = await request.json();
        const validation = createEnrollmentSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json(
                { success: false, error: 'Invalid request body', data: validation.error.errors },
                { status: 400 }
            );
        }

        const { studentId, courseId } = validation.data;
        const result = await createEnrollment(studentId, courseId);

        if (!result.success) {
            return NextResponse.json(
                { success: false, error: result.error, data: null },
                { status: 400 }
            );
        }

        return NextResponse.json(result, { status: 201 });
    } catch (error) {
        console.error('Error in POST /api/enrollments:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error', data: null },
            { status: 500 }
        );
    }
}
