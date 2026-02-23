'use client';

import { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';

interface ManageRollRangeModalProps {
    isOpen: boolean;
    onClose: () => void;
    courseId: string;
    courseTitle: string;
    currentRange: {
        start: number | null;
        end: number | null;
    };
    onUpdate: () => void;
}

export function ManageRollRangeModal({
    isOpen,
    onClose,
    courseId,
    courseTitle,
    currentRange,
    onUpdate
}: ManageRollRangeModalProps) {
    const [formData, setFormData] = useState({
        rollNoStart: '',
        rollNoEnd: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            setFormData({
                rollNoStart: currentRange.start?.toString() || '',
                rollNoEnd: currentRange.end?.toString() || ''
            });
            setError('');
        }
    }, [isOpen, currentRange]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const start = formData.rollNoStart === '' ? null : parseInt(formData.rollNoStart, 10);
        const end = formData.rollNoEnd === '' ? null : parseInt(formData.rollNoEnd, 10);

        if (start !== null && isNaN(start)) {
            setError('Start roll number must be a valid number');
            setLoading(false);
            return;
        }
        if (end !== null && isNaN(end)) {
            setError('End roll number must be a valid number');
            setLoading(false);
            return;
        }
        if (start !== null && end !== null && start > end) {
            setError('Start roll number cannot be greater than end roll number');
            setLoading(false);
            return;
        }

        try {
            const response = await fetch(`/api/courses/${courseId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    rollNoStart: start,
                    rollNoEnd: end
                }),
            });

            const data = await response.json();

            if (data.success) {
                onUpdate();
                onClose();
            } else {
                setError(data.error || 'Failed to update roll range');
            }
        } catch (err) {
            setError('An error occurred while updating roll range');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="card max-w-md w-full p-6">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-xl font-bold text-brand-dark">Set Roll Number Range</h2>
                        <p className="text-sm text-brand-dark/60 truncate max-w-[300px]">{courseTitle}</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="rollNoStart" className="block text-sm font-medium text-brand-dark mb-1">
                                Start Roll No
                            </label>
                            <input
                                id="rollNoStart"
                                type="number"
                                className="input w-full"
                                value={formData.rollNoStart}
                                onChange={(e) => setFormData({ ...formData, rollNoStart: e.target.value })}
                                placeholder="Min"
                            />
                        </div>
                        <div>
                            <label htmlFor="rollNoEnd" className="block text-sm font-medium text-brand-dark mb-1">
                                End Roll No
                            </label>
                            <input
                                id="rollNoEnd"
                                type="number"
                                className="input w-full"
                                value={formData.rollNoEnd}
                                onChange={(e) => setFormData({ ...formData, rollNoEnd: e.target.value })}
                                placeholder="Max"
                            />
                        </div>
                    </div>

                    <p className="text-xs text-brand-dark/50 italic">
                        Leave empty for no limit. Students with roll numbers outside this range will be blocked from enrolling.
                    </p>

                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                            {error}
                        </div>
                    )}

                    <div className="flex gap-3 pt-2">
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn btn-primary flex-1 py-2 flex items-center justify-center gap-2"
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Range'}
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="btn btn-secondary flex-1 py-2"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
