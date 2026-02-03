'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { BookOpen, Loader2, Key, Copy, Check, RefreshCw } from 'lucide-react';
import Link from 'next/link';

export default function NewCoursePage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        accessCode: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [copied, setCopied] = useState(false);
    const [createdCourse, setCreatedCourse] = useState<any>(null);

    const generateAccessCode = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let code = '';
        for (let i = 0; i < 8; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        setFormData({ ...formData, accessCode: code });
    };

    const copyToClipboard = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await fetch('/api/courses', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (data.success) {
                setCreatedCourse(data.data);
                // Don't redirect immediately, show success with access code
            } else {
                setError(data.error || 'Failed to create course');
            }
        } catch (err) {
            setError('An error occurred while creating the course');
        } finally {
            setLoading(false);
        }
    };

    if (createdCourse) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-lecturer-50 via-white to-orange-50 flex items-center justify-center p-4">
                <div className="card p-8 max-w-md w-full text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Check className="w-8 h-8 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        Course Created Successfully!
                    </h2>
                    <p className="text-gray-600 mb-6">
                        {createdCourse.title}
                    </p>

                    <div className="bg-primary-50 border-2 border-primary-200 rounded-lg p-6 mb-6">
                        <div className="flex items-center justify-center gap-2 mb-2">
                            <Key className="w-5 h-5 text-primary-600" />
                            <p className="text-sm font-medium text-gray-700">Access Code</p>
                        </div>
                        <p className="text-3xl font-mono font-bold text-primary-600 mb-3 tracking-wider">
                            {createdCourse.access_code}
                        </p>
                        <button
                            onClick={() => copyToClipboard(createdCourse.access_code)}
                            className="btn btn-secondary px-4 py-2 flex items-center gap-2 mx-auto"
                        >
                            {copied ? (
                                <>
                                    <Check className="w-4 h-4" />
                                    Copied!
                                </>
                            ) : (
                                <>
                                    <Copy className="w-4 h-4" />
                                    Copy Code
                                </>
                            )}
                        </button>
                    </div>

                    <p className="text-sm text-gray-600 mb-6">
                        Share this code with students so they can enroll in your course.
                    </p>

                    <div className="flex gap-3">
                        <Link
                            href={`/lecturer/courses/${createdCourse.id}`}
                            className="btn btn-primary flex-1 py-2"
                        >
                            View Course
                        </Link>
                        <Link
                            href="/lecturer/courses/new"
                            className="btn btn-secondary flex-1 py-2"
                        >
                            Create Another
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-lecturer-50 via-white to-orange-50">
            <nav className="bg-white shadow-sm border-b sticky top-0 z-10">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <BookOpen className="w-6 h-6 text-lecturer-600" />
                            <h1 className="text-xl font-bold">Create New Course</h1>
                        </div>
                        <Link href="/lecturer/dashboard" className="btn btn-secondary px-4 py-2">
                            ← Back to Dashboard
                        </Link>
                    </div>
                </div>
            </nav>

            <main className="container mx-auto px-4 py-8 max-w-2xl">
                <div className="card p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                                Course Title *
                            </label>
                            <input
                                id="title"
                                type="text"
                                required
                                className="input w-full"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                placeholder="e.g., Introduction to Cybersecurity"
                                maxLength={200}
                            />
                        </div>

                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                                Description
                            </label>
                            <textarea
                                id="description"
                                rows={6}
                                className="input w-full"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Provide a brief description of the course..."
                                maxLength={1000}
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                {formData.description.length}/1000 characters
                            </p>
                        </div>

                        <div>
                            <label htmlFor="accessCode" className="block text-sm font-medium text-gray-700 mb-2">
                                Access Code *
                            </label>
                            <div className="flex gap-2">
                                <input
                                    id="accessCode"
                                    type="text"
                                    required
                                    className="input flex-1 font-mono uppercase"
                                    value={formData.accessCode}
                                    onChange={(e) => setFormData({ ...formData, accessCode: e.target.value.toUpperCase() })}
                                    placeholder="Enter or generate code"
                                    maxLength={20}
                                    minLength={4}
                                />
                                <button
                                    type="button"
                                    onClick={generateAccessCode}
                                    className="btn btn-secondary px-4 py-2 flex items-center gap-2"
                                    title="Generate random code"
                                >
                                    <RefreshCw className="w-4 h-4" />
                                    Generate
                                </button>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                                Students will use this code to enroll in your course
                            </p>
                        </div>

                        {error && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                                {error}
                            </div>
                        )}

                        <div className="flex gap-3 pt-4">
                            <button
                                type="submit"
                                disabled={loading || !formData.title || !formData.accessCode}
                                className="btn btn-primary flex-1 py-3 flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Creating...
                                    </>
                                ) : (
                                    'Create Course'
                                )}
                            </button>
                            <Link href="/lecturer/dashboard" className="btn btn-secondary flex-1 py-3 text-center">
                                Cancel
                            </Link>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
}
