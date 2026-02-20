# Database Notes – Portfolio Project

This project uses PostgreSQL running in Docker for local development.

The database stores structured metadata for:

- Schools
- Courses
- Projects
- Technologies
- Diary metadata (actual diary content is stored as Markdown files)

---

## Requirements

- Docker Engine
- Docker Compose (v2)
- Optional: `psql` for manual access

---

## Start the Database

From the project root:

```bash
docker compose -f infra/docker/docker-compose.yml up -d
```

This will:

- Pull the PostgreSQL image (if not already present)

- Create the container

- Initialize the database (only on first run)

- Run schema.sql

- Run seed.sql

## Stop the Database

```bash
docker compose -f infra/docker/docker-compose.yml down
```

This stops and removes the container but keeps the database data.

## Full Reset (Re-run schema and seed)

⚠ This deletes all local database data.

```bash
docker compose -f infra/docker/docker-compose.yml down -v
docker compose -f infra/docker/docker-compose.yml up -d
```

Use this if you modify schema.sql and need a clean reinitialization.

## Connection Details (Development)

Host: localhost

Port: 5433

Database: portfolio_db

User: portfolio

Password: portfolio

Example connection:

```bash
psql "postgresql://portfolio:portfolio@localhost:5433/portfolio_db"
```

## Notes

- Foreign key constraints ensure referential integrity.

- Link tables (course_projects, project_tech, course_tech) use composite primary keys.

- ON DELETE CASCADE is used in link tables to maintain consistency.

- ON DELETE SET NULL is used for optional diary relationships.
