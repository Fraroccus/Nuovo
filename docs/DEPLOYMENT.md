Deployment guide: Vercel + managed Postgres + Prisma

Overview
- Serverless functions on Vercel (Node.js 20)
- Managed Postgres via Neon, Supabase, or Railway
- Prisma for DB access and migrations
- Safe migration strategy for production; push in previews
- Health check endpoint at /api/health

1) Provision a managed Postgres
Choose any of the following providers and create a Postgres database.
- Neon: https://neon.tech — create a project, enable connection pooling (PgBouncer). Copy the connection string. Add sslmode=require.
- Supabase: https://supabase.com — create a project, Database > Connection string. Add ?sslmode=require where appropriate.
- Railway: https://railway.app — create a Postgres database and copy the connection URL.

Recommended variables
- DATABASE_URL: The pooled connection string used by the application (serverless functions)
- DIRECT_URL: (optional) A non-pooled direct connection string used by Prisma for migrations

For Neon & Supabase, providers often expose both pooled and direct URLs. If you have both, use the pooled URL for DATABASE_URL and the direct URL for DIRECT_URL.

2) Configure environment variables
Create these in two places:
- Local development: copy .env.example to .env and fill in values
- Vercel Project Settings: Settings > Environment Variables
  - For Production: DATABASE_URL (+ DIRECT_URL if available)
  - For Preview: DATABASE_URL (+ DIRECT_URL if available)
  - For Development (optional): same as above, if you use Vercel CLI dev

Notes
- Ensure the URLs include sslmode=require if your provider mandates SSL.
- If you connect through a connection pool, Prisma will still work fine; DIRECT_URL is optional but recommended.

3) Create a Vercel project
- Import this repository into Vercel
- Framework preset: Other
- Build & Output settings (project-level or via vercel.json already present)
  - Install Command: npm install --include=dev
  - Build Command: npm run vercel-build
  - Output Directory: (leave empty)
- Ensure the Environment Variables above are set for Production and Preview

4) Prisma on deploy (safe migration script)
This repository includes a safe migration script used during Vercel builds:
- scripts/run-prisma.js
- vercel.json sets Build Command to run it

Behavior
- Production builds: prisma migrate deploy (idempotent, safe)
- Preview builds: prisma db push --accept-data-loss (good for ephemeral databases)
- All builds: prisma generate
- If DATABASE_URL is not set, migration is skipped and only generate runs

Useful commands
- Locally apply schema non-destructively: npm run prisma:push
- Locally generate client: npm run prisma:generate
- Locally apply migrations (after you’ve created them): npm run prisma:deploy

Creating migrations (local development)
1. Update prisma/schema.prisma
2. Run: npx prisma migrate dev --name <migration-name>
   - This requires a local DATABASE_URL and SHADOW_DATABASE_URL (for Postgres) if prompted by Prisma
3. Commit the generated prisma/migrations folder
4. Production deployments will automatically run prisma migrate deploy

5) Health checks
- Endpoint: GET /api/health
- Returns JSON with overall status and DB status
- Returns 200 OK when healthy; 503 if DB check fails
- This endpoint is cache-busted by default via Cache-Control: no-store

Monitoring
- Add an external uptime monitor (e.g., Vercel Observability, Better Uptime, Pingdom) to check /api/health

6) Caching & build settings
- vercel.json pins Node runtime to nodejs20.x for functions
- Prisma Client is generated at install/postinstall and bundled in Serverless Functions
- includeFiles ensures Prisma client artifacts and schema are deployed with functions
- npm install --include=dev guarantees prisma CLI is available during the build phase

7) Custom domain + HTTPS (optional)
- In Vercel Project > Domains, add your custom domain
- Set DNS per Vercel’s instructions (CNAME / A / ALIAS)
- HTTPS is automatic via Vercel-managed certificates

8) Rollback plan
Application rollback
- Use Vercel’s “Instant Rollback” to revert to a previous deployment
- Alternatively, revert the Git commit and redeploy

Database rollback
- Because migrations are applied with prisma migrate deploy, reversions require either:
  - a forward migration that reverts the changes, or
  - restoring a backup/snapshot from your database provider
- For critical migrations, take a manual snapshot/backup just before promoting to production

9) Local development
- npm install
- cp .env.example .env and set DATABASE_URL (and DIRECT_URL)
- npx prisma db push (or npx prisma migrate dev)
- Use vercel dev for local emulation (optional): npm i -g vercel && vercel dev

10) Troubleshooting
- Error: Error in PRISMA engine / binary not found
  - Ensure postinstall ran (prisma generate)
  - If using a different architecture locally vs Vercel, ensure the function bundles node_modules/.prisma/client/** (already configured)
- Build fails due to missing prisma binary
  - Ensure npm install --include=dev is used (already configured) so Prisma CLI is available during build
- Timeout connecting to DB
  - Verify provider requires sslmode=require
  - Ensure the database allows connections from Vercel (managed providers do by default)

Appendix: Environment variables quick reference
- DATABASE_URL: e.g. postgresql://user:password@host:port/db?schema=public&sslmode=require
- DIRECT_URL: (optional) direct/non-pooled connection URL for migrations
