// =========================================================================
// LIFESTACK OS — CRYPTO REBALANCE ENGINE
// Phase 2: Finance Operating System
// Compare actual crypto allocation vs target weights, generate rebalance trades
// =========================================================================

/**
 * Default crypto target weights (%)
 */
const DEFAULT_CRYPTO_TARGETS = {
  BTC: 70,
  ETH: 20,
  SOL: 5,
  OTHER: 5,
};

/**
 * Known major crypto tickers mapped to canonical names
 */
const CANONICAL_MAP = {
  BTC: 'BTC', BITCOIN: 'BTC', WBTC: 'BTC', GBTC: 'BTC', IBIT: 'BTC',
  ETH: 'ETH', ETHEREUM: 'ETH', WETH: 'ETH', STETH: 'ETH', ETHE: 'ETH',
  SOL: 'SOL', SOLANA: 'SOL',
};

/**
 * Map a holding ticker to a target bucket
 */
function toBucket(ticker) {
  const upper = (ticker || '').toUpperCase();
  return CANONICAL_MAP[upper] || 'OTHER';
}

/**
 * Filter holdings to crypto only
 */
function filterCryptoHoldings(holdings) {
  return holdings.filter(h => {
    const sleeve = (h.sleeve || h.assetClass || '').toLowerCase();
    return sleeve.includes('crypto') || sleeve.includes('digital');
  });
}

/**
 * Compute crypto rebalance state
 *
 * @param {Array} holdings - Full portfolio holdings array
 * @param {Object} targets - Target weights by asset, e.g. { BTC: 70, ETH: 20, SOL: 5, OTHER: 5 }
 * @returns {Object|null} Rebalance state with allocations, trades, drift info
 */
export function computeCryptoRebalanceState(holdings, targets = DEFAULT_CRYPTO_TARGETS) {
  if (!holdings?.length) return null;

  const cryptoHoldings = filterCryptoHoldings(holdings);
  if (!cryptoHoldings.length) return null;

  const totalCryptoValue = cryptoHoldings.reduce((sum, h) => sum + (h.val || 0), 0);
  if (totalCryptoValue <= 0) return null;

  // Aggregate actual weights by bucket
  const bucketValues = {};
  for (const h of cryptoHoldings) {
    const bucket = toBucket(h.ticker || h.symbol || '');
    bucketValues[bucket] = (bucketValues[bucket] || 0) + (h.val || 0);
  }

  // Build allocations array
  const allBuckets = new Set([...Object.keys(targets), ...Object.keys(bucketValues)]);
  const allocations = [];

  for (const asset of allBuckets) {
    const actualValue = bucketValues[asset] || 0;
    const actual = +((actualValue / totalCryptoValue) * 100).toFixed(2);
    const target = targets[asset] || 0;
    const drift = +(actual - target).toFixed(2);

    allocations.push({
      asset,
      actualValue: +actualValue.toFixed(0),
      actual,
      target,
      drift,
      absDrift: Math.abs(drift),
      direction: drift > 0 ? 'OW' : drift < 0 ? 'UW' : '—',
    });
  }

  allocations.sort((a, b) => b.absDrift - a.absDrift);

  // Generate rebalance trades (only for meaningful drifts > 1%)
  const trades = allocations
    .filter(a => a.absDrift > 1)
    .map(a => ({
      asset: a.asset,
      action: a.drift > 0 ? 'SELL' : 'BUY',
      amount: +((a.absDrift / 100) * totalCryptoValue).toFixed(0),
      pct: a.absDrift,
      from: a.actual,
      to: a.target,
    }))
    .sort((a, b) => b.amount - a.amount);

  const maxDrift = allocations.length > 0 ? allocations[0].absDrift : 0;
  const needsRebalance = maxDrift > 5 || trades.length >= 2;

  return {
    totalCryptoValue: +totalCryptoValue.toFixed(0),
    allocations,
    trades,
    maxDrift,
    needsRebalance,
    implication: needsRebalance
      ? `Crypto allocation drifted ${maxDrift.toFixed(1)}pp from targets. ${trades.length} rebalance trade(s) recommended to restore target weights.`
      : maxDrift > 2
        ? `Minor crypto drift detected (${maxDrift.toFixed(1)}pp). Within tolerance — monitor but no action needed.`
        : 'Crypto allocation aligned with target weights. No rebalance needed.',
  };
}
