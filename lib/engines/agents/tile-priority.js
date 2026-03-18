// =========================================================================
// LIFESTACK OS — TILE PRIORITY ENGINE
// Phase 4: Research & Decisioning
// Ranks dashboard tiles by current relevance, urgency, and user context
// =========================================================================

const DEFAULT_TILES = [
  { id: 'net-worth', label: 'Net Worth', baseWeight: 5 },
  { id: 'drift', label: 'Allocation Drift', baseWeight: 4 },
  { id: 'concentration', label: 'Concentration Risk', baseWeight: 4 },
  { id: 'isa-deadline', label: 'ISA Deadline', baseWeight: 3 },
  { id: 'debt', label: 'Debt Priority', baseWeight: 4 },
  { id: 'wrapper', label: 'Wrapper Efficiency', baseWeight: 3 },
  { id: 'market-regime', label: 'Market Regime', baseWeight: 4 },
  { id: 'stress', label: 'Market Stress', baseWeight: 4 },
  { id: 'btc-cycle', label: 'BTC Cycle', baseWeight: 3 },
  { id: 'rebalance', label: 'Rebalance Status', baseWeight: 3 },
  { id: 'alerts', label: 'Active Alerts', baseWeight: 5 },
  { id: 'opportunities', label: 'Opportunities', baseWeight: 3 },
  { id: 'currency', label: 'FX Exposure', baseWeight: 2 },
  { id: 'action-queue', label: 'Action Queue', baseWeight: 4 },
];

/**
 * Compute tile priorities for dashboard rendering
 * Tiles with active alerts or breached thresholds rank higher
 */
export function computeTilePriority(engineState, marketState, agentState) {
  if (!engineState) return null;

  const tiles = DEFAULT_TILES.map(tile => {
    const boost = computeTileBoost(tile.id, engineState, marketState, agentState);
    const priority = tile.baseWeight + boost.bonus;
    const urgency = boost.urgency;
    const reason = boost.reason;

    return {
      id: tile.id,
      label: tile.label,
      priority: Math.max(0, Math.min(10, priority)),
      reason,
      urgency,
    };
  });

  // Sort by priority descending
  tiles.sort((a, b) => b.priority - a.priority);

  // Identify suppressed tiles (very low priority)
  const suppressedTiles = tiles.filter(t => t.priority <= 1).map(t => t.id);
  const activeTiles = tiles.filter(t => t.priority > 1);

  return {
    tiles: activeTiles,
    topTile: activeTiles[0] || null,
    suppressedTiles,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Compute priority boost for a specific tile based on current state
 */
function computeTileBoost(tileId, eng, mkt, agent) {
  switch (tileId) {
    case 'drift':
      return boostDrift(eng);
    case 'concentration':
      return boostConcentration(eng);
    case 'isa-deadline':
      return boostISA(eng);
    case 'debt':
      return boostDebt(eng);
    case 'wrapper':
      return boostWrapper(eng);
    case 'market-regime':
      return boostRegime(mkt);
    case 'stress':
      return boostStress(mkt);
    case 'btc-cycle':
      return boostBTC(mkt);
    case 'rebalance':
      return boostRebalance(eng);
    case 'alerts':
      return boostAlerts(agent);
    case 'opportunities':
      return boostOpportunities(agent);
    case 'action-queue':
      return boostActionQueue(agent);
    case 'net-worth':
      return { bonus: 0, urgency: 'normal', reason: 'Always visible' };
    case 'currency':
      return boostCurrency(eng);
    default:
      return { bonus: 0, urgency: 'normal', reason: 'Default priority' };
  }
}

function boostDrift(eng) {
  const drift = eng.driftMonitor?.maxDrift || 0;
  if (drift > 5) return { bonus: 4, urgency: 'critical', reason: `Drift ${drift.toFixed(1)}% — rebalance urgent` };
  if (drift > 3) return { bonus: 2, urgency: 'warning', reason: `Drift ${drift.toFixed(1)}% — approaching threshold` };
  return { bonus: 0, urgency: 'normal', reason: 'Drift within range' };
}

function boostConcentration(eng) {
  const hhi = eng.concentration?.hhi || 0;
  const violations = eng.concentration?.violations?.length || 0;
  if (hhi > 2500 || violations > 0) return { bonus: 4, urgency: 'critical', reason: `HHI ${hhi}, ${violations} violation(s)` };
  if (hhi > 2000) return { bonus: 2, urgency: 'warning', reason: `HHI ${hhi} — elevated` };
  return { bonus: 0, urgency: 'normal', reason: 'Concentration acceptable' };
}

function boostISA(eng) {
  const days = eng.isaPensionRouting?.daysUntilTaxYearEnd;
  const remaining = eng.isaPensionRouting?.isaHeadroom?.remaining || 0;
  if (days != null && days <= 14 && remaining > 0) return { bonus: 5, urgency: 'critical', reason: `${days}d to ISA deadline — £${remaining.toLocaleString()} unused` };
  if (days != null && days <= 30 && remaining > 0) return { bonus: 3, urgency: 'warning', reason: `${days}d to ISA deadline` };
  if (remaining <= 0) return { bonus: -3, urgency: 'normal', reason: 'ISA fully funded — suppress' };
  return { bonus: 0, urgency: 'normal', reason: 'ISA deadline not imminent' };
}

function boostDebt(eng) {
  const apr = eng.debtPriority?.highestAPR || 0;
  if (apr > 15) return { bonus: 4, urgency: 'critical', reason: `${apr}% APR debt outstanding` };
  if (apr > 8) return { bonus: 2, urgency: 'warning', reason: `${apr}% APR debt` };
  if (apr <= 0) return { bonus: -2, urgency: 'normal', reason: 'No debt — suppress' };
  return { bonus: 0, urgency: 'normal', reason: 'Low-rate debt' };
}

function boostWrapper(eng) {
  const gia = eng.wrapperExposure?.efficiency?.giaExposurePct || 0;
  if (gia > 50) return { bonus: 2, urgency: 'warning', reason: `${gia}% GIA exposure` };
  return { bonus: 0, urgency: 'normal', reason: 'Wrapper efficiency acceptable' };
}

function boostRegime(mkt) {
  if (mkt?.regime?.regimeChanged) return { bonus: 4, urgency: 'critical', reason: `Regime shifted to ${mkt.regime.regime}` };
  return { bonus: 0, urgency: 'normal', reason: `${mkt?.regime?.regime || 'Unknown'} regime` };
}

function boostStress(mkt) {
  const score = mkt?.stress?.compositeScore || 0;
  if (score > 70) return { bonus: 4, urgency: 'critical', reason: `Stress ${score}/100 — elevated` };
  if (score > 50) return { bonus: 2, urgency: 'warning', reason: `Stress ${score}/100` };
  return { bonus: 0, urgency: 'normal', reason: 'Stress normal' };
}

function boostBTC(mkt) {
  if (mkt?.btcCycle?.bias >= 4) return { bonus: 3, urgency: 'warning', reason: `BTC ${mkt.btcCycle.phase} — strong accumulation signal` };
  if (mkt?.btcCycle?.phaseChanged) return { bonus: 2, urgency: 'warning', reason: `BTC phase changed to ${mkt.btcCycle.phase}` };
  return { bonus: 0, urgency: 'normal', reason: 'BTC cycle stable' };
}

function boostRebalance(eng) {
  if (eng.rebalanceProposal?.status === 'Action Recommended') return { bonus: 3, urgency: 'warning', reason: 'Rebalance recommended' };
  return { bonus: 0, urgency: 'normal', reason: 'No rebalance pending' };
}

function boostAlerts(agent) {
  const count = agent?.triggerAlerts?.summary?.critical || 0;
  if (count >= 2) return { bonus: 5, urgency: 'critical', reason: `${count} critical alerts` };
  if (count >= 1) return { bonus: 3, urgency: 'warning', reason: `${count} critical alert` };
  return { bonus: 0, urgency: 'normal', reason: 'No critical alerts' };
}

function boostOpportunities(agent) {
  const count = agent?.opportunityRanker?.summary?.executeNow || 0;
  if (count > 0) return { bonus: 2, urgency: 'warning', reason: `${count} execute-now opportunities` };
  return { bonus: 0, urgency: 'normal', reason: 'No immediate opportunities' };
}

function boostActionQueue(agent) {
  const immediate = agent?.actionQueue?.summary?.immediateActions || 0;
  if (immediate > 0) return { bonus: 3, urgency: 'warning', reason: `${immediate} immediate actions` };
  return { bonus: 0, urgency: 'normal', reason: 'No immediate actions' };
}

function boostCurrency(eng) {
  const risks = eng.currencyExposure?.risks?.length || 0;
  if (risks > 0) return { bonus: 2, urgency: 'warning', reason: `${risks} FX risk(s)` };
  return { bonus: -1, urgency: 'normal', reason: 'No FX risk' };
}
