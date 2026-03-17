// =========================================================================
// LIFESTACK OS — STABLECOIN LIQUIDITY ENGINE
// Phase 3: Market Intelligence — Crypto
// USDT/USDC supply, DEX liquidity, stablecoin dominance tracking
// =========================================================================

/**
 * Clamp a value between min and max
 */
function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}

/**
 * Map a value from one range to another
 */
function mapRange(val, inMin, inMax, outMin, outMax) {
  const clamped = clamp(val, inMin, inMax);
  return outMin + ((clamped - inMin) / (inMax - inMin)) * (outMax - outMin);
}

/**
 * Classify stablecoin dominance as a risk appetite indicator
 * High dominance = capital sitting on sidelines = dry powder
 * Low dominance = capital deployed into risk = less fuel
 */
function classifyDominance(dom) {
  if (dom >= 12) return { zone: 'HIGH', signal: 'Extreme dry powder — risk-on fuel available', color: '#22c55e' };
  if (dom >= 8) return { zone: 'ELEVATED', signal: 'Meaningful dry powder on sidelines', color: '#4ade80' };
  if (dom >= 5) return { zone: 'NORMAL', signal: 'Balanced stablecoin positioning', color: '#94a3b8' };
  return { zone: 'LOW', signal: 'Capital fully deployed — limited upside fuel', color: '#f59e0b' };
}

/**
 * Classify DEX TVL health
 */
function classifyDexTVL(tvl) {
  if (tvl >= 150) return { level: 'STRONG', signal: 'Deep on-chain liquidity', color: '#22c55e' };
  if (tvl >= 80) return { level: 'MODERATE', signal: 'Adequate liquidity', color: '#06b6d4' };
  if (tvl >= 40) return { level: 'THIN', signal: 'Liquidity thinning — wider spreads likely', color: '#f59e0b' };
  return { level: 'CRITICAL', signal: 'Dangerously thin liquidity — high slippage risk', color: '#ef4444' };
}

/**
 * Compute stablecoin liquidity state from market data
 */
export function computeStablecoinLiquidityState(marketData) {
  if (!marketData) return null;

  const usdtSupply = marketData.usdtSupply || 0;     // supply in $B
  const usdcSupply = marketData.usdcSupply || 0;
  const stablecoinDom = marketData.stablecoinDom || 0; // as % of total crypto market cap
  const dexTVL = marketData.dexTVL || 0;              // total DEX TVL in $B

  const totalSupply = +(usdtSupply + usdcSupply).toFixed(2);

  // Estimate 30d supply change (if previous data available, otherwise use heuristic)
  const prevTotalSupply = marketData.prevStablecoinSupply || totalSupply * 0.98;
  const supplyChange30d = +((totalSupply - prevTotalSupply) / prevTotalSupply * 100).toFixed(2);

  const dominanceClassification = classifyDominance(stablecoinDom);
  const tvlClassification = classifyDexTVL(dexTVL);

  // Dry powder assessment
  const dryPowder = supplyChange30d > 3 && stablecoinDom >= 8 ? 'high'
    : supplyChange30d > 0 && stablecoinDom >= 5 ? 'medium'
    : 'low';

  // Liquidity score (0-100): higher = more bullish liquidity conditions
  const supplyScore = mapRange(supplyChange30d, -5, 10, 0, 100);
  const domScore = mapRange(stablecoinDom, 2, 15, 0, 100);
  const tvlScore = mapRange(dexTVL, 20, 200, 0, 100);
  const liquidityScore = +(supplyScore * 0.4 + domScore * 0.35 + tvlScore * 0.25).toFixed(1);

  return {
    totalSupply,
    usdtSupply,
    usdcSupply,
    supplyChange30d,
    dominance: stablecoinDom,
    dominanceZone: dominanceClassification.zone,
    dominanceSignal: dominanceClassification.signal,
    dexTVL,
    dexLiquidity: tvlClassification.level,
    dryPowder,
    liquidityScore,
    implication: dryPowder === 'high'
      ? 'Stablecoin supply expanding with high dominance — significant dry powder ready to deploy. Bullish for risk assets on any catalyst.'
      : dryPowder === 'medium'
        ? 'Moderate stablecoin liquidity. Capital available but not aggressively entering. Watch for supply acceleration as confirmation signal.'
        : 'Stablecoin supply flat or shrinking — limited fuel for rallies. Favour defensive positioning until liquidity conditions improve.',
  };
}
