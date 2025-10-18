const os = require('os');
let prisma;

async function checkDb() {
  if (!process.env.DATABASE_URL) {
    return { status: 'skipped', detail: 'DATABASE_URL not set' };
  }
  try {
    if (!prisma) {
      const { PrismaClient } = require('@prisma/client');
      if (!global.__prisma__) {
        global.__prisma__ = new PrismaClient();
      }
      prisma = global.__prisma__;
    }
    await prisma.$queryRaw`SELECT 1`;
    return { status: 'ok' };
  } catch (e) {
    return { status: 'error', detail: e?.message || String(e) };
  }
}

module.exports = async (req, res) => {
  const start = Date.now();
  const db = await checkDb();
  const uptime = process.uptime();

  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'no-store');

  const body = {
    ok: db.status !== 'error',
    db,
    uptime,
    hostname: os.hostname(),
    timestamp: new Date().toISOString(),
    durationMs: Date.now() - start,
  };

  const statusCode = db.status === 'error' ? 503 : 200;
  res.status(statusCode).end(JSON.stringify(body));
};
