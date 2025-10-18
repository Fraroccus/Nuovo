import { Client } from 'pg';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function ensureMigrationsTable(client) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id SERIAL PRIMARY KEY,
      name TEXT UNIQUE NOT NULL,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);
}

async function getAppliedMigrations(client) {
  const res = await client.query('SELECT name FROM schema_migrations ORDER BY name ASC');
  const set = new Set(res.rows.map((r) => r.name));
  return set;
}

async function applyMigration(client, name, sql) {
  // eslint-disable-next-line no-console
  console.log(`Applying migration: ${name}`);
  await client.query('BEGIN');
  try {
    await client.query(sql);
    await client.query('INSERT INTO schema_migrations(name) VALUES($1)', [name]);
    await client.query('COMMIT');
    // eslint-disable-next-line no-console
    console.log(`Applied migration: ${name}`);
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  }
}

async function main() {
  const databaseUrl = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/postgres';

  const client = new Client({ connectionString: databaseUrl });
  await client.connect();

  try {
    await ensureMigrationsTable(client);

    const migrationsDir = path.resolve(__dirname, '..', 'migrations');
    let files = [];
    try {
      files = await readdir(migrationsDir);
    } catch (err) {
      if (err.code === 'ENOENT') {
        // eslint-disable-next-line no-console
        console.log('No migrations directory found, nothing to do.');
        return;
      }
      throw err;
    }

    files = files.filter((f) => /\.(sql)$/i.test(f)).sort();

    const applied = await getAppliedMigrations(client);

    for (const file of files) {
      const name = file;
      if (applied.has(name)) {
        // eslint-disable-next-line no-console
        console.log(`Skipping already applied migration: ${name}`);
        continue;
      }
      const p = path.join(migrationsDir, file);
      const sql = await readFile(p, 'utf8');
      await applyMigration(client, name, sql);
    }

    // eslint-disable-next-line no-console
    console.log('Migrations complete');
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('Migration failed:', err);
  process.exitCode = 1;
});
