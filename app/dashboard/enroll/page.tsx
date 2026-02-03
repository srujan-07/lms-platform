'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { BookOpen, Key, CheckCircle, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function EnrollPage() {
    const router = useRouter();
    const [accessCode, setAccessCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [enrolledCourse, setEnrolledCourse] = useState<any>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess(false);

        try {
            const response = await fetch('/api/enrollments', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ accessCode: accessCode.trim().toUpperCase() }),
            });

            const result = await response.json();

            if (!result.success) {
                setError(result.error || 'Failed to enroll in course');
                setLoading(false);
                return;
            }

            // Success
            setSuccess(true);
            setEnrolledCourse(result.data?.course);
            setAccessCode('');

            // Redirect to dashboard after 2 seconds
            setTimeout(() => {
                router.push('/dashboard');
                router.refresh();
            }, 2000);
        } catch (err) {
            setError('An error occurred. Please try again.');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-student-50 via-white to-primary-50">
            {/* Navigation */}
            <nav className="bg-white shadow-sm border-b">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <BookOpen className="w-6 h-6 text-student-600" />
                            <h1 className="text-xl font-bold">Enroll in Course</h1>
                        </div>
                        <Link href="/dashboard" className="btn btn-secondary px-4 py-2">
                            Back to Dashboard
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="container mx-auto px-4 py-12">
                <div className="max-w-md mx-auto">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-student-100 rounded-full mb-4">
                            <Key className="w-8 h-8 text-student-600" />
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">
                            Join a Course
                        </h2>
                        <p className="text-gray-600">
                            Enter the access code provided by your instructor
                        </p>
                    </div>

                    {/* Enrollment Form */}
                    <div className="card p-8">
                        {!success ? (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label htmlFor="accessCode" className="block text-sm font-medium text-gray-700 mb-2">
                                        Access Code <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        id="accessCode"
                                        required
                                        maxLength={20}
                                        value={accessCode}
                                        onChange={(e) => setAccessCode(e.target.value.toUpperCase())}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-student-500 focus:border-transparent transition-all text-center text-lg font-mono tracking-wider"
                                        placeholder="XXXX-XXXX"
                                        disabled={loading}
                                    />
                                    <p className="text-xs text-gray-500 mt-2">
                                        Access codes are case-insensitive
                                    </p>
                                </div>

                                {/* Error Message */}
                                {error && (
                                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                                        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                                        <p className="text-sm text-red-600">{error}</p>
                                    </div>
                                )}

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    disabled={loading || !accessCode.trim()}
                                    className="w-full btn btn-primary py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? (
                                        <div className="flex items-center justify-center gap-2">
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            Enrolling...
                                        </div>
                                    ) : (
                                        'Enroll in Course'
                                    )}
                                </button>
                            </form>
                        ) : (
                            <div className="text-center py-4">
                                <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                                <h3 className="text-xl font-bold text-gray-900 mb-2">
                                    Successfully Enrolled!
                                </h3>
                                {enrolledCourse && (
                                    <p className="text-gray-600 mb-4">
                                        You&apos;ve been enrolled in <strong>{enrolledCourse.title}</strong>
                                    </p>
                                )}
                                <p className="text-sm text-gray-500">
                                    Redirecting to dashboard...
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Help Text */}
                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-600">
                            Don&apos;t have an access code?{' '}
                            <span className="text-gray-800 font-medium">
                                Contact your instructor or administrator
                            </span>
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
}
