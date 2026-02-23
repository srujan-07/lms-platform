import { Shield, Mail } from 'lucide-react';
import ResendButton from './ResendButton';
import Link from 'next/link';

// Static page — all Stack Auth interaction happens client-side in ResendButton
export default function VerifyEmailPage() {
    return (
        <div className="min-h-screen bg-brand-light flex items-center justify-center px-4">
            <div className="max-w-md w-full">
                <div className="bg-white rounded-2xl shadow-xl border border-brand-dark/5 p-8 text-center">
                    {/* Icon */}
                    <div className="flex justify-center mb-6">
                        <div className="relative">
                            <div className="w-16 h-16 bg-brand-orange/10 rounded-full flex items-center justify-center">
                                <Mail className="w-8 h-8 text-brand-orange" />
                            </div>
                            <div className="absolute -top-1 -right-1 w-5 h-5 bg-brand-orange rounded-full flex items-center justify-center">
                                <Shield className="w-3 h-3 text-white" />
                            </div>
                        </div>
                    </div>

                    <h1 className="text-2xl font-bold text-brand-dark mb-2">
                        Verify your email
                    </h1>
                    <p className="text-brand-dark/60 mb-6">
                        Click the verification link we sent to your inbox to activate your account.
                        Check your spam folder if you don&apos;t see it.
                    </p>

                    {/* Client component handles resend + sign-out + shows email */}
                    <ResendButton />
                </div>

                <p className="text-center text-xs text-brand-dark/40 mt-4">
                    Already verified?{' '}
                    <Link href="/handler/sign-in" className="text-brand-orange hover:underline">
                        Sign in again
                    </Link>
                </p>
            </div>
        </div>
    );
}
