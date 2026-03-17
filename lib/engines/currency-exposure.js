// =========================================================================
// LIFESTACK OS — CURRENCY EXPOSURE ENGINE
// Phase 2: Finance Operating System
// Maps FX exposure across the portfolio, flags unhedged concentration,
// and identifies unintended currency bets
// =========================================================================

/**
 * Default FX rates (GBP base)
 * In production, these come from a live FX API
 */
const DEFAULT_FX_RATES = {
  GBP: 1.0,
  USD: 0.79,
  EUR: 0.86,
  ZAR: 0.043,
  'GBP-H': 1.0, // GBP-hedged treated as GBP
  Mixed: 1.0,
};

/**
 * Historical vol of each currency pair vs GBP (annualized %)
 */
const FX_VOL = {
  GBP: 0,
  USD: 9.5,
  EUR: 7.2,
  ZAR: 18.4,
  'GBP-H': 1.0,
  Mixed: 8.0,
};

/**
 * Segment holdings by currency
 */
export function segmentByCurrency(holdings) {
  if (!holdings?.length) return {};

  const total = holdings.reduce((s, h) => s + h.val, 0);
  const currencies = {};

  holdings.forEach(h => {
    const ccy = h.ccy || 'GBP';
    if (!currencies[ccy]) {
      currencies[ccy] = { currency: ccy, value: 0, count: 0, holdings: [] };
    }
    currencies[ccy].value += h.val;
    currencies[ccy].count += 1;
    currencies[ccy].holdings.push(h.name);
  });

  Object.values(currencies).forEach(c => {
    c.weight = total > 0 ? +((c.value / total) * 100).toFixed(1) : 0;
    c.vol = FX_VOL[c.currency] || 10;
  });

  return currencies;
}

/**
 * Compute FX concentration metrics
 */
export function computeFXConcentration(currencies) {
  const entries = Object.values(currencies);
  if (!entries.length) return { homeBias: 0, diversificationScore: 0, maxExposure: null };

  const gbpWeight = currencies['GBP']?.weight || 0;
  const gbpHWeight = currencies['GBP-H']?.weight || 0;
  const homeBias = +(gbpWeight + gbpHWeight).toFixed(1);

  // Max single non-GBP exposure
  const nonGBP = entries.filter(c => c.currency !== 'GBP' && c.currency !== 'GBP-H');
  const maxNonGBP = nonGBP.length > 0
    ? nonGBP.reduce((max, c) => c.weight > max.weight ? c : max, nonGBP[0])
    : null;

  // Diversification: more currencies with meaningful weight = better
  const meaningfulCurrencies = entries.filter(c => c.weight > 5).length;
  const diversificationScore = Math.min(10, meaningfulCurrencies * 2);

  return {
    homeBias,
    diversificationScore,
    maxExposure: maxNonGBP ? { currency: maxNonGBP.currency, weight: maxNonGBP.weight } : null,
    meaningfulCurrencies,
  };
}

/**
 * Flag unintended FX bets — large currency exposures that may not be deliberate
 */
export function flagUnintendedFXBets(currencies, intentionalThreshold = 15) {
  const risks = [];

  Object.values(currencies).forEach(c => {
    if (c.currency === 'GBP' || c.currency === 'GBP-H') return;

    if (c.weight > intentionalThreshold) {
      risks.push({
        currency: c.currency,
        weight: c.weight,
        vol: c.vol,
        riskContribution: +((c.weight / 100) * c.vol).toFixed(2),
        alert: `${c.currency} at ${c.weight}% — exceeds ${intentionalThreshold}% threshold`,
        mitigation: c.vol > 15
          ? 'Consider partial hedge or reducing position size'
          : 'Monitor — moderate vol',
      });
    }
  });

  return risks.sort((a, b) => b.riskContribution - a.riskContribution);
}

/**
 * Compute weighted portfolio FX volatility contribution
 */
export function computePortfolioFXVol(currencies) {
  const entries = Object.values(currencies);
  if (!entries.length) return 0;

  // Simplified: weighted sum of individual FX vols
  const weightedVol = entries.reduce((s, c) => {
    return s + (c.weight / 100) * (c.vol || 0);
  }, 0);

  return +weightedVol.toFixed(2);
}

/**
 * Master function: compute full currency exposure state
 */
export function computeCurrencyExposureState(holdings) {
  if (!holdings?.length) return null;

  const total = holdings.reduce((s, h) => s + h.val, 0);
  const currencies = segmentByCurrency(holdings);
  const concentration = computeFXConcentration(currencies);
  const risks = flagUnintendedFXBets(currencies);
  const portfolioFXVol = computePortfolioFXVol(currencies);

  return {
    totalValue: total,
    currencies: Object.values(currencies).map(c => ({
      currency: c.currency,
      value: c.value,
      weight: c.weight,
      count: c.count,
      vol: c.vol,
    })).sort((a, b) => b.value - a.value),
    homeBias: concentration.homeBias,
    diversificationScore: concentration.diversificationScore,
    maxNonGBPExposure: concentration.maxExposure,
    portfolioFXVol,
    risks,
    fxHealthRating: risks.length === 0 ? 'Good' : risks.length <= 2 ? 'Fair' : 'Needs Attention',
  };
}
