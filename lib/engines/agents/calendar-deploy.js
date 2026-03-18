// =========================================================================
// LIFESTACK OS — CALENDAR DEPLOYMENT SCHEDULER
// Phase 4: Research & Decisioning
// Calendar-aware capital deployment scheduling with key financial dates
// =========================================================================

const KEY_DATES = [
  { name: 'ISA Deadline', month: 4, day: 5, type: 'tax' },
  { name: 'Pension Year-End', month: 4, day: 5, type: 'tax' },
  { name: 'Self-Assessment Deadline', month: 1, day: 31, type: 'tax' },
  { name: 'CGT Reporting Deadline', month: 12, day: 31, type: 'tax' },
  { name: 'Q1 Rebalance', month: 1, day: 15, type: 'rebalance' },
  { name: 'Q2 Rebalance', month: 4, day: 15, type: 'rebalance' },
  { name: 'Q3 Rebalance', month: 7, day: 15, type: 'rebalance' },
  { name: 'Q4 Rebalance', month: 10, day: 15, type: 'rebalance' },
];

/**
 * Compute calendar-aware capital deployment schedule
 * Ranks deployments by deadline urgency, expected value, and calendar proximity
 */
export function computeCalendarDeployment(portConfig, engineState) {
  if (!engineState) return null;

  const now = new Date();
  const deployments = [];

  // 1. ISA deployment
  const isaDeployment = computeISADeployment(engineState, now);
  if (isaDeployment) deployments.push(isaDeployment);

  // 2. Pension deployment
  const pensionDeployment = computePensionDeployment(engineState, portConfig, now);
  if (pensionDeployment) deployments.push(pensionDeployment);

  // 3. Debt paydown schedule
  const debtDeployments = computeDebtDeployments(engineState, now);
  deployments.push(...debtDeployments);

  // 4. Rebalance execution
  const rebalanceDeployment = computeRebalanceDeployment(engineState, now);
  if (rebalanceDeployment) deployments.push(rebalanceDeployment);

  // 5. Wrapper optimisation
  const wrapperDeployment = computeWrapperDeployment(engineState, now);
  if (wrapperDeployment) deployments.push(wrapperDeployment);

  // Sort by priority (lower = more urgent)
  deployments.sort((a, b) => a.priority - b.priority);

  // ISA deadline days
  const isaDeadlineDays = computeDaysUntilDate(now, 4, 5);

  return {
    deployments,
    nextDeployment: deployments[0] || null,
    totalPending: deployments.length,
    isaDeadlineDays,
    timestamp: now.toISOString(),
  };
}

/**
 * Compute ISA deployment schedule
 */
function computeISADeployment(eng, now) {
  const isa = eng.isaPensionRouting;
  if (!isa?.isaHeadroom?.remaining || isa.isaHeadroom.remaining <= 0) return null;

  const days = isa.daysUntilTaxYearEnd || computeDaysUntilDate(now, 4, 5);
  const remaining = isa.isaHeadroom.remaining;

  let priority = 5;
  let rationale = `Deploy £${remaining.toLocaleString()} to ISA`;

  if (days <= 7) {
    priority = 1;
    rationale = `URGENT: ISA deadline in ${days} days. Deploy £${remaining.toLocaleString()} immediately.`;
  } else if (days <= 14) {
    priority = 2;
    rationale = `ISA deadline in ${days} days. Schedule transfer of £${remaining.toLocaleString()}.`;
  } else if (days <= 30) {
    priority = 3;
    rationale = `ISA deadline approaching (${days} days). Plan deployment of £${remaining.toLocaleString()}.`;
  }

  const targetDate = new Date(now);
  targetDate.setDate(targetDate.getDate() + Math.min(days - 3, 14));

  return {
    date: targetDate.toISOString().split('T')[0],
    action: 'Fund ISA',
    amount: remaining,
    rationale,
    priority,
    type: 'tax',
    deadlineDays: days,
  };
}

/**
 * Compute pension deployment
 */
function computePensionDeployment(eng, portConfig, now) {
  const isa = eng.isaPensionRouting;
  if (!isa?.salarySacrificeValue?.totalSaving || isa.salarySacrificeValue.totalSaving <= 0) return null;

  const saving = isa.salarySacrificeValue.totalSaving;
  const inTaper = isa.salarySacrificeValue.inTaperZone;

  return {
    date: getNextMonthDate(now),
    action: 'Arrange salary sacrifice',
    amount: saving,
    rationale: `£${Math.round(saving).toLocaleString()}/yr tax saving. ${inTaper ? 'In taper zone — 60% effective rate. High priority.' : 'Standard rate benefit.'}`,
    priority: inTaper ? 2 : 4,
    type: 'pension',
    deadlineDays: null,
  };
}

/**
 * Compute debt paydown schedule
 */
function computeDebtDeployments(eng, now) {
  if (!eng.debtPriority?.actions?.length) return [];

  return eng.debtPriority.actions
    .filter(a => a.apr > 0 && a.balance > 0)
    .map(a => {
      const priority = a.apr > 20 ? 1 : a.apr > 15 ? 2 : a.apr > 8 ? 3 : 5;
      return {
        date: priority <= 2 ? now.toISOString().split('T')[0] : getNextMonthDate(now),
        action: `Pay down ${a.name}`,
        amount: a.balance,
        rationale: `${a.apr}% APR — £${Math.round(a.annualInterest || 0).toLocaleString()}/yr drag. Guaranteed return on paydown.`,
        priority,
        type: 'debt',
        deadlineDays: null,
      };
    });
}

/**
 * Compute rebalance execution timing
 */
function computeRebalanceDeployment(eng, now) {
  if (!eng.rebalanceProposal?.trades?.length) return null;

  const drift = eng.driftMonitor?.maxDrift || 0;
  const isUrgent = eng.rebalanceProposal.status === 'Action Recommended' || drift > 5;

  return {
    date: isUrgent ? now.toISOString().split('T')[0] : getNextQuarterDate(now),
    action: `Execute rebalance (${eng.rebalanceProposal.trades.length} trades)`,
    amount: null,
    rationale: `Max drift ${drift.toFixed(1)}%. ${eng.rebalanceProposal.status}. ${eng.rebalanceProposal.trades.length} trades queued.`,
    priority: isUrgent ? 3 : 6,
    type: 'rebalance',
    deadlineDays: null,
  };
}

/**
 * Compute wrapper optimisation deployment
 */
function computeWrapperDeployment(eng, now) {
  if (!eng.wrapperExposure?.reallocationOpportunities?.length) return null;

  const benefit = eng.wrapperExposure.totalAnnualBenefitFromReallocation || 0;
  if (benefit <= 0) return null;

  return {
    date: getNextMonthDate(now),
    action: `Bed & ISA ${eng.wrapperExposure.reallocationOpportunities.length} positions`,
    amount: benefit,
    rationale: `£${benefit.toLocaleString()}/yr structural alpha from wrapper optimisation.`,
    priority: 5,
    type: 'wrapper',
    deadlineDays: null,
  };
}

/**
 * Calculate days until a specific month/day
 */
function computeDaysUntilDate(now, month, day) {
  let target = new Date(now.getFullYear(), month - 1, day);
  if (target <= now) {
    target = new Date(now.getFullYear() + 1, month - 1, day);
  }
  return Math.ceil((target - now) / (1000 * 60 * 60 * 24));
}

/**
 * Get the 1st of next month as ISO date string
 */
function getNextMonthDate(now) {
  const next = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  return next.toISOString().split('T')[0];
}

/**
 * Get next quarterly rebalance date
 */
function getNextQuarterDate(now) {
  const quarterMonths = [1, 4, 7, 10];
  const currentMonth = now.getMonth() + 1;
  const nextQ = quarterMonths.find(m => m > currentMonth) || quarterMonths[0];
  const year = nextQ <= currentMonth ? now.getFullYear() + 1 : now.getFullYear();
  return new Date(year, nextQ - 1, 15).toISOString().split('T')[0];
}
