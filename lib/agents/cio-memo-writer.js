// lib/agents/cio-memo-writer.js
// CIO Memo Writer Agent — weekly intelligence memo with conviction scores

function computeCIOMemo(ENGINE, MKTENG, AGENT, rawData) {
  const regime = MKTENG?.regime || {};
  const whatChanged = AGENT?.whatChanged || {};
  const marketChanges = AGENT?.marketChanges || {};
  const actionQueue = AGENT?.actionQueue || {};
  const drawdown = ENGINE?.drawdown || {};
  const riskBudget = ENGINE?.riskBudget || {};
  const drift = ENGINE?.driftMonitor || {};
  const concentration = ENGINE?.concentration || {};

  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10);
  const weekNum = Math.ceil(((now - new Date(now.getFullYear(), 0, 1)) / 86400000 + 1) / 7);

  // --- Executive Summary ---
  const summaryParts = [];

  const regimeLabel = regime.label || 'unknown';
  const regimeConf = regime.confidence || 0;
  summaryParts.push(`Market regime: ${regimeLabel} (${(regimeConf * 100).toFixed(0)}% confidence).`);

  const portfolioChanges = whatChanged.changes || whatChanged.items || [];
  if (portfolioChanges.length > 0) {
    summaryParts.push(`${portfolioChanges.length} portfolio change(s) this week.`);
  } else {
    summaryParts.push('No material portfolio changes.');
  }

  const mktChanges = marketChanges.changes || marketChanges.items || [];
  if (mktChanges.length > 0) {
    summaryParts.push(`${mktChanges.length} notable market development(s).`);
  }

  const riskUtil = riskBudget.utilisation || riskBudget.utilization || 0;
  if (riskUtil > 1) {
    summaryParts.push(`Risk budget exceeded at ${(riskUtil * 100).toFixed(0)}%.`);
  }

  const executiveSummary = summaryParts.join(' ');

  // --- Sections ---
  const sections = [];

  // Section 1: Market Regime & Outlook
  sections.push({
    title: 'Market Regime & Outlook',
    conviction: regime.conviction || (regimeConf > 0.7 ? 'high' : regimeConf > 0.4 ? 'medium' : 'low'),
    content: [
      `Current regime: ${regimeLabel}`,
      regime.summary || regime.description || `Confidence at ${(regimeConf * 100).toFixed(0)}%`,
      regime.outlook || '',
    ].filter(Boolean),
  });

  // Section 2: Portfolio Health
  const driftUrgency = drift.urgency || drift.rebalanceUrgency || 'low';
  const hhi = concentration.hhi || 0;
  const ddPct = drawdown.currentDrawdown || drawdown.drawdownPct || 0;
  sections.push({
    title: 'Portfolio Health',
    conviction: 'factual',
    content: [
      `Drift status: ${driftUrgency}`,
      `Concentration (HHI): ${(hhi * 100).toFixed(1)}%`,
      `Drawdown: ${(Math.abs(ddPct) * 100).toFixed(1)}%`,
      `Risk budget utilisation: ${(riskUtil * 100).toFixed(0)}%`,
    ],
  });

  // Section 3: What Changed
  if (portfolioChanges.length > 0 || mktChanges.length > 0) {
    const changeItems = [];
    for (const c of portfolioChanges.slice(0, 5)) {
      changeItems.push(typeof c === 'string' ? c : (c.summary || c.description || JSON.stringify(c)));
    }
    for (const c of mktChanges.slice(0, 5)) {
      changeItems.push(typeof c === 'string' ? c : (c.summary || c.description || JSON.stringify(c)));
    }
    sections.push({
      title: 'What Changed This Week',
      conviction: 'factual',
      content: changeItems,
    });
  }

  // Section 4: Key Risks
  const crossAssetStress = MKTENG?.crossAssetStress || {};
  const creditStress = MKTENG?.creditStress || {};
  const correlationDrift = MKTENG?.correlationDrift || {};
  const riskItems = [];
  const stressLevel = crossAssetStress.level || crossAssetStress.score || 'normal';
  riskItems.push(`Cross-asset stress: ${stressLevel}`);
  const creditLevel = creditStress.level || creditStress.score || 'normal';
  riskItems.push(`Credit stress: ${creditLevel}`);
  const corrDrifts = correlationDrift.pairs || correlationDrift.drifts || [];
  if (corrDrifts.length > 0) {
    riskItems.push(`${corrDrifts.length} correlation shift(s) detected`);
  }
  sections.push({
    title: 'Key Risks',
    conviction: typeof stressLevel === 'number' && stressLevel > 70 ? 'high' : 'medium',
    content: riskItems,
  });

  // Section 5: Opportunities
  const opps = AGENT?.opportunityRanker || {};
  const oppList = opps.ranked || opps.opportunities || [];
  if (oppList.length > 0) {
    sections.push({
      title: 'Opportunities',
      conviction: 'medium',
      content: oppList.slice(0, 5).map(o =>
        typeof o === 'string' ? o : `${o.name || o.ticker || 'Unknown'}: ${o.rationale || o.reason || ''}`
      ),
    });
  }

  // --- Action Items ---
  const actionItems = [];
  const queueItems = actionQueue.items || actionQueue.actions || actionQueue.queue || [];
  for (const a of queueItems.slice(0, 5)) {
    actionItems.push({
      action: typeof a === 'string' ? a : (a.action || a.description || a.label || 'Review'),
      priority: typeof a === 'object' ? (a.priority || 'medium') : 'medium',
      deadline: typeof a === 'object' ? (a.deadline || null) : null,
    });
  }

  // Add ISA deadline action if relevant
  const isaPension = ENGINE?.isaPensionRouting || {};
  const isaActions = isaPension.actions || isaPension.recommendations || [];
  if (isaActions.length > 0) {
    actionItems.push({
      action: 'Review ISA/pension wrapper optimisation opportunities',
      priority: 'medium',
      deadline: 'April 5',
    });
  }

  // --- Watch List ---
  const watchList = [];

  // Watch regime changes
  if (regimeConf < 0.5) {
    watchList.push({ item: 'Regime uncertainty', reason: `Confidence only ${(regimeConf * 100).toFixed(0)}% — watch for regime shift`, timeframe: '1-2 weeks' });
  }

  // Watch drift
  if (driftUrgency === 'AMBER' || driftUrgency === 'medium') {
    watchList.push({ item: 'Portfolio drift', reason: 'Approaching rebalance threshold', timeframe: '1 week' });
  }

  // Watch earnings
  const earnings = MKTENG?.earningsRevision || {};
  if (earnings.upcoming || earnings.watchList) {
    const earningsItems = earnings.upcoming || earnings.watchList || [];
    if (earningsItems.length > 0) {
      watchList.push({ item: 'Earnings releases', reason: `${earningsItems.length} relevant earnings coming`, timeframe: 'This week' });
    }
  }

  // Watch central bank
  const centralBank = MKTENG?.centralBank || {};
  if (centralBank.nextMeeting || centralBank.upcoming) {
    watchList.push({ item: 'Central bank meeting', reason: centralBank.summary || 'Upcoming rate decision', timeframe: centralBank.nextMeeting || 'Soon' });
  }

  const title = `CIO Weekly Intelligence Memo — Week ${weekNum}`;

  return {
    memo: {
      title,
      date: dateStr,
      executiveSummary,
      sections,
      actionItems,
      watchList,
    },
  };
}

module.exports = { computeCIOMemo };
