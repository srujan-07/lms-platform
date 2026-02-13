'use client';

import { useAuth } from '@/context/AuthContext';
import { RoleBadge } from '@/components/ui/RoleBadge';
import { LogOut } from 'lucide-react';

interface UserHeaderProps {
    signOutUrl?: string; // Optional, defaults to /api/auth/signout
}

export function UserHeader({ signOutUrl = '/api/auth/signout' }: UserHeaderProps) {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="flex items-center gap-4 animate-pulse">
                <div className="h-4 w-24 bg-brand-dark/10 rounded"></div>
                <div className="h-6 w-16 bg-brand-dark/10 rounded-full"></div>
            </div>
        );
    }

    if (!user) return null;

    return (
        <div className="relative">
            <button
                className="flex items-center gap-3 px-3 py-2 rounded hover:bg-gray-100 transition-colors"
                aria-haspopup="true"
                aria-expanded="false"
                onClick={(e) => {
                    const el = e.currentTarget.nextElementSibling as HTMLElement | null;
                    if (el) el.classList.toggle('hidden');
                }}
            >
                <div className="text-right">
                    <p className="text-sm font-medium text-brand-dark">{user.name}</p>
                    <RoleBadge role={user.role} />
                </div>
            </button>

            <div className="hidden absolute right-0 mt-2 w-44 bg-white border border-gray-100 rounded shadow-md z-50">
                <a
                    href="/dashboard/profile"
                    className="block px-4 py-2 text-sm text-brand-dark hover:bg-gray-50"
                >
                    Update Profile
                </a>
                <a
                    href={signOutUrl}
                    className="block px-4 py-2 text-sm text-red-600 hover:bg-gray-50"
                >
                    Sign Out
                </a>
            </div>
        </div>
    );
}
