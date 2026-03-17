// =========================================================================
// LIFESTACK OS — BTC CYCLE STATE ENGINE
// Phase 3: Market Intelligence — Crypto
// On-chain cycle classification using MVRV-Z, NUPL, SOPR, Fear/Greed,
// exchange reserves, and HODL waves
// =========================================================================

/**
 * BTC Cycle phases with characteristic on-chain signals
 */
const CYCLE_PHASES = {
  CAPITULATION:    { label: 'CAPITULATION', posture: 'Accumulate aggressively', color: '#22c55e', bias: +3 },
  ACCUMULATION:    { label: 'ACCUMULATION', posture: 'DCA and hold', color: '#4ade80', bias: +2 },
  EARLY_BULL:      { label: 'EARLY BULL', posture: 'Full allocation', color: '#06b6d4', bias: +2 },
  MID_BULL:        { label: 'MID BULL', posture: 'Hold with trailing stop', color: '#0ea5e9', bias: +1 },
  LATE_BULL:       { label: 'LATE BULL', posture: 'Begin taking profit', color: '#f59e0b', bias: -1 },
  EUPHORIA:        { label: 'EUPHORIA', posture: 'Reduce to minimum', color: '#ef4444', bias: -3 },
  DISTRIBUTION:    { label: 'DISTRIBUTION', posture: 'Exit to target', color: '#dc2626', bias: -2 },
};

/**
 * Score cycle phase from on-chain metrics (0-100 per signal)
 * Lower MVRV/NUPL/SOPR + high fear = capitulation/accumulation
 * Higher MVRV/NUPL/SOPR + low fear = late bull/euphoria
 */
function scoreCycleSignals(signals) {
  const {
    mvrvZ = 0.49,
    nupl = 0.10,
    sopr = 0.95,
    fearGreed = 18,
    btcDom = 58.2,
    rsi = 27.5,
    reserveRisk = 0.001,
    hodlWavePct = 68, // % held >1yr
    drawdownFromATH = -45.9,
    exchangeReserves = 'normal', // 'atl' | 'low' | 'normal' | 'high'
  } = signals;

  const scores = {};

  // CAPITULATION: MVRV-Z <0.5, NUPL <0.1, SOPR <0.95, Fear <15, RSI <25
  scores.CAPITULATION = (
    clamp(mapRange(mvrvZ, 0, 0.5, 40, 0)) +
    clamp(mapRange(nupl, -0.5, 0.1, 30, 0)) +
    (sopr < 0.95 ? 15 : 0) +
    clamp(mapRange(fearGreed, 0, 15, 15, 0))
  );

  // ACCUMULATION: MVRV-Z 0.3-1.0, NUPL 0-0.25, Fear 10-30, HODL >65%
  scores.ACCUMULATION = (
    clamp(mapRange(mvrvZ, 0.3, 1.0, 0, 30)) +
    clamp(mapRange(nupl, 0, 0.25, 0, 25)) +
    clamp(mapRange(fearGreed, 10, 30, 0, 20)) +
    (hodlWavePct > 65 ? 15 : 0) +
    (exchangeReserves === 'atl' || exchangeReserves === 'low' ? 10 : 0)
  );

  // EARLY BULL: MVRV-Z 1.0-2.0, NUPL 0.25-0.5, Fear 30-55
  scores.EARLY_BULL = (
    clamp(mapRange(mvrvZ, 1.0, 2.0, 0, 35)) +
    clamp(mapRange(nupl, 0.25, 0.5, 0, 25)) +
    clamp(mapRange(fearGreed, 30, 55, 0, 20)) +
    clamp(mapRange(rsi, 40, 60, 0, 20))
  );

  // MID BULL: MVRV-Z 2.0-4.0, NUPL 0.5-0.7, Fear 55-72
  scores.MID_BULL = (
    clamp(mapRange(mvrvZ, 2.0, 4.0, 0, 35)) +
    clamp(mapRange(nupl, 0.5, 0.7, 0, 25)) +
    clamp(mapRange(fearGreed, 55, 72, 0, 20)) +
    (btcDom < 50 ? 10 : 0) // alt season indicator
  );

  // LATE BULL: MVRV-Z 4.0-6.0, NUPL 0.7-0.85, Fear 72-85, RSI >70
  scores.LATE_BULL = (
    clamp(mapRange(mvrvZ, 4.0, 6.0, 0, 30)) +
    clamp(mapRange(nupl, 0.7, 0.85, 0, 25)) +
    clamp(mapRange(fearGreed, 72, 85, 0, 20)) +
    (rsi > 70 ? 15 : 0) +
    (reserveRisk > 0.01 ? 10 : 0)
  );

  // EUPHORIA: MVRV-Z >6, NUPL >0.85, Fear >85
  scores.EUPHORIA = (
    clamp(mapRange(mvrvZ, 6.0, 10.0, 0, 40)) +
    clamp(mapRange(nupl, 0.85, 1.0, 0, 30)) +
    clamp(mapRange(fearGreed, 85, 100, 0, 20)) +
    (hodlWavePct < 50 ? 10 : 0) // long-term holders selling
  );

  // DISTRIBUTION: MVRV-Z declining from high, SOPR >1.05, divergence
  scores.DISTRIBUTION = (
    clamp(mapRange(mvrvZ, 3.0, 6.0, 0, 25)) +
    (sopr > 1.05 ? 20 : 0) +
    clamp(mapRange(drawdownFromATH, -30, -10, 0, 25)) +
    (exchangeReserves === 'high' ? 15 : 0) +
    (hodlWavePct < 55 ? 15 : 0)
  );

  return scores;
}

function clamp(v, min = 0, max = 100) { return Math.max(min, Math.min(max, v)); }
function mapRange(value, inMin, inMax, outMin, outMax) {
  if (inMax === inMin) return outMin;
  return outMin + ((value - inMin) / (inMax - inMin)) * (outMax - outMin);
}

/**
 * Classify BTC cycle state from on-chain metrics
 */
export function classifyBTCCycle(signals = {}) {
  const scores = scoreCycleSignals(signals);

  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const [topPhase, topScore] = sorted[0];
  const [secondPhase, secondScore] = sorted[1] || ['ACCUMULATION', 0];

  const totalScore = Object.values(scores).reduce((s, v) => s + v, 0);
  const confidence = totalScore > 0 ? +((topScore / totalScore) * 100).toFixed(0) : 0;

  const phase = CYCLE_PHASES[topPhase] || CYCLE_PHASES.ACCUMULATION;

  return {
    phase: phase.label,
    posture: phase.posture,
    color: phase.color,
    bias: phase.bias,
    confidence: +confidence,
    scores: Object.fromEntries(sorted.map(([k, v]) => [k, +v.toFixed(1)])),
    secondaryPhase: CYCLE_PHASES[secondPhase]?.label || 'Unknown',
    transitionRisk: secondScore > topScore * 0.7 ? 'High' : secondScore > topScore * 0.4 ? 'Medium' : 'Low',
  };
}

/**
 * Compute full BTC cycle state from market data
 */
export function computeBTCCycleState(marketData) {
  if (!marketData) return null;

  const signals = {
    mvrvZ: marketData.mvrvZ || 0.49,
    nupl: marketData.nupl || 0.10,
    sopr: marketData.sopr || 0.95,
    fearGreed: marketData.fearGreed || 18,
    btcDom: marketData.btcDom || 58.2,
    rsi: marketData.rsi || 27.5,
    reserveRisk: marketData.reserveRisk || 0.001,
    hodlWavePct: parseFloat(marketData.hodlWave) || 68,
    drawdownFromATH: marketData.btcDD || -45.9,
    exchangeReserves: (marketData.reserves || '').includes('ATL') ? 'atl' : 'normal',
  };

  const cycle = classifyBTCCycle(signals);

  // Compute Bitcoin-specific risk metrics
  const btcPrice = marketData.btcPrice || 68200;
  const btcATH = marketData.btcATH || 126198;
  const drawdownPct = btcATH > 0 ? +((btcPrice - btcATH) / btcATH * 100).toFixed(1) : 0;

  return {
    ...cycle,
    price: btcPrice,
    ath: btcATH,
    drawdown: drawdownPct,
    onChain: {
      mvrvZ: signals.mvrvZ,
      nupl: signals.nupl,
      sopr: signals.sopr,
      reserveRisk: signals.reserveRisk,
      hodlWave: signals.hodlWavePct,
      exchangeReserves: signals.exchangeReserves,
    },
    sentiment: {
      fearGreed: signals.fearGreed,
      rsi: signals.rsi,
      dominance: signals.btcDom,
    },
    actionableInsight: cycle.bias >= 2
      ? `Accumulation signal: On-chain metrics indicate ${cycle.phase} phase. DCA into BTC is supported by ${signals.exchangeReserves === 'atl' ? 'all-time-low exchange reserves' : 'favorable on-chain metrics'}.`
      : cycle.bias <= -1
        ? `Caution: ${cycle.phase} phase detected. Consider reducing exposure or tightening stops.`
        : `Neutral: ${cycle.phase} phase. Hold current allocation and monitor for phase transition.`,
  };
}
