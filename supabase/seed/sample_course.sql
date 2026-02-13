-- Sample course seed for demo
-- Inserts a sample course, picks an existing lecturer/admin if available,
-- ensures required non-null columns (like access_code) are set.

DO $$
DECLARE
  lec_id TEXT;
BEGIN
  -- pick an existing lecturer or admin as the course owner
  SELECT id INTO lec_id FROM users WHERE role IN ('lecturer','admin') LIMIT 1;

  IF lec_id IS NULL THEN
    RAISE NOTICE 'No lecturer/admin user found. Sample course not created.';
    RETURN;
  END IF;

  INSERT INTO courses (id, title, description, lecturer_id, access_code)
  VALUES (
    '00000000-0000-0000-0000-000000000001',
    'Sample Intro to AI',
    'A short demo course to showcase LMS player flow.',
    lec_id,
    'SAMPLEAI01'
  )
  ON CONFLICT (id) DO NOTHING;

  -- Insert hours for the sample course
  INSERT INTO course_hours (id, course_id, title, content, order_index)
  VALUES
    ('00000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000001', 'Introduction', '<p>Welcome to the course.</p>', 1),
    ('00000000-0000-0000-0000-000000000012', '00000000-0000-0000-0000-000000000001', 'Basics of ML', '<p>Supervised learning overview.</p>', 2),
    ('00000000-0000-0000-0000-000000000013', '00000000-0000-0000-0000-000000000001', 'Conclusion', '<p>Next steps and resources.</p>', 3)
  ON CONFLICT DO NOTHING;

END;
$$ LANGUAGE plpgsql;

-- Optionally enroll a demo student (replace id)
-- INSERT INTO enrollments (student_id, course_id) VALUES ('demo-student-id', '00000000-0000-0000-0000-000000000001') ON CONFLICT DO NOTHING;
