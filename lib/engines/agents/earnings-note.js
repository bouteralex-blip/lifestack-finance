// =========================================================================
// LIFESTACK OS — EARNINGS NOTE GENERATOR
// Phase 4: Research & Decisioning
// Processes earnings results for held positions and generates analysis
// =========================================================================

/**
 * Generate an earnings analysis note for a held position
 * Processes actual vs estimated results and provides portfolio-level guidance
 */
export function generateEarningsNote(earningsData, holdings) {
  if (!earningsData || !earningsData.ticker) return null;

  const now = new Date();

  // 1. Compute EPS surprise
  const epsSurprise = computeSurprise(earningsData.epsActual, earningsData.epsEstimate);

  // 2. Compute revenue surprise
  const revSurprise = computeSurprise(earningsData.revenueActual, earningsData.revenueEstimate);

  // 3. Beat or miss
  const beat = epsSurprise.pct >= 0 && revSurprise.pct >= 0;
  const epsBeat = epsSurprise.pct >= 0;
  const revBeat = revSurprise.pct >= 0;

  // 4. Overall surprise assessment
  const surprise = computeOverallSurprise(epsSurprise, revSurprise);

  // 5. Guidance signal
  const guidanceSignal = assessGuidance(earningsData.guidance);

  // 6. Portfolio impact
  const portfolioImpact = assessPortfolioImpact(earningsData.ticker, holdings, beat, guidanceSignal);

  // 7. Recommendation
  const recommendation = buildEarningsRecommendation(beat, surprise, guidanceSignal, portfolioImpact);

  // 8. Narrative note
  const note = buildEarningsNarrative(earningsData, beat, epsSurprise, revSurprise, guidanceSignal);

  return {
    ticker: earningsData.ticker,
    date: now.toISOString().split('T')[0],
    beat,
    epsBeat,
    revBeat,
    epsActual: earningsData.epsActual,
    epsEstimate: earningsData.epsEstimate,
    epsSurprise: epsSurprise.pct,
    revenueActual: earningsData.revenueActual,
    revenueEstimate: earningsData.revenueEstimate,
    revSurprise: revSurprise.pct,
    surprise,
    guidanceSignal,
    portfolioImpact,
    recommendation,
    note,
  };
}

/**
 * Compute surprise percentage
 */
function computeSurprise(actual, estimate) {
  if (actual == null || estimate == null || estimate === 0) {
    return { pct: 0, magnitude: 'N/A' };
  }

  const pct = +((actual - estimate) / Math.abs(estimate) * 100).toFixed(2);
  let magnitude = 'Inline';
  if (Math.abs(pct) > 20) magnitude = 'Major';
  else if (Math.abs(pct) > 10) magnitude = 'Significant';
  else if (Math.abs(pct) > 3) magnitude = 'Moderate';
  else if (Math.abs(pct) > 1) magnitude = 'Slight';

  return { pct, magnitude };
}

/**
 * Compute overall surprise assessment
 */
function computeOverallSurprise(eps, rev) {
  const avgPct = (Math.abs(eps.pct) + Math.abs(rev.pct)) / 2;
  const direction = eps.pct >= 0 && rev.pct >= 0 ? 'positive'
    : eps.pct < 0 && rev.pct < 0 ? 'negative'
    : 'mixed';

  return {
    direction,
    averageMagnitude: +avgPct.toFixed(1),
    quality: direction === 'positive' ? 'Beat' : direction === 'negative' ? 'Miss' : 'Mixed',
  };
}

/**
 * Assess guidance quality
 */
function assessGuidance(guidance) {
  if (!guidance) return { signal: 'No guidance', impact: 'Neutral' };

  if (typeof guidance === 'string') {
    const lower = guidance.toLowerCase();
    if (lower.includes('raised') || lower.includes('above') || lower.includes('higher') || lower.includes('upgrade')) {
      return { signal: 'Raised', impact: 'Positive' };
    }
    if (lower.includes('lowered') || lower.includes('below') || lower.includes('cut') || lower.includes('downgrade')) {
      return { signal: 'Lowered', impact: 'Negative' };
    }
    if (lower.includes('maintained') || lower.includes('reiterated') || lower.includes('in line')) {
      return { signal: 'Maintained', impact: 'Neutral' };
    }
    return { signal: guidance, impact: 'Neutral' };
  }

  if (typeof guidance === 'object') {
    if (guidance.raised || guidance.above) return { signal: 'Raised', impact: 'Positive' };
    if (guidance.lowered || guidance.below) return { signal: 'Lowered', impact: 'Negative' };
    return { signal: 'Maintained', impact: 'Neutral' };
  }

  return { signal: 'No guidance', impact: 'Neutral' };
}

/**
 * Assess impact on portfolio
 */
function assessPortfolioImpact(ticker, holdings, beat, guidance) {
  if (!holdings?.length) {
    return { held: false, weight: 0, impact: 'Not held — watchlist only' };
  }

  const holding = holdings.find(h =>
    (h.ticker || h.symbol || '').toUpperCase() === ticker.toUpperCase()
  );

  if (!holding) {
    return { held: false, weight: 0, impact: 'Not held — watchlist only' };
  }

  const weight = holding.weight || holding.pct || 0;
  let impact = 'Minimal';

  if (weight > 10) {
    impact = beat ? 'Positive — large position benefiting from beat' : 'Concerning — large position missed estimates';
  } else if (weight > 5) {
    impact = beat ? 'Moderate positive' : 'Moderate negative — monitor position';
  } else if (weight > 1) {
    impact = beat ? 'Slight positive' : 'Slight negative';
  }

  if (guidance.impact === 'Negative' && weight > 5) {
    impact += '. Lowered guidance on meaningful position — review thesis.';
  }

  return { held: true, weight: +weight.toFixed(1), impact };
}

/**
 * Build recommendation based on earnings outcome
 */
function buildEarningsRecommendation(beat, surprise, guidance, portfolioImpact) {
  if (!portfolioImpact.held) {
    if (beat && guidance.impact === 'Positive') {
      return 'Not held. Consider adding to watchlist — strong results with raised guidance.';
    }
    return 'Not held. No action required.';
  }

  if (beat && guidance.impact === 'Positive') {
    return 'HOLD/ADD — Beat on both lines with raised guidance. Thesis strengthened.';
  }
  if (beat && guidance.impact === 'Neutral') {
    return 'HOLD — Solid beat. Guidance maintained. No change to thesis.';
  }
  if (beat && guidance.impact === 'Negative') {
    return 'REVIEW — Beat this quarter but lowered guidance. Assess forward trajectory.';
  }
  if (!beat && guidance.impact === 'Negative') {
    return 'REVIEW/TRIM — Missed estimates with lowered guidance. Re-underwrite thesis.';
  }
  if (!beat && guidance.impact === 'Positive') {
    return 'HOLD — Missed this quarter but raised guidance. Execution hiccup or one-off.';
  }
  if (surprise.direction === 'mixed') {
    return 'HOLD — Mixed results. Monitor next quarter for trend confirmation.';
  }
  return 'HOLD — Review thesis at next scheduled checkpoint.';
}

/**
 * Build narrative note
 */
function buildEarningsNarrative(data, beat, eps, rev, guidance) {
  const lines = [];

  lines.push(`${data.ticker} reported ${beat ? 'a beat' : 'a miss'} for the quarter.`);

  if (data.epsActual != null && data.epsEstimate != null) {
    lines.push(`EPS: ${data.epsActual} vs ${data.epsEstimate} est (${eps.pct > 0 ? '+' : ''}${eps.pct}% surprise, ${eps.magnitude}).`);
  }

  if (data.revenueActual != null && data.revenueEstimate != null) {
    const revActFmt = formatLargeNumber(data.revenueActual);
    const revEstFmt = formatLargeNumber(data.revenueEstimate);
    lines.push(`Revenue: ${revActFmt} vs ${revEstFmt} est (${rev.pct > 0 ? '+' : ''}${rev.pct}% surprise, ${rev.magnitude}).`);
  }

  if (guidance.signal !== 'No guidance') {
    lines.push(`Guidance ${guidance.signal.toLowerCase()}. Impact: ${guidance.impact}.`);
  }

  return lines.join(' ');
}

/**
 * Format large numbers (revenue) for readability
 */
function formatLargeNumber(num) {
  if (num >= 1e9) return `$${(num / 1e9).toFixed(1)}B`;
  if (num >= 1e6) return `$${(num / 1e6).toFixed(1)}M`;
  return `$${num.toLocaleString()}`;
}
