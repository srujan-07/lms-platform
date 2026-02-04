'use client';

import { useState, useEffect } from 'react';
import { FileText, Plus, Trash2, Loader2, X } from 'lucide-react';
import Link from 'next/link';

interface Enrollment {
    id: string;
    enrolled_at: string;
    student?: {
        id: string;
        name: string;
        email: string;
    };
    course?: {
        id: string;
        title: string;
    };
}

interface Course {
    id: string;
    title: string;
}

interface Student {
    id: string;
    name: string;
    email: string;
}

export default function AdminEnrollmentsPage() {
    const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
    const [courses, setCourses] = useState<Course[]>([]);
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState('');
    const [selectedStudent, setSelectedStudent] = useState('');
    const [adding, setAdding] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [coursesRes] = await Promise.all([
                fetch('/api/courses'),
            ]);

            const coursesData = await coursesRes.json();
            if (coursesData.success) {
                setCourses(coursesData.data || []);
                // Fetch all enrollments for all courses
                const allEnrollments: Enrollment[] = [];
                for (const course of coursesData.data || []) {
                    const enrollRes = await fetch(`/api/courses/${course.id}/enrollments`);
                    const enrollData = await enrollRes.json();
                    if (enrollData.success) {
                        allEnrollments.push(...(enrollData.data || []));
                    }
                }
                setEnrollments(allEnrollments);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchUnenrolledStudents = async (courseId: string) => {
        try {
            const response = await fetch(`/api/courses/${courseId}/unenrolled-students`);
            const data = await response.json();
            if (data.success) {
                setStudents(data.data || []);
            }
        } catch (error) {
            console.error('Error fetching students:', error);
        }
    };

    const handleCourseSelect = (courseId: string) => {
        setSelectedCourse(courseId);
        setSelectedStudent('');
        if (courseId) {
            fetchUnenrolledStudents(courseId);
        }
    };

    const handleAddEnrollment = async () => {
        if (!selectedCourse || !selectedStudent) return;

        setAdding(true);
        try {
            const response = await fetch('/api/enrollments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    courseId: selectedCourse,
                    studentId: selectedStudent,
                }),
            });

            const data = await response.json();

            if (data.success) {
                await fetchData();
                setShowAddModal(false);
                setSelectedCourse('');
                setSelectedStudent('');
            } else {
                alert('Failed to create enrollment: ' + data.error);
            }
        } catch (error) {
            console.error('Error creating enrollment:', error);
            alert('Failed to create enrollment');
        } finally {
            setAdding(false);
        }
    };

    const handleDelete = async (enrollmentId: string) => {
        if (!confirm('Are you sure you want to remove this enrollment?')) return;

        try {
            const response = await fetch(`/api/enrollments/${enrollmentId}`, {
                method: 'DELETE',
            });

            const data = await response.json();

            if (data.success) {
                setEnrollments(enrollments.filter(e => e.id !== enrollmentId));
            } else {
                alert('Failed to delete enrollment: ' + data.error);
            }
        } catch (error) {
            console.error('Error deleting enrollment:', error);
            alert('Failed to delete enrollment');
        }
    };

    return (
        <div className="min-h-screen bg-brand-light">
            <nav className="bg-brand-light/80 backdrop-blur-md shadow-sm border-b border-brand-dark/5 sticky top-0 z-10 transition-all">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <FileText className="w-6 h-6 text-brand-orange" />
                            <h1 className="text-xl font-bold text-brand-dark">Enrollment Management</h1>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setShowAddModal(true)}
                                className="btn btn-primary px-4 py-2 flex items-center gap-2"
                            >
                                <Plus className="w-4 h-4" />
                                Add Enrollment
                            </button>
                            <Link href="/admin/dashboard" className="btn btn-secondary px-4 py-2">
                                ← Back
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="container mx-auto px-4 py-8">
                <div className="card overflow-hidden">
                    {loading ? (
                        <div className="p-12 text-center">
                            <Loader2 className="w-8 h-8 text-brand-orange animate-spin mx-auto mb-4" />
                            <p className="text-brand-dark/60">Loading enrollments...</p>
                        </div>
                    ) : enrollments.length === 0 ? (
                        <div className="p-12 text-center">
                            <FileText className="w-16 h-16 text-brand-dark/20 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-brand-dark mb-2">No Enrollments Yet</h3>
                            <p className="text-brand-dark/60 mb-4">Enroll students in courses to get started.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-brand-light/50 border-b border-brand-dark/5">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-brand-dark/60 uppercase">Student</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-brand-dark/60 uppercase">Course</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-brand-dark/60 uppercase">Enrolled</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-brand-dark/60 uppercase">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-brand-dark/5">
                                    {enrollments.map((enrollment) => (
                                        <tr key={enrollment.id} className="hover:bg-brand-light/30 transition-colors">
                                            <td className="px-6 py-4">
                                                <div>
                                                    <p className="text-sm font-medium text-brand-dark">{enrollment.student?.name}</p>
                                                    <p className="text-sm text-brand-dark/70">{enrollment.student?.email}</p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-brand-dark">
                                                {enrollment.course?.title}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-brand-dark/70">
                                                {new Date(enrollment.enrolled_at).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => handleDelete(enrollment.id)}
                                                    className="text-red-500 hover:text-red-600 inline-flex items-center gap-1 hover:bg-red-50 p-1.5 rounded transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                    Remove
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </main>

            {/* Add Enrollment Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-brand-dark/20 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
                    <div className="card max-w-md w-full p-6 bg-white animate-scale-in">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-brand-dark">Add Enrollment</h2>
                            <button onClick={() => setShowAddModal(false)} className="text-brand-dark/50 hover:text-brand-dark transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-brand-dark/80 mb-2">Course</label>
                                <select
                                    value={selectedCourse}
                                    onChange={(e) => handleCourseSelect(e.target.value)}
                                    className="input w-full"
                                >
                                    <option value="">Select a course</option>
                                    {courses.map(course => (
                                        <option key={course.id} value={course.id}>{course.title}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-brand-dark/80 mb-2">Student</label>
                                <select
                                    value={selectedStudent}
                                    onChange={(e) => setSelectedStudent(e.target.value)}
                                    className="input w-full"
                                    disabled={!selectedCourse}
                                >
                                    <option value="">Select a student</option>
                                    {students.map(student => (
                                        <option key={student.id} value={student.id}>
                                            {student.name} ({student.email})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    onClick={handleAddEnrollment}
                                    disabled={!selectedCourse || !selectedStudent || adding}
                                    className="btn btn-primary flex-1"
                                >
                                    {adding ? 'Adding...' : 'Add Enrollment'}
                                </button>
                                <button
                                    onClick={() => setShowAddModal(false)}
                                    className="btn btn-secondary flex-1"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
