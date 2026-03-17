// =========================================================================
// LIFESTACK OS — ON-CHAIN STRESS DASHBOARD
// Phase 3: Market Intelligence — Crypto
// Comprehensive on-chain stress combining reserves, whales, dormancy, miners
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
 * Score individual on-chain indicators
 * Returns stress contribution (0 = no stress, ~16 each for 6 indicators, max ~100)
 */
function scoreExchangeReserves(reserves) {
  // reserves as % change from 30d average: negative = outflows (bullish), positive = inflows (bearish)
  return mapRange(reserves, -15, 15, 0, 20);
}

function scoreMinerReserves(minerReserves) {
  // miner reserves change %: negative = miners selling (bearish), positive = miners holding (bullish)
  return mapRange(minerReserves, 10, -10, 0, 20);
}

function scoreWhaleBalance(whaleBalance) {
  // whale balance change %: positive = accumulating (bullish), negative = distributing (bearish)
  return mapRange(whaleBalance, 5, -5, 0, 20);
}

function scoreDormancy(dormancy) {
  // dormancy flow: high = old coins moving (bearish/stress), low = hodling (bullish)
  return mapRange(dormancy, 0, 100, 0, 15);
}

function scoreHashRate(hashRate) {
  // hash rate change %: negative = miners capitulating (stress), positive = healthy
  return mapRange(hashRate, 10, -15, 0, 15);
}

function scoreNetUnrealizedPL(nupl) {
  // NUPL: <0 = capitulation, 0-0.25 = hope, 0.25-0.5 = optimism, 0.5-0.75 = belief, >0.75 = euphoria
  // Euphoria = stress (overheated), capitulation = stress (undervalued but painful)
  if (nupl > 0.75) return 10; // euphoria stress
  if (nupl < 0) return 10;    // capitulation stress
  return 0;                    // healthy range
}

/**
 * Classify indicator into signal for dashboard display
 */
function classifyIndicator(name, value, stressContribution, maxContribution) {
  const pct = stressContribution / maxContribution;
  if (pct >= 0.7) return { name, value, signal: 'HIGH STRESS', color: '#ef4444' };
  if (pct >= 0.4) return { name, value, signal: 'MODERATE STRESS', color: '#f59e0b' };
  if (pct >= 0.2) return { name, value, signal: 'LOW STRESS', color: '#06b6d4' };
  return { name, value, signal: 'HEALTHY', color: '#22c55e' };
}

/**
 * Compute comprehensive on-chain stress board from market data
 */
export function computeOnChainStressBoard(marketData) {
  if (!marketData) return null;

  const exchangeReserves = marketData.exchangeReserves || 0;   // % change from 30d avg
  const minerReserves = marketData.minerReserves || 0;         // % change
  const whaleBalance = marketData.whaleBalance || 0;           // % change
  const dormancy = marketData.dormancy || 0;                   // dormancy flow index (0-100)
  const hashRate = marketData.hashRate || 0;                   // % change
  const nupl = marketData.nupl || 0.3;                         // net unrealised P/L ratio

  // Score each indicator
  const exchangeScore = scoreExchangeReserves(exchangeReserves);
  const minerScore = scoreMinerReserves(minerReserves);
  const whaleScore = scoreWhaleBalance(whaleBalance);
  const dormancyScore = scoreDormancy(dormancy);
  const hashRateScore = scoreHashRate(hashRate);
  const nuplScore = scoreNetUnrealizedPL(nupl);

  // Aggregate stress score (0-100)
  const rawStress = exchangeScore + minerScore + whaleScore + dormancyScore + hashRateScore + nuplScore;
  const stressScore = +clamp(rawStress, 0, 100).toFixed(1);

  // Build indicator dashboard
  const indicators = [
    classifyIndicator('Exchange Reserves', `${exchangeReserves > 0 ? '+' : ''}${exchangeReserves}%`, exchangeScore, 20),
    classifyIndicator('Miner Reserves', `${minerReserves > 0 ? '+' : ''}${minerReserves}%`, minerScore, 20),
    classifyIndicator('Whale Balance', `${whaleBalance > 0 ? '+' : ''}${whaleBalance}%`, whaleScore, 20),
    classifyIndicator('Dormancy Flow', `${dormancy}/100`, dormancyScore, 15),
    classifyIndicator('Hash Rate', `${hashRate > 0 ? '+' : ''}${hashRate}%`, hashRateScore, 15),
    classifyIndicator('NUPL', nupl.toFixed(2), nuplScore, 10),
  ];

  const stressLevel = stressScore >= 70 ? 'CRITICAL'
    : stressScore >= 50 ? 'ELEVATED'
    : stressScore >= 30 ? 'MODERATE'
    : 'LOW';

  const highStressCount = indicators.filter(i => i.signal === 'HIGH STRESS').length;
  const healthyCount = indicators.filter(i => i.signal === 'HEALTHY').length;

  const netRisk = highStressCount >= 3 ? 'HIGH RISK'
    : highStressCount >= 2 ? 'ELEVATED RISK'
    : healthyCount >= 4 ? 'LOW RISK'
    : 'MODERATE RISK';

  return {
    stressScore,
    stressLevel,
    indicators,
    netRisk,
    implication: stressScore >= 70
      ? 'Multiple on-chain stress indicators flashing red. High probability of near-term volatility. Reduce exposure to risk-defined positions.'
      : stressScore >= 50
        ? 'Elevated on-chain stress. Conditions are deteriorating but not critical. Tighten stops and avoid adding to positions.'
        : stressScore >= 30
          ? 'Moderate on-chain conditions. Some indicators showing strain but fundamentals intact. Maintain allocation with vigilance.'
          : 'On-chain fundamentals healthy across the board. Conditions support accumulation and holding.',
  };
}
