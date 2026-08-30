-- Local lesson-status demo data.
-- Inserts are idempotent by student name so application restarts do not duplicate rows.

INSERT INTO student (
    name, birth_year, gender, stage, status, special_notes, request_notes,
    use_yn, created_by, created_at, updated_by, updated_at
)
SELECT
    '김민준', 2014, 'MALE', 'STAGE_2', 'ACTIVE', '수학 기초 복습 필요', '숙제는 하루 전 전달',
    1, 'init.sql', CURRENT_TIMESTAMP, 'init.sql', CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM student WHERE name = '김민준');

INSERT INTO student (
    name, birth_year, gender, stage, status, special_notes, request_notes,
    use_yn, created_by, created_at, updated_by, updated_at
)
SELECT
    '이서연', 2013, 'FEMALE', 'STAGE_3', 'ACTIVE', NULL, '진도보다 정확도 우선',
    1, 'init.sql', CURRENT_TIMESTAMP, 'init.sql', CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM student WHERE name = '이서연');

INSERT INTO student (
    name, birth_year, gender, stage, status, special_notes, request_notes,
    use_yn, created_by, created_at, updated_by, updated_at
)
SELECT
    '박지훈', 2015, 'MALE', 'STAGE_1', 'ACTIVE', '집중력 확인', NULL,
    1, 'init.sql', CURRENT_TIMESTAMP, 'init.sql', CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM student WHERE name = '박지훈');

INSERT INTO studentschedule (
    student_id, day_of_week, lesson_time, effective_start_date,
    use_yn, created_by, created_at, updated_by, updated_at
)
SELECT
    id, 'MONDAY', '16:00:00', '2025-01-01',
    1, 'init.sql', CURRENT_TIMESTAMP, 'init.sql', CURRENT_TIMESTAMP
FROM student
WHERE name = '김민준'
  AND NOT EXISTS (
      SELECT 1 FROM studentschedule
      WHERE student_id = student.id AND use_yn = 1
  );

INSERT INTO studentschedule (
    student_id, day_of_week, lesson_time, effective_start_date,
    use_yn, created_by, created_at, updated_by, updated_at
)
SELECT
    id, 'WEDNESDAY', '17:30:00', '2025-01-01',
    1, 'init.sql', CURRENT_TIMESTAMP, 'init.sql', CURRENT_TIMESTAMP
FROM student
WHERE name = '이서연'
  AND NOT EXISTS (
      SELECT 1 FROM studentschedule
      WHERE student_id = student.id AND use_yn = 1
  );

INSERT INTO studentschedule (
    student_id, day_of_week, lesson_time, effective_start_date,
    use_yn, created_by, created_at, updated_by, updated_at
)
SELECT
    id, 'SATURDAY', '11:00:00', '2025-01-01',
    1, 'init.sql', CURRENT_TIMESTAMP, 'init.sql', CURRENT_TIMESTAMP
FROM student
WHERE name = '박지훈'
  AND NOT EXISTS (
      SELECT 1 FROM studentschedule
      WHERE student_id = student.id AND use_yn = 1
  );
