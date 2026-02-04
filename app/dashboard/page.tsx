import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth/rbac';
import { BookOpen, Upload, Users, LogOut, Clock, TrendingUp, FileText } from 'lucide-react';
import { getEnrolledCourses } from '@/lib/actions/courses';
import Link from 'next/link';
import { RoleBadge } from '@/components/ui/RoleBadge';
import { DashboardStats } from '@/components/dashboard/DashboardStats';
import { CourseCard } from '@/components/dashboard/CourseCard';
import { ActivityFeed } from '@/components/dashboard/ActivityFeed';
import { formatDistanceToNow } from 'date-fns';

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

    // Calculate stats
    const totalCourses = courses.length;
    const completedCourses = 0; // TODO: Implement completion tracking
    const inProgressCourses = totalCourses - completedCourses;

    // Mock recent activity (TODO: Implement real activity tracking)
    const recentActivities = courses.slice(0, 3).map((course: any, index) => ({
        id: `activity-${index}`,
        icon: BookOpen,
        title: `Accessed ${course.title}`,
        description: 'Viewed lecture materials',
        timestamp: new Date(Date.now() - index * 3600000), // Mock timestamps
        colorScheme: 'student' as const,
    }));

    const signOutUrl = '/api/auth/signout';

    return (
        <div className="min-h-screen bg-brand-light">
            {/* Navigation */}
            <nav className="bg-brand-light/80 backdrop-blur-md shadow-sm border-b border-brand-dark/5 sticky top-0 z-10 transition-all">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <BookOpen className="w-6 h-6 text-brand-orange" />
                            <h1 className="text-xl font-bold text-brand-dark">Student Dashboard</h1>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="text-right">
                                <p className="text-sm font-medium text-brand-dark">{user.name}</p>
                                <RoleBadge role={user.role} />
                            </div>
                            <a
                                href={signOutUrl}
                                className="btn btn-secondary px-4 py-2 flex items-center gap-2 hover:bg-red-50 hover:text-red-600 transition-colors"
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
                {/* Welcome Section */}
                <div className="mb-8">
                    <h2 className="text-3xl font-bold text-brand-dark mb-2">
                        Welcome back, {user.name}! 👋
                    </h2>
                    <p className="text-brand-dark/70">
                        Continue your learning journey and explore your courses
                    </p>
                </div>

                {/* Stats Grid */}
                <div className="grid md:grid-cols-3 gap-6 mb-8">
                    <DashboardStats
                        icon={BookOpen}
                        value={totalCourses}
                        label="Enrolled Courses"
                        colorScheme="student"
                    />
                    <DashboardStats
                        icon={TrendingUp}
                        value={inProgressCourses}
                        label="In Progress"
                        colorScheme="primary"
                    />
                    <DashboardStats
                        icon={FileText}
                        value={completedCourses}
                        label="Completed"
                        colorScheme="success"
                    />
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Main Content - Courses */}
                    <div className="lg:col-span-2">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-bold text-brand-dark">My Courses</h3>
                            {courses.length > 0 && (
                                <div className="text-sm text-brand-dark/60">
                                    {totalCourses} {totalCourses === 1 ? 'course' : 'courses'}
                                </div>
                            )}
                        </div>

                        {courses.length === 0 ? (
                            <div className="card p-12 text-center bg-brand-beige/50 border-brand-dark/5">
                                <BookOpen className="w-16 h-16 text-brand-dark/20 mx-auto mb-4" />
                                <h4 className="text-lg font-semibold text-brand-dark mb-2">
                                    No Courses Yet
                                </h4>
                                <p className="text-brand-dark/60 mb-6">
                                    You haven&apos;t enrolled in any courses yet. Use an access code to enroll in a course.
                                </p>
                                <Link
                                    href="/dashboard/enroll"
                                    className="btn btn-primary px-6 py-3 inline-flex items-center gap-2"
                                >
                                    <BookOpen className="w-4 h-4" />
                                    Enroll in Course
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
                                        href={`/dashboard/courses/${course.id}`}
                                        role="student"
                                        metadata={{
                                            lecturerName: course.lecturer?.name || 'Unknown',
                                            progress: Math.floor(Math.random() * 100), // TODO: Real progress
                                            lastAccessed: formatDistanceToNow(new Date(course.created_at || Date.now()), { addSuffix: true }),
                                        }}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Sidebar - Recent Activity */}
                    <div className="lg:col-span-1">
                        <h3 className="text-xl font-bold mb-4 text-brand-dark">Recent Activity</h3>
                        {recentActivities.length > 0 ? (
                            <ActivityFeed activities={recentActivities} maxItems={5} />
                        ) : (
                            <div className="card p-8 text-center bg-brand-beige/50">
                                <Clock className="w-12 h-12 text-brand-dark/20 mx-auto mb-3" />
                                <p className="text-sm text-brand-dark/50">
                                    No recent activity
                                </p>
                            </div>
                        )}

                        {/* Quick Links */}
                        <div className="mt-6">
                            <h3 className="text-lg font-semibold mb-3 text-brand-dark">Quick Links</h3>
                            <div className="space-y-2">
                                <Link
                                    href="/dashboard/enroll"
                                    className="block p-3 rounded-lg bg-white border border-brand-dark/5 hover:border-brand-orange/30 hover:shadow-md transition-all group"
                                >
                                    <div className="flex items-center gap-2">
                                        <BookOpen className="w-4 h-4 text-brand-dark group-hover:text-brand-orange transition-colors" />
                                        <span className="text-sm font-medium text-brand-dark">Enroll in Course</span>
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
