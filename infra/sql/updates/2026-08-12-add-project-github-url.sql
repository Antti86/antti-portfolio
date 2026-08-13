BEGIN;

ALTER TABLE project
  ADD COLUMN github_url TEXT;

ALTER TABLE project
  ADD CONSTRAINT chk_project_github_url CHECK (
    github_url IS NULL OR (
      github_url ~ '^https://github[.]com/[A-Za-z0-9]([A-Za-z0-9-]{0,37}[A-Za-z0-9])?/[A-Za-z0-9._-]{1,100}$'
      AND github_url !~ '^https://github[.]com/[^/]*--'
      AND split_part(github_url, '/', 5) NOT IN ('.', '..')
    )
  );

DO $$
BEGIN
  IF (SELECT COUNT(*) FROM project WHERE name = 'antti-portfolio') <> 1 THEN
    RAISE EXCEPTION 'Expected exactly one antti-portfolio project';
  END IF;
END
$$;

UPDATE project
SET github_url = 'https://github.com/Antti86/antti-portfolio'
WHERE name = 'antti-portfolio';

COMMIT;
