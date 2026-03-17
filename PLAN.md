# LifeStack Finance — AI Agent & Automation Implementation Plan

## Context

The previous session (branch `claude/review-finance-agent-plan-andJc`) built the foundational engine layer:
- **Phase 1**: Portfolio data layer & core infrastructure (complete)
- **Phase 2**: 8 portfolio analysis engines in `lib/engines/` (complete)
- **Phase 3**: 9 market intelligence engines in `lib/engines/market/` (complete)
- **Phase 4**: 7 agent engines in `lib/engines/agents/` (complete)
- **Phase 5**: UI wiring, persistence, live data & tests (partially complete — 5 test failures remain)

**This plan** takes the system from "engines exist" to "fully agentic intelligence operating system" — focusing on live data pipelines, advanced AI-driven analysis, automation workflows, and premium UI that surfaces actionable alpha.

---

## Phase 1 — Fix Foundation & Merge Previous Work
> Priority: CRITICAL | Estimated files: 5-8

### Step 1.1: Port previous session engines to this branch
- Cherry-pick or rebuild the engine modules from the prior session:
  - `lib/engines/` — concentration, debt-priority, sleeve-exposure, wrapper-exposure, currency-exposure, drift-monitor, isa-pension-routing, rebalance-proposal
  - `lib/engines/market/` — macro-regime, cross-asset-stress, btc-cycle, yield-curve, credit-stress, sector-leadership, etf-flows, crypto-onchain
  - `lib/engines/agents/` — action-queue, opportunity-ranker, morning-command, weekly-synthesis, decision-log, what-changed, trigger-alerts
- Fix the 5 known test failures:
  - `mapRange` overflow bug in `btc-cycle.js` and `macro-regime.js` — replace `clamp(mapRange(...), 0, 100)` with `scoreInBand()` that tapers to 0 past range
  - `weekly-synthesis.test.js` — replace `fail('...')` with `throw new Error('...')`

### Step 1.2: Wire persistence layer
- Create `lib/persistence.js` — Supabase + localStorage fallback for:
  - `saveEngineSnapshot()` / `loadPriorSnapshot()`
  - `saveDecisionEntry()` / `loadDecisionLog()`
  - `saveActionStatus()` / `loadActionQueueState()`
  - `cacheMarketData()` / `loadCachedMarketData()`
- Create Supabase migration: `supabase/migrations/002_add_engine_snapshot_and_decision_log.sql`
  - `engine_snapshots` table (JSONB engine/market/portfolio state)
  - `decision_log` table (action, thesis, snapshot, outcome tracking)
  - `action_queue_state` table (done/dismissed persistence)
  - `market_data_cache` table (source+metric+key, value, TTL)

### Step 1.3: Create live market data API
- Create `app/api/market/route.js` — Next.js API route
  - CoinGecko config: btc_price, eth_price, fear_greed, btc_dominance
  - FRED config: vix, dxy, us_10y, us_2y, us_cpi, gdp_growth, ig_oas, hy_oas, move_index, breakeven_5y, fed_funds, sp500
  - Supabase cache check → fresh fetch if expired → cache result
  - GET handler with `?metrics=` and `?refresh=true` params
- Create `lib/useMarketData.js` hook — fetches from `/api/market`, merges into default M object
  - Auto-refreshes every 30 minutes

---

## Phase 2 — Advanced AI Agent Orchestration Layer
> Priority: HIGH | Estimated files: 12-15

### Step 2.1: Create the Agent Orchestrator (`lib/agents/orchestrator.js`)
- Central scheduler that runs all agents in dependency order
- Manages state flow: raw data → engines → agents → UI state
- Supports daily, weekly, event-driven triggers
- Produces a unified `SYSTEM_STATE` object consumed by all UI components
- Caching layer to avoid redundant computation

### Step 2.2: Build new high-value agents

#### 2.2a: AI Portfolio Advisor Agent (`lib/agents/portfolio-advisor.js`)
- **Inputs**: Full portfolio state, market regime, all engine outputs
- **Logic**:
  - Identifies the single highest-impact action available today
  - Scores every holding against current regime (bullish/neutral/bearish for this regime)
  - Generates natural-language "what I would do" recommendation
  - Considers wrapper efficiency, tax impact, concentration risk
- **Output**: `{ topAction, holdingScores[], regimeAlignment, narrative }`

#### 2.2b: Alpha Opportunity Scanner (`lib/agents/alpha-scanner.js`)
- **Inputs**: Market regime, sector leadership, factor scores, ETF flows, crypto state
- **Logic**:
  - Scans for regime-favored asset classes not yet in portfolio
  - Identifies momentum + value convergence opportunities
  - Flags contrarian setups (extreme fear + improving fundamentals)
  - Ranks opportunities by expected value and conviction level
- **Output**: `{ opportunities[], topPick, contrarian[], themeAlerts[] }`

#### 2.2c: Risk Guardian Agent (`lib/agents/risk-guardian.js`)
- **Inputs**: Cross-asset stress, portfolio concentration, drawdown state, correlation drift
- **Logic**:
  - Monitors portfolio risk budget utilization in real-time
  - Detects hidden correlation risk (e.g., crypto + growth equity moving together)
  - Generates specific hedge recommendations when stress exceeds thresholds
  - Tracks drawdown severity and triggers defensive protocols
- **Output**: `{ riskScore, alerts[], hedgeRecommendations[], correlationWarnings[] }`

#### 2.2d: Capital Deployment Agent (`lib/agents/capital-deployment.js`)
- **Inputs**: Cash positions, ISA/pension allowances, debt balances, bonus schedule, market regime
- **Logic**:
  - Calculates optimal capital deployment sequence (debt payoff vs invest vs ISA)
  - Time-aware: knows ISA deadlines, pension contribution windows
  - Regime-aware: adjusts deployment pace based on market conditions
  - Generates month-by-month deployment plan
- **Output**: `{ deploymentPlan[], nextAction, isaStatus, pensionOptimization, debtPayoffSchedule }`

#### 2.2e: Weekly CIO Memo Writer (`lib/agents/cio-memo-writer.js`)
- **Inputs**: All agent outputs, whatChanged delta, market regime, portfolio performance
- **Logic**:
  - Writes a structured weekly intelligence memo in CIO style
  - Sections: Executive Summary, What Changed, Market Regime Update, Portfolio Impact, Action Items, Watch List
  - Generates conviction scores for each recommendation
  - Includes performance attribution for the week
- **Output**: `{ memo: { title, date, executiveSummary, sections[], actionItems[], watchList[] } }`

#### 2.2f: Thesis Monitor & Decision Logger (`lib/agents/thesis-monitor.js`)
- **Inputs**: Active theses, market state changes, portfolio performance by thesis
- **Logic**:
  - Tracks every investment thesis (entry trigger, kill switch, review date)
  - Monitors thesis health: "still valid", "weakening", "broken"
  - Auto-generates after-action reviews when positions are closed
  - Maintains win-rate statistics and learning loop
- **Output**: `{ activeTheses[], brokenTheses[], reviewsDue[], hitRate, learnings[] }`

### Step 2.3: Create Agent State Store (`lib/agents/state-store.js`)
- Unified state management for all agent outputs
- Computed derived state (e.g., urgency ranking across all agents)
- Change detection for "what changed since last run"
- Snapshot comparison for daily/weekly deltas

---

## Phase 3 — Live Data Pipeline & Automation
> Priority: HIGH | Estimated files: 8-10

### Step 3.1: Expand market data sources (`app/api/market/route.js`)
Add endpoints for:
- **Sector ETF performance**: XLK, XLF, XLE, XLV, XLI, XLU, XLC, XLP, XLY, XLB (via free APIs)
- **Treasury yields**: 2Y, 5Y, 10Y, 30Y (FRED)
- **Credit spreads**: IG OAS, HY OAS (FRED)
- **FX rates**: GBPUSD, DXY, GBPZAR (free FX APIs)
- **Commodity prices**: Gold, Oil, Copper (free APIs)
- **BTC on-chain**: MVRV, NUPL, SOPR (CoinGecko/Glassnode free tier)
- **Fear & Greed**: Crypto + traditional (CNN money equivalent)

### Step 3.2: Create automated refresh system (`lib/agents/auto-refresh.js`)
- Background data refresh on configurable intervals
- Priority queue: critical data (prices) every 5 min, regime data hourly, deep analysis daily
- Staleness detection with visual indicators
- Graceful degradation when APIs are unavailable

### Step 3.3: Create data freshness layer (`lib/freshness.js`)
- Every data point tracked with: source, last_updated, ttl, status (fresh/stale/expired/error)
- Visual freshness badges throughout UI (green dot = live, amber = stale, red = expired)
- Data quality scoring for each engine's inputs

### Step 3.4: Event-driven trigger system (`lib/agents/triggers.js`)
- Define threshold-based triggers:
  - VIX > 30 → "Stress alert: elevated volatility"
  - BTC drawdown > 20% → "Crypto stress: significant drawdown"
  - Portfolio drift > 5% from target → "Rebalance needed"
  - ISA deadline approaching → "ISA deployment urgency"
  - Credit spread widening > 50bps → "Credit stress emerging"
- Each trigger generates a notification card in the UI
- Triggers logged to decision_log for review

---

## Phase 4 — Premium UI: Command Center & Intelligence Surfaces
> Priority: HIGH | Estimated files: 3-5 (focused edits to existing files)

### Step 4.1: Morning Command Center (T1 Tab Enhancement)
Transform the existing T1 Executive Summary into a true command center:

**Left column — Priorities:**
- Top 3 actions ranked by urgency × impact
- Each action card: what, why, expected value, effort level
- Color-coded by urgency tier (red = immediate, amber = this week, blue = this quarter)

**Center column — Market Pulse:**
- Regime badge with confidence score (e.g., "Late Cycle | 78% confidence")
- 6 key market vitals: VIX, DXY, US10Y, BTC, S&P500, Gold — live with delta arrows
- Stress meter (0-100 composite from cross-asset stress engine)
- One-sentence "what matters today" from AI

**Right column — Portfolio Vitals:**
- Net worth with trend sparkline
- Weekly P&L with attribution (what drove returns)
- Risk budget utilization bar
- Capital efficiency score

**Bottom strip — AI Insight Banner:**
- Auto-generated daily insight from the Portfolio Advisor agent
- Scrolling ticker of trigger alerts

### Step 4.2: Enhanced Opportunities Tab (T8)
- Wire to Alpha Scanner agent output
- Opportunity cards with: asset, thesis, conviction score, regime alignment, entry criteria
- Tier badges (Tier 1 = high certainty, Tier 2 = strategic, Tier 3 = thematic)
- "Add to watchlist" and "Create thesis" actions on each card

### Step 4.3: Decision Log & Thesis Tracker (T12)
- Full decision log with searchable history
- Active thesis board: card per thesis with health indicator
- After-action review panel for closed positions
- Win-rate dashboard with charts

### Step 4.4: Weekly Synthesis Tab (P16 in Markets Module)
- Full CIO memo display with expandable sections
- Week-over-week comparison view
- Archive of previous memos
- Key metrics trend charts embedded in memo

### Step 4.5: Risk Dashboard Enhancement
- Correlation heatmap (portfolio holdings pairwise)
- Drawdown waterfall chart
- Risk budget pie chart (how much risk each sleeve consumes)
- Stress scenario impact table (what happens if VIX +50%, BTC -30%, rates +100bps)

### Step 4.6: Cross-Module Intelligence Linking
- Clickable regime badge in every tab that links to full regime analysis
- "Why this matters for your portfolio" callout on every market tab
- Portfolio impact preview on market insight cards
- Unified search across all agent outputs

---

## Phase 5 — Research Production & Automation Workflows
> Priority: MEDIUM | Estimated files: 6-8

### Step 5.1: Daily Brief Generator (`lib/agents/daily-brief.js`)
- Runs every morning (or on-demand)
- Produces a 1-page daily brief:
  - What changed overnight
  - Market regime status
  - Portfolio P&L
  - Top 3 actions for today
  - Key events/data releases coming
- Rendered as a dedicated "Daily Brief" view

### Step 5.2: Watchlist Engine (`lib/agents/watchlist.js`)
- Maintain a dynamic watchlist of assets/themes
- Each item has: entry criteria, target price, thesis, catalyst
- Auto-updates prices and flags when entry criteria are met
- Links to relevant thesis in decision log

### Step 5.3: Monthly Portfolio Letter Generator (`lib/agents/monthly-letter.js`)
- Generates a structured monthly review:
  - Performance summary and attribution
  - Key decisions made and their outcomes
  - Regime evolution
  - Forward outlook and positioning plan
- Exportable as markdown

### Step 5.4: Rebalance Approval Pack (`lib/agents/rebalance-pack.js`)
- When drift exceeds threshold, generates:
  - Current vs target allocation comparison
  - Specific trade proposals with sizing
  - Tax impact estimates
  - Cost analysis
  - One-click approval flow

### Step 5.5: What Changed Engine Enhancement (`lib/agents/what-changed-enhanced.js`)
- Deep comparison: yesterday vs today across ALL state objects
- Categorize changes: "Market moved", "Portfolio impacted", "Thesis affected", "Action triggered"
- Generate plain-English summary of material changes only
- Suppress noise (< threshold changes ignored)

---

## Phase 6 — Testing, QA & Polish
> Priority: HIGH | Estimated files: 15-20

### Step 6.1: Comprehensive test suite
- Unit tests for all engines (Phase 2 + 3 engines)
- Unit tests for all agents (Phase 4 agents)
- Integration tests for orchestrator
- Snapshot tests for key UI components
- API route tests with mocked external calls

### Step 6.2: Error handling & fallback
- Every engine: null-safe inputs, graceful degradation
- Every agent: timeout handling, partial result support
- Every API call: retry with exponential backoff
- UI: loading states, error states, stale-data indicators

### Step 6.3: Performance optimization
- Memoize expensive engine computations
- Lazy-load agents not needed for initial render
- Debounce market data refreshes
- Virtualize long lists (decision log, watchlist)

### Step 6.4: Final UI polish
- Consistent freshness indicators across all tabs
- Smooth transitions between data states
- Responsive layout for all new panels
- Glass design system applied to all new components

---

## Implementation Order (Recommended)

| Step | What | Why First |
|------|------|-----------|
| 1.1 | Port engines from previous session | Foundation for everything |
| 1.2 | Persistence layer | Engines need to save/load state |
| 1.3 | Live market data API | Engines need real inputs |
| 2.1 | Agent orchestrator | Coordinates all agent execution |
| 2.2a | Portfolio Advisor agent | Highest user value — "what should I do?" |
| 2.2c | Risk Guardian agent | Critical for portfolio safety |
| 2.2d | Capital Deployment agent | Direct alpha from optimization |
| 4.1 | Morning Command Center UI | Surfaces all agent outputs in one view |
| 2.2b | Alpha Scanner agent | Opportunity identification |
| 2.2e | CIO Memo Writer | Research production |
| 2.2f | Thesis Monitor | Decision memory/learning loop |
| 3.1-3.4 | Live data + triggers | Full automation |
| 4.2-4.6 | Remaining UI enhancements | Surface all intelligence |
| 5.1-5.5 | Research production workflows | Advanced automation |
| 6.1-6.4 | Testing & polish | Production readiness |

---

## Architecture Summary

```
┌─────────────────────────────────────────────────────┐
│                   UI Layer                           │
│  PortfolioVOS.jsx  │  MarketsModule.jsx              │
│  Morning Command   │  Weekly Synthesis                │
│  Decision Log      │  Risk Dashboard                  │
├─────────────────────────────────────────────────────┤
│               Agent Orchestrator                     │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐             │
│  │Portfolio  │ │Alpha     │ │Risk      │             │
│  │Advisor   │ │Scanner   │ │Guardian  │             │
│  ├──────────┤ ├──────────┤ ├──────────┤             │
│  │Capital   │ │CIO Memo  │ │Thesis    │             │
│  │Deploy    │ │Writer    │ │Monitor   │             │
│  └──────────┘ └──────────┘ └──────────┘             │
├─────────────────────────────────────────────────────┤
│              Engine Layer                            │
│  Portfolio Engines    │  Market Intelligence Engines  │
│  (8 engines)          │  (9 engines)                  │
├─────────────────────────────────────────────────────┤
│              Data Layer                              │
│  Supabase  │  Market API  │  Cache  │  Persistence  │
│  Holdings  │  FRED/CG     │  TTL    │  Snapshots     │
└─────────────────────────────────────────────────────┘
```

## Key Files to Create/Modify

**New files:**
- `lib/agents/orchestrator.js`
- `lib/agents/portfolio-advisor.js`
- `lib/agents/alpha-scanner.js`
- `lib/agents/risk-guardian.js`
- `lib/agents/capital-deployment.js`
- `lib/agents/cio-memo-writer.js`
- `lib/agents/thesis-monitor.js`
- `lib/agents/state-store.js`
- `lib/agents/auto-refresh.js`
- `lib/agents/triggers.js`
- `lib/agents/daily-brief.js`
- `lib/agents/watchlist.js`
- `lib/agents/monthly-letter.js`
- `lib/agents/rebalance-pack.js`
- `lib/freshness.js`
- `lib/persistence.js`
- `app/api/market/route.js`

**Modified files:**
- `components/PortfolioVOS.jsx` — T1 Command Center, T8 Opportunities, T12 Decision Log enhancements
- `components/MarketsModule.jsx` — P16 Weekly Synthesis, risk dashboard enhancements
- `lib/useData.js` — integrate orchestrator, market data hook, freshness tracking
- `package.json` — add jest, testing-library devDependencies

## Success Criteria

1. Every tab answers: "What changed? Why does it matter? What should I do?"
2. Morning Command Center shows top 3 actions within 2 seconds of load
3. All market data has visible freshness indicators
4. Decision log captures every thesis with kill-switches and review dates
5. Weekly synthesis generates automatically from all engine outputs
6. Risk Guardian alerts fire when thresholds are breached
7. Capital deployment plan updates automatically when cash/debt/allowances change
8. 328+ tests passing with full engine and agent coverage
9. System degrades gracefully when APIs are unavailable
10. Premium family-office command system aesthetic maintained throughout
