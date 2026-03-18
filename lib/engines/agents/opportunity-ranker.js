// =========================================================================
// LIFESTACK OS — OPPORTUNITY RADAR RANKER
// Phase 4: Research & Decisioning
// Re-ranks all candidate ideas by expected value, feasibility, time-sensitivity,
// and alignment with current engine states
// =========================================================================

/**
 * Score an opportunity against current engine and market states
 * Returns enriched opportunity with composite score and ranking rationale
 */
function scoreOpportunity(opp, engineState, marketState) {
  let score = 0;
  const rationale = [];

  // Base conviction score (from portfolio analysis, 1-10)
  score += (opp.c || 5) * 8; // max 80

  // Timing score (from portfolio analysis, 1-10)
  score += (opp.tm || 5) * 5; // max 50

  // Value score (annual value in £)
  const val = opp.val || 0;
  score += Math.min(30, val / 200); // max 30 at £6000+

  // Engine alignment bonuses
  if (engineState) {
    // ISA deadline urgency bonus
    if (opp.w && opp.w.includes('ISA') && engineState.isaPensionRouting?.daysUntilTaxYearEnd <= 30) {
      score += 25;
      rationale.push('ISA deadline <30 days — urgency bonus');
    }

    // Debt paydown alignment
    if (opp.t && opp.t.toLowerCase().includes('debt') && engineState.debtPriority?.highestAPR > 10) {
      score += 20;
      rationale.push(`High-APR debt outstanding (${engineState.debtPriority.highestAPR}%)`);
    }

    // Wrapper optimisation alignment
    if (opp.t && (opp.t.includes('Wrapper') || opp.t.includes('Bed & ISA'))) {
      const giaExposure = engineState.wrapperExposure?.efficiency?.giaExposurePct || 0;
      if (giaExposure > 40) {
        score += 15;
        rationale.push(`GIA exposure ${giaExposure}% — wrapper optimisation high-value`);
      }
    }

    // Salary sacrifice alignment (taper zone)
    if (opp.t && opp.t.includes('Salary Sacrifice') && engineState.isaPensionRouting?.salarySacrificeValue?.inTaperZone) {
      score += 20;
      rationale.push('In £100-125k taper zone — 60% effective benefit');
    }

    // Concentration reduction bonus
    if (opp.t && (opp.t.includes('consolidate') || opp.t.includes('Consolidate'))) {
      if (engineState.concentration?.clutter?.count > 10) {
        score += 10;
        rationale.push(`${engineState.concentration.clutter.count} clutter positions to consolidate`);
      }
    }
  }

  // Market alignment bonuses
  if (marketState) {
    // Crypto accumulation in capitulation/accumulation phase
    if (opp.t && opp.t.includes('BTC') && marketState.btcCycle?.bias >= 2) {
      score += 15;
      rationale.push(`BTC in ${marketState.btcCycle.phase} — accumulation supported`);
    }

    // Defensive positioning bonus in late cycle
    if (opp.t && (opp.t.includes('Gold') || opp.t.includes('Hedge'))) {
      if (marketState.regime?.riskPosture === 'Defensive' || marketState.regime?.riskPosture === 'Max Defensive') {
        score += 10;
        rationale.push(`${marketState.regime.regime} regime — defensive assets favoured`);
      }
    }

    // Value rotation alignment
    if (opp.t && opp.t.includes('Value') && marketState.sectorLeadership) {
      const valueLeading = marketState.sectorLeadership.leaders?.some(l => l.includes('Value'));
      if (valueLeading) {
        score += 10;
        rationale.push('Value factor currently leading — momentum alignment');
      }
    }

    // Credit stress warning for HY
    if (opp.t && (opp.t.includes('Credit') || opp.t.includes('Bond'))) {
      if (marketState.creditStress?.compositeScore > 50) {
        score -= 15;
        rationale.push(`Credit stress elevated (${marketState.creditStress.compositeScore}/100) — avoid`);
      }
    }
  }

  return { score: Math.max(0, +score.toFixed(1)), rationale };
}

/**
 * Classify opportunity into action tier based on composite score
 */
function classifyTier(score) {
  if (score >= 140) return { tier: 'EXECUTE NOW', color: '#22c55e', priority: 1 };
  if (score >= 100) return { tier: 'HIGH PRIORITY', color: '#06b6d4', priority: 2 };
  if (score >= 70) return { tier: 'MONITOR', color: '#f59e0b', priority: 3 };
  return { tier: 'BACKLOG', color: '#94a3b8', priority: 4 };
}

/**
 * Rank all opportunities with engine and market context
 */
export function rankOpportunities(opportunities, engineState, marketState) {
  if (!opportunities?.length) return { ranked: [], summary: null };

  const ranked = opportunities.map(opp => {
    const { score, rationale } = scoreOpportunity(opp, engineState, marketState);
    const tierInfo = classifyTier(score);

    return {
      ...opp,
      compositeScore: score,
      tier: tierInfo.tier,
      tierColor: tierInfo.color,
      tierPriority: tierInfo.priority,
      rationale,
      annualValue: opp.val || 0,
    };
  }).sort((a, b) => b.compositeScore - a.compositeScore);

  const executeNow = ranked.filter(r => r.tier === 'EXECUTE NOW');
  const highPriority = ranked.filter(r => r.tier === 'HIGH PRIORITY');
  const totalEV = ranked.reduce((s, r) => s + r.annualValue, 0);

  return {
    ranked,
    summary: {
      totalOpportunities: ranked.length,
      executeNow: executeNow.length,
      highPriority: highPriority.length,
      totalAnnualEV: totalEV,
      topAction: ranked[0]?.t || 'None',
      topScore: ranked[0]?.compositeScore || 0,
    },
  };
}
