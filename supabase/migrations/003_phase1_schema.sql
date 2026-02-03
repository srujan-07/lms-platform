-- Phase 1 LMS Schema Enhancements
-- Adds student onboarding and course access code functionality

-- ============================================================================
-- ADD ACCESS CODE TO COURSES TABLE
-- ============================================================================

-- Add access_code column to courses table
ALTER TABLE courses ADD COLUMN IF NOT EXISTS access_code TEXT;

-- Make access_code unique and not null (with a default for existing rows)
UPDATE courses SET access_code = UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 8)) WHERE access_code IS NULL;
ALTER TABLE courses ALTER COLUMN access_code SET NOT NULL;
ALTER TABLE courses ADD CONSTRAINT courses_access_code_unique UNIQUE (access_code);

-- Create index for faster access code lookups
CREATE INDEX IF NOT EXISTS idx_courses_access_code ON courses(access_code);

-- ============================================================================
-- CREATE STUDENT PROFILES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS student_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  class TEXT NOT NULL,
  section TEXT NOT NULL,
  onboarding_completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_student_profiles_user_id ON student_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_student_profiles_class_section ON student_profiles(class, section);

-- ============================================================================
-- ROW LEVEL SECURITY POLICIES FOR STUDENT_PROFILES
-- ============================================================================

-- Enable RLS
ALTER TABLE student_profiles ENABLE ROW LEVEL SECURITY;

-- Students can view their own profile
CREATE POLICY "Students can view own profile"
  ON student_profiles FOR SELECT
  USING (user_id = auth.uid()::text);

-- Students can insert their own profile (onboarding)
CREATE POLICY "Students can create own profile"
  ON student_profiles FOR INSERT
  WITH CHECK (user_id = auth.uid()::text);

-- Students can update their own profile
CREATE POLICY "Students can update own profile"
  ON student_profiles FOR UPDATE
  USING (user_id = auth.uid()::text);

-- Admins can view all student profiles
CREATE POLICY "Admins can view all student profiles"
  ON student_profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid()::text AND role = 'admin'
    )
  );

-- Admins can update any student profile
CREATE POLICY "Admins can update student profiles"
  ON student_profiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid()::text AND role = 'admin'
    )
  );

-- ============================================================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================================================

CREATE TRIGGER update_student_profiles_updated_at 
  BEFORE UPDATE ON student_profiles
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- UPDATE ENROLLMENTS POLICIES TO ALLOW STUDENT SELF-ENROLLMENT
-- ============================================================================

-- Allow students to enroll themselves (via access code)
DROP POLICY IF EXISTS "Students can enroll themselves" ON enrollments;
CREATE POLICY "Students can enroll themselves"
  ON enrollments FOR INSERT
  WITH CHECK (
    student_id = auth.uid()::text
    AND EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid()::text AND role = 'student'
    )
  );

-- Success message
SELECT 'Phase 1 schema migration complete! Added access_code to courses and created student_profiles table.' AS status;
