CONTINUED — LifeStack Wealth OS Phase 3 Master Register and Finance Module Deep Wireframes (T1-T15)

This continues the Phase 3 deliverable from CMP-054 onward in the Master Register, then completes all remaining wireframe detail and the architectural conclusion.

---

## PART C CONTINUED: MASTER TABULAR REGISTER (CMP-054 through CMP-120)

| CMP-ID | Source Kit | Component Name | Category | Chart Family | Size Tiers | L/D | Interactive States | Deep-Dive Type | Glossary | Tab Target | Data Metric |
|--------|-----------|---------------|----------|-------------|-----------|-----|-------------------|---------------|---------|-----------|------------|
| CMP-054 | Custom-Build | Tornado Sensitivity Chart | Sensitivity | Tornado/Bar | L, XL | Dark | Default, Hover-bar, Click-drill | Variable sensitivity curve | ✓ | T5, T9 | Impact magnitude per variable |
| CMP-055 | Hyper Charts | Stacked Bar (Grouped) | Comparison | Bar | M, L, XL | Both | Default, Hover, Toggle group | Group breakdown | ✓ | T3, T4, T7 | Grouped categorical |
| CMP-056 | Hyper Charts | Step Line Chart | Trend | Line (Step) | M, L | Dark | Default, Hover, Zoom | Period detail | ✓ | T6, T12 | Discrete state changes |
| CMP-057 | Orion UI | Multi-Gauge Dashboard Panel | KPI | Multi-Gauge | L, XL | Dark | Default, Hover-gauge | Individual gauge detail | ✓ | T1, T4, T15 | Multiple threshold metrics |
| CMP-058 | Hyper Charts | Diverging Bar Chart | Comparison | Bar (Diverging) | M, L | Dark | Default, Hover | Category comparison | ✓ | T3, T4, T8 | Positive/negative values |
| CMP-059 | Eclipse UI | Badge/Status Pill | Status | Badge | HS (inline) | Both | Default, Pulse | N/A | — | T1, T13, T15 | Status label |
| CMP-060 | DesignCode | Tooltip (Rich) | Overlay | Tooltip | Contextual | Both | Hover-show, Click-pin | N/A | — | T1-T15 | Context data |
| CMP-061 | Orion UI | Calendar Heatmap | Distribution | Heatmap | ML, L | Dark | Default, Hover-day | Day detail | ✓ | T6, T13 | Daily intensity |
| CMP-062 | Hyper Charts | Progress Donut (Multi-ring) | Progress | Donut | S, M | Both | Default, Hover-ring | Goal detail | ✓ | T7, T9 | Multiple % completions |
| CMP-063 | Custom-Build | Sensitivity Heatmap (2-Way) | Analysis | Heatmap | L, XL | Dark | Default, Hover-cell | Cell scenario detail | ✓ | T5 | Two-variable matrix |
| CMP-064 | Hyper Charts | Waterfall (Horizontal) | Flow | Waterfall | L, XL | Dark | Default, Hover-bar, Click-bar | Component drill | ✓ | T6, T7 | Step decomposition |
| CMP-065 | Eclipse UI | Card Stack (KPI Cluster) | Layout | Card Stack | M, L | Both | Default, Hover-card | Card expansion | ✓ | T5, T10 | Grouped KPIs |
| CMP-066 | Orion UI | Comparison Table (Highlight) | Data Display | Table | L, XL | Both | Default, Sort, Highlight-best | Row detail | ✓ | T7, T12 | Multi-attribute comparison |
| CMP-067 | Hyper Charts | Bubble Chart | Relationship | Bubble | L, XL | Dark | Default, Hover-bubble, Brush | Bubble detail | ✓ | T8 | Three-variable scatter |
| CMP-068 | DesignCode | Slider/Range Input | Input | Slider | Inline | Both | Default, Dragging, Active | N/A | — | T5, T12 | Continuous input |
| CMP-069 | Custom-Build | Withdrawal Balance Overlay | Composite | Dual-Axis Line/Bar | L, XL | Dark | Default, Hover, Toggle | Period detail | ✓ | T5, T9 | Balance + withdrawals |
| CMP-070 | Hyper Charts | Wave/Stream Area | Trend | Area (Stream) | L, XL | Dark | Default, Hover-layer | Layer detail | ✓ | T2, T9 | Multi-category flow |
| CMP-071 | Orion UI | World Map (Dot Density) | Geographic | Dot Map | L, XL | Dark | Default, Hover-region, Zoom | Region detail | ✓ | T2 | Geographic distribution |
| CMP-072 | Eclipse UI | Sidebar Navigation | Navigation | Sidebar | Fixed | Both | Default, Active, Collapsed | N/A | — | Global | Tab navigation |
| CMP-073 | Liquid Glass | Tier 1 Ultra-Thin Container | Container | Glass Surface | HS, VS | Dark | Default, Hover | N/A | — | T1-T15 | Badges, pills |
| CMP-074 | Liquid Glass | Tier 2 Thin Container | Container | Glass Surface | HS, VS, S | Dark | Default, Hover | N/A | — | T1-T15 | Small KPI tiles |
| CMP-075 | Liquid Glass | Tier 3 Regular Container | Container | Glass Surface | S, M, ML | Dark | Default, Hover, Active | N/A | — | T1-T15 | Standard tiles |
| CMP-076 | Liquid Glass | Tier 4 Elevated Container | Container | Glass Surface | L, XL | Dark | Default, Hover, Active, Focus | N/A | — | T1-T15 | Featured tiles |
| CMP-077 | Liquid Glass | Tier 5 Modal Container | Container | Glass Surface | Overlay | Dark | Opening, Open, Closing | N/A | — | T1-T15 | Deep-dive panels |
| CMP-078 | Hyper Charts | Percentage Bar (Stacked) | Part-to-Whole | Stacked Bar | HS, M | Both | Default, Hover-segment | Segment detail | ✓ | T2, T7 | 100% composition |
| CMP-079 | Orion UI | Infographic Timeline | Temporal | Infographic | ML, L, XL | Dark | Default, Hover-node | Event detail | ✓ | T9, T14 | Ordered events |
| CMP-080 | Custom-Build | Funding Rate Heatmap | Crypto | Heatmap | L, XL | Dark | Default, Hover-cell | Exchange/period detail | ✓ | T11 | Funding rate matrix |
| CMP-081 | Custom-Build | Open Interest Overlay | Crypto | Dual-Axis | L, XL | Dark | Default, Hover, Toggle | Period detail | ✓ | T11 | OI + price |
| CMP-082 | Custom-Build | ETF Flow Bar Chart | Crypto | Bar | ML, L | Dark | Default, Hover-bar | ETF detail | ✓ | T11 | Daily net flows |
| CMP-083 | Custom-Build | NUPL Sentiment Band | Crypto | Band Chart | ML, L | Dark | Default, Hover | Phase detail | ✓ | T11 | Net unrealized P/L |
| CMP-084 | Custom-Build | Liquidation Heatmap | Crypto | Heatmap | L, XL | Dark | Default, Hover-cell | Price level detail | ✓ | T11 | Liquidation clusters |
| CMP-085 | Hyper Charts | Amortisation Stacked Column | Finance | Stacked Bar | L, XL | Dark | Default, Hover-bar | Period P+I detail | ✓ | T12 | Principal vs interest |
| CMP-086 | Eclipse UI | Action Card (Accept/Reject) | Task Mgmt | Action Card | S, M | Both | Default, Accept, Reject, Defer | Recommendation detail | ✓ | T13 | AI recommendation |
| CMP-087 | Custom-Build | DQ Chain Diagram | Decision | Chain Link | ML, L | Dark | Default, Hover-link | Dimension detail | ✓ | T14 | 6-dimension quality |
| CMP-088 | Custom-Build | Disposition Effect Tracker | Behavioural | Dual Panel | ML, L | Dark | Default, Hover | Holding period detail | ✓ | T14 | Winner/loser hold time |
| CMP-089 | Custom-Build | Streak Tracker | Behavioural | Sequential | ML | Dark | Default, Hover-streak | Streak detail | ✓ | T14 | Win/loss sequences |
| CMP-090 | Orion UI | Node Graph (System Architecture) | System | Force Graph | XL, XXL | Dark | Default, Hover-node, Click-node | Component detail | ✓ | T15 | System topology |
| CMP-091 | Custom-Build | API Health Row | System | Status Row | (table row) | Dark | Default, Hover | Endpoint metrics | ✓ | T15 | Response/error/uptime |
| CMP-092 | Custom-Build | Data Freshness Card | System | Status Card | S, M | Dark | Default, Pulse-stale | Source detail | ✓ | T15 | Last sync + staleness |
| CMP-093 | Eclipse UI | Scrollable Log Feed | System | Live Feed | L, XL | Dark | Default, Scroll, Filter | Log entry detail | ✓ | T15 | Error/event log |
| CMP-094 | DesignCode | Alphabetical Nav Sidebar | Navigation | A-Z Index | Fixed | Both | Default, Active-letter | N/A | — | T15 | Glossary navigation |
| CMP-095 | Hyper Charts | Sparkline (Inline) | Trend | Sparkline | HS (inline) | Both | Default, Hover-point | Full chart expansion | — | T1-T15 | Inline trend |
| CMP-096 | Institutional/Bloomberg | Dense Multi-Panel Layout | Layout | Panel Grid | Full screen | Dark | Resize, Tab, Toggle | N/A | — | Global | Bloomberg-inspired density |
| CMP-097 | Institutional/Addepar | Look-Through Stacked Bars | Analysis | Side-by-Side Bar | L, XL | Dark | Default, Toggle wrapper/look-through | Security detail | ✓ | T2 | Wrapper vs true exposure |
| CMP-098 | Institutional/Masttro | Entity Ownership Tree | Hierarchy | Node Tree | XL, XXL | Dark | Default, Expand-node, Click | Entity detail | ✓ | T2 | Ownership structure |
| CMP-099 | Institutional/Nuant | Cross-Venue Exposure Chart | Crypto | Stacked Bar/Donut | L, XL | Dark | Default, Hover-venue | Venue positions | ✓ | T11 | Exchange/wallet exposure |
| CMP-100 | Custom-Build | Synopsis Summary Panel | Layout | Text + Chart | XXL | Dark | Default, Expand | Full analysis | ✓ | T1-T15 | Conclusion content |
| CMP-101 | Hyper Charts | Mini KPI with Trend Arrow | KPI | Micro Stat | HS | Both | Default, Hover | Full metric view | ✓ | T1-T15 | Single value + direction |
| CMP-102 | Orion UI | Filter Chip Bar | Input | Filter Chips | (header) | Both | Default, Active, Clear | N/A | — | T1-T15 | Active filters |
| CMP-103 | DesignCode | Export Button Group | Action | Button Group | (inline) | Both | Default, Hover, Active | Export modal | — | T1-T15 | CSV/PNG/PDF |
| CMP-104 | Hyper Charts | Curved/Spline Line | Trend | Line (Smooth) | M, L, XL | Dark | Default, Hover, Zoom | Period detail | ✓ | T3, T9, T12 | Smoothed time series |
| CMP-105 | Eclipse UI | Skeleton Loader | Feedback | Placeholder | Any | Both | Loading | N/A | — | T1-T15 | Loading state |
| CMP-106 | DesignCode | Empty State Panel | Feedback | Placeholder | M, L | Both | Default | N/A | — | T1-T15 | No data state |
| CMP-107 | Hyper Charts | Rose/Nightingale Chart | Part-to-Whole | Polar Bar | M, L | Dark | Default, Hover-petal | Category detail | ✓ | T2 | Angular proportions |
| CMP-108 | Custom-Build | Probability Gauge (Monte Carlo) | Probabilistic | Semi-Gauge | S, M | Dark | Default, Hover | Simulation detail | ✓ | T5, T9 | % success probability |
| CMP-109 | Orion UI | Data Table (Expandable Rows) | Data Display | Table | L, XL, XXL | Both | Default, Expand-row, Sort, Filter | Inline detail | ✓ | T8, T11, T13 | Hierarchical tabular |
| CMP-110 | Custom-Build | T-Bill Ladder Diagram | Finance | Timeline | ML, L | Dark | Default, Hover-rung | Rung detail | ✓ | T10 | Maturity/yield rungs |
| CMP-111 | Hyper Charts | Horizontal Stacked Bar | Part-to-Whole | Stacked Bar (H) | M, L, XL | Dark | Default, Hover-segment | Segment detail | ✓ | T10 | Liquidity buckets |
| CMP-112 | Custom-Build | FIRE Progress Thermometer | Goal | Thermometer | VS, S, M | Dark | Default, Hover-milestone | Milestone detail | ✓ | T9 | NW vs FI targets |
| CMP-113 | Custom-Build | Style Box Grid (3x3) | Analysis | Matrix | M | Dark | Default, Hover-cell | Cell detail | ✓ | T2 | Value/Growth × Cap size |
| CMP-114 | Hyper Charts | Cumulative Line Chart | Trend | Line (Cumulative) | L, XL | Dark | Default, Hover, Brush | Period detail | ✓ | T3, T12 | Running total |
| CMP-115 | Custom-Build | Conviction-Outcome Scatter | Decision | Scatter | L, XL | Dark | Default, Hover-point, Quadrant | Decision detail | ✓ | T14 | Pre-score vs outcome |
| CMP-116 | Eclipse UI | Toast Notification | Feedback | Toast | Overlay | Both | Appear, Dismiss, Action | N/A | — | T1-T15 | Alert messages |
| CMP-117 | DesignCode | Breadcrumb Navigation | Navigation | Breadcrumb | Inline | Both | Default, Hover, Active | N/A | — | T1-T15 | Drill-down path |
| CMP-118 | Custom-Build | Pattern Recognition Cards | Behavioural | Card | M, ML | Dark | Default, Expand | Full pattern analysis | ✓ | T14 | Detected patterns |
| CMP-119 | Orion UI | Resource Utilisation Gauge | System | Multi-Gauge | M | Dark | Default, Hover | Resource detail | ✓ | T15 | CPU/Memory/Storage |
| CMP-120 | Custom-Build | Interactive Glossary Panel | Reference | Accordion + Search | XXL (ext.) | Both | Search, Expand, Cross-link | Term detail | ✓ | T15 | 340 financial terms |

---

## AGGREGATE COMPONENT COUNTS BY SOURCE

| Source Kit | Components in Register | Unique Chart Families | Tab Coverage |
|-----------|----------------------|----------------------|-------------|
| Hyper Charts | 38 | 18 (line, area, bar, stacked bar, histogram, pie, donut, radar, scatter, bubble, heatmap, treemap, candlestick, waterfall, gauge, sankey, sparkline, funnel) | T1-T15 |
| DesignCode UI | 16 | 0 (structural only: tables, modals, accordions, search, buttons, navigation, tooltips) | T1-T15 |
| Orion UI | 18 | 8 (choropleth, dot map, timeline, calendar heatmap, stat cards, multi-gauge, data tables, node graph) | T1-T15 |
| Eclipse UI | 14 | 3 (progress, kanban, calendar) + structural (cards, badges, toggles, sidebar, skeleton, toast) | T1-T15 |
| Horizon UI | 0 direct (used as React implementation reference for Orion/Eclipse patterns) | N/A | Reference |
| Full Charts | 0 direct (patterns absorbed into Hyper Charts entries) | N/A | Reference |
| Liquid Glass | 5 | Material system (5 tiers × 2 pseudo-elements) | T1-T15 |
| Custom-Build | 28 | 15 (sunburst, ridgeline, chord, parallel coordinates, 3D surface, marimekko, hexbin, stream graph, force graph, beeswarm, radial histogram, voronoi, fan chart, tornado, various crypto-specific) | T1-T15 |
| Institutional | 4 | Pattern reference (Bloomberg density, Addepar look-through, Masttro entity tree, Nuant cross-venue) | T2, T11 |
| **TOTAL** | **123 unique entries** | **44+ chart families** | **All 15 tabs** |

---

## TAB-LEVEL TILE COUNTS AND SCROLL DEPTHS

| Tab | Tab Name | Total Tiles | Experimental Chart | Scroll Depth | Primary Hero | Bottom Hero |
|-----|----------|------------|-------------------|-------------|-------------|-------------|
| T1 | Executive Summary | 42 | Radar Spider (CMP-009) | 1.8 viewports | Net Worth Area (XXL) | Synopsis + Choropleth (XXL) |
| T2 | Structure & Concentration | 44 | Sunburst (CMP-015) | 2.0 viewports | Treemap + Sunburst (2× XL) | Synopsis (XXL) |
| T3 | Performance & Attribution | 43 | Ridgeline Plot (CMP-021) | 2.1 viewports | Cumulative Returns (XXL) | Synopsis (XXL) |
| T4 | Risk Engine | 45 | Chord Diagram (CMP-023) | 2.1 viewports | Loss Distribution (XL) | Synopsis (XXL) |
| T5 | Stress Tests | 44 | Parallel Coordinates (CMP-026) | 2.1 viewports | Monte Carlo Fan (XXL) | Synopsis (XXL) |
| T6 | Cashflow & Capital | 42 | Sankey Flow (CMP-028) | 2.1 viewports | Sankey Diagram (XXL) | Synopsis (XXL) |
| T7 | Tax Optimisation | 43 | Marimekko (CMP-031) | 2.0 viewports | Tax Drag Divergence (XXL) | Synopsis (XXL) |
| T8 | Opportunity Radar | 41 | Hexbin Density (CMP-032) | 2.1 viewports | Bubble + Matrix (2× XL) | Synopsis (XXL) |
| T9 | Goals & Milestones | 44 | Stream Graph (CMP-033) | 2.2 viewports | FIRE Thermometer + Timeline (2× XL) | Synopsis (XXL) |
| T10 | Liquidity Management | 42 | Liquidity Treemap (CMP-014) | 2.0 viewports | Liquidity Ladder (XXL) | Synopsis (XXL) |
| T11 | Crypto Intelligence | 46 | 3D Volatility Surface (CMP-027) | 2.2 viewports | BTC Candlestick (XXL) | Synopsis (XXL) |
| T12 | Debt & Leverage | 40 | Force-Directed Graph (CMP-034) | 2.0 viewports | Payoff Comparison (XXL) | Synopsis (XXL) |
| T13 | Action Plan | 41 | Beeswarm Plot (CMP-035) | 2.0 viewports | Priority Table (XXL) | Synopsis (XXL) |
| T14 | Decision Log | 42 | Radial Histogram (CMP-036) | 2.0 viewports | Attribution Waterfall (XXL) | Synopsis (XXL) |
| T15 | System & Glossary | 44 | Voronoi Diagram (CMP-037) | 2.5 viewports | Architecture Diagram (XXL) | Interactive Glossary (XXL ext.) |
| **TOTAL** | **15 tabs** | **643 tiles** | **15 experimental** | **Avg 2.1** | **15 hero tops** | **15 hero bottoms** |

---

## UNIVERSAL TILE INTERACTION SPECIFICATION

Every tile in every tab includes three interaction affordances, implemented consistently:

**1. Deep-Dive Expansion (click anywhere on tile body)**
- Triggers a Tier 5 Modal glass overlay (CMP-077) centered on screen
- Panel animates from tile origin position using `transform-origin` set to tile center coordinates
- Panel contains: full-size chart, data table below, time range selector, benchmark toggle, and export bar
- Close via X button, Escape key, or backdrop click
- CSS: `position: fixed; inset: 0; z-index: 100; backdrop-filter: blur(8px);` overlay with `max-width: 1200px; max-height: 85vh; overflow-y: auto;` panel

**2. Glossary ⓘ Popover (click info icon in tile header)**
- Uses HTML Popover API with `popover="hint"` type for proximity positioning
- Frosted glass popover (CMP-049): `background: rgba(20,20,35,0.85); backdrop-filter: blur(24px);`
- Content: Term name (h4), plain-language definition (paragraph), formula if applicable (monospace code block), link to T15 glossary for extended reading
- Animation: 200ms fade + translateY(4px) entry using `@starting-style`

**3. Export Menu (hover reveals action bar in tile header)**
- Three-dot menu or download icon appears on tile hover (`opacity: 0` → `opacity: 1` transition)
- Dropdown offers: Export CSV (raw data), Export PNG (chart image via html2canvas), Export PDF (tile report via jsPDF), Copy to Clipboard
- Menu uses same frosted glass styling as glossary popover

---

## CSS GRID IMPLEMENTATION SPECIFICATION

```css
/* === CORE GRID === */
.finance-tab-grid {
  display: grid;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  grid-auto-rows: 80px;
  grid-auto-flow: dense;
  gap: 12px;
  padding: 16px 24px;
  max-width: 1440px;
  margin: 0 auto;
  contain: layout;
}

/* === TILE SIZE CLASSES === */
.tile-hs  { grid-column: span 2;  grid-row: span 1; }
.tile-vs  { grid-column: span 1;  grid-row: span 2; }
.tile-s   { grid-column: span 2;  grid-row: span 2; }
.tile-m   { grid-column: span 3;  grid-row: span 2; }
.tile-ml  { grid-column: span 4;  grid-row: span 2; }
.tile-l   { grid-column: span 4;  grid-row: span 3; }
.tile-xl  { grid-column: span 6;  grid-row: span 3; }
.tile-xxl { grid-column: span 12; grid-row: span 3; }

/* === LIQUID GLASS BASE TILE === */
.glass-tile {
  position: relative;
  isolation: isolate;
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(16px) saturate(160%);
  -webkit-backdrop-filter: blur(16px) saturate(160%);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 20px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.20),
              inset 0 1px 0 rgba(255, 255, 255, 0.10);
  overflow: hidden;
  transform: translateZ(0);
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1),
              box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Specular highlight */
.glass-tile::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: linear-gradient(135deg,
    rgba(255, 255, 255, 0.25) 0%,
    rgba(255, 255, 255, 0.05) 40%,
    transparent 60%);
  pointer-events: none;
  z-index: 1;
}

/* Hover elevation */
.glass-tile:hover {
  transform: translateY(-2px) scale(1.005);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.30),
              0 4px 12px rgba(0, 0, 0, 0.20);
}

/* === PAGE BACKGROUND === */
body {
  background-color: #080810;
  color: #E8E8ED;
  min-height: 100vh;
}

body::before {
  content: '';
  position: fixed;
  inset: 0;
  background:
    radial-gradient(ellipse at 20% 50%, rgba(56, 89, 160, 0.08), transparent 60%),
    radial-gradient(ellipse at 80% 20%, rgba(120, 50, 160, 0.06), transparent 50%);
  z-index: -1;
}

/* === PERFORMANCE OPTIMIZATION === */
.glass-tile { content-visibility: auto; contain-intrinsic-size: auto 172px; }
.tile-xxl { contain-intrinsic-size: auto 264px; }
```

---

## LIVE DATA CONTEXT MAPPING

All metrics reference the following live portfolio state, which feeds tile payloads across all 15 tabs:

| Asset / Account | Current Value | Peak Value | Change | Tab Primary |
|----------------|--------------|-----------|--------|------------|
| Total Net Worth | £262,622.60 | £297,456.82 | -11.7% | T1, T9 |
| Daiwa Pension (SIPP) | £60,275.00 | — | Largest holding (23%) | T1, T2, T7 |
| BTC Position | £21,900.00 | £39,100.00 | -44.0% | T1, T4, T11 |
| Monzo Cash | £11,558.00 | — | Emergency fund (depleted) | T6, T10 |
| ZAR Asset | £20,258.00 | — | 7.7% of portfolio | T2 |
| JURE.L | £23,834.00 | — | UK equity | T2, T3 |
| JGEP.L | £17,039.00 | — | UK equity (corr. 0.78 w/ JURE) | T2, T3, T4 |

---

## PLATFORM DESIGN PATTERNS SYNTHESISED

The wireframe specifications above synthesise proven patterns from six institutional platforms:

**Bloomberg PORT** contributes the maximum-density philosophy — no whitespace, color-coded data categories, keyboard-driven navigation, tabbed multi-panel layouts. The dark theme with orange/amber/green text on black is the archetype for the #080810 Liquid Glass approach. Bloomberg's intraday monitor chart pattern inspires the T1 Net Worth Hero as a real-time trajectory display.

**Addepar** contributes the look-through analysis methodology for T2 — drilling from household to holding through nested ownership hierarchies, with widget-based customisable dashboards and section templates. The Analysis Tab pattern of asset table plus paired charts directly influences the L-size tile pairing across all tabs.

**Masttro** contributes the Global Wealth Map concept — an interactive entity/ownership tree that maps every asset to its legal structure. This pattern powers the T2 Sunburst and the ownership hierarchy visualisations. Masttro's 200+ pre-built dashboards demonstrate the component-based architecture this system adopts.

**Compound Planning** contributes consumer-grade UX sensibility — the principle that a family office dashboard should be as intuitive as a personal finance app. Their Mint-inspired single-page balance sheet informs T1's "one-screen-tells-all" philosophy.

**Nuant** contributes the crypto-institutional methodology for T11 — unified portfolio view across CeFi/DeFi, proprietary query language for custom analytics, and cross-venue exposure charting. Their DeFAI Terminal concept informs the AI-generated recommendation pattern in T13.

**FundCount** contributes accounting-grade accuracy — the unified general ledger architecture where every number ties back to double-entry records. This philosophy ensures the T15 System Architecture tab tracks data provenance and audit trails.

---

## ARCHITECTURAL CONCLUSION

This Phase 3 deliverable unifies **5,800+ source variants** from 9 UI kits into **123 unique component entries** mapped across **643 total tile placements** spanning **15 Finance Module tabs**. Each tab averages **42.9 tiles** packed into **2.1 scroll depths** using Apple iOS 26 Liquid Glass materials on a #080810 dark canvas.

Three architectural decisions define this system's competitive advantage over conventional wealth dashboards. First, the **dense bento grid with grid-auto-flow: dense** achieves Bloomberg-level information density while maintaining the spatial hierarchy that Bloomberg lacks — tile size explicitly communicates importance, and the puzzle-packing algorithm eliminates dead space. Second, the **three universal tile affordances** (deep-dive, glossary, export) transform passive charts into interactive analytical instruments — every tile is simultaneously a summary, a gateway to detail, and a self-documenting educational resource. Third, the **15 experimental charts** (one per tab) ensure the dashboard never feels templated — the chord diagram on T4, the parallel coordinates on T5, the Sankey on T6, and the 3D volatility surface on T11 create visual variety that sustains engagement across a 15-tab navigation structure.

The net worth trajectory from £297k peak to £262k current defines the emotional context for every tab. T1 surfaces the damage. T2 reveals the structural concentration that caused it. T3 decomposes it into allocation and selection effects. T4 quantifies the residual risk. T5 models the recovery scenarios. T6 tracks whether the income pipeline can fund the recovery. T7 identifies tax alpha available during the recovery. T8 ranks the opportunities. T9 tracks whether FI milestones are still achievable. T10 flags the dangerously depleted cash buffer. T11 provides institutional-grade intelligence on the BTC position that created most of the damage. T12 ensures leverage decisions don't compound the problem. T13 converts all insights into actions. T14 evaluates whether past decisions were skillful or lucky. T15 ensures the data powering all 14 other tabs is trustworthy.

The system is designed to be built incrementally — T1 (Executive Summary) and T2 (Structure) should ship first as the minimum viable CIO terminal, with T3 (Performance), T4 (Risk), and T6 (Cashflow) following in the second sprint. The remaining 10 tabs add analytical depth but depend on the foundational data infrastructure that T1-T4 establish. T15 (System Architecture) should be built in parallel as the monitoring layer that ensures data quality across all other tabs.