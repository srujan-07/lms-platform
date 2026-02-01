-- Quick Setup Script for LMS Platform
-- Copy this entire file and paste it into Supabase SQL Editor, then click "Run"

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create all tables
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('student', 'lecturer', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS courses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  lecturer_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS enrollments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(student_id, course_id)
);

CREATE TABLE IF NOT EXISTS lecture_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  file_path TEXT NOT NULL,
  file_size BIGINT,
  uploaded_by TEXT NOT NULL REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  resource_type TEXT,
  resource_id TEXT,
  metadata JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_courses_lecturer ON courses(lecturer_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_student ON enrollments(student_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course ON enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_lecture_notes_course ON lecture_notes(course_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at DESC);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE lecture_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Users table policies
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid()::text = id);
CREATE POLICY "Admins can view all users" ON users FOR SELECT USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid()::text AND role = 'admin'));
CREATE POLICY "Admins can update users" ON users FOR UPDATE USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid()::text AND role = 'admin'));
CREATE POLICY "Admins can insert users" ON users FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM users WHERE id = auth.uid()::text AND role = 'admin'));

-- Courses table policies
CREATE POLICY "Anyone can view courses" ON courses FOR SELECT USING (true);
CREATE POLICY "Lecturers can create courses" ON courses FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM users WHERE id = auth.uid()::text AND role IN ('lecturer', 'admin')));
CREATE POLICY "Lecturers can update own courses" ON courses FOR UPDATE USING (lecturer_id = auth.uid()::text OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid()::text AND role = 'admin'));
CREATE POLICY "Lecturers can delete own courses" ON courses FOR DELETE USING (lecturer_id = auth.uid()::text OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid()::text AND role = 'admin'));

-- Enrollments table policies
CREATE POLICY "Students can view own enrollments" ON enrollments FOR SELECT USING (student_id = auth.uid()::text OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid()::text AND role IN ('lecturer', 'admin')));
CREATE POLICY "Admins can create enrollments" ON enrollments FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM users WHERE id = auth.uid()::text AND role = 'admin'));
CREATE POLICY "Admins can delete enrollments" ON enrollments FOR DELETE USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid()::text AND role = 'admin'));

-- Lecture notes table policies
CREATE POLICY "Students can view enrolled course notes" ON lecture_notes FOR SELECT USING (
  EXISTS (SELECT 1 FROM enrollments WHERE enrollments.course_id = lecture_notes.course_id AND enrollments.student_id = auth.uid()::text)
  OR EXISTS (SELECT 1 FROM courses WHERE courses.id = lecture_notes.course_id AND courses.lecturer_id = auth.uid()::text)
  OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid()::text AND role = 'admin')
);
CREATE POLICY "Lecturers can upload notes to own courses" ON lecture_notes FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM courses WHERE courses.id = lecture_notes.course_id AND courses.lecturer_id = auth.uid()::text)
  OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid()::text AND role = 'admin')
);
CREATE POLICY "Lecturers can update own course notes" ON lecture_notes FOR UPDATE USING (uploaded_by = auth.uid()::text OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid()::text AND role = 'admin'));
CREATE POLICY "Lecturers can delete own course notes" ON lecture_notes FOR DELETE USING (uploaded_by = auth.uid()::text OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid()::text AND role = 'admin'));

-- Audit logs table policies
CREATE POLICY "Admins can view audit logs" ON audit_logs FOR SELECT USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid()::text AND role = 'admin'));
CREATE POLICY "Authenticated users can create audit logs" ON audit_logs FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Create update timestamp function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON courses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_lecture_notes_updated_at BEFORE UPDATE ON lecture_notes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Success message
SELECT 'Database setup complete! All tables, indexes, RLS policies, and triggers have been created.' AS status;
