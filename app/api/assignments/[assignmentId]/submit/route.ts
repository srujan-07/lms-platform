import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { stackServerApp } from '@/lib/auth/stackauth';
import { uploadPDF } from '@/lib/supabase/storage';

export async function POST(
    request: NextRequest,
    { params }: { params: { assignmentId: string } }
) {
    try {
        const assignmentId = params.assignmentId;
        const user = await stackServerApp.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'File is required' }, { status: 400 });
        }

        // Use existing uploadPDF utility
        // We'll reuse the 'lecture-notes' bucket structure or create a new path convention
        // Path: assignments/{assignmentId}/{studentId}/{filename}
        // Since uploadPDF takes courseId, we might need a slight workaround or just pass assignmentId as "courseId" to group by assignment

        // Better to modify uploadPDF or implement custom upload logic here if we want specific folder structure.
        // For now, let's reuse uploadPDF but be mindful of the structure: {courseId}/{timestamp}-{filename}
        // We will use assignmentId as the folder grouping key.

        const uploadResult = await uploadPDF(file, `assignments/${assignmentId}`, user.id);

        if (!uploadResult.success || !uploadResult.filePath) {
            return NextResponse.json(
                { error: uploadResult.error || 'Failed to upload file' },
                { status: 500 }
            );
        }

        const supabase = await createClient();

        // Check if submission already exists, update if it does (policy allows insert, but we simplified to insert/update logic locally)
        const { data: existing } = await supabase
            .from('assignment_submissions')
            .select('id')
            .eq('assignment_id', assignmentId)
            .eq('student_id', user.id) // user.id is string from stack auth, corresponds to text ID in DB
            .single();

        let result;
        if (existing) {
            // Update
            result = await supabase
                .from('assignment_submissions')
                .update({
                    file_path: uploadResult.filePath,
                    submitted_at: new Date().toISOString()
                })
                .eq('id', existing.id)
                .select()
                .single();
        } else {
            // Insert
            result = await supabase
                .from('assignment_submissions')
                .insert({
                    assignment_id: assignmentId,
                    student_id: user.id,
                    file_path: uploadResult.filePath,
                })
                .select()
                .single();
        }

        if (result.error) {
            console.error('Error recording submission:', result.error);
            return NextResponse.json({ error: result.error.message }, { status: 500 });
        }

        return NextResponse.json({ data: result.data }, { status: 201 });
    } catch (error) {
        console.error('Error in POST /api/assignments/[assignmentId]/submit:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
