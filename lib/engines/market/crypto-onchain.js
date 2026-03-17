// =========================================================================
// LIFESTACK OS — CRYPTO ON-CHAIN STRESS BOARD
// Phase 3: Market Intelligence — Crypto
// Exchange reserves, whale activity, stablecoin flows, funding rates
// =========================================================================

/**
 * Score on-chain health (0 = max stress, 100 = max health)
 */
function scoreOnChainHealth(signals) {
  const {
    exchangeReserves = 'normal', // 'atl' | 'low' | 'normal' | 'high'
    whaleActivity = 'neutral',   // 'accumulating' | 'neutral' | 'distributing'
    stablecoinSupply = 'stable', // 'growing' | 'stable' | 'shrinking'
    fundingRate = 0,             // negative = shorts paying, positive = longs paying
    basisSpread = 0,             // futures premium over spot (%)
    dormancy = 'normal',         // 'increasing' | 'normal' | 'decreasing' (long-term holder activity)
  } = signals;

  let score = 50; // base

  // Exchange reserves: lower = bullish (less sell pressure)
  if (exchangeReserves === 'atl') score += 20;
  else if (exchangeReserves === 'low') score += 10;
  else if (exchangeReserves === 'high') score -= 15;

  // Whale activity: accumulation = bullish
  if (whaleActivity === 'accumulating') score += 15;
  else if (whaleActivity === 'distributing') score -= 15;

  // Stablecoin supply: growing = dry powder entering
  if (stablecoinSupply === 'growing') score += 10;
  else if (stablecoinSupply === 'shrinking') score -= 10;

  // Funding rate: slightly negative = good (shorts getting liquidated)
  if (fundingRate < -0.01) score += 10;
  else if (fundingRate > 0.05) score -= 10;

  // Basis: low or negative = capitulation; high = overheating
  if (basisSpread < 0) score += 5; // backwardation = extreme bearishness
  else if (basisSpread > 15) score -= 10; // excessive leverage

  // Dormancy: increasing = long-term holders not selling (bullish)
  if (dormancy === 'increasing') score += 10;
  else if (dormancy === 'decreasing') score -= 10;

  return Math.max(0, Math.min(100, score));
}

/**
 * Compute on-chain stress state
 */
export function computeCryptoOnChainState(marketData) {
  if (!marketData) return null;

  // Parse whale activity from string
  const whaleStr = marketData.whale || '';
  const whaleActivity = whaleStr.includes('270K') ? 'accumulating' : 'neutral';

  // Parse exchange reserves
  const reserveStr = marketData.reserves || '';
  const exchangeReserves = reserveStr.includes('ATL') ? 'atl' : reserveStr.includes('low') ? 'low' : 'normal';

  const signals = {
    exchangeReserves,
    whaleActivity,
    stablecoinSupply: 'stable', // would come from live stablecoin API
    fundingRate: marketData.fundingRate || -0.005,
    basisSpread: marketData.basisSpread || 2.5,
    dormancy: 'normal',
  };

  const healthScore = scoreOnChainHealth(signals);

  const metrics = [
    { name: 'Exchange Reserves', value: reserveStr || 'Normal', signal: exchangeReserves === 'atl' ? 'Bullish' : exchangeReserves === 'low' ? 'Mildly Bullish' : 'Neutral', color: exchangeReserves === 'atl' ? '#22c55e' : '#f59e0b' },
    { name: 'Whale Activity', value: whaleStr || 'Unknown', signal: whaleActivity === 'accumulating' ? 'Bullish' : 'Neutral', color: whaleActivity === 'accumulating' ? '#22c55e' : '#94a3b8' },
    { name: 'SOPR', value: marketData.sopr || 0.95, signal: (marketData.sopr || 0.95) < 1.0 ? 'Sellers at loss — capitulation' : 'Sellers in profit', color: (marketData.sopr || 0.95) < 1.0 ? '#22c55e' : '#f59e0b' },
    { name: 'Reserve Risk', value: marketData.reserveRisk || 0.001, signal: (marketData.reserveRisk || 0.001) < 0.005 ? 'Undervalued zone' : 'Fair value', color: (marketData.reserveRisk || 0.001) < 0.005 ? '#22c55e' : '#94a3b8' },
    { name: 'HODL Waves', value: marketData.hodlWave || '68% held >1yr', signal: parseFloat(marketData.hodlWave) > 65 ? 'Strong conviction holders' : 'Distribution phase', color: parseFloat(marketData.hodlWave) > 65 ? '#22c55e' : '#ef4444' },
  ];

  return {
    healthScore,
    healthLevel: healthScore > 70 ? 'STRONG' : healthScore > 45 ? 'NEUTRAL' : 'STRESSED',
    metrics,
    signals,
    netPositioning: exchangeReserves === 'atl' && whaleActivity === 'accumulating' ? 'VERY BULLISH' :
      exchangeReserves === 'high' ? 'BEARISH' : 'NEUTRAL',
    implication: healthScore > 70
      ? 'On-chain metrics strongly support accumulation. Smart money positioning for next leg up.'
      : healthScore > 45
        ? 'Mixed signals. Maintain current allocation, await clearer on-chain confirmation.'
        : 'On-chain stress elevated. Reduce exposure to risk-defined positions only.',
  };
}

/**
 * Compute BTC dominance and alt season state
 */
export function computeBTCDominanceState(marketData) {
  if (!marketData) return null;

  const btcDom = marketData.btcDom || 58.2;
  const ethDD = marketData.ethDD || -60;
  const solDD = marketData.solDD || -71;

  // Alt season: BTC dominance falling + alts outperforming
  const isAltSeason = btcDom < 45;
  const isBTCSeason = btcDom > 55;

  return {
    btcDominance: btcDom,
    phase: isAltSeason ? 'ALT SEASON' : isBTCSeason ? 'BTC SEASON' : 'TRANSITION',
    color: isAltSeason ? '#a855f7' : isBTCSeason ? '#f59e0b' : '#94a3b8',
    altDrawdowns: {
      ETH: ethDD,
      SOL: solDD,
    },
    recommendation: isBTCSeason
      ? 'Concentrate in BTC. Alts underperforming — wait for dominance to peak before rotating.'
      : isAltSeason
        ? 'Diversify into quality alts (ETH, SOL). Dominance declining signals rotation.'
        : 'Hold balanced crypto allocation. Monitor dominance for rotation signal.',
  };
}
