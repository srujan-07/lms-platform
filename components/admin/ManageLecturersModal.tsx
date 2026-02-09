'use client';

import { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { RoleBadge } from '@/components/ui/RoleBadge';
import { UserPlus, X, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

interface Lecturer {
    id: string;
    name: string;
    email: string;
    role: 'lecturer' | 'admin';
}

interface AssignedLecturer {
    lecturer_id: string;
    created_at: string;
    user: {
        id: string;
        name: string;
        email: string;
        role: 'lecturer' | 'admin';
    };
}

interface ManageLecturersModalProps {
    isOpen: boolean;
    onClose: () => void;
    courseId: string;
    courseTitle: string;
    onUpdate?: () => void;
}

export function ManageLecturersModal({
    isOpen,
    onClose,
    courseId,
    courseTitle,
    onUpdate,
}: ManageLecturersModalProps) {
    const [assignedLecturers, setAssignedLecturers] = useState<AssignedLecturer[]>([]);
    const [availableLecturers, setAvailableLecturers] = useState<Lecturer[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    useEffect(() => {
        if (isOpen) {
            fetchData();
        }
    }, [isOpen, courseId]);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Fetch assigned lecturers
            const assignedRes = await fetch(`/api/admin/courses/${courseId}/lecturers`);
            const assignedData = await assignedRes.json();

            // Fetch all lecturers
            const allRes = await fetch('/api/admin/lecturers');
            const allData = await allRes.json();

            if (assignedData.success) {
                setAssignedLecturers(assignedData.data || []);
            }

            if (allData.success) {
                setAvailableLecturers(allData.data || []);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            showMessage('error', 'Failed to load lecturers');
        } finally {
            setLoading(false);
        }
    };

    const showMessage = (type: 'success' | 'error', text: string) => {
        setMessage({ type, text });
        setTimeout(() => setMessage(null), 3000);
    };

    const handleAddLecturer = async (lecturerId: string) => {
        setActionLoading(lecturerId);
        try {
            const res = await fetch(`/api/admin/courses/${courseId}/lecturers`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ lecturerId }),
            });

            const data = await res.json();

            if (data.success) {
                showMessage('success', 'Lecturer added successfully');
                await fetchData();
                onUpdate?.();
            } else {
                showMessage('error', data.error || 'Failed to add lecturer');
            }
        } catch (error) {
            console.error('Error adding lecturer:', error);
            showMessage('error', 'Failed to add lecturer');
        } finally {
            setActionLoading(null);
        }
    };

    const handleRemoveLecturer = async (lecturerId: string) => {
        if (!confirm('Are you sure you want to remove this lecturer from the course?')) {
            return;
        }

        setActionLoading(lecturerId);
        try {
            const res = await fetch(
                `/api/admin/courses/${courseId}/lecturers?lecturerId=${lecturerId}`,
                { method: 'DELETE' }
            );

            const data = await res.json();

            if (data.success) {
                showMessage('success', 'Lecturer removed successfully');
                await fetchData();
                onUpdate?.();
            } else {
                showMessage('error', data.error || 'Failed to remove lecturer');
            }
        } catch (error) {
            console.error('Error removing lecturer:', error);
            showMessage('error', 'Failed to remove lecturer');
        } finally {
            setActionLoading(null);
        }
    };

    const assignedLecturerIds = assignedLecturers.map((l) => l.lecturer_id);
    const unassignedLecturers = availableLecturers.filter(
        (l) => !assignedLecturerIds.includes(l.id)
    );

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Manage Lecturers" size="lg">
            <div className="space-y-6">
                {/* Course Info */}
                <div className="p-4 bg-brand-light/50 rounded-lg border border-brand-dark/5">
                    <p className="text-sm text-brand-dark/60">Course</p>
                    <p className="font-semibold text-brand-dark">{courseTitle}</p>
                </div>

                {/* Message */}
                {message && (
                    <div
                        className={`flex items-center gap-2 p-3 rounded-lg animate-slide-in ${message.type === 'success'
                                ? 'bg-green-50 text-green-800 border border-green-200'
                                : 'bg-red-50 text-red-800 border border-red-200'
                            }`}
                    >
                        {message.type === 'success' ? (
                            <CheckCircle className="w-5 h-5" />
                        ) : (
                            <AlertCircle className="w-5 h-5" />
                        )}
                        <span className="text-sm font-medium">{message.text}</span>
                    </div>
                )}

                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-8 h-8 text-brand-orange animate-spin" />
                    </div>
                ) : (
                    <>
                        {/* Assigned Lecturers */}
                        <div>
                            <h3 className="text-sm font-semibold text-brand-dark mb-3">
                                Assigned Lecturers ({assignedLecturers.length})
                            </h3>
                            {assignedLecturers.length === 0 ? (
                                <div className="p-6 text-center bg-brand-light/30 rounded-lg border border-brand-dark/5">
                                    <UserPlus className="w-12 h-12 text-brand-dark/20 mx-auto mb-2" />
                                    <p className="text-sm text-brand-dark/60">
                                        No lecturers assigned yet
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {assignedLecturers.map((lecturer) => (
                                        <div
                                            key={lecturer.lecturer_id}
                                            className="flex items-center justify-between p-3 bg-white rounded-lg border border-brand-dark/10 hover:border-brand-orange/30 transition-all"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-brand-orange/10 rounded-full flex items-center justify-center">
                                                    <span className="text-brand-orange font-semibold">
                                                        {lecturer.user.name.charAt(0).toUpperCase()}
                                                    </span>
                                                </div>
                                                <div>
                                                    <p className="font-medium text-brand-dark">
                                                        {lecturer.user.name}
                                                    </p>
                                                    <p className="text-xs text-brand-dark/60">
                                                        {lecturer.user.email}
                                                    </p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleRemoveLecturer(lecturer.lecturer_id)}
                                                disabled={actionLoading === lecturer.lecturer_id}
                                                className="p-2 hover:bg-red-50 rounded-lg transition-colors group disabled:opacity-50"
                                                title="Remove lecturer"
                                            >
                                                {actionLoading === lecturer.lecturer_id ? (
                                                    <Loader2 className="w-4 h-4 text-red-500 animate-spin" />
                                                ) : (
                                                    <X className="w-4 h-4 text-brand-dark/40 group-hover:text-red-500 transition-colors" />
                                                )}
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Available Lecturers */}
                        <div>
                            <h3 className="text-sm font-semibold text-brand-dark mb-3">
                                Available Lecturers ({unassignedLecturers.length})
                            </h3>
                            {unassignedLecturers.length === 0 ? (
                                <div className="p-6 text-center bg-brand-light/30 rounded-lg border border-brand-dark/5">
                                    <p className="text-sm text-brand-dark/60">
                                        All lecturers are already assigned
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-2 max-h-64 overflow-y-auto">
                                    {unassignedLecturers.map((lecturer) => (
                                        <div
                                            key={lecturer.id}
                                            className="flex items-center justify-between p-3 bg-white rounded-lg border border-brand-dark/10 hover:border-brand-orange/30 transition-all"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-brand-light rounded-full flex items-center justify-center border border-brand-dark/10">
                                                    <span className="text-brand-dark font-semibold">
                                                        {lecturer.name.charAt(0).toUpperCase()}
                                                    </span>
                                                </div>
                                                <div>
                                                    <p className="font-medium text-brand-dark">
                                                        {lecturer.name}
                                                    </p>
                                                    <p className="text-xs text-brand-dark/60">
                                                        {lecturer.email}
                                                    </p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleAddLecturer(lecturer.id)}
                                                disabled={actionLoading === lecturer.id}
                                                className="btn btn-primary px-3 py-1.5 text-sm disabled:opacity-50"
                                            >
                                                {actionLoading === lecturer.id ? (
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                ) : (
                                                    'Add'
                                                )}
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </>
                )}

                {/* Footer */}
                <div className="flex justify-end pt-4 border-t border-brand-dark/10">
                    <button onClick={onClose} className="btn btn-secondary px-6 py-2">
                        Done
                    </button>
                </div>
            </div>
        </Modal>
    );
}
