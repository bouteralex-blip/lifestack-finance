"use client"

import { useState } from "react"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts"
import {
  EmeraldGlassCard,
  EmeraldInnerPlate,
  EmeraldLabel,
} from "./EmeraldGlassCard"

// =============================================================================
// Types
// =============================================================================

export interface TrajectoryDataPoint {
  date: string
  value: number
  forecast?: number
}

export interface TrajectoryFooterStat {
  label: string
  value: string
  color: string
}

export interface TrajectoryChartWidgetProps {
  data: TrajectoryDataPoint[]
  footerStats: TrajectoryFooterStat[]
  /** Title shown above the chart */
  title?: string
  /** Subtitle shown below the title */
  subtitle?: string
}

// =============================================================================
// Time Range Filter (internal)
// =============================================================================

type TimeRange = "1M" | "3M" | "6M" | "YTD" | "1Y" | "ALL"

function filterByRange(data: TrajectoryDataPoint[], range: TimeRange): TrajectoryDataPoint[] {
  const len = data.length
  switch (range) {
    case "1M":
      return data.slice(Math.max(0, len - 2))
    case "3M":
      return data.slice(Math.max(0, len - 4))
    case "6M":
      return data.slice(Math.max(0, len - 7))
    case "YTD":
      return data.slice(Math.max(0, len - 12))
    case "1Y":
      return data.slice(Math.max(0, len - 13))
    case "ALL":
    default:
      return data
  }
}

const timeRanges: TimeRange[] = ["1M", "3M", "6M", "YTD", "1Y", "ALL"]

// =============================================================================
// Glass Tooltip (internal)
// =============================================================================

function MintGlassTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: Array<{ value: number; dataKey: string }>
  label?: string
}) {
  if (!active || !payload?.length) return null

  const mainValue = payload.find((p) => p.dataKey === "value")
  const forecastValue = payload.find((p) => p.dataKey === "forecast")
  const displayValue = mainValue?.value ?? forecastValue?.value

  return (
    <div
      className="overflow-hidden rounded-xl border border-white/10"
      style={{
        backgroundColor: "rgba(11,42,28,0.60)",
        backdropFilter: "blur(20px) saturate(1.3)",
        WebkitBackdropFilter: "blur(20px) saturate(1.3)",
        boxShadow: [
          "inset 0 1px 1px rgba(255,255,255,0.2)",
          "inset 0 -1px 1px rgba(0,0,0,0.4)",
          "0 8px 32px rgba(0,0,0,0.5)",
        ].join(", "),
      }}
    >
      <div className="px-4 py-3">
        <span className="block text-[11px] uppercase tracking-widest text-emerald-100/50">
          {label}
        </span>
        <span className="mt-1 block font-mono text-lg font-bold text-white">
          {displayValue != null
            ? `\u00A3${displayValue.toLocaleString("en-GB")}`
            : "--"}
        </span>
        {forecastValue && !mainValue && (
          <span className="mt-0.5 block text-[10px] uppercase tracking-wider text-emerald-100/40">
            Forecast
          </span>
        )}
      </div>
    </div>
  )
}

// =============================================================================
// Y-axis Formatter (internal)
// =============================================================================

function formatYAxis(value: number): string {
  if (value >= 1_000_000) return `\u00A3${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000) return `\u00A3${(value / 1_000).toFixed(0)}k`
  return `\u00A3${value}`
}

// =============================================================================
// Main Component
// =============================================================================

export function TrajectoryChartWidget({
  data,
  footerStats,
  title = "Net Worth Trajectory + Forecast",
  subtitle = "Historical performance with projected growth trajectory",
}: TrajectoryChartWidgetProps) {
  const [activeRange, setActiveRange] = useState<TimeRange>("ALL")
  const filteredData = filterByRange(data, activeRange)

  const lastHistoricalIndex = data.findIndex(
    (d) => d.forecast !== undefined && d.value !== undefined
  )
  const lastHistoricalDate =
    lastHistoricalIndex >= 0 ? data[lastHistoricalIndex].date : null

  return (
    <EmeraldGlassCard>
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <EmeraldLabel>{title}</EmeraldLabel>
          <p className="mt-1 text-[11px] text-emerald-100/30">
            {subtitle}
          </p>
        </div>

        {/* Time filter pills */}
        <div className="flex gap-1.5">
          {timeRanges.map((range) => (
            <button
              key={range}
              onClick={() => setActiveRange(range)}
              className={`rounded-md px-3 py-1 font-mono text-xs font-medium transition-all ${
                activeRange === range
                  ? "bg-black/20 text-white shadow-[inset_0_1px_4px_rgba(0,0,0,0.5)]"
                  : "bg-white/5 text-emerald-100/50 hover:bg-white/10 hover:text-white"
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Chart inside the Inner Stabilized Plate */}
      <EmeraldInnerPlate className="mt-6">
        <div className="h-[360px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={filteredData}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient
                  id="mintGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="0%" stopColor="#00E599" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#00E599" stopOpacity={0} />
                </linearGradient>
                <linearGradient
                  id="mintForecastGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="0%" stopColor="#00E599" stopOpacity={0.12} />
                  <stop offset="100%" stopColor="#00E599" stopOpacity={0} />
                </linearGradient>
              </defs>

              <CartesianGrid
                horizontal={true}
                vertical={false}
                stroke="rgba(255,255,255,0.04)"
              />

              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{
                  fill: "rgba(255,255,255,0.35)",
                  fontSize: 11,
                  fontFamily: "var(--font-mono, monospace)",
                }}
                interval="preserveStartEnd"
                dy={8}
              />

              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{
                  fill: "rgba(255,255,255,0.35)",
                  fontSize: 11,
                  fontFamily: "var(--font-mono, monospace)",
                }}
                tickFormatter={formatYAxis}
                width={60}
                dx={-4}
              />

              <Tooltip
                content={<MintGlassTooltip />}
                cursor={{
                  stroke: "rgba(255,255,255,0.08)",
                  strokeWidth: 1,
                  strokeDasharray: "4 4",
                }}
              />

              {lastHistoricalDate && activeRange === "ALL" && (
                <ReferenceLine
                  x={lastHistoricalDate}
                  stroke="rgba(255,255,255,0.08)"
                  strokeDasharray="6 4"
                  label={{
                    value: "Now",
                    position: "insideTopRight",
                    fill: "rgba(255,255,255,0.35)",
                    fontSize: 10,
                    fontFamily: "var(--font-mono, monospace)",
                  }}
                />
              )}

              {/* Historical area -- Neon Mint */}
              <Area
                type="monotone"
                dataKey="value"
                stroke="#00E599"
                strokeWidth={2}
                fill="url(#mintGradient)"
                dot={false}
                activeDot={{
                  r: 4,
                  fill: "#00E599",
                  stroke: "rgba(0,229,153,0.3)",
                  strokeWidth: 8,
                }}
                style={{
                  filter: "drop-shadow(0px 0px 6px rgba(0,229,153,0.4))",
                }}
                connectNulls={false}
              />

              {/* Forecast area */}
              <Area
                type="monotone"
                dataKey="forecast"
                stroke="#00E599"
                strokeWidth={2}
                strokeDasharray="6 4"
                fill="url(#mintForecastGradient)"
                dot={false}
                activeDot={{
                  r: 4,
                  fill: "#00E599",
                  stroke: "rgba(0,229,153,0.3)",
                  strokeWidth: 8,
                }}
                style={{
                  filter: "drop-shadow(0px 0px 4px rgba(0,229,153,0.2))",
                  opacity: 0.7,
                }}
                connectNulls={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </EmeraldInnerPlate>

      {/* Footer stats inside scrim plates */}
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {footerStats.map((stat) => (
          <EmeraldInnerPlate key={stat.label} className="p-2">
            <EmeraldLabel>{stat.label}</EmeraldLabel>
            <span
              className={`mt-0.5 block font-mono text-sm font-bold ${stat.color}`}
            >
              {stat.value}
            </span>
          </EmeraldInnerPlate>
        ))}
      </div>
    </EmeraldGlassCard>
  )
}
