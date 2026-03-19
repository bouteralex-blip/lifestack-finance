/**
 * LifeStack Finance - Canonical State Schema
 * Phase 1: Truth Layer - Canonical state objects with freshness metadata
 * 
 * Defines the complete state architecture for the live agentic intelligence system
 * Includes nullsafe shapes, freshness tracking, and source provenance
 */

// ============================================================================
// FRESHNESS CONSTANTS
// ============================================================================

const FRESHNESS_LEVELS = {
  LIVE: { level: 0, label: 'Live', color: '#10b981', timeout: 60000 },           // 1 min
  CACHED_FRESH: { level: 1, label: 'Cached (Fresh)', color: '#3b82f6', timeout: 300000 }, // 5 min
  CACHED_STALE: { level: 2, label: 'Cached (Stale)', color: '#f59e0b', timeout: 900000 }, // 15 min
  FALLBACK: { level: 3, label: 'Fallback', color: '#ef4444', timeout: null },     // Manual refresh
};

const SOURCE_TYPES = {
  LIVE_API: 'live_api',
  SUPABASE: 'supabase',
  CACHE: 'cache',
  COMPUTED: 'computed',
  FALLBACK: 'fallback',
  AGENT: 'agent',
};

// ============================================================================
// HELPER: Freshness Metadata Factory
// ============================================================================

const createFreshness = (sourceType, timestamp = Date.now()) => ({
  sourceType,
  timestamp,
  age: 0, // Updated on read
  level: FRESHNESS_LEVELS.LIVE,
  isStale: false,
  lastUpdated: timestamp,
});

const createNullState = (name) => ({
  _state: 'null',
  _name: name,
  _freshness: {
    sourceType: SOURCE_TYPES.FALLBACK,
    timestamp: null,
    age: null,
    level: FRESHNESS_LEVELS.FALLBACK,
    isStale: true,
  },
});

// ============================================================================
// PHASE 1: CANONICAL STATE OBJECTS
// ============================================================================

/**
 * Portfolio State
 * Core holdings, NAV, sleeve allocations, cash flow projections
 */
const portfolioState = {
  netWorth: {
    current: 0,
    sixMonthAgo: 0,
    oneYearAgo: 0,
    change: 0,
    change6m: 0,
    change1y: 0,
  },
  assets: 0,
  liabilities: 0,
  cashFlow: {
    monthly: [],
    annual: 0,
    runway: 0,
  },
  sleeves: [],
  holdings: [],
  performance: {
    twr: 0,
    mwr: 0,
    xirr: 0,
    benchmarkReturn: 0,
    activeReturn: 0,
  },
  risk: {
    sharpe: 0,
    sortino: 0,
    maxDrawdown: 0,
    volatility: 0,
  },
  _freshness: createFreshness(SOURCE_TYPES.SUPABASE),
};

/**
 * Market Regime State
 * Macro regime classification, interest rate environment, credit conditions
 */
const marketRegimeState = {
  macro: {
    regimeLabel: 'neutral', // bull / bear / neutral / correction
    confidence: 0.5,
    drivers: [],
    changePoints: [],
  },
  ratesCredit: {
    riskFreRate: 0,
    creditSpread: 0,
    yieldCurve: 'normal', // normal / flat / inverted
    creditTrend: 'stable', // deteriorating / stable / improving
  },
  equityRegime: {
    trend: 'neutral',
    volatilityRegime: 'normal',
    sectorRotation: [],
  },
  timestamp: Date.now(),
  _freshness: createFreshness(SOURCE_TYPES.AGENT),
};

/**
 * Rates & Credit State
 * Interest rates, credit spreads, duration, curve positioning
 */
const ratesCreditState = {
  riskFreeRate: 0,
  realRates: 0,
  creditSpreads: {
    ig: 0,
    hy: 0,
    trend: 'stable',
  },
  yieldCurve: {
    shape: 'normal', // normal / flat / inverted
    slope: 0,
    duration: 0,
  },
  centralBankPolicy: {
    stance: 'neutral', // hawkish / neutral / dovish
    nextMeeting: null,
    expectedMove: 0,
  },
  _freshness: createFreshness(SOURCE_TYPES.LIVE_API),
};

/**
 * Flows & Positioning State
 * ETF flows, institutional positioning, positioning limits
 */
const flowsPositioningState = {
  flows: {
    equityFlows: 0,
    bondFlows: 0,
    cryptoFlows: 0,
    commodityFlows: 0,
  },
  positioning: {
    sentiment: 0, // -100 to +100
    leverageLevel: 0,
    crowdedness: 0,
  },
  liquidity: {
    bidAskSpread: 0,
    volumeTrend: 'normal',
  },
  _freshness: createFreshness(SOURCE_TYPES.AGENT),
};

/**
 * Crypto State
 * On-chain metrics, exchange flows, cycle positioning
 */
const cryptoState = {
  btc: {
    price: 0,
    cycle: 'accumulation', // accumulation / markup / distribution / markdown
    onChainHealth: 0,
    whaleActivity: 0,
  },
  eth: {
    price: 0,
    networkHealth: 0,
  },
  flows: {
    exchangeInflow: 0,
    exchangeOutflow: 0,
    netFlow: 0,
  },
  sentiment: 0, // -100 to +100
  _freshness: createFreshness(SOURCE_TYPES.COMPUTED),
};

/**
 * Scenario State
 * Scenario sensitivity, Monte Carlo results, tail risk
 */
const scenarioState = {
  baseCase: {
    returns: 0,
    volatility: 0,
    sharpe: 0,
  },
  bullCase: {
    probability: 0.3,
    returns: 0,
    volatility: 0,
  },
  bearCase: {
    probability: 0.2,
    returns: 0,
    volatility: 0,
  },
  monteCarlo: {
    percentile10: 0,
    percentile50: 0,
    percentile90: 0,
    tailRisk: 0,
  },
  stressTests: [],
  _freshness: createFreshness(SOURCE_TYPES.COMPUTED),
};

/**
 * Capital Efficiency State
 * Tax efficiency, cost efficiency, deployment efficiency
 */
const capitalEfficiencyState = {
  taxEfficiency: {
    realizedGains: 0,
    unrealizedGains: 0,
    harvestedLosses: 0,
    taxRate: 0,
  },
  costEfficiency: {
    totalFees: 0,
    feeRatio: 0,
    feeVsPerformance: 0,
  },
  deploymentEfficiency: {
    cashUtilization: 0,
    leverageUtilization: 0,
    opportunityCost: 0,
  },
  _freshness: createFreshness(SOURCE_TYPES.COMPUTED),
};

/**
 * Action Queue State
 * Pending rebalancing actions, tax harvesting opportunities, tactical recommendations
 */
const actionQueueState = {
  actions: [
    {
      id: null,
      type: 'rebalance', // rebalance / harvest / deploy / hedge / pivot
      priority: 'high', // high / medium / low
      recommendation: '',
      expectedImpact: 0,
      daysUntilStale: 0,
      status: 'pending', // pending / approved / executed / expired
      createdAt: null,
      executedAt: null,
    },
  ],
  summary: {
    totalActions: 0,
    highPriority: 0,
    expectedNetImpact: 0,
  },
  _freshness: createFreshness(SOURCE_TYPES.AGENT),
};

/**
 * Watchlist State
 * Monitored securities, alerts, position monitoring
 */
const watchlistState = {
  securities: [
    {
      symbol: null,
      type: 'equity', // equity / bond / crypto / commodity
      reason: '', // concentration / thesis / risk
      targetAllocation: 0,
      currentAllocation: 0,
      changeAlert: 0, // trigger alert if moves X%
    },
  ],
  alerts: [
    {
      id: null,
      symbol: null,
      type: 'price', // price / allocation / volatility / flow
      triggered: false,
      threshold: 0,
      currentValue: 0,
    },
  ],
  _freshness: createFreshness(SOURCE_TYPES.AGENT),
};

/**
 * Decision Log
 * Historical decisions, rationale, outcomes
 */
const decisionLog = {
  decisions: [
    {
      id: null,
      date: null,
      category: 'rebalance', // rebalance / tactical / deployment / hedging
      description: '',
      expectedOutcome: '',
      actualOutcome: null,
      rationale: '',
      decision: '',
      executor: 'user', // user / agent
      status: 'pending', // pending / executed / abandoned
      review: null,
    },
  ],
  insights: {
    successRate: 0,
    averageOutcome: 0,
    topDriver: '',
  },
  _freshness: createFreshness(SOURCE_TYPES.AGENT),
};

/**
 * Weekly Synthesis State
 * Aggregated intelligence, key themes, action summary
 */
const weeklySynthesisState = {
  week: null, // ISO week number
  themes: {
    macro: '',
    portfolio: '',
    opportunities: '',
    risks: '',
  },
  topInsights: [],
  topActions: [],
  recommendations: [],
  sentiment: 0, // -100 to +100 (bearish to bullish)
  _freshness: createFreshness(SOURCE_TYPES.AGENT),
};

/**
 * Dashboard Freshness State
 * Last update times, sync status, error states
 */
const dashboardFreshnessState = {
  lastSyncTime: Date.now(),
  syncStatus: 'synced', // syncing / synced / error / offline
  components: {
    portfolio: {
      lastUpdate: null,
      age: 0,
      freshness: FRESHNESS_LEVELS.LIVE,
      status: 'ok',
    },
    markets: {
      lastUpdate: null,
      age: 0,
      freshness: FRESHNESS_LEVELS.LIVE,
      status: 'ok',
    },
    agents: {
      lastUpdate: null,
      age: 0,
      freshness: FRESHNESS_LEVELS.LIVE,
      status: 'ok',
    },
  },
  errors: [],
  warnings: [],
  _freshness: createFreshness(SOURCE_TYPES.COMPUTED),
};

// ============================================================================
// COMPOSITE STATE: The Complete Truth Layer
// ============================================================================

const canonicalStateSchema = {
  portfolio: portfolioState,
  marketRegime: marketRegimeState,
  ratesCredit: ratesCreditState,
  flowsPositioning: flowsPositioningState,
  crypto: cryptoState,
  scenario: scenarioState,
  capitalEfficiency: capitalEfficiencyState,
  actionQueue: actionQueueState,
  watchlist: watchlistState,
  decisionLog: decisionLog,
  weeklySynthesis: weeklySynthesisState,
  dashboardFreshness: dashboardFreshnessState,
};

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = {
  // Constants
  FRESHNESS_LEVELS,
  SOURCE_TYPES,

  // Factories
  createFreshness,
  createNullState,

  // Individual state objects
  portfolioState,
  marketRegimeState,
  ratesCreditState,
  flowsPositioningState,
  cryptoState,
  scenarioState,
  capitalEfficiencyState,
  actionQueueState,
  watchlistState,
  decisionLog,
  weeklySynthesisState,
  dashboardFreshnessState,

  // Complete schema
  canonicalStateSchema,
};
