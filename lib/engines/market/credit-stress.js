// =========================================================================
// LIFESTACK OS — CREDIT STRESS MONITOR
// Phase 3: Market Intelligence
// Tracks IG, HY, BBB credit spreads for stress signals
// =========================================================================

/**
 * Credit spread thresholds (OAS in bps)
 */
const CREDIT_THRESHOLDS = {
  ig:  { tight: [0, 80],  normal: [80, 120],  wide: [120, 180],   crisis: [180, 400] },
  hy:  { tight: [0, 250], normal: [250, 400],  wide: [400, 600],   crisis: [600, 1200] },
  bbb: { tight: [0, 100], normal: [100, 160],  wide: [160, 250],   crisis: [250, 500] },
};

function classifySpread(value, thresholds) {
  if (value <= thresholds.tight[1]) return { level: 'TIGHT', color: '#22c55e', signal: 'Complacent — spreads below average' };
  if (value <= thresholds.normal[1]) return { level: 'NORMAL', color: '#06b6d4', signal: 'Fair value — spreads at average' };
  if (value <= thresholds.wide[1]) return { level: 'WIDE', color: '#f59e0b', signal: 'Stress building — credit risk repricing' };
  return { level: 'CRISIS', color: '#ef4444', signal: 'Crisis — flight to quality underway' };
}

/**
 * Compute credit stress state from market data
 */
export function computeCreditStressState(marketData, creditTimeline) {
  if (!marketData) return null;

  const igOAS = marketData.igOAS || 95;
  const hyOAS = marketData.hyOAS || 340;
  const bbbOAS = marketData.bbbOAS || 145;

  const ig = classifySpread(igOAS, CREDIT_THRESHOLDS.ig);
  const hy = classifySpread(hyOAS, CREDIT_THRESHOLDS.hy);
  const bbb = classifySpread(bbbOAS, CREDIT_THRESHOLDS.bbb);

  // HY-IG spread compression/decompression
  const hyIgSpread = hyOAS - igOAS;
  const spreadCompression = hyIgSpread < 200 ? 'COMPRESSED' : hyIgSpread > 350 ? 'DECOMPRESSED' : 'NORMAL';

  // Composite credit stress score (0 = no stress, 100 = crisis)
  const igScore = Math.min(100, (igOAS / CREDIT_THRESHOLDS.ig.crisis[1]) * 100);
  const hyScore = Math.min(100, (hyOAS / CREDIT_THRESHOLDS.hy.crisis[1]) * 100);
  const bbbScore = Math.min(100, (bbbOAS / CREDIT_THRESHOLDS.bbb.crisis[1]) * 100);
  const compositeScore = +((igScore * 0.4 + hyScore * 0.35 + bbbScore * 0.25)).toFixed(1);

  // Trend from timeline data
  let trend = 'stable';
  if (creditTimeline?.length >= 2) {
    const recent = creditTimeline[creditTimeline.length - 1];
    const prior = creditTimeline[creditTimeline.length - 2];
    if (recent.hy > prior.hy + 10) trend = 'widening';
    else if (recent.hy < prior.hy - 10) trend = 'tightening';
  }

  return {
    ig: { oas: igOAS, ...ig },
    hy: { oas: hyOAS, ...hy },
    bbb: { oas: bbbOAS, ...bbb },
    hyIgSpread,
    spreadCompression,
    compositeScore,
    compositeLevel: compositeScore > 70 ? 'CRISIS' : compositeScore > 45 ? 'STRESSED' : compositeScore > 25 ? 'NORMAL' : 'BENIGN',
    trend,
    portfolioImplication: compositeScore > 50
      ? 'Reduce credit exposure. Favour IG over HY. Consider CDS protection.'
      : compositeScore > 30
        ? 'Monitor HY positions. Maintain IG quality bias.'
        : 'Credit conditions supportive. HY carry attractive.',
    timeline: creditTimeline || [],
  };
}
