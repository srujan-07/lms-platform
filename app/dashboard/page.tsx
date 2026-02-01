import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth/rbac';
import { BookOpen, Upload, Users, LogOut } from 'lucide-react';
import { getEnrolledCourses } from '@/lib/actions/courses';
import Link from 'next/link';
import { RoleBadge } from '@/components/ui/RoleBadge';
import { stackServerApp } from '@/lib/auth/stackauth';

export default async function StudentDashboard() {
    const user = await getCurrentUser();

    if (!user) {
        redirect('/auth/signin');
    }

    // Redirect non-students to their appropriate dashboards
    if (user.role === 'admin') {
        redirect('/admin/dashboard');
    }
    if (user.role === 'lecturer') {
        redirect('/lecturer/dashboard');
    }

    // Get enrolled courses
    const { data: enrollments } = await getEnrolledCourses(user.id);
    const courses = (enrollments as any[])?.map(e => e.course).filter(Boolean) || [];

    const signOutUrl = '/api/auth/signout';

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Navigation */}
            <nav className="bg-white shadow-sm border-b">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <BookOpen className="w-6 h-6 text-primary-600" />
                            <h1 className="text-xl font-bold">Student Dashboard</h1>
                        </div>
                        <div className="flex items-center gap-4">
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
                <div className="mb-8">
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, {user.name}!</h2>
                    <p className="text-gray-600">Access your enrolled courses and learning materials</p>
                </div>

                {/* Stats */}
                <div className="grid md:grid-cols-3 gap-6 mb-8">
                    <div className="card p-6">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                                <BookOpen className="w-6 h-6 text-primary-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{courses.length}</p>
                                <p className="text-sm text-gray-600">Enrolled Courses</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Enrolled Courses */}
                <div>
                    <h3 className="text-2xl font-bold mb-4">My Courses</h3>
                    {courses.length === 0 ? (
                        <div className="card p-12 text-center">
                            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <h4 className="text-lg font-semibold text-gray-900 mb-2">No Courses Yet</h4>
                            <p className="text-gray-600">
                                You haven&apos;t been enrolled in any courses yet. Contact your administrator for enrollment.
                            </p>
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {courses.map((course: any) => (
                                <Link
                                    key={course.id}
                                    href={`/dashboard/courses/${course.id}`}
                                    className="card p-6 hover:shadow-lg transition-all hover:-translate-y-1"
                                >
                                    <h4 className="text-lg font-semibold mb-2">{course.title}</h4>
                                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                                        {course.description || 'No description available'}
                                    </p>
                                    <div className="flex items-center gap-2 text-sm text-gray-500">
                                        <Users className="w-4 h-4" />
                                        <span>{course.lecturer?.name || 'Unknown'}</span>
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
