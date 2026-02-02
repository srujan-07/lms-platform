import Link from 'next/link';
import { ArrowRight, Shield, Brain, BookOpen } from 'lucide-react';

export default function HomePage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-lecturer-50">
            <div className="container mx-auto px-4 py-16">
                {/* Header */}
                <header className="flex justify-between items-center mb-16">
                    <div className="flex items-center gap-2">
                        <Shield className="w-8 h-8 text-primary-600" />
                        <h1 className="text-2xl font-bold text-gray-900">AI & Cybersecurity LMS</h1>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link
                            href="/handler/sign-in"
                            className="btn btn-secondary px-6 py-2"
                        >
                            Sign In
                        </Link>
                        <Link
                            href="/handler/sign-up"
                            className="btn btn-primary px-6 py-2"
                        >
                            Sign Up
                        </Link>
                    </div>
                </header>

                {/* Hero Section */}
                <div className="max-w-4xl mx-auto text-center mb-20">
                    <h2 className="text-5xl font-bold text-gray-900 mb-6 animate-fade-in">
                        Master AI & Cybersecurity
                    </h2>
                    <p className="text-xl text-gray-600 mb-8 animate-slide-in">
                        A comprehensive learning platform designed for students, lecturers, and administrators
                        to collaborate on cutting-edge AI and cybersecurity education.
                    </p>
                    <Link
                        href="/handler/sign-up"
                        className="btn btn-primary px-8 py-3 text-lg inline-flex items-center gap-2"
                    >
                        Get Started
                        <ArrowRight className="w-5 h-5" />
                    </Link>
                </div>

                {/* Features */}
                <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    <div className="card p-6 hover:shadow-lg transition-shadow">
                        <div className="w-12 h-12 bg-student-light rounded-lg flex items-center justify-center mb-4">
                            <BookOpen className="w-6 h-6 text-student-dark" />
                        </div>
                        <h3 className="text-xl font-semibold mb-2">For Students</h3>
                        <p className="text-gray-600">
                            Access course materials, download lecture notes, and track your learning progress
                            in AI and cybersecurity courses.
                        </p>
                    </div>

                    <div className="card p-6 hover:shadow-lg transition-shadow">
                        <div className="w-12 h-12 bg-lecturer-light rounded-lg flex items-center justify-center mb-4">
                            <Brain className="w-6 h-6 text-lecturer-dark" />
                        </div>
                        <h3 className="text-xl font-semibold mb-2">For Lecturers</h3>
                        <p className="text-gray-600">
                            Upload and manage course content, organize materials, and provide resources
                            to your students efficiently.
                        </p>
                    </div>

                    <div className="card p-6 hover:shadow-lg transition-shadow">
                        <div className="w-12 h-12 bg-admin-light rounded-lg flex items-center justify-center mb-4">
                            <Shield className="w-6 h-6 text-admin-dark" />
                        </div>
                        <h3 className="text-xl font-semibold mb-2">For Administrators</h3>
                        <p className="text-gray-600">
                            Manage users, courses, and enrollments with comprehensive audit logging
                            and security controls.
                        </p>
                    </div>
                </div>

                {/* Security Notice */}
                <div className="max-w-4xl mx-auto mt-16 card p-6 bg-primary-50 border-primary-200">
                    <div className="flex items-start gap-3">
                        <Shield className="w-6 h-6 text-primary-600 flex-shrink-0 mt-1" />
                        <div>
                            <h4 className="font-semibold text-gray-900 mb-2">Enterprise-Grade Security</h4>
                            <p className="text-gray-700 text-sm">
                                Built with role-based access control, row-level security policies, and comprehensive
                                audit logging to ensure your educational content remains secure.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
