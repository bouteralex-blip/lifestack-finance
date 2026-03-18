"use client"

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts"
import {
  LiquidGlassCard,
  CardLabel,
  CardMetric,
} from "./LiquidGlassCard"

// =============================================================================
// Types
// =============================================================================

export interface AllocationSlice {
  name: string
  value: number
  color: string
  amount: string
}

export interface AllocationChartWidgetProps {
  data: AllocationSlice[]
  totalLabel?: string
  totalValue?: string
}

// =============================================================================
// Custom Glass Tooltip (internal)
// =============================================================================

function GlassTooltip({
  active,
  payload,
}: {
  active?: boolean
  payload?: Array<{ payload: AllocationSlice }>
}) {
  if (!active || !payload?.length) return null

  const d = payload[0].payload

  return (
    <div
      className="relative overflow-hidden rounded-xl border border-white/10"
      style={{
        backgroundColor: "rgba(255,255,255,0.06)",
        backdropFilter: "blur(20px) saturate(1.3) brightness(1.08)",
        WebkitBackdropFilter: "blur(20px) saturate(1.3) brightness(1.08)",
        boxShadow: [
          "inset 0 1px 1px rgba(255,255,255,0.2)",
          "inset 0 -1px 1px rgba(0,0,0,0.4)",
          "0 8px 32px rgba(0,0,0,0.5)",
          "0 0 60px rgba(0,0,0,0.15)",
        ].join(", "),
      }}
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 40%)",
        }}
      />
      <div className="relative z-10 px-4 py-3">
        <div className="flex items-center gap-2">
          <div
            className="h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: d.color }}
          />
          <span className="font-sans text-xs text-[#94A3B8]">{d.name}</span>
        </div>
        <div className="mt-1.5 flex items-baseline gap-2">
          <span className="font-mono text-lg font-bold text-[#F8FAFC]">
            {d.value}%
          </span>
          <span className="font-mono text-xs text-[#94A3B8]">{d.amount}</span>
        </div>
      </div>
    </div>
  )
}

// =============================================================================
// Component
// =============================================================================

export function AllocationChartWidget({
  data,
  totalLabel = "Total AUM",
  totalValue = "\u00A3361,560",
}: AllocationChartWidgetProps) {
  return (
    <LiquidGlassCard
      edgeThickness={1.5}
      cornerHighlight={0.7}
      blur={18}
      backlightColor="0,212,170"
      backlightIntensity={0.05}
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-sans text-xs font-semibold uppercase tracking-[0.15em] text-[#94A3B8]">
            Asset Allocation
          </h3>
          <p className="mt-1 font-sans text-[11px] text-[#94A3B8] opacity-50">
            Portfolio distribution by asset class
          </p>
        </div>
        <div className="text-right">
          <CardLabel>{totalLabel}</CardLabel>
          <CardMetric className="mt-0.5 block text-xl">{totalValue}</CardMetric>
        </div>
      </div>

      {/* Donut chart */}
      <div className="mx-auto mt-4 h-[220px] w-full max-w-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={95}
              paddingAngle={3}
              dataKey="value"
              stroke="none"
              cornerRadius={4}
            >
              {data.map((entry) => (
                <Cell
                  key={entry.name}
                  fill={entry.color}
                  style={{
                    filter: `drop-shadow(0 0 4px ${entry.color}40)`,
                  }}
                />
              ))}
            </Pie>
            <Tooltip content={<GlassTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Legend rows */}
      <div className="mt-2 flex flex-col gap-2">
        {data.map((item) => (
          <div key={item.name} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className="h-2 w-2 rounded-full"
                style={{
                  backgroundColor: item.color,
                  boxShadow: `0 0 6px ${item.color}50`,
                }}
              />
              <span className="font-sans text-xs text-[#94A3B8]">
                {item.name}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs text-[#F8FAFC]">
                {item.value}%
              </span>
              <span className="font-mono text-[11px] text-[#94A3B8] opacity-50">
                {item.amount}
              </span>
            </div>
          </div>
        ))}
      </div>
    </LiquidGlassCard>
  )
}
