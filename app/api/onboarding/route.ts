import { NextRequest, NextResponse } from 'next/server';
import { getStudentProfile, createOrUpdateStudentProfile, checkOnboardingStatus } from '@/lib/actions/student-profiles';
import { stackServerApp } from '@/lib/auth/stackauth';
import { z } from 'zod';

const onboardingSchema = z.object({
    class: z.string().min(1, 'Class is required').max(50),
    section: z.string().min(1, 'Section is required').max(50),
});

// Onboarding API fully disabled
export async function GET() {
  return new Response('Onboarding is disabled', { status: 404 });
}
export async function POST() {
  return new Response('Onboarding is disabled', { status: 404 });
}
