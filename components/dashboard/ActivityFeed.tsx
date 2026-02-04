import { formatDistanceToNow } from 'date-fns';
import { LucideIcon } from 'lucide-react';

interface ActivityItem {
    id: string;
    icon: LucideIcon;
    title: string;
    description: string;
    timestamp: Date | string;
    colorScheme?: 'primary' | 'student' | 'lecturer' | 'admin' | 'success' | 'warning';
}

interface ActivityFeedProps {
    activities: ActivityItem[];
    maxItems?: number;
    className?: string;
}

const colorSchemes = {
    primary: 'bg-brand-orange/10 text-brand-orange',
    student: 'bg-brand-light text-brand-dark',
    lecturer: 'bg-brand-dark/5 text-brand-dark',
    admin: 'bg-brand-dark text-brand-beige',
    success: 'bg-green-50 text-green-700',
    warning: 'bg-yellow-50 text-yellow-700',
};

export function ActivityFeed({ activities, maxItems = 5, className = '' }: ActivityFeedProps) {
    const displayedActivities = activities.slice(0, maxItems);

    if (displayedActivities.length === 0) {
        return (
            <div className={`card p-8 text-center bg-brand-beige/50 border-brand-dark/5 ${className}`}>
                <p className="text-brand-dark/50 text-sm">No recent activity</p>
            </div>
        );
    }

    return (
        <div className={`card overflow-hidden ${className}`}>
            <div className="divide-y divide-brand-dark/5">
                {displayedActivities.map((activity) => {
                    const Icon = activity.icon;
                    const colorClass = colorSchemes[activity.colorScheme || 'primary'];
                    const timestamp = typeof activity.timestamp === 'string'
                        ? new Date(activity.timestamp)
                        : activity.timestamp;

                    return (
                        <div key={activity.id} className="p-4 hover:bg-brand-light/50 transition-colors">
                            <div className="flex items-start gap-3">
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                                    <Icon className="w-5 h-5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-brand-dark truncate">
                                        {activity.title}
                                    </p>
                                    <p className="text-sm text-brand-dark/70 truncate">
                                        {activity.description}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {formatDistanceToNow(timestamp, { addSuffix: true })}
                                    </p>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
