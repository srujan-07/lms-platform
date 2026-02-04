import { cn } from '@/lib/utils';

interface RoleBadgeProps {
    role: 'student' | 'lecturer' | 'admin';
    className?: string;
}

export function RoleBadge({ role, className }: RoleBadgeProps) {
    const styles = {
        student: 'bg-brand-light text-brand-dark border-brand-dark/10',
        lecturer: 'bg-brand-orange/10 text-brand-orange border-brand-orange/20',
        admin: 'bg-brand-dark text-brand-beige border-transparent',
    };

    return (
        <span
            className={cn(
                'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
                styles[role],
                className
            )}
        >
            {role.charAt(0).toUpperCase() + role.slice(1)}
        </span>
    );
}
