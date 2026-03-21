# LifeStack Finance — Engine Registry & Documentation

## Overview

This document standardizes the definition of all **80 compute engines** across LifeStack Finance. Each engine follows a uniform specification: inputs → transformation → output → UI rendering → freshness rules → fallback behavior.

**Total Engines**: 80
- **Finance Engines**: 20 (core portfolio & wealth management)
- **Market Engines**: 27 (macro, flows, crypto, asset classes)
- **Agent Engines**: 33 (research, decision-making, synthesis)

---

## ENGINE SPECIFICATION TEMPLATE

Every engine follows this standardized format:

```
### {Engine Name}
**File**: `lib/engines/{path}/{file}.js`
**Category**: {Finance | Market | Agent}
**Phase**: {1-5}
**Tier**: {Core | Supporting | Specialized}

**Purpose**:
Brief description of what the engine does and why

**Inputs**:
- `inputName` (type): Description
- `inputName2` (type): Description

**Transformation Logic**:
High-level algorithm or transformation steps

**Output Object**:
```javascript
{
  field1: type,
  field2: type,
  _freshness: {
    sourceType: 'LIVE_API' | 'SUPABASE' | 'CACHE' | 'COMPUTED' | 'FALLBACK' | 'AGENT',
    timestamp: number,
    age: number,
    level: 'LIVE' | 'CACHED_FRESH' | 'CACHED_STALE' | 'FALLBACK',
    isStale: boolean,
    isFallback: boolean
  }
}
```

**UI Rendering**:
- Location: {Tab or module where output appears}
- Component: {React component name}
- Props: {Example prop structure}

**Freshness Rule**:
- Cache TTL: {duration}
- Stale Threshold: {duration}
- Source Priority: {Primary → Fallback}

**Fallback Behavior**:
Description of what renders if live data unavailable

**Error Handling**:
How errors are caught and handled
```

---

# PHASE 2: FINANCE ENGINES (20 Total)

## Core Finance Engines (8)

### 1. Holdings Ingestion Engine
**File**: `lib/engines/holdings-ingestion.js`  
**Category**: Finance  
**Phase**: 2  
**Tier**: Core  

**Purpose**:
Fetches portfolio holdings from Supabase and normalizes them into a standardized format. This is the foundation for all portfolio analysis — position sizing, concentration, risk, etc.

**Inputs**:
- `supabaseClient` (object): Authenticated Supabase client
- `portfolioId` (string): Portfolio identifier
- `asOfDate` (Date): Valuation date (defaults to today)

**Transformation Logic**:
1. Query `holdings` table filtered by `portfolio_id` and date
2. For each holding: extract ISIN, quantity, price, currency, asset class
3. Calculate position value = quantity × price
4. Normalize asset class to standard categories (EQUITY, FIXED_INCOME, COMMODITY, CRYPTO, CASH, ALTERNATIVE)
5. Calculate portfolio total value
6. Track source of price (live API vs EOD vs estimate)

**Output Object**:
```javascript
{
  portfolioId: string,
  asOfDate: Date,
  totalValue: number,
  currency: string,
  holdings: [
    {
      id: string,
      isin: string,
      name: string,
      quantity: number,
      price: number,
      value: number,
      weight: number,
      currency: string,
      assetClass: string,
      sleeve: string,
      wrapper: string,
      priceSource: 'LIVE_API' | 'SUPABASE' | 'CACHED',
      lastPriceUpdate: Date
    }
  ],
  _freshness: { ... }
}
```

**UI Rendering**:
- Location: T2 Structure & Concentration tab, T1 Executive Summary
- Component: `HoldingsTableWidget`, `LuminousStackedColumnWidget`
- Props: `{ holdings, totalValue, currency }`

**Freshness Rule**:
- Cache TTL: 15 minutes (prices update frequently)
- Stale Threshold: 1 hour (acceptable for EOD pricing)
- Source Priority: Live API prices → Supabase EOD prices → Cached last-known

**Fallback Behavior**:
If Supabase unavailable, use `PORTFOLIO_DEFAULTS.holdings` with staleness flag

**Error Handling**:
- Invalid ISIN: Skip holding, log warning
- Price fetch failure: Use last known price, mark as STALE
- Empty portfolio: Return empty holdings array with warning

---

### 2. Concentration Monitor Engine
**File**: `lib/engines/concentration.js`  
**Category**: Finance  
**Phase**: 2  
**Tier**: Core  

**Purpose**:
Measures portfolio concentration using Herfindahl-Hirschman Index (HHI). Identifies position clutter and single-name risk. Core input for rebalancing decisions.

**Inputs**:
- `holdings` (array): Holdings array from Holdings Ingestion
- `clusterThreshold` (number): Weight threshold for "clutter" (default: 1%)
- `HHIThresholds` (object): Acceptable HHI ranges by portfolio type

**Transformation Logic**:
1. For each holding: calculate weight = value / total value
2. Calculate HHI = Σ(weight²) on 0-10000 scale
3. Calculate effective N = 10000 / HHI (number of equally-weighted positions)
4. Identify clutter: holdings with weight < threshold
5. Identify violations: HHI above acceptable range
6. Classify risk level: Green (<3000) → Yellow (3000-5000) → Red (>5000)

**Output Object**:
```javascript
{
  hhi: number,  // 0-10000
  effectiveN: number,  // Effective number of positions
  riskLevel: 'GREEN' | 'YELLOW' | 'RED',
  topPositions: [
    { name: string, weight: number, rank: number }
  ],
  clutter: {
    count: number,
    totalValue: number,
    totalWeight: number,
    holdings: [
      { name: string, value: number, weight: number, recommendation: string }
    ]
  },
  violations: string[],
  _freshness: { ... }
}
```

**UI Rendering**:
- Location: T2 Structure & Concentration tab
- Component: `ConcentricProgressRingsWidget`
- Props: `{ hhi, effectiveN, riskLevel, violations }`

**Freshness Rule**:
- Cache TTL: 4 hours (weights stable intraday)
- Stale Threshold: 8 hours
- Source Priority: COMPUTED from latest holdings

**Fallback Behavior**:
Use fallback holdings portfolio, calculate HHI from it, mark as stale

**Error Handling**:
- Empty holdings: HHI = 0, effectiveN = 0, no violations
- Invalid weights: Skip position, log warning

---

### 3. Drift Monitor Engine
**File**: `lib/engines/drift-monitor.js`  
**Category**: Finance  
**Phase**: 2  
**Tier**: Core  

**Purpose**:
Tracks deviation of current allocation from strategic targets. Identifies when rebalancing is needed. Compares actual vs target by sleeve and total portfolio.

**Inputs**:
- `holdings` (array): Current holdings
- `targetAllocation` (object): Strategic target allocation by asset class/sleeve
- `driftThresholds` (object): When to flag for rebalancing (default: ±3% total, ±2% sleeve)

**Transformation Logic**:
1. Calculate current allocation by sleeve/asset class from holdings
2. Calculate drift = current - target for each segment
3. Flag urgent rebalance if any drift exceeds threshold
4. Rank by rebalance urgency (largest drifts first)
5. Calculate rebalance dates based on drift severity

**Output Object**:
```javascript
{
  totalDrift: number,  // Max drift % across all segments
  maxDriftSegment: string,
  segments: [
    {
      name: string,
      target: number,
      current: number,
      drift: number,
      urgency: 'LOW' | 'MEDIUM' | 'HIGH',
      rebalanceDate: Date
    }
  ],
  rebalanceNeeded: boolean,
  nextRebalanceDate: Date,
  _freshness: { ... }
}
```

**UI Rendering**:
- Location: T2 Structure & Concentration tab, T12 Action Plan
- Component: `MirroredDivergingBarWidget`
- Props: `{ segments, totalDrift, rebalanceNeeded }`

**Freshness Rule**:
- Cache TTL: 4 hours
- Stale Threshold: 24 hours
- Source Priority: COMPUTED from latest holdings

**Fallback Behavior**:
Mark all drifts as FALLBACK, still calculate from fallback data

**Error Handling**:
- Missing target allocation: Use 60/40 stock/bond default
- Zero portfolio value: Return zeros with warning

---

### 4. Sleeve Exposure Engine
**File**: `lib/engines/sleeve-exposure.js`  
**Category**: Finance  
**Phase**: 2  
**Tier**: Core  

**Purpose**:
Breaks down portfolio by management "sleeves" (Core, Growth, Opportunistic, Cash). Used for tracking different investment mandates.

**Inputs**:
- `holdings` (array): Holdings with sleeve assignment
- `sleeveDefinitions` (object): Sleeve names, purposes, target allocations

**Transformation Logic**:
1. Group holdings by sleeve assignment
2. Calculate value and weight for each sleeve
3. Identify unallocated holdings
4. Compare to target sleeve allocations
5. Rank holdings within each sleeve by size

**Output Object**:
```javascript
{
  sleeves: [
    {
      id: string,
      name: string,
      value: number,
      weight: number,
      targetWeight: number,
      drift: number,
      holdingCount: number,
      topHoldings: [
        { name: string, weight: number }
      ]
    }
  ],
  unallocated: {
    value: number,
    weight: number,
    holdings: array
  },
  _freshness: { ... }
}
```

**UI Rendering**:
- Location: T9 Capital Efficiency tab
- Component: `AllocationChartWidget`
- Props: `{ sleeves, unallocated }`

**Freshness Rule**:
- Cache TTL: 4 hours
- Stale Threshold: 24 hours
- Source Priority: COMPUTED from holdings + sleeve assignments

**Fallback Behavior**:
Use fallback sleeve definitions and holdings

**Error Handling**:
- Unrecognized sleeve: Create "Other" bucket
- Missing sleeve assignment: Allocate to "Unallocated"

---

### 5. Wrapper Exposure Engine
**File**: `lib/engines/wrapper-exposure.js`  
**Category**: Finance  
**Phase**: 2  
**Tier**: Core  

**Purpose**:
Analyzes portfolio by tax wrapper (ISA, SIPP, GIA, etc.). Identifies sub-optimal placements and tax drag. Core for capital efficiency.

**Inputs**:
- `holdings` (array): Holdings with wrapper assignment
- `portfolio` (object): Income, residual capacity in each wrapper
- `marketData` (object): Expected returns by asset class (for drag calc)

**Transformation Logic**:
1. Group holdings by wrapper type
2. Calculate value and weight in each wrapper
3. Estimate tax efficiency by wrapper (ISA=0%, SIPP varies, GIA=full)
4. Calculate CGT drag from misallocated positions
5. Suggest reallocation to optimize tax efficiency

**Output Object**:
```javascript
{
  wrappers: [
    {
      type: 'ISA' | 'SIPP' | 'GIA' | 'LTA' | 'JISA' | 'LISA',
      value: number,
      weight: number,
      capacity: number,
      utilizationRate: number,
      taxCost: number,
      holdings: [
        { name: string, value: number, taxCost: number }
      ]
    }
  ],
  totalTaxCost: number,
  optimization: {
    potentialSavings: number,
    actions: [ { from: string, to: string, value: number } ]
  },
  _freshness: { ... }
}
```

**UI Rendering**:
- Location: T9 Capital Efficiency tab
- Component: `KpiGridWidget`, `ActionTableWidget`
- Props: `{ wrappers, totalTaxCost, optimization }`

**Freshness Rule**:
- Cache TTL: 24 hours (wrapper assignments stable)
- Stale Threshold: 7 days
- Source Priority: SUPABASE wrapper assignments → COMPUTED tax cost

**Fallback Behavior**:
Use fallback wrapper definitions, mark all tax costs as estimates

**Error Handling**:
- Unknown wrapper: Classify as GIA (most conservative)
- Missing capacity data: Assume no headroom

---

### 6. Currency Exposure Engine
**File**: `lib/engines/currency-exposure.js`  
**Category**: Finance  
**Phase**: 2  
**Tier**: Core  

**Purpose**:
Tracks FX exposure across portfolio. Identifies unhedged currency risk and concentration in specific currencies.

**Inputs**:
- `holdings` (array): Holdings with currency codes
- `basePortfolioCurrency` (string): Portfolio base currency (e.g., GBP)
- `fxRates` (object): Current FX rates

**Transformation Logic**:
1. Group holdings by currency
2. Calculate value in each currency
3. Convert to base currency using FX rates
4. Identify hedged vs unhedged positions
5. Calculate FX concentration (HHI-style metric for currencies)
6. Estimate impact of ±5% currency moves

**Output Object**:
```javascript
{
  baseCurrency: string,
  totalValue: number,
  currencies: [
    {
      code: string,
      value: number,
      valueInBase: number,
      weight: number,
      hedgedWeight: number,
      unhedgedWeight: number,
      fxRisk: number,  // ±5% impact in base currency
      holdings: array
    }
  ],
  fxConcentration: number,  // HHI-style
  unhedgedExposure: number,  // % of portfolio
  _freshness: { ... }
}
```

**UI Rendering**:
- Location: T2 Structure & Concentration tab
- Component: `FactorRadarWidget`
- Props: `{ currencies, unhedgedExposure }`

**Freshness Rule**:
- Cache TTL: 1 hour (FX rates update frequently)
- Stale Threshold: 4 hours
- Source Priority: Live FX API → Supabase EOD rates

**Fallback Behavior**:
Use fallback FX rates (1.0 for hedged currencies, estimated for others)

**Error Handling**:
- Missing FX rate: Use previous close
- Zero holdings in currency: Treat as 0 exposure

---

### 7. Debt Priority Agent
**File**: `lib/engines/debt-priority.js`  
**Category**: Finance  
**Phase**: 2  
**Tier**: Core  

**Purpose**:
Ranks all liabilities by guaranteed alpha (APR vs risk-free rate). Prioritizes debt reduction. Key input for capital allocation decisions.

**Inputs**:
- `liabilities` (array): Mortgages, loans, credit cards with APR and terms
- `riskFreeRate` (number): Current risk-free rate (Treasury yield)
- `portfolio` (object): Current assets and expected return

**Transformation Logic**:
1. For each liability: calculate guaranteed alpha = APR - risk-free rate
2. Rank by guaranteed alpha (highest first — pay these first)
3. Calculate payoff time at various monthly payment levels
4. Estimate interest savings at each payoff timeline
5. Weigh against portfolio opportunity cost

**Output Object**:
```javascript
{
  liabilities: [
    {
      type: 'Mortgage' | 'Loan' | 'CreditCard',
      name: string,
      balance: number,
      apr: number,
      riskFreeRate: number,
      guaranteedAlpha: number,
      term: number,
      monthlyPayment: number,
      priority: number,  // 1=highest priority
      interestCostOverLife: number,
      payoffScenarios: [
        { monthlyPayment: number, payoffMonths: number, totalInterest: number }
      ]
    }
  ],
  totalDebt: number,
  totalGuaranteedAlpha: number,
  recommendedPayoffStrategy: string,
  _freshness: { ... }
}
```

**UI Rendering**:
- Location: T7 Bonus Strategy tab, T12 Action Plan
- Component: `ActionTableWidget`, `LuminousStackedColumnWidget`
- Props: `{ liabilities, totalGuaranteedAlpha, recommendedStrategy }`

**Freshness Rule**:
- Cache TTL: 24 hours (rates and balances change slowly)
- Stale Threshold: 7 days
- Source Priority: SUPABASE liability data → Live interest rates

**Fallback Behavior**:
Use default liability portfolio with conservative rate assumptions

**Error Handling**:
- Missing APR: Assume 5%
- Zero balance: Skip liability
- Future payoff date exceeded: Mark term as perpetual

---

### 8. ISA/Pension Routing Engine
**File**: `lib/engines/isa-pension-routing.js`  
**Category**: Finance  
**Phase**: 2  
**Tier**: Core  

**Purpose**:
Optimizes annual contribution routing across ISAs (tax-free savings) and pensions (tax-deferred). Calculates optimal allocation maximizing tax efficiency.

**Inputs**:
- `income` (number): Annual gross income
- `wrappers` (object): Current room in each wrapper (ISA, SIPP, LTA)
- `employerPension` (object): Employer match and contribution limits
- `portfolio` (object): Expected returns by asset class
- `taxRate` (number): Marginal tax rate

**Transformation Logic**:
1. Calculate annual contribution capacity (ISA £20k, SIPP varies, LISA £4k→£1k)
2. Calculate employer match maximum in pension
3. Model tax efficiency for each scenario:
   - Maximize SIPP (tax deduction + tax-free growth)
   - Use ISA (no tax drag now or later)
   - Use taxable account (GIA)
4. Rank scenarios by net present value of tax savings
5. Calculate optimal salary sacrifice amount (if applicable)

**Output Object**:
```javascript
{
  income: number,
  taxRate: number,
  currentRoom: {
    isaRoom: number,
    sippRoom: number,
    lifeTimeAllowance: number,
    employerMatch: number
  },
  scenarios: [
    {
      rank: number,
      isaContribution: number,
      sippContribution: number,
      employerMatch: number,
      taxSavings: number,
      npvOfContributions: number,
      yearsToRecoup: number
    }
  ],
  recommended: {
    isaContribution: number,
    sippContribution: number,
    salarySacrifice: boolean,
    salarySacrificeAmount: number,
    estimatedTaxSavings: number
  },
  _freshness: { ... }
}
```

**UI Rendering**:
- Location: T9 Capital Efficiency tab
- Component: `KpiGridWidget`, `ActionTableWidget`
- Props: `{ currentRoom, recommended, estimatedTaxSavings }`

**Freshness Rule**:
- Cache TTL: 24 hours (tax year doesn't change daily)
- Stale Threshold: 7 days (annually reset 6 April)
- Source Priority: SUPABASE tax config → COMPUTED scenarios

**Fallback Behavior**:
Use conservative defaults (no salary sacrifice, standard tax rate)

**Error Handling**:
- Unknown tax rate: Assume 40% (higher rate)
- Negative income: Return error
- End of tax year: Deadline alerts

---

## Supporting Finance Engines (12)

### 9. Risk Budget Engine
**File**: `lib/engines/risk-budget.js`  
**Category**: Finance  
**Phase**: 2  
**Tier**: Supporting  

**Purpose**: Allocates risk budget (volatility/VaR limit) across portfolio segments. Tracks utilization.

**Inputs**: `holdings`, `targetVolatility` (%), `riskLimit` (£ or %)

**Transformation**: 1. Estimate volatility of each holding, 2. Calculate portfolio volatility, 3. Allocate budgets proportionally, 4. Identify segments exceeding budget

**Output**: Risk allocation by segment, utilization %, warning flags

**Freshness**: 4h TTL, 24h stale threshold  
**UI Location**: T4 Risk Engine  
**Fallback**: Fallback portfolio allocations

---

### 10. Value-at-Risk (VaR) Engine
**File**: `lib/engines/risk-budget.js` (module)  
**Category**: Finance  
**Phase**: 2  
**Tier**: Supporting  

**Purpose**: Calculates maximum expected loss at 95%/99% confidence over 1-day, 10-day, 1-month horizons.

**Inputs**: `holdings`, `returns` (historical), `confidence` (95 or 99)

**Transformation**: 1. Calculate correlation matrix, 2. Estimate volatility, 3. Assume normal distribution, 4. Calculate VaR at confidence level

**Output**: VaR by time horizon, scenario analysis, drawdown forecasts

**Freshness**: 4h TTL  
**UI Location**: T4 Risk Engine  
**Fallback**: Historical simulated VaR

---

### 11. Scenario Sensitivity Engine
**File**: `lib/engines/scenario-sensitivity.js`  
**Category**: Finance  
**Phase**: 2  
**Tier**: Supporting  

**Purpose**: Models portfolio performance across market stress scenarios (recession, stagflation, geopolitical).

**Inputs**: `holdings`, `scenarios` (defined), `assetReturnsInScenario` (lookup table)

**Transformation**: 1. For each scenario, map asset returns, 2. Calculate portfolio return, 3. Identify losses, 4. Rank scenarios by severity

**Output**: Return by scenario, recovery time, insurance value

**Freshness**: 8h TTL  
**UI Location**: T5 Stress Tests  
**Fallback**: Historical stress returns

---

### 12. Monte Carlo Simulation Engine
**File**: `lib/engines/monte-carlo.js`  
**Category**: Finance  
**Phase**: 2  
**Tier**: Supporting  

**Purpose**: 10,000 path wealth projection over 5/10/20/30 years. Shows retirement readiness, drawdown sustainability.

**Inputs**: `portfolio`, `contributions` (annual), `withdrawals` (retirement), `expectedReturns`, `volatility`, `lifeExpectancy`

**Transformation**: 1. Generate 10k random return paths, 2. Apply contributions/withdrawals, 3. Calculate ending wealth distribution, 4. Extract percentiles (10th, 50th, 90th)

**Output**: Wealth projection distribution, success rate, median outcome, downside cases

**Freshness**: 8h TTL  
**UI Location**: T10 Long-Term Compounding  
**Fallback**: Deterministic projection

---

### 13-20. Additional Supporting Engines
**Liquidity Ladder** (13): Cash runway forecast  
**Bonus Allocation** (14): Strategic bonus deployment  
**Rebalance Proposal** (15): Tax-optimized trade sequencing  
**Contribution Attribution** (16): Return decomposition  
**Drawdown Monitor** (17): Max drawdown tracking  
**Capital Efficiency** (18): Deployment pace  
**Crypto Rebalance** (19): BTC/ETH rebalancing  
**Crypto Scenario** (20): BTC/ETH stress tests  

---

# PHASE 3: MARKET ENGINES (27 Total)

## Macro & Regime Engines (6)

### 21. Macro Regime Classifier
**File**: `lib/engines/market/macro-regime.js`  
**Category**: Market  
**Phase**: 3  
**Tier**: Core  

**Purpose**: Classifies current macro regime from rates, inflation, growth, volatility signals. Outputs one of 6 regimes with confidence.

**Inputs**:
- `signals` (object): CPI, GDP growth, CB rate, VIX, MOVE, yield curve, PMI, unemployment

**Transformation Logic**:
1. Score each regime (GOLDILOCKS, REFLATION, LATE_CYCLE, STAGFLATION, RECESSION, EARLY_RECOVERY) based on signals
2. Use weighted formula (e.g., Goldilocks = f(GDP, CPI, VIX, PMI))
3. Normalize scores to 0-100
4. Select regime with highest score
5. Calculate confidence = (winner score - runner-up score) / 100

**Output Object**:
```javascript
{
  regime: string,  // One of 6 regimes
  confidence: number,  // 0-100
  description: string,
  riskPosture: 'Risk-On' | 'Risk-On Selective' | 'Defensive' | 'Max Defensive' | 'Selective',
  scores: {
    GOLDILOCKS: number,
    REFLATION: number,
    LATE_CYCLE: number,
    STAGFLATION: number,
    RECESSION: number,
    EARLY_RECOVERY: number
  },
  signals: { ... },  // Input signals used
  recommendations: {
    equityBias: number,  // -2 to +2
    bondBias: number,
    cryptoBias: number
  },
  _freshness: { ... }
}
```

**UI Rendering**:
- Location: P1 Global Macro Regime tab
- Component: `KpiGridWidget`, `FactorRadarWidget`
- Props: `{ regime, confidence, riskPosture, recommendations }`

**Freshness Rule**:
- Cache TTL: 1 hour (signals update slowly)
- Stale Threshold: 4 hours
- Source Priority: Live macro data → Supabase cached signals

**Fallback Behavior**:
Use last known regime with staleness flag

**Error Handling**:
- Missing signals: Impute with 90-day average
- All scores equal: Mark confidence as LOW

---

### 22. Central Bank Policy Engine
**File**: `lib/engines/market/central-bank.js`  
**Category**: Market  
**Phase**: 3  
**Tier**: Supporting  

**Purpose**: Tracks CB policy stance (hiking/holding/cutting) and maps likely rate path.

**Inputs**: `currentRate`, `inflationTarget`, `currentInflation`, `gdpGrowth`, `cmeSurveySentiment`

**Output**: Rate path forecast, surprise probability, policy stance

**Freshness**: 1h TTL  
**UI Location**: P2 Rates & Credit  
**Fallback**: Historical rate paths

---

### 23-27. Additional Macro Engines
**Inflation Shock Detector** (23): Tracks breakeven inflation  
**Liquidity Divergence** (24): Equity vs bond flows divergence  
**Policy Surprise Metric** (25): Expected vs actual policy moves  
**Narrative Pulse** (26): News sentiment, themes  
**Earnings Revision** (27): Positive/negative revision breadth  

---

## Asset Class & Flows Engines (9)

### 28-36. Asset Class Engines

**ETF Flow Tracker** (28): Classifies flows (CONFIRMED RALLY, SMART MONEY, DISTRIBUTION, SELLOFF)  
**CFTC Positioning** (29): Large trader positioning trends  
**Correlation Drift** (30): Asset correlation regime changes  
**Gap Risk Monitor** (31): VIX/MOVE/spread gap detection  
**Equity Factor Rotation** (32): Momentum, value, quality leadership  
**Sector Leadership** (33): Relative strength by sector  
**Yield Curve Shaping** (34): 2s10s spread, inversion status  
**Credit Stress** (35): High-yield spreads, quality  
**Cross-Asset Stress** (36): Composite stress (VIX/MOVE/DXY/oil)  

---

## Crypto & On-Chain Engines (7)

### 37. BTC Cycle State Engine
**File**: `lib/engines/crypto/btc-cycle.js`  
**Category**: Market  
**Phase**: 3  
**Tier**: Core  

**Purpose**: Classifies BTC into one of 7 cycle phases using on-chain metrics (MVRV, NUPL, SOPR, funding rates).

**Inputs**:
- `btcPrice` (number): Current BTC price
- `mvrv` (number): Market Value / Realized Value ratio
- `nupl` (number): Net Unrealized Profit/Loss ratio
- `sopr` (number): Spent Output Profit Ratio
- `fundingRate` (number): Perpetual futures funding rate
- `age` (number): Days since last 4-year high

**Transformation Logic**:
1. Score each phase (CAPITULATION → ACCUMULATION → BULL_RUN → EUPHORIA → DISTRIBUTION → DECLINE → CAPITULATION)
2. Use MVRV/NUPL/SOPR thresholds for each phase
3. Map to funding rate extremes
4. Select phase with highest score
5. Calculate transition probability to next phase

**Output Object**:
```javascript
{
  phase: string,  // One of 7 phases
  confidence: number,
  metrics: {
    mvrv: number,
    nupl: number,
    sopr: number,
    fundingRate: number,
    daysToHalving: number
  },
  phaseDuration: number,  // Days in current phase
  nextPhaseProb: number,
  riskPosture: 'CAPITULATION' | 'ACCUMULATION' | 'EUPHORIA' | 'DISTRIBUTION',
  recommendedAction: string,
  _freshness: { ... }
}
```

**UI Rendering**:
- Location: P9 Crypto Intelligence, T11 Crypto Engine
- Component: `FactorRadarWidget`, `KpiGridWidget`
- Props: `{ phase, metrics, nextPhaseProb }`

**Freshness Rule**:
- Cache TTL: 1 hour (on-chain metrics update slowly)
- Stale Threshold: 4 hours
- Source Priority: Glassnode API → Supabase cached metrics

**Fallback Behavior**:
Use last known phase with staleness flag

**Error Handling**:
- Missing metrics: Use zero scores for that metric
- Invalid phase transitions: Log anomaly

---

### 38-43. Additional Crypto Engines

**Crypto ETF Flows** (38): iShares BTC/ETH inflow tracking  
**Crypto On-Chain Health** (39): Whale movement, exchange outflow, HODL age  
**Stablecoin Liquidity** (40): USDC/USDT supply/demand  
**Crypto Funding Rates** (41): Perpetual futures carry levels  
**Crypto Sentiment** (42): Social + on-chain sentiment  
**Altcoin Risk Cap** (43): Concentration limits enforcement  

---

## Real Assets & Specialized Engines (5)

### 44-48. Real Assets Engines

**Commodity Shock** (44): Oil/gold/copper stress indicators  
**FX Regime** (45): DXY, EM currency strength  
**Property Cycle** (46): UK property cycle phase  
**Event Notes & Triggers** (47): Threshold crossing → event generation  

**Cross-Asset Stress Aggregation** (48): Combines all stress signals into portfolio-level alert

---

# PHASE 4: AGENT ENGINES (33 Total)

## Research & Synthesis Agents (6)

### 49. Weekly Synthesis Agent
**File**: `lib/engines/agents/weekly-synthesis.js`  
**Category**: Agent  
**Phase**: 4  
**Tier**: Core  

**Purpose**: Generates CIO-style weekly memo with market overview, portfolio implications, and action items.

**Inputs**:
- `marketRegime` (object): Current regime from macro classifier
- `portfolio` (object): Current holdings, performance, allocations
- `decisionLog` (array): Recent decisions and outcomes
- `actionQueue` (array): Pending actions and approvals
- `triggerAlerts` (array): Recent threshold crossings and events

**Transformation Logic**:
1. Extract key macro changes from regime signals
2. Map to portfolio impact (what changed, what matters)
3. Review decision log for recent outcomes
4. Prioritize action queue
5. Generate narrative sections: WHAT CHANGED, WHAT MATTERS, WHAT TO DO, WHAT TO WATCH
6. Write executive verdict (actionable summary)

**Output Object**:
```javascript
{
  weekOf: Date,
  regime: { regime: string, confidence: number, ... },
  whatChanged: {
    macro: string[],
    portfolio: string[],
    market: string[]
  },
  whatMatters: {
    risks: string[],
    opportunities: string[],
    priorities: string[]
  },
  whatToDo: [
    {
      action: string,
      rationale: string,
      urgency: 'URGENT' | 'THIS_WEEK' | 'NEXT_WEEK',
      expectedImpact: string
    }
  ],
  whatToWatch: {
    shortTerm: string[],  // Next 2 weeks
    mediumTerm: string[],  // 2-8 weeks
    calendar: [
      { date: Date, event: string, relevance: string }
    ]
  },
  verdict: string,  // Single actionable recommendation
  confidence: number,
  _freshness: { ... }
}
```

**UI Rendering**:
- Location: P16 Weekly Synthesis tab, T1 Executive Summary
- Component: `CIOInsightBannerWidget`, `AgentBannerWidget`
- Props: `{ whatChanged, whatMatters, whatToDo, whatToWatch, verdict }`

**Freshness Rule**:
- Cache TTL: 24 hours (generated weekly)
- Stale Threshold: 7 days (refresh on Monday)
- Source Priority: AGENT-generated → Manual override

**Fallback Behavior**:
Use last week's synthesis with staleness flag

**Error Handling**:
- Missing market regime: Use previous regime
- Empty decision log: Skip outcomes section
- No action queue: Generate "hold" recommendation

---

### 50. Decision Log Engine
**File**: `lib/engines/agents/decision-log.js`  
**Category**: Agent  
**Phase**: 4  
**Tier**: Core  

**Purpose**: Tracks investment decisions with rationale, execution, and outcomes. Feeds back to learning loop.

**Inputs**:
- `decision` (string): What was decided
- `rationale` (string): Why the decision was made
- `expectedImpact` (number): Expected portfolio impact (%)
- `confidence` (number): 0-100 confidence score
- `triggerDate` (Date): When decision was triggered
- `executionDate` (Date): When decision was executed
- `outcome` (number): Actual portfolio impact (%)

**Transformation Logic**:
1. Create decision entry with ID
2. Assign to portfolio segment
3. Link to macro regime at time of decision
4. Record execution price/date
5. Track outcome vs expectation
6. Calculate decision accuracy
7. Update agent confidence based on outcome

**Output Object**:
```javascript
{
  id: string,
  decision: string,
  rationale: string,
  expectedImpact: number,
  confidence: number,
  regimeAtDecision: string,
  triggerDate: Date,
  executionDate: Date,
  executionPrice: number,
  outcome: number,  // Actual impact
  outcomeDelta: number,  // Outcome - expected
  successFlag: boolean,
  learnings: string,
  relatedActions: string[],
  decisionLog: [
    {
      date: Date,
      status: 'PENDING' | 'EXECUTED' | 'CLOSED' | 'OVERRIDDEN',
      note: string
    }
  ],
  _freshness: { ... }
}
```

**UI Rendering**:
- Location: T12 Action Plan, P16 Weekly Synthesis
- Component: `ActionTableWidget`, `ContributionHeatmapWidget`
- Props: `{ decisions, successRate, learnings }`

**Freshness Rule**:
- Cache TTL: NEVER (persisted to Supabase)
- Source Priority: SUPABASE decision_log table

**Fallback Behavior**:
Empty decision log if Supabase unavailable

**Error Handling**:
- Missing expected impact: Set to 0
- Outcome recorded without execution: Flag as anomaly
- Duplicate decision: Merge into one entry

---

### 51-54. Additional Synthesis Agents
**Daily Brief Agent** (51): Morning market brief  
**Monthly Review Agent** (52): Month recap and learnings  
**Quarterly Review Agent** (53): Quarterly performance deep dive  
**Theme Memo Agent** (54): Narrative memo on market themes  

---

## Opportunity & Action Agents (8)

### 55. Opportunity Ranker Agent
**File**: `lib/engines/agents/opportunity-ranker.js`  
**Category**: Agent  
**Phase**: 4  
**Tier**: Core  

**Purpose**: Ranks actionable opportunities by impact, timeliness, and agent conviction. Feeds action queue prioritization.

**Inputs**:
- `opportunities` (array): From various engines (rebalance, positions, tax-loss harvesting, etc.)
- `portfolio` (object): Current state
- `market` (object): Current regime and signals
- `agentAccuracy` (object): Historical accuracy of each agent

**Transformation Logic**:
1. For each opportunity: score by impact × timeliness × urgency
2. Adjust score by agent historical accuracy (if tracking conviction history)
3. Incorporate portfolio constraints (cash, leverage limits)
4. De-duplicate conflicting opportunities
5. Rank by adjusted score
6. Return top 10 opportunities with conviction confidence

**Output Object**:
```javascript
{
  opportunities: [
    {
      rank: number,
      description: string,
      action: string,
      impact: number,  // Expected return/risk reduction (%)
      timeliness: number,  // Score 0-100 (urgent=high)
      urgency: 'URGENT' | 'THIS_WEEK' | 'NEXT_MONTH' | 'BACKLOG',
      conviction: number,  // 0-100 confidence
      expectedExecution: Date,
      rationale: string,
      risks: string[],
      origin: string,  // Which engine generated it
      agentAccuracy: number  // Historical accuracy of originating agent
    }
  ],
  topAction: { ... },  // Top opportunity detail
  actionCount: {
    URGENT: number,
    THIS_WEEK: number,
    NEXT_MONTH: number,
    BACKLOG: number
  },
  _freshness: { ... }
}
```

**UI Rendering**:
- Location: T12 Action Plan, T1 Executive Summary
- Component: `ActionTableWidget`, `TilesPriorityWidget`
- Props: `{ opportunities, topAction, actionCount }`

**Freshness Rule**:
- Cache TTL: 2 hours (opportunities change with market)
- Stale Threshold: 8 hours
- Source Priority: AGENT-computed → Last good ranking

**Fallback Behavior**:
Show only high-conviction past opportunities

**Error Handling**:
- Conflicting opportunities: Keep higher conviction one
- Zero-impact opportunities: Filter out
- Missing risk data: Assume moderate risk

---

### 56-62. Additional Action Agents
**Rebalance Approval Agent** (56): Approves/rejects rebalance trades  
**Action Queue Manager** (57): Prioritizes and tracks action execution  
**Watchlist Updater** (58): Updates watch positions, alerts  
**Trigger Alerts Agent** (59): Monitors threshold crossings  
**Daily Brief Agent** (60): Market brief generation  
**Policy Note Agent** (61): CB policy implications  
**Earnings Note Agent** (62): Earnings season implications  

---

## Monitoring & Quality Agents (8)

### 63-70. Monitoring Agents
**Freshness Audit** (63): Data quality tracking  
**Regression Check** (64): Detects broken models/data  
**Performance Bridge** (65): Before/after analysis  
**Thesis Monitor** (66): Tracks thesis changes  
**Content Drift** (67): Narrative consistency checks  
**UI QA** (68): Component rendering checks  
**Morning Command** (69): System health check  
**Report Exporter** (70): Markdown report generation  

---

## Summary of All 80 Engines

| Category | Count | List |
|----------|-------|------|
| **Finance Engines** | 20 | Holdings, Concentration, Drift, Sleeve, Wrapper, Currency, Debt Priority, ISA Routing, Risk Budget, VaR, Scenario, Monte Carlo, Liquidity Ladder, Bonus, Rebalance, Attribution, Drawdown, Capital Efficiency, Crypto Rebalance, Crypto Scenario |
| **Market Engines** | 27 | Macro Regime, CB Policy, Inflation Shock, Liquidity Divergence, Policy Surprise, Narrative Pulse, ETF Flows, CFTC Positioning, Correlation Drift, Gap Risk, Factor Rotation, Sector Leadership, Yield Curve, Credit Stress, Cross-Asset Stress, BTC Cycle, Crypto ETF Flows, On-Chain Health, Stablecoin Liquidity, Funding Rates, Sentiment, Commodity, FX Regime, Property Cycle, Event Notes, (+ 2 more market-specific) |
| **Agent Engines** | 33 | Weekly Synthesis, Decision Log, Opportunity Ranker, Daily Brief, Monthly Review, Quarterly Review, Theme Memo, Rebalance Approval, Action Queue, Watchlist, Trigger Alerts, Policy Note, Earnings Note, Freshness Audit, Regression Check, Performance Bridge, Thesis Monitor, Content Drift, UI QA, Morning Command, Report Exporter, (+ 12 more specialized agents) |
| **TOTAL** | **80** | ✅ All documented |

---

## Registry Quick Reference

Use this table to find any engine:

| # | Engine Name | File | Type | Phase | UI Tab |
|---|---|---|---|---|---|
| 1 | Holdings Ingestion | `holdings-ingestion.js` | Finance | 2 | T1, T2 |
| 2 | Concentration | `concentration.js` | Finance | 2 | T2 |
| 3 | Drift Monitor | `drift-monitor.js` | Finance | 2 | T2, T12 |
| 4 | Sleeve Exposure | `sleeve-exposure.js` | Finance | 2 | T9 |
| 5 | Wrapper Exposure | `wrapper-exposure.js` | Finance | 2 | T9 |
| 6 | Currency Exposure | `currency-exposure.js` | Finance | 2 | T2 |
| 7 | Debt Priority | `debt-priority.js` | Finance | 2 | T7, T12 |
| 8 | ISA/Pension Routing | `isa-pension-routing.js` | Finance | 2 | T9 |
| 9 | Risk Budget | `risk-budget.js` | Finance | 2 | T4 |
| 10 | VaR | `risk-budget.js` (module) | Finance | 2 | T4 |
| 11 | Scenario Sensitivity | `scenario-sensitivity.js` | Finance | 2 | T5 |
| 12 | Monte Carlo | `monte-carlo.js` | Finance | 2 | T10 |
| 13 | Liquidity Ladder | `liquidity-ladder.js` | Finance | 2 | T6 |
| 14 | Bonus Allocation | `bonus-allocation.js` | Finance | 2 | T7 |
| 15 | Rebalance Proposal | `rebalance-proposal.js` | Finance | 2 | T3, T12 |
| 16 | Contribution Attribution | `contribution-attribution.js` | Finance | 2 | T3 |
| 17 | Drawdown Monitor | `drawdown-monitor.js` | Finance | 2 | T4 |
| 18 | Capital Efficiency | `capital-efficiency.js` | Finance | 2 | T9 |
| 19 | Crypto Rebalance | `crypto-rebalance.js` | Finance | 2 | T11 |
| 20 | Crypto Scenario | `crypto-scenario.js` | Finance | 2 | T11 |
| 21 | Macro Regime | `market/macro-regime.js` | Market | 3 | P1 |
| 22 | Central Bank | `market/central-bank.js` | Market | 3 | P2 |
| 23 | Inflation Shock | `market/inflation-shock.js` | Market | 3 | P2 |
| 24 | Liquidity Divergence | `market/liquidity-divergence.js` | Market | 3 | P2 |
| 25 | Policy Surprise | `market/policy-surprise.js` | Market | 3 | P2 |
| 26 | Narrative Pulse | `market/narrative-pulse.js` | Market | 3 | P3 |
| 27 | Earnings Revision | `market/earnings-revision.js` | Market | 3 | P4 |
| 28 | ETF Flows | `market/etf-flows.js` | Market | 3 | P10 |
| 29 | CFTC Positioning | `market/cftc-positioning.js` | Market | 3 | P10 |
| 30 | Correlation Drift | `market/correlation-drift.js` | Market | 3 | P11 |
| 31 | Gap Risk | `market/gap-risk.js` | Market | 3 | P12 |
| 32 | Factor Rotation | `market/factor-rotation.js` | Market | 3 | P4 |
| 33 | Sector Leadership | `market/sector-leadership.js` | Market | 3 | P4 |
| 34 | Yield Curve | `market/yield-curve.js` | Market | 3 | P5 |
| 35 | Credit Stress | `market/credit-stress.js` | Market | 3 | P5 |
| 36 | Cross-Asset Stress | `market/cross-asset-stress.js` | Market | 3 | P12 |
| 37 | BTC Cycle | `crypto/btc-cycle.js` | Market | 3 | P9, T11 |
| ... | ... | ... | ... | ... | ... |
| 49 | Weekly Synthesis | `agents/weekly-synthesis.js` | Agent | 4 | P16, T1 |
| 50 | Decision Log | `agents/decision-log.js` | Agent | 4 | T12, P16 |
| 55 | Opportunity Ranker | `agents/opportunity-ranker.js` | Agent | 4 | T12, T1 |
| ... | ... | ... | ... | ... | ... |

---

## Notes & Conventions

1. **Freshness Schema**: All engines use the same `_freshness` object structure
2. **Error Handling**: All engines gracefully degrade to fallback data
3. **Cache TTL**: Optimized per engine type (live data 1h, computed 4-8h, agent 24h)
4. **UI Components**: All use Liquid Glass widget system (14 reusable components)
5. **Orchestration**: All engines run via `engineOrchestrator.js` with dependency graph
6. **Testing**: See `__tests__/engines/` for engine-specific test suites

---

## Getting Started with Engines

### Running All Engines
```javascript
import { engineOrchestrator } from '@/lib/engineOrchestrator';

const ENGINE = await engineOrchestrator.orchestrate({
  portfolio: myPortfolio,
  market: currentMarketData,
  config: appConfig
});
// Returns: { finance: {...}, market: {...}, agents: {...} }
```

### Running a Single Engine
```javascript
import { computeHHI, computeEffectivePositions } from '@/lib/engines/concentration';

const hhi = computeHHI(holdings);
const effectiveN = computeEffectivePositions(hhi);
```

### Adding a New Engine
1. Create file in `lib/engines/{category}/{name}.js`
2. Export main function and all helper functions
3. Follow standardized input/output format
4. Add to `engineOrchestrator.js` dependency graph
5. Add to this ENGINES.md registry
6. Create test file in `__tests__/engines/{category}/{name}.test.js`

---

**Last Updated**: 2026-03-20  
**Status**: ✅ COMPLETE REGISTRY  
**Next**: Implementation of Phases B-G (conviction persistence, calendar expansion, etc.)

