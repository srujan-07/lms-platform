import { NextRequest, NextResponse } from 'next/server';
import { getMaterialSignedUrl } from '@/lib/actions/materials';
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

        const result = await getMaterialSignedUrl(params.id);

        if (!result.success) {
            return NextResponse.json(
                { success: false, error: result.error, data: null },
                { status: 403 }
            );
        }

        return NextResponse.json(result, { status: 200 });
    } catch (error) {
        console.error('Error in GET /api/materials/[id]/download:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error', data: null },
            { status: 500 }
        );
    }
}
