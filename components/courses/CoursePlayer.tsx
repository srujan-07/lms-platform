"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Check, ArrowRight } from 'lucide-react';

interface Hour {
    id: string;
    title: string;
    content?: string | null;
    order_index?: number;
}

interface Props {
    courseId: string;
}

export default function CoursePlayer({ courseId }: Props) {
    const router = useRouter();
    const [hours, setHours] = useState<Hour[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [completed, setCompleted] = useState<Record<string, boolean>>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetch(`${window.location.origin}/api/courses/${courseId}/hours`).then(r => r.json()).then(async (res) => {
            if (res.data) {
                setHours(res.data || []);
                // fetch progress
                const prog = await fetch(`${window.location.origin}/api/courses/${courseId}/progress`).then(r => r.json());
                const comp: Record<string, boolean> = {};
                if (prog.success && Array.isArray(prog.data)) {
                    prog.data.forEach((id: string) => comp[id] = true);
                }
                setCompleted(comp);
            }
        }).catch(err => console.error(err)).finally(() => setLoading(false));
    }, [courseId]);

    const currentHour = hours[currentIndex];

    const markComplete = async (hourId: string) => {
        setSaving(true);
        try {
            const res = await fetch(`/api/courses/${courseId}/hours/${hourId}/complete`, { method: 'POST' });
            const data = await res.json();
            if (data.success) {
                setCompleted(prev => ({ ...prev, [hourId]: true }));
            }
        } catch (err) {
            console.error(err);
        } finally {
            setSaving(false);
        }
    };

    const goNext = () => {
        if (currentIndex < hours.length - 1) setCurrentIndex(i => i + 1);
    };

    if (loading) return (<div className="p-8 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></div>);

    if (!hours.length) return (<div className="p-8 text-center text-brand-dark/60">No course content available.</div>);

    return (
        <div className="grid lg:grid-cols-3 gap-8">
            <aside className="lg:col-span-1 bg-white rounded-lg p-4 shadow-sm">
                <h4 className="font-semibold mb-4">Course Sections</h4>
                <ol className="space-y-2">
                    {hours.map((h, idx) => (
                        <li key={h.id} className={`p-2 rounded-md flex items-center justify-between cursor-pointer ${idx === currentIndex ? 'bg-brand-light/50' : 'hover:bg-gray-50'}`} onClick={() => setCurrentIndex(idx)}>
                            <div>
                                <div className="text-sm font-medium">{h.title}</div>
                                <div className="text-xs text-brand-dark/50">{h.content ? `${h.content.substring(0, 80)}...` : 'Lecture'}</div>
                            </div>
                            <div>
                                {completed[h.id] ? <Check className="w-4 h-4 text-green-600" /> : <div className="w-4 h-4 border rounded-full" />}
                            </div>
                        </li>
                    ))}
                </ol>
            </aside>

            <section className="lg:col-span-2 bg-white rounded-lg p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                    <button
                        onClick={() => router.push('/dashboard')}
                        className="px-3 py-1 text-sm border border-brand-dark/10 rounded-md hover:bg-gray-50"
                    >
                        ← Back to Dashboard
                    </button>
                    <div />
                </div>
                <div className="flex items-start justify-between mb-4">
                    <h3 className="text-xl font-semibold">{currentHour?.title}</h3>
                    <div className="text-sm text-brand-dark/50">{currentIndex + 1} / {hours.length}</div>
                </div>

                <div className="prose max-w-none text-brand-dark/80 mb-6">
                    {currentHour?.content ? <div dangerouslySetInnerHTML={{ __html: currentHour.content as string }} /> : <p className="text-brand-dark/60">No content for this section.</p>}
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => {
                            if (!completed[currentHour.id]) markComplete(currentHour.id);
                        }}
                        disabled={saving || completed[currentHour.id]}
                        className="px-4 py-2 bg-brand-orange text-white rounded-md hover:bg-brand-orange/90 disabled:opacity-60"
                    >
                        {completed[currentHour.id] ? 'Completed' : (saving ? 'Saving...' : 'Mark as Complete')}
                    </button>

                    <button
                        onClick={() => { if (completed[currentHour.id]) goNext(); else alert('Please complete this section to proceed'); }}
                        className="px-4 py-2 border border-brand-dark/10 rounded-md flex items-center gap-2"
                    >
                        Next <ArrowRight className="w-4 h-4" />
                    </button>
                </div>
            </section>
        </div>
    );
}
