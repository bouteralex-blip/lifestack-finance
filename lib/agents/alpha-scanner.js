// lib/agents/alpha-scanner.js
// Alpha Scanner Agent — finds regime-aligned opportunities outside current portfolio

export function computeAlphaScanner(ENGINE, MKTENG, rawData) {
  const regime = MKTENG?.regime || {};
  const sectors = MKTENG?.sectorLeadership || {};
  const factors = MKTENG?.factorRotation || {};
  const etfFlows = MKTENG?.etfFlows || {};
  const cryptoSentiment = MKTENG?.cryptoSentiment || {};
  const cryptoOnChain = MKTENG?.cryptoOnChain || {};
  const btcCycle = MKTENG?.btcCycle || {};
  const earnings = MKTENG?.earningsRevision || {};
  const commodityShock = MKTENG?.commodityShock || {};
  const holdings = rawData?.holdings || [];
  const holdingTickers = new Set(holdings.map(h => (h.ticker || h.name || '').toUpperCase()));

  const regimeLabel = regime.label || 'unknown';
  const opportunities = [];
  const contrarian = [];
  const themeAlerts = [];

  // --- Sector-based opportunities ---
  const leadingSectors = sectors.leading || sectors.top || [];
  for (const sector of leadingSectors) {
    const name = typeof sector === 'string' ? sector : (sector.name || sector.sector || '');
    const score = typeof sector === 'object' ? (sector.score || sector.momentum || 60) : 60;
    if (name) {
      opportunities.push({
        source: 'sector-leadership',
        name,
        score,
        rationale: `Leading sector in current ${regimeLabel} regime`,
        inPortfolio: false, // sector-level; individual holdings checked below
      });
    }
  }

  // --- Factor-based opportunities ---
  const favoredFactors = factors.favored || factors.leading || [];
  for (const factor of favoredFactors) {
    const name = typeof factor === 'string' ? factor : (factor.name || factor.factor || '');
    const score = typeof factor === 'object' ? (factor.score || 55) : 55;
    if (name) {
      opportunities.push({
        source: 'factor-rotation',
        name,
        score,
        rationale: `Factor rotation favors ${name}`,
        inPortfolio: false,
      });
    }
  }

  // --- ETF flow signals ---
  const topInflows = etfFlows.topInflows || etfFlows.leading || [];
  for (const etf of topInflows.slice(0, 5)) {
    const ticker = typeof etf === 'string' ? etf : (etf.ticker || etf.name || '');
    const flow = typeof etf === 'object' ? (etf.flow || etf.inflow || 0) : 0;
    if (ticker) {
      const inPort = holdingTickers.has(ticker.toUpperCase());
      opportunities.push({
        source: 'etf-flows',
        name: ticker,
        score: 50 + Math.min(flow / 10, 30),
        rationale: `Strong ETF inflows signal institutional conviction`,
        inPortfolio: inPort,
      });
    }
  }

  // --- Crypto opportunities (if regime permits) ---
  if (regimeLabel !== 'risk-off' && regimeLabel !== 'contraction') {
    const btcPhase = btcCycle.phase || btcCycle.label || 'unknown';
    if (btcPhase === 'accumulation' || btcPhase === 'expansion' || btcPhase === 'bull') {
      const sentiment = cryptoSentiment.score || cryptoSentiment.index || 50;
      if (sentiment < 30) {
        contrarian.push({
          source: 'crypto-sentiment',
          name: 'BTC / Crypto',
          score: 65,
          rationale: `Fear sentiment (${sentiment}) in ${btcPhase} phase — contrarian buy signal`,
        });
      }
      if (!holdingTickers.has('BTC') && !holdingTickers.has('BITCOIN')) {
        opportunities.push({
          source: 'btc-cycle',
          name: 'BTC',
          score: 55,
          rationale: `BTC cycle in ${btcPhase} phase, not currently held`,
          inPortfolio: false,
        });
      }
    }
  }

  // --- Contrarian setups ---
  const laggingSectors = sectors.lagging || sectors.bottom || [];
  for (const sector of laggingSectors.slice(0, 3)) {
    const name = typeof sector === 'string' ? sector : (sector.name || sector.sector || '');
    if (name) {
      contrarian.push({
        source: 'sector-mean-reversion',
        name,
        score: 40,
        rationale: `Lagging sector — potential mean reversion candidate`,
      });
    }
  }

  // Earnings revision contrarian
  const revisionDown = earnings.downgrades || earnings.negative || [];
  for (const item of revisionDown.slice(0, 3)) {
    const name = typeof item === 'string' ? item : (item.name || item.ticker || '');
    if (name) {
      contrarian.push({
        source: 'earnings-revision',
        name,
        score: 35,
        rationale: 'Negative earnings revisions — watch for overshoot and mean reversion',
      });
    }
  }

  // --- Theme alerts ---
  const commodityAlert = commodityShock.alert || commodityShock.shock;
  if (commodityAlert) {
    themeAlerts.push({
      theme: 'commodity-shock',
      description: typeof commodityAlert === 'string' ? commodityAlert : 'Commodity shock detected',
      severity: commodityShock.severity || 'medium',
    });
  }

  const narrativePulse = MKTENG?.narrativePulse || {};
  const dominantNarrative = narrativePulse.dominant || narrativePulse.theme;
  if (dominantNarrative) {
    themeAlerts.push({
      theme: 'narrative-shift',
      description: typeof dominantNarrative === 'string' ? dominantNarrative : 'Dominant market narrative shift',
      severity: 'low',
    });
  }

  const policySurprise = MKTENG?.policySurprise || {};
  if (policySurprise.surprise || policySurprise.alert) {
    themeAlerts.push({
      theme: 'policy-surprise',
      description: policySurprise.description || policySurprise.summary || 'Unexpected policy move detected',
      severity: policySurprise.severity || 'medium',
    });
  }

  // --- Filter to non-portfolio opportunities and sort ---
  const externalOpps = opportunities.filter(o => !o.inPortfolio);
  externalOpps.sort((a, b) => b.score - a.score);
  contrarian.sort((a, b) => b.score - a.score);

  const topPick = externalOpps[0] || null;

  return {
    opportunities: externalOpps.slice(0, 10),
    topPick,
    contrarian: contrarian.slice(0, 5),
    themeAlerts,
  };
}

