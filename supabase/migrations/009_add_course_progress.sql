-- Create course_progress table to track student completion of course hours

CREATE TABLE IF NOT EXISTS course_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  hour_id UUID NOT NULL REFERENCES course_hours(id) ON DELETE CASCADE,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(student_id, course_id, hour_id)
);

CREATE INDEX IF NOT EXISTS idx_course_progress_student ON course_progress(student_id);
CREATE INDEX IF NOT EXISTS idx_course_progress_course ON course_progress(course_id);

-- RLS: allow students to insert their own progress and view their own
ALTER TABLE course_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can insert own progress"
  ON course_progress FOR INSERT
  WITH CHECK (student_id = auth.uid()::text);

CREATE POLICY "Students can view own progress"
  ON course_progress FOR SELECT
  USING (student_id = auth.uid()::text);

CREATE POLICY "Students can delete own progress"
  ON course_progress FOR DELETE
  USING (student_id = auth.uid()::text);

-- Admin can view all
CREATE POLICY "Admins can view all progress"
  ON course_progress FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid()::text AND role = 'admin')
  );

-- Admin can insert/update/delete
CREATE POLICY "Admins can manage progress"
  ON course_progress FOR ALL
  USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid()::text AND role = 'admin')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid()::text AND role = 'admin')
  );
