# CI + Vercel Preview + Postgres migrations (scaffold)

This repository provides a minimal Node.js + TypeScript scaffold with:

- GitHub Actions CI to install, lint, type-check, run DB migrations against a Postgres service, test, and build
- Optional Vercel preview deployments on pull requests (PRs)
- A tiny SQL migration system (no external tool) to apply migrations in CI and locally

You can use this as a starting point and adapt it to your stack.

## What’s included

- Node.js 20+ project with TypeScript, ESLint, and a basic test using Node's built-in test runner
- Minimal migration runner (scripts/migrate.js) that runs SQL files in the `migrations/` directory and records them in a `schema_migrations` table
- GitHub Actions workflow (.github/workflows/ci.yml) that:
  - Starts a Postgres service using Docker
  - Runs SQL migrations
  - Lints, type-checks, tests, and builds
  - Optionally deploys a Vercel preview for PRs when Vercel secrets are configured
- A baseline `vercel.json` with placeholders for environment configuration

## Repository structure

- src/index.ts – demo TypeScript source
- tests/sample.test.js – minimal Node test
- scripts/migrate.js – migration runner
- migrations/001_init.sql – example SQL migration
- .github/workflows/ci.yml – GitHub Actions CI
- vercel.json – Vercel configuration (placeholder)

## Local development

- Install dependencies:

  npm install

- Run lint + type-check + tests + build:

  npm run lint
  npm run type-check
  npm test
  npm run build

- Run database migrations locally (ensure you have Postgres running and DATABASE_URL set):

  export DATABASE_URL="postgresql://postgres:postgres@localhost:5432/postgres"
  npm run db:migrate

By default, if DATABASE_URL is not set, the migration script uses:

  postgresql://postgres:postgres@localhost:5432/postgres

## CI configuration

The CI workflow:

- Uses the official postgres:16-alpine Docker image as a service
- Sets DATABASE_URL to the local service
- Runs in this order:
  1) npm install
  2) npm run lint
  3) npm run type-check
  4) npm run db:migrate
  5) npm test
  6) npm run build

If you need additional env vars for your app, add them to the `env:` section of the job or configure repository-level Secrets/Variables and reference them in the workflow.

## Postgres migrations

The migration runner applies all `.sql` files in the `migrations/` directory in lexical order, storing applied filenames in the `schema_migrations` table. To add a new migration, create a new file with a numeric prefix to control ordering, for example:

- migrations/002_add_users_table.sql

The script is idempotent; it skips migrations that have already been recorded.

## Vercel preview deployments

Preview deployments on PRs are optional and run only when the required Vercel credentials are present. The job will be skipped automatically otherwise.

Required GitHub repository settings:

- Repository Variables (recommended for non-sensitive values):
  - VERCEL_ORG_ID – your Vercel Organization ID
  - VERCEL_PROJECT_ID – your Vercel Project ID
- Repository Secrets:
  - VERCEL_TOKEN – a Vercel access token with permission to deploy to the project

Optional environment variables for Vercel (manage in Vercel):

- DATABASE_URL – configure in Vercel as an Environment Variable or Secret (referenced in vercel.json as @database_url).

How it works in CI:

- The `vercel-preview` job runs on pull_request events, after the main build job passes
- It runs `vercel pull` to sync environment, `vercel build`, and then `vercel deploy --prebuilt`
- On success, it comments the preview URL on the PR

Notes:

- The included `vercel.json` is a placeholder. It runs `npm run build` and treats the `dist/` directory as the output. Adapt this to your actual framework (Next.js, Remix, Vite, etc.) or switch to serverless/functions as needed.
- If your project outputs a static site, ensure your build writes assets to the `dist/` directory.

## Required GitHub Secrets/Variables summary

- VERCEL_TOKEN (Secret)
- VERCEL_ORG_ID (Variable)
- VERCEL_PROJECT_ID (Variable)

Optional (example):

- DATABASE_URL (Secret or Variable) – Use if you want to test against a non-ephemeral Postgres in CI. The default ephemeral service is fine for most PR checks.

## Next steps to adapt to your stack

- Replace the example TypeScript code with your app code
- Replace the placeholder migration with your real migrations
- If you prefer Prisma, Drizzle, Knex, or another migration system, wire `npm run db:migrate` to that tool (e.g., `prisma migrate deploy`)
- Update `vercel.json` to match your framework and output
- If you produce serverless functions or need API routes, follow Vercel's docs for your framework

## Troubleshooting

- CI fails on `db:migrate`:
  - Confirm the Postgres service is healthy; review Action logs for the health check
  - Verify SQL syntax in your migration files
  - Ensure DATABASE_URL is correctly set if you changed defaults

- Vercel preview step is skipped:
  - Ensure VERCEL_TOKEN, VERCEL_ORG_ID, and VERCEL_PROJECT_ID are defined in the repository settings

- Vercel preview build fails:
  - Update vercel.json (buildCommand, outputDirectory) to match your actual build process
  - Run `vercel build` locally to replicate
