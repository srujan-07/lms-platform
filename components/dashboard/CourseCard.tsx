import Link from 'next/link';
import { BookOpen, Users, FileText, TrendingUp } from 'lucide-react';
import { ReactNode } from 'react';

interface CourseCardProps {
    id: string;
    title: string;
    description?: string;
    href: string;
    role: 'student' | 'lecturer' | 'admin';
    metadata?: {
        lecturerName?: string;
        enrollmentCount?: number;
        materialCount?: number;
        progress?: number;
        lastAccessed?: string;
    };
    className?: string;
}

export function CourseCard({
    id,
    title,
    description,
    href,
    role,
    metadata = {},
    className = '',
}: CourseCardProps) {
    const {
        lecturerName,
        enrollmentCount,
        materialCount,
        progress,
        lastAccessed,
    } = metadata;

    return (
        <Link
            href={href}
            className={`card p-6 hover:shadow-lg transition-all hover:-translate-y-1 group ${className}`}
        >
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
                <h4 className="text-lg font-semibold text-gray-900 flex-1 group-hover:text-primary-600 transition-colors">
                    {title}
                </h4>
                <BookOpen className="w-5 h-5 text-gray-400 flex-shrink-0 ml-2" />
            </div>

            {/* Description */}
            {description && (
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {description}
                </p>
            )}

            {/* Progress Bar (Student View) */}
            {role === 'student' && progress !== undefined && (
                <div className="mb-4">
                    <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-medium text-gray-700">Progress</span>
                        <span className="text-xs font-medium text-primary-600">{progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                            className="bg-primary-600 h-2 rounded-full transition-all"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>
            )}

            {/* Metadata */}
            <div className="space-y-2">
                {/* Lecturer Name (Student View) */}
                {role === 'student' && lecturerName && (
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Users className="w-4 h-4" />
                        <span>{lecturerName}</span>
                    </div>
                )}

                {/* Enrollment Count (Lecturer/Admin View) */}
                {(role === 'lecturer' || role === 'admin') && enrollmentCount !== undefined && (
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Users className="w-4 h-4" />
                        <span>{enrollmentCount} {enrollmentCount === 1 ? 'student' : 'students'} enrolled</span>
                    </div>
                )}

                {/* Material Count (Lecturer/Admin View) */}
                {(role === 'lecturer' || role === 'admin') && materialCount !== undefined && (
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                        <FileText className="w-4 h-4" />
                        <span>{materialCount} {materialCount === 1 ? 'material' : 'materials'}</span>
                    </div>
                )}

                {/* Last Accessed (Student View) */}
                {role === 'student' && lastAccessed && (
                    <div className="flex items-center gap-2 text-xs text-gray-400 mt-2 pt-2 border-t">
                        <span>Last accessed {lastAccessed}</span>
                    </div>
                )}
            </div>

            {/* Hover Arrow */}
            <div className="mt-4 pt-4 border-t flex items-center justify-between">
                <span className="text-sm text-gray-500 group-hover:text-primary-600 transition-colors">
                    View details
                </span>
                <span className="text-primary-600 transform group-hover:translate-x-1 transition-transform">
                    →
                </span>
            </div>
        </Link>
    );
}
