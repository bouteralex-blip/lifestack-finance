'use client';

import { useState, useEffect } from 'react';
import { supabase } from './supabase';
import { FRESHNESS_RULES } from './defaults';

// =========================================================================
// LIFESTACK OS — DATA LAYER WITH FRESHNESS + SOURCE TRACKING
// Phase 1: Truth Layer — every field knows if it's live, stale, or fallback
// =========================================================================

// Freshness state calculator — returns { isLive, isStale, isFallback, age, label }
export function computeFreshness(updatedAt, tableKey) {
  if (!updatedAt) return { isLive: false, isStale: false, isFallback: true, age: null, label: 'Fallback', level: 'fallback' };

  const now = new Date();
  const updated = new Date(updatedAt);
  const ageMs = now - updated;
  const ageHours = ageMs / (1000 * 60 * 60);
  const ageDays = ageHours / 24;
  const staleThreshold = FRESHNESS_RULES[tableKey] || 168; // default 7 days

  // Human-readable age label
  let label;
  if (ageHours < 1) label = `${Math.round(ageMs / 60000)}m ago`;
  else if (ageHours < 24) label = `${Math.round(ageHours)}h ago`;
  else if (ageDays < 7) label = `${Math.round(ageDays)}d ago`;
  else label = `${Math.round(ageDays / 7)}w ago`;

  const isStale = ageHours > staleThreshold;
  return {
    isLive: !isStale,
    isStale,
    isFallback: false,
    age: ageHours,
    label: isStale ? `Stale (${label})` : `Live (${label})`,
    level: isStale ? 'stale' : 'live',
  };
}

// Maps Supabase row → PORT object shape
function mapPortConfig(row) {
  if (!row) return null;
  const d = new Date(row.snapshot_date);
  const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  return {
    date: `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`,
    age: 32,
    netWorth: Number(row.net_worth),
    assets: Number(row.total_assets),
    debts: Number(row.total_debts),
    nw6moAgo: Number(row.nw_6mo_ago),
    nwPeak: Number(row.nw_peak),
    grossSalary: Number(row.gross_salary),
    grossBonus: Number(row.gross_bonus),
    monthlyExpenses: Number(row.monthly_expenses),
    taxRate: Number(row.tax_rate),
    niRate: Number(row.ni_rate),
    fireTarget: Number(row.fire_target),
    amexDebt: Number(row.amex_debt),
    monzoFlex: Number(row.monzo_flex),
    benchReturn: row.bench_return != null ? Number(row.bench_return) : -0.028,
    inflation: row.inflation != null ? Number(row.inflation) : 0.032,
  };
}

// Maps Supabase rows → HOLDINGS array shape
function mapHoldings(rows) {
  if (!rows?.length) return null;
  return rows.map(r => ({
    name: r.name,
    val: Number(r.value),
    cls: r.asset_class,
    geo: r.geography || 'Global',
    ccy: r.currency || 'GBP',
    wrapper: r.wrapper || 'GIA',
    prev: r.previous_value ? Number(r.previous_value) : undefined,
  }));
}

// Maps Supabase rows → NW_WEEKLY array shape
function mapNwHistory(rows) {
  if (!rows?.length) return null;
  return rows
    .sort((a, b) => new Date(a.week_ending) - new Date(b.week_ending))
    .map(r => {
      const d = new Date(r.week_ending);
      const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
      return {
        d: `${d.getDate()} ${months[d.getMonth()]}`,
        nw: Number(r.net_worth),
        a: Number(r.total_assets),
      };
    });
}

// Maps Supabase rows → BRIDGE_ITEMS array shape
function mapBridge(rows) {
  if (!rows?.length) return null;
  return rows
    .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
    .map(r => ({
      name: r.item_name,
      delta: Number(r.delta),
      type: r.item_type,
    }));
}

// Maps Supabase row → RISK object shape
function mapRisk(row) {
  if (!row) return null;
  return {
    vol: Number(row.volatility),
    downDev: Number(row.downside_dev),
    sharpe: Number(row.sharpe),
    sortino: Number(row.sortino),
    calmar: Number(row.calmar),
    omega: 1.16,
    maxDD: Number(row.max_drawdown),
    ddDur: Number(row.dd_duration_days),
    ulcer: Number(row.ulcer_index),
    var95: Number(row.var_95),
    cvar95: Number(row.cvar_95),
    cdar: -12.8,
    tail: 0.96, pain: 4.6, painR: 0.38, gtp: 1.14, burke: 0.32, sterling: 0.26, martin: 0.22,
    csr: 1.09,
    beta: Number(row.beta),
    te: Number(row.tracking_error),
    ir: -0.18, treynor: 5.4, m2: 4.1,
    skew: Number(row.skew),
    kurt: Number(row.kurtosis),
    hhi: Number(row.hhi),
    effPos: Number(row.effective_positions),
    divRatio: 1.52, entropy: 2.68,
  };
}

// Maps Supabase row → CRYPTO object shape
function mapCrypto(row) {
  if (!row) return null;
  return {
    btcPrice: Number(row.btc_price),
    btcATH: Number(row.btc_ath),
    btcDD: Number(row.btc_drawdown),
    mvrvZ: Number(row.mvrv_z),
    nupl: Number(row.nupl),
    fear: Number(row.fear_greed),
    reserves: "2.48M ATL",
    funding: 0.01,
    dom: Number(row.btc_dominance),
    rsi: Number(row.rsi),
    sopr: Number(row.sopr),
    reserveRisk: Number(row.reserve_risk),
    whale: "270K BTC",
    etfFlow: "+$500M 5 Mar",
    ethPrice: Number(row.eth_price),
    solPrice: Number(row.sol_price),
  };
}

// Maps Supabase rows → OPPS array shape
function mapOpps(rows) {
  if (!rows?.length) return null;
  const colors = ["#6366f1", "#818cf8", "#22c55e", "#f7931a", "#a855f7", "#06b6d4", "#f59e0b", "#fb923c", "#ec4899", "#d4a406"];
  return rows.map((r, i) => ({
    t: r.title,
    c: Number(r.conviction),
    tm: Number(r.timing),
    alpha: r.alpha_range || '',
    w: r.wrapper || '',
    sz: r.size_guidance || '',
    cat: r.catalyst || '',
    risks: r.risks || [],
    kill: r.kill_switch || 'None',
    col: colors[i % colors.length],
    val: Number(r.estimated_value || 0),
  }));
}

// Maps Supabase rows → FACTORS array shape
function mapFactors(rows) {
  if (!rows?.length) return null;
  return rows
    .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
    .map(r => ({
      f: r.factor_name,
      p: Number(r.portfolio_weight),
      b: Number(r.benchmark_weight),
      ret: Number(r.return_contribution),
      risk: Number(r.risk_contribution),
      intent: r.intent || '',
    }));
}

// Maps Supabase rows → STRESS array shape
function mapStress(rows) {
  if (!rows?.length) return null;
  return rows
    .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
    .map(r => ({
      s: r.scenario_name,
      impact: Number(r.impact_pct),
      exp: r.exposure_desc || '',
      pr: r.probability || '',
    }));
}

// Maps Supabase rows → BONUS object shape
function mapBonus(configRow, scenarioRows) {
  if (!configRow || !scenarioRows?.length) return null;
  const bonus = {
    gross: Number(configRow.gross_bonus),
    tax: Number(configRow.tax),
    ni: Number(configRow.ni),
    postTax: Number(configRow.post_tax),
  };
  scenarioRows
    .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
    .forEach(r => {
      const key = r.scenario_name.toLowerCase().slice(0, 3); // def, bal, agg
      bonus[key] = {
        debt: Number(r.debt), isa: Number(r.isa), pension: Number(r.pension),
        equity: Number(r.equity), crypto: Number(r.crypto), ai: Number(r.ai),
        liq: Number(r.liquidity), travel: Number(r.travel),
        yr1: Number(r.yr1_expected), yr3: Number(r.yr3_expected), yr5: Number(r.yr5_expected),
      };
    });
  return bonus;
}

// Maps Supabase rows → monthlyReturns + volTrend
function mapMonthly(rows) {
  if (!rows?.length) return null;
  return rows.map(r => ({
    m: r.month_label,
    r: Number(r.return_pct),
    vol: r.volatility ? Number(r.volatility) : null,
  }));
}

// Maps Supabase row → scorecard
function mapScorecard(row) {
  if (!row) return null;
  return {
    overall: Number(row.overall), returns: Number(row.returns),
    riskMgmt: Number(row.risk_mgmt), process: Number(row.process),
    taxEff: Number(row.tax_eff), diversify: Number(row.diversify),
    capitalEff: Number(row.capital_eff), commentary: row.commentary || '',
  };
}

// Extract timestamp from a Supabase row — checks updated_at, then snapshot_date, then created_at
function extractTimestamp(row) {
  if (!row) return null;
  return row.updated_at || row.snapshot_date || row.created_at || null;
}

// Extract timestamp from an array of rows — use the most recent
function extractTimestampFromRows(rows) {
  if (!rows?.length) return null;
  const timestamps = rows
    .map(r => r.updated_at || r.snapshot_date || r.created_at)
    .filter(Boolean)
    .map(t => new Date(t).getTime());
  if (!timestamps.length) return null;
  return new Date(Math.max(...timestamps)).toISOString();
}

export function useSupabaseData() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState('hardcoded');
  const [freshness, setFreshness] = useState({});
  const [timestamps, setTimestamps] = useState({});

  useEffect(() => {
    async function fetchAll() {
      try {
        const [configRes, holdingsRes, nwRes, bridgeRes, riskRes, cryptoRes, oppsRes,
               factorsRes, stressRes, bonusConfigRes, bonusScenariosRes, monthlyRes, scorecardRes, refDataRes] = await Promise.all([
          supabase.from('portfolio_config').select('*').order('snapshot_date', { ascending: false }).limit(1),
          supabase.from('holdings').select('*').order('value', { ascending: false }),
          supabase.from('net_worth_history').select('*').order('week_ending', { ascending: true }),
          supabase.from('nw_bridge').select('*').order('sort_order', { ascending: true }),
          supabase.from('risk_metrics').select('*').order('snapshot_date', { ascending: false }).limit(1),
          supabase.from('crypto_metrics').select('*').order('snapshot_date', { ascending: false }).limit(1),
          supabase.from('opportunities').select('*').order('conviction', { ascending: false }),
          supabase.from('factor_exposures').select('*').order('sort_order', { ascending: true }),
          supabase.from('stress_scenarios').select('*').order('sort_order', { ascending: true }),
          supabase.from('bonus_config').select('*').order('snapshot_date', { ascending: false }).limit(1),
          supabase.from('bonus_scenarios').select('*').order('sort_order', { ascending: true }),
          supabase.from('monthly_returns').select('*').order('snapshot_date', { ascending: true }),
          supabase.from('portfolio_scorecard').select('*').order('snapshot_date', { ascending: false }).limit(1),
          supabase.from('reference_data').select('*'),
        ]);

        // Check if we got meaningful data back
        const config = configRes.data?.[0];
        if (!config) {
          console.log('LifeStack: No Supabase data, using hardcoded defaults');
          // Set all freshness to fallback
          const fallbackFreshness = {};
          Object.keys(FRESHNESS_RULES).forEach(key => {
            fallbackFreshness[key] = computeFreshness(null, key);
          });
          setFreshness(fallbackFreshness);
          setLoading(false);
          return;
        }

        // Extract timestamps per table for freshness tracking
        const ts = {
          portfolio_config: extractTimestamp(config),
          holdings: extractTimestampFromRows(holdingsRes.data),
          net_worth_history: extractTimestampFromRows(nwRes.data),
          nw_bridge: extractTimestampFromRows(bridgeRes.data),
          risk_metrics: extractTimestamp(riskRes.data?.[0]),
          crypto_metrics: extractTimestamp(cryptoRes.data?.[0]),
          opportunities: extractTimestampFromRows(oppsRes.data),
          factor_exposures: extractTimestampFromRows(factorsRes.data),
          stress_scenarios: extractTimestampFromRows(stressRes.data),
          bonus_config: extractTimestamp(bonusConfigRes.data?.[0]),
          bonus_scenarios: extractTimestampFromRows(bonusScenariosRes.data),
          monthly_returns: extractTimestampFromRows(monthlyRes.data),
          portfolio_scorecard: extractTimestamp(scorecardRes.data?.[0]),
          reference_data: extractTimestampFromRows(refDataRes.data),
        };
        setTimestamps(ts);

        // Compute freshness per table
        const fresh = {};
        Object.keys(ts).forEach(key => {
          fresh[key] = computeFreshness(ts[key], key);
        });
        setFreshness(fresh);

        const mapped = {
          PORT: mapPortConfig(config),
          HOLDINGS: mapHoldings(holdingsRes.data),
          NW_WEEKLY: mapNwHistory(nwRes.data),
          BRIDGE_ITEMS: mapBridge(bridgeRes.data),
          RISK: mapRisk(riskRes.data?.[0]),
          CRYPTO: mapCrypto(cryptoRes.data?.[0]),
          OPPS: mapOpps(oppsRes.data),
          FACTORS: mapFactors(factorsRes.data),
          STRESS: mapStress(stressRes.data),
          BONUS: mapBonus(bonusConfigRes.data?.[0], bonusScenariosRes.data),
          MONTHLY: mapMonthly(monthlyRes.data),
          SCORECARD: mapScorecard(scorecardRes.data?.[0]),
          REF_DATA: refDataRes.data ? Object.fromEntries(refDataRes.data.map(r => [r.data_key, r.data_value])) : null,
        };

        setData(mapped);
        setSource('supabase');

        // Log freshness summary
        const liveCount = Object.values(fresh).filter(f => f.isLive).length;
        const staleCount = Object.values(fresh).filter(f => f.isStale).length;
        const fallbackCount = Object.values(fresh).filter(f => f.isFallback).length;
        console.log(`LifeStack: Loaded live data from Supabase (14 tables) — ${liveCount} live, ${staleCount} stale, ${fallbackCount} fallback`);
      } catch (err) {
        console.error('LifeStack: Supabase fetch failed, using hardcoded defaults', err);
        // Set all freshness to fallback on error
        const fallbackFreshness = {};
        Object.keys(FRESHNESS_RULES).forEach(key => {
          fallbackFreshness[key] = computeFreshness(null, key);
        });
        setFreshness(fallbackFreshness);
      } finally {
        setLoading(false);
      }
    }

    fetchAll();
  }, []);

  return { data, loading, source, freshness, timestamps };
}
