"use client";

import { useState } from "react";

/**
 * LiquidGlassFilterWidget.jsx
 *
 * Sliding-pill segmented control for timeframe or category selection.
 *
 * AE Liquid Glass Recipe:
 *   Base:     bg-white/[0.08] backdrop-blur-[40px] saturate-[2.0]
 *   Rim/Drop: inset rim + deep drop shadow
 *   Border:   border-white/[0.15]
 *   Specular: gradient shine overlay
 *
 * Props:
 *   data - { options: string[], defaultIndex?, onChange? }
 */

export function LiquidGlassFilterWidget({ data }) {
  const [activeIndex, setActiveIndex] = useState(0);
  if (!data) return <div style={{display:'flex',alignItems:'center',justifyContent:'center',minHeight:80,color:'rgba(15,150,156,0.5)',fontSize:12,fontStyle:'italic',letterSpacing:'0.05em'}}>Awaiting Data Sync...</div>;
  const { options = [], defaultIndex = 0, onChange } = data;

  const handleClick = (index) => {
    setActiveIndex(index);
    onChange?.(options[index], index);
  };

  return (
    <div
      className="relative inline-flex items-center overflow-hidden rounded-full bg-white/[0.08] backdrop-blur-[40px] saturate-[2.0] border border-white/[0.15] p-1"
      style={{
        boxShadow: [
          "inset 0 1px 2px rgba(255,255,255,0.5)",
          "inset 0 -1px 1px rgba(255,255,255,0.1)",
          "0 20px 40px rgba(0,0,0,0.4)",
        ].join(", "),
      }}
    >
      {/* AE Specular Shine */}
      <div
        className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-br from-white/[0.2] to-transparent"
        aria-hidden="true"
      />

      {/* Sliding pill indicator */}
      <div
        className="absolute top-1 bottom-1 rounded-full transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
        style={{
          width: `calc(${100 / options.length}% - 4px)`,
          left: `calc(${(activeIndex * 100) / options.length}% + 2px)`,
          backgroundColor: "rgba(0,0,0,0.35)",
          boxShadow:
            "inset 0 1px 2px rgba(255,255,255,0.18), inset 0 -1px 1px rgba(0,0,0,0.3), 0 4px 12px rgba(0,0,0,0.4)",
          border: "1px solid rgba(255,255,255,0.10)",
        }}
      />

      {/* Option buttons */}
      {options.map((option, i) => (
        <button
          key={option}
          onClick={() => handleClick(i)}
          className={`relative z-10 rounded-full px-4 py-1.5 text-xs font-medium transition-colors duration-200 ${
            activeIndex === i
              ? "text-white"
              : "text-emerald-100/50 hover:text-white/70"
          }`}
          style={{
            minWidth: `calc(${100 / options.length}%)`,
            textAlign: "center",
            fontFamily: "Geist Mono, monospace",
          }}
        >
          {option}
        </button>
      ))}

      {/* Fresnel conic rim */}
      <div
        className="pointer-events-none absolute inset-0 rounded-full"
        style={{
          background: `conic-gradient(
            from 315deg at 50% 50%,
            rgba(255,255,255,0.35) 0deg,
            rgba(255,255,255,0.14) 45deg,
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
    </div>
  );
}

export default LiquidGlassFilterWidget;
