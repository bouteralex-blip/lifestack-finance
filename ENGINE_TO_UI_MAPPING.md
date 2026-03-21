# Engine → UI Mapping Registry

**Purpose**: Complete mapping of all 80 compute engines to their UI rendering locations and components.

This document allows any developer to:
1. Find which engine produces a specific output
2. Find where on the UI a specific engine output appears
3. Trace data flow from engine → state → component
4. Understand the complete portfolio of UI surfaces

---

## FINANCE ENGINES (20) → UI MAPPING

### Core Finance Engines

| # | Engine | Output Object | UI Tab | Component | Rendering Method | Update Frequency |
|---|--------|---------------|--------|-----------|-----------------|------------------|
| 1 | Holdings Ingestion | `holdings[]` | T1, T2, T9 | HoldingsTableWidget | Table rows with ISIN, qty, price | Real-time (1h) |
| 2 | Concentration Monitor | `concentrationState` | T2 | ConcentricProgressRingsWidget | Nested rings (HHI inner, violations outer) | 4h cache TTL |
| 3 | Drift Monitor | `driftState` | T2, T12 | MirroredDivergingBarWidget | Diverging bars (target vs actual per sleeve) | 4h cache TTL |
| 4 | Sleeve Exposure | `sleeveState` | T9 | AllocationChartWidget | Pie chart with sleeve percentages | 4h cache TTL |
| 5 | Wrapper Exposure | `wrapperState` | T9 | KpiGridWidget | Tax cost, utilization, optimization suggestions | 24h cache TTL |
| 6 | Currency Exposure | `currencyState` | T2 | FactorRadarWidget | Radar with currency weights, FX risk | 1h cache TTL |
| 7 | Debt Priority Agent | `debtState` | T7, T12 | ActionTableWidget | Debt ranking by APR with payoff scenarios | 24h cache TTL |
| 8 | ISA/Pension Routing | `routingState` | T9 | KpiGridWidget + ActionTableWidget | Room utilization, recommended splits, tax savings | 7d cache TTL |
| 9 | Risk Budget | `riskState` | T4 | KpiGridWidget | Risk allocation by segment, utilization % | 4h cache TTL |
| 10 | Value-at-Risk | `varState` | T4 | ScatterBubbleMatrixWidget | VaR by time horizon (1d, 10d, 30d) | 4h cache TTL |
| 11 | Scenario Sensitivity | `scenarioState` | T5 | LuminousStackedColumnWidget | Portfolio return by scenario (recession, stagflation, etc) | 8h cache TTL |
| 12 | Monte Carlo | `monteCarloState` | T10 | TrajectoryChartWidget | Wealth paths (10th, 50th, 90th percentile) | 8h cache TTL |
| 13 | Liquidity Ladder | `liquidityState` | T6 | LuminousStackedColumnWidget | Cash runway by month (12-month forward) | 4h cache TTL |
| 14 | Bonus Allocation | `bonusState` | T7 | KpiBentoGridWidget | Allocation across debt/ISA/equity/crypto buckets | 7d cache TTL |
| 15 | Rebalance Proposal | `rebalanceState` | T3, T12 | ActionTableWidget | Trades queued with execution sequence, tax optimization | 4h cache TTL |
| 16 | Contribution Attribution | `attributionState` | T3 | MirroredDivergingBarWidget | Contribution impact vs market moves | 4h cache TTL |
| 17 | Drawdown Monitor | `drawdownState` | T4 | TrajectoryChartWidget | Max drawdown, recovery time, underwater periods | 4h cache TTL |
| 18 | Capital Efficiency | `efficiencyState` | T9 | KpiGridWidget | Deployment pace, tax efficiency, wrapper optimization | 24h cache TTL |
| 19 | Crypto Rebalance | `cryptoRebalanceState` | T11 | ActionTableWidget | BTC/ETH target vs current, rebalance proposal | 1h cache TTL |
| 20 | Crypto Scenario | `cryptoScenarioState` | T11 | LuminousStackedColumnWidget | Portfolio impact if BTC/ETH move ±20%, ±40% | 8h cache TTL |

---

## MARKET ENGINES (27) → UI MAPPING

### Macro & Regime Engines

| # | Engine | Output Object | UI Tab | Component | Rendering Method | Update Frequency |
|---|--------|---------------|--------|-----------|-----------------|------------------|
| 21 | Macro Regime Classifier | `regimeState` | P1 | KpiGridWidget + AgentBannerWidget | Regime label, confidence, risk posture, recommendations | 1h cache TTL |
| 22 | Central Bank Policy | `cbPolicyState` | P2 | KpiGridWidget | Policy stance, rate path, surprise probability | 4h cache TTL |
| 23 | Inflation Shock | `inflationState` | P2 | FactorRadarWidget | Inflation signal strength, breakeven rates, shock probability | 4h cache TTL |
| 24 | Liquidity Divergence | `liquidityDivergence` | P2 | MirroredDivergingBarWidget | Equity flows vs bond flows, which winning | 1h cache TTL |
| 25 | Policy Surprise | `policySurpriseState` | P2 | ScatterBubbleMatrixWidget | Expected vs actual policy moves, surprise magnitude | 4h cache TTL |
| 26 | Narrative Pulse | `narrativeState` | P3 | AgentBannerWidget | Top news themes, sentiment score, narrative strength | 4h cache TTL |
| 27 | Earnings Revision | `earningsState` | P4 | FactorRadarWidget | Positive/negative revision breadth, earnings growth revision | 4h cache TTL |

### Asset Class & Flows Engines

| # | Engine | Output Object | UI Tab | Component | Rendering Method | Update Frequency |
|---|--------|---------------|--------|-----------|-----------------|------------------|
| 28 | ETF Flow Tracker | `etfFlowState` | P10 | AllocationChartWidget + KpiGridWidget | Flow classification (CONFIRMED RALLY, DISTRIBUTION, etc) | 1h cache TTL |
| 29 | CFTC Positioning | `cftcState` | P10 | FactorRadarWidget | Large trader positioning, net longs, extremes | 24h cache TTL |
| 30 | Correlation Drift | `correlationState` | P11 | CorrelationHeatmapWidget | Asset correlation matrix, regime changes | 4h cache TTL |
| 31 | Gap Risk | `gapRiskState` | P12 | KpiGridWidget | VIX/MOVE/spread gaps, gap risk score | 1h cache TTL |
| 32 | Factor Rotation | `factorState` | P4 | FactorRadarWidget | Momentum/value/quality/dividend leadership | 1h cache TTL |
| 33 | Sector Leadership | `sectorState` | P4 | AllocationChartWidget | Relative strength by sector (11 GICS sectors) | 1h cache TTL |
| 34 | Yield Curve | `yieldCurveState` | P5 | TrajectoryChartWidget | 2s10s spread, 5s30s spread, inversion status | 1h cache TTL |
| 35 | Credit Stress | `creditState` | P5 | FactorRadarWidget | HY spreads, IG spreads, credit quality composite | 1h cache TTL |
| 36 | Cross-Asset Stress | `stressState` | P12 | KpiGridWidget | Composite stress score (VIX/MOVE/DXY/oil) | 1h cache TTL |

### Crypto & On-Chain Engines

| # | Engine | Output Object | UI Tab | Component | Rendering Method | Update Frequency |
|---|--------|---------------|--------|-----------|-----------------|------------------|
| 37 | BTC Cycle State | `btcCycleState` | P9, T11 | FactorRadarWidget + AgentBannerWidget | 7-phase cycle (CAPITULATION→EUPHORIA), on-chain metrics | 1h cache TTL |
| 38 | Crypto ETF Flows | `cryptoFlowState` | P9 | AllocationChartWidget | iShares BTC/ETH inflow tracking | 1h cache TTL |
| 39 | On-Chain Health | `onChainState` | P9 | KpiGridWidget | Whale movement, exchange outflow, HODL age | 1h cache TTL |
| 40 | Stablecoin Liquidity | `stablecoinState` | P9 | AllocationChartWidget | USDC/USDT supply/demand, reserve health | 4h cache TTL |
| 41 | Crypto Funding Rates | `fundingState` | P9 | FactorRadarWidget | Perpetual futures carry levels, long/short ratio | 1h cache TTL |
| 42 | Crypto Sentiment | `sentimentState` | P9 | FactorRadarWidget | Social sentiment, on-chain sentiment composite | 4h cache TTL |
| 43 | Altcoin Risk Cap | `altcoinState` | T11 | KpiGridWidget | Concentration limits, violations, rebalance needs | 4h cache TTL |

### Real Assets & Specialized

| # | Engine | Output Object | UI Tab | Component | Rendering Method | Update Frequency |
|---|--------|---------------|--------|-----------|-----------------|------------------|
| 44 | Commodity Shock | `commodityState` | (Not directly rendered) | Reference data | Via scenario sensitivity engine | 4h cache TTL |
| 45 | FX Regime | `fxState` | P6 | FactorRadarWidget | DXY level, EM currency strength, regime | 1h cache TTL |
| 46 | Property Cycle | `propertyState` | P8 | AgentBannerWidget | UK property cycle phase, yields, affordability | 24h cache TTL |
| 47 | Calendar Events | `calendarState` | (Shared across) | Used by synthesis agents | Via weekly synthesis rendering | 24h cache TTL |

---

## AGENT ENGINES (33) → UI MAPPING

### Research & Synthesis Agents

| # | Agent | Output Object | UI Tab | Component | Rendering Method | Update Frequency |
|---|-------|----------------|--------|-----------|-----------------|------------------|
| 49 | Weekly Synthesis | `synthesisState` | P16, T1 | CIOInsightBannerWidget + AgentBannerWidget | CIO memo with sections: What Changed, What Matters, What to Do, What to Watch, Verdict | 24h cache TTL |
| 50 | Decision Log | `decisionLog[]` | T12, P16 | ActionTableWidget | Table with decision history, status, outcomes | Real-time (Supabase) |
| 51 | Daily Brief | `dailyBrief` | T1 | AgentBannerWidget | Morning market brief, key themes | 24h cache TTL |
| 52 | Monthly Review | `monthlyReview` | T12 | AgentBannerWidget | Month recap, learnings, changes | 30d cache TTL |
| 53 | Quarterly Review | `quarterlyReview` | T1 | AgentBannerWidget | Quarterly deep dive, performance analysis | 90d cache TTL |
| 54 | Theme Memo | `themeMemo` | P16 | AgentBannerWidget | Narrative memo on market themes | 7d cache TTL |

### Opportunity & Action Agents

| # | Agent | Output Object | UI Tab | Component | Rendering Method | Update Frequency |
|---|-------|----------------|--------|-----------|-----------------|------------------|
| 55 | Opportunity Ranker | `opportunityRanked[]` | T12, T1 | ActionTableWidget + TilesPriorityWidget | Ranked opportunities with conviction, impact, urgency | 2h cache TTL |
| 56 | Rebalance Approval | `rebalanceApproval` | T12 | AgentBannerWidget | Approval/rejection rationale, conditional logic | 4h cache TTL |
| 57 | Action Queue Manager | `actionQueue[]` | T12 | ActionTableWidget | Queue of pending actions with status (PENDING, DONE, DISMISSED, SNOOZED) | Real-time (Supabase) |
| 58 | Watchlist Updater | `watchlist[]` | (Sidebar) | WatchlistWidget | Securities being monitored with alert status | 1h cache TTL |
| 59 | Trigger Alerts | `triggers[]` | T12, P16 | AgentBannerWidget | Threshold crossing alerts, priority classification | Real-time |
| 60 | Policy Note | `policyNote` | P2 | AgentBannerWidget | CB policy implications, rate expectations | 4h cache TTL |
| 61 | Earnings Note | `earningsNote` | P4 | AgentBannerWidget | Earnings season implications, revision trends | 4h cache TTL |

### Monitoring & Quality Agents

| # | Agent | Output Object | UI Tab | Component | Rendering Method | Update Frequency |
|---|-------|----------------|--------|-----------|-----------------|------------------|
| 63 | Freshness Audit | `freshnessAudit` | (Admin) | FreshnessIndicator | Data quality tracking, staleness warnings | 1h cache TTL |
| 64 | Regression Check | `regressionReport` | (Admin) | AgentBannerWidget | Model health, anomaly detection | 1h cache TTL |
| 65 | Performance Bridge | `performanceBridge` | T3 | MirroredDivergingBarWidget | Before/after analysis of decisions | 4h cache TTL |
| 66 | Thesis Monitor | `thesisTracking` | T12 | ContributionHeatmapWidget | Thesis evolution, conviction changes | 7d cache TTL |
| 67 | Content Drift | `contentDrift` | (Admin) | AgentBannerWidget | Narrative consistency checks | 24h cache TTL |
| 68 | UI QA | `uiQAReport` | (Admin) | AgentBannerWidget | Component rendering checks | 24h cache TTL |
| 69 | Morning Command | `systemHealth` | (Admin) | AgentBannerWidget | System health check, data sync status | 24h cache TTL |
| 70 | Report Exporter | `reportMarkdown` | (Download) | ExportButton | Markdown report generation | On-demand |

---

## UI COMPONENT → ENGINE REVERSE MAPPING

This shows which engines feed each UI component:

### Liquid Glass UI Components

| Component | Primary Engines | Input Props | Output Format |
|-----------|-----------------|-------------|----------------|
| **EmeraldGlassCard** | None (container) | children, title, subtitle | Glass-morphed container |
| **KpiGridWidget** | Any engine producing scalar metrics | kpis: [{label, value, unit, trend}] | 6-column responsive grid |
| **KpiBentoGridWidget** | Portfolio state engines | items: [{...}], layout | Flexible bento grid |
| **CIOInsightBannerWidget** | Weekly Synthesis, Daily Brief | content, sentiment, confidence | Full-width banner with color-coded sentiment |
| **AgentBannerWidget** | All agent engines | agentName, message, action, confidence | Compact agent message panel |
| **TrajectoryChartWidget** | Monte Carlo, Drawdown, Yield Curve, Rebalance | data: [{x, min, median, max}], xAxis, yAxis | Line chart with confidence bands |
| **AllocationChartWidget** | Sleeve, Sector, Wrapper, ETF Flows | data: [{name, value}], type: 'pie'/'donut' | Pie or donut chart |
| **ConcentricProgressRingsWidget** | Concentration, Drift (nested) | rings: [{label, value, target, max}] | Nested concentric rings |
| **LuminousStackedColumnWidget** | Liquidity Ladder, Scenario, Bonus | data: [{x, stacks: [{name, value}]}], colors | Stacked column chart |
| **MirroredDivergingBarWidget** | Drift, Attribution, Performance Bridge | data: [{label, pos, neg}], threshold | Diverging bar chart |
| **ContributionHeatmapWidget** | Monthly Returns, Thesis Tracking | data: 2D matrix [{month, return}] | Calendar heatmap |
| **CorrelationHeatmapWidget** | Correlation Drift | data: correlation matrix | Color-coded correlation matrix |
| **FactorRadarWidget** | Factor Rotation, Sector, Regimes, Metrics | data: [{axis, value, max}] | Radar/spider chart |
| **ScatterBubbleMatrixWidget** | VaR, Policy Surprise, Risk-Return | data: [{x, y, size, label}] | Bubble scatter plot |

---

## DATA FLOW EXAMPLE: "How does Holdings Ingestion render on T2?"

```
Supabase Table: holdings
         ↓
Holdings Ingestion Engine (1)
  • Inputs: portfolio_id, asOfDate
  • Transformation: Normalize ISIN, qty, price, currency
  • Output: holdings[], totalValue, currency
         ↓
Concentration Engine (2)
  • Inputs: holdings[] from above
  • Transformation: Calculate HHI, effective N
  • Output: concentrationState
         ↓
liquidGlassMappers.js
  • Transform holdings[] → HoldingsTableWidget props
  • Transform concentrationState → ConcentricProgressRingsWidget props
         ↓
PortfolioVOS.jsx Tab 2 (Structure & Concentration)
  [Layout Grid]
    │
    ├─ [Row 1] HoldingsTableWidget
    │   • Shows: ISIN, Name, Qty, Price, Value, Weight
    │
    ├─ [Row 2] ConcentricProgressRingsWidget
    │   • Shows: HHI score, effective N, violations
    │
    └─ [Row 3] Drift Monitor output
        • Shows: vs target allocation
         ↓
FreshnessIndicator (on each tile)
  • Shows: "LIVE" (1h), "STALE" (4h-24h), or "FALLBACK"
  • Last updated: "14:32 UTC"
```

---

## RENDERING CHECKLIST

Use this when modifying engines or UI:

- [ ] Engine output object has `_freshness` metadata
- [ ] liquidGlassMappers.js has transformation for this engine
- [ ] Component receives freshness info in props
- [ ] FreshnessIndicator displays correctly
- [ ] Tab re-renders when engine state updates
- [ ] Fallback rendering works (display "Loading..." or last known value)
- [ ] No console errors or warnings
- [ ] Responsive on mobile (grid collapses correctly)

---

## Adding a New Engine

1. **Create engine file** in `lib/engines/{category}/{name}.js`
2. **Export main function** that returns output with `_freshness`
3. **Add to engineOrchestrator.js** dependency graph
4. **Create mapper** in `liquidGlassMappers.js`
5. **Add to this registry** in the appropriate section
6. **Link to UI tab** in PortfolioVOS.jsx or MarketsModule.jsx
7. **Test freshness** rendering and fallback behavior

---

## Status

✅ **Complete**: All 80 engines mapped to UI rendering locations  
✅ **All components documented** with input/output specifications  
✅ **Data flow examples** provided  
✅ **Reverse mapping** (component → engine) for easy navigation  

Last Updated: 2026-03-20  
Version: 1.0 (Final)

