#!/usr/bin/env node

const { spawnSync } = require('node:child_process');

function run(cmd, args, options = {}) {
  const result = spawnSync(cmd, args, {
    stdio: 'inherit',
    shell: process.platform === 'win32',
    ...options,
  });
  if (result.error) {
    console.error(`Error running ${cmd} ${args.join(' ')}:`, result.error);
    process.exit(result.status ?? 1);
  }
  if (result.status !== 0) {
    console.error(`Command failed: ${cmd} ${args.join(' ')}`);
    process.exit(result.status);
  }
}

function hasDatabaseUrl() {
  return !!process.env.DATABASE_URL;
}

function log(msg) {
  console.log(`[prisma-deploy] ${msg}`);
}

function runGenerate() {
  log('Generating Prisma Client...');
  run('npx', ['--no', 'prisma', 'generate', '--schema=./prisma/schema.prisma']);
}

function migrateDeploy() {
  if (!hasDatabaseUrl()) {
    log('DATABASE_URL not set. Skipping prisma migrate deploy.');
    return;
  }
  log('Running prisma migrate deploy (safe, idempotent)...');
  run('npx', ['--no', 'prisma', 'migrate', 'deploy', '--schema=./prisma/schema.prisma']);
}

function dbPush({ acceptDataLoss = false } = {}) {
  if (!hasDatabaseUrl()) {
    log('DATABASE_URL not set. Skipping prisma db push.');
    return;
  }
  const args = ['--no', 'prisma', 'db', 'push', '--schema=./prisma/schema.prisma'];
  if (acceptDataLoss) args.push('--accept-data-loss');
  log(`Running prisma db push${acceptDataLoss ? ' (accepting data loss for preview)' : ''}...`);
  run('npx', args);
}

function main() {
  const arg = process.argv[2] || 'vercel';
  const vercelEnv = process.env.VERCEL_ENV || '';
  const nodeEnv = process.env.NODE_ENV || '';

  log(`Starting with arg=${arg}, VERCEL_ENV=${vercelEnv || 'unset'}, NODE_ENV=${nodeEnv || 'unset'}`);

  if (arg === 'deploy') {
    migrateDeploy();
    runGenerate();
    return;
  }

  if (arg === 'push') {
    dbPush({ acceptDataLoss: true });
    runGenerate();
    return;
  }

  // Default: running in Vercel build
  const isProd = vercelEnv === 'production' || nodeEnv === 'production';
  const isPreview = vercelEnv === 'preview' || vercelEnv === 'development' || nodeEnv === 'development';

  if (isProd) {
    migrateDeploy();
  } else if (isPreview) {
    dbPush({ acceptDataLoss: true });
  } else {
    // Unknown env, safest is to only generate
    log('Unknown environment, only generating Prisma Client.');
  }

  runGenerate();
}

main();
