# LifeStack OS — Premium Financial Dashboard Implementation Plan

**Date:** 22 March 2026
**Branch:** `claude/add-live-market-data-zD0RR`
**Reference Artifacts:**
- `LifeStack_Design_System_Showcase (2).jsx` — 698-line production React showcase
- `compass_artifact...md` — 970-line technical design specification
- Masttro CPA dashboard screenshots (contribution analysis, portfolio allocation)
- `Wealth Engine and Intelligence Hub crash fixes - Claude.PDF`

---

## Executive Summary

Transform the existing 5-module LifeStack Finance app from **scattered inline palettes + inconsistent glass effects** into a **unified premium institutional-grade dashboard** following the Horizon UI Pro + Apple Liquid Glass specification. The showcase JSX is the visual target; the compass spec is the build rulebook.

---

## Current State (Problems)

| Issue | Detail |
|-------|--------|
| **Duplicated palettes** | `P` object copy-pasted across 5 modules (PortfolioVOS, MarketsModule, SystemsModule, CareerModule, DashboardIntelligenceHub) |
| **Inconsistent glass** | Modules use inline CSS glass; liquid-glass widgets use Tailwind classes; no single system |
| **No centralized tokens** | Zero shared design constants file; `MAT` object duplicated in 3+ files |
| **Fonts not loaded** | JetBrains Mono referenced but never loaded; DM Sans (spec requirement) absent entirely |
| **Two conflicting palettes** | `P` (teal-navy #0F969C) vs `TOK` in liquidGlassMappers.js (neon #00D4AA) vs Showcase `C` (cyan #00BCD4) |
| **No D3.js** | Spec calls for D3 Sankey + Monte Carlo fan; currently not in dependencies |
| **Missing components** | No KPI tiles, no Monte Carlo fan, no concentric progress rings, no Sankey flow, no holdings table, no governance alerts, no action queue footer |
| **No 12-column grid** | Modules use ad-hoc flex layouts instead of the spec's `repeat(12, 1fr)` grid system |

---

## Target State

A unified design system where:
1. **Every** module pulls from one `lib/designTokens.js` file
2. **GlassCard** is a single shared component (quiet/heavy tiers)
3. **KpiTile** is a reusable component with severity borders + sparklines
4. **Charts** follow prescriptive color grammar from the spec
5. **12-column grid** is the layout primitive for all dashboard zones
6. **Fonts** (DM Sans + JetBrains Mono) are properly loaded
7. **D3.js** powers Monte Carlo fan and Sankey flow charts
8. **All 5 modules** render with consistent glass-on-teal-dark aesthetic

---

## Sprint Plan (10 Steps)

### Phase A: Foundation (Steps 1-3)

#### Step 1 — Create Centralized Design Tokens
**File:** `lib/designTokens.js`
**Action:** Create single source of truth with:
- Color tokens (`C`) — merging current `P` palette with showcase `C` palette
- Typography tokens (`F`) — DM Sans + JetBrains Mono
- Spacing tokens
- Glass styles (`quietGlass`, `heavyGlass`) matching the showcase spec
- Material tile styles (`MAT`)
- Chart color grammar (8-color series palette, semantic colors)
- Layout tokens (sidebar width, border radii, breakpoints)
- Helper functions: `Shine()`, `Noise()`, `glassLight(tier)`, `hx()` color converter

**Decision:** Keep the existing teal-navy aesthetic (`#05161A` bg, `#0F969C` cyan) since it's established across all modules, but add the showcase's expanded token vocabulary (gold, purple, chart series, semantic positive/negative).

**Validation:** File exports all tokens; no inline colors remain in any module.

#### Step 2 — Load Fonts
**File:** `app/layout.js`
**Action:**
- Add `@import` for DM Sans (400, 500, 700) and JetBrains Mono (400, 500, 600) from Google Fonts
- Set `fontFamily` on `<body>` to DM Sans as default
- Alternatively use Next.js `next/font/google` for optimal loading

**Validation:** DevTools shows DM Sans for body text, JetBrains Mono for numerical values.

#### Step 3 — Create Shared UI Primitives
**Files:** `components/ui/GlassCard.jsx`, `components/ui/KpiTile.jsx`, `components/ui/GlassTooltip.jsx`, `components/ui/CardHeader.jsx`

**GlassCard** — Exact port from showcase:
- Accepts `heavy` prop (quiet vs heavy glass)
- Accepts `span` prop for grid column span
- Renders `<Shine/>` + `<Noise/>` overlays
- Uses tokens from `lib/designTokens.js`

**KpiTile** — Port from showcase:
- Icon container (44x44, colored bg)
- Label, value (JetBrains Mono 26px), delta with arrow
- Severity-coded left border (success/warning/critical)
- Inline SVG sparkline (72x22)

**GlassTooltip** — Port from showcase:
- Frosted glass tooltip for all Recharts charts
- Glow dot per series, value formatting

**CardHeader** — Port from showcase:
- Title + subtitle + optional badge + optional right slot
- Bottom border separator

**Validation:** Components render identically to the showcase artifact.

---

### Phase B: Module Migration (Steps 4-7)

#### Step 4 — Migrate DashboardIntelligenceHub (237 lines — smallest)
**File:** `components/DashboardIntelligenceHub.jsx`
**Action:**
- Replace inline `P` palette with `import { C, F, ... } from '../lib/designTokens'`
- Replace ad-hoc cards with `<GlassCard>` + `<CardHeader>`
- Add KPI strip using `<KpiTile>` (Net Worth, Total Assets, 6M Return, FIRE Progress)
- Add Morning Command footer using `<GlassCard heavy>`
- Convert layout to 12-column grid

**Validation:** Module renders with showcase-quality glass cards and KPI strip.

#### Step 5 — Migrate PortfolioVOS (largest module, ~2000+ lines)
**File:** `components/PortfolioVOS.jsx`
**Action:**
- Replace inline `P` with imported tokens
- Replace internal glass functions with shared `<GlassCard>`
- Upgrade net worth chart to use showcase gradient fill + SVG glow filter + glass tooltip
- Add allocation donut with legend (Masttro-inspired)
- Add concentric progress rings (FIRE Progress, Diversification, Tax Efficiency)
- Add holdings table with hover highlights, return arrows, wrapper tags
- Add governance alerts panel
- Convert all 3 tabs to 12-column grid layout

**Masttro Reference Integration:**
- Top/Bottom Contributors table pattern (from Masttro screenshot 4)
- Contribution by Asset Class donut (from Masttro screenshot 4 — 63% Equity style)
- Contribution by Sector breakdown

**Validation:** T1 Summary tab matches the showcase artifact layout.

#### Step 6 — Migrate MarketsModule
**File:** `components/MarketsModule.jsx`
**Action:**
- Replace inline `P`, `T`, `STATIC_M`, `MAT` with imported tokens
- Replace `Glass()`, `GS` with `<GlassCard>`
- Replace `Hd()` with `<CardHeader>` + `showFreshness` FreshnessChip
- Preserve all 16 tabs + live data refresh logic (from our previous sprint)
- Upgrade chart styling to use showcase gradient fills + glow filters

**Critical:** The `FreshnessChip` + live data refresh + 26 engine recomputation logic MUST be preserved exactly.

**Validation:** All 16 tabs render correctly; live data refresh still works.

#### Step 7 — Migrate SystemsModule + CareerModule
**Files:** `components/SystemsModule.jsx`, `components/CareerModule.jsx`
**Action:**
- Replace inline `P`, `MAT` with imported tokens
- Replace glass/material tile styles with shared components
- Convert layouts to 12-column grid
- Upgrade charts to showcase styling (gradient fills, glow filters)

**Validation:** Both modules render with consistent glass aesthetic.

---

### Phase C: Advanced Visualizations (Steps 8-9)

#### Step 8 — Add D3.js Monte Carlo Fan Chart
**File:** `components/ui/MonteCarloFan.jsx`
**Action:**
- Install `d3-scale`, `d3-shape`, `d3-array` (lightweight D3 modules only)
- Port the `MonteCarloFan` component from the showcase
- Pure SVG with layered probability bands (P10-P90)
- "Today" dashed vertical marker
- Y-axis in £k format
- Wire into PortfolioVOS T1 (Wealth Projection card)

**D3 Integration Rule:** D3 computes layout; React renders SVG. No `d3.select()` or `d3.append()`.

**Validation:** Fan chart renders 10K simulations with 3 probability bands + median glow line.

#### Step 9 — Add Sankey Capital Flow Diagram
**File:** `components/ui/SankeyFlow.jsx`
**Action:**
- Install `d3-sankey` (npm package)
- Build Sankey diagram: Salary → Gross → (Tax / NI / Net) → (Stocks / Bonds / Property / Cash / Expenses)
- Color code: green for income, red for tax, blue for investments, amber for expenses
- Link opacity 0.3, source-colored
- Wire into CareerModule or PortfolioVOS T2 (Structure tab)

**Validation:** Sankey renders capital flow with proper node widths and curved links.

---

### Phase D: Polish & Verification (Step 10)

#### Step 10 — Integration Testing + Build Verification
**Action:**
- Run `npx jest` — all 890+ tests must pass (pre-existing failures excepted)
- Run `npx next build` — must compile without errors
- Verify each module renders (manual smoke test via `npm run dev`)
- Verify live market data refresh still works in MarketsModule
- Verify ECharts widgets in liquid-glass directory still render
- Check bundle size stays under 300KB for chart libraries
- Verify DM Sans + JetBrains Mono load correctly
- Commit and push to branch

---

## Risk Mitigation

| Risk | Mitigation |
|------|-----------|
| Breaking existing module functionality | Migrate one module at a time; run tests after each |
| Live data refresh breaks in MarketsModule | Preserve `refreshMarketData()` + `_freshness` + `MKTENG` recomputation exactly |
| ECharts widget incompatibility | Liquid-glass widgets stay on Tailwind; only main modules migrate to tokens |
| Bundle size bloat from D3 | Import only `d3-sankey`, `d3-scale`, `d3-shape`, `d3-array` (not full d3) |
| Font loading performance | Use `next/font/google` with `display: 'swap'` for zero FOIT |
| Glass backdrop-filter perf | Limit to 3-5 glass cards per viewport; add `transform: translateZ(0)` for GPU compositing |

---

## File Inventory

### New Files to Create
```
lib/designTokens.js          — Centralized design tokens (single source of truth)
components/ui/GlassCard.jsx  — Shared glass card (quiet/heavy)
components/ui/KpiTile.jsx    — KPI stat tile with sparkline
components/ui/GlassTooltip.jsx — Frosted tooltip for all charts
components/ui/CardHeader.jsx — Card header with badge + subtitle
components/ui/MonteCarloFan.jsx — D3 fan chart (pure SVG)
components/ui/SankeyFlow.jsx — D3 Sankey capital flow
```

### Files to Modify
```
app/layout.js                — Add font loading
components/DashboardIntelligenceHub.jsx — Token migration + KPI strip
components/PortfolioVOS.jsx  — Token migration + new visualizations
components/MarketsModule.jsx — Token migration (preserve live data)
components/SystemsModule.jsx — Token migration
components/CareerModule.jsx  — Token migration
package.json                 — Add d3-sankey, d3-scale, d3-shape, d3-array
```

### Files NOT Modified (preserved as-is)
```
components/tiles/liquid-glass/*.jsx — 20 widget files (Tailwind-based, working)
lib/engines/**                     — All 46 engine files (pure computation)
app/api/**                         — API routes (working)
lib/useMarketData.js               — Live data hook (working)
lib/useData.js                     — Freshness layer (working)
lib/defaults.js                    — Fallback data (working)
__tests__/**                       — Test suite (working)
```

---

## Palette Reconciliation

| Token | Current `P` | Showcase `C` | Decision |
|-------|------------|-------------|----------|
| Background | `#05161A` | `#05161A` | Same — keep |
| Primary accent | `#0F969C` (teal) | `#00BCD4` (cyan) | Keep `#0F969C` — it's the established brand across all modules |
| Text primary | `#e8f4f5` | `rgba(255,255,255,0.92)` | Use showcase (more standard) |
| Text secondary | `#b0cdd4` | `rgba(255,255,255,0.68)` | Use showcase |
| Positive | `#22c55e` | `#00C853` | Use showcase |
| Negative | `#ef4444` / `#f43f5e` | `#FF1744` | Use showcase |
| Warning | `#f59e0b` | `#FFC107` | Use showcase |
| Gold | `#f59e0b` | `#FFB300` | Use showcase (distinct from warning) |
| Chart series | `s1-s6` | `ch1-ch8` | Use showcase 8-color palette |
| Mono font | JetBrains Mono | JetBrains Mono | Same |
| Sans font | system-ui | DM Sans | Use showcase (DM Sans) |

---

## Definition of Done

- [ ] `lib/designTokens.js` created with all tokens from spec
- [ ] Fonts (DM Sans + JetBrains Mono) loaded in `app/layout.js`
- [ ] 5 shared UI components created in `components/ui/`
- [ ] All 5 modules import tokens from `lib/designTokens.js` (zero inline palettes)
- [ ] 12-column grid used in all dashboard zones
- [ ] KPI strip in DashboardIntelligenceHub + PortfolioVOS
- [ ] Monte Carlo fan chart in PortfolioVOS
- [ ] Sankey diagram wired up
- [ ] Holdings table with hover + return arrows + wrapper tags
- [ ] Governance alerts panel with severity-coded cards
- [ ] Morning Command action queue footer
- [ ] `npx next build` passes
- [ ] `npx jest` passes (890+ tests, pre-existing failures excepted)
- [ ] Live market data refresh works in MarketsModule
- [ ] Pushed to `claude/add-live-market-data-zD0RR`
