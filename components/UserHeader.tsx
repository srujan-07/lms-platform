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
        <div className="flex items-center gap-4">
            <div className="text-right">
                <p className="text-sm font-medium text-brand-dark">{user.name}</p>
                <RoleBadge role={user.role} />
            </div>
            <a
                href={signOutUrl}
                className="btn btn-secondary px-4 py-2 flex items-center gap-2 hover:bg-red-50 hover:text-red-600 transition-colors"
            >
                <LogOut className="w-4 h-4" />
                Sign Out
            </a>
        </div>
    );
}
