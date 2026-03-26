"use client";

/**
 * ConcentricProgressRingsWidget.jsx
 *
 * Triple concentric SVG progress rings with animated glow.
 *
 * Props:
 *   data - Array of { label, value, max, color, glowColor? }
 *          (expects exactly 3 items for the concentric layout)
 *   title    - optional heading
 *   subtitle - optional secondary text
 *
 * AE Glass: bg-white/[0.08] backdrop-blur-[40px] saturate-[2.0]
 */

import { useState, useEffect, useId } from "react";

function polarToCartesian(cx, cy, r, angleDeg) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function describeArc(cx, cy, r, startAngle, endAngle) {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 0 ${end.x} ${end.y}`;
}

export function ConcentricProgressRingsWidget({
  data,
  title = "Goal Progress",
  subtitle = "Concentric ring breakdown",
}) {
  const uid = useId();
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 100);
    return () => clearTimeout(t);
  }, []);

  const cx = 130;
  const cy = 130;
  const radii = [100, 76, 52];
  const strokeW = 18;

  const rings = (data || []).slice(0, 3);

  return (
    <div
      className="relative overflow-hidden rounded-[18px] bg-white/[0.08] backdrop-blur-[40px] saturate-[2.0] border border-white/[0.15] p-5"
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
      <div className="pointer-events-none absolute inset-0 rounded-[18px] bg-gradient-to-br from-white/[0.2] to-transparent" aria-hidden="true" />
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

        {/* Inner plate */}
        <div className="mt-4 rounded-xl border border-white/5 bg-black/30 p-4" style={{ boxShadow: "inset 0 2px 6px rgba(0,0,0,0.6), inset 0 0 1px rgba(255,255,255,0.05)" }}>
          <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
            {/* SVG rings */}
            <svg
              viewBox="0 0 260 260"
              width={260}
              height={260}
              className="shrink-0"
            >
              <defs>
                {rings.map((ring, i) => (
                  <filter key={`glow-${i}`} id={`${uid}-glow-${i}`}>
                    <feDropShadow
                      dx="0"
                      dy="0"
                      stdDeviation="4"
                      floodColor={ring.glowColor || ring.color}
                      floodOpacity="0.6"
                    />
                  </filter>
                ))}
              </defs>

              {rings.map((ring, i) => {
                const r = radii[i];
                const pct = Math.min((ring.value / ring.max) * 100, 100);
                const angle = animated ? (pct / 100) * 360 : 0;

                return (
                  <g key={i}>
                    {/* Track */}
                    <circle
                      cx={cx}
                      cy={cy}
                      r={r}
                      fill="none"
                      stroke="rgba(255,255,255,0.06)"
                      strokeWidth={strokeW}
                      strokeLinecap="round"
                    />
                    {/* Value arc */}
                    {angle > 0.5 && (
                      <path
                        d={describeArc(cx, cy, r, 0, Math.min(angle, 359.9))}
                        fill="none"
                        stroke={ring.color}
                        strokeWidth={strokeW}
                        strokeLinecap="round"
                        filter={`url(#${uid}-glow-${i})`}
                        style={{
                          transition: "all 1.2s cubic-bezier(0.22,1,0.36,1)",
                        }}
                      />
                    )}
                    {/* Percentage label */}
                    <text
                      x={cx}
                      y={cy - r + strokeW / 2 + 5}
                      textAnchor="middle"
                      fill={ring.color}
                      fontSize="9"
                      fontFamily="monospace"
                      opacity="0.8"
                    >
                      {Math.round(pct)}%
                    </text>
                  </g>
                );
              })}

              {/* Center label */}
              <text
                x={cx}
                y={cy - 6}
                textAnchor="middle"
                fill="white"
                fontSize="22"
                fontFamily="monospace"
                fontWeight="bold"
              >
                {rings.length > 0
                  ? `${Math.round((rings.reduce((s, r) => s + r.value / r.max, 0) / rings.length) * 100)}%`
                  : "--"}
              </text>
              <text
                x={cx}
                y={cy + 14}
                textAnchor="middle"
                fill="rgba(255,255,255,0.4)"
                fontSize="10"
                fontFamily="sans-serif"
              >
                AVG PROGRESS
              </text>
            </svg>

            {/* Legend */}
            <div className="flex flex-col gap-3 pt-2">
              {rings.map((ring, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{
                      backgroundColor: ring.color,
                      boxShadow: `0 0 8px ${ring.glowColor || ring.color}60`,
                    }}
                  />
                  <div>
                    <span className="block text-xs font-medium text-white">
                      {ring.label}
                    </span>
                    <span className="block font-mono text-[11px] text-emerald-100/50">
                      {ring.value} / {ring.max}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ConcentricProgressRingsWidget;
