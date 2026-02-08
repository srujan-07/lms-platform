-- Phase 1.5: Multi-Lecturer Support
-- Creates course_lecturers pivot table and migrates existing data

-- ============================================================================
-- CREATE COURSE_LECTURERS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS course_lecturers (
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  lecturer_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (course_id, lecturer_id)
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_course_lecturers_course ON course_lecturers(course_id);
CREATE INDEX IF NOT EXISTS idx_course_lecturers_lecturer ON course_lecturers(lecturer_id);

-- ============================================================================
-- MIGRATE EXISTING DATA
-- ============================================================================

-- Insert existing lecturer_id from courses table into course_lecturers
INSERT INTO course_lecturers (course_id, lecturer_id)
SELECT id, lecturer_id
FROM courses
WHERE lecturer_id IS NOT NULL
ON CONFLICT DO NOTHING;

-- ============================================================================
-- RLS POLICIES FOR COURSE_LECTURERS
-- ============================================================================

ALTER TABLE course_lecturers ENABLE ROW LEVEL SECURITY;

-- Everyone can view course lecturers (needed for course details)
CREATE POLICY "Anyone can view course lecturers"
  ON course_lecturers FOR SELECT
  USING (true);

-- Admins can manage all
CREATE POLICY "Admins can manage course lecturers"
  ON course_lecturers FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid()::text AND role = 'admin'
    )
  );

-- Lecturers can add themselves? No, typically only admins or course creators.
-- For now, let's allow lecturers to see if they are assigned.
-- But strict management is reserved for admins or if we implement "course owner" concept.
-- We'll stick to Admin-only management for now, or the lecturer who created it.

-- Allow lecturers to manage lecturers for courses they are already assigned to?
-- This effectively allows a lecturer to add co-lecturers.
-- Allow lecturers to manage lecturers for courses they are already assigned to
CREATE POLICY "Lecturers can manage their course lecturers"
  ON course_lecturers FOR INSERT
  WITH CHECK (
    EXISTS (
        SELECT 1 FROM course_lecturers cl
        WHERE cl.course_id = course_lecturers.course_id
        AND cl.lecturer_id = auth.uid()::text
    )
    OR
    EXISTS (
        SELECT 1 FROM courses c
        WHERE c.id = course_lecturers.course_id
        AND c.lecturer_id = auth.uid()::text
    )
  );

CREATE POLICY "Lecturers can delete their course lecturers"
  ON course_lecturers FOR DELETE
  USING (
    EXISTS (
        SELECT 1 FROM course_lecturers cl
        WHERE cl.course_id = course_lecturers.course_id
        AND cl.lecturer_id = auth.uid()::text
    )
    OR
    EXISTS (
        SELECT 1 FROM courses c
        WHERE c.id = course_lecturers.course_id
        AND c.lecturer_id = auth.uid()::text
    )
  );


-- ============================================================================
-- UPDATE COURSES POLICIES TO USE PIVOT TABLE
-- ============================================================================

-- Lecturers can update courses if they are in course_lecturers
-- We need to drop the old policy and create a new one, OR update it.
-- Current policy: "Lecturers can update own courses" USING (lecturer_id = auth.uid() ...)

DROP POLICY IF EXISTS "Lecturers can update own courses" ON courses;

CREATE POLICY "Lecturers can update assigned courses"
  ON courses FOR UPDATE
  USING (
    -- Legacy check
    lecturer_id = auth.uid()::text
    OR 
    -- New check
    EXISTS (
      SELECT 1 FROM course_lecturers 
      WHERE course_id = courses.id 
      AND lecturer_id = auth.uid()::text
    )
    OR 
    -- Admin check
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid()::text AND role = 'admin'
    )
  );

-- Same for DELETE? Usually only the "owner" or Admin should delete. 
-- Let's keep DELETE restrictive to the original creator (lecturer_id) or Admin for now.

-- ============================================================================
-- UPDATE LECTURE_NOTES POLICIES
-- ============================================================================

-- Lecturers can upload notes if they are assigned to the course via course_lecturers

DROP POLICY IF EXISTS "Lecturers can upload notes to own courses" ON lecture_notes;

CREATE POLICY "Lecturers can upload notes to assigned courses"
  ON lecture_notes FOR INSERT
  WITH CHECK (
    -- Legacy
    EXISTS (
      SELECT 1 FROM courses 
      WHERE courses.id = lecture_notes.course_id 
      AND courses.lecturer_id = auth.uid()::text
    )
    OR
    -- New
    EXISTS (
      SELECT 1 FROM course_lecturers
      WHERE course_id = lecture_notes.course_id
      AND lecturer_id = auth.uid()::text
    )
    OR
    -- Admin
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid()::text AND role = 'admin'
    )
  );


SELECT 'Migration 004 complete: Created course_lecturers table and updated policies.' AS status;
