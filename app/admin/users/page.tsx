'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Users, Search, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { RoleBadge } from '@/components/ui/RoleBadge';

interface User {
    id: string;
    name: string;
    email: string;
    role: 'student' | 'lecturer' | 'admin';
    created_at: string;
}

export default function AdminUsersPage() {
    const router = useRouter();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await fetch('/api/admin/users');
            const data = await response.json();

            if (data.success) {
                setUsers(data.data || []);
            } else {
                console.error('Failed to fetch users:', data.error);
            }
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRoleUpdate = async (userId: string, newRole: 'student' | 'lecturer' | 'admin') => {
        setUpdatingUserId(userId);
        try {
            const response = await fetch(`/api/admin/users/${userId}/role`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ role: newRole }),
            });

            const data = await response.json();

            if (data.success) {
                // Update local state
                setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
            } else {
                alert('Failed to update role: ' + data.error);
            }
        } catch (error) {
            console.error('Error updating role:', error);
            alert('Failed to update role');
        } finally {
            setUpdatingUserId(null);
        }
    };

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const roleStats = {
        students: users.filter(u => u.role === 'student').length,
        lecturers: users.filter(u => u.role === 'lecturer').length,
        admins: users.filter(u => u.role === 'admin').length,
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-admin-50 via-white to-purple-50">
            {/* Navigation */}
            <nav className="bg-white shadow-sm border-b sticky top-0 z-10">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <Shield className="w-6 h-6 text-admin-600" />
                            <h1 className="text-xl font-bold">User Management</h1>
                        </div>
                        <Link href="/admin/dashboard" className="btn btn-secondary px-4 py-2">
                            ← Back to Dashboard
                        </Link>
                    </div>
                </div>
            </nav>

            <main className="container mx-auto px-4 py-8">
                {/* Stats */}
                <div className="grid md:grid-cols-3 gap-6 mb-8">
                    <div className="card p-6">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-student-100 rounded-lg flex items-center justify-center">
                                <Users className="w-6 h-6 text-student-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{roleStats.students}</p>
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
                                <p className="text-2xl font-bold">{roleStats.lecturers}</p>
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
                                <p className="text-2xl font-bold">{roleStats.admins}</p>
                                <p className="text-sm text-gray-600">Admins</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Search */}
                <div className="card p-6 mb-6">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search users by name or email..."
                            className="input w-full pl-10"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* Users Table */}
                <div className="card overflow-hidden">
                    {loading ? (
                        <div className="p-12 text-center">
                            <Loader2 className="w-8 h-8 text-gray-400 animate-spin mx-auto mb-4" />
                            <p className="text-gray-600">Loading users...</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
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
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Joined
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredUsers.map((user) => (
                                        <tr key={user.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {user.name}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {user.email}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <RoleBadge role={user.role} />
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {new Date(user.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <select
                                                    value={user.role}
                                                    onChange={(e) => handleRoleUpdate(user.id, e.target.value as any)}
                                                    disabled={updatingUserId === user.id}
                                                    className="input text-sm py-1"
                                                >
                                                    <option value="student">Student</option>
                                                    <option value="lecturer">Lecturer</option>
                                                    <option value="admin">Admin</option>
                                                </select>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {!loading && filteredUsers.length === 0 && (
                        <div className="p-12 text-center">
                            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-600">No users found</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
