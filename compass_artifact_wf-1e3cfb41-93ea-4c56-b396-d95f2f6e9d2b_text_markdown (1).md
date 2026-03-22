# Premium Financial Dashboard: Technical Design Specification

**This specification provides prescriptive build rules for a GitHub Copilot Agent CLI (Claude LLM) to generate React 18 / Next.js 14 components with inline styles, Recharts, D3.js, and ECharts.** Every CSS value, color hex, font size, and component pattern below is implementation-ready. The design fuses Horizon UI Pro's card architecture with Apple Liquid Glass effects on a teal-black dark-mode palette, targeting institutional-grade wealth dashboards deployed on Vercel with Supabase backend.

---

## 1. Architecture and technology foundation

**Runtime:** Next.js 14 App Router, React 18, TypeScript strict mode, deployed on Vercel.
**Backend:** Supabase (Postgres + Auth + Realtime subscriptions for live KPI updates).
**Styling:** Inline styles via JavaScript objects — no Tailwind, no CSS modules. All components self-contained.
**Charts:** Recharts v2.12+ (area, bar, composed, radar), D3.js v7 (Sankey, Monte Carlo fan, heatmaps), ECharts v5.5+ via `echarts-for-react` (correlation matrices, calendar heatmaps).
**Fonts:** `"DM Sans", sans-serif` for all UI text. `"JetBrains Mono", monospace` for numerical values, currency amounts, and percentages. Import via `@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=JetBrains+Mono:wght@400;500;600&display=swap')`.
**Animation:** Framer Motion v11 for mount/layout transitions, CSS transitions for hover/severity state changes.

---

## 2. Design tokens: the single source of truth

Every component references these tokens through a shared `tokens.ts` constant object. Never hardcode values inline — always reference the token.

### 2.1 Color tokens

```typescript
export const colors = {
  // === SURFACE HIERARCHY (darkest → lightest) ===
  bgBase:           '#05161A',   // Page background — deepest teal-black
  bgBaseAlt:        '#072E33',   // Sidebar background, alternate zones
  bgSurface:        '#0A3A40',   // Card backgrounds — primary surface
  bgSurfaceRaised:  '#0D4A52',   // Hover-state cards, active panels
  bgElevated:       '#115E68',   // Modals, popovers, command palette
  bgOverlay:        'rgba(13, 64, 72, 0.95)', // Tooltips, dropdowns

  // === TEXT HIERARCHY ===
  textPrimary:      'rgba(255, 255, 255, 0.92)',  // #EBEBEB effective — key values, headings
  textSecondary:    'rgba(255, 255, 255, 0.68)',  // #ADADAD effective — labels, descriptions
  textTertiary:     'rgba(255, 255, 255, 0.45)',  // #737373 effective — timestamps, footnotes
  textDisabled:     'rgba(255, 255, 255, 0.25)',  // #404040 effective — disabled controls
  textInverse:      '#05161A',                     // Text on light/accent backgrounds

  // === ACCENT SYSTEM ===
  accentPrimary:       '#00BCD4',  // Teal — primary CTAs, active states
  accentPrimaryLight:  '#4DD0E1',  // Teal hover
  accentPrimarySubtle: 'rgba(0, 188, 212, 0.12)', // Teal background tint
  accentGold:          '#FFB300',  // Amber/gold — wealth, premium features
  accentGoldSubtle:    'rgba(255, 179, 0, 0.10)',
  accentBlue:          '#2979FF',  // Electric blue — market data, benchmarks
  accentPurple:        '#8B5CF6',  // Violet — crypto, alternatives

  // === SEMANTIC: RETURNS & SEVERITY ===
  positive:         '#00C853',  // Green — gains, on-target
  positiveMuted:    '#089981',  // Muted teal-green (TradingView style, less eye strain)
  positiveBg:       'rgba(0, 200, 83, 0.12)',
  negative:         '#FF1744',  // Red — losses, critical
  negativeMuted:    '#F23645',  // Muted coral-red
  negativeBg:       'rgba(255, 23, 68, 0.12)',
  warning:          '#FFC107',  // Amber — approaching threshold
  warningBg:        'rgba(255, 193, 7, 0.10)',
  info:             '#29B6F6',  // Light blue — informational

  // === CHART SERIES PALETTE (8 colors, accessible on dark bg) ===
  chart1: '#3B82F6',  // Blue — equities
  chart2: '#10B981',  // Emerald — cash/growth
  chart3: '#F59E0B',  // Amber — real estate/commodities
  chart4: '#8B5CF6',  // Violet — crypto/alternatives
  chart5: '#06B6D4',  // Cyan — fixed income
  chart6: '#EC4899',  // Pink — differentiation
  chart7: '#F97316',  // Orange — commodities
  chart8: '#A78BFA',  // Violet light — secondary series

  // === ASSET CLASS CODING ===
  assetEquities:    '#3B82F6',
  assetFixedIncome: '#06B6D4',
  assetRealEstate:  '#F59E0B',
  assetCash:        '#78909C',
  assetCrypto:      '#8B5CF6',
  assetCommodities: '#F97316',
  assetAlternatives:'#EC4899',

  // === BORDERS ===
  borderSubtle:     'rgba(255, 255, 255, 0.06)',
  borderDefault:    'rgba(255, 255, 255, 0.10)',
  borderStrong:     'rgba(255, 255, 255, 0.18)',

  // === GRID/CHART INFRASTRUCTURE ===
  gridLine:         'rgba(255, 255, 255, 0.06)',
  axisTick:         '#94A3B8',  // Slate-400
} as const;
```

### 2.2 Spacing tokens

```typescript
export const spacing = {
  xs:   4,    // Icon-to-label gap
  sm:   8,    // Within tight components (badge padding, tag gaps)
  md:   12,   // Between related items inside a card (label→value, legend items)
  base: 16,   // Standard card body padding, inner component gap
  lg:   20,   // Grid gap between cards in a section (Horizon UI standard)
  xl:   24,   // Between major sections, page padding
  '2xl': 32,  // Between dashboard zones (KPI strip → chart zone → table zone)
  '3xl': 40,  // Page margin on ultrawide
} as const;
```

### 2.3 Typography tokens

```typescript
export const typography = {
  fontFamily:     '"DM Sans", sans-serif',
  fontFamilyMono: '"JetBrains Mono", monospace',

  // Heading hierarchy (font-size / font-weight)
  h1: { fontSize: 36, fontWeight: 700 },   // Page titles
  h2: { fontSize: 24, fontWeight: 700 },   // Section headings
  h3: { fontSize: 20, fontWeight: 700 },   // Card titles (Horizon: 22px)
  h4: { fontSize: 16, fontWeight: 600 },   // Sub-headings
  h5: { fontSize: 14, fontWeight: 600 },   // Small headings

  // Dashboard-specific sizes
  statValue:   { fontSize: 28, fontWeight: 700, fontFamily: '"JetBrains Mono", monospace' },
  statLabel:   { fontSize: 13, fontWeight: 500 },
  delta:       { fontSize: 12, fontWeight: 700, fontFamily: '"JetBrains Mono", monospace' },
  body:        { fontSize: 14, fontWeight: 400 },
  caption:     { fontSize: 12, fontWeight: 400 },
  tableHeader: { fontSize: 12, fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: 0.5 },

  lineHeight: { tight: 1.2, normal: 1.5, relaxed: 1.625 },
} as const;
```

### 2.4 Layout tokens

```typescript
export const layout = {
  sidebarWidth:     280,
  sidebarCollapsed: 64,
  headerHeight:     64,
  cardBorderRadius: 16,
  buttonRadius:     12,
  badgeRadius:      8,
  maxContentWidth:  1440,

  breakpoints: {
    mobile:    375,
    tablet:    768,
    tabletLg:  1024,
    desktop:   1280,
    desktopLg: 1440,
    ultrawide: 1920,
  },
} as const;
```

---

## 3. Glass card system: the foundational container

Every panel, card, and container in the dashboard uses one of two glass tiers. Charts, KPIs, and tables are always rendered inside a glass card.

### 3.1 Quiet Glass — for data-dense analytical screens

Use for: KPI tiles, chart containers, data tables, any card containing dense numerical information.

```typescript
export const quietGlass: React.CSSProperties = {
  background: 'rgba(255, 255, 255, 0.05)',
  backdropFilter: 'blur(8px) saturate(150%)',
  WebkitBackdropFilter: 'blur(8px) saturate(150%)',
  border: '1px solid rgba(255, 255, 255, 0.08)',
  borderRadius: 16,
  boxShadow: '0 4px 24px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.06)',
  position: 'relative' as const,
  isolation: 'isolate' as const,  // CRITICAL: prevents backdrop-filter from cascading into charts
  overflow: 'hidden',
};
```

### 3.2 Heavy Glass — for hero elements and featured cards

Use for: Net worth hero card, portfolio summary, featured metric that spans full width.

```typescript
export const heavyGlass: React.CSSProperties = {
  background: 'rgba(255, 255, 255, 0.12)',
  backdropFilter: 'blur(20px) saturate(200%)',
  WebkitBackdropFilter: 'blur(20px) saturate(200%)',
  border: '1px solid rgba(255, 255, 255, 0.18)',
  borderRadius: 20,
  boxShadow: `
    0 8px 32px rgba(0, 0, 0, 0.3),
    0 2px 8px rgba(0, 0, 0, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.15),
    inset 0 0 15px rgba(135, 135, 135, 0.05)
  `,
  position: 'relative' as const,
  isolation: 'isolate' as const,
  overflow: 'hidden',
};
```

### 3.3 Specular highlight — the top-edge shine pseudo-element

Apply via a `::before` equivalent (an absolutely-positioned inner div) in every glass card:

```typescript
export const specularHighlightStyle: React.CSSProperties = {
  position: 'absolute',
  top: 0,
  left: '10%',
  right: '10%',
  height: 1,
  background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent)',
  pointerEvents: 'none',
  zIndex: 1,
};
```

### 3.4 Noise texture overlay

Optional subtle grain applied as an absolutely-positioned div inside glass cards:

```typescript
export const noiseOverlayStyle: React.CSSProperties = {
  position: 'absolute',
  inset: 0,
  backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E")`,
  opacity: 0.04,
  pointerEvents: 'none',
  borderRadius: 'inherit',
  zIndex: 2,
};
```

### 3.5 Glass opacity scaling rule

| Data density | `background` opacity | `backdrop-filter` blur | Use case |
|---|---|---|---|
| **High** (tables, number grids) | `0.03–0.05` | `blur(4px)` | Portfolio holdings table, transaction log |
| **Medium** (charts with labels) | `0.05–0.10` | `blur(8px)` | Area charts, bar charts, composed charts |
| **Low** (hero metrics, summaries) | `0.10–0.18` | `blur(16–20px)` | Net worth hero, total portfolio value |

---

## 4. 12-column grid layout system

### 4.1 Page shell — sidebar + scrollable content

```typescript
export const dashboardShellStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '280px 1fr',
  gridTemplateRows: '64px 1fr',
  height: '100vh',
  overflow: 'hidden',
  background: colors.bgBase,
};

export const mainContentStyle: React.CSSProperties = {
  padding: 24,
  overflowY: 'auto',
  display: 'flex',
  flexDirection: 'column',
  gap: 32,  // spacing['2xl'] between dashboard zones
};
```

### 4.2 Section grid — 12-column content layout

```typescript
export const sectionGridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(12, 1fr)',
  gap: 20,  // spacing.lg between cards
};
```

### 4.3 Column span utility map

```typescript
export const colSpan = (n: number): React.CSSProperties => ({
  gridColumn: `span ${n}`,
});
// Usage: style={{...colSpan(3)}} for KPI tiles (4 per row)
//        style={{...colSpan(8)}} for primary chart
//        style={{...colSpan(4)}} for secondary chart
//        style={{...colSpan(12)}} or gridColumn:'1/-1' for full-width tables
```

### 4.4 Standard financial dashboard layout pattern

```
┌──────────────────────────────────────────────────────────────┐
│ SIDEBAR (280px)  │  HEADER (sticky, 64px tall)               │
│                  ├───────────────────────────────────────────┤
│  Nav groups      │  KPI STRIP: 4× MiniStatistics (span 3)   │
│  with icons      │  ┌────┐ ┌────┐ ┌────┐ ┌────┐             │
│                  │  └────┘ └────┘ └────┘ └────┘             │
│                  │                                            │
│                  │  CHART ZONE:                               │
│                  │  ┌─────────────────┐ ┌─────────┐          │
│                  │  │ Primary Chart   │ │ Side    │          │
│                  │  │ (span 8)        │ │ Chart   │          │
│                  │  │ Area/Composed   │ │ (span 4)│          │
│                  │  └─────────────────┘ └─────────┘          │
│                  │                                            │
│                  │  TABLE ZONE:                               │
│                  │  ┌───────────────────────────────┐        │
│                  │  │ Data Table (span 12)           │        │
│                  │  └───────────────────────────────┘        │
└──────────────────────────────────────────────────────────────┘
```

### 4.5 Responsive breakpoint rules

| Breakpoint | KPI cols | Chart layout | Sidebar |
|---|---|---|---|
| **≥1920px** | span 3 (4/row) | 8+4 side-by-side | 280px expanded |
| **≥1440px** | span 3 (4/row) | 8+4 side-by-side | 280px expanded |
| **≥1280px** | span 6 (2/row) | span 12 stacked | 280px expanded |
| **≥1024px** | span 6 (2/row) | span 12 stacked | 64px icon-only |
| **≥768px** | span 6 (2/row) | span 12 stacked | Off-canvas drawer |
| **<768px** | span 12 (1/row) | span 12 stacked | Hamburger overlay |

### 4.6 Russian-doll nesting hierarchy

**Level 1:** Page shell → `grid-template-columns: 280px 1fr`
**Level 2:** Main content → `flex-direction: column; gap: 32px` (zones)
**Level 3:** Section grid → `grid-template-columns: repeat(12, 1fr); gap: 20px` (cards)
**Level 4:** Card internals → `flex-direction: column` with header (padding 16px), body (padding 16px), footer (padding 12px 16px)
**Level 5:** Chart container → `position: relative; min-height: 200px; padding: 8px` — the `<ResponsiveContainer>` lives here

---

## 5. KPI tile component (MiniStatistics pattern)

### 5.1 Component anatomy

```
┌─────────────────────────────────────────┐
│  ┌──────┐                               │
│  │ Icon │  Label (13px, secondary)      │
│  │ 48×48│  $1,247,832  (28px, mono, bold)│
│  │ •bg  │  ▲ +5.23%  since last month   │
│  └──────┘  (12px, green.500 + tertiary)  │
│             ▔▔▔▔▔▔▔ sparkline (80×24)    │
└─────────────────────────────────────────┘
```

### 5.2 TypeScript interface

```typescript
interface KPITileProps {
  label: string;
  value: string;          // Pre-formatted: "$1,247,832"
  delta?: number;         // Raw number: 5.23
  deltaLabel?: string;    // "since last month", "vs benchmark"
  severity?: 'success' | 'warning' | 'critical' | 'neutral';
  icon?: React.ReactNode;
  iconBg?: string;        // Gradient or solid color for icon container
  sparklineData?: number[];
  period?: string;        // "MTD", "YTD"
}
```

### 5.3 Inline style objects

```typescript
const kpiCardStyle: React.CSSProperties = {
  ...quietGlass,
  padding: '20px',
  display: 'flex',
  alignItems: 'center',
  gap: 16,
  minHeight: 100,
};

const iconContainerStyle = (bg: string): React.CSSProperties => ({
  width: 48,
  height: 48,
  borderRadius: 12,
  background: bg || 'rgba(0, 188, 212, 0.12)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
});

const kpiLabelStyle: React.CSSProperties = {
  ...typography.statLabel,
  fontFamily: typography.fontFamily,
  color: colors.textSecondary,
  marginBottom: 4,
};

const kpiValueStyle: React.CSSProperties = {
  ...typography.statValue,
  color: colors.textPrimary,
  marginBottom: 4,
  lineHeight: 1.2,
};

const kpiDeltaStyle = (isPositive: boolean): React.CSSProperties => ({
  ...typography.delta,
  color: isPositive ? colors.positive : colors.negative,
  marginRight: 6,
});
```

### 5.4 Severity-coded borders

When `severity` prop is set, add a left border accent:

```typescript
const severityBorderMap = {
  success:  { borderLeft: `4px solid ${colors.positive}` },
  warning:  { borderLeft: `4px solid ${colors.warning}` },
  critical: { borderLeft: `4px solid ${colors.negative}` },
  neutral:  {},
};
```

### 5.5 Sparkline component

Render inline sparklines at **80×24px** using a simple SVG polyline:

```typescript
const SparklineStyle: React.CSSProperties = { width: 80, height: 24, marginTop: 4 };
// SVG polyline: stroke matches trend direction (green if last > first, red otherwise)
// strokeWidth: 1.5, fill: none, strokeLinecap: 'round', strokeLinejoin: 'round'
```

### 5.6 KPI strip grid

```typescript
const kpiStripStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(4, 1fr)',
  gap: 20,
};
// At ≤1280px: gridTemplateColumns: 'repeat(2, 1fr)'
// At ≤768px:  gridTemplateColumns: '1fr'
```

---

## 6. Chart system: Recharts configuration patterns

### 6.1 Universal chart dark-mode base configuration

Apply these to every Recharts chart:

```typescript
const chartBaseProps = {
  margin: { top: 10, right: 30, left: 0, bottom: 0 },
};

const cartesianGridProps = {
  strokeDasharray: '3 3',
  stroke: 'rgba(255, 255, 255, 0.06)',
  vertical: false,
};

const xAxisProps = {
  axisLine: false,
  tickLine: false,
  tick: { fill: '#94A3B8', fontSize: 12, fontFamily: '"DM Sans"' },
};

const yAxisProps = {
  axisLine: false,
  tickLine: false,
  tick: { fill: '#94A3B8', fontSize: 12, fontFamily: '"JetBrains Mono"' },
  width: 65,
};

const tooltipCursorProps = {
  stroke: 'rgba(255, 255, 255, 0.08)',
  strokeWidth: 1,
};
```

### 6.2 SVG glow filter — inject in every chart's `<defs>`

```jsx
<defs>
  <filter id="glow" height="200%">
    <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
    <feMerge>
      <feMergeNode in="coloredBlur"/>
      <feMergeNode in="SourceGraphic"/>
    </feMerge>
  </filter>
</defs>
// Apply: <Area filter="url(#glow)" ... />  or  <Line filter="url(#glow)" ... />
// stdDeviation 2-3 = subtle (financial); 5-7 = moderate; 10+ = dramatic neon
```

### 6.3 Gradient fill definition pattern — inject per series

```jsx
<defs>
  <linearGradient id="fillNetWorth" x1="0" y1="0" x2="0" y2="1">
    <stop offset="5%" stopColor="#10B981" stopOpacity={0.4}/>
    <stop offset="50%" stopColor="#10B981" stopOpacity={0.1}/>
    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
  </linearGradient>
</defs>
// Apply: <Area fill="url(#fillNetWorth)" fillOpacity={1} />
// Each series MUST have a unique gradient ID to avoid SVG conflicts
```

### 6.4 Glass tooltip component

```typescript
const tooltipContainerStyle: React.CSSProperties = {
  background: 'rgba(15, 23, 42, 0.85)',
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
  border: '1px solid rgba(255, 255, 255, 0.08)',
  borderRadius: 12,
  padding: '12px 16px',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
  minWidth: 200,
};

// Tooltip value formatting:
const formatCurrency = (v: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(v);
const formatPercent = (v: number) =>
  `${v >= 0 ? '+' : ''}${v.toFixed(2)}%`;
const formatCompact = (v: number) =>
  new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(v);
// Delta indicators in tooltip: '▲' for positive, '▼' for negative, colored accordingly
```

### 6.5 Complete area chart example — net worth trajectory

```jsx
<ResponsiveContainer width="100%" height={350}>
  <AreaChart data={netWorthData} margin={{top:10,right:30,left:0,bottom:0}}>
    <defs>
      <linearGradient id="fillNW" x1="0" y1="0" x2="0" y2="1">
        <stop offset="5%" stopColor="#10B981" stopOpacity={0.4}/>
        <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
      </linearGradient>
      <filter id="glowNW" height="200%">
        <feGaussianBlur stdDeviation="3" result="blur"/>
        <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
    </defs>
    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false}/>
    <XAxis dataKey="date" axisLine={false} tickLine={false}
           tick={{fill:'#94A3B8',fontSize:12}}/>
    <YAxis axisLine={false} tickLine={false}
           tick={{fill:'#94A3B8',fontSize:12}}
           tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`}/>
    <Tooltip content={<FinancialTooltip/>}
             cursor={{stroke:'rgba(255,255,255,0.08)'}}/>
    <Area type="monotone" dataKey="netWorth" stroke="#10B981" strokeWidth={2}
          fillOpacity={1} fill="url(#fillNW)" filter="url(#glowNW)" dot={false}/>
  </AreaChart>
</ResponsiveContainer>
```

### 6.6 Radar chart — portfolio factor exposure

```jsx
<ResponsiveContainer width="100%" height={350}>
  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={factorData}>
    <PolarGrid stroke="rgba(255,255,255,0.08)" gridType="polygon"/>
    <PolarAngleAxis dataKey="factor" tick={{fill:'#94A3B8',fontSize:11}}/>
    <PolarRadiusAxis angle={30} domain={[0,1]}
                     tick={{fill:'#64748B',fontSize:10}}/>
    <Radar name="Portfolio" dataKey="current"
           stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.3} strokeWidth={2}/>
    <Radar name="Benchmark" dataKey="benchmark"
           stroke="#F59E0B" fill="#F59E0B" fillOpacity={0.1}
           strokeWidth={1} strokeDasharray="4 4"/>
    <Legend wrapperStyle={{color:'#94A3B8'}}/>
    <Tooltip/>
  </RadarChart>
</ResponsiveContainer>
```

---

## 7. D3.js advanced visualization patterns

### 7.1 React + D3 integration rule

**D3 computes layout. React renders SVG.** Never use `d3.select()` or `d3.append()` inside React components. Use D3 only for math: scales, generators, layout algorithms. Then map computed data to JSX `<path>`, `<rect>`, `<circle>` elements.

```typescript
// Standard pattern for all D3-backed components:
const SvgChart = ({ data, width, height }) => {
  const computed = useMemo(() => {
    // All D3 layout computation here
    const xScale = d3.scaleLinear().domain([...]).range([...]);
    return { nodes, links, xScale, ... };
  }, [data, width, height]);

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      {computed.links.map((link, i) => <path key={i} d={...} />)}
      {computed.nodes.map((node, i) => <rect key={i} ... />)}
    </svg>
  );
};
```

Responsive sizing: wrap in a container div with `useRef` + `ResizeObserver` to get width/height, or use `viewBox` with `preserveAspectRatio="xMidYMid meet"`.

### 7.2 Sankey diagram — capital flow

**Library:** `d3-sankey` (npm install `d3-sankey d3-shape d3-scale`).

**Data structure:**
```typescript
interface SankeyData {
  nodes: { id: string; name: string; category: 'income'|'tax'|'savings'|'investment'|'expense' }[];
  links: { source: string; target: string; value: number }[];
}
// Flow: Salary → Gross Income → Taxes / Insurance / Net Income → Stocks / Bonds / Property / Cash / Expenses
```

**Layout configuration:**
```typescript
const sankeyGen = sankey()
  .nodeWidth(26)
  .nodePadding(20)
  .nodeId(d => d.id)
  .nodeAlign(sankeyCenter)
  .extent([[10, 10], [width - 10, height - 10]]);
```

**Color rule:** Use `colors.positive` (#00C853) for income nodes, `colors.negative` for tax nodes, `colors.chart1` (#3B82F6) for investment nodes, `colors.chart3` (#F59E0B) for expense nodes. Link stroke uses the source node's color at `strokeOpacity: 0.3`.

### 7.3 Monte Carlo fan chart — probability cone

Build using layered `d3.area()` generators, one per percentile band pair:

```typescript
// Band definitions (outer → inner):
const bands = [
  { lower: 'p10', upper: 'p90', fillOpacity: 0.08 },
  { lower: 'p25', upper: 'p75', fillOpacity: 0.20 },
  { lower: 'p40', upper: 'p60', fillOpacity: 0.35 },
];
// Median line: p50, stroke solid, strokeWidth 2, with glow filter

const areaGen = d3.area()
  .x(d => xScale(d.year))
  .y0(d => yScale(d[band.lower]))
  .y1(d => yScale(d[band.upper]))
  .curve(d3.curveMonotoneX);
```

Render bands from outermost to innermost. All bands use `colors.chart1` (#3B82F6) at different opacities. A vertical dashed line marks "today" to separate historical data from projections.

---

## 8. ECharts configuration patterns

### 8.1 React integration

```typescript
import ReactECharts from 'echarts-for-react';
// Use tree-shaking:
import * as echarts from 'echarts/core';
import { HeatmapChart, RadarChart } from 'echarts/charts';
import { GridComponent, TooltipComponent, CalendarComponent, VisualMapComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
echarts.use([HeatmapChart, RadarChart, GridComponent, TooltipComponent, CalendarComponent, VisualMapComponent, CanvasRenderer]);
```

### 8.2 Custom dark theme

```typescript
const financialDarkTheme = {
  color: ['#3B82F6','#10B981','#F59E0B','#8B5CF6','#06B6D4','#EC4899','#F97316','#A78BFA'],
  backgroundColor: 'transparent',  // Glass card provides background
  textStyle: { color: '#94A3B8' },
  title: { textStyle: { color: '#E5E5E5' } },
  legend: { textStyle: { color: '#94A3B8' } },
  tooltip: {
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    borderColor: 'rgba(255,255,255,0.08)',
    textStyle: { color: '#E5E5E5' },
  },
  categoryAxis: {
    axisLine: { lineStyle: { color: 'rgba(255,255,255,0.06)' } },
    axisLabel: { color: '#94A3B8' },
    splitLine: { lineStyle: { color: 'rgba(255,255,255,0.06)' } },
  },
  valueAxis: {
    axisLine: { lineStyle: { color: 'rgba(255,255,255,0.06)' } },
    axisLabel: { color: '#94A3B8' },
    splitLine: { lineStyle: { color: 'rgba(255,255,255,0.06)' } },
  },
};
echarts.registerTheme('financialDark', financialDarkTheme);
```

### 8.3 Correlation matrix (ECharts heatmap)

```typescript
const correlationOption = {
  tooltip: { position: 'top' },
  grid: { height: '70%', top: '10%' },
  xAxis: { type: 'category', data: assetNames, splitArea: { show: true } },
  yAxis: { type: 'category', data: assetNames, splitArea: { show: true } },
  visualMap: {
    min: -1, max: 1, calculable: true,
    inRange: {
      color: ['#D73027','#F46D43','#FDAE61','#FEE090','#FFFFBF',
              '#E0F3F8','#ABD9E9','#74ADD1','#4575B4','#313695']
    },
  },
  series: [{
    type: 'heatmap',
    data: matrixData, // [[row, col, value], ...]
    label: { show: true, formatter: ({value}) => value[2].toFixed(2), color: '#E5E5E5', fontSize: 11 },
  }],
};
```

### 8.4 Calendar heatmap — daily contributions

```typescript
const calendarOption = {
  visualMap: {
    min: 0, max: 1000, type: 'piecewise',
    pieces: [
      { min: 0, max: 0, color: colors.bgSurface },
      { min: 1, max: 100, color: '#1a4731' },
      { min: 101, max: 500, color: '#15803d' },
      { min: 501, max: 1000, color: '#22c55e' },
      { min: 1001, color: '#4ade80' },
    ],
  },
  calendar: {
    range: '2026',
    cellSize: ['auto', 18],
    splitLine: { lineStyle: { color: colors.borderSubtle } },
    dayLabel: { color: colors.textTertiary },
    monthLabel: { color: colors.textSecondary },
    itemStyle: { borderWidth: 2, borderColor: colors.bgBase },
  },
  series: { type: 'heatmap', coordinateSystem: 'calendar', data: dailyData },
};
```

---

## 9. Advanced widget patterns

### 9.1 Concentric progress rings (SVG)

Stack multiple `<circle>` elements with decreasing radii. Each ring = background track + foreground arc controlled by `stroke-dasharray` and `stroke-dashoffset`.

```typescript
// For a 200×200 SVG with strokeWidth 12 and 16px ring gap:
// Ring 0: r = 88 (outermost)
// Ring 1: r = 60
// Ring 2: r = 32 (innermost)
// circumference = 2 * Math.PI * r
// offset = circumference - (percent / 100) * circumference
// transform="rotate(-90 100 100)" to start at 12 o'clock
// strokeLinecap="round" for rounded ends
// CSS transition: 'stroke-dashoffset 1s ease-in-out'
```

### 9.2 Mirrored diverging bar chart

Use Recharts `<BarChart layout="vertical">` with `stackOffset="sign"`. Negate outflow values. Format ticks with `Math.abs()` to hide negatives. Add `<ReferenceLine x={0}>` for the center axis. Color: `#22C55E` for inflows, `#EF4444` for outflows.

### 9.3 Contribution heatmap (GitHub-style)

Grid of **52 columns × 7 rows** of `<rect>` SVG elements, each **11×11px** with **2px gap**. Five-level color scale mapped to contribution amounts:

```typescript
const heatmapScale = [
  { max: 0, fill: colors.bgSurface },      // No activity
  { max: 50, fill: '#1a4731' },             // Low
  { max: 200, fill: '#15803d' },            // Medium
  { max: 500, fill: '#22c55e' },            // High
  { max: Infinity, fill: '#4ade80' },       // Exceptional
];
// rect: rx={2} ry={2} for rounded corners
// Tooltip on hover shows date + dollar amount
```

### 9.4 Milestone timeline

Horizontal SVG with a track line at `y = height/2`. Milestones rendered as colored circles (r=8) positioned via `d3.scaleLinear().domain([startAge, endAge])`. Probability range shown as a semi-transparent rounded rect behind each milestone dot. Alternating labels above/below the track to prevent overlap. Dashed connector lines from dots to labels.

```typescript
// Milestone data shape:
{ label: 'Coast FI', projectedAge: 38, ageRange: [35, 42], probability: 92, color: '#22C55E' }
// Label format: "Coast FI" (bold, 11px) + "92% likely by age 38" (9px, tertiary color)
```

---

## 10. Sidebar navigation pattern

### 10.1 Structure

```typescript
const sidebarStyle: React.CSSProperties = {
  width: 280,
  height: '100vh',
  position: 'fixed',
  left: 0,
  top: 0,
  background: colors.bgBaseAlt,
  borderRight: `1px solid ${colors.borderSubtle}`,
  display: 'flex',
  flexDirection: 'column',
  padding: '24px 0',
  overflowY: 'auto',
  zIndex: 50,
};
```

### 10.2 Navigation item

```typescript
const navItemStyle = (isActive: boolean): React.CSSProperties => ({
  display: 'flex',
  alignItems: 'center',
  gap: 12,
  padding: '10px 24px',
  cursor: 'pointer',
  borderRadius: 0,
  borderLeft: isActive ? `3px solid ${colors.accentPrimary}` : '3px solid transparent',
  background: isActive ? 'rgba(0, 188, 212, 0.08)' : 'transparent',
  transition: 'all 0.15s ease',
});

const navItemTextStyle = (isActive: boolean): React.CSSProperties => ({
  fontSize: 14,
  fontWeight: isActive ? 600 : 400,
  color: isActive ? colors.textPrimary : colors.textSecondary,
  fontFamily: typography.fontFamily,
});

const navItemIconStyle = (isActive: boolean): React.CSSProperties => ({
  width: 20,
  height: 20,
  color: isActive ? colors.accentPrimary : colors.textTertiary,
});
```

### 10.3 Collapsible section headers

```typescript
const navSectionHeaderStyle: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: 1,
  color: colors.textTertiary,
  padding: '20px 24px 8px',
};
```

### 10.4 Route configuration shape

```typescript
interface NavRoute {
  name: string;
  path: string;
  icon: React.ReactNode;
  collapse?: boolean;
  items?: { name: string; path: string }[];
}

interface NavSection {
  label: string;       // "DASHBOARDS", "ANALYTICS", "SETTINGS"
  routes: NavRoute[];
}
```

---

## 11. Card component patterns

### 11.1 Standard card container

```typescript
const cardStyle: React.CSSProperties = {
  ...quietGlass,
  padding: 0,  // Card itself has no padding — children own their padding
  display: 'flex',
  flexDirection: 'column',
};

const cardHeaderStyle: React.CSSProperties = {
  padding: '16px 20px',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  borderBottom: `1px solid ${colors.borderSubtle}`,
};

const cardTitleStyle: React.CSSProperties = {
  fontSize: 16,
  fontWeight: 600,
  color: colors.textPrimary,
  fontFamily: typography.fontFamily,
};

const cardBodyStyle: React.CSSProperties = {
  padding: 20,
  flex: 1,
  minHeight: 0,
};
```

### 11.2 Chart card — wraps any Recharts/D3/ECharts visualization

```typescript
const chartCardBodyStyle: React.CSSProperties = {
  ...cardBodyStyle,
  position: 'relative',
  zIndex: 1,  // Ensure chart renders above glass pseudo-elements
};
// Inside: <ResponsiveContainer width="100%" height={350}>
// The isolation:isolate on the glass card prevents backdrop-filter from affecting chart SVG
```

---

## 12. Chart color grammar — prescriptive rules

| Data semantic | Color token | Hex | When to use |
|---|---|---|---|
| Positive return / gain | `colors.positive` | `#00C853` | Delta values > 0, profit bars |
| Negative return / loss | `colors.negative` | `#FF1744` | Delta values < 0, loss bars |
| Neutral / zero | `colors.textTertiary` | 45% white | Unchanged values, zero returns |
| On target (RAG green) | `colors.positive` | `#00C853` | KPI ≥90% of target |
| Warning (RAG amber) | `colors.warning` | `#FFC107` | KPI 70–89% of target |
| Critical (RAG red) | `colors.negative` | `#FF1744` | KPI <70% of target |
| Benchmark line | `colors.accentGold` | `#FFB300` | Always dashed (`strokeDasharray="5 5"`) |
| Projection line | `colors.accentBlue` | `#2979FF` | Future data beyond "today" marker |
| Historical data | `colors.chart2` | `#10B981` | Solid line, confirmed past data |

**Multi-series opacity rule:** Primary series at `fillOpacity: 0.3`, secondary at `0.15`, tertiary at `0.08`. All strokes full opacity.

**Accessibility mandate:** Always pair color with a second channel — ▲/▼ arrows for direction, +/- signs for values, `strokeDasharray` for benchmark vs actual. **8% of male users** have red-green color deficiency.

---

## 13. Performance and deployment constraints

**Vercel deployment:** All components must be compatible with Edge Runtime. Charts with D3 use `'use client'` directive. ECharts bundle must be tree-shaken — import only the modules needed per chart type to keep bundle under **300KB** for the chart library.

**Supabase real-time:** KPI tiles can subscribe to Supabase Realtime channels for live value updates. Use `useEffect` with Supabase `channel.on('postgres_changes', ...)` for real-time KPI refresh without full page reload.

**`content-visibility: auto`** should be applied to off-screen cards via `contentVisibility: 'auto', containIntrinsicSize: 'auto 300px'` for rendering performance on dashboards with many widgets.

**`backdrop-filter` performance:** Limit glass-effect cards to **3–5 per viewport**. On mobile (≤768px), reduce blur to `blur(4px)`. Add `transform: 'translateZ(0)'` to glass cards for GPU compositing acceleration.

**ResponsiveContainer SSR caveat:** Recharts `<ResponsiveContainer>` does not work during server-side rendering. Render with a fixed fallback size initially and switch to `ResponsiveContainer` after hydration using a `useEffect` + `isMounted` guard.

---

This specification provides **every CSS value, color hex, spacing token, component interface, chart configuration, and SVG filter definition** needed for a code-generating AI to build institutional-grade financial dashboard modules. Components use inline React styles exclusively, reference a centralized token system, and follow the glass-on-teal-dark aesthetic with Recharts, D3.js, and ECharts for data visualization.