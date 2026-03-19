"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * LiquidGlassSwitchWidget.jsx
 *
 * Physical floating-glass toggle with Framer Motion spring animation.
 *
 * AE Liquid Glass Recipe applied to:
 *   Track  - recessed matte with heavy inset shadow
 *   Thumb  - full AE glass spec: bg-white/[0.08] backdrop-blur-[40px]
 *            saturate-[2.0] + AE rim + AE drop shadow + specular shine
 *
 * Props:
 *   defaultChecked - boolean (initial state)
 *   onChange        - (checked) => void
 *   size            - "sm" | "md" | "lg"
 */

// ─── Inline Icons ───────────────────────────────────────────────────────────

function SunIcon({ size, className = "", style = {} }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2" />
      <path d="M12 20v2" />
      <path d="m4.93 4.93 1.41 1.41" />
      <path d="m17.66 17.66 1.41 1.41" />
      <path d="M2 12h2" />
      <path d="M20 12h2" />
      <path d="m6.34 17.66-1.41 1.41" />
      <path d="m19.07 4.93-1.41 1.41" />
    </svg>
  );
}

function MoonIcon({ size, className = "", style = {} }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
    >
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
    </svg>
  );
}

// ─── Main ───────────────────────────────────────────────────────────────────

const DIMS = {
  sm: { track: "h-10 w-24", thumb: 32, padding: 4, travel: 52 },
  md: { track: "h-12 w-28", thumb: 40, padding: 4, travel: 64 },
  lg: { track: "h-14 w-36", thumb: 48, padding: 4, travel: 84 },
};

export function LiquidGlassSwitchWidget({
  defaultChecked = false,
  onChange,
  size = "md",
}) {
  const [isOn, setIsOn] = useState(defaultChecked);

  const toggle = () => {
    const next = !isOn;
    setIsOn(next);
    onChange?.(next);
  };

  const dims = DIMS[size];

  return (
    <button
      role="switch"
      aria-checked={isOn}
      onClick={toggle}
      className={`${dims.track} relative flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#06140D]`}
      style={{
        backgroundColor: "rgba(0,0,0,0.45)",
        boxShadow:
          "inset 0 3px 10px rgba(0,0,0,0.7), inset 0 1px 3px rgba(0,0,0,0.4), 0 1px 0 rgba(255,255,255,0.03)",
      }}
    >
      {/* Track inner border */}
      <div
        className="pointer-events-none absolute inset-0 rounded-full border border-white/[0.04]"
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
            className="absolute left-3 select-none text-[10px] font-semibold uppercase tracking-[0.15em] text-emerald-100/40"
            style={{ fontFamily: "Geist, sans-serif" }}
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
            className="absolute right-3 select-none text-[10px] font-semibold uppercase tracking-[0.15em] text-emerald-100/40"
            style={{ fontFamily: "Geist, sans-serif" }}
          >
            Light
          </motion.span>
        )}
      </AnimatePresence>

      {/* ══════════════════════════════════════════════════════════════
          AE GLASS THUMB
          ══════════════════════════════════════════════════════════════ */}
      <motion.div
        layout
        animate={{ x: isOn ? dims.travel : 0 }}
        transition={{ type: "spring", stiffness: 500, damping: 35, mass: 0.8 }}
        className="relative overflow-hidden rounded-full bg-white/[0.08] backdrop-blur-[40px] saturate-[2.0] border border-white/[0.15]"
        style={{
          width: dims.thumb,
          height: dims.thumb,
          boxShadow: [
            /* AE rim light */
            "inset 0 1px 2px rgba(255,255,255,0.5)",
            "inset 0 -1px 1px rgba(255,255,255,0.1)",
            /* AE deep drop shadow */
            "0 6px 16px rgba(0,0,0,0.5)",
            "0 20px 40px rgba(0,0,0,0.25)",
            /* volumetric side shadow */
            "inset 1px 1px 0 rgba(255,255,255,0.25)",
            "inset -0.5px -0.5px 0 rgba(255,255,255,0.08)",
          ].join(", "),
        }}
      >
        {/* AE Specular Shine */}
        <div
          className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-br from-white/[0.2] to-transparent"
          aria-hidden="true"
        />

        {/* Fresnel conic-gradient rim */}
        <div
          className="pointer-events-none absolute inset-0 rounded-full"
          style={{
            background: `conic-gradient(
              from 315deg at 50% 50%,
              rgba(255,255,255,0.35) 0deg,
              rgba(255,255,255,0.15) 45deg,
              rgba(255,255,255,0.02) 100deg,
              rgba(255,255,255,0.01) 150deg,
              rgba(255,255,255,0.12) 200deg,
              rgba(255,255,255,0.05) 260deg,
              rgba(255,255,255,0.10) 310deg,
              rgba(255,255,255,0.35) 360deg
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

        {/* Diagonal glare */}
        <div
          className="pointer-events-none absolute inset-0 rounded-full"
          style={{
            background:
              "linear-gradient(325deg, transparent 30%, rgba(255,255,255,0.10) 55%, rgba(255,255,255,0.04) 70%, transparent 85%)",
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
                <MoonIcon
                  size={dims.thumb * 0.45}
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
                <SunIcon
                  size={dims.thumb * 0.45}
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
              "radial-gradient(ellipse 70% 45% at 50% 60%, rgba(255,255,255,0.08) 0%, transparent 65%)",
            filter: "blur(10px)",
          }}
          aria-hidden="true"
        />
      </motion.div>
    </button>
  );
}

export default LiquidGlassSwitchWidget;
