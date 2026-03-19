"use client";

/**
 * RoundedVolumePulseWidget.jsx
 *
 * Rounded-cap volume bars with height-proportional glow intensity.
 * Pure SVG implementation for maximum visual control.
 *
 * Props:
 *   data     - Array of { label, value }
 *   title    - optional heading
 *   subtitle - optional secondary text
 *   barColor - default "#00D4AA"
 *   glowColor - default same as barColor
 *   maxBarHeight - default 200
 *
 * AE Glass: bg-white/[0.08] backdrop-blur-[40px] saturate-[2.0]
 */

import { useState, useId } from "react";

export function RoundedVolumePulseWidget({
  data,
  title = "Volume Pulse",
  subtitle = "Transaction volume intensity",
  barColor = "#00D4AA",
  glowColor,
  maxBarHeight = 200,
}) {
  const uid = useId();
  const glow = glowColor || barColor;
  const [hoveredIdx, setHoveredIdx] = useState(null);

  const items = data || [];
  const maxVal = Math.max(...items.map((d) => d.value), 1);
  const barW = 20;
  const gap = 8;
  const paddingX = 40;
  const paddingBottom = 30;
  const paddingTop = 20;
  const totalW = paddingX * 2 + items.length * (barW + gap) - gap;
  const totalH = paddingTop + maxBarHeight + paddingBottom;
  const baseY = paddingTop + maxBarHeight;

  return (
    <div
      className="relative overflow-hidden rounded-2xl bg-white/[0.08] backdrop-blur-[40px] saturate-[2.0] border border-white/[0.15] p-5"
      style={{
        boxShadow: [
          "inset 0 1px 2px rgba(255,255,255,0.5)",
          "inset 0 -1px 1px rgba(255,255,255,0.1)",
          "0 20px 40px rgba(0,0,0,0.4)",
          "0 0 80px rgba(0,0,0,0.15)",
        ].join(", "),
      }}
    >
      {/* AE specular shine */}
      <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-white/[0.2] to-transparent" aria-hidden="true" />
      {/* Primary glare */}
      <div className="pointer-events-none absolute inset-0" style={{ background: "linear-gradient(325deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.05) 15%, rgba(255,255,255,0.01) 28%, transparent 45%)" }} aria-hidden="true" />
      {/* Secondary glare */}
      <div className="pointer-events-none absolute inset-0" style={{ background: "linear-gradient(145deg, transparent 55%, rgba(255,255,255,0.03) 70%, rgba(255,255,255,0.06) 85%, rgba(255,255,255,0.03) 100%)" }} aria-hidden="true" />
      {/* Corner hotspots */}
      <div className="pointer-events-none absolute left-0 top-0 h-1/2 w-1/2" style={{ background: "radial-gradient(ellipse at 0% 0%, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.08) 25%, transparent 60%)" }} aria-hidden="true" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-[35%] w-[35%]" style={{ background: "radial-gradient(ellipse at 100% 100%, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0.05) 25%, transparent 55%)" }} aria-hidden="true" />
      {/* Top edge highlight */}
      <div className="pointer-events-none absolute left-[8%] right-[35%] top-0" style={{ height: "1px", background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.7) 15%, rgba(255,255,255,0.9) 40%, rgba(255,255,255,0.4) 70%, transparent 100%)", filter: "blur(0.3px)" }} aria-hidden="true" />
      {/* Noise */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.018]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`, backgroundSize: "256px 256px" }} aria-hidden="true" />

      <div className="relative z-10">
        <span className="text-[11px] font-sans font-medium uppercase tracking-widest text-emerald-100/60">
          {title}
        </span>
        <p className="mt-1 text-[11px] text-emerald-100/30">{subtitle}</p>

        <div className="mt-4 overflow-x-auto rounded-xl border border-white/5 bg-black/30 p-3" style={{ boxShadow: "inset 0 2px 6px rgba(0,0,0,0.6), inset 0 0 1px rgba(255,255,255,0.05)" }}>
          <svg viewBox={`0 0 ${totalW} ${totalH}`} width="100%" height={totalH}>
            <defs>
              <linearGradient id={`${uid}-grad`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={barColor} stopOpacity={1} />
                <stop offset="100%" stopColor={barColor} stopOpacity={0.3} />
              </linearGradient>
              <filter id={`${uid}-glow`}>
                <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor={glow} floodOpacity="0.6" />
              </filter>
            </defs>

            {/* Horizontal grid lines */}
            {[0.25, 0.5, 0.75, 1].map((pct) => (
              <line
                key={pct}
                x1={paddingX - 10}
                y1={baseY - pct * maxBarHeight}
                x2={totalW - paddingX + 10}
                y2={baseY - pct * maxBarHeight}
                stroke="rgba(255,255,255,0.04)"
                strokeWidth={1}
              />
            ))}

            {items.map((item, i) => {
              const h = (item.value / maxVal) * maxBarHeight;
              const x = paddingX + i * (barW + gap);
              const y = baseY - h;
              const intensity = item.value / maxVal;
              const hovered = hoveredIdx === i;

              return (
                <g
                  key={i}
                  onMouseEnter={() => setHoveredIdx(i)}
                  onMouseLeave={() => setHoveredIdx(null)}
                  style={{ cursor: "default" }}
                >
                  <rect
                    x={x}
                    y={y}
                    width={barW}
                    height={h}
                    rx={barW / 2}
                    ry={barW / 2}
                    fill={`url(#${uid}-grad)`}
                    opacity={hovered ? 1 : 0.6 + intensity * 0.4}
                    filter={intensity > 0.5 || hovered ? `url(#${uid}-glow)` : undefined}
                    style={{ transition: "opacity 0.2s" }}
                  />
                  {/* Label */}
                  <text
                    x={x + barW / 2}
                    y={baseY + 16}
                    textAnchor="middle"
                    fill="rgba(255,255,255,0.35)"
                    fontSize="9"
                    fontFamily="monospace"
                  >
                    {item.label}
                  </text>
                  {/* Value on hover */}
                  {hovered && (
                    <text
                      x={x + barW / 2}
                      y={y - 6}
                      textAnchor="middle"
                      fill="white"
                      fontSize="10"
                      fontFamily="monospace"
                      fontWeight="bold"
                    >
                      {item.value.toLocaleString("en-GB")}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
        </div>
      </div>
    </div>
  );
}

export default RoundedVolumePulseWidget;
