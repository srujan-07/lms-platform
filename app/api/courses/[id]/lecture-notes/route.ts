import { NextRequest, NextResponse } from 'next/server';
import { getLectureNotes, uploadLectureNote } from '@/lib/actions/lecture-notes';
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
        const user = await stackServerApp.getUser();
        if (!user) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized', data: null },
                { status: 401 }
            );
        }

        // Check if user is lecturer or admin
        const userRole = user.serverMetadata?.role;
        if (userRole !== 'lecturer' && userRole !== 'admin') {
            return NextResponse.json(
                { success: false, error: 'Forbidden - Lecturer or Admin access required', data: null },
                { status: 403 }
            );
        }

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
