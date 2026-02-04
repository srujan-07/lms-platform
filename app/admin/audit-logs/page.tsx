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
        if (action.includes('created')) return 'bg-brand-light text-brand-dark border border-brand-dark/10';
        if (action.includes('updated')) return 'bg-brand-orange/10 text-brand-orange border border-brand-orange/20';
        if (action.includes('deleted')) return 'bg-red-50 text-red-600 border border-red-200';
        if (action.includes('downloaded')) return 'bg-brand-beige text-brand-dark border border-brand-dark/5';
        return 'bg-brand-light text-brand-dark/70 border border-brand-dark/5';
    };

    return (
        <div className="min-h-screen bg-brand-light">
            <nav className="bg-brand-light/80 backdrop-blur-md shadow-sm border-b border-brand-dark/5 sticky top-0 z-10 transition-all">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <Activity className="w-6 h-6 text-brand-orange" />
                            <h1 className="text-xl font-bold text-brand-dark">Audit Logs</h1>
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
                            <p className="text-sm text-brand-dark/70">Total Events</p>
                            <p className="text-2xl font-bold text-brand-dark">{total}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-brand-dark/70">Page {currentPage} of {totalPages}</p>
                        </div>
                    </div>
                </div>

                <div className="card overflow-hidden">
                    {loading ? (
                        <div className="p-12 text-center">
                            <Loader2 className="w-8 h-8 text-brand-orange animate-spin mx-auto mb-4" />
                            <p className="text-brand-dark/60">Loading audit logs...</p>
                        </div>
                    ) : logs.length === 0 ? (
                        <div className="p-12 text-center">
                            <Activity className="w-16 h-16 text-brand-dark/20 mx-auto mb-4" />
                            <p className="text-brand-dark/60">No audit logs found</p>
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-brand-light/50 border-b border-brand-dark/5">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-brand-dark/60 uppercase">User</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-brand-dark/60 uppercase">Action</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-brand-dark/60 uppercase">Resource</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-brand-dark/60 uppercase">Time</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-brand-dark/5">
                                        {logs.map((log) => (
                                            <tr key={log.id} className="hover:bg-brand-light/30 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div>
                                                        <p className="text-sm font-medium text-brand-dark">{log.user?.name || 'System'}</p>
                                                        <p className="text-sm text-brand-dark/70">{log.user?.email}</p>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getActionBadgeColor(log.action)}`}>
                                                        {log.action}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-brand-dark">
                                                    {log.resource_type ? (
                                                        <div>
                                                            <p className="font-medium">{log.resource_type}</p>
                                                            {log.metadata?.title && (
                                                                <p className="text-brand-dark/60 text-xs">{log.metadata.title}</p>
                                                            )}
                                                        </div>
                                                    ) : '-'}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-brand-dark/70">
                                                    {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            <div className="px-6 py-4 border-t border-brand-dark/5 bg-brand-light/20 flex items-center justify-between">
                                <button
                                    onClick={() => setOffset(Math.max(0, offset - limit))}
                                    disabled={offset === 0}
                                    className="btn btn-secondary px-4 py-2 flex items-center gap-2 disabled:opacity-50"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                    Previous
                                </button>
                                <span className="text-sm text-brand-dark/70">
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
