import { generatePolicyNote } from '../../../lib/engines/agents/policy-note.js';

const MOCK_HAWKISH_EVENT = {
  type: 'FOMC Rate Decision',
  decision: 'hike 25bp',
  expected: 'hold',
  surprise: true,
  statement: 'Inflation concerns persist, further tightening may be needed',
};

const MOCK_DOVISH_EVENT = {
  type: 'BoE Rate Decision',
  decision: 'cut 25bp',
  expected: 'cut 25bp',
  surprise: false,
};

const MOCK_MARKET = {
  stress: { compositeScore: 45, compositeLevel: 'Normal' },
  regime: { regime: 'Expansion' },
};

const MOCK_HOLDINGS = [
  { ticker: 'VWRL', name: 'Equity', value: 50000, weight: 50 },
  { ticker: 'VAGP', name: 'Bonds', value: 30000, weight: 30 },
];

describe('generatePolicyNote', () => {
  test('returns null for null/undefined policyEvent', () => {
    expect(generatePolicyNote(null)).toBeNull();
    expect(generatePolicyNote(undefined)).toBeNull();
  });

  test('returns complete state for valid event', () => {
    const result = generatePolicyNote(MOCK_HAWKISH_EVENT, MOCK_MARKET, MOCK_HOLDINGS);
    expect(result).not.toBeNull();
    expect(result.event).toBeDefined();
    expect(result.date).toBeTruthy();
    expect(result.type).toBeTruthy();
    expect(result.surprise).toBeDefined();
    expect(result.marketImplications).toBeDefined();
    expect(Array.isArray(result.marketImplications)).toBe(true);
    expect(result.portfolioImpact).toBeTruthy();
    expect(result.actionItems).toBeDefined();
    expect(result.note).toBeTruthy();
  });

  test('classifies rate decision correctly', () => {
    const result = generatePolicyNote(MOCK_HAWKISH_EVENT, MOCK_MARKET, MOCK_HOLDINGS);
    expect(result.event.category).toBe('Interest Rate Decision');
    expect(result.event.significance).toBe('High');
  });

  test('detects surprise correctly', () => {
    const hawkish = generatePolicyNote(MOCK_HAWKISH_EVENT, MOCK_MARKET, MOCK_HOLDINGS);
    expect(hawkish.surprise.isSurprise).toBe(true);

    const dovish = generatePolicyNote(MOCK_DOVISH_EVENT, MOCK_MARKET, MOCK_HOLDINGS);
    expect(dovish.surprise.isSurprise).toBe(false);
  });

  test('hawkish event produces negative equity implication', () => {
    const result = generatePolicyNote(MOCK_HAWKISH_EVENT, MOCK_MARKET, MOCK_HOLDINGS);
    const equityImpl = result.marketImplications.find(i => i.area === 'Equities');
    expect(equityImpl).toBeDefined();
    expect(equityImpl.direction).toBe('Negative');
  });

  test('dovish event produces positive equity implication', () => {
    const result = generatePolicyNote(MOCK_DOVISH_EVENT, MOCK_MARKET, MOCK_HOLDINGS);
    const equityImpl = result.marketImplications.find(i => i.area === 'Equities');
    expect(equityImpl).toBeDefined();
    expect(equityImpl.direction).toBe('Positive');
  });

  test('action items generated for hawkish event', () => {
    const result = generatePolicyNote(MOCK_HAWKISH_EVENT, MOCK_MARKET, MOCK_HOLDINGS);
    expect(result.actionItems.length).toBeGreaterThan(0);
    expect(result.actionItems.some(a => a.priority === 'High')).toBe(true);
  });

  test('fiscal event triggers tax review action', () => {
    const fiscal = { type: 'UK Budget', decision: 'CGT increase' };
    const result = generatePolicyNote(fiscal, MOCK_MARKET, MOCK_HOLDINGS);
    expect(result.actionItems.some(a => a.action.includes('ISA/pension'))).toBe(true);
  });

  test('works without holdings', () => {
    const result = generatePolicyNote(MOCK_HAWKISH_EVENT, MOCK_MARKET);
    expect(result).not.toBeNull();
    expect(result.portfolioImpact).toContain('No holdings data');
  });

  test('is deterministic', () => {
    const a = generatePolicyNote(MOCK_HAWKISH_EVENT, MOCK_MARKET, MOCK_HOLDINGS);
    const b = generatePolicyNote(MOCK_HAWKISH_EVENT, MOCK_MARKET, MOCK_HOLDINGS);
    expect(a.surprise.isSurprise).toBe(b.surprise.isSurprise);
    expect(a.event.category).toBe(b.event.category);
  });
});
