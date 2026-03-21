// =========================================================================
// LIFESTACK OS — CALENDAR DEPLOYMENT SCHEDULER (EXPANDED)
// Phase 4: Research & Decisioning
// Calendar-aware capital deployment scheduling with 12-week forward visibility
// and milestone categorization (THIS_WEEK, NEXT_2_WEEKS, THIS_MONTH, Q_FORWARD)
// =========================================================================

const KEY_DATES = [
  { name: 'ISA Deadline', month: 4, day: 5, type: 'tax', criticality: 'CRITICAL' },
  { name: 'Pension Year-End', month: 4, day: 5, type: 'tax', criticality: 'CRITICAL' },
  { name: 'Self-Assessment Deadline', month: 1, day: 31, type: 'tax', criticality: 'CRITICAL' },
  { name: 'CGT Reporting Deadline', month: 12, day: 31, type: 'tax', criticality: 'HIGH' },
  { name: 'Q1 Rebalance', month: 1, day: 15, type: 'rebalance', criticality: 'MEDIUM' },
  { name: 'Q2 Rebalance', month: 4, day: 15, type: 'rebalance', criticality: 'MEDIUM' },
  { name: 'Q3 Rebalance', month: 7, day: 15, type: 'rebalance', criticality: 'MEDIUM' },
  { name: 'Q4 Rebalance', month: 10, day: 15, type: 'rebalance', criticality: 'MEDIUM' },
  { name: 'Bonus Season Starts', month: 1, day: 1, type: 'income', criticality: 'MEDIUM' },
  { name: 'Summer Holiday Period', month: 8, day: 1, type: 'market', criticality: 'LOW' },
  { name: 'End of Month Reporting', month: null, day: 28, type: 'admin', criticality: 'LOW' },
];

/**
 * Classify deployment into timeline bucket
 * Returns: THIS_WEEK | NEXT_2_WEEKS | THIS_MONTH | Q_FORWARD
 */
function classifyTimeline(daysUntil) {
  if (daysUntil <= 7) return 'THIS_WEEK';
  if (daysUntil <= 14) return 'NEXT_2_WEEKS';
  if (daysUntil <= 30) return 'THIS_MONTH';
  if (daysUntil <= 84) return 'Q_FORWARD';  // 12 weeks
  return 'BACKLOG';
}

/**
 * Compute calendar-aware capital deployment schedule (EXPANDED 12-WEEK)
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

  // 3. Debt paydown schedule (NEW: Expanded to 12-week window)
  const debtDeployments = computeDebtDeployments(engineState, now);
  deployments.push(...debtDeployments);

  // 4. Rebalance execution
  const rebalanceDeployment = computeRebalanceDeployment(engineState, now);
  if (rebalanceDeployment) deployments.push(rebalanceDeployment);

  // 5. Wrapper optimisation
  const wrapperDeployment = computeWrapperDeployment(engineState, now);
  if (wrapperDeployment) deployments.push(wrapperDeployment);

  // 6. NEW: Calendar milestones (12-week forward view)
  const milestones = computeCalendarMilestones(now);
  deployments.push(...milestones);

  // Sort by priority (lower = more urgent), then by date
  deployments.sort((a, b) => {
    if (a.priority !== b.priority) return a.priority - b.priority;
    return new Date(a.date) - new Date(b.date);
  });

  // NEW: Organize by timeline bucket for "What to Watch" section
  const timelineBuckets = {
    THIS_WEEK: [],
    NEXT_2_WEEKS: [],
    THIS_MONTH: [],
    Q_FORWARD: [],
    BACKLOG: [],
  };

  deployments.forEach(d => {
    const timeline = classifyTimeline(d.deadlineDays || 999);
    if (timelineBuckets[timeline]) {
      timelineBuckets[timeline].push(d);
    }
  });

  // ISA deadline days
  const isaDeadlineDays = computeDaysUntilDate(now, 4, 5);

  return {
    deployments,
    timelineBuckets,  // NEW: Organized by urgency buckets
    nextDeployment: deployments[0] || null,
    totalPending: deployments.length,
    isaDeadlineDays,
    forecastWindow: 84,  // 12 weeks
    timestamp: now.toISOString(),
  };
}

/**
 * NEW: Compute calendar milestones for 12-week forward view
 * Returns array of milestone events (not action-based, just calendar events)
 */
function computeCalendarMilestones(now) {
  const milestones = [];
  const forecastDays = 84;  // 12 weeks
  const endDate = new Date(now.getTime() + forecastDays * 86400000);

  KEY_DATES.forEach(dateEvent => {
    // Calculate next occurrence of this date
    let target = new Date(now.getFullYear(), dateEvent.month ? dateEvent.month - 1 : now.getMonth(), dateEvent.day || 28);
    if (target <= now) {
      target = new Date(now.getFullYear() + 1, dateEvent.month ? dateEvent.month - 1 : now.getMonth(), dateEvent.day || 28);
    }

    // Only include if within 12-week forecast window
    if (target <= endDate) {
      const daysUntil = Math.ceil((target - now) / (1000 * 60 * 60 * 24));
      
      milestones.push({
        date: target.toISOString().split('T')[0],
        action: dateEvent.name,
        type: dateEvent.type,
        criticality: dateEvent.criticality || 'LOW',
        priority: dateEvent.criticality === 'CRITICAL' ? 1 : dateEvent.criticality === 'HIGH' ? 2 : 4,
        rationale: `Calendar milestone: ${dateEvent.name}`,
        deadlineDays: daysUntil,
        isCalendarMilestone: true,  // Flag as milestone vs action-based deployment
        amount: null,  // Milestones don't have amounts
      });
    }
  });

  return milestones;
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
    rationale = `🔴 URGENT: ISA deadline in ${days} days. Deploy £${remaining.toLocaleString()} immediately.`;
  } else if (days <= 14) {
    priority = 2;
    rationale = `🟠 ISA deadline in ${days} days. Schedule transfer of £${remaining.toLocaleString()}.`;
  } else if (days <= 30) {
    priority = 3;
    rationale = `🟡 ISA deadline approaching (${days} days). Plan deployment of £${remaining.toLocaleString()}.`;
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
    timeline: classifyTimeline(days),  // NEW: Timeline bucket
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

  const nextMonth = getNextMonthDate(now);
  const daysUntil = Math.ceil((new Date(nextMonth) - now) / (1000 * 60 * 60 * 24));

  return {
    date: nextMonth,
    action: 'Arrange salary sacrifice',
    amount: saving,
    rationale: `£${Math.round(saving).toLocaleString()}/yr tax saving. ${inTaper ? '🔴 In taper zone — 60% effective rate. High priority.' : 'Standard rate benefit.'}`,
    priority: inTaper ? 2 : 4,
    type: 'pension',
    deadlineDays: daysUntil,
    timeline: classifyTimeline(daysUntil),  // NEW: Timeline bucket
  };
}

/**
 * Compute debt paydown schedule (EXPANDED: 12-week visibility)
 */
function computeDebtDeployments(eng, now) {
  if (!eng.debtPriority?.actions?.length) return [];

  return eng.debtPriority.actions
    .filter(a => a.apr > 0 && a.balance > 0)
    .map((a, idx) => {
      const priority = a.apr > 20 ? 1 : a.apr > 15 ? 2 : a.apr > 8 ? 3 : 5;
      
      // NEW: Stagger debt paydowns across 12 weeks based on APR
      const weeksOut = priority === 1 ? 0 : priority === 2 ? 2 : priority === 3 ? 4 : 8;
      const targetDate = new Date(now);
      targetDate.setDate(targetDate.getDate() + weeksOut * 7);
      const daysUntil = Math.ceil((targetDate - now) / (1000 * 60 * 60 * 24));

      return {
        date: targetDate.toISOString().split('T')[0],
        action: `Pay down ${a.name}`,
        amount: a.balance,
        rationale: `${a.apr}% APR — £${Math.round(a.annualInterest || 0).toLocaleString()}/yr drag. Guaranteed return on paydown.`,
        priority,
        type: 'debt',
        deadlineDays: daysUntil,
        timeline: classifyTimeline(daysUntil),  // NEW: Timeline bucket
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

  const targetDate = isUrgent ? now : getNextQuarterDate(now);
  const daysUntil = Math.ceil((new Date(targetDate) - now) / (1000 * 60 * 60 * 24));

  return {
    date: targetDate.toISOString ? targetDate.toISOString().split('T')[0] : targetDate,
    action: `Execute rebalance (${eng.rebalanceProposal.trades.length} trades)`,
    amount: null,
    rationale: `Max drift ${drift.toFixed(1)}%. ${eng.rebalanceProposal.status}. ${eng.rebalanceProposal.trades.length} trades queued.`,
    priority: isUrgent ? 3 : 6,
    type: 'rebalance',
    deadlineDays: daysUntil,
    timeline: classifyTimeline(daysUntil),  // NEW: Timeline bucket
  };
}

/**
 * Compute wrapper optimisation deployment
 */
function computeWrapperDeployment(eng, now) {
  if (!eng.wrapperExposure?.reallocationOpportunities?.length) return null;

  const benefit = eng.wrapperExposure.totalAnnualBenefitFromReallocation || 0;
  if (benefit <= 0) return null;

  const nextMonth = getNextMonthDate(now);
  const daysUntil = Math.ceil((new Date(nextMonth) - now) / (1000 * 60 * 60 * 24));

  return {
    date: nextMonth,
    action: `Bed & ISA ${eng.wrapperExposure.reallocationOpportunities.length} positions`,
    amount: benefit,
    rationale: `£${benefit.toLocaleString()}/yr structural alpha from wrapper optimisation.`,
    priority: 5,
    type: 'wrapper',
    deadlineDays: daysUntil,
    timeline: classifyTimeline(daysUntil),  // NEW: Timeline bucket
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
