import { NextRequest, NextResponse } from 'next/server';
import { getDownloadURL } from '@/lib/actions/lecture-notes';
import { stackServerApp } from '@/lib/auth/stackauth';

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const user = await stackServerApp.getUser();
        if (!user) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized', url: null },
                { status: 401 }
            );
        }

        const result = await getDownloadURL(params.id);

        if (!result.success) {
            return NextResponse.json(
                { success: false, error: result.error, url: null },
                { status: result.error === 'Unauthorized' ? 403 : 404 }
            );
        }

        return NextResponse.json(result, { status: 200 });
    } catch (error) {
        console.error('Error in GET /api/lecture-notes/[id]/download:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error', url: null },
            { status: 500 }
        );
    }
}
