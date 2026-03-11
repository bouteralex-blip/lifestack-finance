'use client';

import { useState, useEffect } from 'react';
import { supabase } from './supabase';

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
  const P = {
    cyan:"#6366f1", indigo:"#818cf8", green:"#22c55e",
    btc:"#f7931a", purple:"#a855f7", amber:"#f59e0b",
    orange:"#fb923c", pink:"#ec4899",
  };
  const colors = [P.cyan, P.indigo, P.green, P.btc, P.purple, "#06b6d4", P.amber, P.orange, P.pink, "#d4a406"];
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

export function useSupabaseData() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState('hardcoded');

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
          setLoading(false);
          return;
        }

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
        console.log('LifeStack: Loaded live data from Supabase (15 tables) ✓');
      } catch (err) {
        console.error('LifeStack: Supabase fetch failed, using hardcoded defaults', err);
      } finally {
        setLoading(false);
      }
    }

    fetchAll();
  }, []);

  return { data, loading, source };
}
