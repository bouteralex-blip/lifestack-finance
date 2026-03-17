import { computeSectorLeadershipState } from '../../../lib/engines/market/sector-leadership.js';
import { DEFAULT_SECTOR } from '../../../lib/defaults.js';

describe('computeSectorLeadershipState', () => {
  test('returns null for null/empty input', () => {
    expect(computeSectorLeadershipState(null)).toBeNull();
    expect(computeSectorLeadershipState([])).toBeNull();
  });

  test('returns complete state for default sector data', () => {
    const state = computeSectorLeadershipState(DEFAULT_SECTOR);
    expect(state).not.toBeNull();
    expect(state.sectors.length).toBe(DEFAULT_SECTOR.length);
    expect(state.leaders).toBeDefined();
    expect(state.laggards).toBeDefined();
    expect(typeof state.breadthYTD).toBe('number');
    expect(typeof state.breadth12m).toBe('number');
    expect(typeof state.dispersion).toBe('number');
    expect(['EXTREME', 'HIGH', 'NORMAL']).toContain(state.rotationSignal);
    expect(['BROAD', 'NARROW', 'VERY NARROW']).toContain(state.marketBreadth);
    expect(state.implication).toBeTruthy();
  });

  test('sectors are sorted by 12m return descending', () => {
    const state = computeSectorLeadershipState(DEFAULT_SECTOR);
    for (let i = 1; i < state.sectors.length; i++) {
      expect(state.sectors[i - 1].return12m).toBeGreaterThanOrEqual(state.sectors[i].return12m);
    }
  });

  test('each sector has tier and momentum classification', () => {
    const state = computeSectorLeadershipState(DEFAULT_SECTOR);
    state.sectors.forEach(s => {
      expect(['LEADING', 'IMPROVING', 'NEUTRAL', 'LAGGING', 'COLLAPSING']).toContain(s.tier);
      expect(['Strong', 'Positive', 'Flat', 'Weak', 'Negative']).toContain(s.momentum);
      expect(s.color).toBeTruthy();
    });
  });

  test('Semis (SMH) should be classified as LEADING', () => {
    const state = computeSectorLeadershipState(DEFAULT_SECTOR);
    const semis = state.sectors.find(s => s.name === 'Semis (SMH)');
    expect(semis).toBeDefined();
    expect(semis.tier).toBe('LEADING');
  });

  test('Software (IGV) should be classified as COLLAPSING', () => {
    const state = computeSectorLeadershipState(DEFAULT_SECTOR);
    const software = state.sectors.find(s => s.name === 'Software (IGV)');
    expect(software).toBeDefined();
    expect(software.tier).toBe('COLLAPSING');
  });

  test('dispersion measures spread between best and worst', () => {
    const state = computeSectorLeadershipState(DEFAULT_SECTOR);
    const best = state.sectors[0].return12m;
    const worst = state.sectors[state.sectors.length - 1].return12m;
    expect(state.dispersion).toBe(+(best - worst).toFixed(1));
  });

  test('all positive sectors produce broad breadth', () => {
    const allPositive = [
      { s: 'A', v: 20, y: 5 },
      { s: 'B', v: 15, y: 3 },
      { s: 'C', v: 10, y: 2 },
    ];
    const state = computeSectorLeadershipState(allPositive);
    expect(state.breadthYTD).toBe(100);
    expect(state.marketBreadth).toBe('BROAD');
  });

  test('is deterministic', () => {
    const a = computeSectorLeadershipState(DEFAULT_SECTOR);
    const b = computeSectorLeadershipState(DEFAULT_SECTOR);
    expect(a.breadthYTD).toBe(b.breadthYTD);
    expect(a.dispersion).toBe(b.dispersion);
    expect(a.rotationSignal).toBe(b.rotationSignal);
  });
});
