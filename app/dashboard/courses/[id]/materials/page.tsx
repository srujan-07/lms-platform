'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { FileText, Download, Loader2, ArrowLeft, Lock } from 'lucide-react';
import Link from 'next/link';

interface Material {
    id: string;
    title: string;
    description: string | null;
    file_size: number | null;
    created_at: string;
}

export default function StudentCourseMaterialsPage() {
    const params = useParams();
    const courseId = params.id as string;

    const [materials, setMaterials] = useState<Material[]>([]);
    const [loading, setLoading] = useState(true);
    const [downloading, setDownloading] = useState<string | null>(null);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchMaterials();
    }, [courseId]);

    const fetchMaterials = async () => {
        try {
            const response = await fetch(`/api/courses/${courseId}/materials`);
            const data = await response.json();

            if (data.success) {
                setMaterials(data.data || []);
            } else {
                setError(data.error || 'Failed to load materials');
            }
        } catch (error) {
            console.error('Error fetching materials:', error);
            setError('An error occurred while loading materials');
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = async (materialId: string, title: string) => {
        setDownloading(materialId);
        try {
            const response = await fetch(`/api/materials/${materialId}/download`);
            const data = await response.json();

            if (data.success && data.data?.signedUrl) {
                // Open signed URL in new tab to download
                window.open(data.data.signedUrl, '_blank');
            } else {
                alert('Failed to download: ' + (data.error || 'Unknown error'));
            }
        } catch (error) {
            console.error('Error downloading material:', error);
            alert('Failed to download material');
        } finally {
            setDownloading(null);
        }
    };

    const formatFileSize = (bytes: number | null) => {
        if (!bytes) return 'Unknown';
        const mb = bytes / (1024 * 1024);
        return `${mb.toFixed(2)} MB`;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-student-50 via-white to-primary-50">
            <nav className="bg-white shadow-sm border-b sticky top-0 z-10">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <FileText className="w-6 h-6 text-student-600" />
                            <h1 className="text-xl font-bold">Course Materials</h1>
                        </div>
                        <Link
                            href="/dashboard"
                            className="btn btn-secondary px-4 py-2 flex items-center gap-2"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to Dashboard
                        </Link>
                    </div>
                </div>
            </nav>

            <main className="container mx-auto px-4 py-8 max-w-4xl">
                <div className="card overflow-hidden">
                    {loading ? (
                        <div className="p-12 text-center">
                            <Loader2 className="w-8 h-8 text-gray-400 animate-spin mx-auto mb-4" />
                            <p className="text-gray-600">Loading materials...</p>
                        </div>
                    ) : error ? (
                        <div className="p-12 text-center">
                            <Lock className="w-16 h-16 text-red-300 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Access Denied</h3>
                            <p className="text-gray-600">{error}</p>
                        </div>
                    ) : materials.length === 0 ? (
                        <div className="p-12 text-center">
                            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Materials Available</h3>
                            <p className="text-gray-600">
                                Your instructor hasn&apos;t uploaded any materials yet.
                            </p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-200">
                            {materials.map((material) => (
                                <div key={material.id} className="p-6 hover:bg-gray-50 transition-colors">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <FileText className="w-5 h-5 text-red-600" />
                                                <h3 className="text-lg font-semibold text-gray-900">
                                                    {material.title}
                                                </h3>
                                            </div>
                                            {material.description && (
                                                <p className="text-sm text-gray-600 mb-2">{material.description}</p>
                                            )}
                                            <div className="flex items-center gap-4 text-xs text-gray-500">
                                                <span>{formatFileSize(material.file_size)}</span>
                                                <span>•</span>
                                                <span>
                                                    Uploaded {new Date(material.created_at).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleDownload(material.id, material.title)}
                                            disabled={downloading === material.id}
                                            className="btn btn-primary px-4 py-2 flex items-center gap-2 ml-4 disabled:opacity-50"
                                        >
                                            {downloading === material.id ? (
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

                {/* Info Box */}
                {!loading && !error && materials.length > 0 && (
                    <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <p className="text-sm text-blue-800">
                            <strong>Note:</strong> Download links are valid for 1 hour. If a link expires, simply click the download button again to generate a new one.
                        </p>
                    </div>
                )}
            </main>
        </div>
    );
}
