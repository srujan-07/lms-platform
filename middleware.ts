import { stackServerApp } from './lib/auth/stackauth';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Public routes that don't require authentication
    const publicRoutes = ['/', '/handler'];

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

    // Role-based route protection
    // Note: We'll get the role from the database in the actual page components
    // This middleware just ensures authentication

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
