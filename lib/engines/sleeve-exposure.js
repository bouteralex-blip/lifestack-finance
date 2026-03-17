// =========================================================================
// LIFESTACK OS — SLEEVE EXPOSURE ENGINE
// Phase 2: Finance Operating System
// Classifies holdings into asset sleeves and computes allocation weights
// =========================================================================

/**
 * Default sleeve definitions — maps asset_class to sleeve
 */
const SLEEVE_DEFS = {
  'Pension':     'Pension',
  'Cash':        'Cash & Equivalents',
  'Cash/FD':     'Cash & Equivalents',
  'ETF':         'Equity',
  'Stock':       'Equity',
  'Investment':  'Equity',
  'Crypto':      'Crypto',
  'Bond':        'Fixed Income',
  'REIT':        'Real Assets',
  'Commodity':   'Real Assets',
  'Mixed':       'Multi-Asset',
};

/**
 * Classify a holding into a sleeve based on its asset class
 */
export function classifyToSleeve(holding, definitions = SLEEVE_DEFS) {
  if (!holding) return 'Unknown';
  return definitions[holding.cls] || 'Other';
}

/**
 * Compute sleeve weights from holdings
 * Returns array of sleeves with actual weights, values, and holding counts
 */
export function computeSleeveWeights(holdings, definitions = SLEEVE_DEFS) {
  if (!holdings?.length) return [];

  const total = holdings.reduce((s, h) => s + h.val, 0);
  if (total <= 0) return [];

  const sleeves = {};

  holdings.forEach(h => {
    const sleeve = classifyToSleeve(h, definitions);
    if (!sleeves[sleeve]) {
      sleeves[sleeve] = { name: sleeve, value: 0, count: 0, holdings: [] };
    }
    sleeves[sleeve].value += h.val;
    sleeves[sleeve].count += 1;
    sleeves[sleeve].holdings.push(h.name);
  });

  return Object.values(sleeves)
    .map(s => ({
      ...s,
      weight: +((s.value / total) * 100).toFixed(2),
    }))
    .sort((a, b) => b.value - a.value);
}

/**
 * Default target allocation — user-configurable
 */
const DEFAULT_TARGETS = {
  'Equity': 40,
  'Pension': 22,
  'Cash & Equivalents': 16,
  'Crypto': 13,
  'Multi-Asset': 5,
  'Real Assets': 2,
  'Fixed Income': 2,
};

/**
 * Compare actual sleeve weights to target allocation
 * Returns deviations with drift direction and magnitude
 */
export function computeSleeveDeviations(holdings, targets = DEFAULT_TARGETS, definitions = SLEEVE_DEFS) {
  const sleeves = computeSleeveWeights(holdings, definitions);
  if (!sleeves.length) return [];

  return sleeves.map(s => {
    const target = targets[s.name] || 0;
    const drift = +(s.weight - target).toFixed(2);
    return {
      ...s,
      target,
      drift,
      driftDirection: drift > 0 ? 'overweight' : drift < 0 ? 'underweight' : 'on-target',
      driftSeverity: Math.abs(drift) > 5 ? 'significant' : Math.abs(drift) > 2 ? 'minor' : 'within-tolerance',
    };
  });
}

/**
 * Compute risk contribution per sleeve (simplified — weight * vol proxy)
 * In production, this would use actual return covariance
 */
const SLEEVE_VOL_PROXY = {
  'Equity': 18,
  'Pension': 14,
  'Cash & Equivalents': 1,
  'Crypto': 65,
  'Fixed Income': 6,
  'Real Assets': 15,
  'Multi-Asset': 12,
  'Other': 20,
};

export function computeSleeveRisk(sleeves) {
  if (!sleeves?.length) return [];

  const totalRiskContrib = sleeves.reduce((s, sl) => {
    const vol = SLEEVE_VOL_PROXY[sl.name] || 20;
    return s + sl.weight * vol;
  }, 0);

  return sleeves.map(s => {
    const vol = SLEEVE_VOL_PROXY[s.name] || 20;
    const riskContrib = totalRiskContrib > 0 ? +((s.weight * vol / totalRiskContrib) * 100).toFixed(1) : 0;
    return {
      ...s,
      volProxy: vol,
      riskContribution: riskContrib,
    };
  });
}

/**
 * Flag deviations exceeding a threshold
 */
export function flagDeviations(sleeves, threshold = 2.0) {
  return sleeves
    .filter(s => Math.abs(s.drift) > threshold)
    .sort((a, b) => Math.abs(b.drift) - Math.abs(a.drift));
}

/**
 * Master function: compute full sleeve exposure state
 */
export function computeSleeveExposureState(holdings, targets = DEFAULT_TARGETS) {
  if (!holdings?.length) return null;

  const total = holdings.reduce((s, h) => s + h.val, 0);
  const deviations = computeSleeveDeviations(holdings, targets);
  const withRisk = computeSleeveRisk(deviations);
  const significantDrifts = flagDeviations(withRisk);
  const maxDrift = Math.max(...withRisk.map(s => Math.abs(s.drift)), 0);

  return {
    totalValue: total,
    sleeves: withRisk,
    significantDrifts,
    maxDrift: +maxDrift.toFixed(2),
    allocationHealth: maxDrift > 10 ? 'Poor' : maxDrift > 5 ? 'Fair' : maxDrift > 2 ? 'Good' : 'Excellent',
    totalEquity: withRisk.filter(s => s.name === 'Equity').reduce((a, s) => a + s.weight, 0),
    totalCrypto: withRisk.filter(s => s.name === 'Crypto').reduce((a, s) => a + s.weight, 0),
    totalCash: withRisk.filter(s => s.name === 'Cash & Equivalents').reduce((a, s) => a + s.weight, 0),
    totalPension: withRisk.filter(s => s.name === 'Pension').reduce((a, s) => a + s.weight, 0),
  };
}
