-- =========================================
-- Seed data for local development (demo only)


-- 1) School
INSERT INTO school (name, start_date, end_date, status, avg_grade)
VALUES
  ('Metropolia UAS (Open AMK)', '2024-09-01', NULL, 'in_progress', NULL);

-- 2) Diary (metadata only; content lives in Markdown files)
INSERT INTO diary (name, title, slug, created_at)
VALUES
  ('sql-course-diary', 'SQL & Relational Databases – Learning Notes', 'sql-relational-databases', CURRENT_DATE),
  ('portfolio-diary', 'Portfolio Project – Notes', 'portfolio-project', CURRENT_DATE);

-- 3) Tech
INSERT INTO tech (name)
VALUES
  ('Node.js'),
  ('Express'),
  ('PostgreSQL'),
  ('React'),
  ('Azure'),
  ('Docker');

-- 4) Course
-- Using subqueries so we don't depend on hardcoded IDs
INSERT INTO course (name, start_date, end_date, school_id, status, grade, diary_id)
VALUES
  (
    'NodeJS',
    '2025-12-01',
    '2025-12-18',
    (SELECT school_id FROM school WHERE name = 'Metropolia UAS (Open AMK)'),
    'completed',
    NULL,
    (SELECT diary_id FROM diary WHERE slug = 'portfolio-project')
  ),
  (
    'SQL ja relaatiotietokannat',
    '2026-02-01',
    '2026-02-20',
    (SELECT school_id FROM school WHERE name = 'Metropolia UAS (Open AMK)'),
    'completed',
    NULL,
    (SELECT diary_id FROM diary WHERE slug = 'sql-relational-databases')
  ),
  (
    'React.js Fundamentals',
    '2026-03-01',
    NULL,
    (SELECT school_id FROM school WHERE name = 'Metropolia UAS (Open AMK)'),
    'planned',
    NULL,
    (SELECT diary_id FROM diary WHERE slug = 'portfolio-project')
  );

-- 5) Project
INSERT INTO project (name, start_date, end_date, school_id, status, description, diary_id)
VALUES
  (
    'antti-portfolio',
    '2026-02-20',
    NULL,
    (SELECT school_id FROM school WHERE name = 'Metropolia UAS (Open AMK)'),
    'in_progress',
    'Fullstack portfolio: Node REST API + PostgreSQL + React + Azure (planned).',
    (SELECT diary_id FROM diary WHERE slug = 'portfolio-project')
  ),
  (
    'qt-chess',
    '2025-01-10',
    '2025-08-01',
    NULL,
    'completed',
    'Cross-platform chess game built with C++ and Qt.',
    NULL
  );

-- 6) course_tech (what the course covers)
INSERT INTO course_tech (course_id, tech_id, emphasis, note)
VALUES
  (
    (SELECT course_id FROM course WHERE name = 'NodeJS'),
    (SELECT tech_id FROM tech WHERE name = 'Node.js'),
    'main',
    'Runtime & tooling'
  ),
  (
    (SELECT course_id FROM course WHERE name = 'NodeJS'),
    (SELECT tech_id FROM tech WHERE name = 'Express'),
    'main',
    'REST APIs'
  ),
  (
    (SELECT course_id FROM course WHERE name = 'SQL ja relaatiotietokannat'),
    (SELECT tech_id FROM tech WHERE name = 'PostgreSQL'),
    'main',
    'Relational DB + SQL'
  ),
  (
    (SELECT course_id FROM course WHERE name = 'React.js Fundamentals'),
    (SELECT tech_id FROM tech WHERE name = 'React'),
    'main',
    'Frontend library'
  );

-- 7) project_tech (what each project uses)
INSERT INTO project_tech (project_id, tech_id, usage_area, note)
VALUES
  (
    (SELECT project_id FROM project WHERE name = 'antti-portfolio'),
    (SELECT tech_id FROM tech WHERE name = 'Node.js'),
    'backend',
    NULL
  ),
  (
    (SELECT project_id FROM project WHERE name = 'antti-portfolio'),
    (SELECT tech_id FROM tech WHERE name = 'Express'),
    'backend',
    NULL
  ),
  (
    (SELECT project_id FROM project WHERE name = 'antti-portfolio'),
    (SELECT tech_id FROM tech WHERE name = 'PostgreSQL'),
    'db',
    'Local dev via Docker'
  ),
  (
    (SELECT project_id FROM project WHERE name = 'antti-portfolio'),
    (SELECT tech_id FROM tech WHERE name = 'Docker'),
    'infra',
    'Postgres container'
  ),
  (
    (SELECT project_id FROM project WHERE name = 'qt-chess'),
    (SELECT tech_id FROM tech WHERE name = 'Docker'),
    'ci',
    'Optional build environment'
  );

-- 8) course_projects (link courses to projects)
INSERT INTO course_projects (course_id, project_id, relation_type, note)
VALUES
  (
    (SELECT course_id FROM course WHERE name = 'NodeJS'),
    (SELECT project_id FROM project WHERE name = 'antti-portfolio'),
    'portfolio_integration',
    'Backend built while applying Node course concepts'
  ),
  (
    (SELECT course_id FROM course WHERE name = 'SQL ja relaatiotietokannat'),
    (SELECT project_id FROM project WHERE name = 'antti-portfolio'),
    'portfolio_integration',
    'Database schema and queries'
  );