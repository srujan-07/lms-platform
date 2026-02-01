import { stackServerApp } from "@/lib/auth/stackauth";
import { createAdminClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

/**
 * Admin tool to manually sync a user from StackAuth to Supabase
 * Usage: POST /api/admin/sync-user
 * Body: { email: "user@example.com", role: "admin" | "lecturer" | "student" }
 */
export async function POST(request: NextRequest) {
    try {
        const { email, role = 'student' } = await request.json();

        if (!email) {
            return NextResponse.json(
                { error: 'Email is required' },
                { status: 400 }
            );
        }

        // Get all users from StackAuth
        const stackUsers = await stackServerApp.listUsers();

        // Find the user by email
        const stackUser = stackUsers.find(
            u => u.primaryEmail?.toLowerCase() === email.toLowerCase()
        );

        if (!stackUser) {
            return NextResponse.json(
                { error: `User with email ${email} not found in StackAuth` },
                { status: 404 }
            );
        }

        // Sync to Supabase with specified role
        const supabase = createAdminClient();

        const { data, error } = await supabase
            .from('users')
            .upsert({
                id: stackUser.id,
                email: stackUser.primaryEmail || email,
                name: stackUser.displayName || stackUser.primaryEmail || 'User',
                role: role,
            } as any, {
                onConflict: 'id',
            })
            .select()
            .single();

        if (error) {
            console.error('Supabase sync error:', error);
            return NextResponse.json(
                { error: `Failed to sync user to Supabase: ${error.message}` },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            message: `User ${email} synced successfully with role: ${role}`,
            user: data
        });

    } catch (error: any) {
        console.error('Sync user error:', error);
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}

/**
 * Get all StackAuth users (for debugging)
 * Usage: GET /api/admin/sync-user
 */
export async function GET() {
    try {
        const stackUsers = await stackServerApp.listUsers();

        return NextResponse.json({
            count: stackUsers.length,
            users: stackUsers.map(u => ({
                id: u.id,
                email: u.primaryEmail,
                name: u.displayName,
            }))
        });
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
}
