import { cn } from '@/lib/utils';

interface RoleBadgeProps {
    role: 'student' | 'lecturer' | 'admin';
    className?: string;
}

export function RoleBadge({ role, className }: RoleBadgeProps) {
    const styles = {
        student: 'bg-student-light text-student-dark border-student',
        lecturer: 'bg-lecturer-light text-lecturer-dark border-lecturer',
        admin: 'bg-admin-light text-admin-dark border-admin',
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
