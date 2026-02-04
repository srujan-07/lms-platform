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
        bg: 'bg-brand-orange/10',
        icon: 'text-brand-orange',
        trend: 'text-brand-orange',
    },
    student: {
        bg: 'bg-brand-light',
        icon: 'text-brand-dark',
        trend: 'text-brand-dark',
    },
    lecturer: {
        bg: 'bg-brand-dark/5',
        icon: 'text-brand-dark',
        trend: 'text-brand-dark',
    },
    admin: {
        bg: 'bg-brand-dark',
        icon: 'text-brand-beige',
        trend: 'text-brand-dark',
    },
    success: {
        bg: 'bg-green-50', // Keep semantic but soft
        icon: 'text-green-700',
        trend: 'text-green-700',
    },
    warning: {
        bg: 'bg-yellow-50',
        icon: 'text-yellow-700',
        trend: 'text-yellow-700',
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
