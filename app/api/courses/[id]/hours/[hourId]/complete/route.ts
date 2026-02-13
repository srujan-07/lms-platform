import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { stackServerApp } from '@/lib/auth/stackauth';

export async function POST(
    request: NextRequest,
    { params }: { params: { id: string; hourId: string } }
) {
    try {
        const supabase: any = createAdminClient();
        const user = await stackServerApp.getUser();

        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const courseId = params.id;
        const hourId = params.hourId;

        const { data, error } = await supabase
            .from('course_progress')
            .insert({ student_id: user.id, course_id: courseId, hour_id: hourId })
            .select()
            .single();

        if (error) {
            // If conflict due to unique constraint, return success
            if (error.code === '23505') {
                return NextResponse.json({ success: true, data: null });
            }
            console.error('Error inserting progress:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, data });
    } catch (err) {
        console.error('Error in complete endpoint:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
