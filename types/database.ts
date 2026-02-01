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

export interface Database {
    public: {
        Tables: {
            users: {
                Row: User;
                Insert: Omit<User, 'created_at' | 'updated_at'>;
                Update: Partial<Omit<User, 'id' | 'created_at' | 'updated_at'>>;
            };
            courses: {
                Row: Course;
                Insert: Omit<Course, 'id' | 'created_at' | 'updated_at'>;
                Update: Partial<Omit<Course, 'id' | 'created_at' | 'updated_at'>>;
            };
            enrollments: {
                Row: Enrollment;
                Insert: Omit<Enrollment, 'id' | 'enrolled_at'>;
                Update: Partial<Omit<Enrollment, 'id' | 'enrolled_at'>>;
            };
            lecture_notes: {
                Row: LectureNote;
                Insert: Omit<LectureNote, 'id' | 'created_at' | 'updated_at'>;
                Update: Partial<Omit<LectureNote, 'id' | 'created_at' | 'updated_at'>>;
            };
            audit_logs: {
                Row: AuditLog;
                Insert: Omit<AuditLog, 'id' | 'created_at'>;
                Update: never;
            };
        };
    };
}
