// =========================================================================
// LIFESTACK OS — GAP RISK DETECTOR
// Phase 3: Market Intelligence
// Event calendar + vol term structure to detect gap risk
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
 * Default upcoming events
 */
const DEFAULT_EVENTS = [
  { event: 'FOMC Decision',     date: '2026-03-18', impactEstimate: 75 },
  { event: 'CPI Release',       date: '2026-03-26', impactEstimate: 60 },
  { event: 'NFP Report',        date: '2026-04-03', impactEstimate: 55 },
  { event: 'Earnings Season',   date: '2026-04-14', impactEstimate: 50 },
];

/**
 * Classify vol term structure from VIX levels
 */
function classifyTermStructure(vix, vix1m, vix3m) {
  if (vix > vix1m && vix1m > vix3m) return 'backwardation';
  if (vix < vix1m && vix1m < vix3m) return 'contango';
  return 'flat';
}

/**
 * Compute days until event from date string
 */
function daysUntil(dateStr) {
  const now = new Date();
  const target = new Date(dateStr);
  const diff = target - now;
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

/**
 * Compute gap risk score
 * Backwardation + major event within 5 days = high gap risk
 */
function computeGapRiskScore(termStructure, volSpread, events) {
  let score = 0;

  // Term structure component
  if (termStructure === 'backwardation') score += 35;
  else if (termStructure === 'flat') score += 15;

  // Vol spread component (spot VIX vs 3m)
  score += clamp(mapRange(Math.abs(volSpread), 0, 10, 0, 25));

  // Event proximity component
  const nearEvents = events.filter(e => e.daysUntil <= 5);
  if (nearEvents.length > 0) {
    const maxImpact = Math.max(...nearEvents.map(e => e.impactEstimate));
    score += clamp(mapRange(maxImpact, 0, 100, 0, 40));
  }

  return clamp(+score.toFixed(0));
}

/**
 * Compute gap risk state from market data
 */
export function computeGapRiskState(marketData) {
  if (!marketData) return null;

  const vix = marketData.vix ?? 24.5;
  const vix1m = marketData.vix1m ?? 22.0;
  const vix3m = marketData.vix3m ?? 20.5;
  const rawEvents = marketData.upcomingEvents || DEFAULT_EVENTS;

  const termStructure = classifyTermStructure(vix, vix1m, vix3m);
  const volSpread = +(vix - vix3m).toFixed(2);

  const events = rawEvents.map(e => ({
    event: e.event,
    date: e.date,
    daysUntil: daysUntil(e.date),
    impactEstimate: clamp(e.impactEstimate ?? 50),
  })).sort((a, b) => a.daysUntil - b.daysUntil);

  const gapRiskScore = computeGapRiskScore(termStructure, volSpread, events);

  let implication;
  if (gapRiskScore > 70) {
    implication = 'High gap risk — vol backwardation with imminent event. Reduce position sizes, buy protective puts.';
  } else if (gapRiskScore > 40) {
    implication = 'Moderate gap risk — event-driven volatility possible. Consider hedging tail risk.';
  } else {
    implication = 'Low gap risk — vol term structure normal. No urgent hedging required.';
  }

  return {
    termStructure,
    volSpread,
    gapRiskScore,
    events,
    implication,
  };
}
