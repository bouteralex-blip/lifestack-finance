// =========================================================================
// LIFESTACK OS — ALTCOIN RISK CAP ENGINE
// Phase 4: Research & Decisioning
// Enforces hard sleeve caps on altcoin exposure (non-BTC/ETH crypto)
// =========================================================================

/**
 * Major crypto assets exempt from altcoin cap
 */
const MAJOR_CRYPTO = ['BTC', 'BITCOIN', 'ETH', 'ETHEREUM', 'WBTC', 'WETH', 'STETH'];

/**
 * Determine if a holding is an altcoin (crypto but not BTC/ETH)
 */
function isAltcoin(holding) {
  const ticker = (holding.ticker || holding.symbol || '').toUpperCase();
  const sleeve = (holding.sleeve || holding.assetClass || '').toLowerCase();
  const isCrypto = sleeve.includes('crypto') || sleeve.includes('digital');

  if (!isCrypto) return false;
  return !MAJOR_CRYPTO.includes(ticker);
}

/**
 * Compute altcoin risk cap state
 *
 * @param {Array} holdings - Portfolio holdings array
 * @param {Object} portConfig - Portfolio configuration with altcoinCapPct
 * @returns {Object|null} Altcoin risk cap state
 */
export function computeAltcoinRiskCap(holdings, portConfig) {
  if (!holdings?.length) return null;

  const capPct = portConfig?.altcoinCapPct ?? 5;

  const totalPortfolioValue = holdings.reduce((sum, h) => sum + (h.val || 0), 0);
  if (totalPortfolioValue <= 0) return null;

  // Identify altcoin holdings
  const altcoinHoldings = holdings.filter(isAltcoin);
  const altcoinValue = altcoinHoldings.reduce((sum, h) => sum + (h.val || 0), 0);
  const currentAltcoinPct = +((altcoinValue / totalPortfolioValue) * 100).toFixed(2);

  const isBreached = currentAltcoinPct > capPct;
  const excess = isBreached ? +(currentAltcoinPct - capPct).toFixed(2) : 0;
  const excessValue = isBreached ? +((excess / 100) * totalPortfolioValue).toFixed(0) : 0;

  // Generate trim recommendations sorted by smallest position first (trim clutter)
  const holdingsToTrim = [];
  if (isBreached) {
    const sorted = [...altcoinHoldings].sort((a, b) => (a.val || 0) - (b.val || 0));
    let remaining = excessValue;

    for (const h of sorted) {
      if (remaining <= 0) break;
      const trimAmount = Math.min(h.val || 0, remaining);
      holdingsToTrim.push({
        ticker: h.ticker || h.symbol || 'UNKNOWN',
        name: h.name || h.ticker || 'Unknown',
        currentValue: h.val || 0,
        trimAmount: +trimAmount.toFixed(0),
        trimPct: +((trimAmount / (h.val || 1)) * 100).toFixed(1),
      });
      remaining -= trimAmount;
    }
  }

  return {
    currentAltcoinPct,
    capPct,
    isBreached,
    excess,
    excessValue,
    altcoinCount: altcoinHoldings.length,
    altcoinValue: +altcoinValue.toFixed(0),
    holdingsToTrim,
    implication: isBreached
      ? `Altcoin exposure ${currentAltcoinPct}% exceeds ${capPct}% cap by ${excess}pp (£${excessValue.toLocaleString()}). Trim smallest altcoin positions to comply.`
      : currentAltcoinPct > capPct * 0.8
        ? `Altcoin exposure ${currentAltcoinPct}% approaching ${capPct}% cap. Monitor — no action needed yet.`
        : `Altcoin exposure ${currentAltcoinPct}% within ${capPct}% cap. Allocation compliant.`,
  };
}
