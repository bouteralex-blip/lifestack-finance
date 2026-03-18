"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Sun, Moon } from "lucide-react"

// =============================================================================
// LiquidGlassSwitch
//
// Strict anatomy per spec:
//   TRACK  = Recessed material (bg-black/40, inset shadow)
//   THUMB  = Volumetric glass (beveled, floating, Framer Motion animated)
//
// Tailwind recipes enforced:
//   Track:  bg-black/40 shadow-[inset_0_2px_8px_rgba(0,0,0,0.6)]
//   Thumb:  shadow-[0_4px_12px_rgba(0,0,0,0.4),
//                   inset_0_1px_2px_rgba(255,255,255,0.5),
//                   inset_0_-2px_4px_rgba(0,0,0,0.3)]
// =============================================================================

export interface LiquidGlassSwitchProps {
  defaultChecked?: boolean
  onChange?: (checked: boolean) => void
  size?: "sm" | "md" | "lg"
}

export function LiquidGlassSwitch({
  defaultChecked = false,
  onChange,
  size = "md",
}: LiquidGlassSwitchProps) {
  const [isOn, setIsOn] = useState(defaultChecked)

  const toggle = () => {
    const next = !isOn
    setIsOn(next)
    onChange?.(next)
  }

  const dims = {
    sm: { track: "h-10 w-24", thumb: 32, padding: 4, travel: 52 },
    md: { track: "h-12 w-28", thumb: 40, padding: 4, travel: 64 },
    lg: { track: "h-14 w-36", thumb: 48, padding: 4, travel: 84 },
  }[size]

  return (
    <button
      role="switch"
      aria-checked={isOn}
      onClick={toggle}
      className={`
        ${dims.track}
        relative flex items-center rounded-full p-1
        bg-black/40
        shadow-[inset_0_2px_8px_rgba(0,0,0,0.6)]
        transition-colors duration-300
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#06140D]
        cursor-pointer
      `}
    >
      {/* Track inner border */}
      <div
        className="pointer-events-none absolute inset-0 rounded-full"
        style={{
          border: "1px solid rgba(255,255,255,0.04)",
          boxShadow: "inset 0 0 12px rgba(0,0,0,0.2)",
        }}
        aria-hidden="true"
      />

      {/* Track text */}
      <AnimatePresence mode="wait">
        {isOn ? (
          <motion.span
            key="dark-label"
            initial={{ opacity: 0, x: -4 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -4 }}
            transition={{ duration: 0.2 }}
            className="absolute left-3 select-none font-sans text-[10px] font-semibold uppercase tracking-[0.15em] text-emerald-100/40"
          >
            Dark
          </motion.span>
        ) : (
          <motion.span
            key="light-label"
            initial={{ opacity: 0, x: 4 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 4 }}
            transition={{ duration: 0.2 }}
            className="absolute right-3 select-none font-sans text-[10px] font-semibold uppercase tracking-[0.15em] text-emerald-100/40"
          >
            Light
          </motion.span>
        )}
      </AnimatePresence>

      {/* GLASS THUMB */}
      <motion.div
        layout
        animate={{ x: isOn ? dims.travel : 0 }}
        transition={{
          type: "spring",
          stiffness: 500,
          damping: 35,
          mass: 0.8,
        }}
        className="relative rounded-full bg-white/10 backdrop-blur-md border border-white/20"
        style={{
          width: dims.thumb,
          height: dims.thumb,
          boxShadow: [
            "0 4px 12px rgba(0,0,0,0.4)",
            "inset 0 1px 2px rgba(255,255,255,0.5)",
            "inset 0 -2px 4px rgba(0,0,0,0.3)",
            "inset 1px 1px 0 rgba(255,255,255,0.25)",
            "inset -0.5px -0.5px 0 rgba(255,255,255,0.08)",
            "0 0 20px rgba(0,0,0,0.15)",
          ].join(", "),
        }}
      >
        {/* Fresnel conic-gradient rim */}
        <div
          className="pointer-events-none absolute inset-0 rounded-full"
          style={{
            background: `conic-gradient(
              from 315deg at 50% 50%,
              rgba(255,255,255,0.30) 0deg,
              rgba(255,255,255,0.12) 45deg,
              rgba(255,255,255,0.02) 100deg,
              rgba(255,255,255,0.01) 150deg,
              rgba(255,255,255,0.10) 200deg,
              rgba(255,255,255,0.04) 260deg,
              rgba(255,255,255,0.08) 310deg,
              rgba(255,255,255,0.30) 360deg
            )`,
            mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
            WebkitMask:
              "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
            maskComposite: "exclude",
            WebkitMaskComposite: "xor",
            padding: "1px",
          }}
          aria-hidden="true"
        />

        {/* Diagonal glare sweep */}
        <div
          className="pointer-events-none absolute inset-0 rounded-full"
          style={{
            background:
              "linear-gradient(325deg, transparent 30%, rgba(255,255,255,0.08) 55%, rgba(255,255,255,0.03) 70%, transparent 85%)",
          }}
          aria-hidden="true"
        />

        {/* Icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <AnimatePresence mode="wait">
            {isOn ? (
              <motion.div
                key="moon"
                initial={{ opacity: 0, rotate: -90, scale: 0.5 }}
                animate={{ opacity: 1, rotate: 0, scale: 1 }}
                exit={{ opacity: 0, rotate: 90, scale: 0.5 }}
                transition={{ duration: 0.25 }}
              >
                <Moon
                  size={dims.thumb * 0.45}
                  strokeWidth={2}
                  className="text-white/90"
                  style={{
                    filter: "drop-shadow(0 0 6px rgba(255,255,255,0.3))",
                  }}
                />
              </motion.div>
            ) : (
              <motion.div
                key="sun"
                initial={{ opacity: 0, rotate: 90, scale: 0.5 }}
                animate={{ opacity: 1, rotate: 0, scale: 1 }}
                exit={{ opacity: 0, rotate: -90, scale: 0.5 }}
                transition={{ duration: 0.25 }}
              >
                <Sun
                  size={dims.thumb * 0.45}
                  strokeWidth={2}
                  className="text-white/90"
                  style={{
                    filter:
                      "drop-shadow(0 0 8px rgba(255,255,255,0.5)) drop-shadow(0 0 3px rgba(255,255,255,0.3))",
                  }}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Backlight glow beneath thumb */}
        <div
          className="pointer-events-none absolute -z-10"
          style={{
            left: "-30%",
            right: "-30%",
            top: "-10%",
            bottom: "-40%",
            background:
              "radial-gradient(ellipse 70% 45% at 50% 60%, rgba(255,255,255,0.06) 0%, transparent 65%)",
            filter: "blur(8px)",
          }}
          aria-hidden="true"
        />
      </motion.div>
    </button>
  )
}
