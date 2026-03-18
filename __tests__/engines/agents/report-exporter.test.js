import { generateMarkdownReport } from '../../../lib/engines/agents/report-exporter.js';

const MOCK_ENGINE = {
  driftMonitor: { maxDrift: 4.5, urgency: 'Monitor', driftScore: 5 },
  concentration: { hhi: 1800, effectivePositions: 10, diversificationRating: 'Moderate', violations: [] },
  debtPriority: { totalDebt: 8000, highestAPR: 15, totalAnnualInterest: 1200 },
  isaPensionRouting: { isaHeadroom: { remaining: 12000 }, daysUntilTaxYearEnd: 25 },
  wrapperExposure: { efficiency: { score: 6, giaExposurePct: 45 }, reallocationOpportunities: [{ name: 'BTC' }] },
  rebalanceProposal: { trades: [{ ticker: 'VWRL', amount: 5000 }] },
};

const MOCK_MARKET = {
  regime: { regime: 'Expansion', riskPosture: 'Risk On', confidence: 75, regimeChanged: false },
  stress: { compositeScore: 35, compositeLevel: 'Normal', topStressors: [] },
  yieldCurve: { shape: 'Normal' },
  creditStress: { compositeLevel: 'Low', compositeScore: 15 },
  btcCycle: { phase: 'Accumulation' },
  sectorLeadership: { marketBreadth: 'Healthy' },
};

describe('generateMarkdownReport', () => {
  test('returns null for null engineState', () => {
    expect(generateMarkdownReport(null)).toBeNull();
    expect(generateMarkdownReport(undefined)).toBeNull();
  });

  test('returns valid structure with minimal inputs', () => {
    const result = generateMarkdownReport({});
    expect(result).toBeDefined();
    expect(typeof result.markdown).toBe('string');
    expect(result.sections.length).toBe(6);
    expect(typeof result.wordCount).toBe('number');
    expect(result.generatedAt).toBeTruthy();
  });

  test('report contains all six sections', () => {
    const result = generateMarkdownReport(MOCK_ENGINE, MOCK_MARKET);
    const titles = result.sections.map(s => s.title);
    expect(titles).toContain('Executive Summary');
    expect(titles).toContain('Market Context');
    expect(titles).toContain('Portfolio Analysis');
    expect(titles).toContain('Risk Assessment');
    expect(titles).toContain('Action Items');
    expect(titles).toContain('Appendix');
  });

  test('markdown contains report header', () => {
    const result = generateMarkdownReport(MOCK_ENGINE, MOCK_MARKET);
    expect(result.markdown).toContain('# LifeStack Portfolio Report');
    expect(result.markdown).toContain('Generated:');
  });

  test('action items include debt paydown for high APR', () => {
    const result = generateMarkdownReport(MOCK_ENGINE, MOCK_MARKET);
    const actionSection = result.sections.find(s => s.title === 'Action Items');
    expect(actionSection.content).toContain('Pay down high-APR debt');
  });

  test('wordCount is positive for populated report', () => {
    const result = generateMarkdownReport(MOCK_ENGINE, MOCK_MARKET);
    expect(result.wordCount).toBeGreaterThan(50);
  });
});
