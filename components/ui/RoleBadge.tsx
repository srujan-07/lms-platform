import { cn } from '@/lib/utils';

interface RoleBadgeProps {
    role: 'student' | 'lecturer' | 'admin';
    className?: string;
    size?: 'sm' | 'md' | 'lg';
}

export function RoleBadge({ role, className, size = 'md' }: RoleBadgeProps) {
    const styles = {
        student: 'bg-brand-light text-brand-dark border-brand-dark/10',
        lecturer: 'bg-brand-orange/10 text-brand-orange border-brand-orange/20',
        admin: 'bg-brand-dark text-brand-beige border-transparent',
    };

    const sizeStyles = {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-2.5 py-0.5 text-xs',
        lg: 'px-3 py-1 text-sm',
    };

    return (
        <span
            className={cn(
                'inline-flex items-center rounded-full font-medium border transition-all duration-200',
                styles[role],
                sizeStyles[size],
                className
            )}
        >
            {role.charAt(0).toUpperCase() + role.slice(1)}
        </span>
    );
}
