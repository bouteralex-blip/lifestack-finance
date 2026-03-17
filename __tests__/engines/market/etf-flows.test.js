import { computeETFFlowState } from '../../../lib/engines/market/etf-flows.js';
import { DEFAULT_MARKET } from '../../../lib/defaults.js';

const MOCK_SENTIMENT = [
  { theme: 'Crypto/BTC', sentiment: -80, flowDir: '+$500M', signal: 'Contrarian buy' },
  { theme: 'Mag7/Tech', sentiment: -40, flowDir: '-$2B', signal: 'Confirmed selloff' },
  { theme: 'Europe', sentiment: 60, flowDir: '+$3B', signal: 'Confirmed rally' },
  { theme: 'Gold', sentiment: 50, flowDir: '+$1B', signal: 'Confirmed rally' },
  { theme: 'Software/SaaS', sentiment: -70, flowDir: '-$1.5B', signal: 'Capitulation' },
];

describe('computeETFFlowState', () => {
  test('returns null for null/empty sentiment data', () => {
    expect(computeETFFlowState(null)).toBeNull();
    expect(computeETFFlowState([])).toBeNull();
  });

  test('returns complete state for mock sentiment data', () => {
    const state = computeETFFlowState(MOCK_SENTIMENT, DEFAULT_MARKET);
    expect(state).not.toBeNull();
    expect(state.flows.length).toBe(MOCK_SENTIMENT.length);
    expect(typeof state.contrarianSignals).toBe('number');
    expect(typeof state.warningSignals).toBe('number');
    expect(typeof state.confirmedTrends).toBe('number');
    expect(state.overallBias).toBeTruthy();
  });

  test('classifies inflow + negative price as contrarian buy', () => {
    const state = computeETFFlowState(MOCK_SENTIMENT, DEFAULT_MARKET);
    const crypto = state.flows.find(f => f.theme === 'Crypto/BTC');
    expect(crypto.signal).toBe('SMART MONEY BUYING');
    expect(crypto.signalType).toBe('contrarian');
  });

  test('classifies outflow + negative price as confirmed selloff', () => {
    const state = computeETFFlowState(MOCK_SENTIMENT, DEFAULT_MARKET);
    const tech = state.flows.find(f => f.theme === 'Mag7/Tech');
    expect(tech.signal).toBe('CONFIRMED SELLOFF');
    expect(tech.signalType).toBe('confirmation');
  });

  test('classifies inflow + positive price as confirmed rally', () => {
    const state = computeETFFlowState(MOCK_SENTIMENT, DEFAULT_MARKET);
    const europe = state.flows.find(f => f.theme === 'Europe');
    expect(europe.signal).toBe('CONFIRMED RALLY');
    expect(europe.signalType).toBe('confirmation');
  });

  test('identifies top contrarian opportunities', () => {
    const state = computeETFFlowState(MOCK_SENTIMENT, DEFAULT_MARKET);
    expect(state.topOpportunities.length).toBeLessThanOrEqual(3);
    state.topOpportunities.forEach(opp => {
      expect(opp.theme).toBeTruthy();
      expect(opp.signal).toBeTruthy();
    });
  });

  test('handles missing market data gracefully', () => {
    const state = computeETFFlowState(MOCK_SENTIMENT, null);
    expect(state).not.toBeNull();
    expect(state.flows.length).toBe(MOCK_SENTIMENT.length);
  });

  test('is deterministic', () => {
    const a = computeETFFlowState(MOCK_SENTIMENT, DEFAULT_MARKET);
    const b = computeETFFlowState(MOCK_SENTIMENT, DEFAULT_MARKET);
    expect(a.contrarianSignals).toBe(b.contrarianSignals);
    expect(a.overallBias).toBe(b.overallBias);
  });
});
