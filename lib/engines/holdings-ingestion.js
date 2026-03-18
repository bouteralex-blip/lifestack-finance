// =========================================================================
// LIFESTACK OS — HOLDINGS INGESTION ENGINE
// Phase 2: Finance Operating System
// Clean and normalize raw holdings data from CSV/broker import
// =========================================================================

/**
 * Clamp a value between min and max
 */
function clamp(v, min, max) {
  return Math.min(max, Math.max(min, v));
}

/**
 * Known ticker patterns for asset class inference
 */
const ASSET_CLASS_PATTERNS = [
  { pattern: /^(VWRL|VUSA|VHYL|VUAG|VMID|VEVE|VFEM|SWDA|IWDG|EQQQ|CSP1|ISF|IUKD|VWRP|SPY|QQQ|VTI|VOO)/i, cls: 'Equity' },
  { pattern: /^(VAGP|VAGS|VGOV|IGLT|INXG|GILT|SLXX|CORP|AGBP|TLT|BND|AGG)/i, cls: 'Fixed Income' },
  { pattern: /^(BTC|ETH|SOL|ADA|DOT|XRP|AVAX|MATIC|LINK|UNI)/i, cls: 'Crypto' },
  { pattern: /^(REIT|IUKP|IDWP|VNQ|VNQI|INTU)/i, cls: 'Real Assets' },
  { pattern: /^(VGLS|VANG.*LS|VANL|V60A|V80A|V40A)/i, cls: 'Multi-Asset' },
  { pattern: /^(CSH2|XDWT|VERX|GBP|USD|EUR|MMF)/i, cls: 'Cash & Equivalents' },
];

/**
 * Infer asset class from ticker symbol using known patterns
 */
function inferAssetClass(ticker) {
  if (!ticker) return 'Unknown';
  for (const { pattern, cls } of ASSET_CLASS_PATTERNS) {
    if (pattern.test(ticker)) return cls;
  }
  return 'Unknown';
}

/**
 * Validate a single holding record
 * Returns { isValid, warnings }
 */
function validateSingle(h) {
  const warnings = [];

  if (!h.name && !h.ticker) {
    warnings.push('Missing both name and ticker');
  }
  if (!h.ticker) {
    warnings.push(`Missing ticker for "${h.name || 'unknown'}"`);
  }
  if (h.value === undefined || h.value === null || isNaN(h.value)) {
    warnings.push(`Invalid value for "${h.ticker || h.name || 'unknown'}"`);
  }
  if (h.value !== undefined && h.value < 0) {
    warnings.push(`Negative value for "${h.ticker || h.name || 'unknown'}": ${h.value}`);
  }
  if (!h.wrapper) {
    warnings.push(`Missing wrapper for "${h.ticker || h.name || 'unknown'}"`);
  }
  if (!h.currency) {
    warnings.push(`Missing currency for "${h.ticker || h.name || 'unknown'}", defaulting to GBP`);
  }

  const isValid = h.value !== undefined && !isNaN(h.value) && h.value >= 0 && (h.name || h.ticker);
  return { isValid, warnings };
}

/**
 * Normalize raw holdings from CSV/broker import
 * Cleans tickers, infers asset classes, flags missing data
 */
export function normalizeHoldings(rawHoldings) {
  if (!rawHoldings?.length) return null;

  const allWarnings = [];
  let invalidCount = 0;

  const holdings = rawHoldings.map(h => {
    const ticker = h.ticker ? h.ticker.trim().toUpperCase() : '';
    const name = h.name ? h.name.trim() : ticker || 'Unknown';
    const value = typeof h.value === 'string' ? parseFloat(h.value) : (h.value || 0);
    const wrapper = h.wrapper ? h.wrapper.trim().toUpperCase() : 'GIA';
    const currency = h.currency ? h.currency.trim().toUpperCase() : 'GBP';
    const type = h.type ? h.type.trim() : '';
    const assetClass = h.assetClass || h.cls || inferAssetClass(ticker) || (type ? type : 'Unknown');

    const { isValid, warnings } = validateSingle({ name, ticker, value, wrapper, currency });
    if (!isValid) invalidCount++;
    warnings.forEach(w => allWarnings.push(w));

    return {
      name,
      ticker,
      value: isNaN(value) ? 0 : value,
      weight: 0, // computed below
      wrapper,
      currency,
      assetClass,
      isValid,
    };
  });

  const totalValue = holdings
    .filter(h => h.isValid)
    .reduce((s, h) => s + h.value, 0);

  // Compute weights
  holdings.forEach(h => {
    h.weight = totalValue > 0 ? +((h.value / totalValue) * 100).toFixed(2) : 0;
  });

  return {
    holdings,
    warnings: allWarnings,
    invalidCount,
    totalValue: +totalValue.toFixed(2),
  };
}

/**
 * Validate an already-normalized holdings array
 * Returns summary of data quality issues
 */
export function validateHoldings(holdings) {
  if (!holdings?.length) return null;

  const issues = [];
  let validCount = 0;
  let invalidCount = 0;

  holdings.forEach(h => {
    const { isValid, warnings } = validateSingle(h);
    if (isValid) {
      validCount++;
    } else {
      invalidCount++;
    }
    warnings.forEach(w => issues.push(w));
  });

  const totalValue = holdings.reduce((s, h) => s + (h.value || h.val || 0), 0);
  const missingTickers = holdings.filter(h => !h.ticker).length;
  const missingWrappers = holdings.filter(h => !h.wrapper).length;
  const unknownClasses = holdings.filter(h => (h.assetClass || h.cls) === 'Unknown').length;

  return {
    totalHoldings: holdings.length,
    validCount,
    invalidCount,
    missingTickers,
    missingWrappers,
    unknownClasses,
    totalValue: +totalValue.toFixed(2),
    dataQualityScore: clamp(+((validCount / holdings.length) * 100).toFixed(1), 0, 100),
    issues,
  };
}
