# AGENTS.md

## Project overview

This repository contains Antti's full-stack portfolio project.

The intended architecture is:

- React frontend
- Node.js and Express REST API
- PostgreSQL database
- Azure deployment

The application is still under development. Do not assume that documented or planned features are already implemented.

## Project documentation

Before planning or implementing substantial features, review
`docs/README.md` and the relevant documents under `docs/`.

Respect document status and source-of-truth declarations:

- Approved documents define the intended implementation direction.
- Draft documents are proposals and must not be treated as approved requirements.
- Current source code and `infra/sql/schema.sql` define the current implementation.
- If documentation and implementation conflict, report the conflict instead of silently changing either one.

For Portfolio V1 decisions, use:
`docs/product/v1-scope.md`

## Repository structure

- `backend/` — Node.js and Express API
- `backend/src/routes/` — API route handlers and database queries
- `backend/src/db/` — PostgreSQL connection code
- `frontend/` — planned React frontend; currently incomplete
- `infra/docker/` — local PostgreSQL Docker Compose configuration
- `infra/sql/` — database schema and seed data
- `infra/docs/` — infrastructure and database notes

## Branch and Git workflow

- `develop` is the integration branch.
- `main` is reserved for stable releases.
- Use a separate task-specific branch for every change.
- Never commit directly to `develop` or `main`.
- Do not create commits, push branches, merge branches, or open pull requests unless explicitly requested.
- Keep each task and diff small enough to review independently.
- Do not combine unrelated refactoring with a bug fix or feature.

## Working agreement

For requests to analyze, explain, review, diagnose, or plan:

- Inspect the relevant files.
- Report confirmed findings separately from assumptions.
- Do not modify files.

For requests to implement, fix, refactor, or build:

- Make only the requested in-scope changes.
- Prefer the smallest coherent implementation.
- Run relevant non-destructive validation.
- Show the resulting diff and validation results.
- Stop before commits, pushes, deployments, or other external writes unless explicitly authorized.

Ask before:

- Adding, removing, or upgrading dependencies
- Resetting or deleting database data or Docker volumes
- Changing the database schema
- Introducing a migration framework
- Changing the public API contract
- Adding authentication or authorization
- Creating Azure resources or deploying
- Accessing the network when the task does not clearly require it
- Performing GitHub writes

## Security and secrets

- Never read, print, modify, or commit `.env` files or secrets.
- Never expose database passwords, connection strings, API keys, tokens, or Azure credentials.
- Use placeholder values in example environment files.
- Keep production write access fail-closed.
- Use parameterized PostgreSQL queries.
- Validate all untrusted input.
- Do not weaken Helmet, CORS, request-size limits, or other security controls without explicit justification.
- Do not use `docker compose down -v` without explicit approval.

## Backend commands

Run backend commands from `backend/`.

Available commands:

```bash
npm start
npm run dev

The current npm test command is only a failing placeholder. Do not report tests as passing until a real test framework and test suite have been implemented.

Before running the backend, verify that its known startup blockers have been addressed.

Database commands

Local PostgreSQL is managed from the repository root:

docker compose -f infra/docker/docker-compose.yml up -d
docker compose -f infra/docker/docker-compose.yml down

The schema and seed scripts in infra/sql/ run automatically only when the PostgreSQL data volume is first created.

Do not delete or recreate the database volume unless the task explicitly authorizes destructive database reset.

Frontend status

The React frontend has not yet been implemented.

Do not invent frontend commands or claim that a frontend build succeeds until a frontend package manifest and application exist.

When the frontend is created:

Use an environment-configured API base URL.
Do not hard-code localhost or production URLs in components.
Include loading, empty, success, and error states.
Keep components accessible and responsive.
Add linting, tests, and a production build command.
Code quality
Follow the existing JavaScript module style unless a task explicitly changes it.
Prefer clear, maintainable code over clever abstractions.
Remove obsolete code only when it is in scope and confirmed unused.
Avoid large route files growing further when adding substantial behavior.
Keep validation, business logic, and database access separable as the project grows.
Return appropriate HTTP status codes and useful JSON errors.
Map expected PostgreSQL constraint errors instead of returning generic HTTP 500 responses.
Validation

After making changes, run the relevant available checks.

At minimum:

git diff --check
git status --short

For changed JavaScript files, run suitable syntax checks.

Run tests, linting, and builds when those commands exist. Never claim that a command was run if it was not run.

When database behavior is changed, clearly state whether it was validated:

statically from the source
against a local PostgreSQL instance
or not executed
Completion report

At the end of an implementation task, report:

Files changed
Behavior changed
Commands and tests run
Results of those checks
Remaining risks or unverified assumptions
Any follow-up work that is outside the current task

Do not describe a task as complete when required validation failed or was not possible.
