// =========================================================================
// LIFESTACK OS — CRYPTO FUNDING & BASIS ENGINE
// Phase 3: Market Intelligence — Crypto
// Perpetual funding rates + futures basis spread analysis
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
 * Classify funding rate signal
 * Funding rate is expressed as 8hr rate (e.g., 0.01 = 0.01%)
 */
function classifyFunding(rate) {
  if (rate <= -0.03) return { signal: 'EXTREME SHORT CROWDING', bias: 'contrarian_bullish', color: '#22c55e' };
  if (rate <= -0.01) return { signal: 'SHORTS PAYING', bias: 'mildly_bullish', color: '#4ade80' };
  if (rate <= 0.01) return { signal: 'NEUTRAL', bias: 'neutral', color: '#94a3b8' };
  if (rate <= 0.03) return { signal: 'LONGS PAYING', bias: 'mildly_bearish', color: '#f59e0b' };
  return { signal: 'EXTREME LONG CROWDING', bias: 'contrarian_bearish', color: '#ef4444' };
}

/**
 * Classify futures basis spread
 * Basis = annualised premium of futures over spot (%)
 */
function classifyBasis(basis) {
  if (basis < 0) return { signal: 'BACKWARDATION', condition: 'capitulation', color: '#22c55e' };
  if (basis <= 5) return { signal: 'LOW CONTANGO', condition: 'healthy', color: '#4ade80' };
  if (basis <= 10) return { signal: 'MODERATE CONTANGO', condition: 'normal', color: '#06b6d4' };
  if (basis <= 15) return { signal: 'ELEVATED CONTANGO', condition: 'speculative', color: '#f59e0b' };
  return { signal: 'EXTREME CONTANGO', condition: 'overheated', color: '#ef4444' };
}

/**
 * Determine aggregate leverage positioning
 */
function classifyLeverage(aggFunding, avgBasis) {
  if (aggFunding > 0.02 && avgBasis > 12) return 'overleveraged';
  if (aggFunding < -0.01 && avgBasis < 3) return 'underleveraged';
  return 'neutral';
}

/**
 * Compute crypto funding and basis state from market data
 */
export function computeCryptoFundingState(marketData) {
  if (!marketData) return null;

  const btcFunding = marketData.btcFunding || 0;     // 8hr funding rate (%)
  const ethFunding = marketData.ethFunding || 0;
  const btcBasis = marketData.btcBasis || 0;          // annualised basis (%)
  const ethBasis = marketData.ethBasis || 0;

  const btcFundingClass = classifyFunding(btcFunding);
  const ethFundingClass = classifyFunding(ethFunding);
  const btcBasisClass = classifyBasis(btcBasis);
  const ethBasisClass = classifyBasis(ethBasis);

  // Aggregate funding (weighted: BTC 60%, ETH 40%)
  const aggFunding = +(btcFunding * 0.6 + ethFunding * 0.4).toFixed(4);
  const avgBasis = +(btcBasis * 0.6 + ethBasis * 0.4).toFixed(2);
  const leverage = classifyLeverage(aggFunding, avgBasis);

  // Composite score: 0 = max bearish leverage, 100 = max bullish (deleveraged)
  const fundingScore = mapRange(aggFunding, -0.05, 0.05, 100, 0);
  const basisScore = mapRange(avgBasis, -5, 25, 100, 0);
  const compositeScore = +(fundingScore * 0.6 + basisScore * 0.4).toFixed(1);

  return {
    funding: {
      btc: { rate: btcFunding, ...btcFundingClass },
      eth: { rate: ethFunding, ...ethFundingClass },
      aggregate: aggFunding,
    },
    basis: {
      btc: { spread: btcBasis, ...btcBasisClass },
      eth: { spread: ethBasis, ...ethBasisClass },
      average: avgBasis,
    },
    leverage,
    compositeScore,
    implication: leverage === 'overleveraged'
      ? 'Market overleveraged — high funding + elevated basis signals crowded longs. Risk of cascade liquidation. Reduce or hedge.'
      : leverage === 'underleveraged'
        ? 'Market underleveraged — negative funding + low basis. Contrarian bullish. Short squeeze conditions present — accumulate.'
        : 'Funding and basis within normal ranges. No leverage-driven signal. Maintain current positioning.',
  };
}
