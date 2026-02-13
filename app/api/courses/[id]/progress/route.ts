import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { stackServerApp } from '@/lib/auth/stackauth';

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const supabase: any = createAdminClient();
        const user = await stackServerApp.getUser();

        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const courseId = params.id;

        const { data, error } = await supabase
            .from('course_progress')
            .select('hour_id')
            .eq('student_id', user.id)
            .eq('course_id', courseId);

        if (error) {
            console.error('Error fetching progress:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        const completed = (data || []).map((r: any) => r.hour_id);
        return NextResponse.json({ success: true, data: completed });
    } catch (err) {
        console.error('Error in progress GET endpoint:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
