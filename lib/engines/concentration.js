// =========================================================================
// LIFESTACK OS — CONCENTRATION ENGINE
// Phase 2: Finance Operating System
// Detects position clutter, HHI crowding, and single-name concentration risk
// =========================================================================

/**
 * Compute Herfindahl-Hirschman Index (HHI) from holdings
 * HHI = sum of squared weights (0–10000 scale)
 * Lower = more diversified, Higher = more concentrated
 */
export function computeHHI(holdings) {
  if (!holdings?.length) return 0;
  const total = holdings.reduce((s, h) => s + h.val, 0);
  if (total <= 0) return 0;
  return holdings.reduce((s, h) => {
    const w = (h.val / total) * 100;
    return s + w * w;
  }, 0);
}

/**
 * Compute effective number of positions = 1 / HHI (normalized)
 * Represents how many equally-weighted positions the portfolio behaves like
 */
export function computeEffectivePositions(hhi) {
  if (!hhi || hhi <= 0) return 0;
  return +(10000 / hhi).toFixed(1);
}

/**
 * Rank holdings by portfolio weight (descending)
 * Returns enriched array with weight %, cumulative weight, and rank
 */
export function rankByWeight(holdings) {
  if (!holdings?.length) return [];
  const total = holdings.reduce((s, h) => s + h.val, 0);
  if (total <= 0) return [];

  return [...holdings]
    .sort((a, b) => b.val - a.val)
    .map((h, i) => ({
      ...h,
      weight: +((h.val / total) * 100).toFixed(2),
      rank: i + 1,
    }))
    .reduce((acc, h) => {
      const cumWeight = (acc.length > 0 ? acc[acc.length - 1].cumWeight : 0) + h.weight;
      acc.push({ ...h, cumWeight: +cumWeight.toFixed(2) });
      return acc;
    }, []);
}

/**
 * Identify position clutter — holdings below a threshold weight
 * These add operational complexity without meaningful portfolio impact
 */
export function identifyClutter(holdings, threshold = 1.0) {
  if (!holdings?.length) return { count: 0, totalValue: 0, holdings: [] };
  const total = holdings.reduce((s, h) => s + h.val, 0);
  if (total <= 0) return { count: 0, totalValue: 0, holdings: [] };

  const clutter = holdings
    .filter(h => (h.val / total) * 100 < threshold)
    .sort((a, b) => a.val - b.val);

  return {
    count: clutter.length,
    totalValue: clutter.reduce((s, h) => s + h.val, 0),
    totalWeight: +((clutter.reduce((s, h) => s + h.val, 0) / total) * 100).toFixed(2),
    holdings: clutter.map(h => ({
      name: h.name,
      value: h.val,
      weight: +((h.val / total) * 100).toFixed(2),
      recommendation: h.val < 500 ? 'Liquidate' : 'Consolidate or size up',
    })),
  };
}

/**
 * Check concentration against limits
 * Returns violations where any single position, sector, or geography exceeds caps
 */
export function flagConcentrationViolations(holdings, limits = {}) {
  const {
    singlePositionCap = 25,  // max % for any single holding
    top3Cap = 50,            // max % for top 3 combined
    top5Cap = 65,            // max % for top 5 combined
    sectorCap = 40,          // max % for any single asset class
    geoCap = 50,             // max % for any single geography
  } = limits;

  if (!holdings?.length) return { violations: [], score: 10 };

  const total = holdings.reduce((s, h) => s + h.val, 0);
  if (total <= 0) return { violations: [], score: 10 };

  const ranked = rankByWeight(holdings);
  const violations = [];

  // Single position check
  if (ranked[0] && ranked[0].weight > singlePositionCap) {
    violations.push({
      type: 'single_position',
      item: ranked[0].name,
      actual: ranked[0].weight,
      limit: singlePositionCap,
      severity: ranked[0].weight > singlePositionCap * 1.5 ? 'critical' : 'warning',
    });
  }

  // Top 3 check
  const top3Weight = ranked.slice(0, 3).reduce((s, h) => s + h.weight, 0);
  if (top3Weight > top3Cap) {
    violations.push({
      type: 'top_3',
      item: ranked.slice(0, 3).map(h => h.name).join(', '),
      actual: +top3Weight.toFixed(2),
      limit: top3Cap,
      severity: top3Weight > top3Cap * 1.2 ? 'critical' : 'warning',
    });
  }

  // Top 5 check
  const top5Weight = ranked.slice(0, 5).reduce((s, h) => s + h.weight, 0);
  if (top5Weight > top5Cap) {
    violations.push({
      type: 'top_5',
      item: ranked.slice(0, 5).map(h => h.name).join(', '),
      actual: +top5Weight.toFixed(2),
      limit: top5Cap,
      severity: 'warning',
    });
  }

  // Sector concentration
  const bySector = {};
  holdings.forEach(h => {
    const cls = h.cls || 'Unknown';
    bySector[cls] = (bySector[cls] || 0) + h.val;
  });
  Object.entries(bySector).forEach(([cls, val]) => {
    const pct = (val / total) * 100;
    if (pct > sectorCap) {
      violations.push({
        type: 'sector',
        item: cls,
        actual: +pct.toFixed(2),
        limit: sectorCap,
        severity: pct > sectorCap * 1.3 ? 'critical' : 'warning',
      });
    }
  });

  // Geography concentration
  const byGeo = {};
  holdings.forEach(h => {
    const geo = h.geo || 'Unknown';
    byGeo[geo] = (byGeo[geo] || 0) + h.val;
  });
  Object.entries(byGeo).forEach(([geo, val]) => {
    const pct = (val / total) * 100;
    if (pct > geoCap) {
      violations.push({
        type: 'geography',
        item: geo,
        actual: +pct.toFixed(2),
        limit: geoCap,
        severity: 'warning',
      });
    }
  });

  // Score: 10 = no violations, 0 = many critical violations
  const score = Math.max(0, 10 - violations.filter(v => v.severity === 'critical').length * 3
    - violations.filter(v => v.severity === 'warning').length * 1.5);

  return { violations, score: +score.toFixed(1) };
}

/**
 * Master function: compute full concentration state from holdings
 */
export function computeConcentrationState(holdings) {
  if (!holdings?.length) return null;

  const total = holdings.reduce((s, h) => s + h.val, 0);
  const hhi = computeHHI(holdings);
  const effPos = computeEffectivePositions(hhi);
  const ranked = rankByWeight(holdings);
  const clutter = identifyClutter(holdings);
  const { violations, score } = flagConcentrationViolations(holdings);

  const top3 = ranked.slice(0, 3);
  const top5 = ranked.slice(0, 5);
  const top10 = ranked.slice(0, 10);

  return {
    hhi: +hhi.toFixed(1),
    effectivePositions: effPos,
    totalPositions: holdings.length,
    top3Weight: +top3.reduce((s, h) => s + h.weight, 0).toFixed(1),
    top5Weight: +top5.reduce((s, h) => s + h.weight, 0).toFixed(1),
    top10Weight: +top10.reduce((s, h) => s + h.weight, 0).toFixed(1),
    top3: top3.map(h => ({ name: h.name, weight: h.weight, value: h.val })),
    top5: top5.map(h => ({ name: h.name, weight: h.weight, value: h.val })),
    clutter,
    violations,
    concentrationScore: score,
    diversificationRating: hhi < 500 ? 'Well Diversified' : hhi < 800 ? 'Moderate' : hhi < 1200 ? 'Concentrated' : 'Highly Concentrated',
  };
}
