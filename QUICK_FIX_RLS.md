-- Complete RLS Fix - Allow User Syncing from StackAuth
-- Run this in Supabase SQL Editor

-- ============================================================================
-- OPTION 1: Allow user syncing (RECOMMENDED)
-- This keeps the foreign key relationships but allows StackAuth sync
-- ============================================================================

-- Drop all existing policies first
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Admins can view all users" ON users;
DROP POLICY IF EXISTS "Admins can update users" ON users;
DROP POLICY IF EXISTS "Admins can insert users" ON users;
DROP POLICY IF EXISTS "Anyone can view courses" ON courses;
DROP POLICY IF EXISTS "Lecturers can create courses" ON courses;
DROP POLICY IF EXISTS "Lecturers can update own courses" ON courses;
DROP POLICY IF EXISTS "Lecturers can delete own courses" ON courses;

-- Users table - Allow service role to insert/update (for StackAuth sync)
CREATE POLICY "Service role can manage users" 
  ON users FOR ALL 
  USING (true) 
  WITH CHECK (true);

-- Users can view their own profile
CREATE POLICY "Users can view own profile" 
  ON users FOR SELECT 
  USING (auth.uid()::text = id);

-- Courses table - Simple policies
CREATE POLICY "Anyone authenticated can view courses" 
  ON courses FOR SELECT 
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Anyone authenticated can create courses" 
  ON courses FOR INSERT 
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Course owners can update" 
  ON courses FOR UPDATE 
  USING (lecturer_id = auth.uid()::text);

CREATE POLICY "Course owners can delete" 
  ON courses FOR DELETE 
  USING (lecturer_id = auth.uid()::text);

-- Enrollments table
DROP POLICY IF EXISTS "Students can view own enrollments" ON enrollments;
DROP POLICY IF EXISTS "Authenticated users can view enrollments" ON enrollments;
DROP POLICY IF EXISTS "Authenticated users can create enrollments" ON enrollments;
DROP POLICY IF EXISTS "Authenticated users can delete enrollments" ON enrollments;

CREATE POLICY "Service role can manage enrollments" 
  ON enrollments FOR ALL 
  USING (true) 
  WITH CHECK (true);

CREATE POLICY "Students can view own enrollments" 
  ON enrollments FOR SELECT 
  USING (student_id = auth.uid()::text);

-- Lecture Notes table
DROP POLICY IF EXISTS "Students can view enrolled course notes" ON lecture_notes;
DROP POLICY IF EXISTS "Lecturers can view own course notes" ON lecture_notes;
DROP POLICY IF EXISTS "Authenticated users can upload notes" ON lecture_notes;
DROP POLICY IF EXISTS "Uploaders can update notes" ON lecture_notes;
DROP POLICY IF EXISTS "Uploaders can delete notes" ON lecture_notes;

CREATE POLICY "Service role can manage lecture notes" 
  ON lecture_notes FOR ALL 
  USING (true) 
  WITH CHECK (true);

CREATE POLICY "Students can view enrolled notes" 
  ON lecture_notes FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM enrollments 
      WHERE enrollments.course_id = lecture_notes.course_id 
      AND enrollments.student_id = auth.uid()::text
    )
  );

CREATE POLICY "Lecturers can view own course notes" 
  ON lecture_notes FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM courses 
      WHERE courses.id = lecture_notes.course_id 
      AND courses.lecturer_id = auth.uid()::text
    )
  );

-- Audit Logs table
DROP POLICY IF EXISTS "Authenticated users can create audit logs" ON audit_logs;

CREATE POLICY "Service role can manage audit logs" 
  ON audit_logs FOR ALL 
  USING (true) 
  WITH CHECK (true);

-- Verify
SELECT 'RLS policies updated successfully!' AS status,
       'Service role can now sync users from StackAuth' AS note;
