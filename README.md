Vercel + Prisma + Managed Postgres starter

What’s included
- Serverless API route: GET /api/health
- Prisma ORM configured for Postgres (prisma/schema.prisma)
- Safe migration script for Vercel builds (scripts/run-prisma.js)
- vercel.json preconfigured for Node.js 20, Prisma bundling, and build/install commands
- .env.example with required environment variables
- Deployment documentation in docs/DEPLOYMENT.md

Quick start (local)
1) npm install
2) cp .env.example .env and set DATABASE_URL
3) npx prisma db push
4) (Optional) vercel dev

Deploy
- Import the repo in Vercel
- Set DATABASE_URL (+ DIRECT_URL optionally) for Production and Preview
- Build will run safe migrations automatically

Health check
- GET /api/health returns JSON with overall status and DB connectivity

See docs/DEPLOYMENT.md for full details.
