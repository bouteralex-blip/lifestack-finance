// =========================================================================
// LIFESTACK OS — BONUS ALLOCATION ENGINE
// Phase 2: Finance Operating System
// Optimal deployment of bonus across ISA, pension, debt paydown, invest
// =========================================================================

/**
 * Clamp a value between min and max
 */
function clamp(v, min, max) {
  return Math.min(max, Math.max(min, v));
}

/**
 * Default allocation buckets with expected returns and tax treatment
 */
const DEFAULT_BUCKETS = [
  { id: 'isa', label: 'ISA Top-Up', expectedReturn: 7, taxFree: true },
  { id: 'pension', label: 'Pension Contribution', expectedReturn: 7, taxRelief: true },
  { id: 'debt', label: 'Debt Paydown', expectedReturn: 0, guaranteed: true },
  { id: 'gia', label: 'General Investment', expectedReturn: 7, taxFree: false },
  { id: 'emergency', label: 'Emergency Fund', expectedReturn: 2, taxFree: false },
];

/**
 * Compute expected value of a single allocation bucket
 */
function computeBucketEV(bucket, amount, taxRate, horizonYears) {
  const years = horizonYears || 5;

  let effectiveAmount = amount;
  let taxSaving = 0;

  // Pension gets tax relief at marginal rate
  if (bucket.id === 'pension' && taxRate > 0) {
    taxSaving = +(amount * taxRate / 100).toFixed(2);
    effectiveAmount = amount + taxSaving; // gross contribution
  }

  // ISA: no tax on gains
  // GIA: gains taxed at CGT rate (simplified)
  const grossReturn = effectiveAmount * Math.pow(1 + bucket.expectedReturn / 100, years);
  const gain = grossReturn - effectiveAmount;

  let netReturn;
  if (bucket.taxFree || bucket.id === 'pension') {
    netReturn = grossReturn;
  } else {
    const cgtRate = 0.20; // simplified CGT
    netReturn = effectiveAmount + gain * (1 - cgtRate);
  }

  // Debt paydown: guaranteed return = interest saved
  if (bucket.id === 'debt' && bucket.debtAPR) {
    const interestSaved = amount * Math.pow(1 + bucket.debtAPR / 100, years) - amount;
    netReturn = amount + interestSaved;
    taxSaving = 0;
  }

  return {
    bucket: bucket.id,
    label: bucket.label,
    amount: +amount.toFixed(2),
    taxSaving,
    expectedReturn: +netReturn.toFixed(2),
    totalEV: +netReturn.toFixed(2),
  };
}

/**
 * Compute bonus allocation state
 * Evaluates scenarios for deploying bonus capital optimally
 */
export function computeBonusAllocationState(bonusConfig, bonusScenarios, engineState) {
  if (!bonusConfig?.amount || bonusConfig.amount <= 0) return null;

  const bonusAmount = bonusConfig.amount;
  const taxRate = bonusConfig.taxRate || 40; // marginal tax rate %
  const horizonYears = bonusConfig.horizonYears || 5;

  // After-tax bonus
  const afterTax = +(bonusAmount * (1 - taxRate / 100)).toFixed(2);

  // Engine state context
  const isaHeadroom = engineState?.isaRemaining || 20000;
  const pensionHeadroom = engineState?.pensionRemaining || 40000;
  const totalDebt = engineState?.totalDebt || 0;
  const debtAPR = engineState?.highestDebtAPR || 0;
  const emergencyMonths = engineState?.emergencyFundMonths || 0;

  // Build default scenarios if none provided
  const scenarios = (bonusScenarios?.length ? bonusScenarios : [
    {
      name: 'Tax-Optimal Split',
      allocation: [
        { bucket: 'pension', amount: Math.min(afterTax * 0.4, pensionHeadroom) },
        { bucket: 'isa', amount: Math.min(afterTax * 0.35, isaHeadroom) },
        { bucket: 'debt', amount: totalDebt > 0 ? Math.min(afterTax * 0.15, totalDebt) : 0 },
        { bucket: 'gia', amount: 0 }, // remainder
      ],
    },
    {
      name: 'Max ISA First',
      allocation: [
        { bucket: 'isa', amount: Math.min(afterTax, isaHeadroom) },
        { bucket: 'pension', amount: Math.min(Math.max(0, afterTax - isaHeadroom), pensionHeadroom) },
        { bucket: 'gia', amount: 0 }, // remainder
      ],
    },
    {
      name: 'Debt Blitz',
      allocation: [
        { bucket: 'debt', amount: Math.min(afterTax, totalDebt) },
        { bucket: 'isa', amount: Math.min(Math.max(0, afterTax - totalDebt), isaHeadroom) },
        { bucket: 'gia', amount: 0 }, // remainder
      ],
    },
    {
      name: 'Balanced',
      allocation: [
        { bucket: 'pension', amount: afterTax * 0.25 },
        { bucket: 'isa', amount: Math.min(afterTax * 0.25, isaHeadroom) },
        { bucket: 'debt', amount: totalDebt > 0 ? afterTax * 0.25 : 0 },
        { bucket: 'emergency', amount: emergencyMonths < 6 ? afterTax * 0.25 : 0 },
        { bucket: 'gia', amount: 0 }, // remainder
      ],
    },
  ]).map(scenario => {
    // Compute allocated amounts and remainder
    const allocated = scenario.allocation
      .filter(a => a.amount > 0)
      .map(a => {
        const bucketDef = DEFAULT_BUCKETS.find(b => b.id === a.bucket) || { id: a.bucket, label: a.bucket, expectedReturn: 5 };
        if (a.bucket === 'debt') bucketDef.debtAPR = debtAPR;
        return computeBucketEV(bucketDef, a.amount, taxRate, horizonYears);
      });

    const allocatedTotal = allocated.reduce((s, a) => s + a.amount, 0);
    const remainder = Math.max(0, afterTax - allocatedTotal);

    // Put remainder in GIA
    if (remainder > 0) {
      const giaBucket = DEFAULT_BUCKETS.find(b => b.id === 'gia');
      allocated.push(computeBucketEV(giaBucket, remainder, taxRate, horizonYears));
    }

    const totalEV = +allocated.reduce((s, a) => s + a.totalEV, 0).toFixed(2);
    const totalTaxSaving = +allocated.reduce((s, a) => s + a.taxSaving, 0).toFixed(2);

    return {
      name: scenario.name,
      allocation: allocated,
      totalEV,
      totalTaxSaving,
    };
  }).sort((a, b) => b.totalEV - a.totalEV);

  const recommended = scenarios[0] || null;

  // Tax optimal split summary
  const pensionAlloc = Math.min(afterTax * 0.4, pensionHeadroom);
  const isaAlloc = Math.min(afterTax - pensionAlloc, isaHeadroom);
  const taxOptimalSplit = {
    pension: +pensionAlloc.toFixed(2),
    isa: +isaAlloc.toFixed(2),
    remainder: +Math.max(0, afterTax - pensionAlloc - isaAlloc).toFixed(2),
    pensionTaxRelief: +(pensionAlloc * taxRate / 100).toFixed(2),
  };

  // Implication
  let implication;
  if (recommended) {
    implication = `Recommended: "${recommended.name}" with ${recommended.totalTaxSaving > 0 ? `£${recommended.totalTaxSaving.toLocaleString()} tax saving and ` : ''}expected value of £${recommended.totalEV.toLocaleString()} over ${horizonYears} years.`;
  } else {
    implication = 'Unable to compute optimal allocation — check bonus configuration.';
  }

  return {
    bonusAmount,
    afterTax,
    taxRate,
    scenarios,
    recommended: recommended ? recommended.name : null,
    taxOptimalSplit,
    isaHeadroom,
    pensionHeadroom,
    implication,
  };
}
