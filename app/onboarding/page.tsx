'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { BookOpen, ArrowRight } from 'lucide-react';

export default function OnboardingPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        class: '',
        section: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await fetch('/api/onboarding', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const result = await response.json();

            if (!result.success) {
                setError(result.error || 'Failed to complete onboarding');
                setLoading(false);
                return;
            }

            // Redirect to dashboard on success
            router.push('/dashboard');
            router.refresh();
        } catch (err) {
            setError('An error occurred. Please try again.');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-student-50 via-white to-primary-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-student-100 rounded-full mb-4">
                        <BookOpen className="w-8 h-8 text-student-600" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Welcome to LMS! 👋
                    </h1>
                    <p className="text-gray-600">
                        Let&apos;s get you set up. Please provide some basic information to continue.
                    </p>
                </div>

                {/* Onboarding Form */}
                <div className="card p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Class Input */}
                        <div>
                            <label htmlFor="class" className="block text-sm font-medium text-gray-700 mb-2">
                                Class <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                id="class"
                                required
                                maxLength={50}
                                value={formData.class}
                                onChange={(e) => setFormData({ ...formData, class: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-student-500 focus:border-transparent transition-all"
                                placeholder="e.g., 10th Grade, B.Tech CSE"
                                disabled={loading}
                            />
                        </div>

                        {/* Section Input */}
                        <div>
                            <label htmlFor="section" className="block text-sm font-medium text-gray-700 mb-2">
                                Section <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                id="section"
                                required
                                maxLength={50}
                                value={formData.section}
                                onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-student-500 focus:border-transparent transition-all"
                                placeholder="e.g., A, B, Section 1"
                                disabled={loading}
                            />
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                                <p className="text-sm text-red-600">{error}</p>
                            </div>
                        )}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading || !formData.class || !formData.section}
                            className="w-full btn btn-primary py-3 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                <>
                                    Continue to Dashboard
                                    <ArrowRight className="w-5 h-5" />
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {/* Footer Note */}
                <p className="text-center text-sm text-gray-500 mt-6">
                    This information helps us organize your courses and materials.
                </p>
            </div>
        </div>
    );
}
