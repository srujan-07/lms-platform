-- Enroll all users with role 'student' into the sample demo course
-- This will only insert rows if the sample course with the given id exists

DO $$
BEGIN
  INSERT INTO enrollments (student_id, course_id)
  SELECT u.id, c.id
  FROM users u
  JOIN (SELECT id FROM courses WHERE id = '00000000-0000-0000-0000-000000000001') c ON true
  WHERE u.role = 'student'
  ON CONFLICT (student_id, course_id) DO NOTHING;
END;
$$ LANGUAGE plpgsql;
