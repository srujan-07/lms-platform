import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types/database';
import { stackServerApp } from '@/lib/auth/stackauth';
import { z } from 'zod';

const gradeSchema = z.object({
    grade: z.number().int().min(0).max(100),
    feedback: z.string().optional(),
});

export async function POST(
    request: NextRequest,
    { params }: { params: { submissionId: string } }
) {
    try {
        const supabase: any = await createClient();
        const submissionId = params.submissionId;
        const user = await stackServerApp.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Role check: Only lecturers and admins can grade
        const role = user.serverMetadata?.role;
        if (role !== 'admin' && role !== 'lecturer') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const body = await request.json();
        const validation = gradeSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json(
                { error: 'Invalid request', details: validation.error.errors },
                { status: 400 }
            );
        }

        const { grade, feedback } = validation.data;

        const { data, error } = await supabase
            .from('assignment_submissions')
            .update({
                grade,
                feedback,
            })
            .eq('id', submissionId)
            .select()
            .single();

        if (error) {
            console.error('Error grading submission:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ data }, { status: 200 });
    } catch (error) {
        console.error('Error in POST /api/submissions/[submissionId]/grade:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
