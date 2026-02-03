import { NextRequest, NextResponse } from 'next/server';
import { getGlobalAnalytics, getAllStudentProfilesWithDetails, getEnrollmentStatistics } from '@/lib/actions/analytics';
import { stackServerApp } from '@/lib/auth/stackauth';

export async function GET(request: NextRequest) {
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

        // Get all analytics data
        const [globalResult, studentsResult, enrollmentStatsResult] = await Promise.all([
            getGlobalAnalytics(),
            getAllStudentProfilesWithDetails(),
            getEnrollmentStatistics(),
        ]);

        if (!globalResult.success) {
            return NextResponse.json(
                { success: false, error: globalResult.error, data: null },
                { status: 400 }
            );
        }

        return NextResponse.json({
            success: true,
            data: {
                global: globalResult.data,
                students: studentsResult.data || [],
                enrollmentStats: enrollmentStatsResult.data || [],
            },
            error: null,
        }, { status: 200 });
    } catch (error) {
        console.error('Error in GET /api/admin/analytics:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error', data: null },
            { status: 500 }
        );
    }
}
