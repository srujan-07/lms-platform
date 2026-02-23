import { StackHandler } from "@stackframe/stack";
import { stackServerApp } from "@/lib/auth/stackauth";
import { Suspense } from "react";

// StackHandlerClient (inside StackHandler) uses useSearchParams() which
// requires a Suspense boundary in Next.js 14, otherwise it throws during SSR.
export default function Handler(props: any) {
    return (
        <Suspense>
            <StackHandler fullPage app={stackServerApp} {...props} />
        </Suspense>
    );
}
