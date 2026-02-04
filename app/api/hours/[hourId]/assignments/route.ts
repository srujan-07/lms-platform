import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { stackServerApp } from '@/lib/auth/stackauth';
import { z } from 'zod';

const createAssignmentSchema = z.object({
    title: z.string().min(1, 'Title is required'),
    description: z.string().optional(),
    points: z.number().int().min(0).default(100),
    due_date: z.string().optional(), // Expect ISO string
});

export async function POST(
    request: NextRequest,
    { params }: { params: { hourId: string } }
) {
    try {
        const supabase = await createClient();
        const hourId = params.hourId;
        const user = await stackServerApp.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Role check
        const role = user.serverMetadata?.role;
        if (role !== 'admin' && role !== 'lecturer') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const body = await request.json();
        const validation = createAssignmentSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json(
                { error: 'Invalid request', details: validation.error.errors },
                { status: 400 }
            );
        }

        const { title, description, points, due_date } = validation.data;

        const { data, error } = await supabase
            .from('assignments')
            .insert({
                hour_id: hourId,
                title,
                description,
                points,
                due_date: due_date || null,
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating assignment:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ data }, { status: 201 });
    } catch (error) {
        console.error('Error in POST /api/hours/[hourId]/assignments:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
