// =========================================================================
// LIFESTACK OS — CENTRAL BANK POLICY ENGINE
// Phase 3: Market Intelligence
// Rate cut/hike probability, dot plot analysis, policy stance classification
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
 * Classify policy stance from rate differential and cut probability
 */
function classifyStance(fedFunds, marketImpliedRate, cutProbability) {
  const rateGap = fedFunds - marketImpliedRate;

  if (cutProbability > 70 || rateGap > 0.75) return 'dovish';
  if (cutProbability < 30 || rateGap < -0.25) return 'hawkish';
  return 'neutral';
}

/**
 * Determine expected action at next meeting
 */
function classifyExpectedAction(cutProbability) {
  if (cutProbability > 65) return 'cut';
  if (cutProbability < 25) return 'hike';
  return 'hold';
}

/**
 * Compute central bank state from market data
 */
export function computeCentralBankState(marketData) {
  if (!marketData) return null;

  const fedFunds = marketData.fedFunds ?? 4.50;
  const fedDotMedian = marketData.fedDotMedian ?? 3.75;
  const marketImpliedRate = marketData.marketImpliedRate ?? 4.00;
  const nextMeetingDays = marketData.nextMeetingDays ?? 21;
  const cutProbability = marketData.cutProbability ?? 55;

  // Implied path: how many 25bp cuts priced in
  const cutsExpected = +((fedFunds - marketImpliedRate) / 0.25).toFixed(1);

  // Stance classification
  const stance = classifyStance(fedFunds, marketImpliedRate, cutProbability);

  // Dot plot vs market divergence
  const dotMarketGap = fedDotMedian - marketImpliedRate;
  const surpriseDirection = dotMarketGap > 0.25 ? 'hawkish' : dotMarketGap < -0.25 ? 'dovish' : 'inline';
  const surpriseMagnitude = clamp(Math.abs(dotMarketGap) * 100, 0, 100);

  // Next meeting assessment
  const expectedAction = classifyExpectedAction(cutProbability);

  // Build implication
  let implication;
  if (stance === 'dovish') {
    implication = 'Dovish tilt — market pricing cuts. Favour duration, growth equities, and risk assets.';
  } else if (stance === 'hawkish') {
    implication = 'Hawkish stance — rates higher for longer. Favour short duration, cash, value stocks.';
  } else {
    implication = 'Neutral policy posture — no strong directional signal. Monitor data dependency.';
  }

  return {
    currentRate: fedFunds,
    impliedPath: marketImpliedRate,
    cutsExpected,
    stance,
    nextMeeting: {
      days: nextMeetingDays,
      expectedAction,
    },
    surprise: {
      direction: surpriseDirection,
      magnitude: +surpriseMagnitude.toFixed(0),
    },
    implication,
  };
}
