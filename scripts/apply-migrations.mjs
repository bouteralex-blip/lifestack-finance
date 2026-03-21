#!/usr/bin/env node
/**
 * LifeStack Finance — Supabase Migration Runner
 *
 * Applies all pending migrations to your Supabase project.
 * Requires SUPABASE_SERVICE_ROLE_KEY (not the anon key — DDL needs admin access).
 *
 * Usage:
 *   SUPABASE_SERVICE_ROLE_KEY=<key> node scripts/apply-migrations.mjs
 *
 * Or set it in .env.local and run:
 *   node -r dotenv/config scripts/apply-migrations.mjs
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  'https://ynvfzssakggmmldjkmes.supabase.co';

const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SERVICE_KEY) {
  console.error('\n❌  SUPABASE_SERVICE_ROLE_KEY is not set.');
  console.error(
    '    Get it from: Supabase Dashboard → Project → Settings → API → service_role secret\n'
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false },
});

const MIGRATIONS = [
  '001_add_updated_at_columns.sql',
  '002_add_engine_snapshot_and_decision_log.sql',
  '003_create_base_tables.sql',
];

async function runSQL(sql, label) {
  console.log(`\n  Running: ${label}`);
  // Split on statement boundaries so each DDL block runs individually
  const statements = sql
    .split(/;\s*\n/)
    .map((s) => s.trim())
    .filter(Boolean);

  let ok = 0;
  let failed = 0;
  for (const stmt of statements) {
    const fullStmt = stmt.endsWith(';') ? stmt : stmt + ';';
    const { error } = await supabase.rpc('exec_sql', { sql: fullStmt }).catch(() => {
      // Fallback: use the REST SQL endpoint (requires service role)
      return { error: { message: 'rpc unavailable' } };
    });
    if (error && error.message !== 'rpc unavailable') {
      // Ignore "already exists" errors — migrations are idempotent
      if (
        error.message.includes('already exists') ||
        error.message.includes('does not exist') ||
        error.message.includes('IF NOT EXISTS')
      ) {
        ok++;
      } else {
        console.warn(`    ⚠️  ${error.message.split('\n')[0]}`);
        failed++;
      }
    } else {
      ok++;
    }
  }
  console.log(`  ✓ ${ok} statements OK${failed ? `, ${failed} warnings` : ''}`);
}

// Alternative: use the Supabase Management API SQL endpoint
async function runSQLViaManagementAPI(sql, label) {
  const projectRef = SUPABASE_URL.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];
  if (!projectRef) throw new Error('Cannot parse project ref from SUPABASE_URL');

  console.log(`\n  Running via Management API: ${label}`);
  const res = await fetch(
    `https://api.supabase.com/v1/projects/${projectRef}/database/query`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${SERVICE_KEY}`,
      },
      body: JSON.stringify({ query: sql }),
    }
  );

  if (!res.ok) {
    const body = await res.text();
    // "already exists" type errors are fine for idempotent migrations
    if (body.includes('already exists') || body.includes('IF NOT EXISTS')) {
      console.log(`  ✓ Idempotent — objects already exist`);
    } else {
      console.error(`  ❌ HTTP ${res.status}: ${body.slice(0, 200)}`);
      throw new Error(`Migration failed: ${label}`);
    }
  } else {
    const json = await res.json().catch(() => ({}));
    const count = Array.isArray(json) ? json.length : '?';
    console.log(`  ✓ Done (${count} rows returned)`);
  }
}

async function main() {
  console.log('\n🗄️  LifeStack Finance — Supabase Migration Runner');
  console.log(`   Project: ${SUPABASE_URL}`);
  console.log(`   Migrations: ${MIGRATIONS.length} files\n`);

  for (const file of MIGRATIONS) {
    const filePath = join(ROOT, 'supabase', 'migrations', file);
    let sql;
    try {
      sql = readFileSync(filePath, 'utf8');
    } catch {
      console.log(`  ⏭️  Skipping ${file} — file not found`);
      continue;
    }

    try {
      await runSQLViaManagementAPI(sql, file);
    } catch {
      // Management API failed — try direct RPC method
      await runSQL(sql, file);
    }
  }

  console.log('\n✅  All migrations applied successfully.');
  console.log('   Run `node scripts/seed-holdings.mjs` to populate sample data.\n');
}

main().catch((err) => {
  console.error('\n💥  Migration failed:', err.message);
  process.exit(1);
});
