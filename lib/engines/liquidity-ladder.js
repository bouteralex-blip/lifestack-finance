// =========================================================================
// LIFESTACK OS — LIQUIDITY LADDER ENGINE
// Phase 2: Finance Operating System
// Tiered liquidity analysis: cash, T-bills, liquid equity, illiquid
// =========================================================================

/**
 * Clamp a value between min and max
 */
function clamp(v, min, max) {
  return Math.min(max, Math.max(min, v));
}

/**
 * Map a value from one range to another
 */
function mapRange(value, inMin, inMax, outMin, outMax) {
  return outMin + ((value - inMin) / (inMax - inMin)) * (outMax - outMin);
}

/**
 * Liquidity tier definitions
 * T0: Cash & bank deposits (<1 day)
 * T1: Money market / T-bills (<1 week)
 * T2: Liquid equity / ETFs (<3 days)
 * T3: Illiquid (property, PE, locked pensions, >1 month)
 */
const TIER_CLASSIFIERS = [
  {
    tier: 'T0',
    name: 'Cash & Deposits',
    horizon: '<1 day',
    match: (h) => {
      const cls = (h.assetClass || h.cls || '').toLowerCase();
      const name = (h.name || '').toLowerCase();
      const ticker = (h.ticker || '').toLowerCase();
      return cls.includes('cash') || name.includes('cash') || name.includes('deposit')
        || name.includes('current account') || name.includes('savings account')
        || ticker === 'gbp' || ticker === 'usd' || ticker === 'eur';
    },
  },
  {
    tier: 'T1',
    name: 'Money Market & T-Bills',
    horizon: '<1 week',
    match: (h) => {
      const cls = (h.assetClass || h.cls || '').toLowerCase();
      const name = (h.name || '').toLowerCase();
      const ticker = (h.ticker || '').toUpperCase();
      return name.includes('money market') || name.includes('t-bill') || name.includes('treasury bill')
        || name.includes('mmf') || ticker === 'CSH2' || ticker === 'XDWT'
        || (cls.includes('fixed income') && name.includes('short'));
    },
  },
  {
    tier: 'T2',
    name: 'Liquid Equity & ETFs',
    horizon: '<3 days',
    match: (h) => {
      const cls = (h.assetClass || h.cls || '').toLowerCase();
      const wrapper = (h.wrapper || '').toUpperCase();
      return cls.includes('equity') || cls.includes('multi-asset') || cls.includes('fixed income')
        || cls.includes('crypto');
    },
  },
  {
    tier: 'T3',
    name: 'Illiquid',
    horizon: '>1 month',
    match: () => true, // catch-all
  },
];

/**
 * Classify a holding into a liquidity tier
 */
function classifyTier(h) {
  for (const tier of TIER_CLASSIFIERS) {
    if (tier.match(h)) return tier;
  }
  return TIER_CLASSIFIERS[TIER_CLASSIFIERS.length - 1];
}

/**
 * Compute liquidity ladder state from holdings
 * Segments portfolio into timed liquidity tiers
 */
export function computeLiquidityLadderState(holdings, portConfig) {
  if (!holdings?.length) return null;

  const monthlyExpenses = portConfig?.monthlyExpenses || 0;
  const totalValue = holdings.reduce((s, h) => s + (h.value || h.val || 0), 0);
  if (totalValue <= 0) return null;

  // Classify each holding
  const classified = holdings.map(h => {
    const tier = classifyTier(h);
    return {
      ...h,
      liquidityTier: tier.tier,
      liquidityName: tier.name,
    };
  });

  // Aggregate by tier
  const tierTotals = { T0: 0, T1: 0, T2: 0, T3: 0 };
  classified.forEach(h => {
    const value = h.value || h.val || 0;
    tierTotals[h.liquidityTier] = (tierTotals[h.liquidityTier] || 0) + value;
  });

  const tiers = TIER_CLASSIFIERS.map(tc => {
    const value = +(tierTotals[tc.tier] || 0).toFixed(2);
    const pct = totalValue > 0 ? +((value / totalValue) * 100).toFixed(1) : 0;
    const coverageMonths = monthlyExpenses > 0 ? +(value / monthlyExpenses).toFixed(1) : 0;
    return {
      tier: tc.tier,
      name: tc.name,
      horizon: tc.horizon,
      value,
      pct,
      coverageMonths,
    };
  });

  // Total liquid (T0 + T1 + T2)
  const totalLiquid = +(tierTotals.T0 + tierTotals.T1 + tierTotals.T2).toFixed(2);

  // Emergency fund: T0 + T1 in months of expenses
  const emergencyFundValue = tierTotals.T0 + tierTotals.T1;
  const emergencyFundMonths = monthlyExpenses > 0 ? +(emergencyFundValue / monthlyExpenses).toFixed(1) : 0;

  // Shortfall: target 6 months emergency fund
  const targetEmergencyMonths = portConfig?.targetEmergencyMonths || 6;
  const shortfall = monthlyExpenses > 0
    ? +(Math.max(0, (targetEmergencyMonths * monthlyExpenses) - emergencyFundValue)).toFixed(2)
    : 0;

  // Liquidity score (0-100)
  let liquidityScore = 50;
  if (monthlyExpenses > 0) {
    // Emergency fund coverage (up to 40 points)
    liquidityScore = clamp(mapRange(emergencyFundMonths, 0, 12, 0, 40), 0, 40);
    // Liquid portfolio ratio (up to 30 points)
    const liquidRatio = (totalLiquid / totalValue) * 100;
    liquidityScore += clamp(mapRange(liquidRatio, 0, 80, 0, 30), 0, 30);
    // T0 availability (up to 30 points)
    const t0Months = tierTotals.T0 / monthlyExpenses;
    liquidityScore += clamp(mapRange(t0Months, 0, 3, 0, 30), 0, 30);
  } else {
    // Without expense data, score on liquid ratio only
    const liquidRatio = (totalLiquid / totalValue) * 100;
    liquidityScore = clamp(mapRange(liquidRatio, 0, 80, 0, 100), 0, 100);
  }
  liquidityScore = clamp(+liquidityScore.toFixed(0), 0, 100);

  // Implication
  let implication;
  if (emergencyFundMonths >= 6) {
    implication = `Emergency fund covers ${emergencyFundMonths} months — well above minimum. Excess cash could be deployed.`;
  } else if (emergencyFundMonths >= 3) {
    implication = `Emergency fund covers ${emergencyFundMonths} months — adequate but below the 6-month target.`;
  } else if (emergencyFundMonths > 0) {
    implication = `Emergency fund only covers ${emergencyFundMonths} months — prioritise building cash reserves.`;
  } else if (monthlyExpenses > 0) {
    implication = 'No emergency fund detected — critical gap. Build T0/T1 reserves immediately.';
  } else {
    implication = 'Unable to assess emergency coverage without monthly expense data.';
  }

  return {
    tiers,
    totalLiquid,
    totalIlliquid: +(tierTotals.T3).toFixed(2),
    emergencyFundMonths,
    liquidityScore,
    shortfall,
    totalValue: +totalValue.toFixed(2),
    implication,
  };
}
