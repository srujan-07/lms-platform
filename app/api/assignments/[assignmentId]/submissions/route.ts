import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { stackServerApp } from '@/lib/auth/stackauth';

export async function GET(
    request: NextRequest,
    { params }: { params: { assignmentId: string } }
) {
    try {
        const supabase: any = createClient();
        const assignmentId = params.assignmentId;
        const user = await stackServerApp.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Role check: Only lecturers and admins can view all submissions for an assignment
        const role = user.serverMetadata?.role;
        if (role !== 'admin' && role !== 'lecturer') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // Fetch submissions with student details
        const { data, error } = await supabase
            .from('assignment_submissions')
            .select('*, student:users(*)')
            .eq('assignment_id', assignmentId)
            .order('submitted_at', { ascending: false });

        if (error) {
            console.error('Error fetching submissions:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ data });
    } catch (error) {
        console.error('Error in GET /api/assignments/[assignmentId]/submissions:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
