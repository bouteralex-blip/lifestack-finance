// =========================================================================
// LIFESTACK OS — ISA / PENSION ROUTING ENGINE
// Phase 2: Finance Operating System
// Calendar-aware allowance tracking, salary sacrifice optimisation,
// and deployment recommendations for maximum tax-efficient growth
// =========================================================================

/**
 * UK Tax Year constants
 */
const UK_TAX = {
  isaAllowance: 20000,       // 2025/26 ISA allowance
  pensionAnnualAllowance: 60000, // 2025/26 pension annual allowance
  cgtAllowance: 3000,        // 2025/26 CGT annual exempt amount
  higherRateThreshold: 50270, // Higher rate starts
  additionalRateThreshold: 125140, // Additional rate starts
  personalAllowanceTaper: { start: 100000, end: 125140 },
  taxYearEnd: { month: 3, day: 5 }, // 5 April
};

/**
 * Calculate days until the ISA/tax year deadline
 */
export function daysUntilDeadline(today = new Date()) {
  const year = today.getMonth() >= 3 && !(today.getMonth() === 3 && today.getDate() <= 5)
    ? today.getFullYear() + 1
    : today.getFullYear();

  const deadline = new Date(year, 3, 5); // April 5
  const diffMs = deadline - today;
  return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
}

/**
 * Calculate ISA headroom remaining this tax year
 */
export function calculateISAHeadroom(usedYTD = 0, allowance = UK_TAX.isaAllowance) {
  const remaining = Math.max(0, allowance - usedYTD);
  return {
    allowance,
    used: usedYTD,
    remaining,
    utilisation: allowance > 0 ? +((usedYTD / allowance) * 100).toFixed(1) : 0,
  };
}

/**
 * Calculate pension headroom remaining this tax year
 */
export function calculatePensionHeadroom(contributedYTD = 0, employerContribution = 0, allowance = UK_TAX.pensionAnnualAllowance) {
  const totalContributed = contributedYTD + employerContribution;
  const remaining = Math.max(0, allowance - totalContributed);
  return {
    allowance,
    personalContributed: contributedYTD,
    employerContributed: employerContribution,
    totalContributed,
    remaining,
    utilisation: allowance > 0 ? +((totalContributed / allowance) * 100).toFixed(1) : 0,
  };
}

/**
 * Calculate salary sacrifice tax benefit
 * Key insight: In the £100-125k band, effective marginal tax rate is ~60%
 * because of personal allowance taper (lose £1 allowance per £2 over £100k)
 */
export function calculateSalarySacrificeValue(grossSalary, additionalContribution, taxRate = 0.45, niRate = 0.02) {
  if (grossSalary <= 0 || additionalContribution <= 0) {
    return { taxSaving: 0, niSaving: 0, totalSaving: 0, effectiveRate: 0 };
  }

  // Check if salary is in the £100-125k personal allowance taper zone
  const inTaperZone = grossSalary > UK_TAX.personalAllowanceTaper.start &&
    grossSalary <= UK_TAX.personalAllowanceTaper.end;

  // Effective marginal rate in taper zone is ~60% (40% tax + 20% PA taper effect)
  const effectiveTaxRate = inTaperZone ? 0.60 : taxRate;

  const taxSaving = +(additionalContribution * effectiveTaxRate).toFixed(2);
  const niSaving = +(additionalContribution * niRate).toFixed(2);
  const totalSaving = +(taxSaving + niSaving).toFixed(2);
  const effectiveRate = additionalContribution > 0
    ? +((totalSaving / additionalContribution) * 100).toFixed(1)
    : 0;

  return {
    taxSaving,
    niSaving,
    totalSaving,
    effectiveRate,
    inTaperZone,
    note: inTaperZone
      ? `£100-125k taper zone: ${effectiveRate}% effective benefit per £1 sacrificed`
      : `Standard rate: ${effectiveRate}% benefit (${(taxRate * 100).toFixed(0)}% tax + ${(niRate * 100).toFixed(0)}% NI)`,
  };
}

/**
 * Generate deployment recommendations based on available cash and allowances
 */
export function recommendDeployment(availableCash, isaHeadroom, pensionHeadroom, salarySacrificeValue, daysLeft) {
  const recommendations = [];
  const urgencyMultiplier = daysLeft <= 30 ? 'URGENT' : daysLeft <= 90 ? 'Soon' : 'Plan';

  // ISA deployment
  if (isaHeadroom.remaining > 0 && availableCash > 0) {
    const isaAmount = Math.min(isaHeadroom.remaining, availableCash);
    recommendations.push({
      action: 'Fund ISA',
      amount: isaAmount,
      priority: daysLeft <= 30 ? 1 : 2,
      urgency: urgencyMultiplier,
      benefit: `Tax-free growth on £${isaAmount.toLocaleString()}`,
      deadline: `ISA deadline in ${daysLeft} days`,
      annualBenefit: +(isaAmount * 0.08 * 0.20).toFixed(0), // 8% return × 20% CGT saved
    });
  }

  // Salary sacrifice (if in taper zone or high earner)
  if (salarySacrificeValue.totalSaving > 0) {
    recommendations.push({
      action: 'Salary Sacrifice',
      amount: pensionHeadroom.remaining > 0 ? Math.min(15000, pensionHeadroom.remaining) : 0,
      priority: salarySacrificeValue.inTaperZone ? 1 : 3,
      urgency: salarySacrificeValue.inTaperZone ? 'URGENT' : 'Plan',
      benefit: salarySacrificeValue.note,
      deadline: 'Ongoing — arrange with payroll',
      annualBenefit: salarySacrificeValue.totalSaving,
    });
  }

  // Pension top-up
  if (pensionHeadroom.remaining > 10000) {
    recommendations.push({
      action: 'Pension Top-Up',
      amount: Math.min(pensionHeadroom.remaining - 10000, availableCash * 0.3),
      priority: 4,
      urgency: 'Plan',
      benefit: `${(0.40 * 100).toFixed(0)}% tax relief on contribution`,
      deadline: `Tax year end in ${daysLeft} days`,
      annualBenefit: +(Math.min(pensionHeadroom.remaining, 10000) * 0.40).toFixed(0),
    });
  }

  return recommendations.sort((a, b) => a.priority - b.priority);
}

/**
 * Master function: compute full ISA/Pension routing state
 */
export function computeISAPensionRoutingState(portConfig, isaUsedYTD = 0, pensionContribYTD = 0, employerPensionYTD = 0) {
  if (!portConfig) return null;

  const today = new Date();
  const daysLeft = daysUntilDeadline(today);

  const isaHeadroom = calculateISAHeadroom(isaUsedYTD);
  const pensionHeadroom = calculatePensionHeadroom(pensionContribYTD, employerPensionYTD);

  // Salary sacrifice calculation for £15k additional contribution
  const salSacAmount = Math.min(15000, pensionHeadroom.remaining);
  const salarySacrificeValue = calculateSalarySacrificeValue(
    portConfig.grossSalary,
    salSacAmount,
    portConfig.taxRate,
    portConfig.niRate
  );

  // Available cash for deployment (estimate: liquid cash minus 3-month runway)
  const monthlyExpenses = portConfig.monthlyExpenses || 6000;
  const emergencyBuffer = monthlyExpenses * 3;
  const availableCash = Math.max(0, (portConfig.netWorth * 0.04) - emergencyBuffer); // ~4% assumed liquid

  const recommendations = recommendDeployment(
    availableCash, isaHeadroom, pensionHeadroom, salarySacrificeValue, daysLeft
  );

  return {
    daysUntilTaxYearEnd: daysLeft,
    isaHeadroom,
    pensionHeadroom,
    salarySacrificeValue,
    recommendations,
    urgencyFlags: [
      daysLeft <= 30 && isaHeadroom.remaining > 0 && { item: 'ISA Deadline', daysLeft, action: `Deploy £${isaHeadroom.remaining.toLocaleString()} to ISA` },
      salarySacrificeValue.inTaperZone && { item: 'Salary Sacrifice', daysLeft: null, action: 'Arrange with payroll — 60% effective benefit' },
      daysLeft <= 90 && pensionHeadroom.remaining > 20000 && { item: 'Pension Allowance', daysLeft, action: `£${pensionHeadroom.remaining.toLocaleString()} unused pension allowance` },
    ].filter(Boolean),
    totalAnnualBenefitFromOptimisation: recommendations.reduce((s, r) => s + (r.annualBenefit || 0), 0),
  };
}
