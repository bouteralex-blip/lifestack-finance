// =========================================================================
// LIFESTACK OS — THEME MEMO GENERATOR
// Phase 4: Research & Decisioning
// Deep-dive research memo on a specific investment theme
// =========================================================================

const DEFAULT_THEMES = [
  { id: 'ai-semis', name: 'AI / Semiconductors', sector: 'Technology' },
  { id: 'uk-value', name: 'UK Value', sector: 'Equities' },
  { id: 'btc-accumulation', name: 'BTC Accumulation', sector: 'Crypto' },
  { id: 'defence', name: 'Defence', sector: 'Industrials' },
  { id: 'energy-transition', name: 'Energy Transition', sector: 'Energy' },
];

/**
 * Generate a deep-dive research memo for a specific investment theme
 * Synthesises market context, holdings exposure, and conviction assessment
 */
export function generateThemeMemo(theme, marketState, holdings) {
  if (!theme) return null;

  const now = new Date();
  const themeConfig = typeof theme === 'string'
    ? DEFAULT_THEMES.find(t => t.id === theme || t.name === theme) || { id: theme, name: theme, sector: 'Unknown' }
    : theme;

  // 1. Build thesis
  const thesis = buildThesis(themeConfig, marketState);

  // 2. Gather evidence
  const evidence = gatherEvidence(themeConfig, marketState, holdings);

  // 3. Assess risks
  const risks = assessThemeRisks(themeConfig, marketState);

  // 4. Sizing recommendation
  const sizing = computeSizing(themeConfig, marketState, holdings);

  // 5. Timeline
  const timeline = computeTimeline(themeConfig, marketState);

  // 6. Recommendation
  const recommendation = buildRecommendation(themeConfig, evidence, risks, sizing);

  // 7. Conviction score
  const conviction = computeConviction(evidence, risks, marketState);

  return {
    theme: themeConfig.name,
    themeId: themeConfig.id,
    date: now.toISOString().split('T')[0],
    thesis,
    evidence,
    risks,
    sizing,
    timeline,
    recommendation,
    conviction,
  };
}

/**
 * Build the investment thesis for this theme
 */
function buildThesis(theme, mkt) {
  const regime = mkt?.regime?.regime || 'Unknown';

  const theses = {
    'ai-semis': `AI infrastructure buildout drives multi-year semiconductor demand. ${regime} regime ${regime === 'Expansion' ? 'supports' : 'may constrain'} growth multiples. Structural demand exceeds cyclical risk.`,
    'uk-value': `UK equities trade at historic discount to global peers. GBP-denominated income generation with reversion potential. ${regime} regime ${regime === 'Recession' ? 'creates buying opportunity' : 'provides stable backdrop'}.`,
    'btc-accumulation': `Bitcoin as asymmetric non-sovereign store of value. ${mkt?.btcCycle?.phase || 'Unknown'} phase — ${mkt?.btcCycle?.posture || 'monitor position sizing'}. Halving cycle thesis intact.`,
    'defence': `Structural re-armament cycle across NATO. Multi-year order books with government-backed revenue visibility. ${regime} regime is secondary to geopolitical tailwind.`,
    'energy-transition': `Policy-driven decarbonisation creates multi-decade capex cycle. Technology costs declining. ${regime} regime ${regime === 'Late Cycle' ? 'may slow capex' : 'supports infrastructure spend'}.`,
  };

  return theses[theme.id] || `${theme.name}: assess structural drivers against current ${regime} regime context.`;
}

/**
 * Gather evidence points for the theme
 */
function gatherEvidence(theme, mkt, holdings) {
  const evidence = [];

  // Market regime evidence
  if (mkt?.regime) {
    evidence.push({
      point: `Market regime: ${mkt.regime.regime}`,
      source: 'Regime Engine',
      confidence: mkt.regime.confidence || 50,
    });
  }

  // Sector leadership evidence
  if (mkt?.sectorLeadership?.leaders) {
    const isLeading = mkt.sectorLeadership.leaders.some(l =>
      l.toLowerCase().includes(theme.sector?.toLowerCase() || '')
    );
    evidence.push({
      point: isLeading
        ? `${theme.sector} sector currently in leadership rotation`
        : `${theme.sector} sector not currently leading — patience required`,
      source: 'Sector Leadership Engine',
      confidence: isLeading ? 70 : 40,
    });
  }

  // BTC-specific evidence
  if (theme.id === 'btc-accumulation' && mkt?.btcCycle) {
    evidence.push({
      point: `BTC cycle phase: ${mkt.btcCycle.phase}. Bias: ${mkt.btcCycle.bias || 0}/5`,
      source: 'BTC Cycle Engine',
      confidence: mkt.btcCycle.confidence || 50,
    });
  }

  // Holdings exposure
  if (holdings?.length > 0) {
    const relevantHoldings = findRelevantHoldings(theme, holdings);
    if (relevantHoldings.length > 0) {
      evidence.push({
        point: `Current exposure via ${relevantHoldings.length} position(s): ${relevantHoldings.map(h => h.ticker || h.name).join(', ')}`,
        source: 'Portfolio',
        confidence: 80,
      });
    } else {
      evidence.push({
        point: 'No current portfolio exposure to this theme',
        source: 'Portfolio',
        confidence: 80,
      });
    }
  }

  // Credit conditions
  if (mkt?.creditStress) {
    evidence.push({
      point: `Credit conditions: ${mkt.creditStress.compositeLevel || 'Normal'} (${mkt.creditStress.compositeScore || 0}/100)`,
      source: 'Credit Stress Engine',
      confidence: 60,
    });
  }

  return evidence;
}

/**
 * Find holdings relevant to a theme
 */
function findRelevantHoldings(theme, holdings) {
  if (!holdings?.length) return [];

  const themeKeywords = {
    'ai-semis': ['nvda', 'nvidia', 'asml', 'tsmc', 'amd', 'semi', 'smh', 'soxx'],
    'uk-value': ['ftse', 'vuke', 'iukd', 'uk', 'lse', 'gbp'],
    'btc-accumulation': ['btc', 'bitcoin', 'mstr', 'gbtc', 'ibit'],
    'defence': ['lmt', 'bae', 'rtn', 'noc', 'gd', 'defence', 'defense'],
    'energy-transition': ['icln', 'tan', 'enph', 'sedg', 'plug', 'clean', 'solar', 'wind'],
  };

  const keywords = themeKeywords[theme.id] || [theme.name.toLowerCase()];
  return holdings.filter(h => {
    const name = (h.ticker || h.name || '').toLowerCase();
    return keywords.some(k => name.includes(k));
  });
}

/**
 * Assess risks specific to this theme
 */
function assessThemeRisks(theme, mkt) {
  const risks = [];
  const stressScore = mkt?.stress?.compositeScore || 0;

  // Common risk: market stress
  if (stressScore > 50) {
    risks.push({
      risk: 'Elevated market stress may suppress risk appetite',
      severity: 'high',
      mitigant: 'Size positions conservatively, use limit orders',
    });
  }

  // Theme-specific risks
  const themeRisks = {
    'ai-semis': [
      { risk: 'Valuation compression if earnings disappoint', severity: 'high', mitigant: 'Diversify across semiconductor value chain' },
      { risk: 'Export controls / geopolitical risk', severity: 'medium', mitigant: 'Favour US-domiciled names with domestic revenue' },
    ],
    'uk-value': [
      { risk: 'Value trap — cheap for a reason', severity: 'medium', mitigant: 'Focus on dividend-paying, cash-generative names' },
      { risk: 'GBP depreciation erodes returns', severity: 'medium', mitigant: 'Monitor FX exposure via Currency Engine' },
    ],
    'btc-accumulation': [
      { risk: 'Regulatory crackdown', severity: 'medium', mitigant: 'Keep position within allocation limits' },
      { risk: 'Cycle timing error — could be early', severity: 'high', mitigant: 'DCA approach, do not lump-sum' },
    ],
    'defence': [
      { risk: 'Peace dividend / political shift reduces spend', severity: 'low', mitigant: 'Multi-year order books provide visibility' },
      { risk: 'Crowded trade with elevated multiples', severity: 'medium', mitigant: 'Focus on UK/EU names with lower relative valuations' },
    ],
    'energy-transition': [
      { risk: 'Policy reversal / subsidy cuts', severity: 'high', mitigant: 'Diversify across geographies and technologies' },
      { risk: 'Higher rates increase project costs', severity: 'medium', mitigant: 'Favour profitable companies over speculative names' },
    ],
  };

  risks.push(...(themeRisks[theme.id] || [{ risk: 'Theme-specific risks require further analysis', severity: 'medium', mitigant: 'Conduct deeper due diligence' }]));

  return risks;
}

/**
 * Compute sizing recommendation
 */
function computeSizing(theme, mkt, holdings) {
  const stressScore = mkt?.stress?.compositeScore || 0;
  const relevantHoldings = findRelevantHoldings(theme, holdings || []);
  const currentExposure = relevantHoldings.reduce((sum, h) => sum + (h.weight || h.pct || 0), 0);

  let maxSize = 10; // default max allocation %
  if (stressScore > 60) maxSize = 5;
  if (stressScore > 80) maxSize = 2;

  const headroom = Math.max(0, maxSize - currentExposure);

  return {
    currentExposure: +currentExposure.toFixed(1),
    maxRecommended: maxSize,
    headroom: +headroom.toFixed(1),
    approach: headroom > 2 ? 'Room to add' : headroom > 0 ? 'Near limit — add selectively' : 'Fully allocated — trim before adding',
  };
}

/**
 * Compute timeline for the theme
 */
function computeTimeline(theme, mkt) {
  const timelines = {
    'ai-semis': { horizon: '2-5 years', catalyst: 'Earnings growth inflection', nextCheckpoint: 'Next quarterly earnings' },
    'uk-value': { horizon: '1-3 years', catalyst: 'Valuation gap closure vs US/EU', nextCheckpoint: 'BoE rate decision' },
    'btc-accumulation': { horizon: '1-2 years (cycle)', catalyst: 'Post-halving supply squeeze', nextCheckpoint: `Current phase: ${mkt?.btcCycle?.phase || 'Unknown'}` },
    'defence': { horizon: '3-5 years', catalyst: 'NATO spending targets reached', nextCheckpoint: 'Government budget announcements' },
    'energy-transition': { horizon: '5-10 years', catalyst: 'Grid parity / policy milestones', nextCheckpoint: 'COP summit / policy updates' },
  };

  return timelines[theme.id] || { horizon: 'To be determined', catalyst: 'Requires further analysis', nextCheckpoint: 'Initial research needed' };
}

/**
 * Build overall recommendation
 */
function buildRecommendation(theme, evidence, risks, sizing) {
  const avgConfidence = evidence.length > 0
    ? evidence.reduce((sum, e) => sum + (e.confidence || 50), 0) / evidence.length
    : 50;

  const highRisks = risks.filter(r => r.severity === 'high').length;

  if (avgConfidence >= 65 && highRisks === 0 && sizing.headroom > 2) {
    return `ADD — Build position in ${theme.name}. Evidence supports thesis with manageable risk. Headroom: ${sizing.headroom}%.`;
  }
  if (avgConfidence >= 50 && sizing.headroom > 0) {
    return `HOLD/NIBBLE — Thesis intact but ${highRisks > 0 ? 'risks elevated' : 'wait for better entry'}. Add opportunistically on pullbacks.`;
  }
  if (sizing.headroom <= 0) {
    return `HOLD — Position fully allocated. Monitor thesis and trim if conviction drops.`;
  }
  return `WATCH — Insufficient conviction to act. Revisit when evidence strengthens.`;
}

/**
 * Compute conviction score (1-10)
 */
function computeConviction(evidence, risks, mkt) {
  let score = 5; // base

  // Evidence quality
  const avgConfidence = evidence.length > 0
    ? evidence.reduce((sum, e) => sum + (e.confidence || 50), 0) / evidence.length
    : 50;
  score += (avgConfidence - 50) / 20; // +/- 2.5

  // Risk count
  const highRisks = risks.filter(r => r.severity === 'high').length;
  score -= highRisks * 0.8;

  // Market stress penalty
  const stress = mkt?.stress?.compositeScore || 0;
  if (stress > 60) score -= 1;
  if (stress > 80) score -= 1;

  return Math.max(1, Math.min(10, Math.round(score)));
}
