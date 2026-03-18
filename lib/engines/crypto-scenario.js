// =========================================================================
// LIFESTACK OS — CRYPTO SCENARIO LAB
// Phase 2: Finance Operating System
// Stress test crypto portfolio under predefined macro scenarios
// =========================================================================

/**
 * Predefined stress scenarios with shock multipliers (% change)
 */
const SCENARIOS = [
  {
    name: 'Bear Capitulation',
    description: 'Full crypto bear market with cascading liquidations',
    btcShock: -60,
    ethShock: -70,
    solShock: -80,
    otherShock: -85,
  },
  {
    name: 'Regulatory Crackdown',
    description: 'Major regulatory action against crypto exchanges and DeFi',
    btcShock: -40,
    ethShock: -50,
    solShock: -60,
    otherShock: -70,
  },
  {
    name: 'BTC Supercycle',
    description: 'Bitcoin supercycle driven by institutional adoption and halving',
    btcShock: 200,
    ethShock: 120,
    solShock: 180,
    otherShock: 250,
  },
  {
    name: 'ETH Flippening',
    description: 'Ethereum surpasses Bitcoin by market cap on network effects',
    btcShock: 0,
    ethShock: 150,
    solShock: 80,
    otherShock: 60,
  },
  {
    name: 'Black Swan',
    description: 'Systemic failure — major stablecoin depeg or exchange collapse',
    btcShock: -80,
    ethShock: -85,
    solShock: -90,
    otherShock: -95,
  },
];

/**
 * Known major crypto tickers mapped to canonical bucket
 */
const CANONICAL_MAP = {
  BTC: 'BTC', BITCOIN: 'BTC', WBTC: 'BTC', GBTC: 'BTC', IBIT: 'BTC',
  ETH: 'ETH', ETHEREUM: 'ETH', WETH: 'ETH', STETH: 'ETH', ETHE: 'ETH',
  SOL: 'SOL', SOLANA: 'SOL',
};

/**
 * Map a holding ticker to a shock bucket
 */
function toBucket(ticker) {
  const upper = (ticker || '').toUpperCase();
  return CANONICAL_MAP[upper] || 'OTHER';
}

/**
 * Filter holdings to crypto only
 */
function filterCryptoHoldings(holdings) {
  return holdings.filter(h => {
    const sleeve = (h.sleeve || h.assetClass || '').toLowerCase();
    return sleeve.includes('crypto') || sleeve.includes('digital');
  });
}

/**
 * Apply a scenario's shocks to crypto holdings and compute portfolio impact
 */
function applyScenario(cryptoHoldings, totalCryptoValue, scenario) {
  let scenarioValue = 0;

  const shockMap = {
    BTC: scenario.btcShock,
    ETH: scenario.ethShock,
    SOL: scenario.solShock,
    OTHER: scenario.otherShock,
  };

  for (const h of cryptoHoldings) {
    const bucket = toBucket(h.ticker || h.symbol || '');
    const shock = shockMap[bucket] ?? scenario.otherShock;
    const holdingValue = h.val || 0;
    const shockedValue = holdingValue * (1 + shock / 100);
    scenarioValue += Math.max(0, shockedValue);
  }

  const portfolioImpact = totalCryptoValue > 0
    ? +(((scenarioValue - totalCryptoValue) / totalCryptoValue) * 100).toFixed(2)
    : 0;

  return {
    name: scenario.name,
    description: scenario.description,
    btcShock: scenario.btcShock,
    ethShock: scenario.ethShock,
    solShock: scenario.solShock,
    otherShock: scenario.otherShock,
    portfolioValue: +scenarioValue.toFixed(0),
    portfolioImpact,
    gainLoss: +(scenarioValue - totalCryptoValue).toFixed(0),
  };
}

/**
 * Compute crypto scenario lab from holdings and market data
 *
 * @param {Array} holdings - Full portfolio holdings array
 * @param {Object} marketData - Current market data (unused currently, reserved for dynamic scenarios)
 * @returns {Object|null} Scenario analysis with all 5 stress tests
 */
export function computeCryptoScenarioLab(holdings, marketData) {
  if (!holdings?.length) return null;

  const cryptoHoldings = filterCryptoHoldings(holdings);
  if (!cryptoHoldings.length) return null;

  const totalCryptoValue = cryptoHoldings.reduce((sum, h) => sum + (h.val || 0), 0);
  if (totalCryptoValue <= 0) return null;

  const scenarios = SCENARIOS.map(s => applyScenario(cryptoHoldings, totalCryptoValue, s));

  // Find worst and best cases
  const sorted = [...scenarios].sort((a, b) => a.portfolioImpact - b.portfolioImpact);
  const worstCase = sorted[0];
  const bestCase = sorted[sorted.length - 1];

  // Maximum drawdown across all bearish scenarios
  const maxDrawdown = Math.min(...scenarios.map(s => s.portfolioImpact));
  const maxGain = Math.max(...scenarios.map(s => s.portfolioImpact));

  return {
    currentValue: +totalCryptoValue.toFixed(0),
    holdingCount: cryptoHoldings.length,
    scenarios,
    worstCase: {
      name: worstCase.name,
      impact: worstCase.portfolioImpact,
      value: worstCase.portfolioValue,
      loss: worstCase.gainLoss,
    },
    bestCase: {
      name: bestCase.name,
      impact: bestCase.portfolioImpact,
      value: bestCase.portfolioValue,
      gain: bestCase.gainLoss,
    },
    maxDrawdown,
    maxGain,
    implication: maxDrawdown < -70
      ? `Worst-case scenario (${worstCase.name}) would destroy ${Math.abs(maxDrawdown).toFixed(0)}% of crypto value. Ensure position sizing limits total portfolio risk.`
      : maxDrawdown < -50
        ? `Significant downside risk in stress scenarios. ${worstCase.name} implies ${Math.abs(maxDrawdown).toFixed(0)}% crypto drawdown. Consider hedging tail risk.`
        : 'Crypto portfolio shows moderate stress resilience. Downside scenarios manageable at current allocation size.',
  };
}
