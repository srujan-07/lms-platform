export type UserRole = 'student' | 'lecturer' | 'admin';

export interface User {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    created_at: string;
    updated_at: string;
}

export interface Course {
    id: string;
    title: string;
    description: string | null;
    lecturer_id: string;
    created_at: string;
    updated_at: string;
    lecturer?: User;
}

export interface Enrollment {
    id: string;
    student_id: string;
    course_id: string;
    enrolled_at: string;
    student?: User;
    course?: Course;
}

export interface LectureNote {
    id: string;
    course_id: string;
    title: string;
    description: string | null;
    file_path: string;
    file_size: number | null;
    uploaded_by: string;
    created_at: string;
    updated_at: string;
    uploader?: User;
    course?: Course;
}

export interface AuditLog {
    id: string;
    user_id: string | null;
    action: string;
    resource_type: string | null;
    resource_id: string | null;
    metadata: Record<string, any> | null;
    ip_address: string | null;
    user_agent: string | null;
    created_at: string;
    user?: User;
}

export interface CourseHour {
    id: string;
    course_id: string;
    title: string;
    content: string | null;
    order_index: number;
    created_at: string;
    course?: Course;
}

export interface Assignment {
    id: string;
    hour_id: string;
    title: string;
    description: string | null;
    points: number;
    due_date: string | null;
    created_at: string;
    hour?: CourseHour;
}

export interface AssignmentSubmission {
    id: string;
    assignment_id: string;
    student_id: string;
    file_path: string;
    grade: number | null;
    feedback: string | null;
    submitted_at: string;
    assignment?: Assignment;
    student?: User;
}

// Helper types for database operations
type AssignmentSubmissionRow = Omit<AssignmentSubmission, 'assignment' | 'student'>;
type AssignmentSubmissionInsert = Omit<AssignmentSubmissionRow, 'id' | 'submitted_at'>;
type AssignmentSubmissionUpdate = {
    file_path?: string;
    grade?: number | null;
    feedback?: string | null;
};

export type Database = {
    public: {
        Tables: {
            users: {
                Row: User;
                Insert: Omit<User, 'created_at' | 'updated_at'>;
                Update: Partial<Omit<User, 'id' | 'created_at' | 'updated_at'>>;
                Relationships: [];
            };
            courses: {
                Row: Course;
                Insert: Omit<Course, 'id' | 'created_at' | 'updated_at'>;
                Update: Partial<Omit<Course, 'id' | 'created_at' | 'updated_at'>>;
                Relationships: [];
            };
            enrollments: {
                Row: Enrollment;
                Insert: Omit<Enrollment, 'id' | 'enrolled_at'>;
                Update: Partial<Omit<Enrollment, 'id' | 'enrolled_at'>>;
                Relationships: [];
            };
            lecture_notes: {
                Row: LectureNote;
                Insert: Omit<LectureNote, 'id' | 'created_at' | 'updated_at'>;
                Update: Partial<Omit<LectureNote, 'id' | 'created_at' | 'updated_at'>>;
                Relationships: [];
            };
            audit_logs: {
                Row: AuditLog;
                Insert: Omit<AuditLog, 'id' | 'created_at'>;
                Update: never;
                Relationships: [];
            };
            course_hours: {
                Row: CourseHour;
                Insert: Omit<CourseHour, 'id' | 'created_at'>;
                Update: Partial<Omit<CourseHour, 'id' | 'created_at'>>;
                Relationships: [];
            };
            assignments: {
                Row: Assignment;
                Insert: Omit<Assignment, 'id' | 'created_at'>;
                Update: Partial<Omit<Assignment, 'id' | 'created_at'>>;
                Relationships: [];
            };
            assignment_submissions: {
                Row: AssignmentSubmissionRow;
                Insert: AssignmentSubmissionInsert;
                Update: AssignmentSubmissionUpdate;
                Relationships: [];
            };
        };
        Views: {
            [_ in never]: never;
        };
        Functions: {
            [_ in never]: never;
        };
        Enums: {
            [_ in never]: never;
        };
        CompositeTypes: {
            [_ in never]: never;
        };
    };
};
