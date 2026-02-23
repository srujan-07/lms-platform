import { StackServerApp } from "@stackframe/stack";

export const stackServerApp = new StackServerApp({
    tokenStore: "nextjs-cookie",
    urls: {
        signIn: "/handler/sign-in",
        signUp: "/handler/sign-up",
        afterSignIn: "/dashboard",
        afterSignUp: "/dashboard",
        afterSignOut: "/",
        // NOTE: Do NOT override emailVerification here.
        // Stack Auth handles the /handler/email-verification?code=... callback
        // internally. Overriding it breaks the verification flow.
    },
});
