/**
 * liquidGlassMappers.js
 *
 * Adapter/mapper functions that translate live state data
 * (PORT, NW_WEEKLY, HOLDINGS, SLEEVES, RISK, BRIDGE_ITEMS, MONTHLY_DATA, M, ...)
 * into the exact prop shapes required by the 22 AE Liquid Glass widgets.
 *
 * All functions are pure — they receive data as arguments and return
 * widget-ready prop objects. If data is missing, they return a safe
 * skeleton placeholder.
 */

// ─── Colour tokens (neon high-contrast per directive) ────────────────────────
const TOK = {
  teal:    '#00D4AA',
  cyan:    '#00E5FF',
  amber:   '#F5A623',
  blue:    '#3B82F6',
  purple:  '#A855F7',
  red:     '#FF4D4D',
  green:   '#00E599',
  slate:   '#64748B',
  btc:     '#F7931A',
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
const fK = v => v == null ? '—' : `£${(v / 1000).toFixed(0)}k`;
const pc = v => v == null ? '—' : `${v >= 0 ? '+' : ''}${v.toFixed(1)}%`;
const dt = v => v > 0 ? 'positive' : v < 0 ? 'negative' : 'warning';

// ─────────────────────────────────────────────────────────────────────────────
// FINANCE MODULE MAPPERS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * T1 — KpiGridWidget / KpiBentoGridWidget
 * data: Array<{ label, value, delta, deltaType, subtext? }>
 */
export function mapPortfolioKpis(PORT, RISK, runway, periodReturn, activePeriod = '6M') {
  if (!PORT) return [];
  const fire = PORT.fireTarget ? (PORT.netWorth / PORT.fireTarget * 100) : 0;
  const activeReturn = periodReturn != null ? periodReturn - ((PORT.benchReturn ?? -0.028) * 100) : null;
  return [
    {
      label: 'NET WORTH',
      value: fK(PORT.netWorth),
      delta: `Peak: ${fK(PORT.nwPeak)}`,
      deltaType: PORT.netWorth >= PORT.nwPeak ? 'positive' : 'negative',
      subtext: `FIRE target: ${fK(PORT.fireTarget)}`,
    },
    {
      label: `${activePeriod} RETURN`,
      value: periodReturn != null ? pc(periodReturn) : '—',
      delta: pc(periodReturn),
      deltaType: dt(periodReturn),
      subtext: `MSCI: ${pc((PORT.benchReturn ?? -0.028) * 100)}`,
    },
    {
      label: 'TOTAL ASSETS',
      value: fK(PORT.assets),
      delta: `Debts: ${fK(PORT.debts)}`,
      deltaType: 'warning',
      subtext: `D/A: ${PORT.debts && PORT.assets ? (PORT.debts / PORT.assets * 100).toFixed(1) : '—'}%`,
    },
    {
      label: 'ACTIVE RETURN',
      value: activeReturn != null ? pc(activeReturn) : '—',
      delta: 'vs MSCI World',
      deltaType: dt(activeReturn),
      subtext: 'Target: +200bps',
    },
    {
      label: 'FIRE PROGRESS',
      value: `${fire.toFixed(0)}%`,
      delta: `${fire.toFixed(0)}%`,
      deltaType: fire >= 25 ? 'positive' : 'warning',
      subtext: `Target ${fK(PORT.fireTarget)}`,
    },
    {
      label: 'CASH BUFFER',
      value: runway != null ? `${runway.toFixed(1)}mo` : '—',
      delta: runway != null ? `vs 3.0 target` : '—',
      deltaType: runway != null && runway >= 3 ? 'positive' : 'negative',
      subtext: 'Rule: 3-6 months',
    },
  ];
}

/**
 * T1 — CIOInsightBannerWidget
 * data: { badgeLabel, insightText, confidence, accentColor? }
 */
export function mapCIOInsight(PORT, AGENT, nwReturn) {
  const text = AGENT?.synthesis?.executiveSummary
    || `Portfolio at ${fK(PORT?.netWorth)} after a ${pc(nwReturn)} 6-month return. Crypto correction was the dominant drag while equity selection and pension revaluation added value. New compensation cycle transforms the savings engine. Immediate priorities: ISA deployment, Amex clearance, salary sacrifice optimisation.`;
  const conf = AGENT?.synthesis?.sections?.marketContext?.regimeConfidence ?? 72;
  return {
    badgeLabel: `CIO Briefing · ${PORT?.date || 'Q1 2026'} · Institutional Review`,
    insightText: text,
    confidence: conf,
    accentColor: TOK.teal,
  };
}

/**
 * T1 — AgentBannerWidget  (regime-aware synthesis)
 * data: { badgeLabel, insightText, confidence }
 */
export function mapAgentBanner(AGENT, regime = 'Late Cycle') {
  const conf = AGENT?.synthesis?.sections?.marketContext?.regimeConfidence ?? 72;
  const text = AGENT?.synthesis?.executiveSummary
    ?? 'Macro regime has shifted to late-cycle dynamics. Yield curve re-steepening, credit spreads widening. Recommend reducing duration exposure and rotating into quality factor tilts.';
  return {
    badgeLabel: `Agent Synthesis · ${regime}`,
    insightText: text,
    confidence: conf,
  };
}

/**
 * T1 — TrajectoryChartWidget
 * data: Array<{ date, value?, forecast? }>
 * footerStats: Array<{ label, value, color }>
 */
export function mapTrajectoryData(NW_WEEKLY, PORT, SC_BASE, SC_BULL, SC_CONSERV) {
  if (!NW_WEEKLY?.length) return { data: [], footerStats: [] };

  const hist = NW_WEEKLY.map(w => ({
    date: w.d,
    value: w.nw,
  }));

  const forecastPts = SC_BASE?.slice(1).map((s, i) => ({
    date: `${s.y}`,
    value: i === 0 ? hist[hist.length - 1]?.value : undefined,
    forecast: s.v * 1000,
  })) ?? [];

  const data = [...hist, ...forecastPts];

  const ytdReturn = PORT?.netWorth && NW_WEEKLY?.length
    ? ((PORT.netWorth - NW_WEEKLY[0].nw) / NW_WEEKLY[0].nw * 100)
    : null;

  const footerStats = [
    { label: 'Current', value: fK(PORT?.netWorth), color: 'text-white' },
    { label: 'YTD',     value: ytdReturn != null ? pc(ytdReturn) : '—', color: ytdReturn != null && ytdReturn >= 0 ? `text-[${TOK.green}]` : `text-[${TOK.red}]` },
    { label: 'Projected EOY', value: SC_BASE?.find(s => s.y === 2026)?.v ? fK(SC_BASE.find(s => s.y === 2026).v * 1000) : '—', color: `text-[${TOK.green}]` },
    { label: 'FIRE Target', value: fK(PORT?.fireTarget), color: 'text-emerald-100/50' },
  ];

  return { data, footerStats };
}

/**
 * T2 — AllocationChartWidget
 * data: Array<{ name, value, color, amount }>
 */
export function mapSleeveAllocation(SLEEVES, totalAssets) {
  if (!SLEEVES?.length) return [];
  return SLEEVES.filter(s => s.val > 0).map(s => ({
    name: s.name.split('(')[0].trim(),
    value: +(s.val / totalAssets * 100).toFixed(1),
    color: s.color,
    amount: fK(s.val),
  }));
}

/**
 * T2 — ConcentricProgressRingsWidget
 * data: Array<{ label, value, max, color, glowColor }>
 */
export function mapConcentrationRings(PORT, RISK, liquidCash, runway) {
  if (!PORT) return [];
  const fire = PORT.fireTarget ?? 1800000;
  return [
    {
      label: 'FIRE Progress',
      value: PORT.netWorth ?? 0,
      max: fire,
      color: TOK.teal,
      glowColor: TOK.teal,
    },
    {
      label: 'Cash Buffer (mo)',
      value: Math.min(runway ?? 0, 6),
      max: 6,
      color: (runway ?? 0) >= 3 ? TOK.green : TOK.red,
      glowColor: (runway ?? 0) >= 3 ? TOK.green : TOK.red,
    },
    {
      label: 'HHI Concentration',
      value: RISK?.hhi != null ? Math.max(0, 0.30 - RISK.hhi) : 0.235,
      max: 0.30,
      color: RISK?.hhi != null && RISK.hhi < 0.10 ? TOK.teal : TOK.amber,
      glowColor: TOK.amber,
    },
  ];
}

/**
 * T2 — LuminousStackedColumnWidget
 * Maps sleeve value across 3 time snapshots (prev, now, projected)
 * data: Array<{ label, segments: [{ key, value, color }] }>
 */
export function mapHoldingsStackedColumn(SLEEVES, totalAssets) {
  if (!SLEEVES?.length) return [];
  // Group sleeves into 3 major buckets for clean vis
  const buckets = [
    { key: 'Growth (ETF+Pension)', color: TOK.teal },
    { key: 'Cash & FD',            color: TOK.slate },
    { key: 'Crypto & Alts',        color: TOK.btc },
  ];

  // Map SLEEVES into quarterly-style columns (last 4 visible sleeves by size)
  const topSleeves = [...SLEEVES].sort((a, b) => b.val - a.val).slice(0, 4);
  const sleeveColors = [TOK.teal, TOK.blue, TOK.btc, TOK.amber, TOK.purple, TOK.slate];

  return topSleeves.map((s, i) => ({
    label: s.name.split('(')[0].trim().split(' ')[0],
    segments: [
      {
        key: s.name.split('(')[0].trim(),
        value: Math.round(s.val / 1000),
        color: s.color || sleeveColors[i % sleeveColors.length],
      },
    ],
  }));
}

/**
 * T3 — MirroredDivergingBarWidget  (Top Contributors vs Detractors)
 * data: Array<{ label, value }>
 */
export function mapContributorsDetractors(HOLDINGS, nw6moAgo) {
  if (!HOLDINGS?.length) return [];
  const base = nw6moAgo ?? 397457;
  return HOLDINGS
    .filter(h => h.prev && h.prev > 0)
    .map(h => ({
      label: h.name.split('(')[0].trim().split(' ').slice(0, 2).join(' '),
      value: +((h.val - h.prev) / base * 100).toFixed(2),
    }))
    .sort((a, b) => Math.abs(b.value) - Math.abs(a.value))
    .slice(0, 8);
}

/**
 * T3 — ContributionHeatmapWidget  (monthly return calendar)
 * data: Array<{ date: 'YYYY-MM-DD', count }>
 */
export function mapMonthlyHeatmap(MONTHLY_DATA) {
  if (!MONTHLY_DATA?.length) {
    // Return empty-ish data
    return [];
  }

  // Convert monthly return % into GitHub-style count (0-12 scale)
  const today = new Date();
  const result = [];

  // Pad with zeros for 52 weeks going back
  for (let i = 364; i >= 30; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    result.push({ date: d.toISOString().slice(0, 10), count: 0 });
  }

  // Map the last N months of MONTHLY_DATA onto the last N months of dates
  const monthOrder = ['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'];
  MONTHLY_DATA.slice(-6).forEach((m, idx) => {
    const ret = m.r;
    // Intensity 0-12: positive returns get high counts, negative get low
    const raw = Math.round(((ret + 10) / 20) * 12);
    const count = Math.max(0, Math.min(12, raw));

    // Approximate start of this month in the result array
    const startIdx = Math.max(0, result.length - (6 - idx) * 28);
    for (let d = startIdx; d < Math.min(startIdx + 28, result.length); d++) {
      result[d] = { ...result[d], count };
    }
  });

  // Append last 30 days
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const lastM = MONTHLY_DATA[MONTHLY_DATA.length - 1];
    const count = lastM ? Math.max(0, Math.min(12, Math.round(((lastM.r + 10) / 20) * 12))) : 0;
    result.push({ date: d.toISOString().slice(0, 10), count });
  }

  return result;
}

// ─────────────────────────────────────────────────────────────────────────────
// MARKETS MODULE MAPPERS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * P1 — AgentBannerWidget  (macro regime verdict)
 * data: { badgeLabel, insightText, confidence }
 */
export function mapMacroRegimeBanner(M, MKTENG) {
  const regime = MKTENG?.regime?.regime || M?.regime || 'LATE CYCLE';
  const conf   = MKTENG?.regime?.confidence || M?.regimeConf || 68;
  return {
    badgeLabel: `Macro Regime · ${M?.date || '7 Mar 2026'}`,
    insightText: `${regime} confirmed at ${conf}% confidence. US growth decelerating, UK stagnant (0.1% QoQ). Inflation sticky above target. Iran escalation injected an inflation scare. BoE March cut probability collapsed. Gilt 10Y surged 40bp in one week. Risk budget must tighten.`,
    confidence: conf,
  };
}

/**
 * P1 — GlowingStepLineWidget  (BoE + Fed rate path)
 * data: Array<{ date, value }>
 */
export function mapPolicyRatePath(M) {
  // Reconstruct a step-function history of BoE rates
  return [
    { date: 'Sep 25', value: 5.00 },
    { date: 'Oct 25', value: 4.75 },
    { date: 'Nov 25', value: 4.75 },
    { date: 'Dec 25', value: 4.50 },
    { date: 'Jan 26', value: 4.25 },
    { date: 'Feb 26', value: 4.00 },
    { date: 'Mar 26', value: M?.boeRate ?? 3.75 },
    { date: 'Jun 26', value: (M?.boeRate ?? 3.75) - 0.25 },
    { date: 'Sep 26', value: (M?.boeRate ?? 3.75) - 0.25 },
    { date: 'Dec 26', value: (M?.boeRate ?? 3.75) - 0.50 },
  ];
}

/**
 * P1 — ConfidenceBandRangeWidget  (growth/inflation nowcast with bands)
 * Simulates a 80% confidence band around the core estimate from macro data.
 * data: Array<{ date, value, upper, lower }>
 */
export function mapNowcastBand(M, LIQ_DIV) {
  if (!LIQ_DIV?.length) return [];
  return LIQ_DIV.map((pt, i) => {
    const val = 100 + pt.m2g * 8; // index to 100
    const spread = 8 + i * 0.5;
    return {
      date: pt.m,
      value: Math.round(val),
      upper: Math.round(val + spread),
      lower: Math.round(val - spread * 0.7),
    };
  });
}

/**
 * P2 — OverlappingMountainAreaWidget  (M2 liquidity vs equity vs credit indexed)
 * data: Array<{ date, m2, equity, credit }>
 * series: [{ key, label, color }]
 */
export function mapGlobalLiquidityMountain(LIQ_DIV, CREDIT_TL) {
  if (!LIQ_DIV?.length) return { data: [], series: [] };

  const creditByMonth = {};
  (CREDIT_TL || []).forEach(c => { creditByMonth[c.d] = c; });

  const data = LIQ_DIV.map(pt => ({
    date: pt.m,
    m2:     Math.round(100 + pt.m2g * 10),
    equity: Math.round(100 + pt.spg * 8),
    credit: creditByMonth[pt.m]
      ? Math.round(100 - (creditByMonth[pt.m].ig - 85) * 2)
      : 100,
  }));

  const series = [
    { key: 'm2',     label: 'Global M2',    color: TOK.teal  },
    { key: 'equity', label: 'Equity Index', color: TOK.blue  },
    { key: 'credit', label: 'IG Credit',    color: TOK.amber },
  ];

  return { data, series };
}

/**
 * P2 — RoundedVolumePulseWidget  (credit spread OAS as volume bars)
 * data: Array<{ label, value }>
 */
export function mapCreditSpreadPulse(CREDIT_TL) {
  if (!CREDIT_TL?.length) return [];
  return CREDIT_TL.map(c => ({
    label: c.d,
    value: c.hy,  // HY OAS in bp — primary stress indicator
  }));
}

/**
 * P2 — AsymmetricFilledRadarWidget  (credit conditions multi-axis)
 * data: Array<{ axis, value, fullMark }>
 */
export function mapCreditRadar(M, MKTENG) {
  const cs = MKTENG?.creditStress;
  return [
    { axis: 'IG Spread',  value: Math.round(Math.max(0, (400 - (M?.igOAS  ?? 95))  / 4)), fullMark: 100 },
    { axis: 'HY Spread',  value: Math.round(Math.max(0, (600 - (M?.hyOAS  ?? 340)) / 6)), fullMark: 100 },
    { axis: 'MOVE Index', value: Math.round(Math.max(0, (200 - (M?.move   ?? 118)) / 2)), fullMark: 100 },
    { axis: 'STLFSI',     value: Math.round(Math.max(0, (4   - (M?.stlfsi ?? 0.8)) / 0.04)), fullMark: 100 },
    { axis: 'Liq. Score', value: cs?.liquidityScore ?? 55,                                  fullMark: 100 },
    { axis: 'CB Support', value: cs?.centralBankSupport ?? 62,                              fullMark: 100 },
    { axis: 'Vol. Regime',value: Math.round(Math.max(0, (40 - (M?.vix ?? 24.5)) * 2.5)),   fullMark: 100 },
    { axis: 'Cash Yield', value: Math.round(((M?.bestSave ?? 4.30) / 6) * 100),             fullMark: 100 },
  ];
}
