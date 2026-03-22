# LIFESTACK OS — COPILOT AGENT MISSION BRIEF

**Repo:** `bouteralex-blip/lifestack-finance` (main branch)
**Live:** https://lifestack-finance.vercel.app
**Vercel Project:** `prj_5xoXKPM5DDyiriUC8jgQG5eQTA18` / Team `team_yJOnKVnF38JmRAieqsQE3BAs`
**Supabase:** Project `ynvfzssakggmmldjkmes` (eu-west-1)
**Current Commit:** `8390634` on `main`
**Date:** 22 March 2026

---

## MISSION OBJECTIVE

Two modules are broken. Fix them both and deploy to production.

**Module 1 — Wealth Engine (`components/PortfolioVOS.jsx`):** Crashes at runtime with `Cannot read properties of undefined (reading 'map')`. Currently caught by an ErrorBoundary in AppShell.jsx so the other modules still work. You need to find the exact `.map()` call that receives `undefined`, add a null guard, and confirm T1 (Executive Summary) renders.

**Module 2 — Intelligence Hub (`components/DashboardIntelligenceHub.jsx`):** Loads but is a non-functional placeholder. Needs a full rebuild as a command centre dashboard using the shared engine context and inline styles matching the rest of the app.

---

## YOUR CAPABILITIES & HOW TO USE THEM

You have direct access to the full repository, can create branches, run `npm run dev` to get a local dev server, check browser-side errors via the terminal, push commits, and trigger Vercel deployments. You also have Supabase CLI access for database queries. Use all of these aggressively.

### Recommended Workflow

```
1. git checkout -b fix/wealth-engine-and-hub    # Work on a branch
2. npm install && npm run dev                    # Start dev server
3. Open http://localhost:3000 → click Wealth Engine tab
4. Read the browser console error — it will give you the EXACT stack trace
5. Fix the crash (targeted null guard — details below)
6. Rebuild DashboardIntelligenceHub.jsx (spec below)
7. npx next build                                # Validate zero errors
8. git push → PR to main → merge → Vercel auto-deploys
9. Verify at https://lifestack-finance.vercel.app — all 5 modules load
```

---

## ISSUE 1: WEALTH ENGINE CRASH

### The Error
```
Cannot read properties of undefined (reading 'map')
```

### Architecture You Need to Understand

`PortfolioVOS.jsx` is a 3,561-line single-file component with 14 tabs (T1–T14). It uses an unusual but intentional pattern: **module-scope mutable variables** instead of React state for portfolio data.

At the top of the file (lines 216–436), hardcoded default data is declared:

```javascript
let PORT = { netWorth: 247000, assets: 375700, ... };
let HOLDINGS = [ { name: "JPM Global", val: 65200, cls: "ETF", ... }, ... ]; // 22 items
let NW_WEEKLY = [ ... ]; // 24 items
let SLEEVES = [ ... ]; // Derived from HOLDINGS
let BRIDGE = BRIDGE_ITEMS.map(...); // Derived
let ENGINE = { concentration: null, ... }; // 18 engine slots
let MKTENG = { regime: null, ... }; // 7 market engine slots
let AGENT = { synthesis: null, ... }; // 20 agent slots
```

Inside the main `PortfolioVOS()` function, a `useEffect` fetches live data from Supabase, overwrites these variables, and runs `recalcDerived()` which recomputes all derived values and engines. The component then renders whichever tab is active (default: T1).

### How to Find the Crash

Run `npm run dev`, open the site, click Wealth Engine, and read the browser console. The stack trace will point to the exact line. You do NOT need to guess — the dev build will show unminified errors with line numbers.

### Most Likely Crash Locations

Based on code analysis, these are the highest-probability crash sources. Check them first:

**1. `AllocationChartWidget.jsx` lines 144 and 161** — calls `data.map()` with zero null guard:
```jsx
// Line 144 — inside <Pie> component
{data.map((entry) => (
  <Cell key={entry.name} fill={entry.color} ... />
))}

// Line 161 — legend rendering
{data.map((item) => (
  <div key={item.name} ...> ... </div>
))}
```
**Fix:** Change both to `{(data || []).map(...)}`

**2. `recalcDerived()` at line 3257 of PortfolioVOS.jsx** — runs 18 finance engines, 7 market engines, and 20 agent functions. Any engine returning `undefined` where a child component expects an array would crash downstream. The function has try-catch blocks around each engine group, but a crash in the data assignment section (before engines) would propagate.

**3. Derived variables at module scope (lines 271–382)** — `SLEEVES`, `BRIDGE`, `WEALTH_5`, `NW_FORECAST` are all computed with `.map()` from other module-scope arrays. If any upstream array is `undefined`, these computations crash at import time.

**4. `KpiGridWidget.jsx` line 21** — `data.map()` with no guard. Check whether the `data` prop passed from T1 could be `undefined`.

### Fix Strategy

Once you find the crash from the stack trace, apply the **minimal targeted fix**. Likely one of:
- `(data || []).map(...)` in the widget component
- `(VARIABLE || []).map(...)` where a derived variable is used
- A null check in `recalcDerived()` before a specific computation

**Do NOT restructure the component, add loading guards before hooks, wrap in Suspense, or refactor the module-scope pattern.** These approaches were tried extensively and caused cascading issues (React #310 hooks ordering violations, infinite re-render loops). The module-scope pattern is intentional and works — it just needs a null guard at the crash point.

### What Was Already Fixed (Do Not Revert)

These fixes in the current codebase are correct and must be preserved:

| File | Fix | Why |
|------|-----|-----|
| `PortfolioVOS.jsx` L1148 | `a.msg` → `a.message\|\|a.title\|\|a.msg\|\|'Alert'` | Alert objects use `.message`/`.title`, not `.msg` |
| `PortfolioVOS.jsx` L1347 | Same `.msg` fix + `(alerts\|\|[])` null guard | Same issue in T1 Governance Alerts |
| `PortfolioVOS.jsx` L3437 | useEffect deps changed to `[data]` | Was `[data,freshness,priorSnapshot,saveSnapshot]` — caused infinite loop |
| `PortfolioVOS.jsx` L3407 | Removed `const [,refresh]=useState(0)` and `refresh(n=>n+1)` | Part of the infinite loop — `refresh` triggered re-render inside useEffect |
| `lib/useData.js` L3 | Added `useCallback` import | Needed for saveSnapshot |
| `lib/useData.js` L537 | `saveSnapshot` wrapped in `useCallback([], [])` | Stabilises function reference, prevents render cascade |
| `AppShell.jsx` | `ModuleBoundary` ErrorBoundary wrapping each module | Prevents single-module crash from killing the entire page |
| `AppShell.jsx` L11 | `.then(mod => mod.DashboardIntelligenceHub)` | Intelligence Hub only has named exports, no default export |

---

## ISSUE 2: INTELLIGENCE HUB REBUILD

### Current State

`components/DashboardIntelligenceHub.jsx` is 239 lines. It shows engine counts, phase indicators, and a data quality bar. It is functionally useless as a dashboard.

**Problems with the current implementation:**
1. Uses **Tailwind CSS classes** (45 `className` refs) while every other module uses inline styles — visual inconsistency
2. Depends on **orchestrator singletons** (`getFinanceOrchestrator`, `getMarketOrchestrator`, `getMasterAgentOrchestrator`, `getStateContainer`) which are completely separate from the `EngineProvider` context that all other modules use. This means it receives zero data from the Wealth Engine.
3. Has **no default export** — only `export { DashboardIntelligenceHub, ... }`. AppShell handles this with `.then(mod => mod.DashboardIntelligenceHub)` in the dynamic import, so either add a default export or keep the current import pattern.

### What It Should Be

A **CIO command centre** — the first thing Alex sees when he opens the app. It should feel like a morning briefing from a chief of staff.

### Data Sources (via `useEngines()` context)

Import `useEngines` from `'../lib/engineContext'` and destructure:

```javascript
const { ENGINE, MKTENG, AGENT } = useEngines();
```

This gives you access to everything the Wealth Engine computes. Key objects to display:

| Object | Path | What It Contains |
|--------|------|------------------|
| Morning Command | `AGENT?.morningCommand` | `.headline`, `.priorities[]`, `.marketContext`, `.riskAlerts[]` |
| Action Queue | `AGENT?.actionQueue` | `.actions[]` each with `.recommendation`, `.priority`, `.domain` |
| Trigger Alerts | `AGENT?.triggerAlerts` | `.alerts[]` each with `.title`, `.message`, `.severity`, `.domain` |
| Weekly Synthesis | `AGENT?.synthesis` | `.themes{}`, `.topActions[]`, `.outlook` |
| What Matters Now | `AGENT?.whatMattersNow` | `.items[]` with priority-ranked focus areas |
| Daily Brief | `AGENT?.dailyBrief` | `.sections[]` with market/portfolio/action summaries |
| Macro Regime | `MKTENG?.regime` | `.label`, `.confidence`, `.description` |
| Stress Score | `MKTENG?.stress` | `.compositeScore`, `.stressedAssets[]` |
| Portfolio State | `ENGINE?.concentration` | `.hhi`, `.effectivePositions`, `.topHoldings[]` |

**Important:** All these objects may be `null` if the Wealth Engine hasn't loaded yet (or if it crashed). Guard every access with optional chaining and provide "Loading..." or "Pending engine computation" fallbacks.

### Design Spec

**Must use inline styles** — not Tailwind. Match the existing design system:

```javascript
// Import the shared colour palette (copy these values, or import from a shared constants file)
const P = {
  bg: "#05161A", t1: "#e8f4f5", t2: "#b0cdd4", t3: "#7a9da6",
  cyan: "#0F969C", amber: "#f59e0b", positive: "#00E599", negative: "#FF4D4D",
  btc: "#F7931A", indigo: "#6DA5C0", purple: "#a855f7",
  b1: "rgba(15,150,156,0.14)", b2: "rgba(255,255,255,0.06)",
  mono: "'JetBrains Mono','SF Mono',monospace",
};

// Glass card style (use on every card/panel)
const glassCard = {
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(15,150,156,0.14)",
  borderRadius: 16,
  padding: 20,
  backdropFilter: "blur(20px) saturate(1.5)",
  WebkitBackdropFilter: "blur(20px) saturate(1.5)",
};
```

### Layout Structure

```
┌─────────────────────────────────────────────────────────┐
│ LIFESTACK OS · Intelligence Hub · v3.0                  │
│ Updated: [timestamp] · Source: [Supabase/Fallback]      │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  MORNING COMMAND                                        │
│  [headline from AGENT.morningCommand]                   │
│  Priority 1: ...  Priority 2: ...  Priority 3: ...     │
│                                                         │
├──────────────┬──────────────┬──────────────┬────────────┤
│  NET WORTH   │  6M RETURN   │  REGIME      │  STRESS    │
│  £247,000    │  -4.2%       │  REFLATION   │  40.7/100  │
├──────────────┴──────────────┴──────────────┴────────────┤
│                                                         │
│  TOP 5 ACTIONS                    │  GOVERNANCE ALERTS  │
│  1. Maximise ISA (29 days)        │  ● Drift breach     │
│  2. Clear Amex balance            │  ● HHI elevated     │
│  3. Salary sacrifice review       │  ● GIA overweight   │
│  4. Rebalance crypto overweight   │                     │
│  5. Review pension allocation     │                     │
│                                                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  WEEKLY SYNTHESIS                                       │
│  [themes and outlook from AGENT.synthesis]              │
│                                                         │
├─────────────────────────────────────────────────────────┤
│  ENGINE STATUS: 18 running · 7 market · 20 agents      │
│  DATA FRESHNESS: ● Live (10) ● Fresh (20) ● Stale (16) │
└─────────────────────────────────────────────────────────┘
```

### Implementation Notes

1. Keep it under 400 lines
2. Use a single default export: `export default function DashboardIntelligenceHub() { ... }`
3. If you add a default export, you can simplify the AppShell import back to normal: `dynamic(() => import("./DashboardIntelligenceHub"), { ssr: false })`
4. All data from `useEngines()` may be `null` — render graceful "Awaiting engine data..." states
5. Do NOT import from `lib/engineOrchestrator.js`, `lib/agentOrchestrator.js`, or `lib/stateManager.js` — those are unused legacy singletons
6. Do NOT use Tailwind classes — everything must be `style={{...}}` inline

---

## SUPABASE REFERENCE

### Connection
```javascript
// lib/supabase.js
import { createClient } from '@supabase/supabase-js';
const supabaseUrl = 'https://ynvfzssakggmmldjkmes.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'; // anon key
export const supabase = createClient(supabaseUrl, supabaseKey);
```

### Tables (15 total, 106 rows, all RLS-enabled)
```
holdings              22 rows   (name, value, asset_class, geography, currency, wrapper, previous_value)
net_worth_history     24 rows   (week_ending, net_worth, total_assets)
nw_bridge             13 rows   (item_name, delta, item_type, sort_order)
opportunities         10 rows   (title, conviction, timing, alpha, wrapper, size, category, risks, kill)
stress_scenarios       8 rows   (name, impact, probability, description, sort_order)
factor_exposures       8 rows   (factor, loading, benchmark, active, sort_order)
monthly_returns        6 rows   (snapshot_date, month, return_pct)
reference_data         5 rows   (data_key, data_value)
bonus_scenarios        3 rows   (scenario_name, sort_order, allocations)
debts                  2 rows   (name, balance, apr, min_payment, type)
bonus_config           1 row    (gross, tax, ni, post_tax, ...)
risk_metrics           1 row    (vol, sharpe, sortino, max_dd, var95, cvar95, omega, beta)
portfolio_scorecard    1 row    (overall, returns, risk_mgmt, process, tax_eff, diversify, capital_eff)
crypto_metrics         1 row    (btc_dominance, fear_greed, total_market_cap, ...)
portfolio_config       1 row    (net_worth, assets, debts, age, gross_salary, ...)
```

**Note:** `engine_snapshots` table does NOT exist. The `useSnapshotPersistence()` hook queries it but the try-catch handles the 404 gracefully. Do not create it unless you want to enable snapshot persistence.

---

## VERCEL REFERENCE

### Deployment Flow
```
git push origin main → Vercel auto-deploys in ~25-30 seconds
```

### Config
- `next.config.js`: `{ reactStrictMode: true }` — no special config needed
- `vercel.json`: Cron jobs for `/api/cron/daily` (7am) and `/api/cron/weekly` (Monday 8am)
- Build command: `next build` (Webpack, not Turbopack)

### Verification After Deploy
1. Check Vercel dashboard for READY state
2. Hard-refresh the live URL
3. Confirm all 5 module tabs load
4. Wealth Engine should show the full Executive Summary (T1) with charts, KPIs, and Sankey diagram

---

## KEY FILE MAP

### Core Components
```
components/AppShell.jsx                    ~140 lines   Module switcher + ErrorBoundary
components/PortfolioVOS.jsx               3,561 lines   Wealth Engine (14 tabs, all engines)
components/MarketsModule.jsx                ~700 lines   Market & Research (24 tabs) ✅ WORKING
components/CareerModule.jsx                 ~300 lines   Career & Infra (8 tabs) ✅ WORKING
components/SystemsModule.jsx                ~500 lines   Systems & Info (4 tabs) ✅ WORKING
components/DashboardIntelligenceHub.jsx      239 lines   Intelligence Hub ⚠️ NEEDS REBUILD
```

### Data Layer
```
lib/useData.js                              ~560 lines   Supabase fetch + mapping + freshness
lib/defaults.js                             ~400 lines   Hardcoded fallback data (all 15 tables)
lib/liquidGlassMappers.js                   ~350 lines   Engine state → widget prop adapters
lib/supabase.js                               ~6 lines   Supabase client init
lib/engineContext.js                          ~35 lines   React context (ENGINE/MKTENG/AGENT)
```

### Engine Layer
```
lib/engines/index.js                          ~30 lines   Barrel: 18 finance engines
lib/engines/market/index.js                   ~32 lines   Barrel: 26+ market engines
lib/engines/agents/index.js                   ~40 lines   Barrel: 20+ agent functions
lib/engines/*.js                              ~20 files   Individual engine implementations
lib/engines/market/*.js                       ~25 files   Individual market engines
lib/engines/agents/*.js                       ~25 files   Individual agent functions
```

### Widget Library (23 Liquid Glass components)
```
components/tiles/liquid-glass/*.jsx           23 files    v0-generated AE Glass widgets
```
All use Tailwind classes + named/default dual exports. Key ones used by T1:
- `TrajectoryChartWidget.jsx` — net worth trajectory chart
- `AllocationChartWidget.jsx` — asset allocation donut ⚠️ HAS UNGUARDED .map()
- `ConcentricProgressRingsWidget.jsx` — FIRE/concentration rings
- `KpiGridWidget.jsx` — KPI tile grid ⚠️ HAS UNGUARDED .map()
- `LuminousStackedColumnWidget.jsx` — stacked column chart
- `MirroredDivergingBarWidget.jsx` — contributors/detractors
- `ContributionHeatmapWidget.jsx` — monthly heatmap

---

## CONSTRAINTS & GOTCHAS

1. **Do NOT add early returns before hooks.** PortfolioVOS declares `useState(side)` and `useState(open)` after the useEffect block. Any `if (loading) return` placed between them causes React #310 ("Rendered more hooks than during the previous render").

2. **Do NOT add `refresh(n=>n+1)` or similar counters inside useEffect.** This was the root cause of an infinite re-render loop that took 8 commits to diagnose and fix.

3. **Do NOT change useEffect deps to include `saveSnapshot` or `priorSnapshot`.** `saveSnapshot` is recreated per render (even with `useCallback` it's safer to exclude), and including it in deps caused the infinite loop.

4. **Do NOT restructure PortfolioVOS from module-scope variables to React state.** The module-scope pattern is intentional — it avoids re-renders when 18 engines + 7 market engines + 20 agents are computed synchronously. Converting to state would require a complete rewrite.

5. **Do NOT remove the ModuleBoundary ErrorBoundary from AppShell.jsx.** It is the only thing preventing a full-page crash when the Wealth Engine fails.

6. **Do NOT touch MarketsModule.jsx, CareerModule.jsx, or SystemsModule.jsx.** They work perfectly.

7. **Bracket baseline:** PortfolioVOS has a parens balance of +1 (from JSX angle brackets in string expressions). This is expected.

8. **T14 appears before T13 in the file.** This is intentional (Tax Advisor before Glossary in the tab array).

9. **The `P` object's `mono:` key** must not be caught by any regex-based find-and-replace on font strings.

10. **GitHub Actions CI fails** on `tailwindcss/oxide` native binding error. This is a CI-only issue and does NOT affect Vercel deployments. Ignore it.

---

## VALIDATION CHECKLIST (Before Merging to Main)

```bash
# 1. Build passes
npx next build
# Must show "✓ Generating static pages (8/8)" with 0 errors

# 2. Dev server — all 5 modules load
npm run dev
# Open localhost:3000, click each tab, confirm no console errors

# 3. Bracket balance (run from repo root)
node -e "
const fs = require('fs');
['components/AppShell.jsx','components/PortfolioVOS.jsx','components/DashboardIntelligenceHub.jsx','lib/useData.js'].forEach(f=>{
  if(!fs.existsSync(f)) return;
  const c=fs.readFileSync(f,'utf8');
  let b=0,p=0,k=0;
  for(const ch of c){if(ch==='{')b++;if(ch==='}')b--;if(ch==='(')p++;if(ch===')')p--;if(ch==='[')k++;if(ch===']')k--;}
  console.log(f+': {'+b+'} ('+p+') ['+k+'] '+(b===0&&k===0?'✅':'⚠️'));
});
"

# 4. Supabase audit (15 tables, 106 rows)
# Use Supabase CLI or dashboard to confirm all tables present with expected row counts

# 5. Push and verify Vercel deployment reaches READY state
```

---

## SUMMARY — TWO TASKS, IN ORDER

**Task 1 — Fix the Wealth Engine crash.** Run `npm run dev`, get the stack trace from the browser console, apply a targeted `(x || []).map()` null guard at the crash point. Do NOT refactor or restructure. Confirm T1 renders with charts and KPIs.

**Task 2 — Rebuild the Intelligence Hub.** Rewrite `DashboardIntelligenceHub.jsx` as a command centre using `useEngines()` context, inline styles, and the layout spec above. Keep it under 400 lines. Add a default export.

**Then:** Build, push to main, verify all 5 modules load on the live URL.
