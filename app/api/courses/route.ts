import { NextRequest, NextResponse } from 'next/server';
import { getCourses, createCourse } from '@/lib/actions/courses';
import { stackServerApp } from '@/lib/auth/stackauth';
import { requireRole } from '@/lib/auth/rbac';
import { z } from 'zod';

const createCourseSchema = z.object({
    title: z.string().min(1, 'Title is required').max(200),
    description: z.string().max(1000).optional(),
    lecturerId: z.string().uuid().optional(),
    lecturerIds: z.array(z.string()).optional(),
    accessCode: z.string().min(4).max(20).optional(),
    rollNoStart: z.number().int().positive().optional(),
    rollNoEnd: z.number().int().positive().optional(),
});

export async function GET(request: NextRequest) {
    try {
        // Get all courses (public endpoint, but requires authentication)
        const user = await stackServerApp.getUser();
        if (!user) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized', data: null },
                { status: 401 }
            );
        }

        const result = await getCourses();

        if (!result.success) {
            return NextResponse.json(
                { success: false, error: result.error, data: null },
                { status: 400 }
            );
        }

        return NextResponse.json(result, { status: 200 });
    } catch (error) {
        console.error('Error in GET /api/courses:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error', data: null },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        // Check authentication and role
        const user = await requireRole(['lecturer', 'admin']);

        // Parse and validate request body
        const body = await request.json();
        const validation = createCourseSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json(
                { success: false, error: 'Invalid request body', data: validation.error.errors },
                { status: 400 }
            );
        }

        const { title, description, lecturerId, lecturerIds, accessCode, rollNoStart, rollNoEnd } = validation.data;

        // Handle legacy lecturerId if lecturerIds not provided
        const finalLecturerIds = lecturerIds || (lecturerId ? [lecturerId] : []);

        // Create course
        const result = await createCourse(title, description || '', finalLecturerIds, accessCode, rollNoStart, rollNoEnd);

        if (!result.success) {
            return NextResponse.json(
                { success: false, error: result.error, data: null },
                { status: 400 }
            );
        }

        return NextResponse.json(result, { status: 201 });
    } catch (error) {
        console.error('Error in POST /api/courses:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error', data: null },
            { status: 500 }
        );
    }
}
