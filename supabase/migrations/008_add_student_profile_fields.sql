-- Add additional fields to student_profiles table
-- Adds phone_no, school, and branch fields for complete student profile

-- ============================================================================
-- ALTER STUDENT PROFILES TABLE
-- ============================================================================

-- Make class column nullable (no longer required)
ALTER TABLE student_profiles 
  ALTER COLUMN class DROP NOT NULL;

ALTER TABLE student_profiles 
  ADD COLUMN IF NOT EXISTS phone_no TEXT,
  ADD COLUMN IF NOT EXISTS school TEXT,
  ADD COLUMN IF NOT EXISTS branch TEXT;

-- Create indexes for searching by school and branch
CREATE INDEX IF NOT EXISTS idx_student_profiles_school ON student_profiles(school);
CREATE INDEX IF NOT EXISTS idx_student_profiles_branch ON student_profiles(branch);

-- ============================================================================
-- UPDATE ONBOARDING STATUS LOGIC
-- ============================================================================

-- Make onboarding_completed_at nullable to track completion separately
ALTER TABLE student_profiles 
  ALTER COLUMN onboarding_completed_at DROP NOT NULL;

-- Add a helper function to check if profile is complete
CREATE OR REPLACE FUNCTION is_profile_complete(profile_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM student_profiles 
    WHERE id = profile_id 
    AND phone_no IS NOT NULL 
    AND school IS NOT NULL 
    AND branch IS NOT NULL 
    AND section IS NOT NULL
  );
END;
$$ LANGUAGE plpgsql;
