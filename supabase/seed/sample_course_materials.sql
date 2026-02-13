-- Insert sample lecture notes (PDF/video links) for the sample demo course
-- Uses public test files so you can verify downloads/viewing in the UI

DO $$
BEGIN
  -- PDF note 1
  INSERT INTO lecture_notes (id, course_id, title, description, file_path, file_size, uploaded_by)
  SELECT uuid_generate_v4(), c.id, 'Course Overview (PDF)', 'Overview and syllabus', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', 102400, c.lecturer_id
  FROM courses c WHERE c.id = '00000000-0000-0000-0000-000000000001'
  ON CONFLICT DO NOTHING;

  -- PDF note 2
  INSERT INTO lecture_notes (id, course_id, title, description, file_path, file_size, uploaded_by)
  SELECT uuid_generate_v4(), c.id, 'Lecture 1 Slides (PDF)', 'Intro slides', 'https://www.orimi.com/pdf-test.pdf', 256000, c.lecturer_id
  FROM courses c WHERE c.id = '00000000-0000-0000-0000-000000000001'
  ON CONFLICT DO NOTHING;

  -- Video resource (external link stored in file_path for demo)
  INSERT INTO lecture_notes (id, course_id, title, description, file_path, file_size, uploaded_by)
  SELECT uuid_generate_v4(), c.id, 'Intro Video (External)', 'Short intro video', 'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4', 1048576, c.lecturer_id
  FROM courses c WHERE c.id = '00000000-0000-0000-0000-000000000001'
  ON CONFLICT DO NOTHING;
END;
$$ LANGUAGE plpgsql;
