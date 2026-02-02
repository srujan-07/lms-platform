import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth/rbac';
import { requireRole } from '@/lib/auth/rbac';
import { BookOpen, Upload, FileText, LogOut, Plus, Users, TrendingUp } from 'lucide-react';
import { getCoursesByLecturer } from '@/lib/actions/courses';
import Link from 'next/link';
import { RoleBadge } from '@/components/ui/RoleBadge';
import { DashboardStats } from '@/components/dashboard/DashboardStats';
import { CourseCard } from '@/components/dashboard/CourseCard';
import { ActivityFeed } from '@/components/dashboard/ActivityFeed';

export default async function LecturerDashboard() {
    const user = await requireRole(['lecturer', 'admin']);

    // Get lecturer's courses
    const { data: courses } = await getCoursesByLecturer(user.id);

    // Calculate stats
    const totalCourses = courses?.length || 0;
    const totalStudents = 0; // TODO: Calculate total enrolled students
    const totalMaterials = 0; // TODO: Calculate total materials

    // Mock recent activity
    const recentActivities = (courses || []).slice(0, 3).map((course: any, index) => ({
        id: `activity-${index}`,
        icon: BookOpen,
        title: `Course: ${course.title}`,
        description: 'Updated course materials',
        timestamp: new Date(Date.now() - index * 7200000),
        colorScheme: 'lecturer' as const,
    }));

    const signOutUrl = '/api/auth/signout';

    return (
        <div className="min-h-screen bg-gradient-to-br from-lecturer-50 via-white to-orange-50">
            {/* Navigation */}
            <nav className="bg-white shadow-sm border-b sticky top-0 z-10">
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
                {/* Header with CTA */}
                <div className="mb-8 flex justify-between items-start">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">
                            Welcome, {user.name}! 🎓
                        </h2>
                        <p className="text-gray-600">
                            Manage your courses and upload learning materials
                        </p>
                    </div>
                    <Link
                        href="/lecturer/courses/new"
                        className="btn btn-primary px-6 py-3 flex items-center gap-2 shadow-lg hover:shadow-xl transition-shadow"
                    >
                        <Plus className="w-5 h-5" />
                        Create Course
                    </Link>
                </div>

                {/* Stats Grid */}
                <div className="grid md:grid-cols-4 gap-6 mb-8">
                    <DashboardStats
                        icon={BookOpen}
                        value={totalCourses}
                        label="My Courses"
                        colorScheme="lecturer"
                    />
                    <DashboardStats
                        icon={Users}
                        value={totalStudents}
                        label="Total Students"
                        colorScheme="primary"
                    />
                    <DashboardStats
                        icon={FileText}
                        value={totalMaterials}
                        label="Materials Uploaded"
                        colorScheme="success"
                    />
                    <DashboardStats
                        icon={TrendingUp}
                        value="0%"
                        label="Engagement Rate"
                        colorScheme="warning"
                    />
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Main Content - Courses */}
                    <div className="lg:col-span-2">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-bold">My Courses</h3>
                            {totalCourses > 0 && (
                                <div className="text-sm text-gray-500">
                                    {totalCourses} {totalCourses === 1 ? 'course' : 'courses'}
                                </div>
                            )}
                        </div>

                        {!courses || courses.length === 0 ? (
                            <div className="card p-12 text-center">
                                <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                <h4 className="text-lg font-semibold text-gray-900 mb-2">
                                    No Courses Yet
                                </h4>
                                <p className="text-gray-600 mb-4">
                                    Create your first course to start uploading learning materials.
                                </p>
                                <Link
                                    href="/lecturer/courses/new"
                                    className="btn btn-primary px-6 py-2 inline-flex items-center gap-2"
                                >
                                    <Plus className="w-4 h-4" />
                                    Create Course
                                </Link>
                            </div>
                        ) : (
                            <div className="grid md:grid-cols-2 gap-6">
                                {courses.map((course: any) => (
                                    <CourseCard
                                        key={course.id}
                                        id={course.id}
                                        title={course.title}
                                        description={course.description}
                                        href={`/lecturer/courses/${course.id}`}
                                        role="lecturer"
                                        metadata={{
                                            enrollmentCount: 0, // TODO: Get real enrollment count
                                            materialCount: 0, // TODO: Get real material count
                                        }}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        <h3 className="text-xl font-bold mb-4">Recent Activity</h3>
                        <ActivityFeed activities={recentActivities} maxItems={5} />

                        {/* Quick Actions */}
                        <div className="mt-6">
                            <h3 className="text-lg font-semibold mb-3">Quick Actions</h3>
                            <div className="space-y-2">
                                <Link
                                    href="/lecturer/courses/new"
                                    className="block p-3 rounded-lg bg-white border hover:border-lecturer-300 hover:shadow-sm transition-all"
                                >
                                    <div className="flex items-center gap-2">
                                        <Plus className="w-4 h-4 text-lecturer-600" />
                                        <span className="text-sm font-medium">Create New Course</span>
                                    </div>
                                </Link>
                                <Link
                                    href="/lecturer/dashboard"
                                    className="block p-3 rounded-lg bg-white border hover:border-lecturer-300 hover:shadow-sm transition-all"
                                >
                                    <div className="flex items-center gap-2">
                                        <BookOpen className="w-4 h-4 text-lecturer-600" />
                                        <span className="text-sm font-medium">View All Courses</span>
                                    </div>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
