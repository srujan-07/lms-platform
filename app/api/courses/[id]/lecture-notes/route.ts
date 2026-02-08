import { NextRequest, NextResponse } from 'next/server';
import { getLectureNotes, uploadLectureNote } from '@/lib/actions/lecture-notes';
import { requireRole } from '@/lib/auth/rbac';

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const user = await requireRole(['student', 'lecturer', 'admin']);

        const result = await getLectureNotes(params.id);

        if (!result.success) {
            return NextResponse.json(
                { success: false, error: result.error, data: null },
                { status: 400 }
            );
        }

        return NextResponse.json(result, { status: 200 });
    } catch (error) {
        console.error('Error in GET /api/courses/[id]/lecture-notes:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error', data: null },
            { status: 500 }
        );
    }
}

export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const user = await requireRole(['lecturer', 'admin']);

        const formData = await request.formData();
        const title = formData.get('title') as string;
        const description = formData.get('description') as string;

        if (!title) {
            return NextResponse.json(
                { success: false, error: 'Title is required', data: null },
                { status: 400 }
            );
        }

        const result = await uploadLectureNote(params.id, title, description || '', formData);

        if (!result.success) {
            return NextResponse.json(
                { success: false, error: result.error, data: null },
                { status: 400 }
            );
        }

        return NextResponse.json(result, { status: 201 });
    } catch (error) {
        console.error('Error in POST /api/courses/[id]/lecture-notes:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error', data: null },
            { status: 500 }
        );
    }
}
