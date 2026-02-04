import Link from 'next/link';
import { ArrowRight, Shield, Brain, BookOpen } from 'lucide-react';

export default function HomePage() {
    return (
        <div className="min-h-screen bg-brand-light">
            <div className="container mx-auto px-4 py-16">
                {/* Header */}
                <header className="flex justify-between items-center mb-16">
                    <div className="flex items-center gap-2">
                        <Shield className="w-8 h-8 text-brand-orange" />
                        <h1 className="text-2xl font-bold text-brand-dark">AI & Cybersecurity LMS</h1>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link
                            href="/handler/sign-in"
                            className="btn btn-secondary"
                        >
                            Sign In
                        </Link>
                        <Link
                            href="/handler/sign-up"
                            className="btn btn-primary"
                        >
                            Sign Up
                        </Link>
                    </div>
                </header>

                {/* Hero Section */}
                <div className="max-w-4xl mx-auto text-center mb-20">
                    <h2 className="text-5xl font-bold text-brand-dark mb-6 animate-fade-in">
                        Master AI & Cybersecurity
                    </h2>
                    <p className="text-xl text-brand-dark/70 mb-8 animate-slide-in">
                        A comprehensive learning platform designed for students, lecturers, and administrators
                        to collaborate on cutting-edge AI and cybersecurity education.
                    </p>
                    <Link
                        href="/handler/sign-up"
                        className="btn btn-primary px-8 py-3 text-lg inline-flex items-center gap-2 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all"
                    >
                        Get Started
                        <ArrowRight className="w-5 h-5" />
                    </Link>
                </div>

                {/* Features */}
                <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    <div className="card hover:border-brand-orange/20 hover:shadow-xl transition-all duration-300">
                        <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center mb-4 shadow-sm">
                            <BookOpen className="w-6 h-6 text-brand-orange" />
                        </div>
                        <h3 className="text-xl font-semibold mb-2 text-brand-dark">For Students</h3>
                        <p className="text-brand-dark/70">
                            Access course materials, download lecture notes, and track your learning progress
                            in AI and cybersecurity courses.
                        </p>
                    </div>

                    <div className="card hover:border-brand-orange/20 hover:shadow-xl transition-all duration-300">
                        <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center mb-4 shadow-sm">
                            <Brain className="w-6 h-6 text-brand-orange" />
                        </div>
                        <h3 className="text-xl font-semibold mb-2 text-brand-dark">For Lecturers</h3>
                        <p className="text-brand-dark/70">
                            Upload and manage course content, organize materials, and provide resources
                            to your students efficiently.
                        </p>
                    </div>

                    <div className="card hover:border-brand-orange/20 hover:shadow-xl transition-all duration-300">
                        <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center mb-4 shadow-sm">
                            <Shield className="w-6 h-6 text-brand-orange" />
                        </div>
                        <h3 className="text-xl font-semibold mb-2 text-brand-dark">For Administrators</h3>
                        <p className="text-brand-dark/70">
                            Manage users, courses, and enrollments with comprehensive audit logging
                            and security controls.
                        </p>
                    </div>
                </div>

                {/* Security Notice */}
                <div className="max-w-4xl mx-auto mt-16 card bg-white/50 border border-brand-dark/5">
                    <div className="flex items-start gap-3">
                        <Shield className="w-6 h-6 text-brand-orange flex-shrink-0 mt-1" />
                        <div>
                            <h4 className="font-semibold text-brand-dark mb-2">Enterprise-Grade Security</h4>
                            <p className="text-brand-dark/70 text-sm">
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
