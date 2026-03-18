import {
  computeISAPensionRoutingState,
  daysUntilDeadline,
  calculateISAHeadroom,
  calculatePensionHeadroom,
  calculateSalarySacrificeValue,
  recommendDeployment,
} from '../../lib/engines/isa-pension-routing.js';
import { DEFAULT_PORT } from '../../lib/defaults.js';

// ---- daysUntilDeadline ----
describe('daysUntilDeadline', () => {
  test('returns positive number for dates before April 5', () => {
    const jan1 = new Date(2026, 0, 1);
    const days = daysUntilDeadline(jan1);
    expect(days).toBeGreaterThan(0);
    expect(days).toBeLessThanOrEqual(365);
  });

  test('returns 0 on April 5', () => {
    const apr5 = new Date(2026, 3, 5);
    expect(daysUntilDeadline(apr5)).toBe(0);
  });

  test('returns days to next year deadline after April 5', () => {
    const apr6 = new Date(2026, 3, 6);
    const days = daysUntilDeadline(apr6);
    expect(days).toBeGreaterThan(300); // should be ~364 days
  });

  test('handles edge case at March 31', () => {
    const mar31 = new Date(2026, 2, 31);
    const days = daysUntilDeadline(mar31);
    expect(days).toBe(5); // 5 days until April 5
  });
});

// ---- calculateISAHeadroom ----
describe('calculateISAHeadroom', () => {
  test('full allowance when nothing used', () => {
    const result = calculateISAHeadroom(0);
    expect(result.remaining).toBe(20000);
    expect(result.utilisation).toBe(0);
  });

  test('zero remaining when fully used', () => {
    const result = calculateISAHeadroom(20000);
    expect(result.remaining).toBe(0);
    expect(result.utilisation).toBe(100);
  });

  test('partial usage', () => {
    const result = calculateISAHeadroom(12000);
    expect(result.remaining).toBe(8000);
    expect(result.used).toBe(12000);
    expect(result.utilisation).toBe(60);
  });

  test('does not go negative if over-subscribed', () => {
    const result = calculateISAHeadroom(25000);
    expect(result.remaining).toBe(0);
  });
});

// ---- calculatePensionHeadroom ----
describe('calculatePensionHeadroom', () => {
  test('full allowance when no contributions', () => {
    const result = calculatePensionHeadroom(0, 0);
    expect(result.remaining).toBe(60000);
  });

  test('accounts for employer contributions', () => {
    const result = calculatePensionHeadroom(10000, 5000);
    expect(result.totalContributed).toBe(15000);
    expect(result.remaining).toBe(45000);
  });

  test('does not go negative', () => {
    const result = calculatePensionHeadroom(50000, 20000);
    expect(result.remaining).toBe(0);
  });
});

// ---- calculateSalarySacrificeValue ----
describe('calculateSalarySacrificeValue', () => {
  test('returns zero for zero inputs', () => {
    const result = calculateSalarySacrificeValue(0, 5000);
    expect(result.totalSaving).toBe(0);
  });

  test('returns zero for zero contribution', () => {
    const result = calculateSalarySacrificeValue(170000, 0);
    expect(result.totalSaving).toBe(0);
  });

  test('detects taper zone (£100-125k) and applies 60% rate', () => {
    const result = calculateSalarySacrificeValue(110000, 10000, 0.45, 0.02);
    expect(result.inTaperZone).toBe(true);
    expect(result.taxSaving).toBe(6000); // 10000 * 0.60
    expect(result.niSaving).toBe(200);   // 10000 * 0.02
    expect(result.totalSaving).toBe(6200);
  });

  test('applies standard rates outside taper zone', () => {
    const result = calculateSalarySacrificeValue(170000, 10000, 0.45, 0.02);
    expect(result.inTaperZone).toBe(false);
    expect(result.taxSaving).toBe(4500); // 10000 * 0.45
    expect(result.niSaving).toBe(200);   // 10000 * 0.02
  });

  test('effective rate is calculated correctly', () => {
    const result = calculateSalarySacrificeValue(170000, 10000, 0.45, 0.02);
    expect(result.effectiveRate).toBe(47.0); // (4500+200)/10000 * 100
  });
});

// ---- recommendDeployment ----
describe('recommendDeployment', () => {
  test('generates ISA recommendation when headroom exists', () => {
    const isa = { remaining: 20000 };
    const pension = { remaining: 40000 };
    const salSac = { totalSaving: 5000, inTaperZone: false };
    const recs = recommendDeployment(25000, isa, pension, salSac, 25);
    const isaRec = recs.find(r => r.action === 'Fund ISA');
    expect(isaRec).toBeDefined();
    expect(isaRec.urgency).toBe('URGENT'); // 25 days left
    expect(isaRec.amount).toBe(20000);
  });

  test('no ISA recommendation when no cash or headroom', () => {
    const isa = { remaining: 0 };
    const pension = { remaining: 40000 };
    const salSac = { totalSaving: 0, inTaperZone: false };
    const recs = recommendDeployment(0, isa, pension, salSac, 200);
    expect(recs.find(r => r.action === 'Fund ISA')).toBeUndefined();
  });

  test('salary sacrifice gets high priority in taper zone', () => {
    const isa = { remaining: 20000 };
    const pension = { remaining: 40000 };
    const salSac = { totalSaving: 6000, inTaperZone: true };
    const recs = recommendDeployment(30000, isa, pension, salSac, 200);
    const ssRec = recs.find(r => r.action === 'Salary Sacrifice');
    expect(ssRec).toBeDefined();
    expect(ssRec.priority).toBe(1);
  });
});

// ---- computeISAPensionRoutingState (master function) ----
describe('computeISAPensionRoutingState', () => {
  test('returns null for null input', () => {
    expect(computeISAPensionRoutingState(null)).toBeNull();
  });

  test('returns complete state for default portfolio', () => {
    const state = computeISAPensionRoutingState(DEFAULT_PORT);
    expect(state).not.toBeNull();
    expect(state.daysUntilTaxYearEnd).toBeGreaterThanOrEqual(0);
    expect(state.isaHeadroom).toBeDefined();
    expect(state.isaHeadroom.remaining).toBe(20000);
    expect(state.pensionHeadroom).toBeDefined();
    expect(state.salarySacrificeValue).toBeDefined();
    expect(state.recommendations).toBeDefined();
    expect(state.urgencyFlags).toBeDefined();
  });

  test('is deterministic for same date inputs', () => {
    const a = computeISAPensionRoutingState(DEFAULT_PORT);
    const b = computeISAPensionRoutingState(DEFAULT_PORT);
    expect(a.isaHeadroom.remaining).toBe(b.isaHeadroom.remaining);
    expect(a.pensionHeadroom.remaining).toBe(b.pensionHeadroom.remaining);
    expect(a.salarySacrificeValue.totalSaving).toBe(b.salarySacrificeValue.totalSaving);
  });

  test('partial ISA usage reduces headroom', () => {
    const state = computeISAPensionRoutingState(DEFAULT_PORT, 10000);
    expect(state.isaHeadroom.remaining).toBe(10000);
    expect(state.isaHeadroom.used).toBe(10000);
  });
});
