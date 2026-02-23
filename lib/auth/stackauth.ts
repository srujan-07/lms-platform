import { StackServerApp } from "@stackframe/stack";

export const stackServerApp = new StackServerApp({
    tokenStore: "nextjs-cookie",
    urls: {
        signIn: "/handler/sign-in",
        afterSignIn: "/dashboard",
        afterSignOut: "/",
        emailVerification: "/handler/email-verification",
    },
});
