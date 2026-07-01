#!/usr/bin/env node

const { spawnSync } = require('node:child_process');
const { existsSync, readdirSync } = require('node:fs');
const { join } = require('node:path');

const databaseUrl = process.env.DATABASE_URL || process.env.SUPABASE_DB_URL || process.env.POSTGRES_URL;
const command = process.env.PSQL_BIN || 'psql';
const root = process.cwd();
const migrationsDir = join(root, 'supabase', 'migrations');
const seedFile = join(root, 'supabase', 'seed', 'dev_seed.sql');
const validationFile = join(root, 'supabase', 'tests', 'database_validation.sql');

if (!databaseUrl) {
  console.error('Set DATABASE_URL, SUPABASE_DB_URL, or POSTGRES_URL before running this script.');
  process.exit(1);
}

if (!existsSync(migrationsDir)) {
  console.error(`Missing migrations directory: ${migrationsDir}`);
  process.exit(1);
}

const args = process.argv.slice(2);
const includeSeed = args.includes('--seed');
const includeValidation = args.includes('--validate');

const files = readdirSync(migrationsDir)
  .filter((file) => file.endsWith('.sql'))
  .sort()
  .map((file) => join(migrationsDir, file));

if (includeSeed) {
  files.push(seedFile);
}

if (includeValidation) {
  files.push(validationFile);
}

for (const file of files) {
  if (!existsSync(file)) {
    console.error(`Missing SQL file: ${file}`);
    process.exit(1);
  }

  console.log(`Applying ${file}`);
  const result = spawnSync(command, [databaseUrl, '--set', 'ON_ERROR_STOP=1', '--file', file], {
    stdio: 'inherit',
    shell: process.platform === 'win32',
  });

  if (result.status !== 0) {
    process.exit(result.status || 1);
  }
}
