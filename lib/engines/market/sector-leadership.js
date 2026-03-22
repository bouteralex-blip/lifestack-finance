// =========================================================================
// LIFESTACK OS — SECTOR LEADERSHIP TRACKER
// Phase 3: Market Intelligence
// Tracks sector rotation, identifies leadership changes, breadth signals
// =========================================================================

/**
 * Classify sector performance into leadership tiers
 */
function classifyLeadership(ret12m, retYTD) {
  // Accept either element-style decimals (0.15 = 15%) or percentage values (15 = 15%).
  const norm = value => {
    if (typeof value !== 'number' || Number.isNaN(value)) return 0;
    return Math.abs(value) <= 2 ? value * 100 : value;
  };

  const p12m = norm(ret12m);
  const pYTD = norm(retYTD);

  if (p12m > 25 && pYTD > 5) return { tier: 'LEADING', color: '#22c55e', momentum: 'Strong' };
  if (p12m > 15 || pYTD > 3) return { tier: 'IMPROVING', color: '#06b6d4', momentum: 'Positive' };
  if (p12m > 0 && pYTD > -5) return { tier: 'NEUTRAL', color: '#f59e0b', momentum: 'Flat' };
  if (p12m > -10) return { tier: 'LAGGING', color: '#f97316', momentum: 'Weak' };
  return { tier: 'COLLAPSING', color: '#ef4444', momentum: 'Negative' };
}

/**
 * Compute sector leadership state from sector data
 */
export function computeSectorLeadershipState(sectorData) {
  if (!sectorData?.length) return null;

  const sectors = sectorData.map(s => {
    const ret12m = s.v || 0;
    const retYTD = s.y || 0;
    const leadership = classifyLeadership(ret12m, retYTD);

    return {
      name: s.s,
      return12m: ret12m,
      returnYTD: retYTD,
      tier: leadership.tier,
      color: leadership.color || s.c,
      momentum: leadership.momentum,
    };
  }).sort((a, b) => b.return12m - a.return12m);

  // Breadth analysis
  const positive12m = sectors.filter(s => s.return12m > 0).length;
  const positive = sectors.filter(s => s.returnYTD > 0).length;
  const breadthPct = sectors.length > 0 ? +((positive / sectors.length) * 100).toFixed(0) : 0;
  const breadth12mPct = sectors.length > 0 ? +((positive12m / sectors.length) * 100).toFixed(0) : 0;

  // Rotation signal: if leadership is changing (top sectors switching)
  const leaders = sectors.filter(s => s.tier === 'LEADING');
  const laggards = sectors.filter(s => s.tier === 'LAGGING' || s.tier === 'COLLAPSING');

  // Dispersion: spread between best and worst sector
  const best = sectors[0]?.return12m || 0;
  const worst = sectors[sectors.length - 1]?.return12m || 0;
  const dispersion = +(best - worst).toFixed(1);

  return {
    sectors,
    leaders: leaders.map(s => s.name),
    laggards: laggards.map(s => s.name),
    breadthYTD: breadthPct,
    breadth12m: breadth12mPct,
    dispersion,
    rotationSignal: dispersion > 60 ? 'EXTREME' : dispersion > 30 ? 'HIGH' : 'NORMAL',
    marketBreadth: breadthPct > 70 ? 'BROAD' : breadthPct > 40 ? 'NARROW' : 'VERY NARROW',
    implication: breadthPct < 40
      ? 'Narrow leadership — fragile rally. Favour quality over beta.'
      : breadthPct > 70
        ? 'Broad participation — healthy bull. Maintain equity allocation.'
        : 'Mixed breadth — selective positioning required.',
  };
}
