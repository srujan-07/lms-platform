import { NextRequest, NextResponse } from 'next/server';
import { getCourseMaterials, uploadCourseMaterial } from '@/lib/actions/materials';
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

        const result = await getCourseMaterials(params.id);

        if (!result.success) {
            return NextResponse.json(
                { success: false, error: result.error, data: null },
                { status: 403 }
            );
        }

        return NextResponse.json(result, { status: 200 });
    } catch (error) {
        console.error('Error in GET /api/courses/[id]/materials:', error);
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

        // Only admin/lecturer can upload
        const userRole = user.serverMetadata?.role;
        if (userRole === 'student') {
            return NextResponse.json(
                { success: false, error: 'Students cannot upload materials', data: null },
                { status: 403 }
            );
        }

        const formData = await request.formData();
        const file = formData.get('file') as File;
        const title = formData.get('title') as string;
        const description = formData.get('description') as string | undefined;

        if (!file || !title) {
            return NextResponse.json(
                { success: false, error: 'File and title are required', data: null },
                { status: 400 }
            );
        }

        // Validate file type (PDF only)
        if (file.type !== 'application/pdf') {
            return NextResponse.json(
                { success: false, error: 'Only PDF files are allowed', data: null },
                { status: 400 }
            );
        }

        // Validate file size (max 10MB)
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (file.size > maxSize) {
            return NextResponse.json(
                { success: false, error: 'File size must be less than 10MB', data: null },
                { status: 400 }
            );
        }

        const result = await uploadCourseMaterial(params.id, file, title, description);

        if (!result.success) {
            return NextResponse.json(
                { success: false, error: result.error, data: null },
                { status: 400 }
            );
        }

        return NextResponse.json(result, { status: 201 });
    } catch (error) {
        console.error('Error in POST /api/courses/[id]/materials:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error', data: null },
            { status: 500 }
        );
    }
}
