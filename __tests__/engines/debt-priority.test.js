import {
  computeDebtPriorityState,
  buildDebtLedger,
  rankDebtByAPR,
  calculateGuaranteedAlpha,
  estimateInterestCost,
  monthsToPayoff,
  recommendPaydownPriority,
} from '../../lib/engines/debt-priority.js';
import { DEFAULT_PORT } from '../../lib/defaults.js';

// ---- buildDebtLedger ----
describe('buildDebtLedger', () => {
  test('returns empty array for null input', () => {
    expect(buildDebtLedger(null)).toEqual([]);
  });

  test('builds correct ledger from default portfolio', () => {
    const ledger = buildDebtLedger(DEFAULT_PORT);
    expect(ledger.length).toBe(2); // Amex + Monzo Flex
    expect(ledger[0].name).toBe('Amex Credit Card');
    expect(ledger[0].balance).toBe(DEFAULT_PORT.amexDebt);
    expect(ledger[0].apr).toBe(22.9);
    expect(ledger[1].name).toBe('Monzo Flex');
    expect(ledger[1].apr).toBe(0);
  });

  test('returns empty if no debts', () => {
    const noDebt = { amexDebt: 0, monzoFlex: 0 };
    expect(buildDebtLedger(noDebt)).toEqual([]);
  });

  test('handles partial debts (only amex)', () => {
    const partial = { amexDebt: 5000, monzoFlex: 0 };
    const ledger = buildDebtLedger(partial);
    expect(ledger.length).toBe(1);
    expect(ledger[0].name).toBe('Amex Credit Card');
  });
});

// ---- rankDebtByAPR ----
describe('rankDebtByAPR', () => {
  test('returns empty array for null/empty input', () => {
    expect(rankDebtByAPR(null)).toEqual([]);
    expect(rankDebtByAPR([])).toEqual([]);
  });

  test('ranks highest APR first', () => {
    const debts = [
      { name: 'Low', balance: 5000, apr: 5, minPayment: 100 },
      { name: 'High', balance: 3000, apr: 25, minPayment: 60 },
    ];
    const ranked = rankDebtByAPR(debts);
    expect(ranked[0].name).toBe('High');
    expect(ranked[0].priorityOrder).toBe(1);
    expect(ranked[1].priorityOrder).toBe(2);
  });

  test('computes monthly and annual interest correctly', () => {
    const debts = [{ name: 'Test', balance: 12000, apr: 24, minPayment: 240 }];
    const ranked = rankDebtByAPR(debts);
    expect(ranked[0].monthlyInterest).toBe(240);
    expect(ranked[0].annualInterest).toBe(2880);
  });
});

// ---- calculateGuaranteedAlpha ----
describe('calculateGuaranteedAlpha', () => {
  test('returns positive alpha when APR exceeds expected return', () => {
    expect(calculateGuaranteedAlpha(22.9, 8.0)).toBe(14.9);
  });

  test('returns negative alpha when APR is below expected return', () => {
    expect(calculateGuaranteedAlpha(3.0, 8.0)).toBe(-5.0);
  });

  test('returns zero when APR equals expected return', () => {
    expect(calculateGuaranteedAlpha(8.0, 8.0)).toBe(0);
  });
});

// ---- estimateInterestCost ----
describe('estimateInterestCost', () => {
  test('returns 0 for zero APR', () => {
    expect(estimateInterestCost(5000, 0, 12)).toBe(0);
  });

  test('returns positive cost for non-zero APR and balance', () => {
    const cost = estimateInterestCost(10000, 22.9, 12);
    expect(cost).toBeGreaterThan(0);
    // Should be roughly in the ballpark of annual interest
    expect(cost).toBeLessThan(10000 * 0.229 * 1.5); // upper bound
  });

  test('longer duration produces higher interest cost', () => {
    const cost12 = estimateInterestCost(10000, 22.9, 12);
    const cost24 = estimateInterestCost(10000, 22.9, 24);
    expect(cost24).toBeGreaterThan(cost12);
  });
});

// ---- monthsToPayoff ----
describe('monthsToPayoff', () => {
  test('returns 0 for zero balance', () => {
    expect(monthsToPayoff(0, 22.9, 500)).toBe(0);
  });

  test('returns Infinity for zero payment', () => {
    expect(monthsToPayoff(10000, 22.9, 0)).toBe(Infinity);
  });

  test('returns Infinity if payment is less than monthly interest', () => {
    // monthly interest on 10000 at 24% = 200
    expect(monthsToPayoff(10000, 24, 100)).toBe(Infinity);
  });

  test('computes correct months for 0% APR', () => {
    expect(monthsToPayoff(6000, 0, 500)).toBe(12);
  });

  test('returns finite value for reasonable payment amounts', () => {
    const months = monthsToPayoff(10000, 22.9, 1000);
    expect(months).toBeGreaterThan(0);
    expect(months).toBeLessThan(360);
    expect(Number.isFinite(months)).toBe(true);
  });
});

// ---- recommendPaydownPriority ----
describe('recommendPaydownPriority', () => {
  test('returns empty actions for null/empty debts', () => {
    const result = recommendPaydownPriority(null);
    expect(result.actions).toEqual([]);
    expect(result.totalDebt).toBe(0);
  });

  test('recommends paying high-APR debt first', () => {
    const debts = buildDebtLedger(DEFAULT_PORT);
    const result = recommendPaydownPriority(debts, 15000);
    expect(result.highestPriorityTarget).toBe('Amex Credit Card');
    expect(result.highestAPR).toBe(22.9);
    expect(result.recommendation).toContain('Pay');
  });

  test('allocates cash to highest APR debt first', () => {
    const debts = buildDebtLedger(DEFAULT_PORT);
    const result = recommendPaydownPriority(debts, 8000);
    const amexAction = result.actions.find(a => a.name === 'Amex Credit Card');
    expect(amexAction.suggestedPaydown).toBe(8000);
  });
});

// ---- computeDebtPriorityState (master function) ----
describe('computeDebtPriorityState', () => {
  test('returns null-safe result for null input', () => {
    const result = computeDebtPriorityState(null);
    expect(result.debtFree).toBe(true);
    expect(result.totalDebt).toBe(0);
  });

  test('returns complete state for default portfolio', () => {
    const state = computeDebtPriorityState(DEFAULT_PORT);
    expect(state.debtFree).toBe(false);
    expect(state.totalDebt).toBeGreaterThan(0);
    expect(state.actions.length).toBe(2);
    expect(state.debtToNetWorthRatio).toBeGreaterThan(0);
    expect(state.debtToIncomeRatio).toBeGreaterThan(0);
    expect(state.recommendation).toBeTruthy();
  });

  test('is deterministic', () => {
    const a = computeDebtPriorityState(DEFAULT_PORT);
    const b = computeDebtPriorityState(DEFAULT_PORT);
    expect(a.totalDebt).toBe(b.totalDebt);
    expect(a.highestAPR).toBe(b.highestAPR);
    expect(a.debtToNetWorthRatio).toBe(b.debtToNetWorthRatio);
  });

  test('reports debt-free for portfolio with no debts', () => {
    const noDebt = { ...DEFAULT_PORT, amexDebt: 0, monzoFlex: 0 };
    const state = computeDebtPriorityState(noDebt);
    expect(state.debtFree).toBe(true);
    expect(state.recommendation).toContain('Debt-free');
  });
});
