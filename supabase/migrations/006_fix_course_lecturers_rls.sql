-- Fix infinite recursion in course_lecturers RLS policies
-- This migration removes the recursive policies and simplifies them

-- Drop the problematic policies
DROP POLICY IF EXISTS "Lecturers can manage their course lecturers" ON course_lecturers;
DROP POLICY IF EXISTS "Lecturers can delete their course lecturers" ON course_lecturers;

-- Drop and recreate the admin policy to ensure it works for all operations
DROP POLICY IF EXISTS "Admins can manage course lecturers" ON course_lecturers;

-- Create separate policies for each operation to be explicit
CREATE POLICY "Admins can insert course lecturers"
  ON course_lecturers FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid()::text AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update course lecturers"
  ON course_lecturers FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid()::text AND role = 'admin'
    )
  );

CREATE POLICY "Admins can delete course lecturers"
  ON course_lecturers FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid()::text AND role = 'admin'
    )
  );

SELECT 'Migration 006 complete: Fixed course_lecturers RLS recursion and admin policies' AS status;
