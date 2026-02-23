'use client';

import { useState, useEffect } from 'react';
import { redirect, useRouter } from 'next/navigation';
import { createOrUpdateStudentProfile } from '@/lib/actions/student-profiles';
import Link from 'next/link';
import { ArrowLeft, Save, Loader } from 'lucide-react';

interface ProfileFormData {
    roll_no: string;
    school: string;
    branch: string;
    section: string;
    name: string;
}

export default function StudentProfilePage() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [profile, setProfile] = useState<any>(null);
    const [formData, setFormData] = useState<ProfileFormData>({
        roll_no: '',
        school: '',
        branch: '',
        section: '',
        name: '',
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        const loadProfile = async () => {
            try {
                const res = await fetch('/api/auth/user');
                if (!res.ok) {
                    redirect('/auth/signin');
                    return;
                }

                const data = await res.json();
                setUser(data.user);
                setProfile(data.profile || null);

                setFormData({
                    roll_no: data.profile?.roll_no || '',
                    school: data.profile?.school || '',
                    branch: data.profile?.branch || '',
                    section: data.profile?.section || '',
                    name: data.user?.name || '',
                });
            } catch (err) {
                setError('Failed to load profile data');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        loadProfile();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
        setSuccess(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSaving(true);

        try {
            // Validate required fields
            if (!formData.roll_no || !formData.school || !formData.branch || !formData.section) {
                setError('All fields are required');
                setSaving(false);
                return;
            }

            // send name along with other profile fields
            const result = await createOrUpdateStudentProfile(formData as any);

            if (result.success) {
                setProfile(result.data);
                setSuccess(true);

                // Redirect to dashboard after 1 second
                setTimeout(() => {
                    router.push('/dashboard');
                }, 1000);
            } else {
                setError(result.error || 'Failed to save profile');
            }
        } catch (err) {
            setError('Failed to save profile');
            console.error(err);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-brand-light flex items-center justify-center">
                <div className="text-center">
                    <Loader className="w-8 h-8 animate-spin text-brand-orange mx-auto mb-4" />
                    <p className="text-brand-dark/70">Loading profile...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-brand-light">
            {/* Navigation */}
            <nav className="bg-brand-light/80 backdrop-blur-md shadow-sm border-b border-brand-dark/5 sticky top-0 z-10">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center gap-4">
                        <Link
                            href="/dashboard"
                            className="flex items-center gap-2 text-brand-dark/70 hover:text-brand-dark transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            Back to Dashboard
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="container mx-auto px-4 py-8">
                <div className="max-w-2xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-brand-dark mb-2">Student Profile</h1>
                        <p className="text-brand-dark/70">
                            Update your profile information
                        </p>
                    </div>

                    {/* Alert Messages */}
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-red-700 font-medium">{error}</p>
                        </div>
                    )}

                    {success && (
                        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                            <p className="text-green-700 font-medium">Profile updated successfully! Redirecting to dashboard...</p>
                        </div>
                    )}

                    {/* Profile Form */}
                    <div className="bg-white rounded-lg shadow-md p-6 md:p-8">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Read-only Fields */}
                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-brand-dark mb-2">
                                        Name
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder="Your full name"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg text-brand-dark placeholder-gray-400 focus:outline-none focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20"
                                    />
                                    <p className="text-xs text-brand-dark/50 mt-1">You can update your display name</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-brand-dark mb-2">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        value={user?.email || ''}
                                        disabled
                                        className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-brand-dark/70 cursor-not-allowed"
                                    />
                                    <p className="text-xs text-brand-dark/50 mt-1">Read-only</p>
                                </div>
                            </div>

                            <hr className="my-6" />

                            {/* Editable Fields */}
                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label htmlFor="roll_no" className="block text-sm font-medium text-brand-dark mb-2">
                                        Roll Number *
                                    </label>
                                    <input
                                        type="text"
                                        id="roll_no"
                                        name="roll_no"
                                        value={formData.roll_no}
                                        onChange={handleChange}
                                        placeholder="Enter your roll number"
                                        pattern="[0-9]*"
                                        inputMode="numeric"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg text-brand-dark placeholder-gray-400 focus:outline-none focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20"
                                        required
                                    />
                                    <p className="text-xs text-brand-dark/50 mt-1">Must be unique — one roll number per account</p>
                                </div>

                                <div>
                                    <label htmlFor="school" className="block text-sm font-medium text-brand-dark mb-2">
                                        School/Institution *
                                    </label>
                                    <input
                                        type="text"
                                        id="school"
                                        name="school"
                                        value={formData.school}
                                        onChange={handleChange}
                                        placeholder="Enter your school name"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg text-brand-dark placeholder-gray-400 focus:outline-none focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20"
                                        required
                                    />
                                </div>

                                <div>
                                    <label htmlFor="branch" className="block text-sm font-medium text-brand-dark mb-2">
                                        Branch *
                                    </label>
                                    <input
                                        type="text"
                                        id="branch"
                                        name="branch"
                                        value={formData.branch}
                                        onChange={handleChange}
                                        placeholder="e.g., CSE, ECE, Mechanical"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg text-brand-dark placeholder-gray-400 focus:outline-none focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20"
                                        required
                                    />
                                </div>

                                <div>
                                    <label htmlFor="section" className="block text-sm font-medium text-brand-dark mb-2">
                                        Section *
                                    </label>
                                    <input
                                        type="text"
                                        id="section"
                                        name="section"
                                        value={formData.section}
                                        onChange={handleChange}
                                        placeholder="e.g., A, B, C"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg text-brand-dark placeholder-gray-400 focus:outline-none focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Submit Button */}
                            <div className="flex gap-4 pt-6">
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="flex items-center gap-2 px-6 py-2 bg-brand-orange text-white rounded-lg font-medium hover:bg-brand-orange/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    {saving ? (
                                        <>
                                            <Loader className="w-4 h-4 animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="w-4 h-4" />
                                            Save Profile
                                        </>
                                    )}
                                </button>

                                <Link
                                    href="/dashboard"
                                    className="px-6 py-2 bg-gray-200 text-brand-dark rounded-lg font-medium hover:bg-gray-300 transition-colors"
                                >
                                    Cancel
                                </Link>
                            </div>
                        </form>
                    </div>

                    {/* Profile Info Banner */}
                    {profile && profile.onboarding_completed_at && (
                        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <p className="text-blue-700 text-sm">
                                Profile completed on{' '}
                                {new Date(profile.onboarding_completed_at).toLocaleDateString()}
                            </p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
