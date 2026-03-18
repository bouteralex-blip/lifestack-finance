// =========================================================================
// LIFESTACK OS — POLICY NOTE GENERATOR
// Phase 4: Research & Decisioning
// Processes central bank / government policy announcements and assesses
// portfolio impact
// =========================================================================

/**
 * Generate a policy analysis note for a central bank or government announcement
 * Assesses market implications, portfolio impact, and recommended actions
 */
export function generatePolicyNote(policyEvent, marketState, holdings) {
  if (!policyEvent) return null;

  const now = new Date();

  // 1. Classify the event
  const event = classifyPolicyEvent(policyEvent);

  // 2. Assess surprise
  const surprise = assessPolicySurprise(policyEvent);

  // 3. Market implications
  const marketImplications = computeMarketImplications(policyEvent, marketState);

  // 4. Portfolio impact
  const portfolioImpact = computePolicyPortfolioImpact(policyEvent, holdings, marketState);

  // 5. Action items
  const actionItems = computePolicyActions(policyEvent, marketState, holdings);

  // 6. Narrative note
  const note = buildPolicyNarrative(policyEvent, surprise, marketImplications);

  return {
    event,
    date: now.toISOString().split('T')[0],
    type: policyEvent.type || 'Unknown',
    decision: policyEvent.decision || null,
    expected: policyEvent.expected || null,
    surprise,
    marketImplications,
    portfolioImpact,
    actionItems,
    note,
    timestamp: now.toISOString(),
  };
}

/**
 * Classify the policy event type
 */
function classifyPolicyEvent(event) {
  const type = (event.type || '').toLowerCase();

  if (type.includes('rate') || type.includes('fomc') || type.includes('boe') || type.includes('ecb')) {
    return { category: 'Interest Rate Decision', body: event.type, significance: 'High' };
  }
  if (type.includes('qe') || type.includes('qt') || type.includes('balance sheet')) {
    return { category: 'Balance Sheet Policy', body: event.type, significance: 'High' };
  }
  if (type.includes('fiscal') || type.includes('budget') || type.includes('tax')) {
    return { category: 'Fiscal Policy', body: event.type, significance: 'High' };
  }
  if (type.includes('regulation') || type.includes('crypto') || type.includes('ban')) {
    return { category: 'Regulatory Change', body: event.type, significance: 'Medium' };
  }
  if (type.includes('trade') || type.includes('tariff') || type.includes('sanction')) {
    return { category: 'Trade Policy', body: event.type, significance: 'Medium' };
  }
  return { category: 'Policy Announcement', body: event.type || 'Unclassified', significance: 'Medium' };
}

/**
 * Assess whether the decision was a surprise vs expectations
 */
function assessPolicySurprise(event) {
  if (event.surprise != null) {
    if (typeof event.surprise === 'boolean') {
      return { isSurprise: event.surprise, magnitude: event.surprise ? 'Moderate' : 'None', detail: event.surprise ? 'Decision deviated from consensus' : 'Decision in line with expectations' };
    }
    if (typeof event.surprise === 'string') {
      const lower = event.surprise.toLowerCase();
      const isSurprise = lower.includes('surprise') || lower.includes('unexpected') || lower.includes('shock');
      return { isSurprise, magnitude: isSurprise ? 'Significant' : 'None', detail: event.surprise };
    }
  }

  // Infer surprise from decision vs expected
  if (event.decision != null && event.expected != null) {
    if (typeof event.decision === 'number' && typeof event.expected === 'number') {
      const diff = Math.abs(event.decision - event.expected);
      if (diff === 0) return { isSurprise: false, magnitude: 'None', detail: 'Decision matched expectations exactly' };
      if (diff <= 0.25) return { isSurprise: true, magnitude: 'Slight', detail: `${diff * 100}bps deviation from consensus` };
      return { isSurprise: true, magnitude: 'Major', detail: `${diff * 100}bps deviation from consensus` };
    }
    if (event.decision !== event.expected) {
      return { isSurprise: true, magnitude: 'Moderate', detail: `Expected: ${event.expected}. Actual: ${event.decision}.` };
    }
  }

  return { isSurprise: false, magnitude: 'Unknown', detail: 'Insufficient data to assess surprise' };
}

/**
 * Compute market implications of the policy decision
 */
function computeMarketImplications(event, mkt) {
  const implications = [];
  const type = (event.type || '').toLowerCase();
  const isHawkish = isHawkishSignal(event);
  const isDovish = isDovishSignal(event);

  // Rate decision implications
  if (type.includes('rate') || type.includes('fomc') || type.includes('boe') || type.includes('ecb')) {
    if (isHawkish) {
      implications.push({ area: 'Equities', direction: 'Negative', detail: 'Higher rates compress multiples — growth stocks most vulnerable' });
      implications.push({ area: 'Bonds', direction: 'Negative', detail: 'Duration risk increases — short duration preferred' });
      implications.push({ area: 'Currency', direction: 'Positive', detail: 'Rate differential supports domestic currency' });
    } else if (isDovish) {
      implications.push({ area: 'Equities', direction: 'Positive', detail: 'Lower rates support valuations — growth over value' });
      implications.push({ area: 'Bonds', direction: 'Positive', detail: 'Duration rally likely — extend duration selectively' });
      implications.push({ area: 'Crypto', direction: 'Positive', detail: 'Easier monetary conditions support risk assets and BTC' });
    } else {
      implications.push({ area: 'Markets', direction: 'Neutral', detail: 'Decision in line with expectations — limited market impact' });
    }
  }

  // Fiscal policy implications
  if (type.includes('fiscal') || type.includes('budget') || type.includes('tax')) {
    implications.push({ area: 'Tax', direction: isHawkish ? 'Negative' : 'Positive', detail: 'Review personal tax position and wrapper strategy' });
    implications.push({ area: 'Spending', direction: 'Variable', detail: 'Assess sector exposure to government spending changes' });
  }

  // Regulatory implications
  if (type.includes('regulation') || type.includes('crypto')) {
    implications.push({ area: 'Crypto', direction: 'Variable', detail: 'Regulatory clarity can be positive; restrictions are negative' });
  }

  // General stress context
  if (mkt?.stress?.compositeScore > 50) {
    implications.push({ area: 'Risk', direction: 'Elevated', detail: `Policy change during elevated stress (${mkt.stress.compositeScore}/100) — expect amplified market reaction` });
  }

  return implications;
}

/**
 * Check if statement is hawkish
 */
function isHawkishSignal(event) {
  const statement = (event.statement || event.decision || '').toString().toLowerCase();
  return statement.includes('hike') || statement.includes('hawkish') || statement.includes('tighten') ||
    statement.includes('inflation concern') || statement.includes('raise');
}

/**
 * Check if statement is dovish
 */
function isDovishSignal(event) {
  const statement = (event.statement || event.decision || '').toString().toLowerCase();
  return statement.includes('cut') || statement.includes('dovish') || statement.includes('ease') ||
    statement.includes('pause') || statement.includes('lower');
}

/**
 * Compute impact on portfolio holdings
 */
function computePolicyPortfolioImpact(event, holdings, mkt) {
  if (!holdings?.length) return 'No holdings data — unable to assess portfolio impact.';

  const isHawkish_ = isHawkishSignal(event);
  const isDovish_ = isDovishSignal(event);

  const lines = [];

  if (isHawkish_) {
    lines.push('Hawkish signal — review growth/high-duration exposure.');
    lines.push('Favour value, short-duration, and quality factors.');
  } else if (isDovish_) {
    lines.push('Dovish signal — constructive for risk assets.');
    lines.push('Growth and long-duration positions benefit.');
  } else {
    lines.push('Neutral signal — no immediate portfolio adjustment required.');
  }

  return lines.join(' ');
}

/**
 * Compute recommended actions
 */
function computePolicyActions(event, mkt, holdings) {
  const actions = [];
  const isHawkish_ = isHawkishSignal(event);
  const isDovish_ = isDovishSignal(event);

  if (isHawkish_) {
    actions.push({ action: 'Review duration exposure in fixed income', priority: 'High', rationale: 'Rising rates erode long-duration bonds' });
    actions.push({ action: 'Assess growth stock valuations', priority: 'Medium', rationale: 'Higher discount rates compress growth multiples' });
  }

  if (isDovish_) {
    actions.push({ action: 'Consider adding duration to fixed income', priority: 'Medium', rationale: 'Falling rates benefit long-duration bonds' });
    actions.push({ action: 'Review crypto allocation', priority: 'Low', rationale: 'Easier conditions historically support BTC' });
  }

  const type = (event.type || '').toLowerCase();
  if (type.includes('budget') || type.includes('fiscal') || type.includes('tax')) {
    actions.push({ action: 'Review ISA/pension strategy for tax changes', priority: 'High', rationale: 'Fiscal policy changes may affect wrapper strategy' });
  }

  if (actions.length === 0) {
    actions.push({ action: 'No immediate action required', priority: 'Low', rationale: 'Decision in line with expectations' });
  }

  return actions;
}

/**
 * Build narrative note
 */
function buildPolicyNarrative(event, surprise, implications) {
  const lines = [];

  lines.push(`${event.type || 'Policy'} decision: ${event.decision || 'announced'}.`);

  if (event.expected != null) {
    lines.push(`Consensus expected: ${event.expected}.`);
  }

  lines.push(`Surprise: ${surprise.magnitude}. ${surprise.detail}.`);

  if (event.statement) {
    lines.push(`Statement: ${event.statement}`);
  }

  if (implications.length > 0) {
    lines.push(`Key implications: ${implications.map(i => `${i.area} (${i.direction})`).join(', ')}.`);
  }

  return lines.join(' ');
}
