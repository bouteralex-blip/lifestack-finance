// =========================================================================
// LIFESTACK OS — CRYPTO ETF FLOW TRACKER
// Phase 3: Market Intelligence — Crypto
// Tracks spot BTC/ETH ETF daily flows, cumulative AUM, and flow momentum
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
 * Classify daily flow magnitude into a trend signal
 */
function classifyDailyFlow(flowM) {
  if (flowM >= 500) return { trend: 'VERY BULLISH', color: '#22c55e', strength: 5 };
  if (flowM >= 200) return { trend: 'BULLISH', color: '#4ade80', strength: 4 };
  if (flowM >= 50) return { trend: 'MILDLY BULLISH', color: '#06b6d4', strength: 3 };
  if (flowM >= -50) return { trend: 'NEUTRAL', color: '#94a3b8', strength: 2 };
  if (flowM >= -200) return { trend: 'BEARISH', color: '#f59e0b', strength: 1 };
  return { trend: 'VERY BEARISH', color: '#ef4444', strength: 0 };
}

/**
 * Compute flow momentum from daily and cumulative data
 * Momentum = daily flow as percentage of cumulative AUM
 */
function computeMomentum(daily, aum) {
  if (!aum || aum <= 0) return 0;
  return +((daily / aum) * 100).toFixed(3);
}

/**
 * Compute crypto ETF flow state from market data
 */
export function computeCryptoETFFlowState(marketData) {
  if (!marketData) return null;

  const btcDaily = marketData.btcETFFlow || 0;   // daily $M
  const ethDaily = marketData.ethETFFlow || 0;
  const btcAUM = marketData.btcETFAUM || 0;      // cumulative $B
  const ethAUM = marketData.ethETFAUM || 0;

  // BTC ETF analysis
  const btcClassification = classifyDailyFlow(btcDaily);
  const btcMomentum = computeMomentum(btcDaily, btcAUM * 1000); // convert AUM to $M

  // ETH ETF analysis
  const ethClassification = classifyDailyFlow(ethDaily);
  const ethMomentum = computeMomentum(ethDaily, ethAUM * 1000);

  // Net flow sentiment score (0-100)
  const btcFlowScore = mapRange(btcDaily, -500, 1000, 0, 100);
  const ethFlowScore = mapRange(ethDaily, -300, 500, 0, 100);
  const netSentimentScore = +(btcFlowScore * 0.7 + ethFlowScore * 0.3).toFixed(1);

  const netSentiment = netSentimentScore >= 75 ? 'STRONG INFLOWS'
    : netSentimentScore >= 55 ? 'MODERATE INFLOWS'
    : netSentimentScore >= 45 ? 'NEUTRAL'
    : netSentimentScore >= 25 ? 'MODERATE OUTFLOWS'
    : 'HEAVY OUTFLOWS';

  return {
    btcFlows: {
      daily: btcDaily,
      cumulative: btcAUM,
      momentum: btcMomentum,
      trend: btcClassification.trend,
      color: btcClassification.color,
    },
    ethFlows: {
      daily: ethDaily,
      cumulative: ethAUM,
      momentum: ethMomentum,
      trend: ethClassification.trend,
      color: ethClassification.color,
    },
    netSentiment,
    netSentimentScore,
    combinedDaily: +(btcDaily + ethDaily).toFixed(1),
    combinedAUM: +(btcAUM + ethAUM).toFixed(2),
    implication: netSentimentScore >= 65
      ? 'Institutional flows strongly positive. Spot ETF demand supports price floor — maintain or increase crypto allocation.'
      : netSentimentScore >= 45
        ? 'ETF flows neutral. No strong directional signal from institutional demand. Hold current allocation.'
        : 'Institutional outflows detected. Reduce discretionary crypto exposure until flow trend reverses.',
  };
}
