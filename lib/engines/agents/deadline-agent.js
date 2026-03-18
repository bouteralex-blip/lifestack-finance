// =========================================================================
// LIFESTACK OS — DEADLINE AGENT
// Phase 4: Research & Decisioning
// Tracks all financial deadlines with urgency scoring and action prompts
// =========================================================================

const FINANCIAL_DEADLINES = [
  { name: 'ISA Deadline', month: 4, day: 5, category: 'tax', action: 'Deploy remaining ISA allowance', value: 'Tax-free growth' },
  { name: 'Self-Assessment Filing', month: 1, day: 31, category: 'tax', action: 'File self-assessment return', value: 'Avoid penalties' },
  { name: 'Self-Assessment Payment', month: 1, day: 31, category: 'tax', action: 'Pay self-assessment balance', value: 'Avoid interest' },
  { name: 'Payment on Account (2nd)', month: 7, day: 31, category: 'tax', action: 'Pay second payment on account', value: 'Avoid interest' },
  { name: 'CGT Reporting (Property)', month: 12, day: 31, category: 'tax', action: 'Report property disposals for CGT', value: 'Compliance' },
  { name: 'Pension Annual Allowance Review', month: 4, day: 5, category: 'pension', action: 'Review pension contributions vs annual allowance', value: 'Tax relief' },
  { name: 'Mortgage Renewal Review', month: 0, day: 0, category: 'debt', action: 'Review mortgage rate and switch if beneficial', value: 'Interest saving' },
  { name: 'Q1 Rebalance Review', month: 1, day: 15, category: 'portfolio', action: 'Quarterly allocation review', value: 'Risk management' },
  { name: 'Q2 Rebalance Review', month: 4, day: 15, category: 'portfolio', action: 'Quarterly allocation review', value: 'Risk management' },
  { name: 'Q3 Rebalance Review', month: 7, day: 15, category: 'portfolio', action: 'Quarterly allocation review', value: 'Risk management' },
  { name: 'Q4 Rebalance Review', month: 10, day: 15, category: 'portfolio', action: 'Quarterly allocation review', value: 'Risk management' },
];

/**
 * Compute all financial deadlines with urgency scoring
 * Returns structured deadline list with overdue and upcoming items
 */
export function computeDeadlines(portConfig, engineState) {
  if (!engineState) return null;

  const now = new Date();
  const deadlines = [];

  // Process standard deadlines
  FINANCIAL_DEADLINES.forEach(dl => {
    if (dl.month === 0 && dl.day === 0) {
      // Dynamic deadline (e.g., mortgage renewal) — skip if no data
      const mortgageDl = computeMortgageDeadline(engineState, portConfig, now);
      if (mortgageDl) deadlines.push(mortgageDl);
      return;
    }

    const daysUntil = computeDaysUntil(now, dl.month, dl.day);
    const urgency = computeUrgency(daysUntil, dl.category);

    deadlines.push({
      name: dl.name,
      date: formatDeadlineDate(now, dl.month, dl.day),
      daysUntil,
      urgency,
      action: enrichAction(dl, engineState),
      value: dl.value,
      category: dl.category,
    });
  });

  // Add engine-driven deadlines
  const engineDeadlines = computeEngineDeadlines(engineState, now);
  deadlines.push(...engineDeadlines);

  // Sort by days until
  deadlines.sort((a, b) => a.daysUntil - b.daysUntil);

  const overdue = deadlines.filter(d => d.daysUntil < 0);
  const upcoming = deadlines.filter(d => d.daysUntil >= 0 && d.daysUntil <= 30);

  const implication = overdue.length > 0
    ? `${overdue.length} overdue deadline(s) require immediate attention.`
    : upcoming.length > 0
      ? `${upcoming.length} deadline(s) within 30 days.`
      : 'No immediate deadline pressure.';

  return {
    deadlines,
    overdue,
    upcoming,
    implication,
    timestamp: now.toISOString(),
  };
}

/**
 * Compute days until a specific month/day, handling year rollover
 */
function computeDaysUntil(now, month, day) {
  let target = new Date(now.getFullYear(), month - 1, day);
  // If date has passed this year, use next year
  if (target < now) {
    // But check if it's within 30 days past — show as overdue
    const daysPast = Math.ceil((now - target) / (1000 * 60 * 60 * 24));
    if (daysPast <= 30) return -daysPast;
    target = new Date(now.getFullYear() + 1, month - 1, day);
  }
  return Math.ceil((target - now) / (1000 * 60 * 60 * 24));
}

/**
 * Compute urgency level based on days until deadline
 */
function computeUrgency(daysUntil, category) {
  if (daysUntil < 0) return 'Overdue';
  if (daysUntil <= 7) return 'Critical';
  if (daysUntil <= 14) return 'Urgent';
  if (daysUntil <= 30) return 'Warning';
  if (daysUntil <= 60) return 'Approaching';
  return 'Normal';
}

/**
 * Format deadline date for display
 */
function formatDeadlineDate(now, month, day) {
  let target = new Date(now.getFullYear(), month - 1, day);
  if (target < now) {
    const daysPast = Math.ceil((now - target) / (1000 * 60 * 60 * 24));
    if (daysPast > 30) {
      target = new Date(now.getFullYear() + 1, month - 1, day);
    }
  }
  return target.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

/**
 * Enrich action text with engine data
 */
function enrichAction(dl, eng) {
  if (dl.name === 'ISA Deadline' && eng.isaPensionRouting?.isaHeadroom?.remaining > 0) {
    return `Deploy £${eng.isaPensionRouting.isaHeadroom.remaining.toLocaleString()} remaining ISA allowance`;
  }
  if (dl.name === 'Pension Annual Allowance Review' && eng.isaPensionRouting?.salarySacrificeValue) {
    return `Review pension contributions. Salary sacrifice could save £${Math.round(eng.isaPensionRouting.salarySacrificeValue.totalSaving || 0).toLocaleString()}/yr`;
  }
  return dl.action;
}

/**
 * Compute mortgage renewal deadline from engine state
 */
function computeMortgageDeadline(eng, portConfig, now) {
  // Look for mortgage data in debt engine
  if (!eng.debtPriority?.actions) return null;

  const mortgage = eng.debtPriority.actions.find(a =>
    (a.name || '').toLowerCase().includes('mortgage')
  );
  if (!mortgage) return null;

  // Assume 6-month review window if no explicit date
  return {
    name: 'Mortgage Rate Review',
    date: 'Review periodically',
    daysUntil: 90,
    urgency: 'Normal',
    action: `Current mortgage: ${mortgage.apr || 0}% APR on £${(mortgage.balance || 0).toLocaleString()}. Review fixed-rate options.`,
    value: 'Potential interest saving',
    category: 'debt',
  };
}

/**
 * Compute additional deadlines from engine state
 */
function computeEngineDeadlines(eng, now) {
  const deadlines = [];

  // Urgent rebalance as a deadline
  if (eng.driftMonitor?.urgency === 'Urgent') {
    deadlines.push({
      name: 'Rebalance Overdue',
      date: now.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
      daysUntil: 0,
      urgency: 'Critical',
      action: `Max drift ${eng.driftMonitor.maxDrift?.toFixed(1)}% — execute rebalance`,
      value: 'Risk management',
      category: 'portfolio',
    });
  }

  // ISA urgency flags from engine
  if (eng.isaPensionRouting?.urgencyFlags?.length > 0) {
    eng.isaPensionRouting.urgencyFlags.forEach(f => {
      if (f.daysLeft != null && f.daysLeft <= 60) {
        deadlines.push({
          name: f.item || 'Tax Planning Item',
          date: `${f.daysLeft} days`,
          daysUntil: f.daysLeft,
          urgency: f.daysLeft <= 7 ? 'Critical' : f.daysLeft <= 14 ? 'Urgent' : 'Warning',
          action: f.action || 'Review and act',
          value: 'Tax optimisation',
          category: 'tax',
        });
      }
    });
  }

  return deadlines;
}
