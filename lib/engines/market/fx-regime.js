// =========================================================================
// LIFESTACK OS — FX REGIME CLASSIFIER
// Phase 3: Market Intelligence
// DXY, GBPUSD, EMFX trends and regime classification
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
 * Classify DXY trend from level
 */
function classifyDXYTrend(dxy) {
  if (dxy > 106) return 'strengthening';
  if (dxy < 100) return 'weakening';
  return 'range';
}

/**
 * Classify pair trend based on level vs historical midpoint
 */
function classifyPairTrend(pair, level) {
  const midpoints = {
    'GBP/USD': { mid: 1.27, range: 0.05 },
    'EUR/USD': { mid: 1.08, range: 0.04 },
    'USD/JPY': { mid: 145, range: 8 },
    'EM FX':   { mid: 100, range: 5 },
  };

  const ref = midpoints[pair] || { mid: level, range: 1 };

  if (level > ref.mid + ref.range) {
    return pair.startsWith('USD/') ? { trend: 'USD strengthening', signal: 'EM headwind' } : { trend: 'strengthening', signal: 'bullish' };
  }
  if (level < ref.mid - ref.range) {
    return pair.startsWith('USD/') ? { trend: 'USD weakening', signal: 'EM tailwind' } : { trend: 'weakening', signal: 'bearish' };
  }
  return { trend: 'range-bound', signal: 'neutral' };
}

/**
 * Classify overall FX regime
 */
function classifyRegime(dxyTrend, pairs) {
  const weakCount = pairs.filter(p => p.trend.includes('weakening')).length;
  const strongCount = pairs.filter(p => p.trend.includes('strengthening')).length;

  if (dxyTrend === 'strengthening') return 'Strong dollar regime — EM pressure, commodity headwind, US equity relative outperformance';
  if (dxyTrend === 'weakening') return 'Weak dollar regime — EM tailwind, commodities rally, global rotation';
  if (weakCount > strongCount) return 'Mixed — selective USD weakness, watch for trend confirmation';
  return 'Range-bound FX — no dominant regime. Monitor for breakout catalysts.';
}

/**
 * Compute FX regime state from market data
 */
export function computeFXRegimeState(marketData) {
  if (!marketData) return null;

  const dxy = marketData.dxy ?? 104.2;
  const gbpusd = marketData.gbpusd ?? 1.265;
  const eurusd = marketData.eurusd ?? 1.075;
  const usdjpy = marketData.usdjpy ?? 149.5;
  const emfxIndex = marketData.emfxIndex ?? 98.5;

  const dxyTrend = classifyDXYTrend(dxy);

  const pairData = [
    { pair: 'GBP/USD', level: gbpusd },
    { pair: 'EUR/USD', level: eurusd },
    { pair: 'USD/JPY', level: usdjpy },
    { pair: 'EM FX',   level: emfxIndex },
  ];

  const pairs = pairData.map(p => {
    const classification = classifyPairTrend(p.pair, p.level);
    return {
      pair: p.pair,
      level: p.level,
      trend: classification.trend,
      signal: classification.signal,
    };
  });

  const regime = classifyRegime(dxyTrend, pairs);

  let implication;
  if (dxyTrend === 'strengthening') {
    implication = 'USD strength — headwind for EM and commodities. Favour US domestic equities, hedge FX risk.';
  } else if (dxyTrend === 'weakening') {
    implication = 'USD weakness — tailwind for EM, commodities, and non-US equities. Consider unhedged international exposure.';
  } else {
    implication = 'DXY range-bound — no strong FX regime signal. Maintain balanced currency exposure.';
  }

  return {
    dxy,
    dxyTrend,
    pairs,
    regime,
    implication,
  };
}
