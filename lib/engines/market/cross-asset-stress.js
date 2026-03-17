// =========================================================================
// LIFESTACK OS — CROSS-ASSET STRESS BOARD
// Phase 3: Market Intelligence
// Aggregates VIX, MOVE, credit spreads, oil, DXY into unified stress map
// =========================================================================

/**
 * Stress thresholds per asset
 * Each threshold defines normal, elevated, and extreme bands
 */
const THRESHOLDS = {
  vix:   { normal: [0, 18],   elevated: [18, 28],   extreme: [28, 100],  weight: 25 },
  move:  { normal: [0, 100],  elevated: [100, 130],  extreme: [130, 200], weight: 20 },
  igOAS: { normal: [0, 100],  elevated: [100, 150],  extreme: [150, 300], weight: 15 },
  hyOAS: { normal: [0, 300],  elevated: [300, 500],  extreme: [500, 1000],weight: 15 },
  dxy:   { normal: [90, 100], elevated: [100, 105],  extreme: [105, 120], weight: 10 },
  brent: { normal: [60, 85],  elevated: [85, 100],   extreme: [100, 150], weight: 10 },
  gold:  { normal: [1800, 3000], elevated: [3000, 4500], extreme: [4500, 8000], weight: 5 },
};

/**
 * Score a single asset's stress level (0-100)
 * 0 = calm, 50 = elevated, 100 = extreme
 */
function scoreAssetStress(value, thresholds) {
  if (!thresholds || value == null) return 0;
  const { normal, elevated, extreme } = thresholds;

  if (value <= normal[1]) return mapRange(value, normal[0], normal[1], 0, 25);
  if (value <= elevated[1]) return mapRange(value, elevated[0], elevated[1], 25, 65);
  return mapRange(value, extreme[0], extreme[1], 65, 100);
}

function mapRange(value, inMin, inMax, outMin, outMax) {
  if (inMax === inMin) return outMin;
  const clamped = Math.max(inMin, Math.min(inMax, value));
  return outMin + ((clamped - inMin) / (inMax - inMin)) * (outMax - outMin);
}

/**
 * Classify stress level from composite score
 */
function classifyStress(score) {
  if (score >= 70) return { level: 'EXTREME', color: '#ef4444', action: 'De-risk immediately' };
  if (score >= 50) return { level: 'ELEVATED', color: '#f59e0b', action: 'Hedge and reduce exposure' };
  if (score >= 30) return { level: 'MODERATE', color: '#eab308', action: 'Monitor closely' };
  return { level: 'CALM', color: '#22c55e', action: 'Maintain positions' };
}

/**
 * Compute cross-asset stress state from market data
 */
export function computeCrossAssetStressState(marketData) {
  if (!marketData) return null;

  const assets = {
    vix:   { value: marketData.vix || 0,    label: 'VIX (Equity Vol)' },
    move:  { value: marketData.move || 0,   label: 'MOVE (Rate Vol)' },
    igOAS: { value: marketData.igOAS || 0,  label: 'IG Credit Spread' },
    hyOAS: { value: marketData.hyOAS || 0,  label: 'HY Credit Spread' },
    dxy:   { value: marketData.dxy || 0,    label: 'Dollar Index (DXY)' },
    brent: { value: marketData.brent || 0,  label: 'Brent Crude' },
    gold:  { value: marketData.gold || 0,   label: 'Gold' },
  };

  // Score each asset
  const scored = Object.entries(assets).map(([key, asset]) => {
    const threshold = THRESHOLDS[key];
    const score = +scoreAssetStress(asset.value, threshold).toFixed(1);
    const classification = classifyStress(score);

    return {
      key,
      label: asset.label,
      value: asset.value,
      score,
      level: classification.level,
      color: classification.color,
      weight: threshold?.weight || 10,
    };
  });

  // Compute weighted composite stress score
  const totalWeight = scored.reduce((s, a) => s + a.weight, 0);
  const compositeScore = totalWeight > 0
    ? +(scored.reduce((s, a) => s + a.score * a.weight, 0) / totalWeight).toFixed(1)
    : 0;

  const composite = classifyStress(compositeScore);

  // Identify top stress contributors
  const topStressors = [...scored].sort((a, b) => b.score - a.score).slice(0, 3);

  // Contagion risk: if multiple assets in elevated/extreme, systemic risk rises
  const elevatedCount = scored.filter(a => a.score >= 50).length;
  const contagionRisk = elevatedCount >= 4 ? 'HIGH' : elevatedCount >= 2 ? 'MEDIUM' : 'LOW';

  return {
    compositeScore,
    compositeLevel: composite.level,
    compositeColor: composite.color,
    compositeAction: composite.action,
    assets: scored,
    topStressors: topStressors.map(s => ({ label: s.label, score: s.score, level: s.level })),
    contagionRisk,
    elevatedAssets: elevatedCount,
    timestamp: new Date().toISOString(),
  };
}
