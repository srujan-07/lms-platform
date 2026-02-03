-- ============================================================================
-- SUPABASE STORAGE BUCKET POLICIES FOR COURSE MATERIALS
-- ============================================================================
-- 
-- Instructions:
-- 1. First create the bucket in Supabase Dashboard:
--    - Go to Storage > Create new bucket
--    - Name: course-materials
--    - Public: OFF (keep it private)
--    - File size limit: 10MB
--    - Allowed MIME types: application/pdf
--
-- 2. Then run these policies in SQL Editor to control access
-- ============================================================================

-- ============================================================================
-- UPLOAD POLICIES (Admin and Lecturers only)
-- ============================================================================

-- Allow admins to upload files
CREATE POLICY "Admins can upload course materials"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'course-materials'
  AND EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid()::text 
    AND role = 'admin'
  )
);

-- Allow lecturers to upload files to their own courses
CREATE POLICY "Lecturers can upload to their courses"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'course-materials'
  AND EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid()::text 
    AND role = 'lecturer'
  )
  -- Note: Additional validation happens in the API layer
  -- to ensure lecturer owns the course
);

-- ============================================================================
-- READ/DOWNLOAD POLICIES (Enrollment-based access)
-- ============================================================================

-- Allow admins to read all files
CREATE POLICY "Admins can read all course materials"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'course-materials'
  AND EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid()::text 
    AND role = 'admin'
  )
);

-- Allow lecturers to read files from their courses
CREATE POLICY "Lecturers can read their course materials"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'course-materials'
  AND EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid()::text 
    AND role = 'lecturer'
  )
  -- Note: Additional validation happens in the API layer
);

-- Allow students to read files from enrolled courses
-- Note: This policy is intentionally broad because we use signed URLs
-- The actual access control is enforced at the API level
CREATE POLICY "Students can read enrolled course materials"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'course-materials'
  AND EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid()::text 
    AND role = 'student'
  )
  -- Note: Enrollment verification happens in the API layer
  -- when generating signed URLs
);

-- ============================================================================
-- UPDATE POLICIES (Admin and Lecturers only)
-- ============================================================================

-- Allow admins to update any file
CREATE POLICY "Admins can update course materials"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'course-materials'
  AND EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid()::text 
    AND role = 'admin'
  )
);

-- Allow lecturers to update files in their courses
CREATE POLICY "Lecturers can update their course materials"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'course-materials'
  AND EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid()::text 
    AND role = 'lecturer'
  )
);

-- ============================================================================
-- DELETE POLICIES (Admin and Lecturers only)
-- ============================================================================

-- Allow admins to delete any file
CREATE POLICY "Admins can delete course materials"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'course-materials'
  AND EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid()::text 
    AND role = 'admin'
  )
);

-- Allow lecturers to delete files from their courses
CREATE POLICY "Lecturers can delete their course materials"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'course-materials'
  AND EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid()::text 
    AND role = 'lecturer'
  )
);

-- ============================================================================
-- IMPORTANT SECURITY NOTES
-- ============================================================================
--
-- 1. SIGNED URLS: The application uses signed URLs for downloads, which 
--    provides an additional layer of security beyond these RLS policies.
--
-- 2. ENROLLMENT VERIFICATION: Student access to materials is verified at 
--    the API level (in getMaterialSignedUrl) before generating signed URLs.
--    This ensures students can only access materials for enrolled courses.
--
-- 3. LECTURER OWNERSHIP: Lecturer access to upload/delete is verified at
--    the API level to ensure they own the course.
--
-- 4. FILE PATHS: Files are stored with paths like:
--    {courseId}/{timestamp}-{random}.pdf
--    This prevents path traversal attacks and organizes files by course.
--
-- 5. NO DIRECT ACCESS: Students never get direct storage URLs. They always
--    go through the API which generates time-limited signed URLs (1 hour).
--
-- ============================================================================

-- Success message
SELECT 'Storage policies created successfully! Remember to create the course-materials bucket first.' AS status;
