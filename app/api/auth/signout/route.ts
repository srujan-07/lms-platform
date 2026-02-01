import { stackServerApp } from "@/lib/auth/stackauth";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

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

    // Redirect to home page using Next.js redirect (relative URL)
    redirect('/');
}
