import { stackServerApp } from './lib/auth/stackauth';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from './lib/supabase/server';

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Public routes that don't require authentication
    const publicRoutes = ['/', '/handler', '/api'];

    // Allow access to public routes and all handler sub-routes
    if (publicRoutes.some(route => pathname === route || pathname.startsWith(route + '/'))) {
        return NextResponse.next();
    }

    // Check authentication
    const user = await stackServerApp.getUser();

    if (!user) {
        // Redirect to sign in
        const url = request.nextUrl.clone();
        url.pathname = '/handler/sign-in';
        url.searchParams.set('redirect', pathname);
        return NextResponse.redirect(url);
    }

    // Sync user to Supabase if not already synced
    try {
        const supabase = await createClient();

        // Check if user exists in Supabase
        const { data: existingUser } = await supabase
            .from('users')
            .select('id')
            .eq('id', user.id)
            .single();

        // If user doesn't exist, create them with default student role
        if (!existingUser) {
            const { error } = await supabase
                .from('users')
                .insert({
                    id: user.id,
                    email: user.primaryEmail || '',
                    name: user.displayName || user.primaryEmail || 'User',
                    role: 'student', // Default role, can be changed by admin
                } as any);

            if (error) {
                console.error('Error syncing user to Supabase:', error);
            }
        }
    } catch (error) {
        console.error('Error in user sync middleware:', error);
        // Continue anyway - don't block the request
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
