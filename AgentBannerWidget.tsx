"use client"

import { Zap } from "lucide-react"

// =============================================================================
// Types
// =============================================================================

export interface AgentBannerData {
  /** Badge label e.g. "Agent Synthesis \u2022 Late Cycle" */
  badgeLabel: string
  /** Main insight text */
  insightText: string
  /** Confidence percentage 0-100 */
  confidence: number
}

export interface AgentBannerWidgetProps {
  data: AgentBannerData
}

// =============================================================================
// Component
// =============================================================================

export function AgentBannerWidget({ data }: AgentBannerWidgetProps) {
  return (
    <div
      className="flex items-start gap-4 rounded-r-xl border-l-4 border-l-[#F5A623] bg-black/30 p-4 backdrop-blur-2xl md:items-center"
      style={{
        boxShadow: [
          "inset 0 1px 1px rgba(255,255,255,0.1)",
          "inset 0 -1px 1px rgba(0,0,0,0.3)",
          "0 8px 32px rgba(0,0,0,0.4)",
        ].join(", "),
      }}
    >
      {/* Lightning bolt icon */}
      <div className="flex-none">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#F5A623]/10"
          style={{
            boxShadow:
              "0 0 16px rgba(245,166,35,0.2), 0 0 40px rgba(245,166,35,0.06)",
          }}
        >
          <Zap className="h-5 w-5 text-[#F5A623]" />
        </div>
      </div>

      {/* Text content */}
      <div className="min-w-0 flex-1">
        <div className="rounded-lg bg-black/30 p-2 shadow-inner">
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#F5A623]">
            {data.badgeLabel}
          </span>
          <p className="mt-1.5 text-sm italic leading-relaxed text-emerald-50/80">
            {data.insightText}
          </p>
        </div>
      </div>

      {/* Confidence badge */}
      <div className="flex-none self-center">
        <div
          className="rounded-md border border-white/5 bg-black/20 px-3 py-1.5"
          style={{ boxShadow: "inset 0 1px 4px rgba(0,0,0,0.5)" }}
        >
          <span className="text-[10px] font-medium uppercase tracking-wider text-emerald-100/50">
            Confidence
          </span>
          <span className="ml-1.5 font-mono text-sm font-bold text-white">
            {data.confidence}%
          </span>
        </div>
      </div>
    </div>
  )
}
