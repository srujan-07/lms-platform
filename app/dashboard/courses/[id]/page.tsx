'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { BookOpen, Download, FileText, Loader2, Users } from 'lucide-react';
import Link from 'next/link';
import CourseCurriculum from '@/components/courses/CourseCurriculum';

interface Course {
    id: string;
    title: string;
    description: string;
    lecturer?: {
        name: string;
        email: string;
    };
    enrollment_count: number;
}

interface LectureNote {
    id: string;
    title: string;
    description: string;
    file_size: number;
    created_at: string;
}

export default function StudentCoursePage() {
    const params = useParams();
    const courseId = params.id as string;

    const [course, setCourse] = useState<Course | null>(null);
    const [notes, setNotes] = useState<LectureNote[]>([]);
    const [loading, setLoading] = useState(true);
    const [downloading, setDownloading] = useState<string | null>(null);

    useEffect(() => {
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [courseId]);

    const fetchData = async () => {
        try {
            const [courseRes, notesRes] = await Promise.all([
                fetch(`/api/courses/${courseId}`),
                fetch(`/api/courses/${courseId}/lecture-notes`),
            ]);

            const courseData = await courseRes.json();
            const notesData = await notesRes.json();

            if (courseData.success) setCourse(courseData.data);
            if (notesData.success) setNotes(notesData.data || []);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = async (noteId: string) => {
        setDownloading(noteId);
        try {
            const response = await fetch(`/api/lecture-notes/${noteId}/download`);
            const data = await response.json();

            if (data.success && data.url) {
                window.open(data.url, '_blank');
            } else {
                alert('Failed to get download URL: ' + data.error);
            }
        } catch (error) {
            console.error('Error downloading:', error);
            alert('Failed to download file');
        } finally {
            setDownloading(null);
        }
    };

    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
        );
    }

    if (!course) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-600">Course not found or you don&apos;t have access</p>
                    <Link href="/dashboard" className="text-primary-600 hover:underline mt-2 inline-block">
                        ← Back to Dashboard
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-brand-light">
            <nav className="bg-brand-light/80 backdrop-blur-md shadow-sm border-b border-brand-dark/5 sticky top-0 z-10">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <BookOpen className="w-6 h-6 text-brand-orange" />
                            <h1 className="text-xl font-bold text-brand-dark">{course.title}</h1>
                        </div>
                        <Link href="/dashboard" className="btn btn-secondary px-4 py-2">
                            ← Back to My Courses
                        </Link>
                    </div>
                </div>
            </nav>

            <main className="container mx-auto px-4 py-8">
                {/* Course Info Card */}
                <div className="card p-8 mb-8">
                    <div className="flex items-start justify-between mb-6">
                        <div className="flex-1">
                            <h2 className="text-3xl font-bold text-brand-dark mb-3">{course.title}</h2>
                            {course.description && (
                                <p className="text-brand-dark/70 text-lg mb-4">{course.description}</p>
                            )}
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6 pt-6 border-t border-brand-dark/5">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-brand-orange/10 rounded-lg flex items-center justify-center">
                                <Users className="w-6 h-6 text-brand-orange" />
                            </div>
                            <div>
                                <p className="text-sm text-brand-dark/60">Instructor</p>
                                <p className="font-semibold text-brand-dark">{course.lecturer?.name || 'Unknown'}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-brand-dark/5 rounded-lg flex items-center justify-center">
                                <Users className="w-6 h-6 text-brand-dark" />
                            </div>
                            <div>
                                <p className="text-sm text-brand-dark/60">Students Enrolled</p>
                                <p className="font-semibold text-brand-dark">{course.enrollment_count}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Lecture Materials */}
                <div className="card">
                    <div className="p-6 border-b border-brand-dark/5 bg-brand-light/50">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xl font-bold text-brand-dark">Course Materials</h3>
                            <span className="text-sm text-brand-dark/60">{notes.length} materials available</span>
                        </div>
                    </div>

                    {notes.length === 0 ? (
                        <div className="p-12 text-center">
                            <FileText className="w-16 h-16 text-brand-dark/20 mx-auto mb-4" />
                            <h4 className="text-lg font-semibold text-brand-dark mb-2">No Materials Yet</h4>
                            <p className="text-brand-dark/60">
                                Your instructor hasn&apos;t uploaded any materials yet. Check back later!
                            </p>
                        </div>
                    ) : (
                        <div className="divide-y divide-brand-dark/5">
                            {notes.map((note) => (
                                <div key={note.id} className="p-6 hover:bg-brand-light/50 transition-colors">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-start gap-4 flex-1">
                                            <div className="w-12 h-12 bg-white rounded-lg border border-brand-dark/10 flex items-center justify-center flex-shrink-0">
                                                <FileText className="w-6 h-6 text-brand-orange" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-semibold text-brand-dark mb-1">{note.title}</h4>
                                                {note.description && (
                                                    <p className="text-sm text-brand-dark/60 mb-2">{note.description}</p>
                                                )}
                                                <div className="flex items-center gap-3 text-xs text-brand-dark/50">
                                                    <span className="flex items-center gap-1">
                                                        <FileText className="w-3 h-3" />
                                                        PDF
                                                    </span>
                                                    <span>•</span>
                                                    <span>{formatFileSize(note.file_size)}</span>
                                                    <span>•</span>
                                                    <span>Uploaded {new Date(note.created_at).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleDownload(note.id)}
                                            disabled={downloading === note.id}
                                            className="btn btn-primary px-4 py-2 flex items-center gap-2 ml-4 flex-shrink-0"
                                        >
                                            {downloading === note.id ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                    Downloading...
                                                </>
                                            ) : (
                                                <>
                                                    <Download className="w-4 h-4" />
                                                    Download
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
