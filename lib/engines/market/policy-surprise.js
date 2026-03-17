// =========================================================================
// LIFESTACK OS — POLICY SURPRISE DETECTOR
// Phase 3: Market Intelligence
// Detects government and central bank policy surprises vs expectations
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
 * Default policy events for demonstration
 */
const DEFAULT_POLICY_EVENTS = [
  { event: 'Fed Meeting',          expected: 'hold',      actual: 'hold',      impact: 0 },
  { event: 'ECB Decision',         expected: 'cut 25bp',  actual: 'cut 25bp',  impact: 0 },
  { event: 'UK Budget',            expected: 'neutral',   actual: 'expansionary', impact: 30 },
  { event: 'Tariff Announcement',  expected: 'moderate',  actual: 'aggressive', impact: 55 },
  { event: 'Sanctions Package',    expected: 'targeted',  actual: 'broad',     impact: 35 },
];

/**
 * Classify surprise direction from expected vs actual
 */
function classifySurprise(expected, actual, impact) {
  if (impact === 0 || expected === actual) return { direction: 'inline', magnitude: 0 };
  const magnitude = clamp(Math.abs(impact));
  const direction = impact > 0 ? 'hawkish' : 'dovish';
  return { direction, magnitude };
}

/**
 * Compute policy surprise state from market data
 */
export function computePolicySurpriseState(marketData) {
  if (!marketData) return null;

  const policyEvents = marketData.policyEvents || DEFAULT_POLICY_EVENTS;

  const surprises = policyEvents.map(e => {
    const impact = e.impact ?? 0;
    const classification = classifySurprise(e.expected, e.actual, impact);

    return {
      event: e.event,
      direction: classification.direction,
      magnitude: classification.magnitude,
      marketImpact: impact > 40 ? 'high' : impact > 15 ? 'moderate' : 'low',
    };
  });

  // Net surprise index: sum of signed impacts (-100 to +100 range)
  const rawNet = policyEvents.reduce((sum, e) => sum + (e.impact || 0), 0);
  const netSurpriseIndex = clamp(rawNet, -100, 100);

  // Most recent significant shock
  const significantSurprises = surprises.filter(s => s.magnitude > 20);
  const recentShock = significantSurprises.length > 0
    ? significantSurprises[significantSurprises.length - 1]
    : null;

  let implication;
  if (netSurpriseIndex > 30) {
    implication = 'Net hawkish policy surprises — risk of tighter conditions. Reduce risk exposure.';
  } else if (netSurpriseIndex < -30) {
    implication = 'Net dovish policy surprises — easing conditions. Favour risk assets and duration.';
  } else {
    implication = 'Policy outcomes broadly as expected — no significant repricing needed.';
  }

  return {
    surprises,
    netSurpriseIndex,
    recentShock,
    implication,
  };
}
