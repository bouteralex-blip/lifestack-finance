"use client";

/**
 * AsymmetricFilledRadarWidget.jsx
 *
 * Single-series filled radar chart with asymmetric shape and neon glow.
 * Different from FactorRadarWidget (which is dual-series).
 *
 * Props:
 *   data     - Array of { axis, value, fullMark? }
 *   title    - optional heading
 *   subtitle - optional secondary text
 *   fillColor   - default "#00D4AA"
 *   strokeColor - default same as fillColor
 *   fillOpacity - default 0.3
 *
 * AE Glass: bg-white/[0.08] backdrop-blur-[40px] saturate-[2.0]
 */

import { useId } from "react";
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function GlassTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const item = payload[0]?.payload;
  if (!item) return null;
  return (
    <div
      className="overflow-hidden rounded-xl border border-white/10"
      style={{
        backgroundColor: "rgba(11,42,28,0.60)",
        backdropFilter: "blur(20px) saturate(1.3)",
        WebkitBackdropFilter: "blur(20px) saturate(1.3)",
        boxShadow:
          "inset 0 1px 1px rgba(255,255,255,0.2), inset 0 -1px 1px rgba(0,0,0,0.4), 0 8px 32px rgba(0,0,0,0.5)",
      }}
    >
      <div className="px-4 py-3">
        <span className="block text-[11px] uppercase tracking-widest text-emerald-100/50">
          {item.axis}
        </span>
        <span className="mt-1 block font-mono text-lg font-bold text-white">
          {item.value}
        </span>
      </div>
    </div>
  );
}

export function AsymmetricFilledRadarWidget({
  data,
  title = "Portfolio Profile",
  subtitle = "Asymmetric factor exposure",
  fillColor = "#00D4AA",
  strokeColor,
  fillOpacity = 0.3,
}) {
  const uid = useId();
  const stroke = strokeColor || fillColor;

  const maxVal = Math.max(
    ...(data || []).map((d) => d.fullMark || d.value),
    100
  );

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

        <div className="mt-4 rounded-xl border border-white/5 bg-black/30 p-3" style={{ boxShadow: "inset 0 2px 6px rgba(0,0,0,0.6), inset 0 0 1px rgba(255,255,255,0.05)" }}>
          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={data} cx="50%" cy="50%" outerRadius="75%">
                <defs>
                  <filter id={`${uid}-glow`}>
                    <feDropShadow
                      dx="0"
                      dy="0"
                      stdDeviation="4"
                      floodColor={fillColor}
                      floodOpacity="0.5"
                    />
                  </filter>
                  <linearGradient id={`${uid}-fill`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={fillColor} stopOpacity={fillOpacity + 0.1} />
                    <stop offset="100%" stopColor={fillColor} stopOpacity={fillOpacity * 0.3} />
                  </linearGradient>
                </defs>

                <PolarGrid
                  stroke="rgba(255,255,255,0.06)"
                  gridType="polygon"
                />
                <PolarAngleAxis
                  dataKey="axis"
                  tick={{
                    fill: "rgba(255,255,255,0.5)",
                    fontSize: 11,
                    fontFamily: "sans-serif",
                  }}
                />
                <PolarRadiusAxis
                  angle={90}
                  domain={[0, maxVal]}
                  tick={false}
                  axisLine={false}
                />
                <Tooltip content={<GlassTooltip />} />

                <Radar
                  dataKey="value"
                  stroke={stroke}
                  strokeWidth={2}
                  fill={`url(#${uid}-fill)`}
                  fillOpacity={1}
                  dot={{
                    r: 3,
                    fill: stroke,
                    stroke: `${stroke}40`,
                    strokeWidth: 6,
                  }}
                  activeDot={{
                    r: 5,
                    fill: stroke,
                    stroke: `${stroke}30`,
                    strokeWidth: 10,
                  }}
                  style={{ filter: `url(#${uid}-glow)` }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Summary stats */}
        <div className="mt-3 flex flex-wrap gap-4">
          {(data || []).map((d) => (
            <div key={d.axis} className="flex items-center gap-2">
              <span className="text-[10px] uppercase text-emerald-100/40">{d.axis}</span>
              <span className="font-mono text-xs font-bold text-white">{d.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default AsymmetricFilledRadarWidget;
