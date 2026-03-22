# LIFESTACK OS — COPILOT AGENT MISSION BRIEF

> **Repo:** `bouteralex-blip/lifestack-finance` · **Branch:** `main` · **Current commit:** `8390634`
> **Live:** https://lifestack-finance.vercel.app
> **Supabase:** Project `ynvfzssakggmmldjkmes` (eu-west-1)
> **Vercel:** Project `prj_5xoXKPM5DDyiriUC8jgQG5eQTA18`, Team `team_yJOnKVnF38JmRAieqsQE3BAs`

---

## MISSION OBJECTIVE

You have two tasks, in priority order. Execute each on a dedicated feature branch, validate with `npx next build`, open a PR against `main`, and merge once green. Vercel auto-deploys from `main` within 30 seconds.

**Task 1 — Fix the Wealth Engine crash** (Priority: CRITICAL)
**Task 2 — Rebuild the Intelligence Hub** (Priority: HIGH)

---

## CURRENT STATE OF THE APP

Five modules share a single `AppShell.jsx` switcher inside an `EngineProvider` context. Each module is dynamically imported with `ssr: false`. A `ModuleBoundary` ErrorBoundary wraps each module independently so a crash in one does not kill the others.

| Module | Component File | Status |
|--------|---------------|--------|
| Intelligence Hub | `components/DashboardIntelligenceHub.jsx` (239 lines) | ⚠️ Loads but is a placeholder — needs full rebuild |
| Wealth Engine | `components/PortfolioVOS.jsx` (3,561 lines) | ❌ Crashes: `Cannot read properties of undefined (reading 'map')` |
| Market & Research | `components/MarketsModule.jsx` (~700 lines) | ✅ Working — 24 tabs |
| Career & Infra | `components/CareerModule.jsx` (~300 lines) | ✅ Working — 8 tabs |
| Systems & Info | `components/SystemsModule.jsx` (~500 lines) | ✅ Working — 4 tabs |

---

## TASK 1: FIX THE WEALTH ENGINE CRASH

### Branch strategy
Create branch `fix/wealth-engine-map-crash` from `main`.

### The error
```
Uncaught TypeError: Cannot read properties of undefined (reading 'map')
```
This is a **client-side runtime crash** inside `PortfolioVOS.jsx` during the initial render of tab T1 (Executive Summary). The ErrorBoundary in `AppShell.jsx` catches it and displays "Module Error" — other modules still work.

### How to diagnose

Run the dev server and capture the full stack trace. This is the single most important step — it will give you the exact file, line number, and variable name.

```bash
npm run dev
# Open http://localhost:3000 in browser
# Click "Wealth Engine" tab
# Check terminal output OR browser console for the full error with stack trace
```

The stack trace will point to one of these locations. Check each:

### Candidate 1: AllocationChartWidget.jsx (HIGH probability)

`components/tiles/liquid-glass/AllocationChartWidget.jsx` calls `data.map()` at two locations with **zero null guards**:

```jsx
// Line ~144 — inside <Pie> component
{data.map((entry) => (
  <Cell key={entry.name} fill={entry.color} ... />
))}

// Line ~161 — legend rows
{data.map((item) => (
  <div key={item.name} ...>
```

**Fix:** Change both to `{(data || []).map(...)}`. Also add an early return at the top of the component:

```jsx
export function AllocationChartWidget({ data, totalLabel, totalValue }) {
  if (!data?.length) return null;  // ADD THIS LINE
  // ... rest of component
```

T1 feeds this widget via: `<AllocationChartWidget data={mapSleeveAllocation(SLEEVES, PORT.assets)} />`

The mapper `mapSleeveAllocation` in `lib/liquidGlassMappers.js` returns `[]` when SLEEVES is empty — so `data` should be an empty array, not undefined. BUT if `SLEEVES` itself is undefined (before `recalcDerived()` runs), the mapper receives undefined and the `?.length` guard returns `[]`. So this widget should be safe. Still add the guard as defence-in-depth.

### Candidate 2: recalcDerived() function (MEDIUM probability)

`components/PortfolioVOS.jsx` line 3257. This function recomputes every derived variable. It runs 18 finance engines, 7 market engines, and 20 agent functions inside try-catch blocks. If any engine returns an unexpected shape, a downstream `.map()` could fail.

Check particularly:
- `NW_DD = NW_WEEKLY.map(...)` — if `NW_WEEKLY` is somehow `undefined`
- `BRIDGE = BRIDGE_ITEMS.map(...)` — if `BRIDGE_ITEMS` is `undefined`
- `WEALTH_5 = SC_BASE.map(...)` — if `computeScenario()` returns `undefined`
- `OPPS_TOP5 = [...OPPS].sort(...)` — if `OPPS` is `undefined`

### Candidate 3: Other Liquid Glass widgets (LOW probability)

Check all 23 files in `components/tiles/liquid-glass/` for unguarded `.map()` calls on props. Most have guards, but verify:

```bash
grep -rn "\.map(" components/tiles/liquid-glass/ | grep -v "|| \[\]" | grep -v "data ||" | grep -v "\.filter\|\.slice\|\.sort" | head -20
```

### Candidate 4: Module-scope initialisation (LOW probability)

Lines 216-436 of PortfolioVOS.jsx define module-scope variables with hardcoded defaults. All arrays are populated (verified). But lines 302 and 368 compute derived arrays at module scope:

```javascript
let BRIDGE = BRIDGE_ITEMS.map((b,i) => { ... });  // Line 302
let WEALTH_5 = SC_BASE.map((b,i) => { ... });     // Line 368
```

If any import fails and these lines execute with undefined variables, the module crashes at import time. This would show a different error in the terminal. Check `npm run dev` output for import-time errors.

### Validation after fix

```bash
npx next build            # Must pass with 0 errors, 8/8 pages
npm run dev               # Open browser, click Wealth Engine — must render T1 without crash
```

Then push branch, open PR, merge to main. Vercel auto-deploys.

### Supabase verification (run after deploy)

All 15 tables should be present with these row counts:

```sql
SELECT 'holdings' as tbl, count(*) FROM holdings
UNION ALL SELECT 'net_worth_history', count(*) FROM net_worth_history
UNION ALL SELECT 'nw_bridge', count(*) FROM nw_bridge
UNION ALL SELECT 'portfolio_config', count(*) FROM portfolio_config
UNION ALL SELECT 'risk_metrics', count(*) FROM risk_metrics
UNION ALL SELECT 'crypto_metrics', count(*) FROM crypto_metrics
UNION ALL SELECT 'opportunities', count(*) FROM opportunities
UNION ALL SELECT 'factor_exposures', count(*) FROM factor_exposures
UNION ALL SELECT 'stress_scenarios', count(*) FROM stress_scenarios
UNION ALL SELECT 'bonus_config', count(*) FROM bonus_config
UNION ALL SELECT 'bonus_scenarios', count(*) FROM bonus_scenarios
UNION ALL SELECT 'monthly_returns', count(*) FROM monthly_returns
UNION ALL SELECT 'portfolio_scorecard', count(*) FROM portfolio_scorecard
UNION ALL SELECT 'reference_data', count(*) FROM reference_data
UNION ALL SELECT 'debts', count(*) FROM debts
ORDER BY tbl;
```

Expected: 15 tables, 106 total rows. Do NOT modify any Supabase schema or data.

---

## TASK 2: REBUILD THE INTELLIGENCE HUB

### Branch strategy
Create branch `feat/intelligence-hub-rebuild` from `main` (or from the Task 1 merged result).

### Current state of DashboardIntelligenceHub.jsx

The file is 239 lines. It has three problems that make it non-functional:

**Problem 1 — Wrong data source.** It imports `getFinanceOrchestrator`, `getMarketOrchestrator`, `getMasterAgentOrchestrator`, and `getStateContainer` from standalone singleton modules. These orchestrators are separate from the `EngineProvider` React context that all other modules use. The Intelligence Hub receives no data from the Wealth Engine's computations because it's reading from empty singletons instead of the shared context.

**Problem 2 — Wrong styling system.** It uses 45 Tailwind `className` references while the rest of the app (PortfolioVOS, MarketsModule, CareerModule, SystemsModule) uses inline `style={{}}` objects. This creates visual inconsistency.

**Problem 3 — No default export.** It only has named exports: `export { DashboardIntelligenceHub, ... }`. The AppShell already handles this with `.then(mod => mod.DashboardIntelligenceHub)` in the dynamic import, so this is handled but worth noting.

### What to build

Rewrite `DashboardIntelligenceHub.jsx` as a **command centre dashboard** — the first thing the user sees when they open LifeStack OS. It should feel like a CIO's morning briefing terminal.

**Data source:** Use the `useEngines()` hook from `lib/engineContext.js`:

```javascript
import { useEngines } from '../lib/engineContext';

// Inside the component:
const { ENGINE, MKTENG, AGENT } = useEngines();
```

These objects are populated by `PortfolioVOS.jsx` when the Wealth Engine tab has been visited at least once. If they're null (user hasn't visited Wealth Engine yet), show a "Loading engines..." state or render with hardcoded defaults from `lib/defaults.js`.

**Design system:** Use inline styles matching the existing app. Reference these from PortfolioVOS.jsx:

```javascript
// Colour palette (replicate or import)
const P = {
  bg: "#05161A", t1: "#e8f4f5", t2: "#b0cdd4", t3: "#7a9da6",
  t4: "rgba(255,255,255,0.35)", cyan: "#0F969C", indigo: "#6DA5C0",
  amber: "#f59e0b", btc: "#F7931A", positive: "#00E599", negative: "#FF4D4D",
  purple: "#a855f7", orange: "#FF8C42", green: "#00C784", red: "#FF4D4D",
  b1: "rgba(15,150,156,0.14)", b2: "rgba(255,255,255,0.06)",
  mono: "'JetBrains Mono','SF Mono',monospace",
};

// Glass card style
const glassCard = {
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(15,150,156,0.14)",
  borderRadius: 16,
  padding: 20,
  backdropFilter: "blur(24px) saturate(1.5)",
  WebkitBackdropFilter: "blur(24px) saturate(1.5)",
};
```

### Required sections (in layout order)

**Row 1 — Header strip:**
- Title: "INTELLIGENCE HUB — MORNING COMMAND"
- Date stamp
- Data source indicator (Live / Static)

**Row 2 — KPI strip (6 tiles, uniform width):**
- Net Worth (from ENGINE data or PORT defaults)
- 6M Return
- FIRE Progress %
- Market Regime (from MKTENG.regime — e.g. "REFLATION 29%")
- Stress Score (from MKTENG.stress)
- Alert Count (from AGENT.triggerAlerts)

**Row 3 — Two-column layout:**
- Left (col-span-8): Morning Command synthesis — a text block with the day's top priorities, market context, and recommended actions. Source: `AGENT.morningCommand` or `AGENT.synthesis`
- Right (col-span-4): Top 5 Action Queue items with priority badges (High/Med/Low). Source: `AGENT.actionQueue`

**Row 4 — Three-column layout:**
- Column 1: Weekly Synthesis themes (from `AGENT.synthesis.themes`)
- Column 2: Trigger Alerts with severity colours (from `AGENT.triggerAlerts.alerts`)
- Column 3: Engine Status — count of running vs cached engines, freshness indicators

**Row 5 — Data freshness bar:**
- Show live/fresh/stale/fallback counts across all 14 Supabase tables
- Source: the freshness object from `useSupabaseData()` — but since the Hub doesn't call this directly, either import it or derive from ENGINE/MKTENG/AGENT presence

### Handling null engine state

When ENGINE/MKTENG/AGENT are null (user hasn't visited Wealth Engine):

```javascript
const { ENGINE, MKTENG, AGENT } = useEngines();

// Safe accessors
const regime = MKTENG?.regime?.classification || 'Awaiting data';
const stress = MKTENG?.stress?.compositeScore || '--';
const alerts = AGENT?.triggerAlerts?.alerts || [];
const actions = AGENT?.actionQueue?.actions || [];
const synthesis = AGENT?.synthesis || null;
const morning = AGENT?.morningCommand || null;
```

Display a subtle "Visit Wealth Engine to activate all engines" message if ENGINE is null.

### Size target
Keep the file under 400 lines. Use simple, readable JSX. No sub-component files — everything in one file.

### Export
Add both named and default exports:
```javascript
export default DashboardIntelligenceHub;
export { DashboardIntelligenceHub };
```
This way the AppShell dynamic import works regardless of whether it uses `.then(mod => mod.DashboardIntelligenceHub)` or the default.

### Validation

```bash
npx next build            # 0 errors
npm run dev               # Open browser, click Intelligence Hub — must render without crash
                          # Must also work when ENGINE/MKTENG/AGENT are null
```

Push branch, open PR, merge to main.

---

## ARCHITECTURE REFERENCE

### Data flow

```
Supabase (15 tables, 106 rows)
    ↓ useSupabaseData() hook in lib/useData.js
    ↓ Mapper functions transform rows → app shapes
    ↓ Returns { data, loading, source, freshness }
    ↓
PortfolioVOS.jsx useEffect([data])
    ↓ Overwrites module-scope variables (PORT, HOLDINGS, NW_WEEKLY, etc.)
    ↓ Calls recalcDerived() — runs 18 finance engines + 7 market engines + 20 agents
    ↓ setTruthLayer() — updates React state for T1/T2/T3 truth layer banners
    ↓ setEngines(ENGINE, MKTENG, AGENT) — publishes to EngineProvider context
    ↓
All modules can read via useEngines()
```

### Key files

| File | Lines | Role |
|------|-------|------|
| `components/AppShell.jsx` | ~140 | Module switcher with ModuleBoundary ErrorBoundary, EngineProvider |
| `components/PortfolioVOS.jsx` | 3,561 | Wealth Engine — 14 tabs, all engine computations, data hydration |
| `components/DashboardIntelligenceHub.jsx` | 239 | Intelligence Hub (TO BE REWRITTEN) |
| `components/MarketsModule.jsx` | ~700 | Market & Research — 24 tabs. DO NOT TOUCH. |
| `components/CareerModule.jsx` | ~300 | Career & Infra — 8 tabs. DO NOT TOUCH. |
| `components/SystemsModule.jsx` | ~500 | Systems & Info — 4 tabs. DO NOT TOUCH. |
| `lib/useData.js` | ~560 | Supabase fetch, 14 mapper functions, freshness computation, snapshot persistence |
| `lib/defaults.js` | ~400 | Hardcoded fallback data for all tables + DEFAULT_MARKET, DEFAULT_SECTOR, etc. |
| `lib/liquidGlassMappers.js` | ~350 | Adapters: engine state → Liquid Glass widget props |
| `lib/engineContext.js` | ~35 | React context: EngineProvider + useEngines() hook |
| `lib/engines/index.js` | ~30 | Barrel export: 18 finance engine functions |
| `lib/engines/market/index.js` | ~32 | Barrel export: 26+ market engine functions |
| `lib/engines/agents/index.js` | ~40 | Barrel export: 20+ agent functions |
| `components/tiles/liquid-glass/*.jsx` | 23 files | v0-generated AE Liquid Glass widget components |

### Engine state shapes

**ENGINE** (18 slots — set by recalcDerived in PortfolioVOS):
```
concentration, debtPriority, sleeveExposure, wrapperExposure, currencyExposure,
driftMonitor, isaPensionRouting, rebalanceProposal, riskBudget, contributionAttribution,
drawdown, scenarioSensitivity, monteCarlo, liquidityLadder, bonusAllocation,
capitalEfficiency, cryptoRebalance, cryptoScenario
```

**MKTENG** (7 slots):
```
regime, stress, btcCycle, yieldCurve, creditStress, sectorLeadership, cryptoOnChain
```

**AGENT** (20 slots):
```
synthesis, rankedOpps, whatChanged, actionQueue, triggerAlerts, morningCommand,
dailyBrief, opportunityRadar, watchlist, deadlines, rebalanceApproval, monthlyReview,
freshnessAudit, tilePriority, insightCallouts, whatMattersNow, reportExport,
altcoinRiskCap, performanceBridge, thesisMonitor
```

### Supabase connection
Hardcoded in `lib/supabase.js`:
```javascript
const supabaseUrl = 'https://ynvfzssakggmmldjkmes.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIs...'; // anon key
```

**Note:** The `engine_snapshots` table does NOT exist in Supabase. `useSnapshotPersistence()` queries it but the try-catch handles the 404. Do NOT create this table unless specifically asked.

### Stack
- Next.js 14.2.x (Webpack builder, NOT Turbopack)
- React 18.3.x
- Recharts 2.12.x (primary charts)
- ECharts 5.5.0 + echarts-for-react 3.0.2 (radar, heatmaps, matrices)
- Tailwind CSS 4.2.2 (used by liquid-glass widgets; rest of app uses inline styles)
- @supabase/supabase-js 2.43.x
- Vercel auto-deploy from main, ~30 seconds

---

## CONSTRAINTS — READ BEFORE WRITING CODE

1. **Do NOT touch MarketsModule.jsx, CareerModule.jsx, or SystemsModule.jsx.** They work. Leave them alone.
2. **Do NOT remove the ModuleBoundary ErrorBoundary** from AppShell.jsx. It's the safety net keeping 4/5 modules running while Wealth Engine is broken.
3. **Do NOT restructure PortfolioVOS.jsx.** The module-scope mutable variable pattern is unconventional but is used consistently across 3,500+ lines. Refactoring it would be a multi-day project. Apply targeted fixes only.
4. **Do NOT add early returns before React hooks.** Previous attempts added `if (loading) return (...)` before `useState` declarations in PortfolioVOS, which caused React error #310 (hooks ordering violation). All hooks must be called unconditionally before any conditional returns.
5. **Do NOT change the Supabase schema or data.** All 15 tables are correct and populated with 106 rows.
6. **Do NOT use Treemap components** — they caused build failures in past sessions.
7. **Do NOT use `localStorage`** in any SSR-rendered code path — Next.js server rendering will crash.
8. **PortfolioVOS bracket baseline:** paren balance is +1 (from JSX angle brackets in template strings). This is expected — do not "fix" it.
9. **The `P` object's `mono:` key** in PortfolioVOS must not be caught by font-string replacement regexes.
10. **T14 appears before T13** in PortfolioVOS intentionally (Tax Advisor tab renders before Glossary).
11. **GitHub Actions CI** fails on Node 18.x with a Tailwind CSS native binding error (`npm has a bug related to optional dependencies`). This is a CI-only issue — it does NOT affect Vercel deployments. Do not spend time fixing it.

---

## FIXES ALREADY APPLIED (relative to baseline commit `75b8ed7`)

These are already committed to `main`. Do not revert them.

**AppShell.jsx:**
- Added `ModuleBoundary` class component (ErrorBoundary) wrapping each module
- Changed Intelligence Hub dynamic import to resolve named export: `.then(mod => mod.DashboardIntelligenceHub)`
- Added `React` to imports for the class component

**PortfolioVOS.jsx:**
- Fixed alert property access: `.msg` → `.message||.title||.msg||'Alert'` (2 locations: lines ~1148, ~1347)
- Removed `refresh(n=>n+1)` inside useEffect (was causing infinite re-render cascade)
- Narrowed useEffect dependency array from `[data, freshness, priorSnapshot, saveSnapshot]` to `[data]`
- Removed unused `const [,refresh] = useState(0)`

**lib/useData.js:**
- Added `useCallback` to React imports
- Wrapped `saveSnapshot` in `useCallback(async (...) => {...}, [])` for stable reference

---

## EXECUTION CHECKLIST

For each task:

- [ ] Create feature branch from `main`
- [ ] Diagnose with `npm run dev` + browser console (Task 1 only)
- [ ] Apply targeted fix — minimal diff, no unnecessary changes
- [ ] Run `npx next build` — must pass with 0 errors, 8/8 pages
- [ ] Run `npm run dev` — verify the fix works in browser (all 5 modules)
- [ ] Commit with clear message describing root cause and fix
- [ ] Push branch, open PR against `main`
- [ ] Merge PR — Vercel auto-deploys
- [ ] Verify live site at https://lifestack-finance.vercel.app loads all modules
- [ ] Run Supabase audit query (above) to confirm 15 tables, 106 rows unchanged
