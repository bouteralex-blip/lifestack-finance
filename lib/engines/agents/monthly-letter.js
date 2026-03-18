// =========================================================================
// LIFESTACK OS — MONTHLY LETTER GENERATOR
// Phase 4: Research & Decisioning
// Investor-style monthly portfolio letter with performance, narrative,
// and forward outlook
// =========================================================================

/**
 * Generate an investor-style monthly portfolio letter
 * Structured narrative combining performance, market context, and outlook
 */
export function generateMonthlyLetter(engineState, marketState, portConfig, monthlyReturns) {
  if (!engineState) return null;

  const now = new Date();
  const month = now.toLocaleDateString('en-GB', { month: 'long' });
  const year = now.getFullYear();

  // 1. Performance section
  const performance = computePerformance(monthlyReturns);

  // 2. Narrative
  const narrative = buildLetterNarrative(performance, marketState, engineState);

  // 3. Market context
  const marketContext = buildMarketContext(marketState);

  // 4. Portfolio changes
  const portfolioChanges = buildPortfolioChanges(engineState);

  // 5. Outlook
  const outlook = buildLetterOutlook(marketState, engineState);

  // 6. Risks
  const risks = buildLetterRisks(marketState, engineState);

  // 7. Top holdings
  const topHoldings = buildTopHoldings(engineState, portConfig);

  return {
    month,
    year,
    title: `Monthly Portfolio Letter — ${month} ${year}`,
    date: now.toISOString().split('T')[0],
    performance,
    narrative,
    marketContext,
    portfolioChanges,
    outlook,
    risks,
    topHoldings,
  };
}

/**
 * Compute performance metrics
 */
function computePerformance(monthlyReturns) {
  if (!monthlyReturns) {
    return { return: 0, benchmark: 0, alpha: 0, ytd: 0, note: 'No return data available' };
  }

  const ret = monthlyReturns.portfolioReturn || monthlyReturns.return || 0;
  const bench = monthlyReturns.benchmarkReturn || monthlyReturns.benchmark || 0;
  const alpha = +(ret - bench).toFixed(2);
  const ytd = monthlyReturns.ytd || monthlyReturns.ytdReturn || 0;

  let note = '';
  if (alpha > 1) note = 'Strong outperformance versus benchmark.';
  else if (alpha > 0) note = 'Slight outperformance versus benchmark.';
  else if (alpha > -1) note = 'Slight underperformance versus benchmark.';
  else note = 'Underperformance versus benchmark — review attribution.';

  return {
    return: +ret.toFixed(2),
    benchmark: +bench.toFixed(2),
    alpha,
    ytd: +ytd.toFixed(2),
    note,
  };
}

/**
 * Build the letter narrative
 */
function buildLetterNarrative(perf, mkt, eng) {
  const lines = [];

  // Performance opening
  if (perf.return > 0) {
    lines.push(`The portfolio returned +${perf.return}% this month, ${perf.alpha >= 0 ? 'outperforming' : 'underperforming'} the benchmark by ${Math.abs(perf.alpha).toFixed(2)}%.`);
  } else if (perf.return < 0) {
    lines.push(`The portfolio declined ${perf.return}% this month. ${perf.alpha >= 0 ? 'This was better than the benchmark decline of ' + perf.benchmark + '%.' : 'The benchmark declined ' + perf.benchmark + '%.'}`);
  } else {
    lines.push('The portfolio was flat this month.');
  }

  // Market backdrop
  const regime = mkt?.regime?.regime || '';
  if (regime) {
    lines.push(`Markets operated in a ${regime} regime with stress at ${mkt.stress?.compositeLevel || 'normal'} levels.`);
  }

  // Portfolio structure
  const drift = eng?.driftMonitor?.maxDrift || 0;
  if (drift > 3) {
    lines.push(`Portfolio drift reached ${drift.toFixed(1)}%, and a rebalance review is warranted.`);
  } else {
    lines.push('Portfolio allocation remains within target bands.');
  }

  // Key actions taken
  if (eng?.rebalanceProposal?.status === 'Action Recommended') {
    lines.push('A rebalance has been proposed and awaits execution.');
  }

  return lines.join(' ');
}

/**
 * Build market context section
 */
function buildMarketContext(mkt) {
  if (!mkt) return 'Market data unavailable for this period.';

  const lines = [];

  lines.push(`Regime: ${mkt.regime?.regime || 'Unknown'} (confidence: ${mkt.regime?.confidence || 0}%).`);
  lines.push(`Risk posture: ${mkt.regime?.riskPosture || 'Unknown'}.`);
  lines.push(`Cross-asset stress: ${mkt.stress?.compositeScore || 0}/100 (${mkt.stress?.compositeLevel || 'Unknown'}).`);

  if (mkt.yieldCurve?.shape) {
    lines.push(`Yield curve: ${mkt.yieldCurve.shape}.`);
  }
  if (mkt.creditStress?.compositeLevel) {
    lines.push(`Credit conditions: ${mkt.creditStress.compositeLevel}.`);
  }
  if (mkt.btcCycle?.phase) {
    lines.push(`Bitcoin cycle: ${mkt.btcCycle.phase}.`);
  }

  return lines.join(' ');
}

/**
 * Build portfolio changes summary
 */
function buildPortfolioChanges(eng) {
  const changes = [];

  if (eng?.rebalanceProposal?.trades?.length > 0) {
    eng.rebalanceProposal.trades.forEach(t => {
      changes.push({
        action: t.action || (t.amount > 0 ? 'Buy' : 'Sell'),
        ticker: t.ticker || t.sleeve || 'Unknown',
        detail: t.rationale || `${t.action || 'Trade'} ${t.ticker || t.sleeve}`,
      });
    });
  }

  if (eng?.driftMonitor?.urgency === 'Urgent') {
    changes.push({
      action: 'Pending',
      ticker: 'Rebalance',
      detail: `Rebalance urgent — max drift ${eng.driftMonitor.maxDrift?.toFixed(1)}%`,
    });
  }

  if (eng?.isaPensionRouting?.isaHeadroom?.remaining > 0 && eng.isaPensionRouting.daysUntilTaxYearEnd <= 60) {
    changes.push({
      action: 'Pending',
      ticker: 'ISA',
      detail: `£${eng.isaPensionRouting.isaHeadroom.remaining.toLocaleString()} ISA headroom — ${eng.isaPensionRouting.daysUntilTaxYearEnd} days remaining`,
    });
  }

  return changes;
}

/**
 * Build forward outlook
 */
function buildLetterOutlook(mkt, eng) {
  const lines = [];
  const regime = mkt?.regime?.regime || 'Unknown';
  const riskPosture = mkt?.regime?.riskPosture || 'Neutral';

  lines.push(`Forward outlook is shaped by the current ${regime} regime and ${riskPosture} risk posture.`);

  if (mkt?.stress?.compositeScore > 50) {
    lines.push('Elevated stress suggests caution — prioritise capital preservation over return generation.');
  } else {
    lines.push('Benign stress conditions support maintaining current allocation with selective opportunism.');
  }

  if (eng?.isaPensionRouting?.daysUntilTaxYearEnd <= 90) {
    lines.push(`Tax year end in ${eng.isaPensionRouting.daysUntilTaxYearEnd} days — ISA deployment should be prioritised.`);
  }

  return lines.join(' ');
}

/**
 * Build risk section
 */
function buildLetterRisks(mkt, eng) {
  const risks = [];

  if (mkt?.stress?.compositeScore > 60) {
    risks.push({ risk: 'Elevated cross-asset stress', level: 'high', detail: `Score: ${mkt.stress.compositeScore}/100` });
  }
  if (mkt?.creditStress?.compositeScore > 40) {
    risks.push({ risk: 'Credit market deterioration', level: 'medium', detail: `Score: ${mkt.creditStress.compositeScore}/100` });
  }
  if (eng?.concentration?.hhi > 2000) {
    risks.push({ risk: 'Portfolio concentration', level: 'medium', detail: `HHI: ${eng.concentration.hhi}` });
  }
  if (eng?.driftMonitor?.maxDrift > 5) {
    risks.push({ risk: 'Allocation drift', level: 'high', detail: `Max drift: ${eng.driftMonitor.maxDrift.toFixed(1)}%` });
  }
  if (eng?.currencyExposure?.risks?.length > 0) {
    risks.push({ risk: 'Currency exposure', level: 'medium', detail: eng.currencyExposure.risks[0].alert || 'FX risk detected' });
  }
  if (mkt?.regime?.regimeChanged) {
    risks.push({ risk: 'Regime transition', level: 'high', detail: `Shifted to ${mkt.regime.regime}` });
  }

  return risks;
}

/**
 * Build top holdings list
 */
function buildTopHoldings(eng, portConfig) {
  if (!eng?.concentration?.topHoldings && !portConfig?.holdings) return [];

  const holdings = eng.concentration?.topHoldings || portConfig?.holdings || [];

  return holdings.slice(0, 10).map(h => ({
    name: h.name || h.ticker || h.asset || 'Unknown',
    weight: h.weight || h.pct || h.allocation || 0,
    sleeve: h.sleeve || h.wrapper || 'Unknown',
  }));
}
