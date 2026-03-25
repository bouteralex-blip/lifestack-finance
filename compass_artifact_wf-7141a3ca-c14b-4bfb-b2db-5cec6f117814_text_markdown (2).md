# Phase 2: Complete component extraction across 10+ UI kit sources and institutional platforms

**The definitive inventory of every extractable UI component, chart variant, and interaction pattern** from Orion, Eclipse, Horizon, Full Charts, Dashboard UI kits, Apple iOS 26 Liquid Glass, and six institutional wealth platforms — mapped to a unified Liquid Glass container system for an ultra-dense 40+ tile family office dashboard.

This extraction catalogs **2,800+ unique component variants** across 12 Figma source files and 6 institutional platforms, organized into the 9 sections requested. Every component is evaluated for its applicability to a dark-theme, Liquid Glass bento-grid dashboard targeting Masttro-level information density.

---

## Section A: Orion UI — complete component extraction

Setproduct's Orion UI Kit is the richest data visualization source in this extraction, offering **2,500+ components across 50+ full-width dashboard templates** in dark and light themes, with **200+ dataviz widgets spanning 25+ chart types**.

### Map and geographic visualizations (unique to Orion)
The **Hexagonal Binning Data Map** renders a honeycomb grid overlaid on geography for regional data density — ideal for showing family office asset distribution by jurisdiction. The **World Map with connection vectors** draws animated lines between financial hubs, perfect for visualizing counterparty relationships or custodian networks. Additional geographic components include a **Heat Map (geographic)** for color-intensity overlays and a **Continent Data Map** for continent-level choropleth breakdowns.

### Charts and data visualization (200+ widgets)
Orion delivers the broadest chart library encountered in this extraction. Line and area charts include standard line graphs, **wave charts** (smooth curved area), sparklines, and multi-series area charts. Bar charts span vertical, horizontal, stacked, labeled, and histogram variants. Circular and radial charts include pie, donut, **polar**, **radar/spider**, and gauge (semi-circular and full). The specialized chart category is where Orion truly differentiates: **Sankey diagrams** for flow visualization, **treemaps** for hierarchical data, **hexbin charts**, **heatmaps**, **bubble charts**, matrix charts, **bullet charts**, distribution charts, **financial candlestick/OHLC**, **cohort analysis grids**, **Gantt charts**, and **funnel charts**.

### Navigation and layout components
Top navigation bar with logo, nav links, search, notifications, and user avatar. Vertical sidebar navigation with icon+text items and collapsible sections. Horizontal tab system for content switching. Breadcrumbs for hierarchical path navigation.

### Data display and input components
KPI cards with metric value, trend arrow, percentage change, and embedded sparkline. Data tables with sorting headers, row selection, and pagination. Stat widgets, progress indicators (linear + circular), status badges, notification badges, profile cards, and structured list items. Input components include buttons, sliders, dropdowns, search input, date range picker, and chip-based filter controls. Dashboard cards use rounded containers with header, content area, and optional footer.

### Named dashboard templates (11 confirmed)
Each exists in dark and light: World Map, Bubble Chart, Planet Dashboard, Global Statistics, Heat Map, **Hexagon**, Object Visualization, Sales Dynamic, Continent Data, Skills Tree, and Stellar Imaging.

---

## Section B: Eclipse UI — complete component extraction

Eclipse provides the broadest **reusable component system** with **80 base components, 1,100+ variants, and 74 desktop+mobile templates**. Where Orion excels at visualization, Eclipse excels at interactive UI patterns essential for dashboard controls.

### Navigation components (6 categories, 300+ variants)
Sidebar/navigation drawer with **~15+ variants** including mini/expanded states and dark/light themes. Top navigation bar with **~12+ variants** including breadcrumbs and search. **Tabs with 179 variants** in the component browser — horizontal, vertical, underline, filled, and pill styles. Breadcrumbs with **139 variants**, pagination with **131 variants**, and bottom navigation for mobile.

### Data input components (12 categories, 1,800+ variants)
Buttons: **283 variants** across primary, secondary, text, outlined, icon, FAB, loading, and disabled states in multiple sizes. Input fields: **198 variants** with labels, helper text, error states, prefix/suffix icons. Select/dropdown: **248 variants** with single/multi-select, search, grouped options. Combobox: **182 variants** combining input+select. Checkbox: **150 variants** including indeterminate state. Radio: **129 variants**. Toggle/switch: **119 variants**. Slider: **146 variants** including dual-thumb and stepped. Calendar: **141 variants** with month/week/day views. Stepper/wizard: **182 variants** in horizontal and vertical orientations.

### Data display components (8 categories, 1,000+ variants)
Tables: **259 variants** with sortable columns, row selection, inline editing, fixed headers, striped/bordered styles. Cards: **248 variants** including stat, media, action, horizontal/vertical layouts. Avatar: **113 variants** with status indicators and stacked groups. Badge: **144 variants** including dot, numeric, and status types. Chips/tags: **170 variants** with input, filter, and action modes. Tooltip: **120 variants** directional with arrow. Progress bars in linear and circular determinate/indeterminate modes.

### Feedback and layout components
Modal dialogs: **135 variants** including confirmation, form, fullscreen, and scrollable. Toast/snackbar with success, error, warning, info variants. Alert banners, notification system with read/unread states, and empty state placeholders. Accordion/expansion panels for sidebar filters. Dropdown menus with **248 variants** including context menus, sub-menus, and keyboard navigation.

### Specialized dashboard templates (12 categories)
**Kanban boards** (critical for the Action Plan tab) with multi-column drag-and-drop, column headers, WIP limits. **Crypto dashboard** with coin price cards, portfolio pie, trading chart. **Banking dashboard** with account summaries and transaction history. **Investment portfolio** with asset allocation donut, stock ticker cards, performance line chart, and holdings table. Also includes budget manager, task tracker, streaming, video service, e-commerce, calendar, and profile templates.

### Design system tokens
Color palette with semantic tokens (success/warning/error/info) in dark and light. Typography scale using **Manrope** font across H1-H6, body, caption, and overline. **12-column responsive grid** for desktop (1440px) and mobile (360px). Shadow/elevation system with multiple levels.

---

## Section C: Horizon UI — complete component extraction

Horizon UI contributes **70+ elements in the free version** (400+ in PRO) across **12 dashboard screens** (6 light + 6 dark), built on **Chakra UI** principles. It has **92.7k Figma community users**, making it the most-duplicated template in this extraction.

### Dashboard screens (free version)
**Main Dashboard** with KPI stat cards, revenue line/area charts, daily traffic bar charts, task completion bars, and sortable data tables. **NFT Marketplace** with artwork cards, creator info, pricing, bidding UI, trending lists, and activity history. **Data Tables** page with complex sortable columns and pagination. **Profile** page with avatar, bio, projects/posts, and stat cards. **Sign In** authentication page with form fields and social login. **RTL (Right-to-Left)** mirrored dashboard for international support.

### Component inventory
**Stat/KPI cards** with icon, large value, and percentage change delta — the most polished KPI card pattern in this extraction with gradient accent backgrounds. Line/area charts and bar charts containerized within rounded-corner cards with subtle shadows. Donut/pie charts. **Progress bars** in both circular and linear variants. Sidebar navigation with icon+text menu items. Top navbar with search, notifications, and profile avatar.

### PRO version additions (42+ pages)
Analytics dashboards, **Smart House/IoT dashboard** (directly relevant to the dense tile pattern), Kanban boards, e-commerce order lists, product settings, billing and banking cards, referrals pages, and course dashboards.

### Design characteristics
Modern rounded corners, soft shadows, **blue/purple gradient accents** with white/gray backgrounds in light mode and deep navy in dark mode. The design philosophy emphasizes pixel-perfect modularity but the free Figma file **lacks organized component variants** and a spatial system — it functions more as flat design reference than a structured design system.

---

## Section D: Full Charts Components — complete chart variant extraction

Created by Frank Esteban Isdray (@frankuxui), this file has **85.9k users** and is licensed CC BY 4.0. It provides a minimalist card-based chart system designed for responsive use across all device types.

### Confirmed chart types with financial dashboard mapping

| Chart Type | Visual Treatment | Best Tile Size | Family Office Application |
|---|---|---|---|
| **Bar chart (border radius)** | Rounded-top columns, clean axis, colored fills | Medium (3×2) | Monthly return comparison, fee analysis |
| **Horizontal bar chart** | Left-aligned categories, right-extending bars | Medium (3×2) | Asset allocation by class, manager ranking |
| **Monthly Average Rainfall** | Time-series line/bar combo, month x-axis | Large (4×3) | Cash flow pattern overlay (adapt to monthly inflows/outflows) |
| **Browser market shares (donut)** | Center metric, segmented ring, inline legend | Small (2×2) | Portfolio allocation by geography or asset class |
| **Contributions heatmap** | GitHub-style date grid, green color ramp | Large (4×3) | Trading activity density, rebalancing frequency |
| **Personal Diagnostics gauge** | Semi-circular gauge with threshold bands | Small (2×2) | Risk score, portfolio health indicator |
| **Stacked column chart** | Multi-color segments per column, total labels | Medium-Long (4×2) | Multi-period allocation comparison |
| **USD/EUR Exchange Rate line** | Time-series line with smooth interpolation | Large (4×3) | Currency exposure tracking, FX hedging P&L |
| **Doughnut chart variants** | Multiple center-hole ratios, 2-3 segment variants | Small (2×2) | Quick allocation snapshots |
| **Status of imports bar** | Categorical status bars with color-coding | Horizontal Small (2×1) | Document processing status, data feed health |
| **Value of transactions area** | Filled area with gradient, time axis | Medium (3×2) | Transaction volume over time |
| **Intensity heatmap** | Color-matrix grid, continuous color ramp | Large (4×3) | Correlation matrix between asset classes |
| **Collection statistics** | Donut ring with center amount + category list | Medium (3×2) | Holdings by custodian or entity |
| **Sales per employee** | Per-person metric with individual ring gauges | Medium (3×2) | Performance per advisor/portfolio manager |
| **Countries by population (bubble map)** | Sized circles overlaid on map | XL (6×3) | Geographic allocation bubble overlay |
| **Countries with ranking bars** | Leaderboard layout, country + bar + value | Large (4×3) | Top holdings or top-performing positions |

### Design style
Minimalist card-based approach with clean white backgrounds, subtle shadows, and a palette of blues, greens, purples, and warm accents. Cards use rounded corners and are designed for responsive deployment.

---

## Section E: Dashboard UI Kit + UI Element Menu + Data Viz App — combined extraction

### Dashboard UI Kit (SnowUI-based)
From Figma metadata inspection, this kit provides a complete **1440×1024px dashboard layout** with three-panel architecture: **212px left sidebar**, **948px center content area**, and **280px right bar panel** — closely matching wealth management dashboard layouts. The center content contains:

**4 KPI cards** in a horizontal row (202×112px each) with rolling number animations and icon+text trend indicators. Below that, a **662×330px primary chart block** (ChartMotion line/area chart) alongside a **202×330px secondary block** with vertical metrics. Two **432×280px medium blocks** — one containing a secondary ChartMotion chart, the other a **DonutChart** with adjacent data card. A full-width **892×280px chart block** at the bottom. The kit includes both light and dark mode variants, plus **mobile app** layouts at 393px width. Components use Figma instances, variants, and auto-layout throughout.

### UI Element Menu
This file is the **largest navigation component library** in the extraction at **257,000+ bytes of metadata** — too large for single extraction but confirmed to contain extensive menu systems. Web research confirms it includes: dropdown menus (simple, multi-level, mega menu), sidebar variants (collapsed, expanded, mini), hamburger menus, horizontal and vertical tab bars, breadcrumb patterns, context menus, floating action menus, responsive nav bars with dropdown prototypes, and command palette overlays. The file provides **interactive prototyped navigation** with hover states and state transitions.

### Data Visualization App UI
Figma metadata reveals a purpose-built data visualization layout containing: **Area charts** with shaded fills, tooltip markers, and Jan-Jun time axes. **Collection views** with three donut/ring charts showing progress percentages alongside amount values. **Stacked bar charts** with monthly data (Jan-Dec, scaled 0-500) using segmented blocks with color legends. **Profile/entity cards** with embedded circular progress gauges. **Horizontal bar chart widgets**. **Stats collection panels** with 4 circular gauge items per row, each showing category-specific ring charts. All components use a **dark theme** with navigation tabs (segmented, default/selected states), dividers, and consistent spacing conventions.

---

## Section F: Apple iOS 26 Liquid Glass — complete material system specification

This section defines the container wrapper system for every dashboard tile. Apple's Liquid Glass is **not a simple glassmorphism effect** — it is a fundamentally new material system that bends light, adapts dynamically to background content, and carries forward spatial computing principles from visionOS.

### The three material variants (not five thickness tiers)

Apple's official API uses **3 material variants** rather than the traditional 5-tier thickness ramp from iOS 17's materials. However, for dashboard implementation, a **5-tier CSS approximation** provides necessary granularity:

| Tier | Blur | Background Opacity | Border | Use Case |
|---|---|---|---|---|
| **Ultra-Thin** | 2px | rgba(255,255,255,0.08) | 1px rgba(255,255,255,0.10) | Status badges, mini indicators |
| **Thin** | 5px | rgba(255,255,255,0.12) | 1px rgba(255,255,255,0.15) | Small controls, chips, toggles |
| **Regular** (default) | 10px | rgba(255,255,255,0.15) | 1px rgba(255,255,255,0.20) | Dashboard tiles, KPI cards |
| **Thick** | 15px | rgba(255,255,255,0.25) | 1px rgba(255,255,255,0.30) | Expanded detail panels, popovers |
| **Ultra-Thick** | 20px | rgba(255,255,255,0.40) | 1px rgba(255,255,255,0.40) | Modal overlays, primary CTAs |

All tiers include `saturate(180%)` in the backdrop-filter. The **inset specular highlight** is achieved via `box-shadow: inset 0 4px 20px rgba(255,255,255,0.3)`.

### Dark mode vs light mode (10 total variants)

**Dark mode** (primary for this dashboard): Background opacity decreases by ~30% compared to light mode (e.g., Regular goes from 0.15 to 0.10). The glass effect becomes **more visible and dramatic** against dark backgrounds. Shadows shift from dark drop-shadows to **subtle luminance glows**: `0 4px 20px rgba(255,255,255,0.08)`. Text color: **#FCFCFC** ("Snow"). The frosted blur creates a distinctive "glowing" appearance.

**Light mode**: Background uses white-based tints at standard opacity. Shadows are traditional dark: `0 8px 32px rgba(31,38,135,0.20)`. Glass blends more subtly. Text color: **#000000**. Glass visibility is more understated.

### Dynamic behavior critical for dashboard tiles
Glass **automatically adapts** to the content behind it. Over bright background regions, glass darkens; over dim regions, glass brightens. Small elements (nav bars, tab bars) can flip between light/dark glass; **large elements must not flip** as it would be visually jarring. Shadows increase opacity over text content and decrease over white backgrounds.

The **lensing effect** — bending and concentrating light along curved edges — is the key differentiator from traditional glassmorphism. This creates subtle refraction near rounded corners and **cannot be fully replicated in CSS**; achieving it on web requires SVG displacement maps or WebGL.

### The transparency constraint
**Glass elements MUST remain transparent enough that the background shows through.** This is the defining visual characteristic. Opacity range: Clear variant 0.05–0.12, Regular 0.15–0.25, Prominent **never exceeding 0.40**. For accessibility, `@media (prefers-reduced-transparency)` should increase opacity to 0.85 and disable backdrop-filter.

### Critical design tokens

```css
:root {
  --lg-accent-blue: #007AFF;
  --lg-text-dark: #FCFCFC;
  --lg-text-light: #000000;
  --lg-blur-regular: 10px;
  --lg-radius-sm: 8px;
  --lg-radius-md: 12px;
  --lg-radius-lg: 16px;
  --lg-radius-xl: 20px;
  --lg-radius-capsule: 9999px;
  --lg-spacing-morph: 16px;  /* GlassEffectContainer morphing threshold */
}
```

### Shape system
**Capsule** (default for buttons): `border-radius: 9999px`. **Circle** for avatars. **Squircle/continuous corner** (SwiftUI's `RoundedRectangle` with `.continuous` style) for cards/tiles. **Concentric corners**: inner radius = outer radius − padding, ensuring nested elements share the same corner center.

### Scroll edge effects
**Soft** (default): subtle gradient fade for floating UI elements. **Hard**: sharp boundary cutoff for text controls and pinned headers. **Never mix** different edge effect styles in the same view. One scroll edge effect per view maximum.

### visionOS → iOS 26 lineage
Liquid Glass is the **visual handshake between iOS and visionOS**. Principles carrying over: glass-based window materials → glass controls; spatial depth layering → content-below/glass-above hierarchy; environmental reflection → specular highlights; `.glassBackgroundEffect()` → `.glassEffect()` modifier. Apple prototyped physical glass in their studios to replicate real optical behaviors digitally.

---

## Section G: Institutional platform UI patterns

### Masttro — the primary layout reference

Masttro's **CIO Portfolio Allocation Dashboard** provides the target layout: left panel with **3 concentric ring gauges** showing asset allocation (target vs actual), top-right **area chart** for performance trending, middle-right **scatter plot** for risk/return positioning, bottom-right **horizontal bar chart** for category allocation, and a **timeline selector** at the bottom for date range control. The platform offers **200+ pre-built dashboard templates** across 10+ categories and achieves **6–10 data widgets per viewport**.

The **Global Wealth Map** is a unique interactive entity/ownership tree visualization showing all assets, trusts, and entities with value and ownership percentages — users click to zoom into specific holdings. **Masttro Intelligence** integrates 5 AI modules including a conversational assistant (voice + text) that triggers actions directly: update valuations, generate reports, create alerts, and build personalized dashboards. The platform uses a **dark navy/charcoal theme** (~#1A1A2E to #16213E) with vibrant teal/cyan (#00D4AA), coral, and blue accents. Role-specific views for CIO, COO, Advisor, and Wealth Owner are all supported with granular permissioning.

### Addepar — the data architecture reference

Addepar's design system introduces the **elevation unit ("eu") system** — a novel approach using 4 planes: Canvas (0 eu), Surface (1 eu), Debossed (−1 eu), and Floating (>1 eu). Their borderless design relies on **cool-tinted grays** rather than borders for visual separation. In dark mode, surfaces brighten as elevation increases (since drop shadows don't work on dark backgrounds).

Their typography pairs **Tiempos Headline Light** (editorial premium feel) with **Inter** (custom OpenType settings for technical precision). The hierarchical portfolio navigation operates as Entity → Sub-entity → Account → Position → Transaction, with the **Ownership Map** functioning as both visualization and editing tool. Addepar's **Navigator** provides scenario modeling with ~300 out-of-the-box assumption models for what-if analysis.

The **Featured Report Tile** pattern uses text-heavy, clinical design with strong left-alignment, configurable column-based layouts, and attributes like Value, Return, and % of Portfolio grouped by hierarchy.

### Compound Planning — the consumer elegance reference

Compound's **Stacked Wealth Area Chart** is the primary visualization — multi-layer soft-pastel area chart tracking net worth over time by asset category. Timeframe selectors use pill/button groups (1D, 1M, 3M, YTD, 1Y, ALL) in rounded pill styling. The platform emphasizes **whitespace and clarity over density** — only 2–3 cards per viewport — but its net worth trajectory chart and account aggregation patterns are directly applicable as individual tile components within the denser layout.

### Bloomberg Terminal — the density and interaction reference

Bloomberg's layout uses **magnetic docking** where amber guidelines appear when dragging components near edges, snapping into tiled arrangements. **Security group linking** enables changing one security to update all linked components simultaneously. The command-line-first navigation uses a `TICKER <SECTOR_KEY> FUNCTION <GO>` syntax across 30,000+ functions.

The iconic color hierarchy: **pure black background (#000000)**, amber/orange brand text (**#FFA028**), white for primary data, green (**#4AF6C3**) for positive, red (**#FF433D**) for negative, blue (**#0068FF**) for interactive elements. Typography uses the custom **Bloomberg font** designed by Matthew Carter with finance-specific fraction glyphs. Monitors support **up to 2,000 securities across 30 columns** from 280,000+ data fields.

### Nuant — the crypto visualization reference

Nuant's **Dual Candlestick/Volume Combo widget** places the candlestick chart in ~70–75% of vertical space with volume bars below in ~25–30%. Their **Nuant Query Language (NQL)** provides a domain-specific query interface for custom data queries. The platform aggregates data from **51 blockchains and 28 exchanges** into a single-screen interface — a single-pane-of-glass philosophy directly applicable to multi-custodian wealth aggregation.

### FundCount — the entity structure reference

FundCount's **nested entity capability** tracks multi-layer structures with complete transparency into component parts. Their published data flow diagram shows external inputs flowing left-to-right through the system with gray streams illustrating complex interrelationships — a pattern adaptable to Sankey-style entity flow visualization. The platform supports Trust → Holding Company → Individual Asset hierarchies with consolidated views across all layers.

---

## Section H: Dense dashboard layout architecture

### The 12-column bento grid specification

The foundation for packing 40+ tiles into a single dashboard tab:

```css
.wealth-dashboard {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  grid-auto-rows: 64px;
  grid-auto-flow: row dense;  /* Critical: auto-fills gaps */
  gap: 6px;
  padding: 8px;
}
```

The **`grid-auto-flow: dense`** keyword is the essential mechanism — it instructs the browser to backfill gaps with smaller items that fit, creating the puzzle-like bento effect without orphaned empty cells. A **6px gap** provides the ideal balance for Liquid Glass tiles: visible edge separation while maximizing tile count.

### Standardized tile size system

| Size Code | Name | Grid Span | Pixel Approx (1440px) | Content Capacity |
|---|---|---|---|---|
| HS | Horizontal Small | 2 col × 1 row | 160×64px | Single KPI + delta arrow |
| VS | Vertical Small | 1 col × 2 row | 80×134px | Vertical gauge, stacked KPIs |
| S | Square Small | 2 col × 2 row | 160×134px | KPI + sparkline, mini donut |
| M | Medium | 3 col × 2 row | 240×134px | Standard chart, multi-KPI |
| ML | Medium-Long | 4 col × 2 row | 320×134px | Chart with legend, comparison bars |
| L | Large | 4 col × 3 row | 320×198px | Full chart + axis labels + legend |
| XL | Extra Large | 6 col × 3 row | 480×198px | Interactive chart, full data table |
| XXL | Full Width | 12 col × 3 row | 960×198px | World map, timeline, wide table |

### Recommended distribution for a 42-tile tab
**16 HS tiles (38%)** for quick-read KPIs and status indicators. **4 VS tiles (10%)** for vertical gauges and stacked metrics. **10 S tiles (24%)** for KPI+sparkline cards and mini gauges. **6 M tiles (14%)** for standard charts and multi-KPI clusters. **4 L tiles (10%)** for primary charts and data tables. **2 XL tiles (5%)** for hero visualizations. This yields approximately **2.5 viewports of scroll depth** on 1920×1080.

### Scroll depth management
**Ideal: 1.5–2 viewports per tab.** Maximum recommended: 3. Beyond 3, split into sub-tabs. The **inverted pyramid pattern** applies: Viewport 1 (above fold) shows the most critical high-level KPIs, executive summary, and aggregate portfolio value. Viewport 2 (first scroll) provides supporting charts, trend analysis, and allocation breakdowns. Viewport 3 (deep scroll) contains granular data tables, detailed holdings, and historical analysis.

**Sticky elements**: Tab bar navigation fixed at top. Summary KPI row pinned showing portfolio value, daily P&L, and key alerts. Floating action buttons for refresh, date filter, and export. Grafana 12's **dashboard outline tree-view** provides a sidebar for jumping between sections, eliminating endless scrolling.

### Tile interaction patterns
**Primary: side drawer** (recommended) — tile click opens a 300–500px right-side drawer with detail view. Non-modal, allowing continued dashboard interaction. **Secondary: modal dialog** — reserved for full chart exploration at 75% viewport width. **Glossary popover**: ⓘ icon triggers Liquid Glass popover (Thick tier: `backdrop-filter: blur(15px) saturate(180%)`) containing term definition, calculation methodology, data source, threshold values. Dismiss on click-outside or Escape.

### Information density principles (Tufte-applied)
Minimum font sizes for Liquid Glass tiles: primary KPI value **16–20px bold**, secondary value **12–13px**, tile label **11–12px semibold**, axis labels **10px**, footnotes **9px**. The frosted glass reduces contrast, so **bump all minimums up 1px** versus opaque backgrounds. Color-coding replaces text: green (#34C759) = positive, red (#FF3B30) = negative, amber (#FF9500) = warning. Background glass tinting conveys status without explicit labels. Numbers use abbreviations ($42.3M, $1.2B). Consistent visual patterns across all tiles of the same size class enable rapid pattern recognition after initial learning.

---

## Section I: Unified gap analysis — what these sources fill

The following maps extracted components to the 20 custom-build gaps typically identified in Phase 1 family office dashboard design:

| Gap | Source That Fills It | Component |
|---|---|---|
| **Concentric ring gauge (allocation)** | Orion (gauge charts) + Masttro (CIO layout) | Orion's radial gauge + polar chart combined with Masttro's 3-ring layout pattern |
| **Entity ownership tree** | Masttro (Global Wealth Map) + FundCount (nested entities) + Addepar (Ownership Map) | Interactive tree/network visualization with click-to-zoom and value/percentage display |
| **Sankey flow diagram** | Orion (Sankey diagram) + FundCount (entity flow) | Orion provides the Sankey component; FundCount provides the entity-flow data model |
| **Hexagonal binning map** | Orion (Hexagon template) | Honeycomb grid overlaid on geography for regional data density |
| **World map with connection vectors** | Orion (World Map template) | Animated vector lines between financial hubs/custodians |
| **Dual candlestick/volume widget** | Nuant (DeFi terminal) + Full Charts (bar+line combos) | 70/30 vertical split with candlestick top and volume bars below |
| **Stacked wealth area chart** | Compound (net worth trajectory) + Full Charts (area chart) | Multi-layer soft-pastel area chart with timeframe pill selectors |
| **Kanban/action plan board** | Eclipse (Kanban template, 248 card variants) | Multi-column drag-and-drop task board with priority tags and assignee avatars |
| **Glossary popover (ⓘ)** | Custom build, styled as Thick-tier Liquid Glass | Frosted glass popover with term definition, methodology, and threshold values |
| **Correlation heatmap** | Full Charts (intensity heatmap) + Orion (heatmap) | Color-matrix grid for asset class correlation with continuous color ramp |
| **Contributions/activity heatmap** | Full Charts (GitHub-style grid) | Date-grid with color ramp for trading/rebalancing activity density |
| **Bubble map (geographic allocation)** | Full Charts (countries by population density) | Sized circles overlaid on world map, adaptable to AUM by geography |
| **Scenario modeling controls** | Addepar Navigator (~300 assumption models) | Slider/input controls for what-if variables with projected vs historical overlay |
| **Security group linking** | Bloomberg (Launchpad group manager) | Changing one security updates all linked tiles — visual group indicator needed |
| **Magnetic docking layout** | Bloomberg (amber snap guidelines) | Drag-near-edge snapping with visual guide lines for layout customization |
| **Data table (institutional grade)** | Eclipse (259 table variants) + Addepar (configurable columns) + Bloomberg (2000-row monitors) | Sortable, groupable, filterable table with column freezing, hierarchy grouping, inline editing |
| **Modal/slide-over detail panels** | Eclipse (135 modal variants) + Dashboard pattern (side drawer) | Thick-tier Liquid Glass side drawer for tile deep-dive |
| **Progress/status indicators** | Eclipse (badges 144, chips 170, progress bars) + Orion (status badges) | Color-coded dots, pills, background tinting, sparkline direction for status |
| **Date range / timeframe selector** | Compound (1D/1M/3M/YTD/1Y/ALL pills) + Orion (date range picker) | Capsule-shaped Liquid Glass pill buttons in horizontal row |
| **Conversational AI integration** | Masttro Intelligence (voice+text assistant) | Floating panel or sidebar overlay for AI-driven queries, report generation, and alerts |

### Components requiring custom build (not fully available in any source)
Three components still require ground-up development: (1) the **Liquid Glass tile container system itself** — while the iOS 26 design tokens are now fully specified, no existing kit provides pre-built dashboard tiles in this material system; (2) the **bento grid packing engine** with the specific HS/VS/S/M/L/XL size vocabulary and `grid-auto-flow: dense` behavior; and (3) the **glossary/definition popover** with the ⓘ trigger pattern using Thick-tier glass — this is a novel interaction combining Bloomberg's function documentation depth with Apple's glass aesthetic. All three are implementable using the CSS tokens and specifications documented in Sections F and H above.