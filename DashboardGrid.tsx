"use client"

import { KpiGridWidget } from "./KpiGridWidget"
import { AgentBannerWidget } from "./AgentBannerWidget"
import { TrajectoryChartWidget } from "./TrajectoryChartWidget"
import { AllocationChartWidget } from "./AllocationChartWidget"
import { IncomeExpenseChartWidget } from "./IncomeExpenseChartWidget"
import { LiquidGlassSwitch } from "./LiquidGlassSwitchWidget"
import { LiquidGlassToggleDemo } from "./LiquidGlassToggleWidget"
import { KpiBentoGridWidget } from "./KpiBentoGridWidget"
import { CIOInsightBannerWidget } from "./CIOInsightBannerWidget"
import {
  EmeraldGlassCard,
  EmeraldInnerPlate,
  EmeraldLabel,
  EmeraldValue,
} from "./EmeraldGlassCard"

import type { KpiItem } from "./KpiGridWidget"
import type { AgentBannerData } from "./AgentBannerWidget"
import type { TrajectoryDataPoint, TrajectoryFooterStat } from "./TrajectoryChartWidget"
import type { AllocationSlice } from "./AllocationChartWidget"
import type { MonthData } from "./IncomeExpenseChartWidget"
import type { BentoKpiItem } from "./KpiBentoGridWidget"
import type { CIOInsightBannerData } from "./CIOInsightBannerWidget"

// =============================================================================
// MOCK DATA -- all hardcoded data lives here, passed as props to widgets
// =============================================================================

const kpiData: KpiItem[] = [
  {
    label: "NET WORTH",
    value: "\u00A3362k",
    delta: "-14.2%",
    deltaType: "negative",
    subtext: "Peak: \u00A3398k",
  },
  {
    label: "6-MO RETURN",
    value: "-8.9%",
    delta: "-8.9%",
    deltaType: "negative",
  },
  {
    label: "TOTAL ASSETS",
    value: "\u00A3376k",
    delta: "+\u00A329k",
    deltaType: "positive",
  },
  {
    label: "ACTIVE RETURN",
    value: "-6.1%",
    delta: "-6.1%",
    deltaType: "negative",
    subtext: "vs MSCI World",
  },
  {
    label: "FIRE PROGRESS",
    value: "20%",
    delta: "On Track",
    deltaType: "positive",
    subtext: "Target \u00A31,800k",
  },
  {
    label: "CASH BUFFER",
    value: "2.7mo",
    delta: "Below Target",
    deltaType: "warning",
    subtext: "Target: 3.0mo",
  },
]

const agentBannerData: AgentBannerData = {
  badgeLabel: "Agent Synthesis \u2022 Late Cycle",
  insightText:
    "Macro regime has shifted to late-cycle dynamics. Yield curve re-steepening, credit spreads widening +40bps MTD. Recommend reducing duration exposure and rotating into quality factor tilts. Cash buffer below 3-month target warrants attention before Q3 rebalance window.",
  confidence: 72,
}

// -- Trajectory chart data generator --

function generateTrajectoryData(): TrajectoryDataPoint[] {
  const data: TrajectoryDataPoint[] = []
  const startDate = new Date(2024, 0, 1)
  let value = 285000

  for (let i = 0; i < 27; i++) {
    const date = new Date(startDate)
    date.setMonth(date.getMonth() + i)
    const trend = 1800
    const volatility = (Math.random() - 0.4) * 18000
    const seasonal = Math.sin(i * 0.5) * 6000
    value = Math.max(value + trend + volatility + seasonal, 240000)
    data.push({
      date: date.toLocaleDateString("en-GB", {
        month: "short",
        year: "2-digit",
      }),
      value: Math.round(value),
    })
  }

  const lastHistorical = value
  for (let i = 0; i < 9; i++) {
    const date = new Date(2026, 3 + i, 1)
    const forecastGrowth = lastHistorical * (1 + 0.008 * (i + 1))
    const forecastVolatility = Math.sin(i * 0.8) * 8000
    data.push({
      date: date.toLocaleDateString("en-GB", {
        month: "short",
        year: "2-digit",
      }),
      value: i === 0 ? Math.round(value) : (undefined as unknown as number),
      forecast: Math.round(forecastGrowth + forecastVolatility),
    })
  }

  return data
}

const trajectoryData = generateTrajectoryData()

const trajectoryFooterStats: TrajectoryFooterStat[] = [
  { label: "Current", value: "\u00A3362k", color: "text-white" },
  { label: "YTD", value: "-14.2%", color: "text-[#FF4D4D]" },
  { label: "Projected EOY", value: "\u00A3395k", color: "text-[#00E599]" },
  { label: "FIRE Target", value: "\u00A31,800k", color: "text-emerald-100/50" },
]

const allocationData: AllocationSlice[] = [
  { name: "Equities", value: 45.2, color: "#00D4AA", amount: "\u00A3163,440" },
  { name: "Fixed Income", value: 28.7, color: "#3B82F6", amount: "\u00A3103,734" },
  { name: "Real Estate", value: 10.6, color: "#F5A623", amount: "\u00A338,332" },
  { name: "Alternatives", value: 7.8, color: "#A855F7", amount: "\u00A328,210" },
  { name: "Cash", value: 7.7, color: "#64748B", amount: "\u00A327,844" },
]

const monthlyData: MonthData[] = [
  { month: "Sep", income: 8200, expenses: 4100, savings: 2800, tax: 1300 },
  { month: "Oct", income: 8400, expenses: 4300, savings: 2700, tax: 1400 },
  { month: "Nov", income: 8100, expenses: 5200, savings: 1600, tax: 1300 },
  { month: "Dec", income: 9800, expenses: 6100, savings: 2200, tax: 1500 },
  { month: "Jan", income: 8300, expenses: 4400, savings: 2600, tax: 1300 },
  { month: "Feb", income: 8500, expenses: 3900, savings: 3200, tax: 1400 },
  { month: "Mar", income: 8700, expenses: 4200, savings: 3100, tax: 1400 },
]

// -- CIO Insight Banner data --

const cioInsightData: CIOInsightBannerData = {
  badgeLabel: "Agent Synthesis \u2022 Late Cycle",
  insightText:
    "Macro regime has shifted to late-cycle dynamics. Yield curve re-steepening, credit spreads widening +40bps MTD. Recommend reducing duration exposure and rotating into quality factor tilts. Cash buffer below 3-month target warrants attention before Q3 rebalance window.",
  confidence: 72,
}

// -- Bento KPI Grid data --

const bentoKpiData: BentoKpiItem[] = [
  {
    label: "NET WORTH",
    value: "\u00A3362k",
    delta: "-14.2%",
    deltaType: "negative",
    subtext: "Peak: \u00A3398k",
  },
  {
    label: "6-MO RETURN",
    value: "-8.9%",
    delta: "-8.9%",
    deltaType: "negative",
  },
  {
    label: "TOTAL ASSETS",
    value: "\u00A3376k",
    delta: "+\u00A329k",
    deltaType: "positive",
  },
  {
    label: "ACTIVE RETURN",
    value: "-6.1%",
    delta: "-6.1%",
    deltaType: "negative",
    subtext: "vs MSCI World",
  },
  {
    label: "FIRE PROGRESS",
    value: "20%",
    delta: "20%",
    deltaType: "positive",
    subtext: "Target \u00A31,800k",
  },
  {
    label: "CASH BUFFER",
    value: "2.7mo",
    delta: "vs 3.0 target",
    deltaType: "warning",
  },
]

// =============================================================================
// DashboardGrid -- Layout Component
//
// Imports all widgets and arranges them in the dashboard CSS grid.
// All mock data is defined above and passed down as props.
// =============================================================================

export function DashboardGrid() {
  return (
    <main className="relative min-h-screen overflow-x-hidden">
      {/* ================================================================
          BACKGROUND: Deep forest emerald
          ================================================================ */}
      <div className="fixed inset-0 -z-10" aria-hidden="true">
        <div className="absolute inset-0 bg-gradient-to-br from-[#06140D] to-[#0A2416]" />

        {/* Dappled light patches */}
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse 90% 70% at 20% 15%, rgba(18,70,42,0.95) 0%, transparent 65%),
              radial-gradient(ellipse 70% 55% at 75% 25%, rgba(8,52,32,0.90) 0%, transparent 60%),
              radial-gradient(ellipse 65% 60% at 45% 75%, rgba(14,58,38,0.85) 0%, transparent 55%),
              radial-gradient(ellipse 25% 20% at 30% 20%, rgba(0,212,170,0.06) 0%, transparent 70%),
              radial-gradient(ellipse 20% 25% at 70% 40%, rgba(80,180,120,0.04) 0%, transparent 65%),
              radial-gradient(ellipse 30% 18% at 50% 65%, rgba(0,229,153,0.04) 0%, transparent 60%)
            `,
          }}
        />

        {/* Organic noise texture */}
        <div
          className="absolute inset-0 opacity-[0.10]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='t'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.025' numOctaves='6' seed='5' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23t)'/%3E%3C/svg%3E")`,
            backgroundSize: "512px 512px",
            mixBlendMode: "soft-light",
          }}
        />

        {/* Film grain */}
        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.7' numOctaves='3' seed='8' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23g)'/%3E%3C/svg%3E")`,
            backgroundSize: "256px 256px",
          }}
        />

        {/* Vignette */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 85% 75% at 50% 50%, transparent 40%, rgba(4,12,6,0.6) 100%)",
          }}
        />
      </div>

      {/* ================================================================
          CONTENT
          ================================================================ */}
      <div className="relative z-10">
        {/* Hero */}
        <header className="flex flex-col items-center justify-center px-6 py-20">
          <div className="max-w-3xl text-center">
            <h1 className="text-balance font-sans text-5xl font-bold tracking-tight text-white md:text-6xl lg:text-7xl">
              Liquid Glass
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-pretty font-sans text-lg leading-relaxed text-emerald-100/50 md:text-xl">
              Ultra-premium volumetric glassmorphism for dark-mode financial
              dashboards. Deep emerald glass with Fresnel rim lighting,
              opposite-side glare, and recessed stabilization scrims.
            </p>
          </div>
        </header>

        {/* ==============================================================
            EXECUTIVE SUMMARY SECTION
            ============================================================== */}
        <section className="mx-auto max-w-7xl px-6">
          <h2 className="mb-8 font-sans text-2xl font-bold tracking-tight text-white md:text-3xl">
            Executive Summary
          </h2>

          {/* 1. KPI Grid */}
          <KpiGridWidget data={kpiData} />

          {/* 2. Agent Synthesis Banner */}
          <div className="mt-6">
            <AgentBannerWidget data={agentBannerData} />
          </div>

          {/* 3. Net Worth Trajectory + Forecast Chart */}
          <div className="mt-8">
            <TrajectoryChartWidget
              data={trajectoryData}
              footerStats={trajectoryFooterStats}
            />
          </div>
        </section>

        {/* ==============================================================
            EMERALD GLASS SHOWCASE
            ============================================================== */}
        <section className="mx-auto max-w-7xl px-6 pt-20">
          <h2 className="mb-8 font-sans text-2xl font-bold tracking-tight text-white md:text-3xl">
            Emerald Glass Components
          </h2>

          {/* AUM Demo Card */}
          <div className="mb-8 max-w-xl">
            <EmeraldGlassCard>
              <EmeraldLabel>Total Assets Under Management</EmeraldLabel>
              <div className="mt-2">
                <EmeraldValue>$12,847,291</EmeraldValue>
              </div>
              <EmeraldInnerPlate className="mt-5">
                <p className="text-sm leading-relaxed text-emerald-100/50">
                  Portfolio composition: 45% equities, 30% fixed income, 15%
                  alternatives, 10% cash equivalents. Rebalanced quarterly with
                  a target Sharpe ratio of 1.8+.
                </p>
              </EmeraldInnerPlate>
            </EmeraldGlassCard>
          </div>

          {/* Liquid Glass Switch Demo */}
          <section className="mx-auto max-w-3xl px-6 pb-20">
            <h2 className="mb-2 text-balance text-center font-sans text-2xl font-bold text-[#F8FAFC]">
              Liquid Glass Switch
            </h2>
            <p className="mx-auto mb-10 max-w-lg text-pretty text-center text-sm text-[#94A3B8]">
              Framer Motion spring-animated glass thumb on a recessed material track.
              The thumb uses the exact volumetric bevel shadow spec.
            </p>
            <div className="flex flex-col items-center gap-10">
              {(["sm", "md", "lg"] as const).map((sz) => (
                <div key={sz} className="flex flex-col items-center gap-3">
                  <span className="font-sans text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-100/40">
                    {sz}
                  </span>
                  <div
                    className="flex items-center justify-center rounded-2xl p-10"
                    style={{
                      backgroundColor: "rgba(11,42,28,0.30)",
                      boxShadow:
                        "inset 0 1px 3px rgba(0,0,0,0.5), 0 0.5px 0 rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.05)",
                    }}
                  >
                    <LiquidGlassSwitch size={sz} defaultChecked={sz === "lg"} />
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Liquid Glass Toggle Demo */}
          <section className="mx-auto max-w-3xl px-6 pb-20">
            <h2 className="mb-2 text-balance text-center font-sans text-2xl font-bold text-[#F8FAFC]">
              Liquid Glass Toggle
            </h2>
            <p className="mx-auto mb-10 max-w-lg text-pretty text-center text-sm text-[#94A3B8]">
              Large light/dark toggle with volumetric glass knob, Fresnel conic rim,
              S-curve junction shadow, and bottom caustic crescent.
            </p>
            <LiquidGlassToggleDemo defaultDark />
          </section>
        </section>

        {/* ==============================================================
            CIO INSIGHT BANNER (standalone)
            ============================================================== */}
        <section className="mx-auto max-w-7xl px-6 py-8">
          <h2 className="mb-6 font-sans text-2xl font-bold tracking-tight text-white md:text-3xl">
            CIO Insight Banner
          </h2>
          <CIOInsightBannerWidget data={cioInsightData} />
        </section>

        {/* ==============================================================
            KPI BENTO GRID (standalone)
            ============================================================== */}
        <section className="mx-auto max-w-7xl px-6 py-8">
          <KpiBentoGridWidget data={bentoKpiData} title="KPI Bento Grid" />
        </section>

        {/* ==============================================================
            ADDITIONAL CHARTS
            ============================================================== */}
        <section className="mx-auto max-w-7xl px-6 py-16">
          <div className="grid gap-8 lg:grid-cols-5">
            <div className="lg:col-span-2">
              <AllocationChartWidget data={allocationData} />
            </div>
            <div className="lg:col-span-3">
              <IncomeExpenseChartWidget data={monthlyData} />
            </div>
          </div>
        </section>

        <div className="h-24" />
      </div>
    </main>
  )
}
