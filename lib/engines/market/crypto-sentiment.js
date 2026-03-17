// =========================================================================
// LIFESTACK OS — CRYPTO SENTIMENT DIVERGENCE ENGINE
// Phase 3: Market Intelligence — Crypto
// Fear/greed divergence vs actual flows and price action
// =========================================================================

/**
 * Clamp a value between min and max
 */
function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}

/**
 * Classify fear/greed index into sentiment zone
 */
function classifySentimentZone(fearGreed) {
  if (fearGreed <= 10) return { zone: 'EXTREME FEAR', color: '#ef4444' };
  if (fearGreed <= 25) return { zone: 'FEAR', color: '#f97316' };
  if (fearGreed <= 45) return { zone: 'MILD FEAR', color: '#f59e0b' };
  if (fearGreed <= 55) return { zone: 'NEUTRAL', color: '#94a3b8' };
  if (fearGreed <= 75) return { zone: 'GREED', color: '#4ade80' };
  if (fearGreed <= 90) return { zone: 'HIGH GREED', color: '#22c55e' };
  return { zone: 'EXTREME GREED', color: '#a855f7' };
}

/**
 * Detect divergence between sentiment and actual market behaviour
 *
 * Bullish divergence: Fear + positive flows/accumulation = smart money buying
 * Bearish divergence: Greed + outflows/distribution = smart money selling
 */
function detectDivergence(fearGreed, etfFlow, drawdown, socialSentiment) {
  const isFearful = fearGreed < 25;
  const isGreedy = fearGreed > 75;
  const hasPositiveFlows = etfFlow > 50;    // >$50M daily inflow
  const hasNegativeFlows = etfFlow < -50;
  const isNearATH = drawdown > -10;         // within 10% of ATH
  const isDeepDrawdown = drawdown < -30;
  const socialBullish = socialSentiment > 60;
  const socialBearish = socialSentiment < 30;

  // Bullish divergence: fear + positive flows or accumulation signals
  if (isFearful && hasPositiveFlows) {
    return {
      type: 'bullish_divergence',
      strength: fearGreed < 15 && etfFlow > 200 ? 'STRONG' : 'MODERATE',
      description: 'Fear dominant but institutional flows positive — smart money accumulating',
    };
  }

  if (isFearful && isDeepDrawdown && socialBearish) {
    return {
      type: 'bullish_divergence',
      strength: 'MODERATE',
      description: 'Peak fear with deep drawdown and extreme negative social sentiment — contrarian buy zone',
    };
  }

  // Bearish divergence: greed + outflows or distribution signals
  if (isGreedy && hasNegativeFlows) {
    return {
      type: 'bearish_divergence',
      strength: fearGreed > 85 && etfFlow < -200 ? 'STRONG' : 'MODERATE',
      description: 'Greed dominant but institutional flows negative — smart money distributing',
    };
  }

  if (isGreedy && isNearATH && socialBullish) {
    return {
      type: 'bearish_divergence',
      strength: 'MODERATE',
      description: 'Euphoria near ATH with extreme social bullishness — contrarian sell zone',
    };
  }

  return {
    type: 'none',
    strength: 'NONE',
    description: 'No significant divergence — sentiment aligns with market behaviour',
  };
}

/**
 * Compute crypto sentiment state from market data
 */
export function computeCryptoSentimentState(marketData) {
  if (!marketData) return null;

  const fearGreed = clamp(marketData.fearGreed || 50, 0, 100);
  const btcDD = marketData.btcDD || 0;             // drawdown from ATH (negative %)
  const btcETFFlow = marketData.btcETFFlow || 0;    // daily ETF flow $M
  const socialSentiment = marketData.socialSentiment || 50; // 0-100

  const sentimentZoneInfo = classifySentimentZone(fearGreed);
  const divergence = detectDivergence(fearGreed, btcETFFlow, btcDD, socialSentiment);

  // Contrarian score: higher = stronger contrarian signal
  // Extreme fear with bullish divergence = strong contrarian buy
  // Extreme greed with bearish divergence = strong contrarian sell
  let contrarianScore = 0;
  if (divergence.type === 'bullish_divergence') {
    contrarianScore = +(((100 - fearGreed) / 100) * (divergence.strength === 'STRONG' ? 100 : 70)).toFixed(1);
  } else if (divergence.type === 'bearish_divergence') {
    contrarianScore = +((-fearGreed / 100) * (divergence.strength === 'STRONG' ? 100 : 70)).toFixed(1);
  }

  const contrarian = {
    score: contrarianScore,
    direction: contrarianScore > 20 ? 'BUY' : contrarianScore < -20 ? 'SELL' : 'HOLD',
    label: contrarianScore > 40 ? 'STRONG BUY'
      : contrarianScore > 20 ? 'BUY'
      : contrarianScore < -40 ? 'STRONG SELL'
      : contrarianScore < -20 ? 'SELL'
      : 'NO SIGNAL',
  };

  return {
    fearGreed,
    sentimentZone: sentimentZoneInfo.zone,
    sentimentColor: sentimentZoneInfo.color,
    divergenceType: divergence.type,
    divergenceStrength: divergence.strength,
    divergenceDescription: divergence.description,
    contrarian,
    socialSentiment,
    btcDrawdown: btcDD,
    implication: divergence.type === 'bullish_divergence'
      ? `Bullish divergence detected (${divergence.strength}). ${divergence.description}. Consider accumulating on weakness.`
      : divergence.type === 'bearish_divergence'
        ? `Bearish divergence detected (${divergence.strength}). ${divergence.description}. Consider taking profits or hedging.`
        : fearGreed < 30
          ? 'Market in fear territory but no divergence yet. Monitor flows for contrarian signal.'
          : fearGreed > 70
            ? 'Market in greed territory but no divergence yet. Watch for distribution signals.'
            : 'Sentiment neutral with no divergence. No contrarian signal — follow trend.',
  };
}
