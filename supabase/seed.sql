-- Seed data for testing the LMS platform
-- Run this after the initial schema migration

-- ============================================================================
-- SEED USERS
-- ============================================================================

-- Note: In production, users will be synced from StackAuth
-- These are sample users for testing

INSERT INTO users (id, email, name, role) VALUES
  ('admin-001', 'admin@lms.edu', 'Admin User', 'admin'),
  ('lecturer-001', 'john.doe@lms.edu', 'Dr. John Doe', 'lecturer'),
  ('lecturer-002', 'jane.smith@lms.edu', 'Prof. Jane Smith', 'lecturer'),
  ('student-001', 'alice@student.edu', 'Alice Johnson', 'student'),
  ('student-002', 'bob@student.edu', 'Bob Williams', 'student'),
  ('student-003', 'charlie@student.edu', 'Charlie Brown', 'student')
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- SEED COURSES
-- ============================================================================

INSERT INTO courses (id, title, description, lecturer_id) VALUES
  (
    '11111111-1111-1111-1111-111111111111',
    'AI Fundamentals',
    'Introduction to Artificial Intelligence covering machine learning, neural networks, and practical applications.',
    'lecturer-001'
  ),
  (
    '22222222-2222-2222-2222-222222222222',
    'Cybersecurity Basics',
    'Essential cybersecurity concepts including network security, cryptography, and threat analysis.',
    'lecturer-002'
  ),
  (
    '33333333-3333-3333-3333-333333333333',
    'Advanced Machine Learning',
    'Deep dive into advanced ML techniques, deep learning architectures, and model optimization.',
    'lecturer-001'
  )
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- SEED ENROLLMENTS
-- ============================================================================

INSERT INTO enrollments (student_id, course_id) VALUES
  -- Alice enrolled in AI Fundamentals and Cybersecurity
  ('student-001', '11111111-1111-1111-1111-111111111111'),
  ('student-001', '22222222-2222-2222-2222-222222222222'),
  
  -- Bob enrolled in all courses
  ('student-002', '11111111-1111-1111-1111-111111111111'),
  ('student-002', '22222222-2222-2222-2222-222222222222'),
  ('student-002', '33333333-3333-3333-3333-333333333333'),
  
  -- Charlie enrolled in Advanced ML only
  ('student-003', '33333333-3333-3333-3333-333333333333')
ON CONFLICT (student_id, course_id) DO NOTHING;

-- ============================================================================
-- SEED LECTURE NOTES
-- ============================================================================

-- Note: In production, file_path will point to actual files in Supabase Storage
-- These are sample entries for testing

INSERT INTO lecture_notes (course_id, title, description, file_path, file_size, uploaded_by) VALUES
  (
    '11111111-1111-1111-1111-111111111111',
    'Introduction to AI - Week 1',
    'Overview of AI history, applications, and fundamental concepts.',
    'lecture-notes/ai-fundamentals/week1-intro.pdf',
    1024000,
    'lecturer-001'
  ),
  (
    '11111111-1111-1111-1111-111111111111',
    'Machine Learning Basics - Week 2',
    'Introduction to supervised and unsupervised learning algorithms.',
    'lecture-notes/ai-fundamentals/week2-ml-basics.pdf',
    2048000,
    'lecturer-001'
  ),
  (
    '22222222-2222-2222-2222-222222222222',
    'Network Security Fundamentals',
    'Understanding network protocols, firewalls, and intrusion detection.',
    'lecture-notes/cybersecurity/network-security.pdf',
    1536000,
    'lecturer-002'
  ),
  (
    '22222222-2222-2222-2222-222222222222',
    'Cryptography Essentials',
    'Symmetric and asymmetric encryption, hashing, and digital signatures.',
    'lecture-notes/cybersecurity/cryptography.pdf',
    1792000,
    'lecturer-002'
  ),
  (
    '33333333-3333-3333-3333-333333333333',
    'Deep Learning Architectures',
    'CNNs, RNNs, Transformers, and their applications.',
    'lecture-notes/advanced-ml/deep-learning.pdf',
    3072000,
    'lecturer-001'
  )
ON CONFLICT DO NOTHING;

-- ============================================================================
-- SEED AUDIT LOGS
-- ============================================================================

INSERT INTO audit_logs (user_id, action, resource_type, resource_id, metadata) VALUES
  ('admin-001', 'user.created', 'user', 'lecturer-001', '{"role": "lecturer"}'::jsonb),
  ('admin-001', 'user.created', 'user', 'lecturer-002', '{"role": "lecturer"}'::jsonb),
  ('lecturer-001', 'course.created', 'course', '11111111-1111-1111-1111-111111111111', '{"title": "AI Fundamentals"}'::jsonb),
  ('lecturer-002', 'course.created', 'course', '22222222-2222-2222-2222-222222222222', '{"title": "Cybersecurity Basics"}'::jsonb),
  ('admin-001', 'enrollment.created', 'enrollment', 'student-001', '{"course": "AI Fundamentals"}'::jsonb)
ON CONFLICT DO NOTHING;
