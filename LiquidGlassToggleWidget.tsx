"use client"

import { useState } from "react"
import { Sun, Moon } from "lucide-react"

// =============================================================================
// LiquidGlassToggle -- Props & Types
// =============================================================================

export interface LiquidGlassToggleProps {
  /** Visual mode for the toggle track/knob */
  mode: "light" | "dark"
  /** Whether the toggle is in "active" (dark / on-right) state */
  isActive: boolean
  /** Callback when toggled */
  onToggle: () => void
  /** Optional className for the outer button */
  className?: string
}

export interface LiquidGlassToggleDemoProps {
  /** Optional initial dark-mode state for the interactive toggle */
  defaultDark?: boolean
}

// =============================================================================
// GlassToggle -- Single presentational toggle
//
// TRACK = Material surface (opaque, recessed, NOT glass).
// KNOB  = Liquid glass (Fresnel rim, corner glare, caustic, S-curve junction).
// =============================================================================

export function LiquidGlassToggle({
  mode,
  isActive,
  onToggle,
  className = "",
}: LiquidGlassToggleProps) {
  const isLight = mode === "light"
  const knobOnRight = isActive

  // Glass knob rim intensities
  const rimAlpha = isLight ? 0.55 : 0.2
  const rimAlphaOpp = isLight ? 0.3 : 0.12
  const knobSurface = isLight
    ? "rgba(255,255,255,0.06)"
    : "rgba(20,20,28,0.15)"
  const backlightAlpha = isLight ? 0.28 : 0.1
  const textColor = isLight
    ? "rgba(80,80,90,0.65)"
    : "rgba(160,160,175,0.40)"
  const iconColor = isLight
    ? "rgba(255,255,255,0.95)"
    : "rgba(255,255,255,0.88)"

  return (
    <button
      onClick={onToggle}
      className={`group relative cursor-pointer ${className}`}
      style={{ width: 280, height: 120 }}
      aria-label={`Switch to ${isActive ? "light" : "dark"} mode`}
    >
      {/* BACKLIGHT GLOW */}
      <div
        className="pointer-events-none absolute"
        style={{
          left: "-20%",
          right: "-20%",
          top: "0%",
          bottom: "-40%",
          background: `radial-gradient(
            ellipse 65% 50% at 50% 70%,
            rgba(255,255,255,${backlightAlpha}) 0%,
            rgba(255,255,255,${backlightAlpha * 0.3}) 40%,
            transparent 70%
          )`,
          filter: "blur(22px)",
        }}
        aria-hidden="true"
      />

      {/* MATERIAL TRACK */}
      <div
        className="absolute overflow-hidden rounded-full"
        style={{
          left: knobOnRight ? 0 : 20,
          right: knobOnRight ? 20 : 0,
          top: 18,
          bottom: 18,
          backgroundColor: isLight ? "rgba(0,0,0,0.08)" : "rgba(0,0,0,0.50)",
          boxShadow: isLight
            ? "inset 0 1px 4px rgba(0,0,0,0.15), inset 0 2px 8px rgba(0,0,0,0.08), 0 1px 0 rgba(255,255,255,0.20)"
            : "inset 0 1px 4px rgba(0,0,0,0.5), inset 0 2px 10px rgba(0,0,0,0.30), 0 1px 0 rgba(255,255,255,0.04)",
          border: isLight
            ? "1px solid rgba(0,0,0,0.06)"
            : "1px solid rgba(255,255,255,0.04)",
        }}
      >
        <div
          className="absolute inset-0 flex items-center"
          style={{
            justifyContent: knobOnRight ? "flex-start" : "flex-end",
            paddingLeft: knobOnRight ? 36 : 0,
            paddingRight: knobOnRight ? 0 : 36,
          }}
        >
          <span
            className="select-none font-sans text-2xl font-medium"
            style={{ color: textColor }}
          >
            {isActive ? "Dark" : "Light"}
          </span>
        </div>
      </div>

      {/* GLASS KNOB */}
      <div
        className="absolute transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]"
        style={{
          width: 118,
          height: 118,
          top: 1,
          left: knobOnRight ? 152 : 0,
          borderRadius: "50%",
        }}
      >
        {/* Knob backlight */}
        <div
          className="pointer-events-none absolute"
          style={{
            left: "-18%",
            right: "-18%",
            top: "-8%",
            bottom: "-28%",
            background: `radial-gradient(
              ellipse 65% 45% at 50% 58%,
              rgba(255,255,255,${backlightAlpha * 0.6}) 0%,
              transparent 60%
            )`,
            filter: "blur(16px)",
          }}
          aria-hidden="true"
        />

        {/* Glass knob body */}
        <div
          className="relative h-full w-full overflow-hidden rounded-full"
          style={{
            backgroundColor: knobSurface,
            backdropFilter: "blur(18px) saturate(1.5) brightness(1.1)",
            WebkitBackdropFilter: "blur(18px) saturate(1.5) brightness(1.1)",
            boxShadow: [
              "inset 0 1px 1px rgba(255,255,255,0.2)",
              "inset 0 -1px 1px rgba(0,0,0,0.4)",
              "0 8px 32px rgba(0,0,0,0.5)",
              `0 4px 12px rgba(0,0,0,${isLight ? 0.15 : 0.35})`,
              `0 1px 3px rgba(0,0,0,${isLight ? 0.12 : 0.4})`,
              `inset 1.5px 1.5px 0.3px rgba(255,255,255,${rimAlpha})`,
              `inset 0.5px 0.5px 5px rgba(255,255,255,${rimAlpha * 0.15})`,
              `inset -1px -1px 0.3px rgba(255,255,255,${rimAlphaOpp})`,
              `inset -0.3px -0.3px 3px rgba(255,255,255,${rimAlphaOpp * 0.1})`,
              `inset 0 -3px 8px rgba(0,0,0,${isLight ? 0.1 : 0.25})`,
              `inset 0 3px 5px rgba(255,255,255,${isLight ? 0.08 : 0.03})`,
            ].join(", "),
          }}
        >
          {/* Fresnel conic rim border */}
          <div
            className="pointer-events-none absolute inset-0 rounded-full"
            style={{
              background: `conic-gradient(
                from 315deg at 50% 50%,
                rgba(255,255,255,${rimAlpha * 1.1}) 0deg,
                rgba(255,255,255,${rimAlpha * 0.5}) 45deg,
                rgba(255,255,255,${rimAlpha * 0.06}) 100deg,
                rgba(255,255,255,${rimAlpha * 0.03}) 140deg,
                rgba(255,255,255,${rimAlphaOpp * 0.8}) 180deg,
                rgba(255,255,255,${rimAlphaOpp * 0.35}) 225deg,
                rgba(255,255,255,${rimAlpha * 0.03}) 280deg,
                rgba(255,255,255,${rimAlpha * 0.35}) 325deg,
                rgba(255,255,255,${rimAlpha * 1.1}) 360deg
              )`,
              mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
              WebkitMask:
                "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
              maskComposite: "exclude",
              WebkitMaskComposite: "xor",
              padding: "1.2px",
            }}
          />

          {/* Glare sweep */}
          <div
            className="pointer-events-none absolute inset-0 rounded-full"
            style={{
              background: `linear-gradient(325deg, transparent 35%, rgba(255,255,255,${isLight ? 0.14 : 0.05}) 55%, rgba(255,255,255,${isLight ? 0.07 : 0.025}) 70%, transparent 85%)`,
            }}
          />

          {/* Bottom caustic crescent */}
          <div
            className="pointer-events-none absolute bottom-0 left-[15%] right-[15%]"
            style={{
              height: "35%",
              background: `radial-gradient(ellipse 80% 50% at 50% 90%, rgba(255,255,255,${isLight ? 0.16 : 0.05}) 0%, transparent 65%)`,
            }}
          />

          {/* S-curve junction shadow */}
          <div
            className="pointer-events-none absolute"
            style={{
              top: "20%",
              bottom: "20%",
              width: "28%",
              ...(knobOnRight
                ? {
                    left: 0,
                    background: `linear-gradient(90deg, rgba(0,0,0,${isLight ? 0.08 : 0.2}) 0%, transparent 70%)`,
                    borderRadius: "0 50% 50% 0",
                  }
                : {
                    right: 0,
                    background: `linear-gradient(270deg, rgba(0,0,0,${isLight ? 0.08 : 0.2}) 0%, transparent 70%)`,
                    borderRadius: "50% 0 0 50%",
                  }),
            }}
          />

          {/* Icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            {isActive ? (
              <Moon
                size={32}
                strokeWidth={2}
                style={{
                  color: iconColor,
                  filter: `drop-shadow(0 0 8px rgba(255,255,255,${isLight ? 0.5 : 0.25}))`,
                }}
              />
            ) : (
              <Sun
                size={34}
                strokeWidth={2}
                style={{
                  color: iconColor,
                  filter: `drop-shadow(0 0 10px rgba(255,255,255,${isLight ? 0.7 : 0.35})) drop-shadow(0 0 4px rgba(255,255,255,0.4))`,
                }}
              />
            )}
          </div>
        </div>
      </div>
    </button>
  )
}

// =============================================================================
// LiquidGlassToggleDemo -- Showcase wrapper (static + interactive)
// =============================================================================

export function LiquidGlassToggleDemo({
  defaultDark = true,
}: LiquidGlassToggleDemoProps) {
  const [isDark, setIsDark] = useState(defaultDark)

  return (
    <div className="flex flex-col items-center gap-12">
      {/* Light -- static */}
      <div className="flex flex-col items-center gap-4">
        <span className="font-sans text-xs font-medium uppercase tracking-[0.2em] text-[#94A3B8]">
          Light Mode
        </span>
        <div
          className="flex items-center justify-center rounded-3xl p-20"
          style={{ backgroundColor: "#c0c0c4" }}
        >
          <LiquidGlassToggle
            mode="light"
            isActive={false}
            onToggle={() => {}}
          />
        </div>
      </div>

      {/* Dark -- static */}
      <div className="flex flex-col items-center gap-4">
        <span className="font-sans text-xs font-medium uppercase tracking-[0.2em] text-[#94A3B8]">
          Dark Mode
        </span>
        <div
          className="flex items-center justify-center rounded-3xl p-20"
          style={{ backgroundColor: "#28282e" }}
        >
          <LiquidGlassToggle
            mode="dark"
            isActive={true}
            onToggle={() => {}}
          />
        </div>
      </div>

      {/* Interactive */}
      <div className="flex flex-col items-center gap-4">
        <span className="font-sans text-xs font-medium uppercase tracking-[0.2em] text-[#94A3B8]">
          Interactive
        </span>
        <div
          className="flex items-center justify-center rounded-3xl p-20 transition-colors duration-700"
          style={{ backgroundColor: isDark ? "#28282e" : "#c0c0c4" }}
        >
          <LiquidGlassToggle
            mode={isDark ? "dark" : "light"}
            isActive={isDark}
            onToggle={() => setIsDark(!isDark)}
          />
        </div>
      </div>
    </div>
  )
}
