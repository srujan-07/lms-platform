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
            className={`card p-6 hover:shadow-lg hover:shadow-brand-orange/10 transition-all duration-300 hover:-translate-y-1 group bg-white border border-transparent hover:border-brand-orange/20 ${className}`}
        >
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
                <h4 className="text-lg font-semibold text-brand-dark flex-1 group-hover:text-brand-orange transition-colors">
                    {title}
                </h4>
                <BookOpen className="w-5 h-5 text-brand-dark/30 flex-shrink-0 ml-2" />
            </div>

            {/* Description */}
            {description && (
                <p className="text-sm text-brand-dark/70 mb-4 line-clamp-2">
                    {description}
                </p>
            )}

            {/* Progress Bar (Student View) */}
            {role === 'student' && progress !== undefined && (
                <div className="mb-4">
                    <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-medium text-brand-dark/70">Progress</span>
                        <span className="text-xs font-medium text-brand-orange">{progress}%</span>
                    </div>
                    <div className="w-full bg-brand-dark/5 rounded-full h-2">
                        <div
                            className="bg-brand-orange h-2 rounded-full transition-all duration-500 ease-out"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>
            )}

            {/* Metadata */}
            <div className="space-y-2">
                {/* Lecturer Name (Student View) */}
                {role === 'student' && lecturerName && (
                    <div className="flex items-center gap-2 text-sm text-brand-dark/50">
                        <Users className="w-4 h-4" />
                        <span>{lecturerName}</span>
                    </div>
                )}

                {/* Enrollment Count (Lecturer/Admin View) */}
                {(role === 'lecturer' || role === 'admin') && enrollmentCount !== undefined && (
                    <div className="flex items-center gap-2 text-sm text-brand-dark/50">
                        <Users className="w-4 h-4" />
                        <span>{enrollmentCount} {enrollmentCount === 1 ? 'student' : 'students'} enrolled</span>
                    </div>
                )}

                {/* Material Count (Lecturer/Admin View) */}
                {(role === 'lecturer' || role === 'admin') && materialCount !== undefined && (
                    <div className="flex items-center gap-2 text-sm text-brand-dark/50">
                        <FileText className="w-4 h-4" />
                        <span>{materialCount} {materialCount === 1 ? 'material' : 'materials'}</span>
                    </div>
                )}

                {/* Last Accessed (Student View) */}
                {role === 'student' && lastAccessed && (
                    <div className="flex items-center gap-2 text-xs text-brand-dark/40 mt-2 pt-2 border-t border-brand-dark/5">
                        <span>Last accessed {lastAccessed}</span>
                    </div>
                )}
            </div>

            {/* Hover Arrow */}
            <div className="mt-4 pt-4 border-t border-brand-dark/5 flex items-center justify-between">
                <span className="text-sm text-brand-dark/50 group-hover:text-brand-orange transition-colors">
                    View details
                </span>
                <span className="text-brand-orange transform group-hover:translate-x-1 transition-transform">
                    →
                </span>
            </div>
        </Link>
    );
}
