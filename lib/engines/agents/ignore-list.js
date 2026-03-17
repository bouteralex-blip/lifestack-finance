// =========================================================================
// LIFESTACK OS — IGNORE LIST ENGINE
// Phase 4: Research & Decisioning
// Identifies low-EV noise that should be deprioritised to maintain focus
// =========================================================================

/**
 * Compute the ignore list — items that look like they matter but do not
 * Helps maintain signal-to-noise ratio by explicitly flagging noise
 */
export function computeIgnoreList(engineState, marketState) {
  if (!engineState) return null;

  const ignoreItems = [];
  const focusItems = [];

  // 1. Check market indicators for noise
  const marketNoise = scanMarketNoise(marketState);
  ignoreItems.push(...marketNoise.ignore);
  focusItems.push(...marketNoise.focus);

  // 2. Check portfolio indicators for noise
  const portfolioNoise = scanPortfolioNoise(engineState);
  ignoreItems.push(...portfolioNoise.ignore);
  focusItems.push(...portfolioNoise.focus);

  // 3. Check structural noise
  const structuralNoise = scanStructuralNoise(engineState);
  ignoreItems.push(...structuralNoise.ignore);
  focusItems.push(...structuralNoise.focus);

  // Compute noise score (higher = more noise in the system)
  const noiseScore = computeNoiseScore(ignoreItems, focusItems);

  return {
    ignoreItems,
    noiseScore,
    focusItems,
    totalIgnored: ignoreItems.length,
    totalFocused: focusItems.length,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Scan market state for noise vs signal
 */
function scanMarketNoise(mkt) {
  const ignore = [];
  const focus = [];

  if (!mkt) return { ignore, focus };

  // Normal stress is noise
  const stress = mkt.stress?.compositeScore || 0;
  if (stress < 30) {
    ignore.push({
      topic: 'Market stress normal',
      reason: `Stress at ${stress}/100 is well within normal range. No defensive action needed.`,
      expectedValue: 0,
    });
  } else if (stress > 60) {
    focus.push('Elevated market stress — worth monitoring.');
  }

  // Stable regime is noise
  if (mkt.regime && !mkt.regime.regimeChanged) {
    ignore.push({
      topic: `${mkt.regime.regime} regime continues`,
      reason: 'No regime change detected. Existing allocation remains appropriate.',
      expectedValue: 0,
    });
  }

  // Low credit stress is noise
  if (mkt.creditStress?.compositeScore < 30) {
    ignore.push({
      topic: 'Credit conditions benign',
      reason: `Credit stress at ${mkt.creditStress.compositeScore}/100. No action on fixed income needed.`,
      expectedValue: 0,
    });
  }

  // BTC in neutral phase is noise
  if (mkt.btcCycle?.bias != null && mkt.btcCycle.bias >= 0 && mkt.btcCycle.bias <= 2) {
    ignore.push({
      topic: `BTC in ${mkt.btcCycle.phase || 'neutral'} phase`,
      reason: 'No strong accumulation or distribution signal. Hold current allocation.',
      expectedValue: 0,
    });
  }

  // Normal yield curve is noise
  if (mkt.yieldCurve?.shape === 'Normal' || mkt.yieldCurve?.shape === 'Steep') {
    ignore.push({
      topic: `Yield curve ${mkt.yieldCurve.shape.toLowerCase()}`,
      reason: 'Normal yield curve shape. No recession signal.',
      expectedValue: 0,
    });
  }

  return { ignore, focus };
}

/**
 * Scan portfolio state for noise vs signal
 */
function scanPortfolioNoise(eng) {
  const ignore = [];
  const focus = [];

  // Low drift is noise
  const drift = eng.driftMonitor?.maxDrift || 0;
  if (drift < 2) {
    ignore.push({
      topic: 'Portfolio drift minimal',
      reason: `Max drift ${drift.toFixed(1)}% is well within tolerance. No rebalance needed.`,
      expectedValue: 0,
    });
  } else if (drift > 5) {
    focus.push(`Drift at ${drift.toFixed(1)}% — rebalance signal.`);
  }

  // No debt is noise
  if (!eng.debtPriority?.totalDebt || eng.debtPriority.totalDebt === 0) {
    ignore.push({
      topic: 'Debt: none outstanding',
      reason: 'No debt to manage. Debt engine output not relevant.',
      expectedValue: 0,
    });
  }

  // Low-APR debt is noise
  if (eng.debtPriority?.highestAPR > 0 && eng.debtPriority.highestAPR < 5) {
    ignore.push({
      topic: `Low-rate debt (${eng.debtPriority.highestAPR}%)`,
      reason: 'Debt below expected investment returns. No urgency to pay down.',
      expectedValue: 0,
    });
  }

  // No concentration violations is noise
  if (eng.concentration?.violations?.length === 0 && (eng.concentration?.hhi || 0) < 1500) {
    ignore.push({
      topic: 'Portfolio well-diversified',
      reason: `HHI ${eng.concentration.hhi} with no violations. Concentration is not a concern.`,
      expectedValue: 0,
    });
  }

  // ISA fully funded is noise
  if (eng.isaPensionRouting?.isaHeadroom?.remaining === 0) {
    ignore.push({
      topic: 'ISA fully funded',
      reason: 'ISA allowance fully utilised. No tax deadline pressure.',
      expectedValue: 0,
    });
  }

  // ISA deadline far away
  if (eng.isaPensionRouting?.daysUntilTaxYearEnd > 180) {
    ignore.push({
      topic: 'ISA deadline distant',
      reason: `${eng.isaPensionRouting.daysUntilTaxYearEnd} days until tax year end. Not urgent.`,
      expectedValue: 0,
    });
  }

  return { ignore, focus };
}

/**
 * Scan for structural noise
 */
function scanStructuralNoise(eng) {
  const ignore = [];
  const focus = [];

  // Good wrapper efficiency is noise
  if (eng.wrapperExposure?.efficiency?.score > 7) {
    ignore.push({
      topic: 'Wrapper efficiency high',
      reason: `Score ${eng.wrapperExposure.efficiency.score}/10. No wrapper optimisation needed.`,
      expectedValue: 0,
    });
  }

  // Small clutter count is noise
  if (eng.concentration?.clutter?.count != null && eng.concentration.clutter.count <= 3) {
    ignore.push({
      topic: 'Minimal portfolio clutter',
      reason: `Only ${eng.concentration.clutter.count} sub-1% position(s). Not worth consolidating.`,
      expectedValue: 0,
    });
  }

  // Low home bias is noise
  if (eng.currencyExposure?.homeBias != null && eng.currencyExposure.homeBias < 40) {
    ignore.push({
      topic: 'Home bias acceptable',
      reason: `${eng.currencyExposure.homeBias}% home bias is within reasonable range.`,
      expectedValue: 0,
    });
  }

  return { ignore, focus };
}

/**
 * Compute overall noise score
 */
function computeNoiseScore(ignoreItems, focusItems) {
  if (ignoreItems.length === 0 && focusItems.length === 0) return 50;

  // More ignored items relative to focus items = higher noise score
  const total = ignoreItems.length + focusItems.length;
  const score = Math.round((ignoreItems.length / total) * 100);
  return score;
}
