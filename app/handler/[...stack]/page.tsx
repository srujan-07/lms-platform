import { StackHandler } from "@stackframe/stack";
import { stackServerApp } from "@/lib/auth/stackauth";

export default function Handler(props: any) {
    return <StackHandler fullPage app={stackServerApp} {...props} />;
}
