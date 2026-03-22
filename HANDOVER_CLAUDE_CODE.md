# LIFESTACK OS — COMPREHENSIVE HANDOVER FOR CLAUDE CODE

**Date:** 21 March 2026
**Author:** Alex Bouter (VP, Infrastructure & Energy IB, DC Advisory London)
**Current commit:** `8390634` on `main`
**Live URL:** https://lifestack-finance.vercel.app
**Repo:** https://github.com/bouteralex-blip/lifestack-finance

---

## 1. CURRENT STATUS — WHAT WORKS AND WHAT DOESN'T

| Module | Status | Notes |
|--------|--------|-------|
| **Intelligence Hub** | ⚠️ Loads but minimal | Shows engine status, phase indicators. Functionally a placeholder — needs full build-out. |
| **Wealth Engine** | ❌ CRASHED | React error: `Cannot read properties of undefined (reading 'map')`. Caught by ErrorBoundary — shows "Module Error" instead of full-page crash. |
| **Market & Research** | ✅ Working | 16 tabs, all rendering correctly with static data. |
| **Career & Infra** | ✅ Working | 8 tabs, all rendering correctly. |
| **Systems & Info** | ✅ Working | 4 tabs, system architecture blueprint loads fine. |

---

## 2. THE WEALTH ENGINE CRASH — ROOT CAUSE ANALYSIS

### The Error
```
Cannot read properties of undefined (reading 'map')
```
This is a **runtime crash** inside `components/PortfolioVOS.jsx` (3,561 lines, 14 tabs T1–T14). The ErrorBoundary in `AppShell.jsx` catches it so the other 4 modules still work.

### Architecture of PortfolioVOS.jsx

The component uses **module-scope mutable variables** (not React state) for all portfolio data:

```javascript
// Lines 216-436: Module-scope variables initialised with hardcoded defaults
let PORT = { netWorth: 247000, assets: 375700, debts: 128700, ... };
let HOLDINGS = [ { name: "JPM Global", val: 65200, cls: "ETF", ... }, ... ]; // 22 items
let NW_WEEKLY = [ { d: "1 Oct", nw: 255400, a: 388200 }, ... ]; // 24 items
let BRIDGE_ITEMS = [ ... ]; // 13 items
let RISK = { vol: 22.4, sharpe: 0.38, ... };
let FACTORS = [ ... ]; // 8 items
let STRESS = [ ... ]; // 8 items
let BONUS = { ... };
let OPPS = [ ... ]; // 10 items
let MONTHLY_DATA = [ ... ]; // 6 items
let SCORECARD = { overall: 5.2, ... };
let ENGINE = { concentration: null, debtPriority: null, ... }; // 18 engine slots
let MKTENG = { regime: null, stress: null, ... }; // 7 market engine slots
let AGENT = { synthesis: null, rankedOpps: null, ... }; // 20 agent slots
```

These are overwritten by Supabase data in a `useEffect`:

```javascript
// Line ~3413: useEffect hydration
useEffect(() => {
  if (data) {
    if (data.PORT) PORT = data.PORT;
    if (data.HOLDINGS) HOLDINGS = data.HOLDINGS;
    // ... etc
    recalcDerived(priorSnapshot, saveSnapshot); // Runs all 18 engines + 7 market engines + 20 agents
    setTruthLayer(buildEngineTruthLayer(...));
    setEngines(ENGINE, MKTENG, AGENT);
  }
}, [data]);
```

### The Data Flow
1. `useSupabaseData()` hook fetches from 14 Supabase tables (all confirmed populated — 106 rows total)
2. Mapper functions in `lib/useData.js` transform rows → app shapes (all have `if (!rows?.length) return null` guards)
3. **CRITICAL**: Mappers return `null` (not `[]`) when data is missing or empty
4. The useEffect overwrites module-scope arrays with `if (data.HOLDINGS) HOLDINGS = data.HOLDINGS` — but if the mapper returned `null`, this guard passes (`null` is truthy... wait, no — `null` is falsy). Actually `if (data.HOLDINGS)` will NOT overwrite if mapper returned `null`. So defaults should be preserved.

### Where the .map() Actually Crashes

The crash happens during the **initial render** of T1 (Executive Summary), which is the default tab. T1 renders these components:

1. `<HorizonTakeaways items={t1Takeaways} />` — inline component, items is a hardcoded array ✅
2. `<KpiTile />` — inline, hardcoded props ✅
3. `<TrajectoryChartWidget data={NW_WEEKLY} />` — NW_WEEKLY has 24 hardcoded items ✅
4. `<DecisionQualityMatrix scores={{...}} />` — inline component with hardcoded scores ✅
5. `<AllocationChartWidget data={mapSleeveAllocation(SLEEVES, PORT.assets)} />` — **SLEEVES is a derived variable**
6. Various Recharts `<BarChart>` with `MONTHLY_DATA` — 6 hardcoded items ✅

**The most likely crash candidates:**
- `SLEEVES` is computed from `HOLDINGS` via `.forEach()` and then `.map()` at module scope (lines 271-282). If HOLDINGS somehow becomes undefined between import and render, SLEEVES computation fails.
- `recalcDerived()` (line ~3257) recomputes SLEEVES, BRIDGE, NW_DD, WEALTH_5, NW_FORECAST, HC_DATA, and all ENGINE/MKTENG/AGENT values. Any crash inside this function would propagate.
- The `AllocationChartWidget` at `components/tiles/liquid-glass/AllocationChartWidget.jsx` calls `data.map()` at lines 144 and 161 with **NO null guard**. If `mapSleeveAllocation()` returns undefined (it shouldn't, but check), this crashes.

### What Was Tried and Failed
Multiple attempts were made to fix this crash:
- Loading guards (`if (loading) return ...`) — caused React #310 (hooks ordering violation) because `useState(side)` and `useState(open)` were declared AFTER the guard
- `useRef` data guards — didn't prevent the initial render crash
- `Array.isArray` guards on data assignments — didn't help because the crash is in the render path, not the data assignment
- Full revert to pre-Copilot state — the crash existed BEFORE Copilot touched it

### What Needs to Happen
1. **Find the exact `.map()` call that crashes.** Run the app in dev mode (`npm run dev`) and check the browser console for the full stack trace with line numbers.
2. **Add null guards to `AllocationChartWidget.jsx`** — change `data.map()` to `(data || []).map()` at lines 144 and 161.
3. **Check `recalcDerived()` function** (line 3257) for any engine computation that returns undefined where an array is expected.
4. **Consider adding `(SLEEVES || [])` guard** where SLEEVES is passed to child components.

---

## 3. THE INTELLIGENCE HUB — CURRENT STATE

### What It Is
`components/DashboardIntelligenceHub.jsx` — 239 lines. A thin status dashboard that shows:
- Data quality bar (live/fresh/stale counts)
- Top Actions widget (from agent action queue)
- Weekly Synthesis widget
- Engine Status widget (running/cached counts)
- System Status (Phase 1-4 indicators)

### What's Wrong With It
1. **No default export** — only named exports: `export { DashboardIntelligenceHub, TopActionsWidget, ... }`. The AppShell already handles this with `.then(mod => mod.DashboardIntelligenceHub)` in the dynamic import.
2. **Uses Tailwind CSS classes** (45 `className` references) while the rest of the app uses inline styles. This creates visual inconsistency and may cause rendering issues if Tailwind purging doesn't include this file.
3. **Depends on orchestrator singletons** (`getFinanceOrchestrator`, `getMarketOrchestrator`, `getMasterAgentOrchestrator`, `getStateContainer`) which are separate from the `EngineProvider` context used by all other modules. This means it doesn't receive any data from the Wealth Engine's computations.
4. **Functionally empty** — it shows hardcoded phase indicators and engine counts but no actual portfolio intelligence, no daily brief, no morning command, no synthesis content.

### What It Should Be
The Intelligence Hub should be the **command centre** — a daily briefing dashboard showing:
- Morning Command summary (what matters today)
- Top 5 priority actions with urgency indicators
- Weekly synthesis with themes and recommendations
- Net worth headline KPIs
- Market regime indicator
- Freshness/data quality status
- Quick-nav links to relevant tabs in other modules

### Design Constraints
- Must use **inline styles** (not Tailwind) to match PortfolioVOS, MarketsModule, CareerModule, SystemsModule
- Must use the **EngineProvider context** (`useEngines()`) to read shared state, not separate orchestrator singletons
- Must use the same **dark glassmorphism design system** (colours from the `P` object, `glassLight()` function, etc.)
- Should pull data from the `AGENT` object (which has: synthesis, morningCommand, actionQueue, triggerAlerts, whatMattersNow, dailyBrief, etc.)

---

## 4. FIXES ALREADY APPLIED (from baseline commit 75b8ed7)

### AppShell.jsx (3 changes)
1. **ModuleBoundary ErrorBoundary** — wraps each module to contain crashes (prevents full-page "Application error")
2. **Intelligence Hub named export** — `.then(mod => mod.DashboardIntelligenceHub)` resolves the named export
3. **React import** — added `React` to imports for the class component ErrorBoundary

### PortfolioVOS.jsx (4 changes)
1. **Alert .msg fix** — `a.msg` → `a.message||a.title||a.msg||'Alert'` at line 1148 (AlertPanel component)
2. **Alert .msg fix** — same change at line 1347 (T1 Governance Alerts)
3. **Removed `refresh(n=>n+1)`** — this counter triggered re-renders inside the useEffect, contributing to render cascade
4. **Narrowed useEffect deps** — from `[data, freshness, priorSnapshot, saveSnapshot]` to `[data]` to prevent infinite loop

### lib/useData.js (2 changes)
1. **Added `useCallback` import** — needed for saveSnapshot stabilisation
2. **Wrapped `saveSnapshot` in `useCallback([], [])`** — prevents function recreation on every render

---

## 5. INFRASTRUCTURE & CONFIGURATION

### Stack
- **Next.js** 14.2.x (Webpack, NOT Turbopack)
- **React** 18.3.x
- **Recharts** 2.12.x (primary chart library)
- **ECharts** 5.5.0 + echarts-for-react 3.0.2 (radar, heatmaps, correlation matrices)
- **Tailwind CSS** 4.2.2 (used only by Intelligence Hub and liquid-glass widgets)
- **Supabase** @supabase/supabase-js 2.43.x

### Deployment
- **Vercel:** Project `prj_5xoXKPM5DDyiriUC8jgQG5eQTA18`, Team `team_yJOnKVnF38JmRAieqsQE3BAs`
- Auto-deploys from `main` branch in ~25-30 seconds
- `vercel.json` has cron config for daily/weekly API routes

### Supabase
- Project: `ynvfzssakggmmldjkmes` (eu-west-1)
- 15 tables, all RLS-enabled
- Anon key hardcoded in `lib/supabase.js`
- **Note:** `engine_snapshots` table does NOT exist — `useSnapshotPersistence()` queries it but the try-catch handles the 404 gracefully

### Supabase Table Row Counts (verified 21 Mar 2026)
| Table | Rows |
|-------|------|
| holdings | 22 |
| net_worth_history | 24 |
| nw_bridge | 13 |
| opportunities | 10 |
| stress_scenarios | 8 |
| factor_exposures | 8 |
| monthly_returns | 6 |
| reference_data | 5 |
| bonus_scenarios | 3 |
| debts | 2 |
| bonus_config | 1 |
| risk_metrics | 1 |
| portfolio_scorecard | 1 |
| crypto_metrics | 1 |
| portfolio_config | 1 |

---

## 6. KEY FILES

| File | Lines | Purpose |
|------|-------|---------|
| `components/AppShell.jsx` | ~140 | Module switcher, ErrorBoundary, EngineProvider |
| `components/PortfolioVOS.jsx` | 3,561 | Wealth Engine — 14 tabs (T1-T14), all engines, all agents |
| `components/MarketsModule.jsx` | ~700 | Market & Research — 24 tabs (P1-P16 + C1-C8) |
| `components/CareerModule.jsx` | ~300 | Career & Infra Intelligence — 8 tabs |
| `components/SystemsModule.jsx` | ~500 | Systems & Info — 4 tabs |
| `components/DashboardIntelligenceHub.jsx` | 239 | Intelligence Hub — currently a thin status page |
| `lib/useData.js` | ~560 | Supabase data fetching, mapping, freshness computation |
| `lib/defaults.js` | ~400 | Hardcoded fallback data for all 15 tables |
| `lib/liquidGlassMappers.js` | ~350 | Adapter functions: engine state → widget props |
| `lib/engineContext.js` | ~35 | React context for sharing engine state across modules |
| `lib/engineOrchestrator.js` | ~400 | Centralized engine orchestration (used by Intelligence Hub only) |
| `lib/agentOrchestrator.js` | ~300 | Agent workflow orchestration (used by Intelligence Hub only) |
| `lib/stateManager.js` | ~200 | State container singleton (used by Intelligence Hub only) |
| `lib/engines/index.js` | ~30 | Barrel export for 18 finance engines |
| `lib/engines/market/index.js` | ~32 | Barrel export for 26+ market engines |
| `lib/engines/agents/index.js` | ~40 | Barrel export for 20+ agent functions |
| `components/tiles/liquid-glass/*.jsx` | 23 files | v0-generated AE Liquid Glass widget components |

---

## 7. DESIGN SYSTEM

### Colour Palette (P object in PortfolioVOS.jsx)
```javascript
const P = {
  bg: "#05161A", t1: "#e8f4f5", t2: "#b0cdd4", t3: "#7a9da6", t4: "rgba(255,255,255,0.35)",
  cyan: "#0F969C", indigo: "#6DA5C0", amber: "#f59e0b", btc: "#F7931A",
  positive: "#00E599", negative: "#FF4D4D", purple: "#a855f7", pink: "#FF3BBD",
  orange: "#FF8C42", green: "#00C784", red: "#FF4D4D",
  b1: "rgba(15,150,156,0.14)", b2: "rgba(255,255,255,0.06)",
  mono: "'JetBrains Mono','SF Mono',monospace",
  // s1-s6 severity colours for charts
};
```

### Glass System
- Module-scope `glassLight()` function produces background/border/shadow/backdrop-filter
- Finance uses amber/gold accent
- Markets uses electric blue (#3B82F6) accent
- Dark background: `#05161A` with teal gradient overlay

### Widget Library (23 Liquid Glass widgets in `components/tiles/liquid-glass/`)
All widgets use Tailwind CSS classes (`className`). They were generated from v0 and follow an "AE Glass" design pattern with:
- `bg-white/[0.08] backdrop-blur-[40px] saturate-[2.0]`
- Specular shine overlays, corner hotspots, SVG noise textures
- Each has both named and default exports

---

## 8. KNOWN CONSTRAINTS & GOTCHAS

1. **Bracket baseline:** PortfolioVOS has parens balance of +1 (JSX angle brackets in string expressions)
2. **No Treemap components** — caused build failures in past
3. **No localStorage in artifacts** — Vercel/Next.js SSR will fail
4. **JSX angle brackets** must be wrapped as `{">"}` in inline expressions
5. **The P object's `mono:` key** must not be caught by font-string replacement regexes
6. **`str_replace` fails on JSX blocks >150 lines** — use Python splice scripts for large replacements
7. **T14 appears before T13** in the file intentionally (Tax Advisor before Glossary)
8. **`api.github.com` is blocked** — cannot use GitHub REST API, only git push with PAT
9. **GitHub Actions CI fails** on Tailwind CSS native binding error (`npm has a bug related to optional dependencies`) — this is CI-only, does NOT affect Vercel deployments

---

## 9. PRIORITY ACTIONS FOR CLAUDE CODE

### Priority 1: Fix Wealth Engine Crash
1. Run `npm run dev` and open the Wealth Engine tab
2. Check browser console for the full stack trace with exact line numbers
3. The error is `Cannot read properties of undefined (reading 'map')` — find which variable is undefined
4. Most likely candidates:
   - `AllocationChartWidget.jsx` lines 144/161 — `data.map()` with no null guard
   - Something inside `recalcDerived()` function (line 3257 of PortfolioVOS.jsx)
   - A derived variable (SLEEVES, BRIDGE, NW_DD, WEALTH_5) that depends on a module-scope array that got corrupted
5. Apply targeted null guards — do NOT add loading screens, Suspense, or restructure the component

### Priority 2: Rebuild Intelligence Hub
1. Rewrite `DashboardIntelligenceHub.jsx` to use:
   - **Inline styles** (not Tailwind) matching the rest of the app
   - **`useEngines()` context** to read ENGINE, MKTENG, AGENT from EngineProvider
   - The same dark glassmorphism design system (P colours, glassLight, EmeraldGlassCard)
2. It should display:
   - Morning Command headline + top 3 priorities
   - Net Worth KPI strip (from PORT)
   - Market Regime indicator (from MKTENG.regime)
   - Top 5 Action Queue items (from AGENT.actionQueue)
   - Weekly Synthesis themes (from AGENT.synthesis)
   - Alert count with severity breakdown (from AGENT.triggerAlerts)
   - Data freshness bar
3. Keep it under 400 lines
4. Must have a **default export** OR update AppShell to handle named export (currently handled)

### Priority 3: Validate Everything
1. `npx next build` must pass with 0 errors
2. All 5 modules must load without crashes
3. Bracket balance check on modified files
4. Supabase 15-table audit (all present, all RLS-enabled)
5. Git push to main → Vercel auto-deploy → confirm READY state

---

## 10. WHAT NOT TO DO

- **Do NOT remove the ErrorBoundary** from AppShell.jsx — it's the only thing keeping the site partially functional
- **Do NOT restructure PortfolioVOS.jsx** — it's 3,500+ lines and the module-scope pattern, while unusual, works everywhere except this one crash
- **Do NOT change the Supabase schema** — all 15 tables are correct and populated
- **Do NOT add Suspense, loading guards, or early returns before hooks** — this caused React #310 (hooks ordering violation) in previous attempts
- **Do NOT change the dynamic import pattern** — `ssr: false` is required for all modules
- **Do NOT touch MarketsModule, CareerModule, or SystemsModule** — they work perfectly
