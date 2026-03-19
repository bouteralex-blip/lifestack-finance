"use client";

/**
 * DashboardGrid.jsx
 *
 * Composition reference file -- ALL 22 widgets.
 * - Defines ALL mockData objects.
 * - Imports each widget and places them in a grid-cols-12 layout.
 * - Passes mockData into each widget via the `data` prop.
 *
 * This file contains NO internal component logic.
 */

// ── Original 12 widgets ─────────────────────────────────────────────────────
import { EmeraldGlassCard, EmeraldInnerPlate, EmeraldLabel, EmeraldValue } from "./EmeraldGlassCard";
import { KpiBentoGridWidget } from "./KpiBentoGridWidget";
import { AgentBannerWidget } from "./AgentBannerWidget";
import { TrajectoryChartWidget } from "./TrajectoryChartWidget";
import { AllocationChartWidget } from "./AllocationChartWidget";
import { IncomeExpenseChartWidget } from "./IncomeExpenseChartWidget";
import { LiquidGlassSwitchWidget } from "./LiquidGlassSwitchWidget";
import { LiquidGlassFilterWidget } from "./LiquidGlassFilterWidget";
import { KpiGridWidget } from "./KpiGridWidget";
import { CIOInsightBannerWidget } from "./CIOInsightBannerWidget";
import { CorrelationHeatmapWidget } from "./CorrelationHeatmapWidget";
import { FactorRadarWidget } from "./FactorRadarWidget";

// ── 10 NEW advanced chart widgets ───────────────────────────────────────────
import { ConcentricProgressRingsWidget } from "./ConcentricProgressRingsWidget";
import { LuminousStackedColumnWidget } from "./LuminousStackedColumnWidget";
import { MirroredDivergingBarWidget } from "./MirroredDivergingBarWidget";
import { ConfidenceBandRangeWidget } from "./ConfidenceBandRangeWidget";
import { OverlappingMountainAreaWidget } from "./OverlappingMountainAreaWidget";
import { GlowingStepLineWidget } from "./GlowingStepLineWidget";
import { RoundedVolumePulseWidget } from "./RoundedVolumePulseWidget";
import { ContributionHeatmapWidget } from "./ContributionHeatmapWidget";
import { ScatterBubbleMatrixWidget } from "./ScatterBubbleMatrixWidget";
import { AsymmetricFilledRadarWidget } from "./AsymmetricFilledRadarWidget";


// =============================================================================
// MOCK DATA
// =============================================================================

// 1. KPI Grid (Emerald variant)
const kpiGridData = [
  { label: "NET WORTH", value: "\u00A3362k", delta: "-14.2%", deltaType: "negative", subtext: "Peak: \u00A3398k" },
  { label: "6-MO RETURN", value: "-8.9%", delta: "-8.9%", deltaType: "negative" },
  { label: "TOTAL ASSETS", value: "\u00A3376k", delta: "+\u00A329k", deltaType: "positive" },
  { label: "ACTIVE RETURN", value: "-6.1%", delta: "-6.1%", deltaType: "negative", subtext: "vs MSCI World" },
  { label: "FIRE PROGRESS", value: "20%", delta: "On Track", deltaType: "positive", subtext: "Target \u00A31,800k" },
  { label: "CASH BUFFER", value: "2.7mo", delta: "Below Target", deltaType: "warning", subtext: "Target: 3.0mo" },
];

// 2. KPI Bento Grid (Liquid Glass variant)
const kpiBentoData = [
  { label: "NET WORTH", value: "\u00A3362k", delta: "-14.2%", deltaType: "negative", subtext: "Peak: \u00A3398k" },
  { label: "6-MO RETURN", value: "-8.9%", delta: "-8.9%", deltaType: "negative" },
  { label: "TOTAL ASSETS", value: "\u00A3376k", delta: "+\u00A329k", deltaType: "positive" },
  { label: "ACTIVE RETURN", value: "-6.1%", delta: "-6.1%", deltaType: "negative", subtext: "vs MSCI World" },
  { label: "FIRE PROGRESS", value: "20%", delta: "20%", deltaType: "positive", subtext: "Target \u00A31,800k" },
  { label: "CASH BUFFER", value: "2.7mo", delta: "vs 3.0 target", deltaType: "warning" },
];

// 3. Agent Banner
const agentBannerData = {
  badgeLabel: "Agent Synthesis \u2022 Late Cycle",
  insightText:
    "Macro regime has shifted to late-cycle dynamics. Yield curve re-steepening, credit spreads widening +40bps MTD. Recommend reducing duration exposure and rotating into quality factor tilts. Cash buffer below 3-month target warrants attention before Q3 rebalance window.",
  confidence: 72,
};

// 4. CIO Insight Banner
const cioInsightData = {
  badgeLabel: "Strategic Asset Allocation \u2022 Q3 Review",
  insightText:
    "Equity risk premium compression signals rotation opportunity. EM bonds offering 180bp spread advantage over DM. Commodity super-cycle thesis intact but position sizing should reflect vol regime change.",
  confidence: 85,
  accentColor: "rgb(59,130,246)",
};

// 5. Trajectory Chart
function generateTrajectoryData() {
  const data = [];
  const startDate = new Date(2024, 0, 1);
  let value = 285000;
  for (let i = 0; i < 27; i++) {
    const date = new Date(startDate);
    date.setMonth(date.getMonth() + i);
    value = Math.max(value + 1800 + (Math.random() - 0.4) * 18000 + Math.sin(i * 0.5) * 6000, 240000);
    data.push({ date: date.toLocaleDateString("en-GB", { month: "short", year: "2-digit" }), value: Math.round(value) });
  }
  const lastVal = value;
  for (let i = 0; i < 9; i++) {
    const date = new Date(2026, 3 + i, 1);
    const fv = lastVal * (1 + 0.008 * (i + 1)) + Math.sin(i * 0.8) * 8000;
    data.push({ date: date.toLocaleDateString("en-GB", { month: "short", year: "2-digit" }), value: i === 0 ? Math.round(value) : undefined, forecast: Math.round(fv) });
  }
  return data;
}
const trajectoryData = generateTrajectoryData();
const trajectoryFooterStats = [
  { label: "Current", value: "\u00A3362k", color: "text-white" },
  { label: "YTD", value: "-14.2%", color: "text-[#FF4D4D]" },
  { label: "Projected EOY", value: "\u00A3395k", color: "text-[#00E599]" },
  { label: "FIRE Target", value: "\u00A31,800k", color: "text-emerald-100/50" },
];

// 6. Allocation Chart
const allocationData = [
  { name: "Equities", value: 45.2, color: "#00D4AA", amount: "\u00A3163,440" },
  { name: "Fixed Income", value: 28.7, color: "#3B82F6", amount: "\u00A3103,734" },
  { name: "Real Estate", value: 10.6, color: "#F5A623", amount: "\u00A338,332" },
  { name: "Alternatives", value: 7.8, color: "#A855F7", amount: "\u00A328,210" },
  { name: "Cash", value: 7.7, color: "#64748B", amount: "\u00A327,844" },
];

// 7. Income/Expense Chart
const monthlyData = [
  { month: "Sep", income: 8200, expenses: 4100, savings: 2800, tax: 1300 },
  { month: "Oct", income: 8400, expenses: 4300, savings: 2700, tax: 1400 },
  { month: "Nov", income: 8100, expenses: 5200, savings: 1600, tax: 1300 },
  { month: "Dec", income: 9800, expenses: 6100, savings: 2200, tax: 1500 },
  { month: "Jan", income: 8300, expenses: 4400, savings: 2600, tax: 1300 },
  { month: "Feb", income: 8500, expenses: 3900, savings: 3200, tax: 1400 },
  { month: "Mar", income: 8700, expenses: 4200, savings: 3100, tax: 1400 },
];

// 8. Filter (segmented control)
const filterData = { options: ["1M", "3M", "6M", "YTD", "1Y", "ALL"], defaultIndex: 5 };

// 9. Correlation Heatmap
const correlationData = {
  labels: ["Equities", "Bonds", "Gold", "Real Est.", "Crypto", "Cmdty"],
  matrix: [
    [ 1.00,  -0.32,  0.08,  0.45,  0.62,  0.28],
    [-0.32,   1.00, -0.15, -0.08, -0.45,  0.12],
    [ 0.08,  -0.15,  1.00,  0.18,  0.22,  0.55],
    [ 0.45,  -0.08,  0.18,  1.00,  0.15,  0.32],
    [ 0.62,  -0.45,  0.22,  0.15,  1.00,  0.18],
    [ 0.28,   0.12,  0.55,  0.32,  0.18,  1.00],
  ],
};

// 10. Factor Radar
const factorRadarData = [
  { factor: "Value",     portfolio: 72, benchmark: 50 },
  { factor: "Growth",    portfolio: 45, benchmark: 55 },
  { factor: "Quality",   portfolio: 85, benchmark: 60 },
  { factor: "Momentum",  portfolio: 60, benchmark: 50 },
  { factor: "Size",      portfolio: 38, benchmark: 50 },
  { factor: "Vol",       portfolio: 55, benchmark: 50 },
  { factor: "Yield",     portfolio: 68, benchmark: 45 },
  { factor: "Liquidity", portfolio: 75, benchmark: 65 },
];

// 11. Concentric Progress Rings
const progressRingsData = [
  { label: "FIRE Target", value: 362000, max: 1800000, color: "#00E599", glowColor: "#00E599" },
  { label: "Annual Savings", value: 28400, max: 50000, color: "#3B82F6", glowColor: "#3B82F6" },
  { label: "Emergency Fund", value: 8100, max: 10000, color: "#F5A623", glowColor: "#F5A623" },
];

// 12. Luminous Stacked Column
const luminousStackedData = [
  { label: "Q1", segments: [{ key: "Equities", value: 4200, color: "#00D4AA" }, { key: "Bonds", value: 2800, color: "#3B82F6" }, { key: "Alts", value: 1200, color: "#A855F7" }] },
  { label: "Q2", segments: [{ key: "Equities", value: 3800, color: "#00D4AA" }, { key: "Bonds", value: 3200, color: "#3B82F6" }, { key: "Alts", value: 1500, color: "#A855F7" }] },
  { label: "Q3", segments: [{ key: "Equities", value: 5100, color: "#00D4AA" }, { key: "Bonds", value: 2400, color: "#3B82F6" }, { key: "Alts", value: 1800, color: "#A855F7" }] },
  { label: "Q4", segments: [{ key: "Equities", value: 4700, color: "#00D4AA" }, { key: "Bonds", value: 2900, color: "#3B82F6" }, { key: "Alts", value: 2100, color: "#A855F7" }] },
  { label: "Q1'", segments: [{ key: "Equities", value: 4400, color: "#00D4AA" }, { key: "Bonds", value: 3100, color: "#3B82F6" }, { key: "Alts", value: 1900, color: "#A855F7" }] },
  { label: "Q2'", segments: [{ key: "Equities", value: 5500, color: "#00D4AA" }, { key: "Bonds", value: 2600, color: "#3B82F6" }, { key: "Alts", value: 2300, color: "#A855F7" }] },
];

// 13. Mirrored Diverging Bar
const divergingBarData = [
  { label: "US Equities",   value:  3.2 },
  { label: "EM Equities",   value: -4.8 },
  { label: "Govt Bonds",    value:  1.1 },
  { label: "Corp Credit",   value: -2.3 },
  { label: "Commodities",   value:  5.7 },
  { label: "Real Estate",   value: -1.9 },
  { label: "Private Eq.",   value:  2.8 },
  { label: "Hedge Funds",   value: -0.6 },
];

// 14. Confidence Band Range
function generateConfidenceBandData() {
  const d = [];
  let val = 300000;
  for (let i = 0; i < 24; i++) {
    const date = new Date(2024, i, 1);
    val += (Math.random() - 0.35) * 12000;
    const spread = 15000 + i * 800;
    d.push({
      date: date.toLocaleDateString("en-GB", { month: "short", year: "2-digit" }),
      value: Math.round(val),
      upper: Math.round(val + spread),
      lower: Math.round(val - spread * 0.7),
    });
  }
  return d;
}
const confidenceBandData = generateConfidenceBandData();

// 15. Overlapping Mountain Area
const mountainSeries = [
  { key: "equities", label: "Equities", color: "#00D4AA" },
  { key: "bonds",    label: "Bonds",    color: "#3B82F6" },
  { key: "crypto",   label: "Crypto",   color: "#F5A623" },
];
function generateMountainData() {
  const d = [];
  let eq = 100, bo = 100, cr = 100;
  for (let i = 0; i < 24; i++) {
    const date = new Date(2024, i, 1);
    eq += (Math.random() - 0.4) * 15;
    bo += (Math.random() - 0.45) * 6;
    cr += (Math.random() - 0.35) * 25;
    d.push({
      date: date.toLocaleDateString("en-GB", { month: "short", year: "2-digit" }),
      equities: Math.round(Math.max(eq, 50)),
      bonds: Math.round(Math.max(bo, 70)),
      crypto: Math.round(Math.max(cr, 20)),
    });
  }
  return d;
}
const mountainData = generateMountainData();

// 16. Glowing Step Line
const stepLineData = [
  { date: "Jan", value: 4.25 }, { date: "Feb", value: 4.25 },
  { date: "Mar", value: 4.50 }, { date: "Apr", value: 4.50 },
  { date: "May", value: 4.75 }, { date: "Jun", value: 4.75 },
  { date: "Jul", value: 5.00 }, { date: "Aug", value: 5.00 },
  { date: "Sep", value: 4.75 }, { date: "Oct", value: 4.50 },
  { date: "Nov", value: 4.50 }, { date: "Dec", value: 4.25 },
];

// 17. Rounded Volume Pulse
const volumePulseData = [
  { label: "Mon", value: 1240 }, { label: "Tue", value: 980 },
  { label: "Wed", value: 1850 }, { label: "Thu", value: 2100 },
  { label: "Fri", value: 1620 }, { label: "Sat", value: 420 },
  { label: "Sun", value: 280 },  { label: "Mon", value: 1340 },
  { label: "Tue", value: 1760 }, { label: "Wed", value: 2400 },
  { label: "Thu", value: 1900 }, { label: "Fri", value: 1550 },
  { label: "Sat", value: 380 },  { label: "Sun", value: 190 },
];

// 18. GitHub Contribution Heatmap
function generateContributionData() {
  const d = [];
  const today = new Date();
  for (let i = 365; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dayOfWeek = date.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const base = isWeekend ? 0.2 : 0.7;
    const count = Math.random() < base ? Math.floor(Math.random() * 12) : 0;
    d.push({ date: date.toISOString().slice(0, 10), count });
  }
  return d;
}
const contributionData = generateContributionData();

// 19. Scatter Bubble Matrix
const scatterSeriesData = [
  {
    name: "Equities",
    color: "#00D4AA",
    points: [
      { x: 18, y: 12.4, z: 250 }, { x: 22, y: 9.1, z: 180 },
      { x: 15, y: 14.2, z: 320 }, { x: 25, y: 7.8, z: 140 },
      { x: 20, y: 11.5, z: 200 },
    ],
  },
  {
    name: "Bonds",
    color: "#3B82F6",
    points: [
      { x: 5, y: 3.2, z: 300 }, { x: 7, y: 4.1, z: 220 },
      { x: 4, y: 2.8, z: 280 }, { x: 8, y: 5.2, z: 160 },
      { x: 6, y: 3.9, z: 240 },
    ],
  },
  {
    name: "Alternatives",
    color: "#A855F7",
    points: [
      { x: 12, y: 8.5, z: 150 }, { x: 14, y: 10.2, z: 190 },
      { x: 10, y: 6.8, z: 170 }, { x: 16, y: 7.2, z: 210 },
    ],
  },
];

// 20. Asymmetric Filled Radar
const asymmetricRadarData = [
  { axis: "Value",      value: 85, fullMark: 100 },
  { axis: "Growth",     value: 35, fullMark: 100 },
  { axis: "Quality",    value: 92, fullMark: 100 },
  { axis: "Momentum",   value: 48, fullMark: 100 },
  { axis: "Size",       value: 25, fullMark: 100 },
  { axis: "Volatility", value: 72, fullMark: 100 },
  { axis: "Yield",      value: 88, fullMark: 100 },
  { axis: "Liquidity",  value: 60, fullMark: 100 },
];


// =============================================================================
// LAYOUT
// =============================================================================

export function DashboardGrid() {
  return (
    <main
      className="relative min-h-screen overflow-x-hidden bg-gradient-to-br from-[#06140D] to-[#0A2416]"
      style={{ fontFamily: "Geist, sans-serif" }}
    >
      {/* ── Ambient background glow (AE adjustment layer feel) ────── */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 40% at 30% 20%, rgba(0,212,170,0.04) 0%, transparent 60%), radial-gradient(ellipse 50% 50% at 70% 80%, rgba(59,130,246,0.03) 0%, transparent 60%)",
        }}
        aria-hidden="true"
      />
      <div className="relative z-10 mx-auto max-w-[1440px] px-6 py-12">

        {/* ═══════════════════════════════════════════════════════════
            SECTION A: ORIGINAL 12 WIDGETS
            ═══════════════════════════════════════════════════════════ */}

        {/* Row 1: KPI Grid */}
        <section className="grid grid-cols-12 gap-6">
          <div className="col-span-12">
            <KpiGridWidget data={kpiGridData} />
          </div>
        </section>

        {/* Row 2: Agent Banner */}
        <section className="mt-6 grid grid-cols-12 gap-6">
          <div className="col-span-12">
            <AgentBannerWidget data={agentBannerData} />
          </div>
        </section>

        {/* Row 3: Trajectory Chart */}
        <section className="mt-8 grid grid-cols-12 gap-6">
          <div className="col-span-12">
            <TrajectoryChartWidget data={trajectoryData} footerStats={trajectoryFooterStats} />
          </div>
        </section>

        {/* Row 4: Allocation (5) + Income/Expense (7) */}
        <section className="mt-8 grid grid-cols-12 gap-6">
          <div className="col-span-12 lg:col-span-5">
            <AllocationChartWidget data={allocationData} />
          </div>
          <div className="col-span-12 lg:col-span-7">
            <IncomeExpenseChartWidget data={monthlyData} />
          </div>
        </section>

        {/* Row 5: Bento Grid */}
        <section className="mt-8 grid grid-cols-12 gap-6">
          <div className="col-span-12">
            <KpiBentoGridWidget data={kpiBentoData} title="KPI Bento Grid" />
          </div>
        </section>

        {/* Row 6: CIO Insight Banner */}
        <section className="mt-6 grid grid-cols-12 gap-6">
          <div className="col-span-12">
            <CIOInsightBannerWidget data={cioInsightData} />
          </div>
        </section>

        {/* Row 7: Correlation Heatmap (7) + Factor Radar (5) */}
        <section className="mt-8 grid grid-cols-12 gap-6">
          <div className="col-span-12 lg:col-span-7">
            <CorrelationHeatmapWidget data={correlationData} />
          </div>
          <div className="col-span-12 lg:col-span-5">
            <FactorRadarWidget data={factorRadarData} />
          </div>
        </section>

        {/* Row 8: Controls (Emerald Card + Switch + Filter) */}
        <section className="mt-8 grid grid-cols-12 gap-6">
          <div className="col-span-12 lg:col-span-4">
            <EmeraldGlassCard title="Total AUM">
              <EmeraldValue>{"$12,847,291"}</EmeraldValue>
              <EmeraldInnerPlate className="mt-4">
                <p className="text-sm leading-relaxed text-emerald-100/50">
                  {"45% equities, 30% fixed income, 15% alternatives, 10% cash."}
                </p>
              </EmeraldInnerPlate>
            </EmeraldGlassCard>
          </div>
          <div className="col-span-12 lg:col-span-4">
            <EmeraldGlassCard title="Glass Switch">
              <div className="flex flex-col items-center gap-6 pt-4">
                {["sm", "md", "lg"].map((sz) => (
                  <div key={sz} className="flex flex-col items-center gap-2">
                    <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-emerald-100/40">{sz}</span>
                    <LiquidGlassSwitchWidget size={sz} defaultChecked={sz === "lg"} />
                  </div>
                ))}
              </div>
            </EmeraldGlassCard>
          </div>
          <div className="col-span-12 lg:col-span-4">
            <EmeraldGlassCard title="Glass Filter Control">
              <div className="flex items-center justify-center pt-6 pb-4">
                <LiquidGlassFilterWidget data={filterData} />
              </div>
            </EmeraldGlassCard>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════
            SECTION B: 10 NEW ADVANCED CHART WIDGETS
            ═══════════════════════════════════════════════════════════ */}

        <div className="mt-16 mb-8">
          <h2
            className="text-center text-2xl font-bold tracking-tight text-white"
            style={{ fontFamily: "Geist, sans-serif" }}
          >
            {"Advanced Chart Library"}
          </h2>
          <p
            className="mt-2 text-center text-sm text-emerald-100/40"
            style={{ fontFamily: "Geist, sans-serif" }}
          >
            {"10 additional production-ready chart widgets"}
          </p>
        </div>

        {/* Row 9: Progress Rings (5) + Luminous Stacked Column (7) */}
        <section className="grid grid-cols-12 gap-6">
          <div className="col-span-12 lg:col-span-5">
            <ConcentricProgressRingsWidget data={progressRingsData} />
          </div>
          <div className="col-span-12 lg:col-span-7">
            <LuminousStackedColumnWidget data={luminousStackedData} title="Quarterly Returns by Asset Class" subtitle="Luminous stacked column breakdown" />
          </div>
        </section>

        {/* Row 10: Mirrored Diverging Bar (6) + Confidence Band (6) */}
        <section className="mt-8 grid grid-cols-12 gap-6">
          <div className="col-span-12 lg:col-span-6">
            <MirroredDivergingBarWidget data={divergingBarData} title="Factor Attribution" subtitle="MTD contribution by asset class" />
          </div>
          <div className="col-span-12 lg:col-span-6">
            <ConfidenceBandRangeWidget data={confidenceBandData} title="Net Worth Projection" subtitle="Central estimate with 80% confidence bands" />
          </div>
        </section>

        {/* Row 11: Overlapping Mountain (7) + Glowing Step Line (5) */}
        <section className="mt-8 grid grid-cols-12 gap-6">
          <div className="col-span-12 lg:col-span-7">
            <OverlappingMountainAreaWidget data={mountainData} series={mountainSeries} title="Relative Performance" subtitle="Indexed to 100 at inception" />
          </div>
          <div className="col-span-12 lg:col-span-5">
            <GlowingStepLineWidget data={stepLineData} title="Base Rate Trajectory" subtitle="Central bank policy rate (% p.a.)" lineColor="#F5A623" />
          </div>
        </section>

        {/* Row 12: Volume Pulse (full width) */}
        <section className="mt-8 grid grid-cols-12 gap-6">
          <div className="col-span-12">
            <RoundedVolumePulseWidget data={volumePulseData} title="Transaction Volume" subtitle="Daily trading volume intensity (2-week window)" />
          </div>
        </section>

        {/* Row 13: Contribution Heatmap (full width) */}
        <section className="mt-8 grid grid-cols-12 gap-6">
          <div className="col-span-12">
            <ContributionHeatmapWidget data={contributionData} title="Trading Activity" subtitle="Daily trade execution frequency over the past year" />
          </div>
        </section>

        {/* Row 14: Scatter Bubble (7) + Asymmetric Radar (5) */}
        <section className="mt-8 grid grid-cols-12 gap-6">
          <div className="col-span-12 lg:col-span-7">
            <ScatterBubbleMatrixWidget series={scatterSeriesData} title="Risk-Return Scatter" subtitle="Bubble size = AUM weighting" xLabel="Volatility (%)" yLabel="Annual Return (%)" />
          </div>
          <div className="col-span-12 lg:col-span-5">
            <AsymmetricFilledRadarWidget data={asymmetricRadarData} title="Portfolio Factor Profile" subtitle="Asymmetric exposure analysis" fillColor="#00D4AA" />
          </div>
        </section>

      </div>
    </main>
  );
}

export default DashboardGrid;
