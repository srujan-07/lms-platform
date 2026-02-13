'use client';

import CoursePlayer from '@/components/courses/CoursePlayer';
import { useParams } from 'next/navigation';

export default function PlayerPage() {
    const params = useParams();
    const courseId = params.id as string;

    return (
        <div className="min-h-screen bg-brand-light">
            <main className="container mx-auto px-4 py-8">
                <div className="max-w-5xl mx-auto">
                    <CoursePlayer courseId={courseId} />
                </div>
            </main>
        </div>
    );
}
