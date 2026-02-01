'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield } from 'lucide-react';
import Link from 'next/link';

type UserRole = 'student' | 'lecturer' | 'admin';

export default function SignUpPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        name: '',
        role: 'student' as UserRole,
        accessCode: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // Validate access code for privileged roles
            if (formData.role === 'lecturer' || formData.role === 'admin') {
                const response = await fetch('/api/auth/validate-role', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        role: formData.role,
                        accessCode: formData.accessCode,
                    }),
                });

                if (!response.ok) {
                    const data = await response.json();
                    setError(data.error || 'Invalid access code for this role');
                    setLoading(false);
                    return;
                }
            }

            // Proceed with StackAuth sign-up
            const params = new URLSearchParams({
                role: formData.role,
                ...(formData.accessCode && { accessCode: formData.accessCode }),
            });

            router.push(`/handler/sign-up?${params.toString()}`);
        } catch (err) {
            setError('An error occurred during sign-up');
            setLoading(false);
        }
    };

    const needsAccessCode = formData.role === 'lecturer' || formData.role === 'admin';

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-lecturer-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="flex items-center justify-center gap-2 mb-4">
                        <Shield className="w-10 h-10 text-primary-600" />
                        <h1 className="text-3xl font-bold text-gray-900">AI & Cybersecurity LMS</h1>
                    </div>
                    <p className="text-gray-600">Create your account to get started</p>
                </div>

                {/* Sign-up Form */}
                <div className="card p-8">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Name */}
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                                Full Name
                            </label>
                            <input
                                id="name"
                                type="text"
                                required
                                className="input w-full"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="John Doe"
                            />
                        </div>

                        {/* Email */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                Email Address
                            </label>
                            <input
                                id="email"
                                type="email"
                                required
                                className="input w-full"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                placeholder="you@example.com"
                            />
                        </div>

                        {/* Password */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                                Password
                            </label>
                            <input
                                id="password"
                                type="password"
                                required
                                className="input w-full"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                placeholder="••••••••"
                                minLength={8}
                            />
                            <p className="text-xs text-gray-500 mt-1">Minimum 8 characters</p>
                        </div>

                        {/* Role Dropdown */}
                        <div>
                            <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
                                Select Your Role
                            </label>
                            <select
                                id="role"
                                className="input w-full"
                                value={formData.role}
                                onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole, accessCode: '' })}
                            >
                                <option value="student">Student</option>
                                <option value="lecturer">Lecturer</option>
                                <option value="admin">Administrator</option>
                            </select>
                        </div>

                        {/* Access Code (for Lecturer/Admin) */}
                        {needsAccessCode && (
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                <label htmlFor="accessCode" className="block text-sm font-medium text-gray-700 mb-2">
                                    Access Code for {formData.role === 'lecturer' ? 'Lecturer' : 'Administrator'}
                                </label>
                                <input
                                    id="accessCode"
                                    type="password"
                                    required
                                    className="input w-full"
                                    value={formData.accessCode}
                                    onChange={(e) => setFormData({ ...formData, accessCode: e.target.value })}
                                    placeholder="Enter access code"
                                />
                                <p className="text-xs text-gray-600 mt-2">
                                    Contact your system administrator to obtain the access code.
                                </p>
                            </div>
                        )}

                        {/* Error Message */}
                        {error && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                                {error}
                            </div>
                        )}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn btn-primary w-full py-3 text-base"
                        >
                            {loading ? 'Creating Account...' : 'Create Account'}
                        </button>
                    </form>

                    {/* Sign In Link */}
                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-600">
                            Already have an account?{' '}
                            <Link href="/handler/sign-in" className="text-primary-600 hover:text-primary-700 font-medium">
                                Sign In
                            </Link>
                        </p>
                    </div>
                </div>

                {/* Back to Home */}
                <div className="text-center mt-6">
                    <Link href="/" className="text-sm text-gray-600 hover:text-gray-900">
                        ← Back to Home
                    </Link>
                </div>
            </div>
        </div>
    );
}
