// =========================================================================
// LIFESTACK OS — LIQUIDITY DIVERGENCE MONITOR
// Phase 3: Market Intelligence
// Global M2 supply, central bank balance sheets, liquidity proxy scoring
// =========================================================================

/** Utility: clamp value between min and max */
function clamp(v, min = 0, max = 100) {
  return Math.max(min, Math.min(max, v));
}

/** Utility: map a value from one range to another */
function mapRange(value, inMin, inMax, outMin, outMax) {
  if (inMax === inMin) return outMin;
  return outMin + ((value - inMin) / (inMax - inMin)) * (outMax - outMin);
}

/**
 * Classify M2 momentum signal from growth rate
 */
function classifyM2Momentum(m2Growth) {
  if (m2Growth > 3.0) return 'expanding';
  if (m2Growth < -1.0) return 'contracting';
  return 'neutral';
}

/**
 * Detect regional balance sheet divergence
 * Returns the region most out of step with the others
 */
function detectDivergence(fedBS, ecbBS, bojBS, pbocBS) {
  const balanceSheets = [
    { region: 'Fed', value: fedBS },
    { region: 'ECB', value: ecbBS },
    { region: 'BoJ', value: bojBS },
    { region: 'PBoC', value: pbocBS },
  ];

  const avg = balanceSheets.reduce((s, b) => s + b.value, 0) / balanceSheets.length;

  // Find the biggest outlier
  let maxDeviation = 0;
  let divergentRegion = balanceSheets[0];

  for (const bs of balanceSheets) {
    const deviation = Math.abs(bs.value - avg);
    if (deviation > maxDeviation) {
      maxDeviation = deviation;
      divergentRegion = bs;
    }
  }

  const direction = divergentRegion.value > avg ? 'expanding' : 'contracting';

  return { region: divergentRegion.region, direction };
}

/**
 * Compute liquidity score from M2 growth and balance sheet net change
 */
function computeLiquidityScore(m2Growth, balanceSheetNet) {
  const m2Score = clamp(mapRange(m2Growth, -5, 10, 0, 60));
  const bsScore = clamp(mapRange(balanceSheetNet, -2.0, 2.0, 0, 40));
  return clamp(+(m2Score + bsScore).toFixed(0));
}

/**
 * Compute liquidity divergence state from market data
 */
export function computeLiquidityDivergenceState(marketData) {
  if (!marketData) return null;

  const globalM2 = marketData.globalM2 ?? 94.5;    // trillion USD
  const m2Growth = marketData.m2Growth ?? 2.1;       // % YoY
  const fedBS = marketData.fedBS ?? 7.4;             // trillion USD
  const ecbBS = marketData.ecbBS ?? 6.8;             // trillion EUR
  const bojBS = marketData.bojBS ?? 5.6;             // trillion USD equiv
  const pbocBS = marketData.pbocBS ?? 5.9;           // trillion USD equiv

  const m2MomentumSignal = classifyM2Momentum(m2Growth);
  const balanceSheetNet = +((fedBS + ecbBS + bojBS + pbocBS) / 4).toFixed(2);
  const divergence = detectDivergence(fedBS, ecbBS, bojBS, pbocBS);
  const liquidityScore = computeLiquidityScore(m2Growth, balanceSheetNet);

  let implication;
  if (liquidityScore > 65) {
    implication = 'Liquidity expanding — tailwind for risk assets, crypto, and equities. Favour beta.';
  } else if (liquidityScore > 35) {
    implication = 'Liquidity neutral — no strong tailwind or headwind. Watch for divergence shifts.';
  } else {
    implication = 'Liquidity contracting — headwind for risk assets. Favour cash, short duration, quality.';
  }

  return {
    globalM2,
    m2MomentumSignal,
    balanceSheetNet,
    divergence,
    liquidityScore,
    implication,
  };
}
