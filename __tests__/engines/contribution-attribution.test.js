import { computeContributionState } from '../../lib/engines/contribution-attribution.js';

const SAMPLE_HOLDINGS = [
  { ticker: 'VWRL', name: 'Vanguard All-World', value: 50000, returnYTD: 12 },
  { ticker: 'VUSA', name: 'Vanguard S&P 500', value: 30000, returnYTD: 15 },
  { ticker: 'VAGP', name: 'Vanguard Global Agg', value: 10000, returnYTD: -3 },
  { ticker: 'CSH2', name: 'Cash Fund', value: 10000, returnYTD: 0 },
];

const SAMPLE_MONTHLY = [
  { month: 'Jan', portfolioReturn: 2.5, benchmark: 2.0 },
  { month: 'Feb', portfolioReturn: -1.0, benchmark: -0.5 },
  { month: 'Mar', portfolioReturn: 3.0, benchmark: 2.8 },
];

describe('computeContributionState', () => {
  test('returns null for null/undefined/empty holdings', () => {
    expect(computeContributionState(null)).toBeNull();
    expect(computeContributionState(undefined)).toBeNull();
    expect(computeContributionState([])).toBeNull();
  });

  test('returns null for zero total value', () => {
    const result = computeContributionState([{ ticker: 'X', value: 0 }]);
    expect(result).toBeNull();
  });

  test('returns complete state for valid holdings', () => {
    const result = computeContributionState(SAMPLE_HOLDINGS, SAMPLE_MONTHLY);
    expect(result).not.toBeNull();
    expect(result.totalReturn).toBeDefined();
    expect(result.contributors).toBeDefined();
    expect(result.detractors).toBeDefined();
    expect(result.flat).toBeDefined();
    expect(result.topContributor).toBeDefined();
    expect(result.worstDetractor).toBeDefined();
    expect(result.concentrationOfReturns).toBeDefined();
    expect(result.contributorCount).toBeDefined();
    expect(result.detractorCount).toBeDefined();
    expect(result.monthlyAttribution).toBeDefined();
    expect(result.implication).toBeTruthy();
  });

  test('contributors have positive contribution', () => {
    const result = computeContributionState(SAMPLE_HOLDINGS);
    result.contributors.forEach(c => {
      expect(c.contribution).toBeGreaterThan(0);
    });
  });

  test('detractors have negative contribution', () => {
    const result = computeContributionState(SAMPLE_HOLDINGS);
    result.detractors.forEach(d => {
      expect(d.contribution).toBeLessThan(0);
    });
  });

  test('top contributor is the largest positive contributor', () => {
    const result = computeContributionState(SAMPLE_HOLDINGS);
    expect(result.topContributor).not.toBeNull();
    result.contributors.forEach(c => {
      expect(result.topContributor.contribution).toBeGreaterThanOrEqual(c.contribution);
    });
  });

  test('concentration of returns in 0-100 range', () => {
    const result = computeContributionState(SAMPLE_HOLDINGS);
    expect(result.concentrationOfReturns).toBeGreaterThanOrEqual(0);
    expect(result.concentrationOfReturns).toBeLessThanOrEqual(100);
  });

  test('monthly attribution includes alpha computation', () => {
    const result = computeContributionState(SAMPLE_HOLDINGS, SAMPLE_MONTHLY);
    expect(result.monthlyAttribution.length).toBe(3);
    result.monthlyAttribution.forEach(m => {
      expect(m.month).toBeTruthy();
      expect(typeof m.portfolioReturn).toBe('number');
      expect(typeof m.alpha).toBe('number');
    });
  });

  test('handles holdings with zero returns', () => {
    const holdings = [
      { ticker: 'CSH2', name: 'Cash', value: 10000, returnYTD: 0 },
    ];
    const result = computeContributionState(holdings);
    expect(result.flat.length).toBe(1);
    expect(result.contributorCount).toBe(0);
    expect(result.detractorCount).toBe(0);
  });

  test('handles empty monthly returns', () => {
    const result = computeContributionState(SAMPLE_HOLDINGS, []);
    expect(result.monthlyAttribution.length).toBe(0);
  });

  test('is deterministic', () => {
    const a = computeContributionState(SAMPLE_HOLDINGS, SAMPLE_MONTHLY);
    const b = computeContributionState(SAMPLE_HOLDINGS, SAMPLE_MONTHLY);
    expect(a.totalReturn).toBe(b.totalReturn);
    expect(a.concentrationOfReturns).toBe(b.concentrationOfReturns);
  });
});
