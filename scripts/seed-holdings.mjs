#!/usr/bin/env node
/**
 * LifeStack Finance — Supabase Seed Runner
 *
 * Populates sample portfolio data into your Supabase project.
 * Uses SUPABASE_SERVICE_ROLE_KEY for admin access.
 *
 * Usage:
 *   SUPABASE_SERVICE_ROLE_KEY=<key> node scripts/seed-holdings.mjs
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
  console.error('\n❌  SUPABASE_SERVICE_ROLE_KEY is not set.\n');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false },
});

async function runSeedViaManagementAPI(sql) {
  const projectRef = SUPABASE_URL.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];
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
  return res;
}

async function main() {
  console.log('\n🌱  LifeStack Finance — Seed Data Runner');
  console.log(`   Project: ${SUPABASE_URL}\n`);

  const seedPath = join(ROOT, 'supabase', 'seed.sql');
  const sql = readFileSync(seedPath, 'utf8');

  // Try Management API first
  try {
    const res = await runSeedViaManagementAPI(sql);
    if (res.ok) {
      console.log('✅  Seed data inserted via Management API.');
    } else {
      const body = await res.text();
      if (body.includes('already exists') || body.includes('ON CONFLICT')) {
        console.log('✅  Seed data already present (ON CONFLICT DO NOTHING).');
      } else {
        console.warn(`⚠️  Management API response: ${body.slice(0, 300)}`);
        console.log('   Falling back to row-by-row insert...');
        await seedRowByRow(supabase);
      }
    }
  } catch (err) {
    console.warn('   Management API unavailable:', err.message);
    console.log('   Falling back to row-by-row insert...');
    await seedRowByRow(supabase);
  }

  console.log('\n   Done! Open your app to see the populated dashboard.\n');
}

// Fallback: insert key rows using supabase-js client
async function seedRowByRow(sb) {
  const holdings = [
    { ticker: 'VWRL', name: 'Vanguard FTSE All-World ETF',   asset_class: 'global_equity', wrapper: 'ISA',    currency: 'GBP', quantity: 850,   cost_basis: 82.50,  current_price: 107.20, weight: 18.5 },
    { ticker: 'SWDA', name: 'iShares Core MSCI World ETF',    asset_class: 'global_equity', wrapper: 'ISA',    currency: 'GBP', quantity: 400,   cost_basis: 65.00,  current_price: 84.30,  weight: 6.8  },
    { ticker: 'VUSA', name: 'Vanguard S&P 500 ETF',           asset_class: 'us_equity',     wrapper: 'ISA',    currency: 'GBP', quantity: 600,   cost_basis: 55.00,  current_price: 72.80,  weight: 8.9  },
    { ticker: 'ISF',  name: 'iShares FTSE 100 ETF',           asset_class: 'uk_equity',     wrapper: 'ISA',    currency: 'GBP', quantity: 1200,  cost_basis: 7.40,   current_price: 8.92,   weight: 2.2  },
    { ticker: 'SMH',  name: 'VanEck Semiconductor ETF',       asset_class: 'us_equity',     wrapper: 'SIPP',   currency: 'USD', quantity: 180,   cost_basis: 195.00, current_price: 245.80, weight: 9.0  },
    { ticker: 'EQQQ', name: 'Invesco NASDAQ-100 ETF',         asset_class: 'us_equity',     wrapper: 'SIPP',   currency: 'GBP', quantity: 250,   cost_basis: 310.00, current_price: 388.50, weight: 19.7 },
    { ticker: 'VAGP', name: 'Vanguard Global Aggregate Bond', asset_class: 'bonds',         wrapper: 'SIPP',   currency: 'GBP', quantity: 3000,  cost_basis: 17.00,  current_price: 16.20,  weight: 9.8  },
    { ticker: 'BTC',  name: 'Bitcoin',                        asset_class: 'crypto',        wrapper: 'WALLET', currency: 'GBP', quantity: 0.95,  cost_basis: 42000,  current_price: 53800,  weight: 10.4 },
    { ticker: 'ETH',  name: 'Ethereum',                       asset_class: 'crypto',        wrapper: 'WALLET', currency: 'GBP', quantity: 4.20,  cost_basis: 2200,   current_price: 1560,   weight: 1.3  },
    { ticker: 'SGLN', name: 'iShares Physical Gold ETF',      asset_class: 'commodities',   wrapper: 'GIA',    currency: 'GBP', quantity: 600,   cost_basis: 28.00,  current_price: 42.10,  weight: 5.1  },
    { ticker: 'CASH', name: 'Chase Saver (4.3% AER)',         asset_class: 'cash',          wrapper: 'CASH',   currency: 'GBP', quantity: 62000, cost_basis: 1.00,   current_price: 1.00,   weight: 12.6 },
  ];

  for (const h of holdings) {
    const { error } = await sb.from('holdings').upsert(h, { onConflict: 'ticker' });
    if (error && !error.message.includes('duplicate')) {
      console.warn(`  ⚠️  holdings[${h.ticker}]: ${error.message}`);
    } else {
      console.log(`  ✓ ${h.ticker} (${h.wrapper})`);
    }
  }

  // Seed portfolio config
  const { error: cfgErr } = await sb.from('portfolio_config').upsert({
    target_allocation: { global_equity: 55, uk_equity: 10, bonds: 10, property: 5, crypto: 10, cash: 10 },
    risk_profile: 'growth',
    fire_target: 2500000,
    annual_spend: 75000,
    currency: 'GBP',
  });
  if (cfgErr) console.warn('  ⚠️  portfolio_config:', cfgErr.message);
  else console.log('  ✓ portfolio_config');
}

main().catch((err) => {
  console.error('\n💥  Seed failed:', err.message);
  process.exit(1);
});
