// lib/agents/capital-deployment.js
// Capital Deployment Agent — optimal cash deployment sequencing

function computeCapitalDeployment(ENGINE, MKTENG, rawData) {
  const regime = MKTENG?.regime || {};
  const bonusAlloc = ENGINE?.bonusAllocation || {};
  const isaPension = ENGINE?.isaPensionRouting || {};
  const debtPriority = ENGINE?.debtPriority || {};
  const capitalEff = ENGINE?.capitalEfficiency || {};
  const liquidity = ENGINE?.liquidityLadder || {};

  const portConfig = rawData?.portConfig || {};
  const bonus = rawData?.bonus || {};
  const holdings = rawData?.holdings || [];

  const regimeLabel = regime.label || 'unknown';
  const now = new Date();
  const currentMonth = now.getMonth(); // 0-indexed
  const currentYear = now.getFullYear();
  const taxYearEnd = new Date(currentYear, 3, 5); // April 5
  if (now > taxYearEnd) taxYearEnd.setFullYear(currentYear + 1);
  const monthsToTaxYearEnd = Math.max(0, Math.ceil((taxYearEnd - now) / (30 * 24 * 60 * 60 * 1000)));

  // --- ISA Status ---
  const isaAllowance = portConfig.isaAllowance || 20000;
  const isaUsed = portConfig.isaUsed || isaPension.isaUsed || 0;
  const isaRemaining = Math.max(0, isaAllowance - isaUsed);
  const isaStatus = {
    allowance: isaAllowance,
    used: isaUsed,
    remaining: isaRemaining,
    utilisationPct: isaAllowance > 0 ? Math.round((isaUsed / isaAllowance) * 100) : 0,
    monthsLeft: monthsToTaxYearEnd,
    monthlyTarget: monthsToTaxYearEnd > 0 ? Math.round(isaRemaining / monthsToTaxYearEnd) : isaRemaining,
    urgency: monthsToTaxYearEnd <= 1 && isaRemaining > 1000 ? 'critical' : monthsToTaxYearEnd <= 3 && isaRemaining > 5000 ? 'high' : 'normal',
  };

  // --- Pension Optimization ---
  const pensionAllowance = portConfig.pensionAllowance || 60000;
  const pensionUsed = portConfig.pensionUsed || isaPension.pensionUsed || 0;
  const pensionRemaining = Math.max(0, pensionAllowance - pensionUsed);
  const taxRate = portConfig.taxRate || 0.4;
  const pensionOptimization = {
    allowance: pensionAllowance,
    used: pensionUsed,
    remaining: pensionRemaining,
    taxRelief: Math.round(pensionRemaining * taxRate),
    effectiveCost: Math.round(pensionRemaining * (1 - taxRate)),
    priority: pensionRemaining > 10000 && taxRate >= 0.4 ? 'high' : pensionRemaining > 0 ? 'medium' : 'complete',
  };

  // --- Debt Payoff Schedule ---
  const debts = debtPriority.ranked || debtPriority.debts || rawData?.debts || [];
  const debtPayoffSchedule = debts.map(d => {
    const rate = d.rate || d.interestRate || 0;
    const balance = d.balance || d.amount || 0;
    const minPayment = d.minPayment || d.minimumPayment || Math.round(balance * 0.02);
    const guaranteedAlpha = rate; // paying off debt = guaranteed return at its rate
    return {
      name: d.name || d.label || 'Unknown debt',
      balance,
      rate,
      minPayment,
      guaranteedAlpha,
      priority: rate > 0.05 ? 'high' : rate > 0.03 ? 'medium' : 'low',
    };
  });
  debtPayoffSchedule.sort((a, b) => b.rate - a.rate); // highest rate first (avalanche)

  // --- Deployment Plan (month-by-month) ---
  const deploymentPlan = [];
  const cashAvailable = portConfig.cashAvailable || bonus.amount || 0;
  let remainingCash = cashAvailable;

  // Priority 1: High-interest debt
  const highDebt = debtPayoffSchedule.filter(d => d.priority === 'high');
  for (const d of highDebt) {
    if (remainingCash <= 0) break;
    const deploy = Math.min(remainingCash, d.balance);
    if (deploy > 0) {
      deploymentPlan.push({
        month: 1,
        action: 'pay-debt',
        target: d.name,
        amount: deploy,
        rationale: `Pay off ${d.rate * 100}% debt — guaranteed ${(d.rate * 100).toFixed(1)}% return`,
        regimeAware: false,
      });
      remainingCash -= deploy;
    }
  }

  // Priority 2: ISA allowance (tax-free wrapper)
  if (remainingCash > 0 && isaRemaining > 0) {
    const monthlyIsa = isaStatus.monthlyTarget;
    const months = Math.min(monthsToTaxYearEnd, 6);
    for (let m = 1; m <= months && remainingCash > 0; m++) {
      const deploy = Math.min(remainingCash, monthlyIsa);
      if (deploy > 0) {
        // Regime-aware: in risk-off, prefer cash ISA or bonds
        const vehicle = (regimeLabel === 'risk-off' || regimeLabel === 'contraction')
          ? 'ISA (defensive allocation — bonds/cash)'
          : 'ISA (growth allocation — equities)';
        deploymentPlan.push({
          month: m,
          action: 'fund-isa',
          target: vehicle,
          amount: deploy,
          rationale: `Fill ISA allowance (${isaStatus.utilisationPct}% used, ${monthsToTaxYearEnd} months to deadline)`,
          regimeAware: true,
        });
        remainingCash -= deploy;
      }
    }
  }

  // Priority 3: Pension contribution (if high tax rate)
  if (remainingCash > 0 && pensionOptimization.priority !== 'complete' && taxRate >= 0.4) {
    const pensionDeploy = Math.min(remainingCash, pensionRemaining);
    if (pensionDeploy > 0) {
      deploymentPlan.push({
        month: 2,
        action: 'fund-pension',
        target: 'SIPP',
        amount: pensionDeploy,
        rationale: `Pension contribution — ${(taxRate * 100).toFixed(0)}% tax relief = £${Math.round(pensionDeploy * taxRate).toLocaleString()} saved`,
        regimeAware: false,
      });
      remainingCash -= pensionDeploy;
    }
  }

  // Priority 4: Medium-rate debt
  const medDebt = debtPayoffSchedule.filter(d => d.priority === 'medium');
  for (const d of medDebt) {
    if (remainingCash <= 0) break;
    const deploy = Math.min(remainingCash, d.balance);
    if (deploy > 0) {
      deploymentPlan.push({
        month: 3,
        action: 'pay-debt',
        target: d.name,
        amount: deploy,
        rationale: `Pay medium-rate debt at ${(d.rate * 100).toFixed(1)}%`,
        regimeAware: false,
      });
      remainingCash -= deploy;
    }
  }

  // Priority 5: Invest remainder
  if (remainingCash > 0) {
    const vehicle = (regimeLabel === 'risk-off' || regimeLabel === 'contraction')
      ? 'GIA — defensive (short bonds, gold, cash equivalents)'
      : 'GIA — growth (diversified equity/alternatives)';
    deploymentPlan.push({
      month: 4,
      action: 'invest',
      target: vehicle,
      amount: remainingCash,
      rationale: 'Deploy remaining cash in regime-appropriate allocation',
      regimeAware: true,
    });
  }

  // --- Next Action ---
  const nextAction = deploymentPlan[0] || {
    action: 'hold',
    target: 'Cash',
    amount: 0,
    rationale: 'No deployable cash available',
  };

  return {
    deploymentPlan,
    nextAction,
    isaStatus,
    pensionOptimization,
    debtPayoffSchedule,
  };
}

module.exports = { computeCapitalDeployment };
