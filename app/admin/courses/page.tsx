'use client';

import { useState, useEffect } from 'react';
import { BookOpen, Plus, Edit2, Trash2, Loader2, Key, Copy, Check, Users } from 'lucide-react';
import Link from 'next/link';
import { ManageLecturersModal } from '@/components/admin/ManageLecturersModal';

interface Course {
    id: string;
    title: string;
    description: string;
    lecturer_id: string;
    access_code: string;
    created_at: string;
    lecturers?: {
        lecturer_id: string;
        user?: {
            id: string;
            name: string;
            email: string;
        }
    }[];
    lecturer?: {
        id: string;
        name: string;
        email: string;
    };
}

export default function AdminCoursesPage() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState<string | null>(null);
    const [copiedCode, setCopiedCode] = useState<string | null>(null);
    const [manageLecturersModal, setManageLecturersModal] = useState<{
        isOpen: boolean;
        courseId: string;
        courseTitle: string;
    }>({ isOpen: false, courseId: '', courseTitle: '' });

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            const response = await fetch('/api/courses');
            const data = await response.json();

            if (data.success) {
                setCourses(data.data || []);
            }
        } catch (error) {
            console.error('Error fetching courses:', error);
        } finally {
            setLoading(false);
        }
    };

    const copyAccessCode = async (code: string) => {
        try {
            await navigator.clipboard.writeText(code);
            setCopiedCode(code);
            setTimeout(() => setCopiedCode(null), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    const handleDelete = async (courseId: string, title: string) => {
        if (!confirm(`Are you sure you want to delete "${title}"? This action cannot be undone and will remove all enrollments and materials.`)) {
            return;
        }

        setDeleting(courseId);
        try {
            const response = await fetch(`/api/courses/${courseId}`, {
                method: 'DELETE',
            });

            const data = await response.json();

            if (data.success) {
                setCourses(courses.filter(c => c.id !== courseId));
            } else {
                alert('Failed to delete course: ' + data.error);
            }
        } catch (error) {
            console.error('Error deleting course:', error);
            alert('Failed to delete course');
        } finally {
            setDeleting(null);
        }
    };

    const openManageLecturersModal = (courseId: string, courseTitle: string) => {
        setManageLecturersModal({ isOpen: true, courseId, courseTitle });
    };

    const closeManageLecturersModal = () => {
        setManageLecturersModal({ isOpen: false, courseId: '', courseTitle: '' });
    };

    return (
        <div className="min-h-screen bg-brand-light">
            <nav className="bg-brand-light/80 backdrop-blur-md shadow-sm border-b border-brand-dark/5 sticky top-0 z-10 transition-all">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <BookOpen className="w-6 h-6 text-brand-orange" />
                            <h1 className="text-xl font-bold text-brand-dark">Course Management</h1>
                        </div>
                        <div className="flex items-center gap-3">
                            <Link href="/lecturer/courses/new" className="btn btn-primary px-4 py-2 flex items-center gap-2">
                                <Plus className="w-4 h-4" />
                                Create Course
                            </Link>
                            <Link href="/admin/dashboard" className="btn btn-secondary px-4 py-2">
                                ← Back
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="container mx-auto px-4 py-8">
                <div className="card overflow-hidden">
                    {loading ? (
                        <div className="p-12 text-center">
                            <Loader2 className="w-8 h-8 text-brand-orange animate-spin mx-auto mb-4" />
                            <p className="text-brand-dark/60">Loading courses...</p>
                        </div>
                    ) : courses.length === 0 ? (
                        <div className="p-12 text-center">
                            <BookOpen className="w-16 h-16 text-brand-dark/20 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-brand-dark mb-2">No Courses Yet</h3>
                            <p className="text-brand-dark/60 mb-4">Create your first course to get started.</p>
                            <Link href="/lecturer/courses/new" className="btn btn-primary px-6 py-2 inline-flex items-center gap-2">
                                <Plus className="w-4 h-4" />
                                Create Course
                            </Link>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-brand-light/50 border-b border-brand-dark/5">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-brand-dark/60 uppercase">Title</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-brand-dark/60 uppercase">Lecturers</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-brand-dark/60 uppercase">Access Code</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-brand-dark/60 uppercase">Created</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-brand-dark/60 uppercase">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-brand-dark/5">
                                    {courses.map((course) => (
                                        <tr key={course.id} className="hover:bg-brand-light/30 transition-colors">
                                            <td className="px-6 py-4">
                                                <div>
                                                    <p className="text-sm font-medium text-brand-dark">{course.title}</p>
                                                    {course.description && (
                                                        <p className="text-sm text-brand-dark/70 line-clamp-1">{course.description}</p>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col gap-1.5">
                                                    {course.lecturers && course.lecturers.length > 0 ? (
                                                        <>
                                                            {course.lecturers.slice(0, 2).map((l) => (
                                                                <span key={l.lecturer_id} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-brand-orange/10 text-brand-dark w-fit">
                                                                    {l.user?.name || 'Unknown'}
                                                                </span>
                                                            ))}
                                                            {course.lecturers.length > 2 && (
                                                                <span className="text-xs text-brand-dark/60">
                                                                    +{course.lecturers.length - 2} more
                                                                </span>
                                                            )}
                                                        </>
                                                    ) : course.lecturer ? (
                                                        <span className="text-sm text-brand-dark/70">{course.lecturer.name}</span>
                                                    ) : (
                                                        <span className="text-sm text-brand-dark/40 italic">Unassigned</span>
                                                    )}
                                                    <button
                                                        onClick={() => openManageLecturersModal(course.id, course.title)}
                                                        className="text-xs text-brand-orange hover:text-brand-orange/80 font-medium flex items-center gap-1 w-fit transition-colors"
                                                    >
                                                        <Users className="w-3 h-3" />
                                                        Manage
                                                    </button>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <code className="px-2 py-1 bg-brand-orange/10 text-brand-orange rounded font-mono text-sm font-semibold">
                                                        {course.access_code}
                                                    </code>
                                                    <button
                                                        onClick={() => copyAccessCode(course.access_code)}
                                                        className="p-1 hover:bg-brand-light rounded transition-colors"
                                                        title="Copy access code"
                                                    >
                                                        {copiedCode === course.access_code ? (
                                                            <Check className="w-4 h-4 text-green-600" />
                                                        ) : (
                                                            <Copy className="w-4 h-4 text-brand-dark/40" />
                                                        )}
                                                    </button>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-brand-dark/70">
                                                {new Date(course.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 text-right text-sm space-x-2">
                                                <Link
                                                    href={`/admin/courses/${course.id}/materials`}
                                                    className="text-brand-orange hover:text-brand-orange/80 inline-flex items-center gap-1 transition-colors"
                                                    title="Manage materials"
                                                >
                                                    <BookOpen className="w-4 h-4" />
                                                    Materials
                                                </Link>
                                                <Link
                                                    href={`/lecturer/courses/${course.id}`}
                                                    className="text-brand-orange hover:text-brand-orange/80 inline-flex items-center gap-1 transition-colors"
                                                    title="Edit course"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                    Edit
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(course.id, course.title)}
                                                    disabled={deleting === course.id}
                                                    className="text-red-500 hover:text-red-600 inline-flex items-center gap-1 disabled:opacity-50 hover:bg-red-50 p-1.5 rounded transition-colors"
                                                    title="Delete course"
                                                >
                                                    {deleting === course.id ? (
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                    ) : (
                                                        <Trash2 className="w-4 h-4" />
                                                    )}
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </main>

            {/* Manage Lecturers Modal */}
            <ManageLecturersModal
                isOpen={manageLecturersModal.isOpen}
                onClose={closeManageLecturersModal}
                courseId={manageLecturersModal.courseId}
                courseTitle={manageLecturersModal.courseTitle}
                onUpdate={fetchCourses}
            />
        </div>
    );
}
