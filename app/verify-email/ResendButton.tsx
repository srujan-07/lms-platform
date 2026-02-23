'use client';

import { useUser, useStackApp } from '@stackframe/stack';
import { RefreshCw, LogOut } from 'lucide-react';
import { useState } from 'react';

export default function ResendButton() {
    const app = useStackApp();
    const user = useUser({ or: 'return-null', includeRestricted: true });
    const [resent, setResent] = useState(false);
    const [loading, setLoading] = useState(false);

    async function handleResend() {
        if (!user) return;
        setLoading(true);
        try {
            const channels = await user.listContactChannels();
            const primary = channels.find(c => c.isPrimary && c.type === 'email');
            if (primary) {
                await primary.sendVerificationEmail();
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
        <div className="space-y-3">
            {/* Show the email address if available */}
            {user?.primaryEmail && (
                <p className="text-sm font-medium text-brand-dark bg-brand-light rounded-lg px-4 py-2">
                    {user.primaryEmail}
                </p>
            )}

            {resent ? (
                <div className="w-full py-3 px-4 bg-green-50 text-green-700 rounded-lg text-sm font-medium border border-green-200">
                    ✅ Verification email resent!
                </div>
            ) : (
                <button
                    onClick={handleResend}
                    disabled={loading || !user}
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
    );
}
