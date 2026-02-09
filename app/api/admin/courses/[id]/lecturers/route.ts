import { NextRequest, NextResponse } from 'next/server';
import { getCourseLecturers, addLecturerToCourse, removeLecturerFromCourse } from '@/lib/actions/lecturers';
import { requireRole } from '@/lib/auth/rbac';
import { z } from 'zod';

const addLecturerSchema = z.object({
    lecturerId: z.string().min(1, 'Lecturer ID is required'),
});

/**
 * GET /api/admin/courses/[id]/lecturers
 * Get all lecturers assigned to a course
 */
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        // Admin only
        await requireRole(['admin']);

        const courseId = params.id;
        const result = await getCourseLecturers(courseId);

        if (!result.success) {
            return NextResponse.json(
                { success: false, error: result.error, data: null },
                { status: 400 }
            );
        }

        return NextResponse.json(result, { status: 200 });
    } catch (error) {
        console.error('Error in GET /api/admin/courses/[id]/lecturers:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error', data: null },
            { status: 500 }
        );
    }
}

/**
 * POST /api/admin/courses/[id]/lecturers
 * Add a lecturer to a course
 */
export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        // Admin only
        await requireRole(['admin']);

        const courseId = params.id;
        const body = await request.json();
        const validation = addLecturerSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json(
                { success: false, error: 'Invalid request body', data: validation.error.errors },
                { status: 400 }
            );
        }

        const { lecturerId } = validation.data;
        const result = await addLecturerToCourse(courseId, lecturerId);

        if (!result.success) {
            return NextResponse.json(
                { success: false, error: result.error, data: null },
                { status: 400 }
            );
        }

        return NextResponse.json(result, { status: 201 });
    } catch (error) {
        console.error('Error in POST /api/admin/courses/[id]/lecturers:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error', data: null },
            { status: 500 }
        );
    }
}

/**
 * DELETE /api/admin/courses/[id]/lecturers
 * Remove a lecturer from a course
 */
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        // Admin only
        await requireRole(['admin']);

        const courseId = params.id;
        const { searchParams } = new URL(request.url);
        const lecturerId = searchParams.get('lecturerId');

        if (!lecturerId) {
            return NextResponse.json(
                { success: false, error: 'Lecturer ID is required' },
                { status: 400 }
            );
        }

        const result = await removeLecturerFromCourse(courseId, lecturerId);

        if (!result.success) {
            return NextResponse.json(
                { success: false, error: result.error },
                { status: 400 }
            );
        }

        return NextResponse.json(result, { status: 200 });
    } catch (error) {
        console.error('Error in DELETE /api/admin/courses/[id]/lecturers:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}
