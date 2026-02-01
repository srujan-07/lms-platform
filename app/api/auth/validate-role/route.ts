import { NextRequest, NextResponse } from 'next/server';

// Store your access codes here
// In production, these should be in environment variables or a secure database
const ACCESS_CODES = {
    lecturer: process.env.LECTURER_ACCESS_CODE || 'LECTURER2024',
    admin: process.env.ADMIN_ACCESS_CODE || 'ADMIN2024',
};

export async function POST(request: NextRequest) {
    try {
        const { role, accessCode } = await request.json();

        // Validate role
        if (role !== 'lecturer' && role !== 'admin') {
            return NextResponse.json(
                { error: 'Invalid role' },
                { status: 400 }
            );
        }

        // Check access code
        if (accessCode !== ACCESS_CODES[role]) {
            return NextResponse.json(
                { error: 'Invalid access code for this role' },
                { status: 403 }
            );
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json(
            { error: 'Invalid request' },
            { status: 400 }
        );
    }
}
