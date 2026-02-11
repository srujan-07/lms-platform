-- Fix RLS policies to allow service role (admin client) operations
-- This is needed because StackAuth users don't have Supabase sessions,
-- but we use the admin client (service role) to sync data to the database

-- ============================================================================
-- FIX USERS TABLE RLS POLICIES
-- ============================================================================

-- Drop old policy that blocks first user insert
DROP POLICY IF EXISTS "Admins can insert users" ON users;

-- New policy allows service role OR existing admin to insert
CREATE POLICY "Service role and admins can insert users"
  ON users FOR INSERT
  WITH CHECK (
    auth.role() = 'service_role' OR
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid()::text AND role = 'admin'
    )
  );

-- ============================================================================
-- FIX STUDENT_PROFILES TABLE RLS POLICIES
-- ============================================================================

-- Drop old INSERT policy
DROP POLICY IF EXISTS "Students can create own profile" ON student_profiles;

-- New policy allows service role OR authenticated student to insert
CREATE POLICY "Students can create own profile"
  ON student_profiles FOR INSERT
  WITH CHECK (
    auth.role() = 'service_role' OR
    user_id = auth.uid()::text
  );

-- Drop old UPDATE policy
DROP POLICY IF EXISTS "Students can update own profile" ON student_profiles;

-- New policy allows service role OR authenticated student to update
CREATE POLICY "Students can update own profile"
  ON student_profiles FOR UPDATE
  USING (
    auth.role() = 'service_role' OR
    user_id = auth.uid()::text
  );
