// =========================================================================
// LIFESTACK OS — DEBT PRIORITY ENGINE
// Phase 2: Finance Operating System
// Ranks debts by APR, calculates guaranteed alpha of paydown vs investing
// =========================================================================

/**
 * Default debt ledger derived from portfolio config
 * In production, this would come from Supabase or manual entry
 */
export function buildDebtLedger(portConfig) {
  if (!portConfig) return [];
  const debts = [];

  if (portConfig.amexDebt > 0) {
    debts.push({
      name: 'Amex Credit Card',
      balance: portConfig.amexDebt,
      apr: 22.9,
      minPayment: Math.max(25, portConfig.amexDebt * 0.02),
      type: 'revolving',
    });
  }

  if (portConfig.monzoFlex > 0) {
    debts.push({
      name: 'Monzo Flex',
      balance: portConfig.monzoFlex,
      apr: 0,
      minPayment: Math.ceil(portConfig.monzoFlex / 12),
      type: 'instalment',
    });
  }

  return debts;
}

/**
 * Rank debts by APR (highest first — avalanche method)
 * Each debt gets a priority order and paydown metrics
 */
export function rankDebtByAPR(debts) {
  if (!debts?.length) return [];
  return [...debts]
    .sort((a, b) => b.apr - a.apr)
    .map((d, i) => ({
      ...d,
      priorityOrder: i + 1,
      monthlyInterest: +((d.balance * d.apr / 100) / 12).toFixed(2),
      annualInterest: +((d.balance * d.apr / 100)).toFixed(2),
    }));
}

/**
 * Calculate guaranteed alpha of debt paydown vs expected investment return
 * Paying 22.9% APR debt = guaranteed 22.9% return (risk-free)
 * Investing = expected ~8% return with volatility
 */
export function calculateGuaranteedAlpha(apr, expectedReturn = 8.0) {
  return +(apr - expectedReturn).toFixed(2);
}

/**
 * Estimate total interest cost if debt is not prioritized over N months
 */
export function estimateInterestCost(balance, apr, months = 12) {
  if (apr <= 0) return 0;
  const monthlyRate = apr / 100 / 12;
  let totalInterest = 0;
  let remaining = balance;

  for (let m = 0; m < months; m++) {
    const interest = remaining * monthlyRate;
    totalInterest += interest;
    // Assume minimum payment covers interest + 1% principal
    remaining = Math.max(0, remaining - (remaining * 0.01));
  }

  return +totalInterest.toFixed(2);
}

/**
 * Estimate months to pay off debt with given monthly payment
 */
export function monthsToPayoff(balance, apr, monthlyPayment) {
  if (balance <= 0) return 0;
  if (monthlyPayment <= 0) return Infinity;
  if (apr <= 0) return Math.ceil(balance / monthlyPayment);

  const monthlyRate = apr / 100 / 12;
  let remaining = balance;
  let months = 0;

  while (remaining > 0 && months < 360) {
    const interest = remaining * monthlyRate;
    if (monthlyPayment <= interest) return Infinity; // can never pay off
    remaining = remaining + interest - monthlyPayment;
    months++;
  }

  return months;
}

/**
 * Recommend paydown priority based on debts and available cash
 * Returns ranked actions with guaranteed alpha comparison
 */
export function recommendPaydownPriority(debts, availableCash = 0, expectedReturn = 8.0) {
  if (!debts?.length) return { actions: [], totalDebt: 0 };

  const ranked = rankDebtByAPR(debts);
  const totalDebt = ranked.reduce((s, d) => s + d.balance, 0);
  let cashRemaining = availableCash;

  const actions = ranked.map(d => {
    const alpha = calculateGuaranteedAlpha(d.apr, expectedReturn);
    const interestCost12m = estimateInterestCost(d.balance, d.apr, 12);
    const paydownAmount = Math.min(d.balance, Math.max(0, cashRemaining));
    cashRemaining -= paydownAmount;

    return {
      name: d.name,
      balance: d.balance,
      apr: d.apr,
      priorityOrder: d.priorityOrder,
      guaranteedAlpha: alpha,
      monthlyInterest: d.monthlyInterest,
      annualInterest: d.annualInterest,
      interestCost12m: interestCost12m,
      suggestedPaydown: paydownAmount,
      monthsToZero: monthsToPayoff(d.balance, d.apr, d.minPayment * 2),
      action: d.apr > expectedReturn
        ? `Pay down — ${alpha}% guaranteed alpha vs investing`
        : d.apr > 0
          ? 'Monitor — low APR, investing may outperform'
          : 'No urgency — 0% interest',
    };
  });

  const totalMonthlyInterest = actions.reduce((s, a) => s + a.monthlyInterest, 0);
  const highestPriority = actions[0] || null;

  return {
    actions,
    totalDebt,
    totalMonthlyInterest: +totalMonthlyInterest.toFixed(2),
    totalAnnualInterest: +(totalMonthlyInterest * 12).toFixed(2),
    highestPriorityTarget: highestPriority?.name || null,
    highestAPR: highestPriority?.apr || 0,
    recommendation: highestPriority && highestPriority.apr > expectedReturn
      ? `Priority: Pay ${highestPriority.name} (${highestPriority.apr}% APR) before investing. Guaranteed ${highestPriority.guaranteedAlpha}% alpha.`
      : totalDebt > 0
        ? 'All debts below expected return — invest surplus while making minimum payments.'
        : 'Debt-free — deploy all surplus to investments.',
  };
}

/**
 * Master function: compute full debt priority state
 */
export function computeDebtPriorityState(portConfig, availableCash = 0, expectedReturn = 8.0) {
  const debts = buildDebtLedger(portConfig);
  if (!debts.length) {
    return {
      debtFree: true,
      totalDebt: 0,
      actions: [],
      recommendation: 'Debt-free — deploy all surplus to investments.',
    };
  }

  const result = recommendPaydownPriority(debts, availableCash, expectedReturn);

  return {
    debtFree: false,
    ...result,
    debtToNetWorthRatio: portConfig.netWorth > 0
      ? +((result.totalDebt / portConfig.netWorth) * 100).toFixed(2)
      : null,
    debtToIncomeRatio: portConfig.grossSalary > 0
      ? +((result.totalDebt / portConfig.grossSalary) * 100).toFixed(2)
      : null,
  };
}
