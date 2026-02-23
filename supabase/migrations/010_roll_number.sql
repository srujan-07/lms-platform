-- Migration 010: Roll Number Support
-- 1. Rename phone_no → roll_no in student_profiles and add UNIQUE constraint
-- 2. Add roll_no_start / roll_no_end range columns to courses

-- ============================================================================
-- STUDENT PROFILES
-- ============================================================================

-- Rename the column
ALTER TABLE student_profiles
  RENAME COLUMN phone_no TO roll_no;

-- Enforce uniqueness: one roll number per account
ALTER TABLE student_profiles
  ADD CONSTRAINT student_profiles_roll_no_unique UNIQUE (roll_no);

-- Drop old indexes on phone_no if they exist (were never created, but guard anyway)
DROP INDEX IF EXISTS idx_student_profiles_phone;

-- Create index for roll_no lookups
CREATE INDEX IF NOT EXISTS idx_student_profiles_roll_no ON student_profiles(roll_no);

-- ============================================================================
-- COURSES — Roll Number Range
-- ============================================================================

ALTER TABLE courses
  ADD COLUMN IF NOT EXISTS roll_no_start INTEGER,
  ADD COLUMN IF NOT EXISTS roll_no_end   INTEGER;

-- Add a CHECK so that if both are provided, start <= end
ALTER TABLE courses
  ADD CONSTRAINT courses_roll_range_check
  CHECK (roll_no_start IS NULL OR roll_no_end IS NULL OR roll_no_start <= roll_no_end);

-- ============================================================================
-- UPDATE is_profile_complete() HELPER FUNCTION
-- ============================================================================

CREATE OR REPLACE FUNCTION is_profile_complete(profile_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM student_profiles
    WHERE id = profile_id
    AND roll_no IS NOT NULL
    AND school IS NOT NULL
    AND branch IS NOT NULL
    AND section IS NOT NULL
  );
END;
$$ LANGUAGE plpgsql;
