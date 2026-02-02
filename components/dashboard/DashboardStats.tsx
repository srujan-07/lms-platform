import { LucideIcon } from 'lucide-react';
import { ReactNode } from 'react';

interface DashboardStatsProps {
    icon: LucideIcon;
    value: string | number;
    label: string;
    trend?: {
        value: number;
        isPositive: boolean;
    };
    colorScheme?: 'primary' | 'student' | 'lecturer' | 'admin' | 'success' | 'warning';
    className?: string;
}

const colorSchemes = {
    primary: {
        bg: 'bg-primary-100',
        icon: 'text-primary-600',
        trend: 'text-primary-600',
    },
    student: {
        bg: 'bg-student-100',
        icon: 'text-student-600',
        trend: 'text-student-600',
    },
    lecturer: {
        bg: 'bg-lecturer-100',
        icon: 'text-lecturer-600',
        trend: 'text-lecturer-600',
    },
    admin: {
        bg: 'bg-admin-100',
        icon: 'text-admin-600',
        trend: 'text-admin-600',
    },
    success: {
        bg: 'bg-green-100',
        icon: 'text-green-600',
        trend: 'text-green-600',
    },
    warning: {
        bg: 'bg-yellow-100',
        icon: 'text-yellow-600',
        trend: 'text-yellow-600',
    },
};

export function DashboardStats({
    icon: Icon,
    value,
    label,
    trend,
    colorScheme = 'primary',
    className = '',
}: DashboardStatsProps) {
    const colors = colorSchemes[colorScheme];

    return (
        <div className={`card p-6 hover:shadow-md transition-shadow ${className}`}>
            <div className="flex items-center gap-3">
                <div className={`w-12 h-12 ${colors.bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`w-6 h-6 ${colors.icon}`} />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-2xl font-bold text-gray-900 truncate">{value}</p>
                    <p className="text-sm text-gray-600 truncate">{label}</p>
                    {trend && (
                        <p className={`text-xs font-medium mt-1 ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                            {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
