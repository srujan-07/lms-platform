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
    primary: 'bg-primary-100 text-primary-600',
    student: 'bg-student-100 text-student-600',
    lecturer: 'bg-lecturer-100 text-lecturer-600',
    admin: 'bg-admin-100 text-admin-600',
    success: 'bg-green-100 text-green-600',
    warning: 'bg-yellow-100 text-yellow-600',
};

export function ActivityFeed({ activities, maxItems = 5, className = '' }: ActivityFeedProps) {
    const displayedActivities = activities.slice(0, maxItems);

    if (displayedActivities.length === 0) {
        return (
            <div className={`card p-8 text-center ${className}`}>
                <p className="text-gray-500 text-sm">No recent activity</p>
            </div>
        );
    }

    return (
        <div className={`card overflow-hidden ${className}`}>
            <div className="divide-y divide-gray-100">
                {displayedActivities.map((activity) => {
                    const Icon = activity.icon;
                    const colorClass = colorSchemes[activity.colorScheme || 'primary'];
                    const timestamp = typeof activity.timestamp === 'string'
                        ? new Date(activity.timestamp)
                        : activity.timestamp;

                    return (
                        <div key={activity.id} className="p-4 hover:bg-gray-50 transition-colors">
                            <div className="flex items-start gap-3">
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                                    <Icon className="w-5 h-5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 truncate">
                                        {activity.title}
                                    </p>
                                    <p className="text-sm text-gray-600 truncate">
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
