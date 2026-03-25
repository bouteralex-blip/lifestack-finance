# LIFESTACK OS — T1 EXECUTIVE SUMMARY UPGRADE
## Claude Code Deployment Prompt

**Date:** 25 March 2026
**Scope:** Replace the T1 function body in `components/PortfolioVOS.jsx` with the approved Hyper Charts–detailed version
**Outcome:** Every tile on T1 has full Hyper Charts anatomy (title, KPI strip with deltas/comparisons, chart with floating data labels, data table footer, badge icons)

---

## 1. DEPLOYMENT WORKFLOW (FOLLOW EXACTLY)

```
1. git clone https://github.com/bouteralex-blip/lifestack-finance.git
2. cd lifestack-finance
3. Edit components/PortfolioVOS.jsx — replace T1 function body ONLY
4. npx next build 2>&1 | tail -20  (MUST pass with zero errors)
5. git add -A && git commit -m "LifeStack Deploy — T1 Hyper Charts upgrade"
6. ASK ALEX FOR A GITHUB PAT (he will provide it)
7. git push https://<PAT>@github.com/bouteralex-blip/lifestack-finance.git main
8. Wait 30 seconds, then verify deployment via Vercel
```

**Critical constraints:**
- Do NOT modify any other tab function (T2–T15)
- Do NOT modify the T design token object at the top of the file
- Do NOT modify shared components (Hd, KPI, Row, Glass, Ins, Alert, GlassTip, Tbl, fmt, fK, pc, ProgBar, SankeyChart)
- Do NOT modify data objects (PORT, HOLDINGS, NW_WEEKLY, SLEEVES, RISK, etc.)
- T14 appears before T13 in the file — this is intentional, do not reorder
- The P object's `mono:` key must never be caught by font-string replacement regexes

---

## 2. FILE STRUCTURE

**Target file:** `components/PortfolioVOS.jsx` (~600 lines)

**Key sections:**
- Lines 1–8: Imports (may need to add `ReferenceLine, Line, ScatterChart, Scatter, Fragment`)
- Lines 9–15: `T` design token object (DO NOT TOUCH)
- Lines 16–57: Data engine (PORT, HOLDINGS, RISK, FACTORS, etc.) — DO NOT TOUCH
- Lines 58–82: Shared components (Hd, Ins, Tbl, GlassTip, Row, KPI, Glass, etc.) — DO NOT TOUCH
- Lines 83–88: SankeyChart, ConvictionMatrix — DO NOT TOUCH
- **Lines 93–153: T1 function — THIS IS WHAT YOU REPLACE**
- Lines 155+: T2–T15 functions — DO NOT TOUCH

---

## 3. WHAT THE T1 REPLACEMENT MUST CONTAIN

The T1 function must expand from ~60 lines to ~350 lines. It uses the existing shared components and data objects. All new helper components (like HKpi strip, HCityTable, stat rows specific to T1) must be defined as `const` inside the T1 function body, NOT as new global components.

### Required tiles (28 analytical blocks):

**ZONE 1: Signal Bar (4 KPI cards)**
- Net Worth £362,072 with sparkline, peak comparison, "Avg. score" sub-text
- 6M Return (TWR) with sparkline, benchmark comparison, XIRR cross-reference
- Peak Drawdown -14.2% with sparkline, CDaR reference, recovery status pill
- Coast FIRE Progress with progress bar, target/gap numbers, "Avg. score" sub-text

**ZONE 2: Quality Scorecard (full width)**
- 8 Gauge scores in a row (Overall 5.2, Returns 3.8, Risk 5.4, Process 4.2, Tax 6.0, Diversity 7.6, Capital 4.4, Decisions 4.8)
- Decision Quality Score: 4.8/10
- Insight narrative beneath

**ZONE 3: Alert Panel**
- Severity-coded pills (red/amber/green) with age timestamps
- ISA deadline, Amex APR, Cash buffer, Crypto risk budget, Fragment drag

**ZONE 4: CIO Insight Narrative**
- Use existing `Ins` component with the crypto loss / equity gain narrative

**ZONE 5: NW GRADIENT EDGE SANKEY (8 cols) + Sidebar (4 cols)**
CRITICAL CHANGE: Replace the stacked area chart with a Gradient Edge flowing stream chart (Hyper Charts "Gradient Edge" type). This is the signature hero visualization.

Implementation approach — use multiple overlapping `<Area>` components with `type="basis"` (organic bezier curves) and high-opacity gradient fills. Each asset class stream flows as a separate coloured ribbon that weaves and crosses other streams. The visual effect is interweaving flowing colour streams on a dark background.

Required elements on this tile:
- Full HKpi strip (Weekly/Monthly/6M values with green delta badges and comparison text beneath each)
- 3 vertical reference markers (gray bars) at intervals showing paired floating data labels in rounded pills (e.g., "£60k" / "£42k" top/bottom)
- Each stream: Pension (violet), Equities (teal), Crypto (amber), Cash (emerald), ZAR (coral) — each as a separate `<Area>` with `type="basis"`, `fillOpacity={0.6}`, independent gradient, and `strokeWidth={0}` (no stroke, pure fill)
- Series legend row with coloured dots
- Two HBadge icons (Total assets / Total debts)
- Star icon in top-right corner (green accent)
- City/data table footer: 3 rows × 3 columns of portfolio breakdown values

The key visual difference from a stacked area: streams OVERLAP and CROSS each other rather than stacking. Achieve this by NOT using `stackId` — render each Area independently so they layer on top of each other with their gradient fills creating the interweaving illusion.

Reference: Hyper Charts "Gradient Edge" widget from the Figma Hyper Charts templates file.

Sidebar stacked vertically:
- Module Control panel (TWR/XIRR/Real, Base/Bull/Bear, 60/40/MSCI/Custom toggle pills)
- Threshold Governance concentric rings (Liquidity 17% coral / Risk Budget 91% teal / FIRE 34% amber)
- Asset Allocation donut with legend

**ZONE 6: Quality Radar + Drawdown Profile (6+6 cols)**
Quality Radar — full Hyper Multiply Radar layout:
- Left wing: Current score 5.2, delta +0.3, legend dots, badge icons
- Centre: Radar chart with current (teal) + target (amber dashed) series
- Right wing: Target 7.0, Weakest axis 3.8 (coral)
- City table footer with axis scores

Drawdown Profile:
- HKpi strip (Current DD / Recovery status / Max DD)
- Coral area chart with gradient fill
- ReferenceLine at trough
- Data table: Peak-to-Trough £, Recovery Needed, Days in DD

**ZONE 7: Up/Down Capture + Brinson Attribution (6+6)**
Up/Down Capture — Hyper Mirrored Rainfall:
- Dual-KPI strip (Up Capture % / Down Capture %)
- Dual-area chart above/below zero line (blue up, coral down)
- Data table: Net Capture Ratio, Asymmetry Score, Batting Average

Brinson Attribution:
- Dual-KPI strip (Allocation +2.1% / Selection -9.8%)
- Horizontal diverging bar chart with floating value labels on every bar end
- Zero reference line
- HBadge: Total active return

**ZONE 8: Risk/Return Map + Monthly Returns Thermal (6+6)**
Risk/Return Map — Hyper Bubble Scatter:
- KPI strip (Monthly/Yearly)
- Scatter chart with sized circles per holding
- Data table: each holding's Vol% and Return%

Monthly Returns — Thermal Heatmap Grid:
- KPI strip (Monthly/Yearly)
- 6-asset × 6-month coloured grid
- Data table: Best Month, Worst Month, Hit Rate

**ZONE 9: Monthly Distribution + Liquidity Ladder (6+6)**
Monthly Distribution — Hyper Rainfall:
- Tri-KPI (Positive months / Negative / Average)
- Bar chart with floating % labels, zero reference line
- Data table: Sharpe, Sortino, Skewness

Liquidity Ladder:
- Tri-KPI (Liquid / Semi-liquid / Illiquid with NAV percentages)
- Colour-graded bars (teal→cyan→blue→purple→coral)
- Floating £ labels
- Data table: Cash Buffer, Emergency Target, Buffer Gap

**ZONE 10: 5-Year Scenarios (full width)**
- Tri-KPI (Bull 2030 / Base 2030 / Bear 2030 with CAGRs)
- Triple-area chart with end-point data labels
- Data table: FIRE Target, Coast FIRE, Current Gap (3-column)

**ZONE 11: Holdings Table + Key Metrics + Small KPIs (4+4+4)**
Holdings table with 5 columns: Holding, Value, Weight, Return, Contribution
Key Metrics stat rows: Sharpe, Sortino, Max DD, HHI, Entropy, Active Share, Beta, Tracking Error
6 small KPI tiles (2×3 grid): Savings Rate, Runway, Debt Ratio, ISA Used, Pension YTD, DQS — each with "Avg." or "Target" italic sub-text

**ZONE 12: Capital Flow + Wrapper Efficiency (6+6)**
Capital Flow with HKpi strip, progress bars (Gross → Tax → Expenses → Investable), data table
Wrapper Efficiency with HKpi strip, utilisation bars (ISA/Pension/GIA), data table

**ZONE 13: Strengths / Weaknesses / Actions (4+4+4)**
Three Glass tiles with coloured top borders and numbered items
Icon badges in headers (TrendingUp / AlertTriangle / Zap)

---

## 4. DESIGN RULES

**Use existing design token object `T` — NOT `P`:**
- `T.teal` = "#00D4AA" (positive)
- `T.coral` = "#FF5C7A" (negative)
- `T.amber` = "#F5A623" (warning/accent)
- `T.violet` = "#7C6FFF"
- `T.blue` = "#3B9EFF"
- `T.t1` = "#F8FAFC" (primary text)
- `T.t2` = "#94A3B8" (secondary text)
- `T.t3` = "#64748B" (tertiary text)
- `T.glass` = "rgba(255,255,255,0.05)"
- `T.glassGap` = 16
- `T.glassRadius` = 16

**Chart styling rules (apply to ALL charts):**
```
CartesianGrid: stroke={T.grid} or "rgba(255,255,255,0.04)", strokeDasharray="3 3"
XAxis: tick={{fill:T.t3,fontSize:10}}, axisLine={false}, tickLine={false}
YAxis: same as XAxis
Tooltip: content={<GlassTip/>}
Area gradients: unique IDs prefixed with t1_ (e.g., t1_nwGrad, t1_ddGrad)
Stroke glow: style={{filter:"drop-shadow(0 0 4px rgba(0,212,170,0.3))"}}
Bar rounded tops: radius={[4,4,0,0]}
```

## 4A. QUALITY UPGRADE SPECIFICATIONS (CRITICAL — READ CAREFULLY)

This deployment is a visual quality jump. Every tile must match the Hyper Charts dark theme standard. The following quality rules override any simpler patterns from previous builds.

**GLASS TILE QUALITY — Add specular highlight + stabilized plate:**

Every `<Glass>` tile that contains a primary KPI value must include:
1. A specular highlight shine band (absolutely-positioned inner div) at the top edge:
```jsx
<div style={{position:"absolute",top:0,left:"10%",right:"10%",height:1,
  background:"linear-gradient(90deg,transparent,rgba(255,255,255,0.15),transparent)",
  pointerEvents:"none",zIndex:1}}/>
```
2. An inner stabilized plate behind hero KPI values for readability:
```jsx
<div style={{background:"rgba(0,0,0,0.20)",borderRadius:10,padding:"8px 14px",display:"inline-block"}}>
  <span style={{fontSize:22,fontWeight:700,fontFamily:"'JetBrains Mono',monospace",color:T.t1}}>£262,622</span>
</div>
```

**CHART GLOW TIERS — Match Factor Decision #6:**
- Tier 1 (container glow): `boxShadow: "0 0 30px rgba([accent],0.15)"` on `<Glass>` hero tiles
- Tier 2 (hero chart lines): `style={{filter:"drop-shadow(0 0 6px rgba([color],0.4))"}}` on primary data strokes
- Tier 3 (supporting charts): `style={{filter:"drop-shadow(0 0 3px rgba([color],0.25))"}}` on secondary chart lines
- Zero glow on tables, text, and Tier 3 supporting visualizations

**FLOATING DATA LABELS — Rounded pill callouts (Hyper Charts signature):**

Every chart with data points must show floating value labels in rounded pill containers at key points. Implementation:
```jsx
// Custom label component for Recharts
const PillLabel = ({x, y, value, color}) => (
  <g>
    <rect x={x-22} y={y-16} width={44} height={18} rx={9} fill="rgba(0,0,0,0.65)" stroke={color} strokeWidth={0.5} strokeOpacity={0.3}/>
    <text x={x} y={y-4} textAnchor="middle" fill={T.t1} fontSize={9} fontFamily="'JetBrains Mono',monospace" fontWeight="600">{value}</text>
  </g>
);
// Use: label={<PillLabel/>} on Area/Line/Bar components, showing every 2nd-3rd point
```

**GRADIENT FILLS — Proper opacity tiers (Factor Decision #5):**
- Hero chart area fills: 60% to 10% opacity gradient (not 45% to 5%)
- Supporting chart fills: 40% to 5% opacity gradient
- Bar fills: solid at 75-85% opacity (no gradient)
- Donut/Pie segments: solid at 85% opacity

**CHART LINE STROKES — Thickness hierarchy:**
- Hero chart primary line: strokeWidth={3}, with Tier 2 glow
- Secondary chart lines: strokeWidth={2.5}, with Tier 3 glow
- Reference/threshold lines: strokeWidth={1}, strokeDasharray="6 4", no glow
- Grid lines: strokeOpacity={0.04} (near-invisible)

**VERTICAL REFERENCE MARKERS (for Gradient Edge hero chart):**

The Gradient Edge chart needs 3 vertical reference markers with paired floating data labels:
```jsx
// Gray vertical bar at each marker point
<ReferenceLine x="Nov" stroke="rgba(255,255,255,0.15)" strokeWidth={8}>
  <Label value="£60k" position="top" fill={T.t1} fontSize={10} fontFamily="'JetBrains Mono',monospace"/>
  <Label value="£42k" position="bottom" fill={T.t2} fontSize={9} fontFamily="'JetBrains Mono',monospace"/>
</ReferenceLine>
```

**HOVER STATES — Enhanced lift:**
- Glass tiles lift 3px on hover with expanded shadow
- Chart data points show crosshair + glass tooltip
- Interactive elements (toggle pills, buttons) have 0.2s transition

**Typography:**
- Primary KPI: 22px, JetBrains Mono, bold, textShadow for accent glow
- Small KPI: 16px, JetBrains Mono, bold
- Section headers: via existing `Hd` component
- Labels: 10px, uppercase, letterSpacing "0.06em", T.t3
- Data table numbers: 12px, JetBrains Mono

**Layout:**
- Use `Row` component for horizontal flex-wrap
- Use inline `display:"grid"` for fixed grids
- Gap: `T.glassGap` (16px) between tiles
- Glass tile padding: use existing `Glass` component

---

## 5. EDITING APPROACH

Because `str_replace` fails on JSX blocks longer than ~150 lines, use a Python splice script:

```python
import re

# Read the file
with open('components/PortfolioVOS.jsx', 'r') as f:
    content = f.read()

# The T1 function starts with: const T1=()=>{
# and ends just before: // TAB 2

# Find the T1 boundaries
t1_start = content.index('const T1=()=>{')
t2_marker = content.index('// =========================================================================\n// TAB 2')

# Build the new T1
new_t1 = """const T1=()=>{
  // [NEW T1 BODY HERE - paste the full function body]
};
"""

# Replace
new_content = content[:t1_start] + new_t1 + '\n' + content[t2_marker:]

with open('components/PortfolioVOS.jsx', 'w') as f:
    f.write(new_content)
```

**After editing, verify:**
1. `grep -c "const T1" components/PortfolioVOS.jsx` — should return 1
2. `grep -c "const T2" components/PortfolioVOS.jsx` — should return 1
3. Check bracket balance: `python3 -c "c=open('components/PortfolioVOS.jsx').read();print('Braces:',c.count('{')-c.count('}'),'Parens:',c.count('(')-c.count(')'),'Brackets:',c.count('[')-c.count(']'))"`
4. Target: Braces 0 / Parens 7 / Brackets 0

---

## 6. IMPORTS TO ADD

The existing import line may need these additions (check first, only add if missing):
- `ReferenceLine` (from recharts)
- `Line` (from recharts)
- `ScatterChart, Scatter` (from recharts)
- `Fragment` (from react)
- `TrendingDown, AlertTriangle, Download, Star` (from lucide-react)

Do NOT duplicate any import that already exists.

---

## 7. DATA OBJECTS AVAILABLE

These are already defined in the file and available inside T1:

| Object | Content | Usage |
|--------|---------|-------|
| `PORT` | netWorth, assets, debts, nwPeak, fireTarget, etc. | KPI values |
| `HOLDINGS` | Array of {name, val, cls, geo, ccy, prev, sector, wrapper} | Holdings table, contribution chart |
| `NW_WEEKLY` | Array of {d, nw, a} — 24 weekly data points | Sparklines, NW trajectory |
| `NW_DD` | Array of {d, dd} — drawdown from peak | Drawdown chart |
| `SLEEVES` | Array of {name, val, color, pct} — allocation slices | Donut chart |
| `RISK` | Object with sharpe, sortino, maxDD, hhi, effPos, entropy, etc. | Key metrics |
| `FACTORS` | Array of factor exposures | Factor chart |
| `STRESS` | Array of stress scenarios | Stress snapshot |
| `BRIDGE` | Net worth bridge items | NW bridge waterfall |
| `NW_FORECAST` | Historical + 3-scenario forward projection | 5Y scenario chart |
| `nwReturn` | 6M TWR (computed) | KPI display |
| `activeReturn` | vs benchmark (computed) | KPI display |
| `realReturn` | inflation-adjusted (computed) | KPI display |
| `savingsRate` | % (computed) | Small KPI |
| `runway` | months of cash (computed) | Small KPI |
| `fmt()` | £ formatter with commas | Values |
| `fK()` | £Xk formatter | Compact values |
| `pc()` | Percentage formatter with +/- | Returns |

---

## 8. REFERENCE CODE

The approved artifact is attached as `LifeStack_T1_HyperDetail.jsx`. This file shows the DESIGN INTENT — the visual structure, KPI strips, data tables, and chart configurations for every tile.

**However, the actual T1 code must:**
- Use `T` tokens (not `P` from the artifact)
- Use existing shared components (`Glass`, `Row`, `Hd`, `Ins`, `KPI`, `GlassTip`, `Tbl`, `Alert`)
- Reference existing data objects (`PORT`, `HOLDINGS`, `NW_WEEKLY`, `RISK`, etc.)
- Define any new inline helpers (like HKpi, HCityTable, StatRow) as `const` inside the T1 function body

**Translation mapping (artifact → live codebase):**
| Artifact (P tokens) | Live Codebase (T tokens) |
|---------------------|------------------------|
| P.t1 | T.t1 |
| P.t2 | T.t2 |
| P.t3 | T.t3 |
| P.teal | T.teal |
| P.coral | T.coral |
| P.accent / P.amber | T.amber |
| P.blue | T.blue |
| P.purple | T.violet |
| P.cyan | T.pension |
| P.mono | "'JetBrains Mono',monospace" |
| P.pad | T.glassPad (20) |
| P.gap | T.glassGap (16) |
| `<G>` glass tile | `<Glass>` component |
| `<HTitle>` | Inline div with existing styles |

---

## 9. BUILD VALIDATION (MANDATORY)

After editing, before committing:

```bash
npx next build 2>&1 | tail -20
```

**Must show:** `✓ Compiled successfully` with zero errors.

Common errors to watch for:
- Unclosed JSX tags — count opening/closing manually
- Duplicate gradient IDs — prefix all with `t1_`
- Missing closing braces in the T1 function
- `Fragment` not imported (needed for thermal heatmap grid)
- Unicode characters must use escape sequences: `\u00A3` (£), `\u2192` (→), `\u2014` (—), `\u00B7` (·), `\u25BC` (▼)

If build fails:
```bash
git checkout -- components/PortfolioVOS.jsx
```
Then retry with fixes.

---

## 10. POST-DEPLOYMENT AUDIT (MANDATORY)

After Vercel deployment completes (~30 seconds):

1. **Verify SHA:** `git log --oneline -1` matches Vercel deployment commit
2. **Visual check:** Navigate to lifestack-finance.vercel.app and verify T1 renders
3. **Tab integrity:** Click through T2–T15 and confirm they still render correctly
4. **Supabase audit:** Run the 14-table row count query to confirm data integrity
5. **Console check:** Open browser devtools, confirm zero console errors

---

## 11. FILES TO PROVIDE TO CLAUDE CODE

1. **This prompt** (as the instruction document)
2. **`LifeStack_T1_HyperDetail.jsx`** (the approved artifact — design reference)
3. **`LifeStack_Finance_v56.jsx`** (current live codebase reference — so Claude Code can see the existing shared components, data objects, and T1 boundaries)

Claude Code should read both reference files, understand the translation mapping, and produce a single clean edit to `components/PortfolioVOS.jsx` that replaces only the T1 function body.
