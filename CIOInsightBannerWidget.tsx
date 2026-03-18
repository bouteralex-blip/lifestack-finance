import { Zap } from "lucide-react"
import type { ReactNode } from "react"

// =============================================================================
// CIOInsightBanner -- Props & Types
// =============================================================================

export interface CIOInsightBannerData {
  /** Icon element (defaults to Zap) */
  icon?: ReactNode
  /** Badge / category label at top */
  badgeLabel: string
  /** Insight body text */
  insightText: string
  /** Confidence percentage (0-100) */
  confidence: number
  /** Accent color for left border and glow (CSS color) */
  accentColor?: string
}

export interface CIOInsightBannerWidgetProps {
  data: CIOInsightBannerData
  className?: string
}

// =============================================================================
// CIOInsightBannerWidget
// =============================================================================

export function CIOInsightBannerWidget({
  data,
  className = "",
}: CIOInsightBannerWidgetProps) {
  const {
    icon,
    badgeLabel,
    insightText,
    confidence,
    accentColor = "rgb(245, 158, 11)",
  } = data

  return (
    <div
      className={`relative flex items-start gap-4 overflow-hidden rounded-xl border border-white/10 border-l-4 p-4 md:items-center ${className}`}
      style={{
        borderLeftColor: accentColor,
        backgroundColor: "rgba(8,8,16,0.60)",
        backdropFilter: "blur(30px) saturate(1.4) brightness(1.08)",
        WebkitBackdropFilter: "blur(30px) saturate(1.4) brightness(1.08)",
        boxShadow: [
          "inset 0 1px 1px rgba(255,255,255,0.2)",
          "inset 0 -1px 1px rgba(0,0,0,0.4)",
          "0 8px 32px rgba(0,0,0,0.5)",
        ].join(", "),
      }}
    >
      {/* Glow icon */}
      <div className="flex-none">
        <div
          className="relative flex h-10 w-10 items-center justify-center rounded-lg"
          style={{ backgroundColor: `color-mix(in srgb, ${accentColor} 10%, transparent)` }}
        >
          {icon ?? <Zap className="h-5 w-5" style={{ color: accentColor }} />}
          <div
            className="pointer-events-none absolute inset-0 rounded-lg"
            style={{
              boxShadow: `0 0 16px color-mix(in srgb, ${accentColor} 25%, transparent), 0 0 40px color-mix(in srgb, ${accentColor} 8%, transparent)`,
            }}
            aria-hidden="true"
          />
        </div>
      </div>

      {/* Text content */}
      <div className="min-w-0 flex-1">
        <span
          className="text-[10px] font-bold uppercase tracking-widest"
          style={{ color: accentColor }}
        >
          {badgeLabel}
        </span>
        <p className="mt-1.5 text-sm italic leading-relaxed text-slate-300">
          {insightText}
        </p>
      </div>

      {/* Confidence badge */}
      <div className="flex-none self-center">
        <div
          className="rounded-md border border-white/10 bg-black/20 px-3 py-1.5"
          style={{ boxShadow: "inset 0 1px 4px rgba(0,0,0,0.5)" }}
        >
          <span className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
            Confidence
          </span>
          <span className="ml-1.5 font-mono text-sm font-bold text-[#F8FAFC]">
            {confidence}%
          </span>
        </div>
      </div>

      {/* Top edge highlight */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{
          background: `linear-gradient(90deg, transparent 0%, color-mix(in srgb, ${accentColor} 15%, transparent) 20%, color-mix(in srgb, ${accentColor} 5%, transparent) 80%, transparent 100%)`,
        }}
        aria-hidden="true"
      />
    </div>
  )
}
