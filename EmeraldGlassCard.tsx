"use client"

import { cn } from "@/lib/utils"
import { type ReactNode } from "react"

// =============================================================================
// EmeraldGlassCard
//
// Ultra-premium volumetric liquid glass wrapper with deep emerald tint.
// Uses the exact "secret sauce" Tailwind shadow tokens for glass thickness:
//
//   VOLUMETRIC BEVEL:
//     inset 0 1px 1px rgba(255,255,255,0.2)  -- top inner Fresnel highlight
//     inset 0 -1px 1px rgba(0,0,0,0.4)       -- bottom inner depth shadow
//     0 12px 40px rgba(0,0,0,0.5)             -- deep floating elevation
//
//   INNER STABILIZED PLATE (Scrim):
//     bg-black/20 shadow-[inset_0_1px_3px_rgba(0,0,0,0.5)]
//     border border-white/5
//
// Usage:
//   <EmeraldGlassCard title="My Section">
//     <p>Any content...</p>
//   </EmeraldGlassCard>
//
//   <EmeraldGlassCard>
//     <EmeraldLabel>TOTAL AUM</EmeraldLabel>
//     <EmeraldValue>$12,847,291</EmeraldValue>
//   </EmeraldGlassCard>
// =============================================================================

export interface EmeraldGlassCardProps {
  children: ReactNode
  className?: string
  /** Optional title rendered above children in EmeraldLabel style */
  title?: string
}

export interface EmeraldInnerPlateProps {
  children: ReactNode
  className?: string
}

export interface EmeraldTypographyProps {
  children: ReactNode
  className?: string
}

export function EmeraldGlassCard({ children, className, title }: EmeraldGlassCardProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-white/10 bg-[#0B2A1C]/30 p-5 backdrop-blur-xl",
        "shadow-[inset_0_1px_1px_rgba(255,255,255,0.3),inset_0_-1px_1px_rgba(0,0,0,0.4),0_12px_40px_rgba(0,0,0,0.5)]",
        className
      )}
    >
      {/* Fresnel rim -- conic gradient masked to border perimeter */}
      <div
        className="pointer-events-none absolute inset-0 rounded-2xl"
        style={{
          background: `conic-gradient(
            from 315deg at 50% 50%,
            rgba(255,255,255,0.50) 0deg,
            rgba(255,255,255,0.30) 45deg,
            rgba(255,255,255,0.06) 90deg,
            rgba(255,255,255,0.03) 135deg,
            rgba(255,255,255,0.24) 180deg,
            rgba(255,255,255,0.16) 225deg,
            rgba(255,255,255,0.03) 270deg,
            rgba(255,255,255,0.12) 315deg,
            rgba(255,255,255,0.50) 360deg
          )`,
          mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          maskComposite: "exclude",
          WebkitMaskComposite: "xor",
          padding: "1.5px",
        }}
        aria-hidden="true"
      />

      {/* Primary glare sweep (top-left) */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(325deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.04) 15%, rgba(255,255,255,0.01) 28%, transparent 45%)",
        }}
        aria-hidden="true"
      />

      {/* Opposite-side glare (bottom-right, 80% intensity) */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(145deg, transparent 55%, rgba(255,255,255,0.02) 70%, rgba(255,255,255,0.05) 85%, rgba(255,255,255,0.03) 100%)",
        }}
        aria-hidden="true"
      />

      {/* Corner hotspots */}
      <div
        className="pointer-events-none absolute left-0 top-0 h-1/2 w-1/2"
        style={{
          background:
            "radial-gradient(ellipse at 0% 0%, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.06) 25%, transparent 60%)",
        }}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute bottom-0 right-0 h-[35%] w-[35%]"
        style={{
          background:
            "radial-gradient(ellipse at 100% 100%, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0.04) 25%, transparent 55%)",
        }}
        aria-hidden="true"
      />

      {/* Top edge highlight line */}
      <div
        className="pointer-events-none absolute left-[8%] right-[35%] top-0"
        style={{
          height: "1px",
          background:
            "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.6) 15%, rgba(255,255,255,0.85) 40%, rgba(255,255,255,0.35) 70%, transparent 100%)",
          filter: "blur(0.3px)",
        }}
        aria-hidden="true"
      />

      {/* Left edge highlight line */}
      <div
        className="pointer-events-none absolute bottom-[35%] left-0 top-[8%]"
        style={{
          width: "1px",
          background:
            "linear-gradient(180deg, transparent 0%, rgba(255,255,255,0.45) 15%, rgba(255,255,255,0.65) 40%, rgba(255,255,255,0.25) 70%, transparent 100%)",
          filter: "blur(0.3px)",
        }}
        aria-hidden="true"
      />

      {/* Surface noise */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.012]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: "256px 256px",
        }}
        aria-hidden="true"
      />

      {/* Content */}
      <div className="relative z-10">
        {title && (
          <EmeraldLabel className="mb-3 block">{title}</EmeraldLabel>
        )}
        {children}
      </div>
    </div>
  )
}

// =============================================================================
// EmeraldInnerPlate -- Stabilized content scrim
// bg-black/20 rounded-xl shadow-[inset_0_1px_3px_rgba(0,0,0,0.5)]
// border border-white/5
// =============================================================================

export function EmeraldInnerPlate({ children, className }: EmeraldInnerPlateProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-white/5 bg-black/20 p-3 shadow-[inset_0_1px_3px_rgba(0,0,0,0.5)]",
        className
      )}
    >
      {children}
    </div>
  )
}

// =============================================================================
// Emerald Typography Helpers
// =============================================================================

export function EmeraldLabel({ children, className }: EmeraldTypographyProps) {
  return (
    <span
      className={cn(
        "text-[11px] font-sans font-medium uppercase tracking-widest text-emerald-100/60",
        className
      )}
    >
      {children}
    </span>
  )
}

export function EmeraldValue({ children, className }: EmeraldTypographyProps) {
  return (
    <span
      className={cn(
        "font-mono text-3xl font-medium tracking-tight text-white",
        className
      )}
    >
      {children}
    </span>
  )
}
