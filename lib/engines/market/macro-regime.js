// =========================================================================
// LIFESTACK OS — MACRO REGIME CLASSIFIER
// Phase 3: Market Intelligence
// Classifies macro regime from rates, inflation, growth, and volatility data
// Outputs: regime label, confidence, risk posture recommendation
// =========================================================================

/**
 * Regime definitions — each regime has characteristic signal patterns
 */
const REGIMES = {
  GOLDILOCKS:        { label: 'GOLDILOCKS', description: 'Growth above trend, inflation contained', riskPosture: 'Risk-On', equityBias: +2, bondBias: -1, cryptoBias: +1 },
  REFLATION:         { label: 'REFLATION', description: 'Growth recovering, rates falling', riskPosture: 'Risk-On Selective', equityBias: +1, bondBias: +1, cryptoBias: +1 },
  LATE_CYCLE:        { label: 'LATE CYCLE — INFLATION SCARE', description: 'Growth slowing, inflation sticky', riskPosture: 'Defensive', equityBias: -1, bondBias: -1, cryptoBias: -2 },
  STAGFLATION:       { label: 'STAGFLATION', description: 'Growth stalling, inflation rising', riskPosture: 'Max Defensive', equityBias: -2, bondBias: -2, cryptoBias: -2 },
  RECESSION:         { label: 'RECESSION', description: 'Growth contracting, rates falling', riskPosture: 'Selective', equityBias: -1, bondBias: +2, cryptoBias: -1 },
  EARLY_RECOVERY:    { label: 'EARLY RECOVERY', description: 'Growth bottoming, policy easing', riskPosture: 'Risk-On Aggressive', equityBias: +2, bondBias: 0, cryptoBias: +2 },
};

/**
 * Score each regime based on input signals (0-100)
 */
function scoreRegime(signals) {
  const {
    cpi = 3.0, coreCPI = 3.1, servicesCPI = 4.4,
    gdpGrowth = 0.1, unemployment = 5.2,
    cbRate = 3.75, rateDirection = 'hold', // cutting | hold | hiking
    vix = 24.5, move = 118,
    yieldCurveSlope = 0, // 10y - 2y spread
    pmi = 49,
  } = signals;

  const scores = {};

  // GOLDILOCKS: growth >1.5%, CPI <2.5%, VIX <18
  scores.GOLDILOCKS = (
    clamp(mapRange(gdpGrowth, 1.5, 3.0, 20, 40)) +
    clamp(mapRange(cpi, 1.0, 2.5, 30, 0)) +
    clamp(mapRange(vix, 12, 18, 30, 0)) +
    (pmi > 52 ? 10 : 0)
  );

  // REFLATION: rates falling, growth recovering, PMI rising
  scores.REFLATION = (
    (rateDirection === 'cutting' ? 30 : rateDirection === 'hold' ? 10 : 0) +
    clamp(mapRange(gdpGrowth, 0, 2.0, 30, 0)) +
    clamp(mapRange(pmi, 48, 55, 25, 0)) +
    clamp(mapRange(vix, 15, 25, 15, 0))
  );

  // LATE CYCLE: inflation sticky >3%, growth slowing, VIX rising
  scores.LATE_CYCLE = (
    clamp(mapRange(cpi, 2.5, 5.0, 0, 30)) +
    clamp(mapRange(servicesCPI, 3.5, 6.0, 0, 25)) +
    clamp(mapRange(gdpGrowth, -0.5, 1.5, 20, 0)) +
    clamp(mapRange(vix, 18, 35, 0, 15)) +
    (rateDirection === 'hold' ? 10 : 0)
  );

  // STAGFLATION: inflation >4%, growth <0.5%, rates high
  scores.STAGFLATION = (
    clamp(mapRange(cpi, 3.5, 6.0, 0, 35)) +
    clamp(mapRange(gdpGrowth, -1.0, 0.5, 30, 0)) +
    clamp(mapRange(unemployment, 4.5, 7.0, 0, 20)) +
    (rateDirection === 'hiking' ? 15 : 0)
  );

  // RECESSION: growth <0%, yield curve inverted, rates cutting
  scores.RECESSION = (
    clamp(mapRange(gdpGrowth, -2.0, 0, 0, 35)) +
    (yieldCurveSlope < 0 ? 20 : 0) +
    (rateDirection === 'cutting' ? 20 : 0) +
    clamp(mapRange(unemployment, 5.0, 8.0, 0, 25))
  );

  // EARLY RECOVERY: growth bottoming, policy easing, VIX declining
  scores.EARLY_RECOVERY = (
    clamp(mapRange(gdpGrowth, -0.5, 1.5, 30, 0)) +
    (rateDirection === 'cutting' ? 25 : 0) +
    clamp(mapRange(pmi, 45, 52, 0, 25)) +
    clamp(mapRange(vix, 20, 35, 20, 0))
  );

  return scores;
}

/** Utility: clamp value between 0 and max */
function clamp(v, min = 0, max = 100) {
  return Math.max(min, Math.min(max, v));
}

/** Utility: map a value from one range to another */
function mapRange(value, inMin, inMax, outMin, outMax) {
  if (inMax === inMin) return outMin;
  return outMin + ((value - inMin) / (inMax - inMin)) * (outMax - outMin);
}

/**
 * Classify the current regime from market signals
 */
export function classifyRegime(signals = {}) {
  const scores = scoreRegime(signals);

  // Find highest-scoring regime
  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const [topRegime, topScore] = sorted[0];
  const [secondRegime, secondScore] = sorted[1] || ['UNKNOWN', 0];

  const totalScore = Object.values(scores).reduce((s, v) => s + v, 0);
  const confidence = totalScore > 0 ? +((topScore / totalScore) * 100).toFixed(0) : 0;

  const regime = REGIMES[topRegime] || REGIMES.LATE_CYCLE;

  return {
    regime: regime.label,
    description: regime.description,
    confidence: +confidence,
    riskPosture: regime.riskPosture,
    equityBias: regime.equityBias,
    bondBias: regime.bondBias,
    cryptoBias: regime.cryptoBias,
    scores: Object.fromEntries(sorted.map(([k, v]) => [k, +v.toFixed(1)])),
    secondaryRegime: REGIMES[secondRegime]?.label || 'Unknown',
    transitionRisk: secondScore > topScore * 0.7 ? 'High' : secondScore > topScore * 0.4 ? 'Medium' : 'Low',
  };
}

/**
 * Compute regime state from MarketsModule M data
 */
export function computeRegimeState(marketData) {
  if (!marketData) return null;

  const signals = {
    cpi: marketData.ukCPI || 3.0,
    coreCPI: marketData.ukCore || 3.1,
    servicesCPI: marketData.ukServices || 4.4,
    gdpGrowth: marketData.ukGDP || 0.1,
    unemployment: marketData.ukUnemp || 5.2,
    cbRate: marketData.boeRate || 3.75,
    rateDirection: marketData.boeRate > 4.0 ? 'hiking' : marketData.boeRate < 3.5 ? 'cutting' : 'hold',
    vix: marketData.vix || 24.5,
    move: marketData.move || 118,
    yieldCurveSlope: (marketData.gilt10y || 4.62) - (marketData.gilt2y || 3.80),
    pmi: marketData.pmi || 49,
  };

  return classifyRegime(signals);
}
