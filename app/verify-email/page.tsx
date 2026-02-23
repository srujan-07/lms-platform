'use client';

import { useStackApp, useUser } from '@stackframe/stack';
import { Shield, Mail, RefreshCw, LogOut } from 'lucide-react';
import { useState } from 'react';

export default function VerifyEmailPage() {
    const user = useUser({ or: 'redirect', includeRestricted: true });
    const app = useStackApp();
    const [resent, setResent] = useState(false);
    const [loading, setLoading] = useState(false);

    async function handleResend() {
        setLoading(true);
        try {
            // Get primary contact channel and resend verification
            const contactChannels = await user.listContactChannels();
            const primaryEmail = contactChannels.find(c => c.isPrimary && c.type === 'email');
            if (primaryEmail) {
                await primaryEmail.sendVerificationEmail();
                setResent(true);
            }
        } catch (err) {
            console.error('Failed to resend verification email:', err);
        } finally {
            setLoading(false);
        }
    }

    async function handleSignOut() {
        await app.signOut();
    }

    return (
        <div className="min-h-screen bg-brand-light flex items-center justify-center px-4">
            <div className="max-w-md w-full">
                {/* Card */}
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

                    {/* Heading */}
                    <h1 className="text-2xl font-bold text-brand-dark mb-2">
                        Verify your email
                    </h1>
                    <p className="text-brand-dark/60 mb-2">
                        We sent a verification link to
                    </p>
                    <p className="font-semibold text-brand-dark mb-6">
                        {user?.primaryEmail ?? 'your email address'}
                    </p>

                    <p className="text-sm text-brand-dark/50 mb-8">
                        Click the link in your inbox to activate your account. Check your spam folder if you don&apos;t see it.
                    </p>

                    {/* Actions */}
                    <div className="space-y-3">
                        {resent ? (
                            <div className="w-full py-3 px-4 bg-green-50 text-green-700 rounded-lg text-sm font-medium border border-green-200">
                                ✅ Verification email resent!
                            </div>
                        ) : (
                            <button
                                onClick={handleResend}
                                disabled={loading}
                                className="w-full py-3 px-4 bg-brand-orange text-white rounded-lg font-medium hover:bg-brand-orange/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                                {loading ? 'Sending…' : 'Resend verification email'}
                            </button>
                        )}

                        <button
                            onClick={handleSignOut}
                            className="w-full py-3 px-4 bg-transparent text-brand-dark/50 rounded-lg font-medium hover:text-brand-dark hover:bg-brand-dark/5 transition-all flex items-center justify-center gap-2"
                        >
                            <LogOut className="w-4 h-4" />
                            Sign out
                        </button>
                    </div>
                </div>

                {/* Footer note */}
                <p className="text-center text-xs text-brand-dark/40 mt-4">
                    Already verified? <a href="/handler/sign-in" className="text-brand-orange hover:underline">Sign in again</a>
                </p>
            </div>
        </div>
    );
}
