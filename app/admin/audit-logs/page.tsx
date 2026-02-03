'use client';

import { useState, useEffect } from 'react';
import { Activity, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';

interface AuditLog {
    id: string;
    action: string;
    resource_type: string | null;
    resource_id: string | null;
    metadata: any;
    created_at: string;
    user?: {
        id: string;
        name: string;
        email: string;
    };
}

export default function AdminAuditLogsPage() {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const [offset, setOffset] = useState(0);
    const limit = 50;

    useEffect(() => {
        fetchLogs();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [offset]);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const response = await fetch(`/api/admin/audit-logs?limit=${limit}&offset=${offset}`);
            const data = await response.json();

            if (data.success) {
                setLogs(data.data || []);
                setTotal(data.total || 0);
            }
        } catch (error) {
            console.error('Error fetching audit logs:', error);
        } finally {
            setLoading(false);
        }
    };

    const totalPages = Math.ceil(total / limit);
    const currentPage = Math.floor(offset / limit) + 1;

    const getActionBadgeColor = (action: string) => {
        if (action.includes('created')) return 'bg-green-100 text-green-800';
        if (action.includes('updated')) return 'bg-blue-100 text-blue-800';
        if (action.includes('deleted')) return 'bg-red-100 text-red-800';
        if (action.includes('downloaded')) return 'bg-purple-100 text-purple-800';
        return 'bg-gray-100 text-gray-800';
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-admin-50 via-white to-purple-50">
            <nav className="bg-white shadow-sm border-b sticky top-0 z-10">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <Activity className="w-6 h-6 text-admin-600" />
                            <h1 className="text-xl font-bold">Audit Logs</h1>
                        </div>
                        <Link href="/admin/dashboard" className="btn btn-secondary px-4 py-2">
                            ← Back to Dashboard
                        </Link>
                    </div>
                </div>
            </nav>

            <main className="container mx-auto px-4 py-8">
                <div className="card mb-6 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Total Events</p>
                            <p className="text-2xl font-bold">{total}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-gray-600">Page {currentPage} of {totalPages}</p>
                        </div>
                    </div>
                </div>

                <div className="card overflow-hidden">
                    {loading ? (
                        <div className="p-12 text-center">
                            <Loader2 className="w-8 h-8 text-gray-400 animate-spin mx-auto mb-4" />
                            <p className="text-gray-600">Loading audit logs...</p>
                        </div>
                    ) : logs.length === 0 ? (
                        <div className="p-12 text-center">
                            <Activity className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-600">No audit logs found</p>
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 border-b">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Resource</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {logs.map((log) => (
                                            <tr key={log.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4">
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-900">{log.user?.name || 'System'}</p>
                                                        <p className="text-sm text-gray-500">{log.user?.email}</p>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getActionBadgeColor(log.action)}`}>
                                                        {log.action}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-900">
                                                    {log.resource_type ? (
                                                        <div>
                                                            <p className="font-medium">{log.resource_type}</p>
                                                            {log.metadata?.title && (
                                                                <p className="text-gray-500 text-xs">{log.metadata.title}</p>
                                                            )}
                                                        </div>
                                                    ) : '-'}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-500">
                                                    {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            <div className="px-6 py-4 border-t bg-gray-50 flex items-center justify-between">
                                <button
                                    onClick={() => setOffset(Math.max(0, offset - limit))}
                                    disabled={offset === 0}
                                    className="btn btn-secondary px-4 py-2 flex items-center gap-2 disabled:opacity-50"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                    Previous
                                </button>
                                <span className="text-sm text-gray-600">
                                    Showing {offset + 1} to {Math.min(offset + limit, total)} of {total}
                                </span>
                                <button
                                    onClick={() => setOffset(offset + limit)}
                                    disabled={offset + limit >= total}
                                    className="btn btn-secondary px-4 py-2 flex items-center gap-2 disabled:opacity-50"
                                >
                                    Next
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </main>
        </div>
    );
}
