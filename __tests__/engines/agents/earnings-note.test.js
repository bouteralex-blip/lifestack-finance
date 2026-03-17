import { generateEarningsNote } from '../../../lib/engines/agents/earnings-note.js';

const MOCK_EARNINGS_BEAT = {
  ticker: 'NVDA',
  epsActual: 5.16,
  epsEstimate: 4.60,
  revenueActual: 22.1e9,
  revenueEstimate: 20.6e9,
  guidance: 'raised',
};

const MOCK_EARNINGS_MISS = {
  ticker: 'XYZ',
  epsActual: 1.50,
  epsEstimate: 2.00,
  revenueActual: 5e9,
  revenueEstimate: 6e9,
  guidance: 'lowered',
};

const MOCK_HOLDINGS = [
  { ticker: 'NVDA', name: 'NVIDIA', value: 5000, weight: 8 },
  { ticker: 'VWRL', name: 'All World', value: 50000, weight: 50 },
];

describe('generateEarningsNote', () => {
  test('returns null for null/undefined earningsData', () => {
    expect(generateEarningsNote(null)).toBeNull();
    expect(generateEarningsNote(undefined)).toBeNull();
  });

  test('returns null for earningsData without ticker', () => {
    expect(generateEarningsNote({ epsActual: 5 })).toBeNull();
  });

  test('returns complete state for beat', () => {
    const result = generateEarningsNote(MOCK_EARNINGS_BEAT, MOCK_HOLDINGS);
    expect(result).not.toBeNull();
    expect(result.ticker).toBe('NVDA');
    expect(result.beat).toBe(true);
    expect(result.epsBeat).toBe(true);
    expect(result.revBeat).toBe(true);
    expect(typeof result.epsSurprise).toBe('number');
    expect(typeof result.revSurprise).toBe('number');
    expect(result.surprise).toBeDefined();
    expect(result.guidanceSignal).toBeDefined();
    expect(result.portfolioImpact).toBeDefined();
    expect(result.recommendation).toBeTruthy();
    expect(result.note).toBeTruthy();
  });

  test('correctly identifies a miss', () => {
    const result = generateEarningsNote(MOCK_EARNINGS_MISS, MOCK_HOLDINGS);
    expect(result.beat).toBe(false);
    expect(result.epsBeat).toBe(false);
    expect(result.revBeat).toBe(false);
    expect(result.surprise.direction).toBe('negative');
  });

  test('guidance signal detected for raised guidance', () => {
    const result = generateEarningsNote(MOCK_EARNINGS_BEAT, MOCK_HOLDINGS);
    expect(result.guidanceSignal.signal).toBe('Raised');
    expect(result.guidanceSignal.impact).toBe('Positive');
  });

  test('guidance signal detected for lowered guidance', () => {
    const result = generateEarningsNote(MOCK_EARNINGS_MISS, MOCK_HOLDINGS);
    expect(result.guidanceSignal.signal).toBe('Lowered');
    expect(result.guidanceSignal.impact).toBe('Negative');
  });

  test('portfolio impact detects held position', () => {
    const result = generateEarningsNote(MOCK_EARNINGS_BEAT, MOCK_HOLDINGS);
    expect(result.portfolioImpact.held).toBe(true);
    expect(result.portfolioImpact.weight).toBeGreaterThan(0);
  });

  test('portfolio impact detects non-held position', () => {
    const result = generateEarningsNote(MOCK_EARNINGS_MISS, MOCK_HOLDINGS);
    expect(result.portfolioImpact.held).toBe(false);
  });

  test('beat with raised guidance recommends HOLD/ADD', () => {
    const result = generateEarningsNote(MOCK_EARNINGS_BEAT, MOCK_HOLDINGS);
    expect(result.recommendation).toContain('HOLD/ADD');
  });

  test('miss with lowered guidance recommends REVIEW/TRIM', () => {
    const result = generateEarningsNote(MOCK_EARNINGS_MISS, MOCK_HOLDINGS);
    expect(result.recommendation).toContain('Not held');
  });

  test('is deterministic', () => {
    const a = generateEarningsNote(MOCK_EARNINGS_BEAT, MOCK_HOLDINGS);
    const b = generateEarningsNote(MOCK_EARNINGS_BEAT, MOCK_HOLDINGS);
    expect(a.epsSurprise).toBe(b.epsSurprise);
    expect(a.beat).toBe(b.beat);
  });
});
