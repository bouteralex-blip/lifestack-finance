// =========================================================================
// LIFESTACK OS — NARRATIVE PULSE ENGINE
// Phase 3: Market Intelligence
// Top market narratives/themes with momentum scoring and phase detection
// =========================================================================

/** Utility: clamp value between min and max */
function clamp(v, min = 0, max = 100) {
  return Math.max(min, Math.min(max, v));
}

/**
 * Default narratives representing current market themes
 */
const DEFAULT_NARRATIVES = [
  { theme: 'AI / Tech',           momentum: 78, sentiment: 72 },
  { theme: 'Tariffs',             momentum: 65, sentiment: -40 },
  { theme: 'Rate Cuts',           momentum: 52, sentiment: 35 },
  { theme: 'Crypto',              momentum: 60, sentiment: 55 },
  { theme: 'Deglobalization',     momentum: 45, sentiment: -20 },
  { theme: 'Energy Transition',   momentum: 40, sentiment: 30 },
  { theme: 'China Recovery',      momentum: 35, sentiment: -15 },
  { theme: 'Defence Spending',    momentum: 70, sentiment: 50 },
];

/**
 * Classify narrative phase based on momentum and sentiment
 */
function classifyPhase(momentum, sentiment) {
  if (momentum > 70 && sentiment > 40) return 'euphoria';
  if (momentum > 50 && sentiment > 0) return 'expansion';
  if (momentum > 30 && sentiment < 0) return 'skepticism';
  if (momentum < 30) return 'exhaustion';
  return 'maturation';
}

/**
 * Compute narrative pulse state from market data
 */
export function computeNarrativePulseState(marketData) {
  if (!marketData) return null;

  const rawNarratives = marketData.narratives || DEFAULT_NARRATIVES;

  const topNarratives = rawNarratives.map(n => {
    const momentum = clamp(n.momentum ?? 50);
    const sentiment = n.sentiment ?? 0;
    const phase = classifyPhase(momentum, sentiment);

    return {
      theme: n.theme,
      momentum,
      sentiment,
      phase,
    };
  }).sort((a, b) => b.momentum - a.momentum);

  // Dominant theme = highest momentum
  const dominantTheme = topNarratives[0]?.theme || 'Unknown';

  // Risk narrative = most negative sentiment with notable momentum
  const riskNarrative = topNarratives
    .filter(n => n.sentiment < 0 && n.momentum > 30)
    .sort((a, b) => a.sentiment - b.sentiment)[0]?.theme || 'None';

  // Build implication from dominant theme phase
  const dominantPhase = topNarratives[0]?.phase || 'maturation';
  let implication;
  if (dominantPhase === 'euphoria') {
    implication = `'${dominantTheme}' narrative in euphoria phase — crowding risk elevated. Watch for reversal triggers.`;
  } else if (dominantPhase === 'expansion') {
    implication = `'${dominantTheme}' narrative expanding — momentum supportive but monitor for peak sentiment.`;
  } else if (dominantPhase === 'skepticism') {
    implication = `'${dominantTheme}' narrative faces skepticism — contrarian opportunity if fundamentals hold.`;
  } else {
    implication = `'${dominantTheme}' narrative maturing — look for next rotation catalyst.`;
  }

  return {
    topNarratives,
    dominantTheme,
    riskNarrative,
    implication,
  };
}
