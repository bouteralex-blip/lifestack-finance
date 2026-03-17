// =========================================================================
// LIFESTACK OS — COMMODITY SHOCK ENGINE
// Phase 3: Market Intelligence
// Oil, gold, copper, uranium — supply shock and demand signal detection
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
 * Classify commodity trend from price level
 */
function classifyTrend(name, price) {
  const ranges = {
    oil:     { low: 50, mid: 75, high: 100 },
    gold:    { low: 1800, mid: 2200, high: 2800 },
    copper:  { low: 3.50, mid: 4.20, high: 5.00 },
    uranium: { low: 40, mid: 65, high: 90 },
  };
  const r = ranges[name] || { low: 0, mid: 50, high: 100 };

  if (price > r.high) return { trend: 'overheated', signal: 'bearish reversal risk' };
  if (price > r.mid) return { trend: 'bullish', signal: 'uptrend — demand strong' };
  if (price > r.low) return { trend: 'neutral', signal: 'range-bound' };
  return { trend: 'depressed', signal: 'supply surplus or demand weakness' };
}

/**
 * Classify shock indicator from ratios and price extremes
 */
function classifyShock(goldOilRatio, copperGoldRatio) {
  if (goldOilRatio > 30) return 'deflationary shock — gold vastly outperforming oil';
  if (goldOilRatio > 25) return 'deflationary signal — watch for demand destruction';
  if (copperGoldRatio > 0.0020) return 'growth signal — copper outpacing gold';
  if (copperGoldRatio < 0.0014) return 'recession signal — copper lagging gold significantly';
  return 'balanced — no extreme commodity signal';
}

/**
 * Compute commodity shock state from market data
 */
export function computeCommodityShockState(marketData) {
  if (!marketData) return null;

  const oilPrice = marketData.oilPrice ?? 78;
  const goldPrice = marketData.goldPrice ?? 2650;
  const copperPrice = marketData.copperPrice ?? 4.35;
  const uraniumPrice = marketData.uraniumPrice ?? 72;
  const goldToOilRatio = marketData.goldToOilRatio ?? +(goldPrice / oilPrice).toFixed(1);

  const copperGoldRatio = +(copperPrice / goldPrice).toFixed(4);

  const commodities = [
    { name: 'oil', price: oilPrice, ...classifyTrend('oil', oilPrice) },
    { name: 'gold', price: goldPrice, ...classifyTrend('gold', goldPrice) },
    { name: 'copper', price: copperPrice, ...classifyTrend('copper', copperPrice) },
    { name: 'uranium', price: uraniumPrice, ...classifyTrend('uranium', uraniumPrice) },
  ];

  const shockIndicator = classifyShock(goldToOilRatio, copperGoldRatio);

  let implication;
  if (goldToOilRatio > 25) {
    implication = 'Gold/Oil ratio elevated — deflationary risk. Favour gold, reduce energy exposure.';
  } else if (copperGoldRatio > 0.0020) {
    implication = 'Copper/Gold ratio rising — growth optimism. Favour cyclicals and industrial commodities.';
  } else if (copperGoldRatio < 0.0014) {
    implication = 'Copper/Gold ratio falling — recession fears rising. Favour defensive positioning.';
  } else {
    implication = 'Commodity ratios balanced — no extreme macro signal from commodities.';
  }

  return {
    commodities,
    goldOilRatio: goldToOilRatio,
    copperGoldRatio,
    shockIndicator,
    implication,
  };
}
