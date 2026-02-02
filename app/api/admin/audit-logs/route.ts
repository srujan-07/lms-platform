import { NextRequest, NextResponse } from 'next/server';
import { getAuditLogs } from '@/lib/actions/audit';
import { stackServerApp } from '@/lib/auth/stackauth';

export async function GET(request: NextRequest) {
    try {
        const user = await stackServerApp.getUser();
        if (!user) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized', data: null, total: 0 },
                { status: 401 }
            );
        }

        // Check if user is admin
        const hasAdminRole = user.serverMetadata?.role === 'admin';
        if (!hasAdminRole) {
            return NextResponse.json(
                { success: false, error: 'Forbidden - Admin access required', data: null, total: 0 },
                { status: 403 }
            );
        }

        // Get query parameters for pagination
        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get('limit') || '100');
        const offset = parseInt(searchParams.get('offset') || '0');

        const result = await getAuditLogs(limit, offset);

        if (!result.success) {
            return NextResponse.json(
                { success: false, error: result.error, data: null, total: 0 },
                { status: 400 }
            );
        }

        return NextResponse.json(result, { status: 200 });
    } catch (error) {
        console.error('Error in GET /api/admin/audit-logs:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error', data: null, total: 0 },
            { status: 500 }
        );
    }
}
