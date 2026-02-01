import { stackServerApp } from "@/lib/auth/stackauth";
import { cookies } from "next/headers";

export async function GET() {
    // Clear the Stack session
    const cookieStore = await cookies();

    // Get all cookies and clear Stack-related ones
    const allCookies = cookieStore.getAll();
    for (const cookie of allCookies) {
        if (cookie.name.startsWith('stack-') || cookie.name.includes('session')) {
            cookieStore.delete(cookie.name);
        }
    }

    // Redirect to home page
    return Response.redirect(new URL('/', process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'));
}
