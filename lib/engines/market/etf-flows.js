// =========================================================================
// LIFESTACK OS — ETF FLOW TRACKER
// Phase 3: Market Intelligence
// Tracks fund flow signals across asset classes for positioning intelligence
// =========================================================================

/**
 * Interpret ETF flow signals
 * Contrarian signals: extreme outflows = accumulation opportunity
 * Confirmation signals: flows align with price direction
 */
function classifyFlow(flowDir, priceReturn) {
  const isInflow = flowDir.includes('+') || flowDir.toLowerCase().includes('inflow');
  const isOutflow = flowDir.includes('-') || flowDir.toLowerCase().includes('outflow');
  const isPriceUp = priceReturn > 0;

  if (isInflow && isPriceUp) return { signal: 'CONFIRMED RALLY', type: 'confirmation', color: '#22c55e', strength: 'Strong' };
  if (isInflow && !isPriceUp) return { signal: 'SMART MONEY BUYING', type: 'contrarian', color: '#06b6d4', strength: 'Moderate' };
  if (isOutflow && isPriceUp) return { signal: 'DISTRIBUTION', type: 'warning', color: '#f59e0b', strength: 'Moderate' };
  if (isOutflow && !isPriceUp) return { signal: 'CONFIRMED SELLOFF', type: 'confirmation', color: '#ef4444', strength: 'Strong' };
  return { signal: 'NEUTRAL', type: 'neutral', color: '#94a3b8', strength: 'Low' };
}

/**
 * Compute ETF flow state from sentiment divergence data
 */
export function computeETFFlowState(sentimentData, marketData) {
  if (!sentimentData?.length) return null;

  const flows = sentimentData.map(s => {
    const priceReturn = estimateReturn(s.theme, marketData);
    const classification = classifyFlow(s.flowDir, priceReturn);

    return {
      theme: s.theme,
      sentiment: s.sentiment,
      flowDirection: s.flowDir,
      signal: classification.signal,
      signalType: classification.type,
      color: classification.color || s.col,
      strength: classification.strength,
      divergence: s.signal,
      priceReturn,
    };
  });

  // Count signal types
  const contrarian = flows.filter(f => f.signalType === 'contrarian');
  const warnings = flows.filter(f => f.signalType === 'warning');
  const confirmed = flows.filter(f => f.signalType === 'confirmation');

  // Best opportunities: contrarian signals with extreme sentiment
  const opportunities = flows
    .filter(f => f.signalType === 'contrarian' && Math.abs(f.sentiment) > 50)
    .sort((a, b) => Math.abs(b.sentiment) - Math.abs(a.sentiment));

  return {
    flows,
    contrarianSignals: contrarian.length,
    warningSignals: warnings.length,
    confirmedTrends: confirmed.length,
    topOpportunities: opportunities.slice(0, 3).map(f => ({
      theme: f.theme,
      signal: f.signal,
      sentiment: f.sentiment,
      flowDirection: f.flowDirection,
    })),
    overallBias: contrarian.length > warnings.length ? 'Contrarian opportunities present'
      : warnings.length > confirmed.length ? 'Distribution signals — caution'
      : 'Trend-following environment',
  };
}

/**
 * Estimate approximate price return for a theme based on market data
 */
function estimateReturn(theme, marketData) {
  if (!marketData) return 0;
  const t = theme.toLowerCase();
  if (t.includes('crypto') || t.includes('btc')) return marketData.btcDD || -45;
  if (t.includes('tech') || t.includes('mag7')) return marketData.mag7YTD || -6;
  if (t.includes('europe')) return marketData.msciEurope12m || 36;
  if (t.includes('gilt') || t.includes('bond')) return -5; // rates rising = bond losses
  if (t.includes('gold')) return 80; // gold surge
  if (t.includes('software')) return marketData.igv12m || -30;
  return 0;
}
