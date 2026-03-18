"use client"

import { cn } from "@/lib/utils"
import { type ReactNode } from "react"

// =============================================================================
// LiquidGlassCard
//
// Parametric volumetric glass card with configurable edge thickness,
// light angle, corner highlights, blur, and backlight glow.
//
// VOLUMETRIC GLASS recipe -- the "thick glass" bevel is achieved via
// layered inset shadows:
//
//   CORE BEVEL:
//     inset 0 1px 1px rgba(255,255,255,0.2)   -- top inner highlight
//     inset 0 -1px 1px rgba(0,0,0,0.4)         -- bottom inner depth
//
//   DEPTH SHADOW:
//     0 8px 32px rgba(0,0,0,0.5)               -- floating elevation
//
//   + Fresnel rim, corner hotspots, edge lines, backlight glow
// =============================================================================

export interface LiquidGlassCardProps {
  children: ReactNode
  className?: string
  /** Optional title rendered as CardLabel above children */
  title?: string
  /** Fresnel edge thickness in px (default: 1.5) */
  edgeThickness?: number
  /** Light source angle in degrees (default: 315) */
  lightAngle?: number
  /** Corner hotspot intensity 0-1 (default: 0.7) */
  cornerHighlight?: number
  /** Backdrop blur in px (default: 18) */
  blur?: number
  /** RGB string for backlight glow, e.g. "0,212,170" */
  backlightColor?: string
  /** Backlight opacity 0-1 (default: 0.07) */
  backlightIntensity?: number
}

export interface InnerPlateProps {
  children: ReactNode
  className?: string
}

export interface TypographyProps {
  children: ReactNode
  className?: string
}

export function LiquidGlassCard({
  children,
  className,
  title,
  edgeThickness = 1.5,
  lightAngle = 315,
  cornerHighlight = 0.7,
  blur = 18,
  backlightColor = "255,255,255",
  backlightIntensity = 0.07,
}: LiquidGlassCardProps) {
  const lightRad = (lightAngle * Math.PI) / 180
  const lx = Math.cos(lightRad)
  const ly = Math.sin(lightRad)
  const olx = -lx
  const oly = -ly

  return (
    <div className={cn("relative", className)}>
      {/* LAYER 0: Backlight glow */}
      <div
        className="pointer-events-none absolute -inset-[30%] -z-10"
        style={{
          background: `radial-gradient(
            ellipse 55% 60% at 50% 55%,
            rgba(${backlightColor}, ${backlightIntensity}) 0%,
            rgba(${backlightColor}, ${backlightIntensity * 0.5}) 30%,
            rgba(${backlightColor}, ${backlightIntensity * 0.15}) 55%,
            transparent 75%
          )`,
          filter: "blur(20px)",
        }}
        aria-hidden="true"
      />

      {/* MAIN GLASS CARD */}
      <div
        className="group relative overflow-hidden rounded-[20px]"
        style={{
          boxShadow: [
            // ======= VOLUMETRIC EDGE (the "secret sauce") =======
            "inset 0 1px 1px rgba(255,255,255,0.2)",
            "inset 0 -1px 1px rgba(0,0,0,0.4)",
            "0 8px 32px rgba(0,0,0,0.5)",
            // ======= ADDITIONAL DEPTH =======
            "0 0 80px rgba(0,0,0,0.15)",
            "0 2px 4px rgba(0,0,0,0.4)",
            // ======= FRESNEL RIMS (light-side) =======
            `inset ${lx * edgeThickness}px ${ly * edgeThickness}px ${edgeThickness * 0.3}px rgba(255,255,255,0.45)`,
            `inset ${lx * edgeThickness * 0.3}px ${ly * edgeThickness * 0.3}px ${edgeThickness * 3}px rgba(255,255,255,0.06)`,
            // ======= FRESNEL RIMS (opposite-side 80%) =======
            `inset ${olx * edgeThickness * 0.8}px ${oly * edgeThickness * 0.8}px ${edgeThickness * 0.3}px rgba(255,255,255,0.30)`,
            `inset ${olx * edgeThickness * 0.25}px ${oly * edgeThickness * 0.25}px ${edgeThickness * 2}px rgba(255,255,255,0.035)`,
            // ======= VOLUMETRIC THICKNESS (dark side depth) =======
            `inset 0 ${-ly * edgeThickness * 2}px ${edgeThickness * 3}px rgba(0,0,0,0.18)`,
          ].join(", "),
        }}
      >
        {/* Layer 1: Glass surface */}
        <div
          className="absolute inset-0"
          style={{
            backgroundColor: "rgba(255,255,255,0.03)",
            backdropFilter: `blur(${blur}px) saturate(1.4) brightness(1.08)`,
            WebkitBackdropFilter: `blur(${blur}px) saturate(1.4) brightness(1.08)`,
          }}
        />

        {/* Layer 2: Fresnel conic rim border */}
        <div
          className="pointer-events-none absolute inset-0 rounded-[20px]"
          style={{
            background: `conic-gradient(
              from ${lightAngle}deg at 50% 50%,
              rgba(255,255,255,0.55) 0deg,
              rgba(255,255,255,0.35) 45deg,
              rgba(255,255,255,0.08) 90deg,
              rgba(255,255,255,0.04) 135deg,
              rgba(255,255,255,0.28) 180deg,
              rgba(255,255,255,0.20) 225deg,
              rgba(255,255,255,0.04) 270deg,
              rgba(255,255,255,0.15) 315deg,
              rgba(255,255,255,0.55) 360deg
            )`,
            mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
            WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
            maskComposite: "exclude",
            WebkitMaskComposite: "xor",
            padding: `${edgeThickness}px`,
          }}
        />

        {/* Layer 3: Primary glare sweep (top-left) */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: `linear-gradient(${lightAngle + 10}deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.05) 15%, rgba(255,255,255,0.01) 30%, transparent 50%)`,
          }}
        />

        {/* Layer 4: Opposite-side glare (bottom-right) */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: `linear-gradient(${lightAngle + 190}deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.025) 15%, transparent 35%)`,
          }}
        />

        {/* Layer 5: Corner hotspots */}
        <div
          className="pointer-events-none absolute left-0 top-0 h-[50%] w-[50%]"
          style={{
            background: `radial-gradient(ellipse at 0% 0%, rgba(255,255,255,${cornerHighlight * 0.35}) 0%, rgba(255,255,255,${cornerHighlight * 0.1}) 25%, transparent 60%)`,
          }}
        />
        <div
          className="pointer-events-none absolute right-0 top-0 h-[30%] w-[30%]"
          style={{
            background: `radial-gradient(ellipse at 100% 0%, rgba(255,255,255,${cornerHighlight * 0.12}) 0%, transparent 55%)`,
          }}
        />
        <div
          className="pointer-events-none absolute bottom-0 right-0 h-[40%] w-[40%]"
          style={{
            background: `radial-gradient(ellipse at 100% 100%, rgba(255,255,255,${cornerHighlight * 0.22}) 0%, rgba(255,255,255,${cornerHighlight * 0.06}) 25%, transparent 55%)`,
          }}
        />
        <div
          className="pointer-events-none absolute bottom-0 left-0 h-[22%] w-[22%]"
          style={{
            background: `radial-gradient(ellipse at 0% 100%, rgba(255,255,255,${cornerHighlight * 0.07}) 0%, transparent 50%)`,
          }}
        />

        {/* Layer 6: Primary edge lines (top + left) */}
        <div
          className="pointer-events-none absolute left-[5%] right-[30%] top-0"
          style={{
            height: "1px",
            background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.7) 15%, rgba(255,255,255,0.9) 40%, rgba(255,255,255,0.4) 70%, transparent 100%)",
            filter: "blur(0.4px)",
          }}
        />
        <div
          className="pointer-events-none absolute bottom-[30%] left-0 top-[5%]"
          style={{
            width: "1px",
            background: "linear-gradient(180deg, transparent 0%, rgba(255,255,255,0.5) 15%, rgba(255,255,255,0.7) 40%, rgba(255,255,255,0.3) 70%, transparent 100%)",
            filter: "blur(0.3px)",
          }}
        />

        {/* Layer 7: Opposite-side edge lines (bottom + right) */}
        <div
          className="pointer-events-none absolute bottom-0 left-[30%] right-[5%]"
          style={{
            height: "1px",
            background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.35) 30%, rgba(255,255,255,0.5) 60%, rgba(255,255,255,0.25) 85%, transparent 100%)",
            filter: "blur(0.4px)",
          }}
        />
        <div
          className="pointer-events-none absolute bottom-[5%] right-0 top-[30%]"
          style={{
            width: "1px",
            background: "linear-gradient(180deg, transparent 0%, rgba(255,255,255,0.25) 30%, rgba(255,255,255,0.4) 60%, rgba(255,255,255,0.18) 85%, transparent 100%)",
            filter: "blur(0.3px)",
          }}
        />

        {/* Layer 8: Surface noise */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.014]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
            backgroundRepeat: "repeat",
            backgroundSize: "256px 256px",
          }}
        />

        {/* Content */}
        <div className="relative z-10 p-5">
          {title && (
            <CardLabel className="mb-3 block">{title}</CardLabel>
          )}
          {children}
        </div>
      </div>
    </div>
  )
}

// =============================================================================
// InnerPlate -- The "Scrim/Plate" recipe
// bg-black/20 with inset shadow for recessed content stabilizer
// =============================================================================

export function InnerPlate({ children, className }: InnerPlateProps) {
  return (
    <div
      className={cn("rounded-lg bg-black/20 p-2", className)}
      style={{
        boxShadow:
          "inset 0 1px 4px rgba(0,0,0,0.5), 0 0.5px 0 rgba(255,255,255,0.06)",
      }}
    >
      {children}
    </div>
  )
}

// =============================================================================
// Typography Helpers
// =============================================================================

export function CardTitle({ children, className }: TypographyProps) {
  return (
    <h3
      className={cn(
        "font-sans text-lg font-semibold tracking-tight text-[#F8FAFC]",
        className
      )}
    >
      {children}
    </h3>
  )
}

export function CardLabel({ children, className }: TypographyProps) {
  return (
    <span className={cn("font-sans text-sm text-[#94A3B8]", className)}>
      {children}
    </span>
  )
}

export function CardMetric({ children, className }: TypographyProps) {
  return (
    <span
      className={cn(
        "font-mono text-2xl font-bold text-[#F8FAFC]",
        className
      )}
    >
      {children}
    </span>
  )
}

export function CardText({ children, className }: TypographyProps) {
  return (
    <p
      className={cn(
        "font-sans text-sm leading-relaxed text-[#94A3B8]",
        className
      )}
    >
      {children}
    </p>
  )
}
