// =========================================================================
// LIFESTACK OS — Portfolio Holdings API Route
// POST: Accept CSV text body, parse into holdings, validate, upsert to Supabase
// GET: Return current holdings from Supabase
// =========================================================================

import { createClient } from '@supabase/supabase-js';
import { normalizeHoldings, validateHoldings } from '../../../lib/engines/holdings-ingestion.js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ynvfzssakggmmldjkmes.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InludmZ6c3Nha2dnbW1sZGprbWVzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMxODU5NTcsImV4cCI6MjA4ODc2MTk1N30.9JenIs9D8B8hmOGQLrLUN5lBZnDr0e9f1qKIIOXZFp4';
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Parse CSV text into an array of holding objects.
 * Expects header row: name,ticker,value,wrapper,currency,assetClass
 */
function parseCSV(csvText) {
  const lines = csvText.trim().split('\n').filter(l => l.trim());
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
  const rows = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim());
    const row = {};
    headers.forEach((h, idx) => {
      const val = values[idx] || '';
      // Map common CSV header variations to expected field names
      if (h === 'name' || h === 'holding' || h === 'description') row.name = val;
      else if (h === 'ticker' || h === 'symbol' || h === 'isin') row.ticker = val;
      else if (h === 'value' || h === 'amount' || h === 'market_value') row.value = val;
      else if (h === 'wrapper' || h === 'account' || h === 'account_type') row.wrapper = val;
      else if (h === 'currency' || h === 'ccy') row.currency = val;
      else if (h === 'assetclass' || h === 'asset_class' || h === 'cls' || h === 'type') row.assetClass = val;
    });
    rows.push(row);
  }

  return rows;
}

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('holdings')
      .select('*')
      .order('value', { ascending: false });

    if (error) throw error;

    const holdings = (data || []).map(r => ({
      name: r.name,
      ticker: r.ticker,
      value: Number(r.value),
      wrapper: r.wrapper || 'GIA',
      currency: r.currency || 'GBP',
      assetClass: r.asset_class || 'Unknown',
      geography: r.geography || 'Global',
      previousValue: r.previous_value ? Number(r.previous_value) : null,
    }));

    const validation = validateHoldings(holdings);

    return Response.json({
      holdings,
      count: holdings.length,
      totalValue: validation?.totalValue || 0,
      dataQuality: validation?.dataQualityScore || 0,
      timestamp: new Date().toISOString(),
    });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const csvText = await request.text();
    if (!csvText?.trim()) {
      return Response.json({ error: 'Empty CSV body' }, { status: 400 });
    }

    // Parse CSV into raw holdings
    const rawHoldings = parseCSV(csvText);
    if (!rawHoldings.length) {
      return Response.json({ error: 'No valid rows found in CSV' }, { status: 400 });
    }

    // Normalize and validate
    const normalized = normalizeHoldings(rawHoldings);
    if (!normalized) {
      return Response.json({ error: 'Normalization failed — no valid holdings' }, { status: 400 });
    }

    const validation = validateHoldings(normalized.holdings);

    // Filter to valid holdings only for upsert
    const validHoldings = normalized.holdings.filter(h => h.isValid);
    if (!validHoldings.length) {
      return Response.json({
        error: 'No valid holdings after validation',
        warnings: normalized.warnings,
        validation,
      }, { status: 400 });
    }

    // Upsert to Supabase holdings table
    const rows = validHoldings.map(h => ({
      name: h.name,
      ticker: h.ticker,
      value: h.value,
      wrapper: h.wrapper,
      currency: h.currency,
      asset_class: h.assetClass,
      updated_at: new Date().toISOString(),
    }));

    // Clear existing holdings and insert fresh set
    const { error: deleteError } = await supabase.from('holdings').delete().neq('name', '');
    if (deleteError) throw deleteError;

    const { error: insertError } = await supabase.from('holdings').insert(rows);
    if (insertError) throw insertError;

    return Response.json({
      success: true,
      imported: validHoldings.length,
      skipped: normalized.invalidCount,
      totalValue: normalized.totalValue,
      dataQuality: validation?.dataQualityScore || 0,
      warnings: normalized.warnings,
      timestamp: new Date().toISOString(),
    });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
