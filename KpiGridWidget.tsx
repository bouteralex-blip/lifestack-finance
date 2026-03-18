"use client"

import {
  EmeraldGlassCard,
  EmeraldLabel,
  EmeraldValue,
} from "./EmeraldGlassCard"

// =============================================================================
// Types
// =============================================================================

export interface KpiItem {
  label: string
  value: string
  delta: string
  deltaType: "positive" | "negative" | "warning"
  subtext?: string
}

export interface KpiGridWidgetProps {
  data: KpiItem[]
}

// =============================================================================
// Component
// =============================================================================

export function KpiGridWidget({ data }: KpiGridWidgetProps) {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
      {data.map((kpi) => (
        <EmeraldGlassCard key={kpi.label} className="flex flex-col p-4">
          <div className="rounded-lg bg-black/30 p-2 shadow-inner">
            {/* Label */}
            <EmeraldLabel>{kpi.label}</EmeraldLabel>

            {/* Main Value */}
            <div className="mt-2">
              <EmeraldValue className="text-2xl">{kpi.value}</EmeraldValue>
            </div>

            {/* Delta Badge */}
            <div className="mt-2">
              <span
                className={`inline-block rounded px-1.5 py-0.5 font-mono text-[11px] font-medium ${
                  kpi.deltaType === "positive"
                    ? "bg-[#00E599]/10 text-[#00E599]"
                    : kpi.deltaType === "negative"
                      ? "bg-[#FF4D4D]/10 text-[#FF4D4D]"
                      : "bg-[#F5A623]/10 text-[#F5A623]"
                }`}
              >
                {kpi.delta}
              </span>
            </div>

            {/* Subtext */}
            {kpi.subtext && (
              <span className="mt-auto block pt-2 text-[10px] text-emerald-100/30">
                {kpi.subtext}
              </span>
            )}
          </div>
        </EmeraldGlassCard>
      ))}
    </div>
  )
}
