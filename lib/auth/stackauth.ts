import { StackServerApp } from "@stackframe/stack";

export const stackServerApp = new StackServerApp({
    tokenStore: "nextjs-cookie",
    urls: {
        signIn: "/handler/sign-in",
        signUp: "/handler/sign-up",
        afterSignIn: "/dashboard",
        afterSignUp: "/dashboard",
        afterSignOut: "/",
        // emailVerification is handled by the [...stack] catch-all at /handler/*
        // Stack Auth sends users here after they click the verification link
        emailVerification: "/handler/email-verification",
    },
});
