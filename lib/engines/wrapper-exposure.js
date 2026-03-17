// =========================================================================
// LIFESTACK OS — WRAPPER EXPOSURE ENGINE
// Phase 2: Finance Operating System
// Analyses tax wrapper efficiency (GIA/ISA/SIPP/Pension) and identifies
// structural alpha opportunities from wrapper optimisation
// =========================================================================

/**
 * Default wrapper classification from holding names/types
 * In production, wrapper info comes from broker/account metadata
 */
export function inferWrapper(holding) {
  if (!holding) return 'GIA';
  if (holding.wrapper) return holding.wrapper;
  const name = (holding.name || '').toLowerCase();
  if (name.includes('pension') || name.includes('daiwa')) return 'Pension';
  if (name.includes('isa')) return 'ISA';
  if (name.includes('sipp')) return 'SIPP';
  return 'GIA';
}

/**
 * Segment holdings by tax wrapper
 */
export function segmentByWrapper(holdings) {
  if (!holdings?.length) return {};
  const wrappers = {};
  const total = holdings.reduce((s, h) => s + h.val, 0);

  holdings.forEach(h => {
    const w = inferWrapper(h);
    if (!wrappers[w]) {
      wrappers[w] = { name: w, value: 0, count: 0, holdings: [], weight: 0 };
    }
    wrappers[w].value += h.val;
    wrappers[w].count += 1;
    wrappers[w].holdings.push({ name: h.name, value: h.val, cls: h.cls });
  });

  Object.values(wrappers).forEach(w => {
    w.weight = total > 0 ? +((w.value / total) * 100).toFixed(1) : 0;
  });

  return wrappers;
}

/**
 * Estimate annual CGT drag for GIA holdings
 * Assumes average turnover and applies current CGT rates
 */
export function estimateCGTDrag(giaHoldings, annualTurnover = 0.15, cgtRate = 0.20, cgtAllowance = 3000) {
  if (!giaHoldings?.length) return { annualDrag: 0, effectiveRate: 0 };

  const totalGIA = giaHoldings.reduce((s, h) => s + h.value, 0);
  // Assume average gain of 8% on turned-over portion
  const estimatedGains = totalGIA * annualTurnover * 0.08;
  const taxableGains = Math.max(0, estimatedGains - cgtAllowance);
  const annualDrag = +(taxableGains * cgtRate).toFixed(2);
  const effectiveRate = totalGIA > 0 ? +((annualDrag / totalGIA) * 100).toFixed(3) : 0;

  return { annualDrag, effectiveRate, taxableGains: +taxableGains.toFixed(2), estimatedGains: +estimatedGains.toFixed(2) };
}

/**
 * Score wrapper efficiency (0-10)
 * Higher ISA/SIPP weight = more efficient
 */
export function computeWrapperEfficiency(wrapperSegments) {
  const total = Object.values(wrapperSegments).reduce((s, w) => s + w.value, 0);
  if (total <= 0) return { score: 0, breakdown: {} };

  const isaWeight = (wrapperSegments['ISA']?.value || 0) / total;
  const sippWeight = (wrapperSegments['SIPP']?.value || 0) / total;
  const pensionWeight = (wrapperSegments['Pension']?.value || 0) / total;
  const giaWeight = (wrapperSegments['GIA']?.value || 0) / total;

  // Tax-efficient = ISA + SIPP + Pension; GIA = tax drag
  const taxEfficientPct = (isaWeight + sippWeight + pensionWeight) * 100;

  // Score: 10 = 100% in wrappers, 0 = 100% in GIA
  const score = +(taxEfficientPct / 10).toFixed(1);

  return {
    score: Math.min(10, score),
    taxEfficientPct: +taxEfficientPct.toFixed(1),
    giaExposurePct: +(giaWeight * 100).toFixed(1),
    breakdown: {
      ISA: +(isaWeight * 100).toFixed(1),
      SIPP: +(sippWeight * 100).toFixed(1),
      Pension: +(pensionWeight * 100).toFixed(1),
      GIA: +(giaWeight * 100).toFixed(1),
    },
  };
}

/**
 * Identify reallocation opportunities — GIA holdings that could move to ISA/SIPP
 */
export function identifyReallocationOpps(wrapperSegments, isaAllowanceRemaining = 20000, cgtAllowance = 3000) {
  const giaHoldings = wrapperSegments['GIA']?.holdings || [];
  if (!giaHoldings.length) return [];

  // Sort GIA holdings by value — prioritize high-value, high-growth holdings for ISA
  const sorted = [...giaHoldings].sort((a, b) => b.value - a.value);
  let isaRemaining = isaAllowanceRemaining;

  return sorted
    .filter(h => h.value > 100) // skip dust positions
    .map(h => {
      const transferAmount = Math.min(h.value, isaRemaining);
      const annualBenefit = +(transferAmount * 0.08 * 0.20).toFixed(2); // 8% return × 20% CGT saved
      if (transferAmount > 0) isaRemaining -= transferAmount;

      return {
        name: h.name,
        currentWrapper: 'GIA',
        suggestedWrapper: 'ISA',
        value: h.value,
        transferAmount,
        annualTaxBenefit: annualBenefit,
        effort: transferAmount > 5000 ? 'Medium' : 'Low',
        feasible: transferAmount > 0,
      };
    })
    .filter(o => o.feasible);
}

/**
 * Master function: compute full wrapper exposure state
 */
export function computeWrapperExposureState(holdings, isaAllowanceRemaining = 20000) {
  if (!holdings?.length) return null;

  const total = holdings.reduce((s, h) => s + h.val, 0);
  const segments = segmentByWrapper(holdings);
  const efficiency = computeWrapperEfficiency(segments);
  const giaHoldings = segments['GIA']?.holdings || [];
  const cgtDrag = estimateCGTDrag(giaHoldings);
  const reallocationOpps = identifyReallocationOpps(segments, isaAllowanceRemaining);
  const totalBenefitFromReallocation = reallocationOpps.reduce((s, o) => s + o.annualTaxBenefit, 0);

  return {
    totalValue: total,
    wrappers: Object.values(segments).map(w => ({
      name: w.name,
      value: w.value,
      weight: w.weight,
      count: w.count,
    })),
    efficiency,
    cgtDrag,
    reallocationOpportunities: reallocationOpps.slice(0, 10), // top 10
    totalAnnualBenefitFromReallocation: +totalBenefitFromReallocation.toFixed(2),
    structuralAlphaOpportunity: `£${totalBenefitFromReallocation.toFixed(0)}/yr from wrapper optimisation`,
  };
}
