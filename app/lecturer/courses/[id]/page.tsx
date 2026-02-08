'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { BookOpen, Upload, FileText, Download, Edit2, Trash2, Loader2, X, Plus, Check } from 'lucide-react';
import Link from 'next/link';
import { useDropzone } from 'react-dropzone';
import CourseCurriculum from '@/components/courses/CourseCurriculum';

interface Course {
    id: string;
    title: string;
    description: string;
    enrollment_count: number;
}

interface LectureNote {
    id: string;
    title: string;
    description: string;
    file_size: number;
    created_at: string;
    uploader?: {
        name: string;
    };
}

export default function LecturerCoursePage() {
    const params = useParams();
    const router = useRouter();
    const courseId = params.id as string;

    const [course, setCourse] = useState<Course | null>(null);
    const [notes, setNotes] = useState<LectureNote[]>([]);
    const [loading, setLoading] = useState(true);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [uploadData, setUploadData] = useState({ title: '', description: '', file: null as File | null });
    const [uploading, setUploading] = useState(false);

    const [showEditModal, setShowEditModal] = useState(false);

    // Import user context
    // We need to fetch user role here or use useAuth. 
    // Assuming useAuth is available or we fetch user.
    // Let's add useAuth usage.
    const [user, setUser] = useState<any>(null); // Placeholder if useAuth unavailable in this file yet

    // Fetch user for role check (or assume implemented)
    // For now, let's fetch user role from an API or assume passed. 
    // Best to import useAuth.

    useEffect(() => {
        // Fetch current user logic
        fetch('/api/auth/me').then(res => res.json()).then(data => {
            if (data.user) setUser(data.user);
        }).catch(() => { });
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [courseId]);

    const handleCourseUpdate = async (updates: any) => {
        try {
            const res = await fetch(`/api/courses/${courseId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates)
            });
            const data = await res.json();
            if (data.success) {
                setCourse(data.data);
                fetchData(); // Refresh to get updated lecturers
            } else {
                alert('Update failed: ' + data.error);
            }
        } catch (err) {
            console.error(err);
            alert('Update failed');
        }
    };

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

    const handleUpload = async () => {
        if (!uploadData.file || !uploadData.title) return;

        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', uploadData.file);
            formData.append('title', uploadData.title);
            formData.append('description', uploadData.description);

            const response = await fetch(`/api/courses/${courseId}/lecture-notes`, {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (data.success) {
                await fetchData();
                setShowUploadModal(false);
                setUploadData({ title: '', description: '', file: null });
            } else {
                alert('Failed to upload: ' + data.error);
            }
        } catch (error) {
            console.error('Error uploading:', error);
            alert('Failed to upload file');
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (noteId: string, title: string) => {
        if (!confirm(`Delete "${title}"?`)) return;

        try {
            const response = await fetch(`/api/lecture-notes/${noteId}`, {
                method: 'DELETE',
            });

            const data = await response.json();

            if (data.success) {
                setNotes(notes.filter(n => n.id !== noteId));
            } else {
                alert('Failed to delete: ' + data.error);
            }
        } catch (error) {
            console.error('Error deleting:', error);
            alert('Failed to delete note');
        }
    };

    const handleDownload = async (noteId: string) => {
        try {
            const response = await fetch(`/api/lecture-notes/${noteId}/download`);
            const data = await response.json();

            if (data.success && data.url) {
                window.open(data.url, '_blank');
            } else {
                alert('Failed to get download URL');
            }
        } catch (error) {
            console.error('Error downloading:', error);
            alert('Failed to download file');
        }
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        accept: { 'application/pdf': ['.pdf'] },
        maxFiles: 1,
        onDrop: (acceptedFiles) => {
            if (acceptedFiles.length > 0) {
                setUploadData({ ...uploadData, file: acceptedFiles[0] });
            }
        },
    });

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
                    <p className="text-gray-600">Course not found</p>
                    <Link href="/lecturer/dashboard" className="text-primary-600 hover:underline mt-2 inline-block">
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
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setShowEditModal(true)}
                                className="btn btn-secondary px-4 py-2 flex items-center gap-2"
                            >
                                <Edit2 className="w-4 h-4" />
                                Edit
                            </button>
                            <button
                                onClick={() => setShowUploadModal(true)}
                                className="btn btn-primary px-4 py-2 flex items-center gap-2"
                            >
                                <Upload className="w-4 h-4" />
                                Upload Material
                            </button>
                            <Link href="/lecturer/dashboard" className="btn btn-secondary px-4 py-2">
                                ← Back
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="container mx-auto px-4 py-8">
                {/* Course Info */}
                <div className="card p-6 mb-8">
                    <h2 className="text-2xl font-bold mb-2 text-brand-dark">{course.title}</h2>
                    {course.description && (
                        <p className="text-brand-dark/70 mb-4">{course.description}</p>
                    )}
                    <div className="flex items-center gap-4 text-sm text-brand-dark/50">
                        <span>{course.enrollment_count} students enrolled</span>
                        <span>•</span>
                        <span>{notes.length} materials uploaded</span>
                    </div>
                </div>

                {/* Lecture Notes */}
                <div className="card">
                    <div className="p-6 border-b border-brand-dark/5 bg-brand-light/50">
                        <h3 className="text-xl font-bold text-brand-dark">Lecture Materials</h3>
                    </div>

                    {notes.length === 0 ? (
                        <div className="p-12 text-center">
                            <FileText className="w-16 h-16 text-brand-dark/20 mx-auto mb-4" />
                            <h4 className="text-lg font-semibold text-brand-dark mb-2">No Materials Yet</h4>
                            <p className="text-brand-dark/60 mb-4">Upload lecture notes and materials for your students.</p>
                            <button
                                onClick={() => setShowUploadModal(true)}
                                className="btn btn-primary px-6 py-2 inline-flex items-center gap-2"
                            >
                                <Upload className="w-4 h-4" />
                                Upload Material
                            </button>
                        </div>
                    ) : (
                        <div className="divide-y divide-brand-dark/5">
                            {notes.map((note) => (
                                <div key={note.id} className="p-6 hover:bg-brand-light/50 transition-colors">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <h4 className="font-semibold text-brand-dark mb-1">{note.title}</h4>
                                            {note.description && (
                                                <p className="text-sm text-brand-dark/70 mb-2">{note.description}</p>
                                            )}
                                            <div className="flex items-center gap-3 text-xs text-brand-dark/50">
                                                <span>{formatFileSize(note.file_size)}</span>
                                                <span>•</span>
                                                <span>Uploaded {new Date(note.created_at).toLocaleDateString()}</span>
                                                <span>•</span>
                                                <span>by {note.uploader?.name}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 ml-4">
                                            <button
                                                onClick={() => handleDownload(note.id)}
                                                className="text-brand-orange hover:text-brand-orange/80 p-2"
                                                title="Download"
                                            >
                                                <Download className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(note.id, note.title)}
                                                className="text-red-600 hover:text-red-700 p-2"
                                                title="Delete"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>

            {/* Upload Modal */}
            {showUploadModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="card max-w-2xl w-full p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold">Upload Lecture Material</h2>
                            <button onClick={() => setShowUploadModal(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                                <input
                                    type="text"
                                    required
                                    className="input w-full"
                                    value={uploadData.title}
                                    onChange={(e) => setUploadData({ ...uploadData, title: e.target.value })}
                                    placeholder="e.g., Week 1 - Introduction to AI"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                                <textarea
                                    rows={3}
                                    className="input w-full"
                                    value={uploadData.description}
                                    onChange={(e) => setUploadData({ ...uploadData, description: e.target.value })}
                                    placeholder="Optional description..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">PDF File *</label>
                                <div
                                    {...getRootProps()}
                                    className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${isDragActive ? 'border-primary-500 bg-primary-50' : 'border-gray-300 hover:border-gray-400'
                                        }`}
                                >
                                    <input {...getInputProps()} />
                                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                    {uploadData.file ? (
                                        <div>
                                            <p className="font-medium text-gray-900">{uploadData.file.name}</p>
                                            <p className="text-sm text-gray-500">{formatFileSize(uploadData.file.size)}</p>
                                        </div>
                                    ) : (
                                        <div>
                                            <p className="text-gray-600">Drag & drop a PDF file here, or click to select</p>
                                            <p className="text-sm text-gray-500 mt-1">PDF files only</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    onClick={handleUpload}
                                    disabled={!uploadData.file || !uploadData.title || uploading}
                                    className="btn btn-primary flex-1"
                                >
                                    {uploading ? 'Uploading...' : 'Upload'}
                                </button>
                                <button onClick={() => setShowUploadModal(false)} className="btn btn-secondary flex-1">
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {/* Edit Course Modal */}
            <EditCourseModal
                isOpen={showEditModal}
                onClose={() => setShowEditModal(false)}
                course={course}
                onUpdate={handleCourseUpdate}
                userRole={user?.role} // Need to access user context or pass it
            />
        </div>
    );
}

function EditCourseModal({ isOpen, onClose, course, onUpdate, userRole }: any) {
    const [formData, setFormData] = useState({
        title: course?.title || '',
        description: course?.description || '',
        lecturerIds: [] as string[],
    });
    const [lecturers, setLecturers] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (course) {
            setFormData({
                title: course.title,
                description: course.description || '',
                // Initialize with current lecturers
                lecturerIds: course.lecturers?.map((l: any) => l.user?.id || l.id) || [course.lecturer_id],
            });
        }
    }, [course]);

    useEffect(() => {
        if (isOpen && userRole === 'admin') {
            fetchLecturers();
        }
    }, [isOpen, userRole]);

    const fetchLecturers = async () => {
        try {
            const response = await fetch('/api/admin/users');
            const data = await response.json();
            if (data.success) {
                setLecturers(data.data.filter((u: any) => u.role === 'lecturer'));
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await onUpdate(formData);
            onClose();
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="card max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold">Edit Course</h2>
                    <button onClick={onClose}><X className="w-5 h-5 text-gray-400" /></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Title</label>
                        <input
                            className="input w-full"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Description</label>
                        <textarea
                            className="input w-full"
                            rows={4}
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>

                    {userRole === 'admin' && (
                        <div>
                            <label className="block text-sm font-medium mb-2">Manage Lecturers</label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto border p-2 rounded">
                                {lecturers.map(lecturer => (
                                    <div
                                        key={lecturer.id}
                                        onClick={() => {
                                            const ids = formData.lecturerIds;
                                            setFormData({
                                                ...formData,
                                                lecturerIds: ids.includes(lecturer.id)
                                                    ? ids.filter(id => id !== lecturer.id)
                                                    : [...ids, lecturer.id]
                                            });
                                        }}
                                        className={`p-2 rounded border cursor-pointer flex items-center gap-2 ${formData.lecturerIds.includes(lecturer.id)
                                            ? 'bg-orange-50 border-orange-200'
                                            : 'hover:bg-gray-50'
                                            }`}
                                    >
                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${formData.lecturerIds.includes(lecturer.id) ? 'bg-orange-500 text-white' : 'bg-gray-200'
                                            }`}>
                                            {lecturer.name.charAt(0)}
                                        </div>
                                        <span className="text-sm truncate">{lecturer.name}</span>
                                        {formData.lecturerIds.includes(lecturer.id) && <Check className="w-3 h-3 text-orange-500 ml-auto" />}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="flex gap-2 pt-4">
                        <button type="submit" disabled={loading} className="btn btn-primary flex-1">
                            {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                        <button type="button" onClick={onClose} className="btn btn-secondary flex-1">Cancel</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
