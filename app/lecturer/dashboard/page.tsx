import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth/rbac';
import { requireRole } from '@/lib/auth/rbac';
import { BookOpen, Upload, FileText, LogOut, Plus } from 'lucide-react';
import { getCoursesByLecturer } from '@/lib/actions/courses';
import Link from 'next/link';
import { RoleBadge } from '@/components/ui/RoleBadge';
import { stackServerApp } from '@/lib/auth/stackauth';

export default async function LecturerDashboard() {
    const user = await requireRole(['lecturer', 'admin']);

    // Get lecturer's courses
    const { data: courses } = await getCoursesByLecturer(user.id);

    const signOutUrl = stackServerApp.urls.signOut;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Navigation */}
            <nav className="bg-white shadow-sm border-b">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <Upload className="w-6 h-6 text-lecturer-600" />
                            <h1 className="text-xl font-bold">Lecturer Dashboard</h1>
                        </div>
                        <div className="flex items-center gap-4">
                            {user.role === 'admin' && (
                                <Link href="/admin/dashboard" className="btn btn-secondary px-4 py-2">
                                    Admin Dashboard
                                </Link>
                            )}
                            <div className="text-right">
                                <p className="text-sm font-medium">{user.name}</p>
                                <RoleBadge role={user.role} />
                            </div>
                            <a
                                href={signOutUrl}
                                className="btn btn-secondary px-4 py-2 flex items-center gap-2"
                            >
                                <LogOut className="w-4 h-4" />
                                Sign Out
                            </a>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="container mx-auto px-4 py-8">
                <div className="mb-8 flex justify-between items-center">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome, {user.name}!</h2>
                        <p className="text-gray-600">Manage your courses and upload learning materials</p>
                    </div>
                    <Link
                        href="/lecturer/courses/new"
                        className="btn btn-primary px-6 py-3 flex items-center gap-2"
                    >
                        <Plus className="w-5 h-5" />
                        Create Course
                    </Link>
                </div>

                {/* Stats */}
                <div className="grid md:grid-cols-3 gap-6 mb-8">
                    <div className="card p-6">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-lecturer-100 rounded-lg flex items-center justify-center">
                                <BookOpen className="w-6 h-6 text-lecturer-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{courses?.length || 0}</p>
                                <p className="text-sm text-gray-600">My Courses</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* My Courses */}
                <div>
                    <h3 className="text-2xl font-bold mb-4">My Courses</h3>
                    {!courses || courses.length === 0 ? (
                        <div className="card p-12 text-center">
                            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <h4 className="text-lg font-semibold text-gray-900 mb-2">No Courses Yet</h4>
                            <p className="text-gray-600 mb-4">
                                Create your first course to start uploading learning materials.
                            </p>
                            <Link href="/lecturer/courses/new" className="btn btn-primary px-6 py-2 inline-flex items-center gap-2">
                                <Plus className="w-4 h-4" />
                                Create Course
                            </Link>
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {courses.map((course: any) => (
                                <Link
                                    key={course.id}
                                    href={`/lecturer/courses/${course.id}`}
                                    className="card p-6 hover:shadow-lg transition-all hover:-translate-y-1"
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <h4 className="text-lg font-semibold flex-1">{course.title}</h4>
                                        <FileText className="w-5 h-5 text-gray-400" />
                                    </div>
                                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                                        {course.description || 'No description available'}
                                    </p>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-500">Manage materials →</span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
