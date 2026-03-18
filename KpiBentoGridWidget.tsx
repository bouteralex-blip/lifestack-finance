"use client"

import {
  LiquidGlassCard,
  CardMetric,
} from "./LiquidGlassCard"

// =============================================================================
// KpiBentoGrid -- Props & Types
// =============================================================================

export interface BentoKpiItem {
  /** Short KPI label displayed at top */
  label: string
  /** Formatted main value */
  value: string
  /** Delta text shown in badge */
  delta: string
  /** Semantic type drives badge color */
  deltaType: "positive" | "negative" | "warning"
  /** Optional subtext below value */
  subtext?: string
}

export interface KpiBentoGridWidgetProps {
  /** Array of KPI items to render */
  data: BentoKpiItem[]
  /** Optional section title */
  title?: string
  /** Optional className for the grid wrapper */
  className?: string
}

// =============================================================================
// DeltaBadge (internal)
// =============================================================================

function DeltaBadge({
  delta,
  type,
}: {
  delta: string
  type: "positive" | "negative" | "warning"
}) {
  const styles = {
    positive: "bg-teal-500/20 text-teal-400",
    negative: "bg-rose-500/20 text-rose-400",
    warning: "bg-amber-500/20 text-amber-400",
  }

  return (
    <span
      className={`inline-block rounded-md px-2 py-0.5 font-mono text-xs font-medium ${styles[type]}`}
    >
      {delta}
    </span>
  )
}

// =============================================================================
// KpiBentoGridWidget
// =============================================================================

export function KpiBentoGridWidget({
  data,
  title,
  className = "",
}: KpiBentoGridWidgetProps) {
  return (
    <section className={className}>
      {title && (
        <h2 className="mb-8 font-sans text-2xl font-bold tracking-tight text-[#F8FAFC] md:text-3xl">
          {title}
        </h2>
      )}

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        {data.map((kpi) => (
          <LiquidGlassCard
            key={kpi.label}
            edgeThickness={1.2}
            cornerHighlight={0.6}
            blur={16}
            backlightColor={
              kpi.deltaType === "positive"
                ? "0,212,170"
                : kpi.deltaType === "negative"
                  ? "255,92,122"
                  : "245,166,35"
            }
            backlightIntensity={0.05}
            className="flex flex-col"
          >
            {/* Label */}
            <span className="text-xs uppercase tracking-wide text-slate-400 opacity-50">
              {kpi.label}
            </span>

            {/* Main Number + Delta */}
            <div className="mt-2 flex flex-col gap-1.5">
              <CardMetric className="text-[28px] leading-none lg:text-[32px]">
                {kpi.value}
              </CardMetric>
              <DeltaBadge delta={kpi.delta} type={kpi.deltaType} />
            </div>

            {/* Subtext */}
            {kpi.subtext && (
              <span className="mt-auto pt-2 text-[11px] text-slate-500 opacity-30">
                {kpi.subtext}
              </span>
            )}
          </LiquidGlassCard>
        ))}
      </div>
    </section>
  )
}
