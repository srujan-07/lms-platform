'use client';

import { useState, useEffect } from 'react';
import { Plus, ChevronDown, ChevronRight, FileText, Upload, CheckCircle, Clock } from 'lucide-react';
import { useDropzone } from 'react-dropzone';

interface CourseHour {
    id: string;
    title: string;
    content: string | null;
    order_index: number;
    assignments?: Assignment[];
}

interface Assignment {
    id: string;
    hour_id: string;
    title: string;
    description: string | null;
    points: number;
    due_date: string | null;
}

interface Submission {
    id: string;
    assignment_id: string;
    student_id: string;
    file_path: string;
    grade: number | null;
    feedback: string | null;
    submitted_at: string;
    student?: {
        name: string;
        email: string;
    };
}

interface CourseCurriculumProps {
    courseId: string;
    role: 'lecturer' | 'student' | 'admin';
}

export default function CourseCurriculum({ courseId, role }: CourseCurriculumProps) {
    const [hours, setHours] = useState<CourseHour[]>([]);
    const [assignments, setAssignments] = useState<Record<string, Assignment[]>>({});
    const [loading, setLoading] = useState(true);
    const [expandedHours, setExpandedHours] = useState<Record<string, boolean>>({});

    // Lecturer states
    const [showAddHour, setShowAddHour] = useState(false);
    const [newHourTitle, setNewHourTitle] = useState('');
    const [showAddAssignment, setShowAddAssignment] = useState<string | null>(null); // hourId
    const [newAssignment, setNewAssignment] = useState({ title: '', description: '', points: 100, due_date: '' });

    useEffect(() => {
        fetchHours();
    }, [courseId]);

    const fetchHours = async () => {
        try {
            const res = await fetch(`/api/courses/${courseId}/hours`);
            const data = await res.json();
            if (data.data) {
                setHours(data.data);

                // Process assignments map and open hours
                const expanded: Record<string, boolean> = {};
                const assigns: Record<string, Assignment[]> = {};

                for (const hour of data.data) {
                    expanded[hour.id] = true;
                    // Assignments now come nested in hour
                    if (hour.assignments) {
                        assigns[hour.id] = hour.assignments;
                    } else {
                        assigns[hour.id] = [];
                    }
                }
                setExpandedHours(expanded);
                setAssignments(assigns);
            }
        } catch (error) {
            console.error('Error fetching hours:', error);
        } finally {
            setLoading(false);
        }
    };

    // Helper that is no longer needed but kept for signature compatibility or removed
    // const fetchAssignments = async (hourId: string) => {};

    // ... for now let's assume fetchHours returns everything? 
    // The previous implementation of GET /api/courses/[id]/hours just did select('*').
    // I should update that API to include assignments.

    const toggleHour = (hourId: string) => {
        setExpandedHours(prev => ({ ...prev, [hourId]: !prev[hourId] }));
    };

    const handleAddHour = async () => {
        if (!newHourTitle) return;
        try {
            const res = await fetch(`/api/courses/${courseId}/hours`, {
                method: 'POST',
                body: JSON.stringify({ title: newHourTitle }),
            });
            const data = await res.json();
            if (data.data) {
                setHours([...hours, data.data]);
                setExpandedHours(prev => ({ ...prev, [data.data.id]: true }));
                setAssignments(prev => ({ ...prev, [data.data.id]: [] }));
                setShowAddHour(false);
                setNewHourTitle('');
            }
        } catch (error) {
            console.error('Error adding hour:', error);
        }
    };

    const handleAddAssignment = async (hourId: string) => {
        if (!newAssignment.title) return;
        try {
            const res = await fetch(`/api/hours/${hourId}/assignments`, {
                method: 'POST',
                body: JSON.stringify(newAssignment),
            });
            const data = await res.json();
            if (data.data) {
                setAssignments(prev => ({
                    ...prev,
                    [hourId]: [...(prev[hourId] || []), data.data]
                }));
                setShowAddAssignment(null);
                setNewAssignment({ title: '', description: '', points: 100, due_date: '' });
            }
        } catch (error) {
            console.error('Error adding assignment:', error);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-brand-dark">Course Curriculum</h3>
                {role === 'lecturer' && (
                    <button
                        onClick={() => setShowAddHour(true)}
                        className="btn btn-primary px-4 py-2 flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        Add New Hour
                    </button>
                )}
            </div>

            {showAddHour && (
                <div className="card p-4 border-2 border-brand-orange/20 animate-fade-in bg-white">
                    <h4 className="font-semibold mb-2 text-brand-dark">New hour / Module</h4>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={newHourTitle}
                            onChange={(e) => setNewHourTitle(e.target.value)}
                            placeholder="e.g. Week 1: Introduction"
                            className="input flex-1"
                        />
                        <button onClick={handleAddHour} className="btn btn-primary px-4">Add</button>
                        <button onClick={() => setShowAddHour(false)} className="btn btn-secondary px-4">Cancel</button>
                    </div>
                </div>
            )}

            <div className="space-y-4">
                {hours.map((hour) => (
                    <div key={hour.id} className="card border border-brand-dark/5 overflow-hidden">
                        {/* Hour Header */}
                        <div
                            onClick={() => toggleHour(hour.id)}
                            className="p-4 bg-brand-light/50 flex items-center justify-between cursor-pointer hover:bg-brand-light transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                {expandedHours[hour.id] ? (
                                    <ChevronDown className="w-5 h-5 text-brand-dark/50" />
                                ) : (
                                    <ChevronRight className="w-5 h-5 text-brand-dark/50" />
                                )}
                                <span className="font-semibold text-brand-dark">{hour.title}</span>
                            </div>
                            {role === 'lecturer' && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setShowAddAssignment(hour.id);
                                    }}
                                    className="text-sm text-brand-orange hover:text-brand-orange/80 font-medium"
                                >
                                    + Add Assignment
                                </button>
                            )}
                        </div>

                        {/* Hour Content */}
                        {expandedHours[hour.id] && (
                            <div className="p-4 border-t border-brand-dark/5 space-y-4 bg-white">
                                {/* Assignments List */}
                                <AssignmentList
                                    hourId={hour.id}
                                    courseId={courseId}
                                    role={role}
                                    assignments={assignments[hour.id] || []} // Pass assignments from prop/state
                                    onAssignmentsChange={(newAssignments) =>
                                        setAssignments(prev => ({ ...prev, [hour.id]: newAssignments }))
                                    }
                                />

                                {/* Add Assignment Form */}
                                {showAddAssignment === hour.id && (
                                    <div className="bg-brand-light/50 p-4 rounded-lg mt-4 border border-brand-dark/5">
                                        <h5 className="font-semibold text-sm text-brand-dark mb-3">New Assignment</h5>
                                        <div className="space-y-3">
                                            <input
                                                type="text"
                                                placeholder="Assignment Title"
                                                className="input w-full text-sm"
                                                value={newAssignment.title}
                                                onChange={e => setNewAssignment({ ...newAssignment, title: e.target.value })}
                                            />
                                            <textarea
                                                placeholder="Description"
                                                className="input w-full text-sm"
                                                rows={2}
                                                value={newAssignment.description}
                                                onChange={e => setNewAssignment({ ...newAssignment, description: e.target.value })}
                                            />
                                            <div className="flex gap-2">
                                                <div className="flex-1">
                                                    <label className="text-xs text-brand-dark/60 block mb-1">Points</label>
                                                    <input
                                                        type="number"
                                                        className="input w-full text-sm"
                                                        value={newAssignment.points}
                                                        onChange={e => setNewAssignment({ ...newAssignment, points: parseInt(e.target.value) })}
                                                    />
                                                </div>
                                                <div className="flex-1">
                                                    <label className="text-xs text-brand-dark/60 block mb-1">Due Date</label>
                                                    <input
                                                        type="datetime-local"
                                                        className="input w-full text-sm"
                                                        value={newAssignment.due_date}
                                                        onChange={e => setNewAssignment({ ...newAssignment, due_date: e.target.value })}
                                                    />
                                                </div>
                                            </div>
                                            <div className="flex gap-2 justify-end">
                                                <button
                                                    onClick={() => setShowAddAssignment(null)}
                                                    className="btn btn-sm btn-secondary bg-white"
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    onClick={() => handleAddAssignment(hour.id)}
                                                    className="btn btn-sm btn-primary"
                                                >
                                                    Create Assignment
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ))}

                {hours.length === 0 && !loading && (
                    <div className="text-center py-12 border-2 border-dashed border-brand-dark/10 rounded-lg bg-brand-light/20">
                        <p className="text-brand-dark/50">No curriculum content added yet.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

// Sub-component for Assignments List
function AssignmentList({
    hourId,
    courseId,
    role,
    assignments,
    onAssignmentsChange
}: {
    hourId: string,
    courseId: string,
    role: 'lecturer' | 'student' | 'admin',
    assignments: Assignment[],
    onAssignmentsChange: (assignments: Assignment[]) => void
}) {
    // We need to fetch assignments if they are not passed or handle them.
    // For this implementation, let's assume the parent fetches them or we fetch them here.
    // To keep it simple, I'll fetch here if empty/initially.

    // Actually, due to state lifting, let's just use the props. 
    // But we need to load them initially.

    useEffect(() => {
        // Fetch assignments for this hour if not already loaded?
        // Let's simplified: Parent loads.
        // But parent didn't implement load logic completely in the code above.
        // Let's implement fetch here for now.
        const load = async () => {
            try {
                // Warning: This assumes the API exists or we need to filter on client
                // Currently we don't have GET /api/hours/[id]/assignments
                // But we have GET /api/courses/[id]/hours. 
                // Let's assume we modify GET hours to return assignments included.
                // Or I can add a specific fetch here. 
                // Let's add GET assignments logic to the parent fetchHours or 
                // we'll implement a transient solution here.

                // Transient: Fetch all hours returns assignments? 
                // I will modify the GET hours API to include assignments.
            } catch (e) { }
        };
        // load();
    }, [hourId]);

    // ... Rendering assignments
    if (assignments.length === 0) {
        return <p className="text-sm text-brand-dark/40 italic">No assignments.</p>;
    }

    return (
        <div className="space-y-3">
            {assignments.map(assign => (
                <AssignmentItem
                    key={assign.id}
                    assignment={assign}
                    role={role}
                />
            ))}
        </div>
    );
}

function AssignmentItem({ assignment, role }: { assignment: Assignment, role: string }) {
    const [expanded, setExpanded] = useState(false);
    const [mySubmission, setMySubmission] = useState<Submission | null>(null);
    const [submissions, setSubmissions] = useState<Submission[]>([]);

    // Lecturer stats
    const [loadingSubs, setLoadingSubs] = useState(false);

    const toggle = () => setExpanded(!expanded);

    // Fetch submission details when expanded
    useEffect(() => {
        if (!expanded) return;

        if (role === 'student') {
            // Check if I submitted
            // We need an endpoint for "get my submission" or generic list
            // For now, let's assume student can call the submissions list endpoint but RLS filters to seeing only own?
            // The policy "Students view own submissions" is set. 
            // The endpoint GET /api/assignments/[id]/submissions checks for admin/lecturer role.
            // We need a student endpoint or relax the check.
            // I'll update the plan/code to allow students to get their own submission.
        } else {
            // Fetch all submissions for lecturer
            fetchSubmissions();
        }
    }, [expanded, role, assignment.id]);

    const fetchSubmissions = async () => {
        setLoadingSubs(true);
        try {
            const res = await fetch(`/api/assignments/${assignment.id}/submissions`);
            const data = await res.json();
            if (data.data) {
                setSubmissions(data.data);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoadingSubs(false);
        }
    };

    return (
        <div className="border border-brand-dark/5 rounded-lg bg-white overflow-hidden hover:shadow-sm transition-shadow">
            <div
                onClick={toggle}
                className="p-3 flex items-center justify-between cursor-pointer hover:bg-brand-light/30 transition-colors"
            >
                <div className="flex items-center gap-3">
                    <div className="bg-brand-orange/10 p-2 rounded text-brand-orange">
                        <FileText className="w-4 h-4" />
                    </div>
                    <div>
                        <p className="font-medium text-brand-dark text-sm">{assignment.title}</p>
                        <p className="text-xs text-brand-dark/60">
                            {assignment.points} pts • Due {assignment.due_date ? new Date(assignment.due_date).toLocaleDateString() : 'No Due Date'}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {role === 'student' && mySubmission && (
                        <span className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded-full flex items-center gap-1 border border-green-100">
                            <CheckCircle className="w-3 h-3" /> Submitted
                        </span>
                    )}
                    <ChevronDown className={`w-4 h-4 text-brand-dark/40 transition-transform ${expanded ? 'rotate-180' : ''}`} />
                </div>
            </div>

            {expanded && (
                <div className="p-4 border-t border-brand-dark/5 bg-brand-light/10">
                    <p className="text-sm text-brand-dark/80 mb-4">{assignment.description || 'No description provided.'}</p>

                    {role === 'lecturer' ? (
                        // Lecturer View: Submissions List
                        <div>
                            <h6 className="font-semibold text-xs text-brand-dark/60 uppercase tracking-wider mb-2">
                                Student Submissions ({submissions.length})
                            </h6>
                            {loadingSubs ? (
                                <p className="text-xs text-brand-dark/50">Loading...</p>
                            ) : submissions.length === 0 ? (
                                <p className="text-sm text-brand-dark/50 italic">No submissions yet.</p>
                            ) : (
                                <div className="space-y-2">
                                    {submissions.map(sub => (
                                        <div key={sub.id} className="bg-white p-3 rounded border border-brand-dark/5 text-sm flex justify-between items-center shadow-sm">
                                            <div>
                                                <p className="font-medium text-brand-dark">{sub.student?.name || 'Unknown Student'}</p>
                                                <p className="text-xs text-brand-dark/50">Submitted {new Date(sub.submitted_at).toLocaleDateString()}</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {sub.grade !== null ? (
                                                    <span className="font-bold text-green-600">{sub.grade}/{assignment.points}</span>
                                                ) : (
                                                    <span className="text-xs text-brand-orange bg-brand-orange/10 px-2 py-1 rounded">Needs Grading</span>
                                                )}
                                                <a href={sub.file_path} target="_blank" rel="noopener noreferrer" className="btn btn-xs btn-secondary">
                                                    View File
                                                </a>
                                                {/* Grading Modal/Input would go here */}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ) : (
                        // Student View: Submission Form
                        <StudentSubmissionView assignment={assignment} />
                    )}
                </div>
            )}
        </div>
    );
}

function StudentSubmissionView({ assignment }: { assignment: Assignment }) {
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [submission, setSubmission] = useState<Submission | null>(null);

    // Initial check for submission? 
    // We need that endpoint to get my submission.

    const handleUpload = async () => {
        if (!file) return;
        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);

            const res = await fetch(`/api/assignments/${assignment.id}/submit`, {
                method: 'POST',
                body: formData
            });
            const data = await res.json();
            if (data.data) {
                setSubmission(data.data);
                alert('Assignment submitted successfully!');
            } else {
                alert('Upload failed: ' + data.error);
            }
        } catch (e) {
            console.error(e);
            alert('Error submitting');
        } finally {
            setUploading(false);
        }
    };

    const { getRootProps, getInputProps } = useDropzone({
        accept: { 'application/pdf': ['.pdf'] },
        maxFiles: 1,
        onDrop: acceptedFiles => setFile(acceptedFiles[0])
    });

    return (
        <div>
            {submission ? (
                <div className="bg-green-50 border border-green-200 rounded p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <h5 className="font-semibold text-green-900">Submitted</h5>
                    </div>
                    <p className="text-sm text-green-800">
                        You submitted this assignment on {new Date(submission.submitted_at).toLocaleString()}.
                    </p>
                    {submission.grade !== null && (
                        <div className="mt-2 pt-2 border-t border-green-200">
                            <p className="font-bold text-green-900">Grade: {submission.grade}/{assignment.points}</p>
                            {submission.feedback && <p className="text-sm text-green-800 mt-1">Feedback: {submission.feedback}</p>}
                        </div>
                    )}
                </div>
            ) : (
                <div className="space-y-3">
                    <h6 className="font-semibold text-sm mb-2 text-brand-dark">Your Submission</h6>
                    <div
                        {...getRootProps()}
                        className="border-2 border-dashed border-brand-dark/10 bg-brand-light/20 rounded-lg p-6 text-center hover:bg-brand-light/50 transition-colors cursor-pointer"
                    >
                        <input {...getInputProps()} />
                        {file ? (
                            <div>
                                <FileText className="w-8 h-8 text-brand-orange mx-auto mb-2" />
                                <p className="font-medium text-brand-dark">{file.name}</p>
                            </div>
                        ) : (
                            <div>
                                <Upload className="w-8 h-8 text-brand-dark/30 mx-auto mb-2" />
                                <p className="text-sm text-brand-dark/60">Drag & drop your PDF solution here</p>
                            </div>
                        )}
                    </div>
                    <button
                        onClick={handleUpload}
                        disabled={!file || uploading}
                        className="btn btn-primary w-full"
                    >
                        {uploading ? 'Submitting...' : 'Submit Assignment'}
                    </button>
                </div>
            )}
        </div>
    );
}
