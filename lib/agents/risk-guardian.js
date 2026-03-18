// lib/agents/risk-guardian.js
// Risk Guardian Agent — real-time risk monitoring, correlation detection, hedge recs

function computeRiskGuardian(ENGINE, MKTENG, _rawData) {
  const concentration = ENGINE?.concentration || {};
  const drawdown = ENGINE?.drawdown || {};
  const riskBudget = ENGINE?.riskBudget || {};
  const scenarioSens = ENGINE?.scenarioSensitivity || {};
  const monteCarlo = ENGINE?.monteCarlo || {};
  const liquidity = ENGINE?.liquidityLadder || {};

  const crossAssetStress = MKTENG?.crossAssetStress || {};
  const correlationDrift = MKTENG?.correlationDrift || {};
  const creditStress = MKTENG?.creditStress || {};
  const gapRisk = MKTENG?.gapRisk || {};
  const vix = MKTENG?.regime?.vix || null;

  const alerts = [];
  const hedgeRecommendations = [];
  const correlationWarnings = [];
  let riskScore = 0; // 0 = no risk, 100 = maximum risk

  // --- Risk budget utilisation ---
  const riskUtil = riskBudget.utilisation || riskBudget.utilization || 0;
  if (riskUtil > 1.2) {
    riskScore += 30;
    alerts.push({ level: 'critical', category: 'risk-budget', message: `Risk budget significantly exceeded: ${(riskUtil * 100).toFixed(0)}% utilisation`, value: riskUtil });
    hedgeRecommendations.push({ action: 'reduce-exposure', urgency: 'high', rationale: 'Risk budget exceeded by >20%', suggestion: 'Trim highest-risk positions to bring utilisation below 100%' });
  } else if (riskUtil > 1.0) {
    riskScore += 15;
    alerts.push({ level: 'warning', category: 'risk-budget', message: `Risk budget exceeded: ${(riskUtil * 100).toFixed(0)}% utilisation`, value: riskUtil });
  } else if (riskUtil > 0.85) {
    riskScore += 5;
    alerts.push({ level: 'info', category: 'risk-budget', message: `Risk budget nearing limit: ${(riskUtil * 100).toFixed(0)}%`, value: riskUtil });
  }

  // --- Concentration risk ---
  const hhi = concentration.hhi || 0;
  if (hhi > 0.25) {
    riskScore += 20;
    alerts.push({ level: 'critical', category: 'concentration', message: `HHI critically high at ${(hhi * 100).toFixed(0)}%`, value: hhi });
    hedgeRecommendations.push({ action: 'diversify', urgency: 'high', rationale: 'Portfolio highly concentrated', suggestion: 'Spread exposure across more positions or add broad index ETFs' });
  } else if (hhi > 0.15) {
    riskScore += 10;
    alerts.push({ level: 'warning', category: 'concentration', message: `HHI elevated at ${(hhi * 100).toFixed(0)}%`, value: hhi });
  }

  // --- Drawdown monitoring ---
  const ddPct = drawdown.currentDrawdown || drawdown.drawdownPct || 0;
  const absDd = Math.abs(ddPct);
  if (absDd > 0.2) {
    riskScore += 25;
    alerts.push({ level: 'critical', category: 'drawdown', message: `Severe drawdown: ${(absDd * 100).toFixed(1)}% from peak`, value: ddPct });
    hedgeRecommendations.push({ action: 'hedge-tail', urgency: 'high', rationale: `Drawdown exceeds 20%`, suggestion: 'Consider protective puts or reducing equity beta' });
  } else if (absDd > 0.1) {
    riskScore += 12;
    alerts.push({ level: 'warning', category: 'drawdown', message: `Meaningful drawdown: ${(absDd * 100).toFixed(1)}% from peak`, value: ddPct });
  } else if (absDd > 0.05) {
    riskScore += 5;
  }

  // --- Cross-asset stress ---
  const stressLevel = crossAssetStress.level || crossAssetStress.score || 0;
  const stressNum = typeof stressLevel === 'number' ? stressLevel : (stressLevel === 'high' ? 80 : stressLevel === 'medium' ? 50 : 20);
  if (stressNum > 70) {
    riskScore += 15;
    alerts.push({ level: 'critical', category: 'cross-asset-stress', message: 'Cross-asset stress elevated — risk of contagion', value: stressNum });
    hedgeRecommendations.push({ action: 'de-risk', urgency: 'medium', rationale: 'Cross-asset stress high', suggestion: 'Increase cash allocation or add uncorrelated assets (gold, TIPS)' });
  } else if (stressNum > 40) {
    riskScore += 7;
    alerts.push({ level: 'warning', category: 'cross-asset-stress', message: 'Cross-asset stress moderate', value: stressNum });
  }

  // --- Correlation drift (hidden correlation risk) ---
  const driftPairs = correlationDrift.pairs || correlationDrift.drifts || [];
  for (const pair of driftPairs) {
    const change = pair.change || pair.drift || 0;
    if (Math.abs(change) > 0.3) {
      correlationWarnings.push({
        pair: pair.pair || pair.name || `${pair.asset1}-${pair.asset2}`,
        priorCorrelation: pair.prior || pair.historical || null,
        currentCorrelation: pair.current || null,
        change,
        risk: change > 0 ? 'Correlations converging — diversification benefit reduced' : 'Correlations diverging — regime shift possible',
      });
    }
  }
  if (correlationWarnings.length > 0) {
    riskScore += Math.min(correlationWarnings.length * 5, 15);
    alerts.push({ level: 'warning', category: 'correlation-drift', message: `${correlationWarnings.length} significant correlation shift(s) detected`, value: correlationWarnings.length });
  }

  // --- Credit stress ---
  const creditLevel = creditStress.level || creditStress.score || 0;
  const creditNum = typeof creditLevel === 'number' ? creditLevel : (creditLevel === 'high' ? 80 : creditLevel === 'medium' ? 50 : 20);
  if (creditNum > 70) {
    riskScore += 10;
    alerts.push({ level: 'warning', category: 'credit-stress', message: 'Credit stress elevated — monitor fixed income exposure', value: creditNum });
    hedgeRecommendations.push({ action: 'shorten-duration', urgency: 'medium', rationale: 'Credit stress elevated', suggestion: 'Shorten bond duration or shift to higher-quality issuers' });
  }

  // --- VIX spike ---
  if (typeof vix === 'number' && vix > 30) {
    riskScore += 10;
    alerts.push({ level: 'warning', category: 'volatility', message: `VIX elevated at ${vix.toFixed(1)}`, value: vix });
  }

  // --- Gap risk ---
  const gapLevel = gapRisk.level || gapRisk.score || 0;
  const gapNum = typeof gapLevel === 'number' ? gapLevel : (gapLevel === 'high' ? 80 : 20);
  if (gapNum > 60) {
    riskScore += 8;
    alerts.push({ level: 'warning', category: 'gap-risk', message: 'Gap risk elevated — weekend/event exposure', value: gapNum });
  }

  // --- Liquidity risk ---
  const liqScore = liquidity.score || liquidity.adequacy || 1;
  if (liqScore < 0.5) {
    riskScore += 10;
    alerts.push({ level: 'warning', category: 'liquidity', message: 'Liquidity coverage inadequate', value: liqScore });
    hedgeRecommendations.push({ action: 'build-liquidity', urgency: 'medium', rationale: 'Low liquidity buffer', suggestion: 'Increase cash or near-cash positions' });
  }

  // Cap risk score
  riskScore = Math.min(100, riskScore);

  // Sort alerts by severity
  const severityOrder = { critical: 0, warning: 1, info: 2 };
  alerts.sort((a, b) => (severityOrder[a.level] || 9) - (severityOrder[b.level] || 9));
  hedgeRecommendations.sort((a, b) => (a.urgency === 'high' ? 0 : 1) - (b.urgency === 'high' ? 0 : 1));

  return { riskScore, alerts, hedgeRecommendations, correlationWarnings };
}

module.exports = { computeRiskGuardian };
