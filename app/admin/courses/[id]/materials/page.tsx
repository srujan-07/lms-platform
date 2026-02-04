'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { FileText, Upload, Trash2, Download, Loader2, ArrowLeft, Plus } from 'lucide-react';
import Link from 'next/link';

interface Material {
    id: string;
    title: string;
    description: string | null;
    file_path: string;
    file_size: number | null;
    created_at: string;
}

export default function CourseMaterialsPage() {
    const params = useParams();
    const router = useRouter();
    const courseId = params.id as string;

    const [materials, setMaterials] = useState<Material[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [deleting, setDeleting] = useState<string | null>(null);
    const [error, setError] = useState('');
    const [showUploadForm, setShowUploadForm] = useState(false);

    const [uploadForm, setUploadForm] = useState({
        title: '',
        description: '',
        file: null as File | null,
    });

    useEffect(() => {
        fetchMaterials();
    }, [courseId]);

    const fetchMaterials = async () => {
        try {
            const response = await fetch(`/api/courses/${courseId}/materials`);
            const data = await response.json();

            if (data.success) {
                setMaterials(data.data || []);
            }
        } catch (error) {
            console.error('Error fetching materials:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.type !== 'application/pdf') {
                setError('Only PDF files are allowed');
                return;
            }
            if (file.size > 10 * 1024 * 1024) {
                setError('File size must be less than 10MB');
                return;
            }
            setUploadForm({ ...uploadForm, file });
            setError('');
        }
    };

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!uploadForm.file || !uploadForm.title) return;

        setUploading(true);
        setError('');

        try {
            const formData = new FormData();
            formData.append('file', uploadForm.file);
            formData.append('title', uploadForm.title);
            if (uploadForm.description) {
                formData.append('description', uploadForm.description);
            }

            const response = await fetch(`/api/courses/${courseId}/materials`, {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (data.success) {
                setMaterials([data.data, ...materials]);
                setUploadForm({ title: '', description: '', file: null });
                setShowUploadForm(false);
            } else {
                setError(data.error || 'Failed to upload material');
            }
        } catch (err) {
            setError('An error occurred while uploading');
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (materialId: string, title: string) => {
        if (!confirm(`Are you sure you want to delete "${title}"?`)) return;

        setDeleting(materialId);
        try {
            const response = await fetch(`/api/lecture-notes/${materialId}`, {
                method: 'DELETE',
            });

            const data = await response.json();

            if (data.success) {
                setMaterials(materials.filter(m => m.id !== materialId));
            } else {
                alert('Failed to delete material: ' + data.error);
            }
        } catch (error) {
            console.error('Error deleting material:', error);
            alert('Failed to delete material');
        } finally {
            setDeleting(null);
        }
    };

    const formatFileSize = (bytes: number | null) => {
        if (!bytes) return 'Unknown';
        const mb = bytes / (1024 * 1024);
        return `${mb.toFixed(2)} MB`;
    };

    return (
        <div className="min-h-screen bg-brand-light">
            <nav className="bg-brand-light/80 backdrop-blur-md shadow-sm border-b border-brand-dark/5 sticky top-0 z-10 transition-all">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <FileText className="w-6 h-6 text-brand-orange" />
                            <h1 className="text-xl font-bold text-brand-dark">Course Materials</h1>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setShowUploadForm(!showUploadForm)}
                                className="btn btn-primary px-4 py-2 flex items-center gap-2"
                            >
                                <Plus className="w-4 h-4" />
                                Upload Material
                            </button>
                            <Link
                                href={`/admin/courses`}
                                className="btn btn-secondary px-4 py-2 flex items-center gap-2"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Back
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="container mx-auto px-4 py-8 max-w-4xl">
                {/* Upload Form */}
                {showUploadForm && (
                    <div className="card p-6 mb-6 animate-slide-in">
                        <h2 className="text-lg font-bold mb-4 text-brand-dark">Upload New Material</h2>
                        <form onSubmit={handleUpload} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-brand-dark/80 mb-2">
                                    Title *
                                </label>
                                <input
                                    type="text"
                                    required
                                    className="input w-full"
                                    value={uploadForm.title}
                                    onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
                                    placeholder="e.g., Lecture 1: Introduction"
                                    maxLength={200}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-brand-dark/80 mb-2">
                                    Description
                                </label>
                                <textarea
                                    className="input w-full"
                                    rows={3}
                                    value={uploadForm.description}
                                    onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
                                    placeholder="Optional description..."
                                    maxLength={500}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-brand-dark/80 mb-2">
                                    PDF File * (Max 10MB)
                                </label>
                                <input
                                    type="file"
                                    accept="application/pdf"
                                    required
                                    onChange={handleFileChange}
                                    className="block w-full text-sm text-brand-dark/60 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-brand-orange/10 file:text-brand-orange hover:file:bg-brand-orange/20 cursor-pointer"
                                />
                                {uploadForm.file && (
                                    <p className="text-sm text-brand-dark/60 mt-2">
                                        Selected: {uploadForm.file.name} ({formatFileSize(uploadForm.file.size)})
                                    </p>
                                )}
                            </div>

                            {error && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                                    {error}
                                </div>
                            )}

                            <div className="flex gap-3">
                                <button
                                    type="submit"
                                    disabled={uploading || !uploadForm.file || !uploadForm.title}
                                    className="btn btn-primary px-6 py-2 flex items-center gap-2"
                                >
                                    {uploading ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Uploading...
                                        </>
                                    ) : (
                                        <>
                                            <Upload className="w-4 h-4" />
                                            Upload
                                        </>
                                    )}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowUploadForm(false);
                                        setUploadForm({ title: '', description: '', file: null });
                                        setError('');
                                    }}
                                    className="btn btn-secondary px-6 py-2"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Materials List */}
                <div className="card overflow-hidden">
                    {loading ? (
                        <div className="p-12 text-center">
                            <Loader2 className="w-8 h-8 text-brand-orange animate-spin mx-auto mb-4" />
                            <p className="text-brand-dark/60">Loading materials...</p>
                        </div>
                    ) : materials.length === 0 ? (
                        <div className="p-12 text-center">
                            <FileText className="w-16 h-16 text-brand-dark/20 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-brand-dark mb-2">No Materials Yet</h3>
                            <p className="text-brand-dark/60 mb-4">Upload your first course material to get started.</p>
                            <button
                                onClick={() => setShowUploadForm(true)}
                                className="btn btn-primary px-6 py-2 inline-flex items-center gap-2"
                            >
                                <Plus className="w-4 h-4" />
                                Upload Material
                            </button>
                        </div>
                    ) : (
                        <div className="divide-y divide-brand-dark/5">
                            {materials.map((material) => (
                                <div key={material.id} className="p-6 hover:bg-brand-light/30 transition-colors">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <FileText className="w-5 h-5 text-brand-orange" />
                                                <h3 className="text-lg font-semibold text-brand-dark">
                                                    {material.title}
                                                </h3>
                                            </div>
                                            {material.description && (
                                                <p className="text-sm text-brand-dark/70 mb-2">{material.description}</p>
                                            )}
                                            <div className="flex items-center gap-4 text-xs text-brand-dark/50">
                                                <span>{formatFileSize(material.file_size)}</span>
                                                <span>•</span>
                                                <span>{new Date(material.created_at).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 ml-4">
                                            <button
                                                onClick={() => handleDelete(material.id, material.title)}
                                                disabled={deleting === material.id}
                                                className="text-red-500 hover:text-red-600 p-2 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
                                                title="Delete material"
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
        </div>
    );
}
