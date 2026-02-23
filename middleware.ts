import { stackServerApp } from './lib/auth/stackauth';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient, createAdminClient } from './lib/supabase/server';

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Public routes that don't require authentication
    const publicRoutes = ['/', '/handler', '/api'];

    // Allow access to public routes and all handler sub-routes
    if (publicRoutes.some(route => pathname === route || pathname.startsWith(route + '/'))) {
        return NextResponse.next();
    }

    // Check authentication
    // includeRestricted: true ensures users who signed up but haven't verified
    // their email yet are returned (instead of null), so we can redirect them
    // to the email-verification page rather than bouncing them to sign-in.
    const user = await stackServerApp.getUser({ or: 'return-null', includeRestricted: true });

    if (!user) {
        // Redirect to sign in
        const url = request.nextUrl.clone();
        url.pathname = '/handler/sign-in';
        url.searchParams.set('redirect', pathname);
        return NextResponse.redirect(url);
    }

    // If the user signed up but hasn't verified their email yet, redirect them
    // to Stack Auth's built-in email verification page.
    if (user.isRestricted) {
        const url = request.nextUrl.clone();
        url.pathname = '/handler/email-verification';
        return NextResponse.redirect(url);
    }

    // Sync user to Supabase if not already synced and get Role
    let userRole = 'student'; // Default

    try {
        const supabase = await createClient();

        // Check if user exists in Supabase
        const { data: existingUser } = await supabase
            .from('users')
            .select('role')
            .eq('id', user.id)
            .single() as any;

        if (existingUser) {
            userRole = existingUser.role;
        } else {
            // Use admin client to bypass RLS - authentication is verified by StackAuth above
            const adminSupabase = createAdminClient();
            const { error } = await adminSupabase
                .from('users')
                .insert({
                    id: user.id,
                    email: user.primaryEmail || '',
                    name: user.displayName || user.primaryEmail || 'User',
                    role: 'student',
                } as any);

            if (error) {
                console.error('Error syncing user to Supabase:', error);
            }
        }
    } catch (error) {
        console.error('Error in user sync middleware:', error);
    }

    // Onboarding fully disabled: students go directly to dashboard from any root or onboarding path
    if (userRole === 'student' && (pathname === '/' || pathname.startsWith('/onboarding'))) {
        const url = request.nextUrl.clone();
        url.pathname = '/dashboard';
        return NextResponse.redirect(url);
    }

    // Role-based route protection
    // Note: We'll get the role from the database in the actual page components
    // This middleware just ensures authentication and user sync

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
};
