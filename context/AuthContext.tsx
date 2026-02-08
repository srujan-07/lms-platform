'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { getUserProfile } from '@/lib/actions/auth';
import type { UserRole } from '@/types/database';

interface UserProfile {
    id: string;
    email: string;
    name: string;
    role: UserRole;
}

interface AuthContextType {
    user: UserProfile | null;
    loading: boolean;
    refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const supabase = createClient();

    const fetchProfile = async () => {
        try {
            const { success, data } = await getUserProfile();
            if (success && data) {
                setUser(data);
            }
        } catch (error) {
            console.error('Failed to fetch user profile:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    useEffect(() => {
        if (!user?.id) return;

        console.log('Subscribing to role changes for user:', user.id);

        const channel = supabase
            .channel(`user-role-${user.id}`)
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'users',
                    filter: `id=eq.${user.id}`,
                },
                (payload) => {
                    console.log('Role update received:', payload);
                    const newRole = payload.new.role as UserRole;
                    if (newRole && newRole !== user.role) {
                        setUser((prev) => prev ? { ...prev, role: newRole } : null);
                        // Trigger server component re-validation to handle redirects
                        router.refresh();
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user?.id, supabase]);

    return (
        <AuthContext.Provider value={{ user, loading, refreshProfile: fetchProfile }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
