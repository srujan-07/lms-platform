import { NextRequest, NextResponse } from 'next/server';
import { getStudentProfile, createOrUpdateStudentProfile, checkOnboardingStatus } from '@/lib/actions/student-profiles';
import { stackServerApp } from '@/lib/auth/stackauth';
import { z } from 'zod';

const onboardingSchema = z.object({
    class: z.string().min(1, 'Class is required').max(50),
    section: z.string().min(1, 'Section is required').max(50),
});

export async function GET(request: NextRequest) {
    try {
        const user = await stackServerApp.getUser();
        if (!user) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized', data: null },
                { status: 401 }
            );
        }

        // Only students can access onboarding
        const userRole = user.serverMetadata?.role;
        if (userRole !== 'student') {
            return NextResponse.json(
                { success: false, error: 'Only students can access onboarding', data: null },
                { status: 403 }
            );
        }

        // Get profile and completion status
        const [profileResult, statusResult] = await Promise.all([
            getStudentProfile(user.id),
            checkOnboardingStatus(user.id)
        ]);

        if (!profileResult.success) {
            return NextResponse.json(
                { success: false, error: profileResult.error, data: null },
                { status: 400 }
            );
        }

        return NextResponse.json({
            success: true,
            data: {
                profile: profileResult.data,
                completed: statusResult.completed
            },
            error: null
        }, { status: 200 });
    } catch (error) {
        console.error('Error in GET /api/onboarding:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error', data: null },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const user = await stackServerApp.getUser();
        if (!user) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized', data: null },
                { status: 401 }
            );
        }

        // Only students can complete onboarding
        const userRole = user.serverMetadata?.role;
        if (userRole !== 'student') {
            return NextResponse.json(
                { success: false, error: 'Only students can complete onboarding', data: null },
                { status: 403 }
            );
        }

        // Parse and validate request body
        const body = await request.json();
        const validation = onboardingSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json(
                { success: false, error: 'Invalid request body', data: validation.error.errors },
                { status: 400 }
            );
        }

        const { class: studentClass, section } = validation.data;

        // Create or update profile
        const result = await createOrUpdateStudentProfile({
            class: studentClass,
            section: section
        });

        if (!result.success) {
            return NextResponse.json(
                { success: false, error: result.error, data: null },
                { status: 400 }
            );
        }

        return NextResponse.json(result, { status: 200 });
    } catch (error) {
        console.error('Error in POST /api/onboarding:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error', data: null },
            { status: 500 }
        );
    }
}
