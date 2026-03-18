import { computeBonusAllocationState } from '../../lib/engines/bonus-allocation.js';

const SAMPLE_BONUS = {
  amount: 20000,
  taxRate: 40,
  horizonYears: 5,
};

const SAMPLE_ENGINE_STATE = {
  isaRemaining: 20000,
  pensionRemaining: 40000,
  totalDebt: 5000,
  highestDebtAPR: 18,
  emergencyFundMonths: 3,
};

describe('computeBonusAllocationState', () => {
  test('returns null for null/undefined bonusConfig', () => {
    expect(computeBonusAllocationState(null)).toBeNull();
    expect(computeBonusAllocationState(undefined)).toBeNull();
  });

  test('returns null for zero or negative amount', () => {
    expect(computeBonusAllocationState({ amount: 0 })).toBeNull();
    expect(computeBonusAllocationState({ amount: -1000 })).toBeNull();
  });

  test('returns complete state for valid inputs', () => {
    const result = computeBonusAllocationState(SAMPLE_BONUS, null, SAMPLE_ENGINE_STATE);
    expect(result).not.toBeNull();
    expect(result.bonusAmount).toBe(20000);
    expect(typeof result.afterTax).toBe('number');
    expect(result.taxRate).toBe(40);
    expect(result.scenarios).toBeDefined();
    expect(Array.isArray(result.scenarios)).toBe(true);
    expect(result.scenarios.length).toBeGreaterThan(0);
    expect(result.recommended).toBeTruthy();
    expect(result.taxOptimalSplit).toBeDefined();
    expect(result.implication).toBeTruthy();
  });

  test('after-tax computed correctly', () => {
    const result = computeBonusAllocationState(SAMPLE_BONUS, null, SAMPLE_ENGINE_STATE);
    expect(result.afterTax).toBe(12000); // 20000 * (1 - 0.40)
  });

  test('scenarios sorted by totalEV descending', () => {
    const result = computeBonusAllocationState(SAMPLE_BONUS, null, SAMPLE_ENGINE_STATE);
    for (let i = 1; i < result.scenarios.length; i++) {
      expect(result.scenarios[i - 1].totalEV).toBeGreaterThanOrEqual(result.scenarios[i].totalEV);
    }
  });

  test('each scenario has required fields', () => {
    const result = computeBonusAllocationState(SAMPLE_BONUS, null, SAMPLE_ENGINE_STATE);
    result.scenarios.forEach(s => {
      expect(s.name).toBeTruthy();
      expect(s.allocation).toBeDefined();
      expect(Array.isArray(s.allocation)).toBe(true);
      expect(typeof s.totalEV).toBe('number');
      expect(typeof s.totalTaxSaving).toBe('number');
    });
  });

  test('recommended is the scenario with highest EV', () => {
    const result = computeBonusAllocationState(SAMPLE_BONUS, null, SAMPLE_ENGINE_STATE);
    expect(result.recommended).toBe(result.scenarios[0].name);
  });

  test('tax optimal split includes pension and ISA', () => {
    const result = computeBonusAllocationState(SAMPLE_BONUS, null, SAMPLE_ENGINE_STATE);
    expect(typeof result.taxOptimalSplit.pension).toBe('number');
    expect(typeof result.taxOptimalSplit.isa).toBe('number');
    expect(typeof result.taxOptimalSplit.pensionTaxRelief).toBe('number');
  });

  test('works without engine state (uses defaults)', () => {
    const result = computeBonusAllocationState(SAMPLE_BONUS);
    expect(result).not.toBeNull();
    expect(result.isaHeadroom).toBe(20000);
    expect(result.pensionHeadroom).toBe(40000);
  });

  test('custom scenarios override defaults', () => {
    const customScenarios = [
      { name: 'All ISA', allocation: [{ bucket: 'isa', amount: 12000 }] },
    ];
    const result = computeBonusAllocationState(SAMPLE_BONUS, customScenarios, SAMPLE_ENGINE_STATE);
    expect(result.scenarios.length).toBe(1);
    expect(result.scenarios[0].name).toBe('All ISA');
  });

  test('is deterministic', () => {
    const a = computeBonusAllocationState(SAMPLE_BONUS, null, SAMPLE_ENGINE_STATE);
    const b = computeBonusAllocationState(SAMPLE_BONUS, null, SAMPLE_ENGINE_STATE);
    expect(a.recommended).toBe(b.recommended);
    expect(a.afterTax).toBe(b.afterTax);
  });
});
