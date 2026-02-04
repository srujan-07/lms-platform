import { redirect } from 'next/navigation';
import { requireRole } from '@/lib/auth/rbac';
import { Shield, Users, BookOpen, FileText, LogOut, Activity, TrendingUp, UserPlus, GraduationCap } from 'lucide-react';
import { getAllUsers } from '@/lib/actions/users';
import { getCourses } from '@/lib/actions/courses';
import { getGlobalAnalytics, getAllStudentProfilesWithDetails, getEnrollmentStatistics } from '@/lib/actions/analytics';
import Link from 'next/link';
import { RoleBadge } from '@/components/ui/RoleBadge';
import { DashboardStats } from '@/components/dashboard/DashboardStats';
import { ActivityFeed } from '@/components/dashboard/ActivityFeed';

export default async function AdminDashboard() {
    const user = await requireRole('admin');

    // Get analytics data
    const [usersResult, coursesResult, analyticsResult, studentsResult, enrollmentStatsResult] = await Promise.all([
        getAllUsers(),
        getCourses(),
        getGlobalAnalytics(),
        getAllStudentProfilesWithDetails(),
        getEnrollmentStatistics(),
    ]);

    const users = (usersResult.data || []) as any[];
    const courses = coursesResult.data || [];
    const analytics = analyticsResult.data;
    const studentProfiles = (studentsResult.data || []) as any[];
    const enrollmentStats = (enrollmentStatsResult.data || []) as any[];

    const studentCount = users.filter(u => u.role === 'student').length;
    const lecturerCount = users.filter(u => u.role === 'lecturer').length;
    const adminCount = users.filter(u => u.role === 'admin').length;

    // Mock recent activity
    const recentActivities = users.slice(0, 5).map((u: any, index) => ({
        id: `activity-${index}`,
        icon: UserPlus,
        title: `New user: ${u.name}`,
        description: `Registered as ${u.role}`,
        timestamp: new Date(u.created_at || Date.now()),
        colorScheme: 'admin' as const,
    }));

    const signOutUrl = '/api/auth/signout';

    return (
        <div className="min-h-screen bg-brand-light">
            {/* Navigation */}
            <nav className="bg-brand-light/80 backdrop-blur-md shadow-sm border-b border-brand-dark/5 sticky top-0 z-10 transition-all">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <Shield className="w-6 h-6 text-brand-orange" />
                            <h1 className="text-xl font-bold text-brand-dark">Admin Dashboard</h1>
                        </div>
                        <div className="flex items-center gap-4">
                            <Link href="/lecturer/dashboard" className="btn btn-secondary px-4 py-2">
                                Lecturer View
                            </Link>
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
                <div className="mb-8">
                    <h2 className="text-3xl font-bold text-brand-dark mb-2">
                        System Overview 🛡️
                    </h2>
                    <p className="text-brand-dark/70">
                        Manage users, courses, enrollments, and system settings
                    </p>
                </div>

                {/* Stats Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <DashboardStats
                        icon={Users}
                        value={analytics?.totalStudents || studentCount}
                        label="Students"
                        colorScheme="student"
                    />
                    <DashboardStats
                        icon={BookOpen}
                        value={analytics?.totalCourses || courses.length}
                        label="Total Courses"
                        colorScheme="primary"
                    />
                    <DashboardStats
                        icon={TrendingUp}
                        value={analytics?.totalEnrollments || 0}
                        label="Total Enrollments"
                        colorScheme="lecturer"
                    />
                    <DashboardStats
                        icon={FileText}
                        value={analytics?.totalMaterials || 0}
                        label="Course Materials"
                        colorScheme="admin"
                    />
                </div>

                {/* Quick Actions */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    <Link
                        href="/admin/users"
                        className="card p-6 hover:shadow-lg transition-all hover:shadow-brand-orange/10 hover:-translate-y-1 group"
                    >
                        <div className="flex items-center gap-3 mb-3">
                            <Users className="w-8 h-8 text-brand-orange group-hover:scale-110 transition-transform" />
                            <h3 className="text-lg font-semibold text-brand-dark">Manage Users</h3>
                        </div>
                        <p className="text-sm text-brand-dark/70">
                            View all users, update roles, and manage permissions
                        </p>
                    </Link>

                    <Link
                        href="/admin/courses"
                        className="card p-6 hover:shadow-lg transition-all hover:shadow-brand-orange/10 hover:-translate-y-1 group"
                    >
                        <div className="flex items-center gap-3 mb-3">
                            <BookOpen className="w-8 h-8 text-brand-orange group-hover:scale-110 transition-transform" />
                            <h3 className="text-lg font-semibold text-brand-dark">Manage Courses</h3>
                        </div>
                        <p className="text-sm text-brand-dark/70">
                            Create, edit, and delete courses across the platform
                        </p>
                    </Link>

                    <Link
                        href="/admin/enrollments"
                        className="card p-6 hover:shadow-lg transition-all hover:shadow-brand-orange/10 hover:-translate-y-1 group"
                    >
                        <div className="flex items-center gap-3 mb-3">
                            <FileText className="w-8 h-8 text-brand-orange group-hover:scale-110 transition-transform" />
                            <h3 className="text-lg font-semibold text-brand-dark">Manage Enrollments</h3>
                        </div>
                        <p className="text-sm text-brand-dark/70">
                            Enroll students in courses and manage access
                        </p>
                    </Link>

                    <Link
                        href="/admin/audit-logs"
                        className="card p-6 hover:shadow-lg transition-all hover:shadow-brand-orange/10 hover:-translate-y-1 group"
                    >
                        <div className="flex items-center gap-3 mb-3">
                            <Activity className="w-8 h-8 text-brand-orange group-hover:scale-110 transition-transform" />
                            <h3 className="text-lg font-semibold text-brand-dark">Audit Logs</h3>
                        </div>
                        <p className="text-sm text-brand-dark/70">
                            View system activity and security audit trails
                        </p>
                    </Link>
                </div>

                {/* Content Grid */}
                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Main Content - Enrollment Statistics */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Enrollment Stats */}
                        <div>
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-2xl font-bold text-brand-dark">Enrollment Statistics</h3>
                            </div>
                            <div className="card overflow-hidden">
                                {enrollmentStats.length === 0 ? (
                                    <div className="p-8 text-center text-brand-dark/50">
                                        No courses available
                                    </div>
                                ) : (
                                    <table className="w-full">
                                        <thead className="bg-brand-light/50 border-b border-brand-dark/5">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-brand-dark/60 uppercase tracking-wider">
                                                    Course
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-brand-dark/60 uppercase tracking-wider">
                                                    Lecturer
                                                </th>
                                                <th className="px-6 py-3 text-center text-xs font-medium text-brand-dark/60 uppercase tracking-wider">
                                                    Enrollments
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-brand-dark/5">
                                            {enrollmentStats.map((stat: any) => (
                                                <tr key={stat.id} className="hover:bg-brand-light/30 transition-colors">
                                                    <td className="px-6 py-4 text-sm font-medium text-brand-dark">
                                                        {stat.title}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-brand-dark/70">
                                                        {stat.lecturer?.name || 'Unassigned'}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-center">
                                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-brand-orange/10 text-brand-orange">
                                                            {stat.enrollment_count}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        </div>

                        {/* Student Profiles */}
                        <div>
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-2xl font-bold text-brand-dark">Student Onboarding</h3>
                            </div>
                            <div className="card overflow-hidden">
                                {studentProfiles.length === 0 ? (
                                    <div className="p-8 text-center text-brand-dark/50">
                                        No student profiles yet
                                    </div>
                                ) : (
                                    <table className="w-full">
                                        <thead className="bg-brand-light/50 border-b border-brand-dark/5">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-brand-dark/60 uppercase tracking-wider">
                                                    Student
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-brand-dark/60 uppercase tracking-wider">
                                                    Class
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-brand-dark/60 uppercase tracking-wider">
                                                    Section
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-brand-dark/60 uppercase tracking-wider">
                                                    Onboarded
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-brand-dark/5">
                                            {studentProfiles.slice(0, 10).map((profile: any) => (
                                                <tr key={profile.id} className="hover:bg-brand-light/30 transition-colors">
                                                    <td className="px-6 py-4 text-sm font-medium text-brand-dark">
                                                        {profile.user?.name || 'Unknown'}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-brand-dark/70">
                                                        {profile.class}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-brand-dark/70">
                                                        {profile.section}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-brand-dark/70">
                                                        {profile.onboarding_completed_at
                                                            ? new Date(profile.onboarding_completed_at).toLocaleDateString()
                                                            : 'Pending'}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar - Activity Feed */}
                    <div className="lg:col-span-1">
                        <h3 className="text-xl font-bold mb-4 text-brand-dark">System Activity</h3>
                        <ActivityFeed activities={recentActivities} maxItems={8} />
                    </div>
                </div>
            </main>
        </div>
    );
}
