import { stackServerApp } from "@/lib/auth/stackauth";
import { redirect } from "next/navigation";

export async function GET() {
    try {
        // Get the current user
        const user = await stackServerApp.getUser();

        // If user exists, sign them out using StackAuth's method
        if (user) {
            await user.signOut();
        }
    } catch (error) {
        // User might already be signed out, continue to redirect
        console.log('Sign out error (user may already be signed out):', error);
    }

    // Redirect to home page
    redirect('/');
}
