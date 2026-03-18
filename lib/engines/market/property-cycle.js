// lib/engines/market/property-cycle.js
// Property Cycle Watcher — housing timing, mortgage rates, REITs, prices

export function computePropertyCycleState(marketData) {
  const md = marketData || {};

  const mortgageRate = md.mortgage_rate ?? md.uk_mortgage_rate ?? 4.5;
  const hpi = md.hpi_yoy ?? md.house_price_index_yoy ?? 1.2;
  const reitReturn = md.reit_return_ytd ?? 0;
  const rentalYield = md.rental_yield ?? 4.8;
  const affordability = md.affordability_ratio ?? 8.5;
  const transactions = md.housing_transactions ?? md.transactions_yoy ?? 0;
  const buildingPermits = md.building_permits_yoy ?? 0;

  // Cycle classification
  let phase = 'mid-cycle';
  let score = 50;
  const signals = [];

  // Mortgage rate impact
  if (mortgageRate > 6) {
    score -= 20;
    signals.push({ signal: 'Mortgage rates elevated', impact: 'negative', detail: `${mortgageRate.toFixed(1)}% — headwind for prices` });
  } else if (mortgageRate > 5) {
    score -= 10;
    signals.push({ signal: 'Mortgage rates above neutral', impact: 'cautious', detail: `${mortgageRate.toFixed(1)}%` });
  } else if (mortgageRate < 3.5) {
    score += 15;
    signals.push({ signal: 'Mortgage rates supportive', impact: 'positive', detail: `${mortgageRate.toFixed(1)}% — tailwind` });
  }

  // Price momentum
  if (hpi > 5) {
    score += 10;
    signals.push({ signal: 'Strong HPI growth', impact: 'positive', detail: `${hpi.toFixed(1)}% YoY` });
  } else if (hpi < -2) {
    score -= 15;
    signals.push({ signal: 'House prices declining', impact: 'negative', detail: `${hpi.toFixed(1)}% YoY` });
  } else if (hpi < 0) {
    score -= 5;
    signals.push({ signal: 'House prices flat/negative', impact: 'cautious', detail: `${hpi.toFixed(1)}% YoY` });
  }

  // REIT signal
  if (reitReturn > 10) {
    score += 10;
    signals.push({ signal: 'REITs outperforming', impact: 'positive', detail: `${reitReturn.toFixed(1)}% YTD` });
  } else if (reitReturn < -10) {
    score -= 10;
    signals.push({ signal: 'REITs underperforming', impact: 'negative', detail: `${reitReturn.toFixed(1)}% YTD` });
  }

  // Transactions volume
  if (transactions > 10) {
    score += 5;
    signals.push({ signal: 'Transaction volumes rising', impact: 'positive', detail: `${transactions.toFixed(1)}% YoY` });
  } else if (transactions < -15) {
    score -= 10;
    signals.push({ signal: 'Transaction volumes collapsing', impact: 'negative', detail: `${transactions.toFixed(1)}% YoY` });
  }

  // Affordability
  if (affordability > 10) {
    score -= 10;
    signals.push({ signal: 'Affordability stretched', impact: 'negative', detail: `Ratio: ${affordability.toFixed(1)}x` });
  } else if (affordability < 6) {
    score += 10;
    signals.push({ signal: 'Affordability improving', impact: 'positive', detail: `Ratio: ${affordability.toFixed(1)}x` });
  }

  score = Math.max(0, Math.min(100, score));

  if (score >= 65) phase = 'expansion';
  else if (score >= 55) phase = 'recovery';
  else if (score >= 40) phase = 'mid-cycle';
  else if (score >= 25) phase = 'slowdown';
  else phase = 'contraction';

  // Portfolio implications
  const implications = [];
  if (phase === 'expansion' || phase === 'recovery') {
    implications.push('Consider REIT/property exposure increase');
    implications.push('Mortgage lock-in may be timely');
  } else if (phase === 'slowdown' || phase === 'contraction') {
    implications.push('Reduce direct property exposure');
    implications.push('Favour defensive REITs (logistics, healthcare)');
    implications.push('Watch for distressed opportunities if contraction deepens');
  }

  return {
    phase,
    score,
    mortgageRate,
    hpi,
    reitReturn,
    rentalYield,
    affordability,
    transactions,
    buildingPermits,
    signals,
    implications,
    verdict: score >= 55 ? 'Constructive for property' : score >= 40 ? 'Neutral — selective only' : 'Defensive — avoid broad property exposure',
  };
}
