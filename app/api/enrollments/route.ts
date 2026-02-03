import { NextRequest, NextResponse } from 'next/server';
import { createEnrollment, removeEnrollment } from '@/lib/actions/users';
import { enrollWithAccessCode } from '@/lib/actions/courses';
import { stackServerApp } from '@/lib/auth/stackauth';
import { z } from 'zod';

// Admin enrollment schema (studentId + courseId)
const createEnrollmentSchema = z.object({
    studentId: z.string().uuid('Invalid student ID'),
    courseId: z.string().uuid('Invalid course ID'),
});

// Student self-enrollment schema (accessCode)
const enrollWithCodeSchema = z.object({
    accessCode: z.string().min(1, 'Access code is required').max(20),
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

        const body = await request.json();
        const userRole = user.serverMetadata?.role;

        // Check if this is admin enrollment or student self-enrollment
        if (body.accessCode) {
            // Student self-enrollment with access code
            if (userRole !== 'student') {
                return NextResponse.json(
                    { success: false, error: 'Only students can enroll with access codes', data: null },
                    { status: 403 }
                );
            }

            const validation = enrollWithCodeSchema.safeParse(body);
            if (!validation.success) {
                return NextResponse.json(
                    { success: false, error: 'Invalid request body', data: validation.error.errors },
                    { status: 400 }
                );
            }

            const { accessCode } = validation.data;
            const result = await enrollWithAccessCode(accessCode);

            if (!result.success) {
                return NextResponse.json(
                    { success: false, error: result.error, data: null },
                    { status: 400 }
                );
            }

            return NextResponse.json(result, { status: 201 });
        } else {
            // Admin enrollment with studentId and courseId
            if (userRole !== 'admin') {
                return NextResponse.json(
                    { success: false, error: 'Forbidden - Admin access required', data: null },
                    { status: 403 }
                );
            }

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
        }
    } catch (error) {
        console.error('Error in POST /api/enrollments:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error', data: null },
            { status: 500 }
        );
    }
}
