# LIFESTACK OS — T1 EXECUTIVE SUMMARY IMPLEMENTATION PROMPT
## GitHub Copilot Agent | Single-Tab Focus

**Target file:** `components/PortfolioVOS.jsx`
**Scope:** ONLY rewrite the `const T1 = () => { ... }` function body. Do NOT touch anything else.
**Framework:** Next.js + React, single-file component
**Chart libraries:** Recharts (primary), already imported at top of file
**Design paradigm:** Private family office CIO terminal — dark institutional, Liquid Glass, Bloomberg-density

---

## CRITICAL CONSTRAINTS (MEMORISE BEFORE WRITING ANY CODE)

1. **ONLY modify the T1 function body.** Do not change the `T` design token object, data constants, UI components (`Glass`, `KPI`, `Gauge`, `Hd`, `Ins`, `Tbl`, `Row`, `ProgBar`, `GlassTip`, `fmt`, `fK`, `pc`), or any other tab function.
2. **No Treemap components** — causes build failures.
3. **No localStorage** — blocked in runtime.
4. **JSX angle brackets in text** must use `{">"}`
5. **Unicode escapes:** `\u00A3` for £, `\u2192` for →, `\u2014` for —
6. **T14 appears before T13** in the file — do not reorder anything.
7. **Glass opacity stays LOW:** tiles at `rgba(255,255,255,0.05)`, blur 20px. Never make tiles opaque.
8. **Build validation after writing:** `npx next build 2>&1 | tail -15`
9. **All Recharts gradient IDs must be unique** within T1 (prefix with `t1_` to avoid SVG conflicts with other tabs).
10. **The `P` / `T` object** at line ~9 is locked — the `mono:` key must never be accidentally modified by find-replace operations.

---

## DESIGN TOKENS (ALREADY DEFINED — DO NOT RECREATE)

```javascript
// Line ~9-15 of PortfolioVOS.jsx — reference only
T.bg = "#080810"           // Base environment
T.glass = "rgba(255,255,255,0.05)"  // 5% white glass fill
T.glassBorder = "rgba(255,255,255,0.08)"
T.glassBlur = "blur(20px)"
T.teal = "#00D4AA"         // Positive / up
T.coral = "#FF5C7A"        // Negative / drawdown
T.amber = "#F5A623"        // Warning / primary accent
T.violet = "#7C6FFF"       // Action / interactive
T.blue = "#3B9EFF"
T.t1 = "#F8FAFC"           // Primary text
T.t2 = "#94A3B8"           // Secondary text
T.t3 = "#64748B"           // Labels / captions
T.accent = "#F5A623"       // Amber gold
T.grid = "rgba(255,255,255,0.04)"
T.positive = "#00D4AA"
T.negative = "#FF5C7A"
T.btc = "#f7931a"
T.pension = "#06b6d4"
```

---

## EXISTING UI COMPONENTS (USE THESE — ALREADY IN FILE)

| Component | Props | Purpose |
|-----------|-------|---------|
| `Glass` | `{children, style, glow, hover, accent}` | Liquid Glass tile container |
| `KPI` | `{label, value, delta, deltaType, comparison, sparkData, sm}` | KPI metric card with optional sparkline |
| `Gauge` | `{score, max, label, size}` | SVG radial progress ring |
| `Hd` | `{t, s, tag, ac}` | Section header with pill tag |
| `Ins` | `{text, type}` | Insight strip (types: insight, warning, action, risk, opp) |
| `Tbl` | `{h, r, hl}` | Data table with hover-highlight rows |
| `GlassTip` | (Recharts tooltip) | Frosted glass chart tooltip |
| `Row` | `{children, gap, style}` | Flex-wrap row |
| `ProgBar` | `{val, max, c, label}` | Horizontal progress bar |
| `fmt(v)` | — | Format as `£xxx,xxx` |
| `fK(v)` | — | Format as `£xxxk` |
| `pc(v)` | — | Format as `+x.x%` or `-x.x%` |

---

## DATA CONSTANTS (ALREADY DEFINED — REFERENCE THESE)

| Constant | What it contains |
|----------|------------------|
| `PORT` | `{date, age, netWorth (362072), assets (375670), debts (13598), nw6moAgo (397457), nwPeak (394637), grossSalary (170000), grossBonus (170000), monthlyExpenses (6000), taxRate (0.45), niRate (0.02), fireTarget (1800000), amexDebt (10652), monzoFlex (2946), riskFree (0.045), inflation (0.032), benchReturn (-0.028)}` |
| `HOLDINGS` | Array of `{n, v, w, cat, wrapper, ret6m, div, risk, notes, quality}` — all portfolio positions |
| `NW_WEEKLY` | Array of `{d, nw, a}` — weekly net worth history |
| `NW_BRIDGE` | Array of `{n, v, type}` — waterfall bridge items |
| `MONTHLY` | Array of `{m, p, b}` — monthly returns (portfolio vs benchmark) |
| `SCORE` | Array of `{d, s}` — 7 portfolio quality scorecard dimensions |
| `FACTORS` | Array of `{f, p, b, ret, risk, intent}` — factor exposures |
| `STRESS` | Array of `{s, impact, exp, pr}` — 10 stress scenarios |
| `OPPS` | Array of `{t, c, tm, alpha, w, sz, cat, risks, kill, col, val, status, role}` — 10 opportunities |
| `WEALTH_5` | Array of `{y, conservative, base, wrapperAlpha, allOpps, bull}` — 5 scenarios to 2035 |
| `NW_FORECAST` | Combined historical + forecast NW path data |
| `CRYPTO` | `{btcPrice, btcATH, btcDD, mvrvZ, nupl, fear, ...}` |
| `nwReturn` | Pre-computed 6M return % |
| `activeReturn` | Pre-computed active return vs benchmark |
| `realReturn` | Pre-computed real (inflation-adjusted) return |
| `OPPS_TOP5` | Top 5 opportunities sorted by value |

---

## LIQUID GLASS VISUAL RULES

### Tile Construction
Every `Glass` tile automatically applies Layer 1 (5% white fill, 20px blur, 8% border, shadow, shine overlay). You just wrap content in `<Glass>...</Glass>`.

For **critical KPI values** inside tiles, add a Layer 2 inner stabilized plate behind the number:
```jsx
<div style={{ background: "rgba(0,0,0,0.20)", borderRadius: 12, padding: "12px 16px" }}>
  <span style={{ fontSize: 28, fontWeight: 700, fontFamily: "'JetBrains Mono',monospace", color: T.t1 }}>
    {fmt(PORT.netWorth)}
  </span>
</div>
```

### Chart Styling (apply to ALL charts in T1)
```jsx
// CartesianGrid — near-invisible
<CartesianGrid strokeOpacity={0.04} stroke="rgba(255,255,255,0.04)" strokeDasharray="3 3"/>

// Axes — subtle, no lines
<XAxis dataKey="d" tick={{fill: T.t3, fontSize: 10}} axisLine={false} tickLine={false}/>
<YAxis tick={{fill: T.t3, fontSize: 10}} axisLine={false} tickLine={false} tickFormatter={fK}/>

// Tooltip — always use GlassTip
<Tooltip content={<GlassTip/>}/>

// Area gradient template (use UNIQUE ids per chart — prefix t1_)
<defs>
  <linearGradient id="t1_nwGrad" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stopColor={T.teal} stopOpacity={0.45}/>
    <stop offset="100%" stopColor={T.teal} stopOpacity={0.02}/>
  </linearGradient>
</defs>

// Stroke glow on key lines
style={{filter: "drop-shadow(0 0 4.5px rgba(0,212,170,0.3))"}}
strokeWidth={3}

// Bar rounded tops
<Bar radius={[4,4,0,0]}/>

// Sentiment: positive = T.teal, negative = T.coral, warning = T.amber
```

### Typography Rules
- Primary KPI: 28px, `JetBrains Mono`, bold, T.t1, `textShadow: "0 0 20px rgba(245,166,35,0.15)"`
- Small KPI: 20px, `JetBrains Mono`, bold
- Section headers: 22px, system font, bold
- Body: 13px, system font, T.t2
- Labels: 10-11px, uppercase, `letterSpacing: "0.05em"`, T.t3, `opacity: 0.5`
- Table numbers: 13px, `JetBrains Mono`

### Spacing
- `T.glassGap` = 16px between tiles
- `T.glassPad` = 20px inside tiles
- Use `Row` component for horizontal flex-wrap layouts
- Use `style={{ display: "grid", gridTemplateColumns: "repeat(N, 1fr)", gap: T.glassGap }}` for fixed grids

---

## T1 LAYOUT SPECIFICATION — 13 ZONES

Target: **~28 analytical blocks** across **2.5 viewport scroll depth**.
This is the CIO's "one-screen-tells-all" — every zone must earn its space.

---

### ZONE 1: Section Header

```jsx
<Hd t="Executive Summary" s="CIO terminal \u2014 portfolio truth state, risk governance, and forward path" tag="COMMAND CENTER" ac={T.accent}/>
```

---

### ZONE 2: Primary KPI Signal Bar (Full Width — 4 cards)

A flex row of 4 primary KPI cards using the existing `KPI` component. These are the portfolio "truth state" — the first numbers the CIO reads.

```jsx
<Row>
  <KPI label="Net Worth" value={fmt(PORT.netWorth)} delta={pc(nwReturn)} deltaType="down"
       comparison={`Peak: ${fmt(PORT.nwPeak)}`}
       sparkData={NW_WEEKLY.slice(-12).map(w=>({v:w.nw}))} />
  <KPI label="6M Return (TWR)" value={pc(nwReturn)} deltaType="down"
       comparison={`Bench: ${pc(PORT.benchReturn*100)}`} />
  <KPI label="Peak Drawdown" value={pc(((PORT.netWorth-PORT.nwPeak)/PORT.nwPeak)*100)} deltaType="down"
       comparison={`From ${fmt(PORT.nwPeak)}`} />
  <KPI label="FIRE Progress" value={((PORT.netWorth/PORT.fireTarget)*100).toFixed(1)+"%"} deltaType="up"
       comparison={`Target: ${fK(PORT.fireTarget)}`} />
</Row>
```

---

### ZONE 3: Secondary KPI Strip (Full Width — 5 small cards)

Smaller KPI tiles providing the supporting metrics. Use `sm={true}`:

```jsx
<Row>
  <KPI sm label="Active Return" value={pc(activeReturn)} deltaType={activeReturn>=0?"up":"down"} />
  <KPI sm label="Real Return" value={pc(realReturn)} deltaType={realReturn>=0?"up":"down"} />
  <KPI sm label="Total Assets" value={fK(PORT.assets)} />
  <KPI sm label="Total Debts" value={fK(PORT.debts)} deltaType="down" comparison="22% APR Amex" />
  <KPI sm label="Effective Positions" value={(1/HOLDINGS.reduce((s,h)=>s+(h.w/100)**2,0)).toFixed(1)}
       comparison="1/HHI diversification" />
</Row>
```

---

### ZONE 4: Alert Panel — Severity-Coded Governance Pills (Full Width)

A Glass tile containing a horizontal flex-wrap of severity-coded alert pills. Each pill uses a coloured background at 15% opacity with text in the accent colour.

```jsx
<Glass hover={false}>
  <div style={{fontSize:11, textTransform:"uppercase", letterSpacing:"0.08em", color:T.t3, opacity:0.5, marginBottom:10, fontWeight:600}}>
    GOVERNANCE ALERTS
  </div>
  <div style={{display:"flex", flexWrap:"wrap", gap:8}}>
    {[
      {text:"BTC drawdown -44% exceeds -30% risk budget", color:T.coral, severity:"CRITICAL"},
      {text:"Rainy day fund \u00A311.5k below \u00A318k target", color:T.amber, severity:"WARNING"},
      {text:"ISA deadline 5 April \u2014 29 days", color:T.violet, severity:"ACTION"},
      {text:"Amex 22% APR costing \u00A32,343/yr", color:T.amber, severity:"WARNING"},
      {text:"Crypto risk budget 91% utilised", color:T.coral, severity:"CRITICAL"},
      {text:"No rebalancing in 90+ days", color:T.amber, severity:"WARNING"}
    ].map((a,i) => (
      <div key={i} style={{display:"inline-flex", alignItems:"center", gap:5, padding:"4px 10px",
        borderRadius:6, background:a.color+"22", border:`1px solid ${a.color}30`, fontSize:11, fontWeight:600}}>
        <span style={{width:6, height:6, borderRadius:3, background:a.color, boxShadow:`0 0 6px ${a.color}`}}/>
        <span style={{color:a.color, fontSize:9, fontWeight:700, letterSpacing:"0.06em"}}>{a.severity}</span>
        <span style={{color:T.t2}}>{a.text}</span>
      </div>
    ))}
  </div>
</Glass>
```

---

### ZONE 5: CIO Insight Banner (Full Width)

```jsx
<Ins type="insight" text="Portfolio at \u00A3362k (-8.2% from \u00A3395k peak). BTC drawdown (-44%) is the primary drag, consuming 91% of crypto risk budget. Structural positives: pension step-up (+\u00A312k), wrapper migration on track, savings rate 38%. Three immediate actions: (1) Deploy \u00A320k ISA allowance by 5 April, (2) salary sacrifice \u00A31,250/mo from March, (3) clear Amex \u00A310.6k from bonus. Combined structural alpha: ~\u00A312,500/yr guaranteed." />
```

---

### ZONE 6: Hero Net Worth Trajectory + Scenario Fan (8 columns LEFT)

A large Glass tile spanning roughly 65% width, containing the primary NW trajectory chart with historical path and forward scenario bands.

```jsx
<div style={{display:"grid", gridTemplateColumns:"2fr 1fr", gap:T.glassGap}}>
  <Glass glow>
    <div style={{fontSize:11, textTransform:"uppercase", letterSpacing:"0.06em", color:T.t3, opacity:0.5, fontWeight:600}}>
      NET WORTH TRAJECTORY — Historical + Probability-Weighted Forward 12M
    </div>
    <div style={{display:"flex", gap:16, marginTop:6, marginBottom:12}}>
      <span style={{fontSize:22, fontWeight:700, fontFamily:"'JetBrains Mono',monospace", color:T.t1}}>
        {fmt(PORT.netWorth)}
      </span>
      <span style={{fontSize:13, color:T.coral, fontWeight:600, alignSelf:"center"}}>
        {pc(nwReturn)} from 6M ago
      </span>
    </div>
    <ResponsiveContainer width="100%" height={260}>
      <ComposedChart data={NW_FORECAST}>
        <defs>
          <linearGradient id="t1_nwFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={T.teal} stopOpacity={0.42}/>
            <stop offset="100%" stopColor={T.teal} stopOpacity={0.02}/>
          </linearGradient>
          <linearGradient id="t1_ddFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={T.coral} stopOpacity={0.25}/>
            <stop offset="100%" stopColor={T.coral} stopOpacity={0.02}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeOpacity={0.04} stroke="rgba(255,255,255,0.04)"/>
        <XAxis dataKey="d" tick={{fill:T.t3,fontSize:10}} axisLine={false} tickLine={false}/>
        <YAxis tick={{fill:T.t3,fontSize:10}} axisLine={false} tickLine={false} tickFormatter={fK}/>
        <Tooltip content={<GlassTip/>}/>
        <Area type="monotone" dataKey="nw" stroke={T.teal} fill="url(#t1_nwFill)" strokeWidth={3}
              dot={false} name="Net Worth"
              style={{filter:"drop-shadow(0 0 4.5px rgba(0,212,170,0.3))"}}/>
        <Area type="monotone" dataKey="base" stroke={T.teal} fill="url(#t1_nwFill)" strokeWidth={2}
              strokeDasharray="6 3" dot={false} name="Base Case"/>
        <Area type="monotone" dataKey="bull" stroke={T.amber} fill="none" strokeWidth={1.5}
              strokeDasharray="4 4" dot={false} name="Bull"/>
        <Area type="monotone" dataKey="conserv" stroke={T.coral} fill="url(#t1_ddFill)" strokeWidth={1.5}
              strokeDasharray="4 4" dot={false} name="Bear"/>
      </ComposedChart>
    </ResponsiveContainer>
  </Glass>
```

---

### ZONE 7: Sidebar Stack (4 columns RIGHT — stacked vertically inside the same grid row)

Three stacked panels to the right of the hero chart:

**7a. Portfolio Quality Radar:**
```jsx
  <div style={{display:"flex", flexDirection:"column", gap:T.glassGap}}>
    <Glass>
      <div style={{fontSize:11, textTransform:"uppercase", letterSpacing:"0.06em", color:T.t3, opacity:0.5, fontWeight:600, marginBottom:8}}>
        PORTFOLIO QUALITY SCORE
      </div>
      <ResponsiveContainer width="100%" height={180}>
        <RadarChart data={SCORE} outerRadius={65}>
          <PolarGrid stroke="rgba(255,255,255,0.06)"/>
          <PolarAngleAxis dataKey="d" tick={{fill:T.t3,fontSize:9}}/>
          <PolarRadiusAxis tick={false} axisLine={false}/>
          <Radar name="Score" dataKey="s" stroke={T.amber} fill={T.amber} fillOpacity={0.18}
                 strokeWidth={3} style={{filter:"drop-shadow(0 0 4px rgba(245,166,35,0.3))"}}/>
        </RadarChart>
      </ResponsiveContainer>
      <div style={{textAlign:"center",fontSize:11,color:T.t3}}>
        Avg: {(SCORE.reduce((s,x)=>s+x.s,0)/SCORE.length).toFixed(1)}/10
      </div>
    </Glass>
```

**7b. Allocation Donut:**
```jsx
    <Glass>
      <div style={{fontSize:11, textTransform:"uppercase", letterSpacing:"0.06em", color:T.t3, opacity:0.5, fontWeight:600, marginBottom:8}}>
        ALLOCATION BY SLEEVE
      </div>
      {/* Group HOLDINGS by cat field, sum values, render PieChart donut */}
      <ResponsiveContainer width="100%" height={160}>
        <PieChart>
          <Pie data={/* compute: Object.entries(HOLDINGS.reduce(...groupByCat...)).map(([name,value]) => ({name,value})) */}
               cx="50%" cy="50%" innerRadius={42} outerRadius={62}
               dataKey="value" nameKey="name" stroke="none">
            {/* Map each category to a Cell with appropriate colour from the palette */}
          </Pie>
          <Tooltip content={<GlassTip/>}/>
        </PieChart>
      </ResponsiveContainer>
    </Glass>
```

**7c. FIRE Progress Gauge:**
```jsx
    <Glass>
      <div style={{display:"flex", justifyContent:"space-around", alignItems:"center", padding:"8px 0"}}>
        <Gauge score={((PORT.netWorth/PORT.fireTarget)*100).toFixed(0)} max={100} label="FIRE %" size={58}/>
        <div>
          <div style={{fontSize:11,color:T.t3,textTransform:"uppercase",letterSpacing:"0.05em",fontWeight:600}}>FIRE TARGET</div>
          <div style={{fontSize:18,fontWeight:700,fontFamily:"'JetBrains Mono',monospace",color:T.t1}}>{fK(PORT.fireTarget)}</div>
          <div style={{fontSize:11,color:T.t3}}>Gap: {fK(PORT.fireTarget-PORT.netWorth)}</div>
        </div>
      </div>
    </Glass>
  </div>
</div>
{/* Close the 2fr/1fr grid from Zone 6 */}
```

---

### ZONE 8: Holding Contribution + Monthly Returns (6+6 columns)

Two side-by-side Glass panels:

**8a. Holding Contribution — Diverging Bars (Left 6-col):**

Sort holdings by 6M return contribution (value × return). Show top 5 contributors (teal bars extending right) and bottom 5 detractors (coral bars extending left). Use a horizontal BarChart with `layout="vertical"`:

```jsx
<Glass>
  <div style={{fontSize:11,textTransform:"uppercase",letterSpacing:"0.06em",color:T.t3,opacity:0.5,fontWeight:600,marginBottom:10}}>
    HOLDING CONTRIBUTION (6M)
  </div>
  {/* Compute: sort HOLDINGS by (v * ret6m/100), take top 5 and bottom 5 */}
  <ResponsiveContainer width="100%" height={220}>
    <BarChart data={/* topBottom array */} layout="vertical">
      <CartesianGrid strokeOpacity={0}/>
      <XAxis type="number" tick={{fill:T.t3,fontSize:10}} axisLine={false} tickLine={false} tickFormatter={fK}/>
      <YAxis type="category" dataKey="n" tick={{fill:T.t2,fontSize:10}} width={100} axisLine={false} tickLine={false}/>
      <Tooltip content={<GlassTip/>}/>
      <ReferenceLine x={0} stroke="rgba(255,255,255,0.12)"/>
      <Bar dataKey="v" radius={[0,4,4,0]}>
        {/* Map each bar: fill={item.v >= 0 ? T.teal : T.coral} fillOpacity={0.90} */}
      </Bar>
    </BarChart>
  </ResponsiveContainer>
</Glass>
```

**8b. Monthly Return Pattern — Column Chart (Right 6-col):**

```jsx
<Glass>
  <div style={{fontSize:11,textTransform:"uppercase",letterSpacing:"0.06em",color:T.t3,opacity:0.5,fontWeight:600,marginBottom:10}}>
    MONTHLY RETURN PATTERN
  </div>
  <ResponsiveContainer width="100%" height={220}>
    <BarChart data={MONTHLY}>
      <CartesianGrid strokeOpacity={0.04} stroke="rgba(255,255,255,0.04)"/>
      <XAxis dataKey="m" tick={{fill:T.t3,fontSize:9}} axisLine={false} tickLine={false}/>
      <YAxis tick={{fill:T.t3,fontSize:9}} axisLine={false} tickLine={false}/>
      <Tooltip content={<GlassTip/>}/>
      <ReferenceLine y={0} stroke="rgba(255,255,255,0.10)"/>
      <Bar dataKey="p" radius={[3,3,0,0]} name="Portfolio">
        {MONTHLY.map((m,i) => (
          <Cell key={i} fill={m.p>=0 ? T.teal : T.coral} fillOpacity={0.90}/>
        ))}
      </Bar>
      <Bar dataKey="b" radius={[3,3,0,0]} fill={T.t3} fillOpacity={0.25} name="Benchmark"/>
    </BarChart>
  </ResponsiveContainer>
</Glass>
```

---

### ZONE 9: Salary-to-Deployment Sankey + NW Bridge Waterfall (6+6 columns)

**9a. Capital Flow — Salary-to-Deployment (Left 6-col):**

If `SankeyChart` exists as a component, use it. Otherwise, build a simplified stacked representation:

A vertical breakdown showing how gross income flows to net deployment. Render as a series of horizontal progress bars inside a Glass tile:

```jsx
<Glass>
  <div style={{fontSize:11,textTransform:"uppercase",letterSpacing:"0.06em",color:T.t3,opacity:0.5,fontWeight:600,marginBottom:12}}>
    SALARY-TO-DEPLOYMENT FLOW
  </div>
  {[
    {label:"Gross Income", value:PORT.grossSalary+PORT.grossBonus, color:T.t1, pct:100},
    {label:"Tax & NI", value:-(PORT.grossSalary+PORT.grossBonus)*(PORT.taxRate+PORT.niRate), color:T.coral, pct:47},
    {label:"Living Expenses", value:-PORT.monthlyExpenses*12, color:T.amber, pct:21},
    {label:"Investable Surplus", value:/* gross - tax - expenses */, color:T.teal, pct:32},
  ].map((item,i) => (
    <div key={i} style={{marginBottom:10}}>
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
        <span style={{fontSize:12,color:item.color=== T.t1 ? T.t1 : item.color,fontWeight:600}}>{item.label}</span>
        <span style={{fontSize:12,fontFamily:"'JetBrains Mono',monospace",color:item.color}}>{fK(Math.abs(item.value))}</span>
      </div>
      <div style={{height:8,background:"rgba(255,255,255,0.04)",borderRadius:4,overflow:"hidden"}}>
        <div style={{width:`${item.pct}%`,height:"100%",background:item.color,borderRadius:4,opacity:0.7}}/>
      </div>
    </div>
  ))}
  <Ins type="insight" text="Savings rate ~32%. At 15% compounding, surplus of ~\u00A3108k/yr turns into \u00A3362k in 3 years. Wrapper allocation determines whether this compounds tax-free." />
</Glass>
```

**9b. Net Worth Bridge Waterfall (Right 6-col):**

```jsx
<Glass>
  <div style={{fontSize:11,textTransform:"uppercase",letterSpacing:"0.06em",color:T.t3,opacity:0.5,fontWeight:600,marginBottom:10}}>
    NET WORTH BRIDGE (6M)
  </div>
  <ResponsiveContainer width="100%" height={220}>
    <BarChart data={NW_BRIDGE} layout="vertical">
      <CartesianGrid strokeOpacity={0}/>
      <XAxis type="number" tick={{fill:T.t3,fontSize:10}} axisLine={false} tickLine={false} tickFormatter={fK}/>
      <YAxis type="category" dataKey="n" tick={{fill:T.t2,fontSize:10}} width={110} axisLine={false} tickLine={false}/>
      <Tooltip content={<GlassTip/>}/>
      <ReferenceLine x={0} stroke="rgba(255,255,255,0.12)"/>
      <Bar dataKey="v" radius={[0,4,4,0]}>
        {NW_BRIDGE.map((item,i) => (
          <Cell key={i} fill={item.v>=0 ? T.teal : T.coral} fillOpacity={0.90}/>
        ))}
      </Bar>
    </BarChart>
  </ResponsiveContainer>
</Glass>
```

---

### ZONE 10: 5-Year Wealth Scenarios (Full 12-col)

A wide Glass tile showing the multi-scenario wealth projection chart using `WEALTH_5` data:

```jsx
<Glass glow>
  <div style={{fontSize:11,textTransform:"uppercase",letterSpacing:"0.06em",color:T.t3,opacity:0.5,fontWeight:600}}>
    WEALTH PROJECTION — 5 SCENARIOS TO 2035
  </div>
  <div style={{display:"flex",gap:16,marginTop:6,marginBottom:10,flexWrap:"wrap"}}>
    {[{l:"Conservative",c:T.coral},{l:"Base",c:T.teal},{l:"+ Wrapper Alpha",c:T.blue},{l:"+ All Opps",c:T.violet},{l:"Bull",c:T.amber}].map(s=>(
      <div key={s.l} style={{display:"flex",alignItems:"center",gap:5,fontSize:10,color:s.c}}>
        <div style={{width:12,height:3,background:s.c,borderRadius:2}}/>{s.l}
      </div>
    ))}
  </div>
  <ResponsiveContainer width="100%" height={240}>
    <AreaChart data={WEALTH_5}>
      <defs>
        <linearGradient id="t1_baseGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={T.teal} stopOpacity={0.25}/>
          <stop offset="100%" stopColor={T.teal} stopOpacity={0.02}/>
        </linearGradient>
      </defs>
      <CartesianGrid strokeOpacity={0.04} stroke="rgba(255,255,255,0.04)"/>
      <XAxis dataKey="y" tick={{fill:T.t3,fontSize:10}} axisLine={false} tickLine={false}/>
      <YAxis tick={{fill:T.t3,fontSize:10}} axisLine={false} tickLine={false} tickFormatter={v=>`\u00A3${v}k`}/>
      <Tooltip content={<GlassTip/>}/>
      <Area type="monotone" dataKey="conservative" stroke={T.coral} fill="none" strokeWidth={1.5} strokeDasharray="4 4" dot={false}/>
      <Area type="monotone" dataKey="base" stroke={T.teal} fill="url(#t1_baseGrad)" strokeWidth={3} dot={false}
            style={{filter:"drop-shadow(0 0 4px rgba(0,212,170,0.3))"}}/>
      <Area type="monotone" dataKey="wrapperAlpha" stroke={T.blue} fill="none" strokeWidth={2} strokeDasharray="6 3" dot={false}/>
      <Area type="monotone" dataKey="allOpps" stroke={T.violet} fill="none" strokeWidth={2} strokeDasharray="4 4" dot={false}/>
      <Area type="monotone" dataKey="bull" stroke={T.amber} fill="none" strokeWidth={1.5} strokeDasharray="3 3" dot={false}/>
    </AreaChart>
  </ResponsiveContainer>
  <Ins type="opp" text={`Base case reaches \u00A3${WEALTH_5[WEALTH_5.length-1]?.base?.toLocaleString()}k by 2035. Wrapper alpha alone adds ~\u00A3${((WEALTH_5[WEALTH_5.length-1]?.wrapperAlpha||0)-(WEALTH_5[WEALTH_5.length-1]?.base||0)).toFixed(0)}k. Executing all opportunities: \u00A3${WEALTH_5[WEALTH_5.length-1]?.allOpps?.toLocaleString()}k.`} />
</Glass>
```

---

### ZONE 11: Risk Budget + Key Metrics + Drawdown from Peak (4+4+4 columns)

Three medium tiles in a 3-column grid:

**11a. Risk Budget Utilisation (Left 4-col):**

Concentric ring gauges (Masttro-style) showing budget consumption across key risk categories:

```jsx
<Glass>
  <div style={{fontSize:11,textTransform:"uppercase",letterSpacing:"0.06em",color:T.t3,opacity:0.5,fontWeight:600,marginBottom:12}}>
    RISK BUDGET UTILISATION
  </div>
  <div style={{display:"flex",flexDirection:"column",gap:10}}>
    <ProgBar val={91} max={100} c={T.coral} label="Crypto Risk Budget"/>
    <ProgBar val={64} max={100} c={T.amber} label="Concentration Limit"/>
    <ProgBar val={38} max={100} c={T.teal} label="Leverage Budget"/>
    <ProgBar val={72} max={100} c={T.amber} label="Drawdown Tolerance"/>
    <ProgBar val={45} max={100} c={T.teal} label="Liquidity Floor"/>
  </div>
</Glass>
```

**11b. Key Portfolio Metrics (Centre 4-col):**

A stack of stat rows showing institutional-grade analytics:

```jsx
<Glass>
  <div style={{fontSize:11,textTransform:"uppercase",letterSpacing:"0.06em",color:T.t3,opacity:0.5,fontWeight:600,marginBottom:12}}>
    KEY METRICS
  </div>
  {[
    {label:"Sharpe Ratio", value:"0.42", color:T.coral},
    {label:"Sortino Ratio", value:"0.31", color:T.coral},
    {label:"Portfolio Beta", value:"0.87"},
    {label:"Tracking Error", value:"8.4%"},
    {label:"Entropy", value:((-HOLDINGS.reduce((s,h)=>{const w=h.w/100;return w>0?s+w*Math.log(w):s;},0))/Math.log(HOLDINGS.length)*10).toFixed(1)},
    {label:"Active Share (est)", value:"72%", color:T.amber},
    {label:"Savings Rate", value:"38%", color:T.teal},
    {label:"Debt/NW Ratio", value:((PORT.debts/PORT.netWorth)*100).toFixed(1)+"%"},
  ].map((m,i) => (
    <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:`1px solid ${T.grid}`}}>
      <span style={{fontSize:12,color:T.t3}}>{m.label}</span>
      <span style={{fontSize:13,fontFamily:"'JetBrains Mono',monospace",fontWeight:600,color:m.color||T.t1}}>{m.value}</span>
    </div>
  ))}
</Glass>
```

**11c. Drawdown from Peak (Right 4-col):**

A small area chart showing the drawdown path (peak-to-current as a negative %):

```jsx
<Glass>
  <div style={{fontSize:11,textTransform:"uppercase",letterSpacing:"0.06em",color:T.t3,opacity:0.5,fontWeight:600,marginBottom:10}}>
    DRAWDOWN FROM PEAK
  </div>
  {/* Compute drawdown series from NW_WEEKLY */}
  <ResponsiveContainer width="100%" height={140}>
    <AreaChart data={NW_WEEKLY.map((w,i,arr)=>{
      const peak=Math.max(...arr.slice(0,i+1).map(x=>x.nw));
      return {d:w.d, dd:((w.nw-peak)/peak)*100};
    })}>
      <defs>
        <linearGradient id="t1_ddArea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={T.coral} stopOpacity={0.35}/>
          <stop offset="100%" stopColor={T.coral} stopOpacity={0.02}/>
        </linearGradient>
      </defs>
      <CartesianGrid strokeOpacity={0}/>
      <XAxis dataKey="d" tick={{fill:T.t3,fontSize:9}} axisLine={false} tickLine={false}/>
      <YAxis tick={{fill:T.t3,fontSize:9}} axisLine={false} tickLine={false} tickFormatter={v=>v.toFixed(0)+"%"}/>
      <Tooltip content={<GlassTip/>}/>
      <Area type="monotone" dataKey="dd" stroke={T.coral} fill="url(#t1_ddArea)" strokeWidth={2} dot={false}/>
    </AreaChart>
  </ResponsiveContainer>
  <div style={{textAlign:"center",fontSize:11,color:T.coral,fontWeight:600,marginTop:4}}>
    Max DD: {pc(((PORT.netWorth-PORT.nwPeak)/PORT.nwPeak)*100)}
  </div>
</Glass>
```

---

### ZONE 12: Top Opportunities Preview + Debt Position (8+4 columns)

**12a. Top 5 Opportunities Summary (Left 8-col):**

A preview of the best opportunities from the Opportunity Radar (T8), giving the CIO forward-looking action context:

```jsx
<Glass>
  <div style={{fontSize:11,textTransform:"uppercase",letterSpacing:"0.06em",color:T.t3,opacity:0.5,fontWeight:600,marginBottom:10}}>
    TOP OPPORTUNITIES — CONVICTION-RANKED
  </div>
  <Tbl
    h={["Opportunity","Conviction","Timing","Alpha","Value/yr","Status"]}
    r={OPPS_TOP5.map(o=>[
      o.t.length>22 ? o.t.slice(0,22)+"..." : o.t,
      o.c+"/10",
      o.tm+"/10",
      o.alpha,
      fmt(o.val),
      o.status
    ])}
    hl={4}
  />
  <Ins type="action" text="Three opportunities are execution-ready: Wrapper Optimisation (\u00A37.5k/yr), Salary Sacrifice (\u00A36.75k/yr), and Quality Global Equities (\u00A35.4k/yr). Combined first-year alpha: ~\u00A319.6k." />
</Glass>
```

**12b. Debt Position — Quick Dashboard (Right 4-col):**

```jsx
<Glass>
  <div style={{fontSize:11,textTransform:"uppercase",letterSpacing:"0.06em",color:T.t3,opacity:0.5,fontWeight:600,marginBottom:12}}>
    DEBT POSITION
  </div>
  <div style={{marginBottom:12}}>
    <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
      <span style={{fontSize:12,color:T.coral,fontWeight:600}}>Amex (22% APR)</span>
      <span style={{fontSize:14,fontFamily:"'JetBrains Mono',monospace",fontWeight:700,color:T.coral}}>{fmt(PORT.amexDebt)}</span>
    </div>
    <div style={{fontSize:11,color:T.t3}}>Annual cost: \u00A32,343 \u00B7 Pre-tax equiv: \u00A34,260</div>
  </div>
  <div style={{marginBottom:12}}>
    <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
      <span style={{fontSize:12,color:T.amber,fontWeight:600}}>Monzo Flex</span>
      <span style={{fontSize:14,fontFamily:"'JetBrains Mono',monospace",fontWeight:700,color:T.amber}}>{fmt(PORT.monzoFlex)}</span>
    </div>
    <div style={{fontSize:11,color:T.t3}}>Lower rate \u00B7 Managed repayment</div>
  </div>
  <div style={{borderTop:`1px solid ${T.grid}`,paddingTop:10}}>
    <div style={{display:"flex",justifyContent:"space-between"}}>
      <span style={{fontSize:13,color:T.t1,fontWeight:600}}>Total Debt</span>
      <span style={{fontSize:16,fontFamily:"'JetBrains Mono',monospace",fontWeight:700,color:T.coral}}>{fmt(PORT.debts)}</span>
    </div>
    <div style={{fontSize:11,color:T.t3,marginTop:4}}>Debt/NW: {((PORT.debts/PORT.netWorth)*100).toFixed(1)}%</div>
  </div>
</Glass>
```

---

### ZONE 13: Stress Test Snapshot + Liquidity Position (6+6 columns)

**13a. Stress Test Summary (Left 6-col):**

A compact table previewing the 4 most severe stress scenarios:

```jsx
<Glass>
  <div style={{fontSize:11,textTransform:"uppercase",letterSpacing:"0.06em",color:T.t3,opacity:0.5,fontWeight:600,marginBottom:10}}>
    STRESS TEST SNAPSHOT
  </div>
  <Tbl
    h={["Scenario","Impact","Probability"]}
    r={[...STRESS].sort((a,b)=>a.impact-b.impact).slice(0,5).map(s=>[
      s.s,
      pc(s.impact),
      s.pr
    ])}
    hl={1}
  />
  <div style={{fontSize:10,color:T.t3,marginTop:6,fontStyle:"italic"}}>
    Combined risk-off scenario: {pc(STRESS.find(s=>s.s.includes("Combined"))?.impact || -16.8)} impact. Full analysis in Risk Engine tab.
  </div>
</Glass>
```

**13b. Liquidity Position (Right 6-col):**

Shows cash positions and liquidity layers:

```jsx
<Glass>
  <div style={{fontSize:11,textTransform:"uppercase",letterSpacing:"0.06em",color:T.t3,opacity:0.5,fontWeight:600,marginBottom:12}}>
    LIQUIDITY BUFFER
  </div>
  {/* Find cash/liquid holdings from HOLDINGS */}
  <ProgBar val={11558} max={18000} c={T.coral} label={`Rainy Day Fund: ${fmt(11558)} / ${fK(18000)} target`}/>
  <div style={{height:8}}/>
  <ProgBar val={33600} max={50000} c={T.amber} label={`Fixed Deposits: ${fmt(33600)}`}/>
  <div style={{height:8}}/>
  <ProgBar val={/* total liquid */} max={PORT.netWorth} c={T.teal} label="Total Liquid / Net Worth"/>
  <Ins type="warning" text="Rainy day fund at 64% of target (\u00A311.5k vs \u00A318k). Runway: ~1.9 months expenses. Rebuild to 3-month target from bonus." />
</Glass>
```

---

### ZONE 14: Strengths / Weaknesses / Priority Actions (Full 12-col)

Three side-by-side Glass cards with coloured top accent bars:

```jsx
<div style={{display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap:T.glassGap}}>
  {[
    {title:"Strengths", color:T.teal, items:[
      "Pension step-function increase (+\u00A312k)",
      "High income engine (\u00A3340k gross, dual earner potential)",
      "Wrapper migration in progress (ISA shield growing)",
      "Decision quality trending up (7.2/10 composite)",
      "Zero leverage on investments"
    ]},
    {title:"Weaknesses", color:T.coral, items:[
      "BTC concentration caused -44% drawdown",
      "Rainy day fund depleted to \u00A311.5k (64% of target)",
      "Amex debt at 22% APR (\u00A310.6k outstanding)",
      "No systematic rebalancing discipline",
      "Geographic home bias (52% UK vs 5% benchmark)"
    ]},
    {title:"Priority Actions", color:T.violet, items:[
      "Deploy \u00A320k ISA allowance by 5 April (29 days)",
      "Salary sacrifice \u00A31,250/mo from March payroll",
      "Clear Amex \u00A310.6k from bonus on receipt",
      "Rebuild rainy day to \u00A318k (3-month target)",
      "Initiate monthly rebalancing review cadence"
    ]}
  ].map((card,ci) => (
    <Glass key={ci} style={{borderTop:`3.5px solid ${card.color}`}}>
      <div style={{fontSize:14,fontWeight:700,color:card.color,marginBottom:10,textTransform:"uppercase",letterSpacing:"0.04em"}}>
        {card.title}
      </div>
      {card.items.map((item,ii) => (
        <div key={ii} style={{display:"flex",gap:8,marginBottom:8,alignItems:"flex-start"}}>
          <div style={{width:5,height:5,borderRadius:3,background:card.color,marginTop:5,flexShrink:0,boxShadow:`0 0 4px ${card.color}40`}}/>
          <span style={{fontSize:12,color:T.t2,lineHeight:1.5}}>{item}</span>
        </div>
      ))}
    </Glass>
  ))}
</div>
```

---

### ZONE 15: Synopsis — Data Stamp & Disclaimer (Full 12-col)

```jsx
<Ins type="insight" text={`Data as at ${PORT.date}. Portfolio value \u00A3${(PORT.netWorth/1000).toFixed(0)}k. Source: Kubera + Monzo exports via Supabase. Metrics directionally estimated. Not investment advice. LifeStack OS v5.6 \u00B7 BadgerBrain Intelligence Engine.`} />
```

---

## COMPLETE ZONE MAP (VISUAL SUMMARY)

```
ZONE 1:  [=========== Section Header ===========]  (Hd component)
ZONE 2:  [KPI][KPI][KPI][KPI]                      (4× primary KPI)
ZONE 3:  [sm][sm][sm][sm][sm]                       (5× secondary KPI)
ZONE 4:  [====== Governance Alert Pills =========]  (severity-coded)
ZONE 5:  [====== CIO Insight Banner =============]  (narrative strip)
ZONE 6:  [====== NW Trajectory Chart ===][Radar ]   (8+4 grid)
ZONE 7:                                  [Donut ]
                                         [FIRE  ]
ZONE 8:  [= Holding Contribution =][= Monthly Ret=] (6+6)
ZONE 9:  [= Capital Flow ==========][= NW Bridge =] (6+6)
ZONE 10: [=========== 5-Year Wealth Scenarios ====]  (full width hero)
ZONE 11: [Risk Budget][Key Metrics][Drawdown Peak]   (4+4+4)
ZONE 12: [===== Top Opportunities Table ===][Debt]   (8+4)
ZONE 13: [= Stress Test Snapshot =][= Liquidity ==]  (6+6)
ZONE 14: [Strengths  ][Weaknesses ][Actions      ]   (4+4+4)
ZONE 15: [========== Synopsis / Data Stamp =======]  (footer)
```

**Total analytical blocks: ~28**
**Estimated scroll depth: ~2.5 viewports on 1920×1080**

---

## FINAL IMPLEMENTATION NOTES

1. **Wrap the entire T1 body** in a single `<div>` with `style={{display:"flex",flexDirection:"column",gap:T.glassGap}}`.
2. **Every `<Row>` and grid section** should be a direct child of this wrapper.
3. **Gradient IDs** — every `<linearGradient>` must have a unique `id` prefixed with `t1_`. Re-using IDs across tabs causes SVG rendering bugs.
4. **Data computations** (like grouping holdings by category, computing drawdown series, sorting contributions) should be done as `const` declarations at the top of the T1 function body, BEFORE the return statement.
5. **Do not create new global components.** If you need a helper (like a stat row), define it as a `const` inside T1.
6. **Test incrementally.** After writing Zones 1-7, run `npx next build`. After Zones 8-15, run it again. Fix any JSX errors before proceeding.
7. **The file is ~3,100 lines.** T1 currently occupies roughly lines 603-750. The rewrite will expand it to approximately 400-500 lines. This is fine.
