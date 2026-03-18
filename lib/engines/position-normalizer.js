// =========================================================================
// LIFESTACK OS — POSITION NORMALIZER ENGINE
// Phase 2: Finance Operating System
// Aggregate same-stock positions across wrappers, normalize names
// =========================================================================

/**
 * Normalize positions by grouping same ticker across wrappers
 * Aggregates values, tracks wrapper breakdown, computes consolidated weights
 */
export function normalizePositions(holdings) {
  if (!holdings?.length) return null;

  const totalValue = holdings.reduce((s, h) => s + (h.value || h.val || 0), 0);
  if (totalValue <= 0) return null;

  const grouped = {};
  const duplicates = [];

  holdings.forEach(h => {
    const ticker = (h.ticker || '').toUpperCase().trim();
    const name = (h.name || ticker || 'Unknown').trim();
    const value = h.value || h.val || 0;
    const wrapper = (h.wrapper || 'GIA').toUpperCase().trim();

    if (!ticker) return;

    if (!grouped[ticker]) {
      grouped[ticker] = {
        ticker,
        name,
        totalValue: 0,
        wrappers: [],
        seenWrappers: new Set(),
      };
    }

    grouped[ticker].totalValue += value;
    grouped[ticker].wrappers.push({ type: wrapper, value: +value.toFixed(2) });

    if (grouped[ticker].seenWrappers.has(wrapper)) {
      duplicates.push({
        ticker,
        wrapper,
        value: +value.toFixed(2),
        note: `Duplicate ${ticker} in ${wrapper}`,
      });
    }
    grouped[ticker].seenWrappers.add(wrapper);
  });

  const normalized = Object.values(grouped)
    .map(g => {
      // Clean up internal tracking
      delete g.seenWrappers;
      return {
        ...g,
        totalValue: +g.totalValue.toFixed(2),
        consolidatedWeight: +((g.totalValue / totalValue) * 100).toFixed(2),
      };
    })
    .sort((a, b) => b.totalValue - a.totalValue);

  return {
    normalized,
    duplicates,
    totalPositions: normalized.length,
    originalCount: holdings.length,
    consolidatedCount: holdings.length - normalized.length,
  };
}

/**
 * Find and flag duplicate positions (same ticker in same wrapper)
 * Returns deduplicated list with merged values
 */
export function deduplicatePositions(holdings) {
  if (!holdings?.length) return null;

  const seen = {};
  const duplicates = [];
  const deduplicated = [];

  holdings.forEach(h => {
    const ticker = (h.ticker || '').toUpperCase().trim();
    const wrapper = (h.wrapper || 'GIA').toUpperCase().trim();
    const key = `${ticker}__${wrapper}`;
    const value = h.value || h.val || 0;

    if (!ticker) {
      deduplicated.push(h);
      return;
    }

    if (seen[key]) {
      // Merge into existing
      seen[key].value = +(seen[key].value + value).toFixed(2);
      if (seen[key].val !== undefined) {
        seen[key].val = seen[key].value;
      }
      duplicates.push({
        ticker,
        wrapper,
        mergedValue: value,
        note: `Merged duplicate ${ticker} in ${wrapper}`,
      });
    } else {
      const merged = { ...h, value: +value.toFixed(2) };
      seen[key] = merged;
      deduplicated.push(merged);
    }
  });

  const totalValue = deduplicated.reduce((s, h) => s + (h.value || h.val || 0), 0);

  return {
    holdings: deduplicated,
    duplicatesFound: duplicates.length,
    duplicates,
    originalCount: holdings.length,
    deduplicatedCount: deduplicated.length,
    totalValue: +totalValue.toFixed(2),
  };
}
