// =========================================================================
// LIFESTACK OS — REPORT EXPORTER
// Phase 4: Research & Decisioning
// Exports full portfolio report as structured markdown
// Sections: Executive Summary, Market Context, Portfolio Analysis,
// Risk Assessment, Action Items, Appendix
// =========================================================================

/**
 * Generate a full portfolio report as markdown
 * Compiles all engine and agent outputs into a structured document
 */
export function generateMarkdownReport(engineState, marketState, agentState, portConfig) {
  if (!engineState) return null;

  const now = new Date();
  const dateStr = now.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

  const sections = [];

  // 1. Executive Summary
  const execSummary = buildExecutiveSummary(engineState, marketState, agentState);
  sections.push({ title: 'Executive Summary', content: execSummary });

  // 2. Market Context
  const marketContext = buildMarketContextSection(marketState);
  sections.push({ title: 'Market Context', content: marketContext });

  // 3. Portfolio Analysis
  const portfolioAnalysis = buildPortfolioAnalysis(engineState, portConfig);
  sections.push({ title: 'Portfolio Analysis', content: portfolioAnalysis });

  // 4. Risk Assessment
  const riskAssessment = buildRiskAssessment(engineState, marketState);
  sections.push({ title: 'Risk Assessment', content: riskAssessment });

  // 5. Action Items
  const actionItems = buildActionItems(engineState, agentState);
  sections.push({ title: 'Action Items', content: actionItems });

  // 6. Appendix
  const appendix = buildAppendix(engineState, marketState);
  sections.push({ title: 'Appendix', content: appendix });

  // Compile full markdown
  const markdown = compileMarkdown(dateStr, sections);
  const wordCount = markdown.split(/\s+/).length;

  return {
    markdown,
    sections,
    wordCount,
    generatedAt: now.toISOString(),
  };
}

/**
 * Build executive summary section
 */
function buildExecutiveSummary(eng, mkt, agent) {
  const lines = [];

  lines.push('### Overview');
  lines.push('');

  // Net worth
  const drift = eng.driftMonitor?.maxDrift || 0;
  const hhi = eng.concentration?.hhi || 0;
  const regime = mkt?.regime?.regime || 'Unknown';
  const stress = mkt?.stress?.compositeScore || 0;

  lines.push(`- **Allocation Drift**: ${drift.toFixed(1)}% (${eng.driftMonitor?.urgency || 'Unknown'} urgency)`);
  lines.push(`- **Concentration (HHI)**: ${hhi} (${eng.concentration?.diversificationRating || 'Unknown'})`);
  lines.push(`- **Market Regime**: ${regime} (${mkt?.regime?.riskPosture || 'Unknown'} posture)`);
  lines.push(`- **Stress Score**: ${stress}/100 (${mkt?.stress?.compositeLevel || 'Unknown'})`);
  lines.push('');

  // Critical alerts
  const criticals = agent?.triggerAlerts?.summary?.critical || 0;
  if (criticals > 0) {
    lines.push(`**${criticals} critical alert(s) active.** Review immediately.`);
  } else {
    lines.push('No critical alerts. Portfolio operating within parameters.');
  }

  return lines.join('\n');
}

/**
 * Build market context section
 */
function buildMarketContextSection(mkt) {
  const lines = [];

  if (!mkt) {
    lines.push('Market data unavailable.');
    return lines.join('\n');
  }

  lines.push('### Regime & Conditions');
  lines.push('');
  lines.push(`| Metric | Value |`);
  lines.push(`|--------|-------|`);
  lines.push(`| Regime | ${mkt.regime?.regime || 'Unknown'} |`);
  lines.push(`| Confidence | ${mkt.regime?.confidence || 0}% |`);
  lines.push(`| Risk Posture | ${mkt.regime?.riskPosture || 'Unknown'} |`);
  lines.push(`| Stress Score | ${mkt.stress?.compositeScore || 0}/100 |`);
  lines.push(`| Stress Level | ${mkt.stress?.compositeLevel || 'Unknown'} |`);
  lines.push(`| Yield Curve | ${mkt.yieldCurve?.shape || 'Unknown'} |`);
  lines.push(`| Credit Stress | ${mkt.creditStress?.compositeLevel || 'Unknown'} |`);
  lines.push(`| BTC Phase | ${mkt.btcCycle?.phase || 'Unknown'} |`);
  lines.push(`| Sector Breadth | ${mkt.sectorLeadership?.marketBreadth || 'Unknown'} |`);
  lines.push('');

  if (mkt.stress?.topStressors?.length > 0) {
    lines.push('### Top Stressors');
    lines.push('');
    mkt.stress.topStressors.slice(0, 5).forEach(s => {
      const desc = typeof s === 'string' ? s : s.description || s.metric || 'Unknown';
      lines.push(`- ${desc}`);
    });
  }

  return lines.join('\n');
}

/**
 * Build portfolio analysis section
 */
function buildPortfolioAnalysis(eng, portConfig) {
  const lines = [];

  // Drift analysis
  lines.push('### Allocation Drift');
  lines.push('');
  if (eng.driftMonitor) {
    lines.push(`Max drift: **${eng.driftMonitor.maxDrift?.toFixed(1)}%**. Urgency: **${eng.driftMonitor.urgency}**.`);
    lines.push('');

    if (eng.driftMonitor.overweightSleeves?.length > 0) {
      lines.push('**Overweight sleeves:**');
      eng.driftMonitor.overweightSleeves.forEach(s => {
        lines.push(`- ${s.sleeve || s}: +${(s.drift || 0).toFixed(1)}%`);
      });
      lines.push('');
    }

    if (eng.driftMonitor.underweightSleeves?.length > 0) {
      lines.push('**Underweight sleeves:**');
      eng.driftMonitor.underweightSleeves.forEach(s => {
        lines.push(`- ${s.sleeve || s}: ${(s.drift || 0).toFixed(1)}%`);
      });
      lines.push('');
    }
  }

  // Concentration
  lines.push('### Concentration');
  lines.push('');
  if (eng.concentration) {
    lines.push(`- HHI: ${eng.concentration.hhi}`);
    lines.push(`- Effective positions: ${eng.concentration.effectivePositions?.toFixed(0) || '?'}`);
    lines.push(`- Rating: ${eng.concentration.diversificationRating}`);
    if (eng.concentration.violations?.length > 0) {
      lines.push(`- **${eng.concentration.violations.length} violation(s)**`);
    }
    lines.push('');
  }

  // Wrapper efficiency
  lines.push('### Wrapper Efficiency');
  lines.push('');
  if (eng.wrapperExposure?.efficiency) {
    lines.push(`- Score: ${eng.wrapperExposure.efficiency.score?.toFixed(1)}/10`);
    lines.push(`- GIA exposure: ${eng.wrapperExposure.efficiency.giaExposurePct || 0}%`);
    if (eng.wrapperExposure.reallocationOpportunities?.length > 0) {
      lines.push(`- ${eng.wrapperExposure.reallocationOpportunities.length} Bed & ISA candidate(s)`);
    }
    lines.push('');
  }

  // Tax position
  lines.push('### Tax Position');
  lines.push('');
  if (eng.isaPensionRouting) {
    lines.push(`- ISA remaining: £${(eng.isaPensionRouting.isaHeadroom?.remaining || 0).toLocaleString()}`);
    lines.push(`- Days until tax year end: ${eng.isaPensionRouting.daysUntilTaxYearEnd || '?'}`);
    if (eng.isaPensionRouting.salarySacrificeValue?.totalSaving > 0) {
      lines.push(`- Salary sacrifice value: £${Math.round(eng.isaPensionRouting.salarySacrificeValue.totalSaving).toLocaleString()}/yr`);
    }
  }

  return lines.join('\n');
}

/**
 * Build risk assessment section
 */
function buildRiskAssessment(eng, mkt) {
  const lines = [];

  lines.push('### Risk Summary');
  lines.push('');

  const risks = [];

  if (eng.driftMonitor?.maxDrift > 5) {
    risks.push({ risk: 'Allocation Drift', severity: 'High', detail: `${eng.driftMonitor.maxDrift.toFixed(1)}% max drift` });
  }
  if (eng.concentration?.hhi > 2500) {
    risks.push({ risk: 'Concentration', severity: 'High', detail: `HHI ${eng.concentration.hhi}` });
  }
  if (eng.debtPriority?.highestAPR > 15) {
    risks.push({ risk: 'High-APR Debt', severity: 'High', detail: `${eng.debtPriority.highestAPR}% APR` });
  }
  if (mkt?.stress?.compositeScore > 60) {
    risks.push({ risk: 'Market Stress', severity: 'High', detail: `${mkt.stress.compositeScore}/100` });
  }
  if (mkt?.creditStress?.compositeScore > 50) {
    risks.push({ risk: 'Credit Stress', severity: 'Medium', detail: `${mkt.creditStress.compositeScore}/100` });
  }
  if (eng.currencyExposure?.risks?.length > 0) {
    risks.push({ risk: 'Currency', severity: 'Medium', detail: `${eng.currencyExposure.risks.length} FX risk(s)` });
  }

  if (risks.length === 0) {
    lines.push('No significant risks identified. Portfolio within all risk parameters.');
  } else {
    lines.push('| Risk | Severity | Detail |');
    lines.push('|------|----------|--------|');
    risks.forEach(r => {
      lines.push(`| ${r.risk} | ${r.severity} | ${r.detail} |`);
    });
  }

  // Debt section
  if (eng.debtPriority?.totalDebt > 0) {
    lines.push('');
    lines.push('### Debt Position');
    lines.push('');
    lines.push(`- Total debt: £${eng.debtPriority.totalDebt.toLocaleString()}`);
    lines.push(`- Highest APR: ${eng.debtPriority.highestAPR}%`);
    lines.push(`- Annual interest: £${(eng.debtPriority.totalAnnualInterest || 0).toLocaleString()}`);
  }

  return lines.join('\n');
}

/**
 * Build action items section
 */
function buildActionItems(eng, agent) {
  const lines = [];

  const actions = [];

  // Debt paydown
  if (eng.debtPriority?.highestAPR > 10) {
    actions.push({ action: 'Pay down high-APR debt', priority: 'High', detail: `${eng.debtPriority.highestAPR}% APR — guaranteed return` });
  }

  // ISA funding
  if (eng.isaPensionRouting?.isaHeadroom?.remaining > 0 && eng.isaPensionRouting.daysUntilTaxYearEnd <= 90) {
    actions.push({ action: 'Fund ISA', priority: eng.isaPensionRouting.daysUntilTaxYearEnd <= 30 ? 'Critical' : 'High', detail: `£${eng.isaPensionRouting.isaHeadroom.remaining.toLocaleString()} — ${eng.isaPensionRouting.daysUntilTaxYearEnd}d left` });
  }

  // Rebalance
  if (eng.rebalanceProposal?.trades?.length > 0) {
    actions.push({ action: 'Execute rebalance', priority: eng.driftMonitor?.maxDrift > 5 ? 'High' : 'Medium', detail: `${eng.rebalanceProposal.trades.length} trades proposed` });
  }

  // Concentration fixes
  if (eng.concentration?.violations?.length > 0) {
    actions.push({ action: 'Trim concentration violations', priority: 'Medium', detail: `${eng.concentration.violations.length} violation(s)` });
  }

  // Wrapper optimisation
  if (eng.wrapperExposure?.reallocationOpportunities?.length > 0) {
    actions.push({ action: 'Bed & ISA candidates', priority: 'Low', detail: `${eng.wrapperExposure.reallocationOpportunities.length} positions to move` });
  }

  if (actions.length === 0) {
    lines.push('No action items. Portfolio on autopilot.');
  } else {
    lines.push('| # | Action | Priority | Detail |');
    lines.push('|---|--------|----------|--------|');
    actions.forEach((a, i) => {
      lines.push(`| ${i + 1} | ${a.action} | ${a.priority} | ${a.detail} |`);
    });
  }

  return lines.join('\n');
}

/**
 * Build appendix section
 */
function buildAppendix(eng, mkt) {
  const lines = [];

  lines.push('### Engine Versions');
  lines.push('');
  lines.push('All engine outputs generated from latest available data.');
  lines.push('');

  lines.push('### Data Sources');
  lines.push('');
  lines.push('- Portfolio holdings: Supabase / manual input');
  lines.push('- Market data: API feeds');
  lines.push('- Engine computations: LifeStack OS pure-function engines');
  lines.push('');

  lines.push('### Disclaimers');
  lines.push('');
  lines.push('This report is generated automatically for personal portfolio management. It does not constitute financial advice. All figures are estimates based on available data and should be verified before taking action.');

  return lines.join('\n');
}

/**
 * Compile all sections into a single markdown document
 */
function compileMarkdown(dateStr, sections) {
  const lines = [];

  lines.push('# LifeStack Portfolio Report');
  lines.push('');
  lines.push(`**Generated:** ${dateStr}`);
  lines.push('');
  lines.push('---');
  lines.push('');

  sections.forEach(section => {
    lines.push(`## ${section.title}`);
    lines.push('');
    lines.push(section.content);
    lines.push('');
    lines.push('---');
    lines.push('');
  });

  return lines.join('\n');
}
