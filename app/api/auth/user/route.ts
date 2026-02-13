import { NextResponse } from 'next/server';
import { getCurrentUserProfile } from '@/lib/actions/student-profiles';

export async function GET() {
    try {
        const { user, profile, complete } = await getCurrentUserProfile();

        return NextResponse.json({
            user,
            profile,
            profileComplete: complete,
            updateProfileUrl: '/dashboard/profile'
        });
    } catch (error: any) {
        return NextResponse.json({ error: error?.message || 'Unauthorized' }, { status: 401 });
    }
}
