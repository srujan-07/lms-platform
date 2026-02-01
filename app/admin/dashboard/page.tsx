import { redirect } from 'next/navigation';
import { requireRole } from '@/lib/auth/rbac';
import { Shield, Users, BookOpen, FileText, LogOut, Activity } from 'lucide-react';
import { getAllUsers } from '@/lib/actions/users';
import { getCourses } from '@/lib/actions/courses';
import Link from 'next/link';
import { RoleBadge } from '@/components/ui/RoleBadge';
import { stackServerApp } from '@/lib/auth/stackauth';

export default async function AdminDashboard() {
    const user = await requireRole('admin');

    // Get all users and courses
    const [usersResult, coursesResult] = await Promise.all([
        getAllUsers(),
        getCourses(),
    ]);

    const users = usersResult.data || [];
    const courses = coursesResult.data || [];

    const studentCount = users.filter(u => u.role === 'student').length;
    const lecturerCount = users.filter(u => u.role === 'lecturer').length;
    const adminCount = users.filter(u => u.role === 'admin').length;

    const signOutUrl = stackServerApp.urls.signOut;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Navigation */}
            <nav className="bg-white shadow-sm border-b">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <Shield className="w-6 h-6 text-admin-600" />
                            <h1 className="text-xl font-bold">Admin Dashboard</h1>
                        </div>
                        <div className="flex items-center gap-4">
                            <Link href="/lecturer/dashboard" className="btn btn-secondary px-4 py-2">
                                Lecturer View
                            </Link>
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
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">System Overview</h2>
                    <p className="text-gray-600">Manage users, courses, enrollments, and system settings</p>
                </div>

                {/* Stats Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="card p-6">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-student-100 rounded-lg flex items-center justify-center">
                                <Users className="w-6 h-6 text-student-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{studentCount}</p>
                                <p className="text-sm text-gray-600">Students</p>
                            </div>
                        </div>
                    </div>

                    <div className="card p-6">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-lecturer-100 rounded-lg flex items-center justify-center">
                                <Users className="w-6 h-6 text-lecturer-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{lecturerCount}</p>
                                <p className="text-sm text-gray-600">Lecturers</p>
                            </div>
                        </div>
                    </div>

                    <div className="card p-6">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-admin-100 rounded-lg flex items-center justify-center">
                                <Shield className="w-6 h-6 text-admin-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{adminCount}</p>
                                <p className="text-sm text-gray-600">Admins</p>
                            </div>
                        </div>
                    </div>

                    <div className="card p-6">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                                <BookOpen className="w-6 h-6 text-primary-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{courses.length}</p>
                                <p className="text-sm text-gray-600">Total Courses</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    <Link
                        href="/admin/users"
                        className="card p-6 hover:shadow-lg transition-all hover:-translate-y-1"
                    >
                        <div className="flex items-center gap-3 mb-3">
                            <Users className="w-8 h-8 text-primary-600" />
                            <h3 className="text-lg font-semibold">Manage Users</h3>
                        </div>
                        <p className="text-sm text-gray-600">
                            View all users, update roles, and manage permissions
                        </p>
                    </Link>

                    <Link
                        href="/admin/courses"
                        className="card p-6 hover:shadow-lg transition-all hover:-translate-y-1"
                    >
                        <div className="flex items-center gap-3 mb-3">
                            <BookOpen className="w-8 h-8 text-primary-600" />
                            <h3 className="text-lg font-semibold">Manage Courses</h3>
                        </div>
                        <p className="text-sm text-gray-600">
                            Create, edit, and delete courses across the platform
                        </p>
                    </Link>

                    <Link
                        href="/admin/enrollments"
                        className="card p-6 hover:shadow-lg transition-all hover:-translate-y-1"
                    >
                        <div className="flex items-center gap-3 mb-3">
                            <FileText className="w-8 h-8 text-primary-600" />
                            <h3 className="text-lg font-semibold">Manage Enrollments</h3>
                        </div>
                        <p className="text-sm text-gray-600">
                            Enroll students in courses and manage access
                        </p>
                    </Link>

                    <Link
                        href="/admin/audit-logs"
                        className="card p-6 hover:shadow-lg transition-all hover:-translate-y-1"
                    >
                        <div className="flex items-center gap-3 mb-3">
                            <Activity className="w-8 h-8 text-primary-600" />
                            <h3 className="text-lg font-semibold">Audit Logs</h3>
                        </div>
                        <p className="text-sm text-gray-600">
                            View system activity and security audit trails
                        </p>
                    </Link>
                </div>

                {/* Recent Users */}
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-2xl font-bold">Recent Users</h3>
                        <Link href="/admin/users" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                            View All →
                        </Link>
                    </div>
                    <div className="card overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Name
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Email
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Role
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {users.slice(0, 5).map((u: any) => (
                                    <tr key={u.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {u.name}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {u.email}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <RoleBadge role={u.role} />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
}
