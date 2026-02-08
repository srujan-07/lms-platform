-- Sync missing lecturer assignments from legacy column to pivot table

INSERT INTO course_lecturers (course_id, lecturer_id)
SELECT id, lecturer_id
FROM courses
WHERE lecturer_id IS NOT NULL
ON CONFLICT (course_id, lecturer_id) DO NOTHING;

SELECT 'Sync complete: Ensure all courses have entries in course_lecturers.' AS status;
