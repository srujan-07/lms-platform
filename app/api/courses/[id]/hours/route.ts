import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { stackServerApp } from '@/lib/auth/stackauth';
import { z } from 'zod';

const createHourSchema = z.object({
    title: z.string().min(1, 'Title is required'),
    content: z.string().optional(),
});

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const supabase: any = await createClient();
        const courseId = params.id;

        // Check authentication
        const user = await stackServerApp.getUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { data, error } = await supabase
            .from('course_hours')
            .select('*, assignments(*)')
            .eq('course_id', courseId)
            .order('order_index', { ascending: true });

        if (error) {
            console.error('Error fetching course hours:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ data });
    } catch (error) {
        console.error('Error in GET /api/courses/[id]/hours:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const supabase: any = await createClient();
        const courseId = params.id;
        const user = await stackServerApp.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Role check: Admin or Lecturer
        const role = user.serverMetadata?.role;
        if (role !== 'admin' && role !== 'lecturer') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const body = await request.json();
        const validation = createHourSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json(
                { error: 'Invalid request', details: validation.error.errors },
                { status: 400 }
            );
        }

        const { title, content } = validation.data;

        const { data, error } = await supabase
            .from('course_hours')
            .insert({
                course_id: courseId,
                title,
                content,
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating course hour:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ data }, { status: 201 });
    } catch (error) {
        console.error('Error in POST /api/courses/[id]/hours:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
