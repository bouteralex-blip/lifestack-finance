"use client";

/**
 * MirroredDivergingBarWidget.jsx
 *
 * Horizontal diverging bar chart -- bars extend left (negative) and right (positive)
 * from a central zero axis. Built with pure SVG for maximum glass-spec control.
 *
 * Props:
 *   data     - Array of { label, value }  (value can be negative or positive)
 *   title    - optional heading
 *   subtitle - optional secondary text
 *   positiveColor - default "#00D4AA"
 *   negativeColor - default "#FF5C7A"
 *
 * AE Glass: bg-white/[0.08] backdrop-blur-[40px] saturate-[2.0]
 */

import { useState, useId } from "react";

export function MirroredDivergingBarWidget({
  data,
  title = "Factor Attribution",
  subtitle = "Diverging contribution analysis",
  positiveColor = "#00D4AA",
  negativeColor = "#FF5C7A",
}) {
  const uid = useId();
  const [hoveredIdx, setHoveredIdx] = useState(null);

  const maxAbs = Math.max(...(data || []).map((d) => Math.abs(d.value)), 1);

  const barH = 28;
  const gap = 6;
  const labelW = 90;
  const valueW = 60;
  const chartW = 400;
  const totalW = labelW + chartW + valueW;
  const totalH = (data || []).length * (barH + gap) + 10;
  const midX = labelW + chartW / 2;

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

        <div className="mt-4 overflow-x-auto rounded-xl border border-white/5 bg-black/30 p-4" style={{ boxShadow: "inset 0 2px 6px rgba(0,0,0,0.6), inset 0 0 1px rgba(255,255,255,0.05)" }}>
          <svg
            viewBox={`0 0 ${totalW} ${totalH}`}
            width="100%"
            height={totalH}
            className="block"
          >
            <defs>
              <filter id={`${uid}-glow-pos`}>
                <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor={positiveColor} floodOpacity="0.5" />
              </filter>
              <filter id={`${uid}-glow-neg`}>
                <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor={negativeColor} floodOpacity="0.5" />
              </filter>
            </defs>

            {/* Center axis */}
            <line
              x1={midX}
              y1={0}
              x2={midX}
              y2={totalH}
              stroke="rgba(255,255,255,0.08)"
              strokeWidth={1}
              strokeDasharray="4 4"
            />

            {(data || []).map((item, i) => {
              const y = i * (barH + gap) + 4;
              const isPos = item.value >= 0;
              const pct = Math.abs(item.value) / maxAbs;
              const barW = pct * (chartW / 2 - 8);
              const barX = isPos ? midX + 2 : midX - barW - 2;
              const color = isPos ? positiveColor : negativeColor;
              const glowFilter = isPos
                ? `url(#${uid}-glow-pos)`
                : `url(#${uid}-glow-neg)`;
              const hovered = hoveredIdx === i;

              return (
                <g
                  key={i}
                  onMouseEnter={() => setHoveredIdx(i)}
                  onMouseLeave={() => setHoveredIdx(null)}
                  style={{ cursor: "default" }}
                >
                  {/* Hover bg */}
                  {hovered && (
                    <rect
                      x={0}
                      y={y - 2}
                      width={totalW}
                      height={barH + 4}
                      rx={6}
                      fill="rgba(255,255,255,0.04)"
                    />
                  )}

                  {/* Label */}
                  <text
                    x={labelW - 8}
                    y={y + barH / 2 + 4}
                    textAnchor="end"
                    fill="rgba(255,255,255,0.6)"
                    fontSize="11"
                    fontFamily="sans-serif"
                  >
                    {item.label}
                  </text>

                  {/* Bar */}
                  <rect
                    x={barX}
                    y={y}
                    width={Math.max(barW, 2)}
                    height={barH}
                    rx={4}
                    fill={color}
                    opacity={hovered ? 1 : 0.8}
                    filter={hovered ? glowFilter : undefined}
                    style={{ transition: "opacity 0.2s, filter 0.2s" }}
                  />

                  {/* Value */}
                  <text
                    x={labelW + chartW + 8}
                    y={y + barH / 2 + 4}
                    textAnchor="start"
                    fill={color}
                    fontSize="12"
                    fontFamily="monospace"
                    fontWeight="600"
                  >
                    {isPos ? "+" : ""}
                    {item.value.toFixed(1)}%
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>
    </div>
  );
}

export default MirroredDivergingBarWidget;
