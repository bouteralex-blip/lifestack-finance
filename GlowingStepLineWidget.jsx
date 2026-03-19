"use client";

/**
 * GlowingStepLineWidget.jsx
 *
 * Step-line chart (type="stepAfter") with neon glow on the stroke.
 * Uses Recharts LineChart with step interpolation.
 *
 * Props:
 *   data     - Array of { date, value }
 *   title    - optional heading
 *   subtitle - optional secondary text
 *   lineColor - default "#3B82F6"
 *   glowColor - default same as lineColor
 *
 * AE Glass: bg-white/[0.08] backdrop-blur-[40px] saturate-[2.0]
 */

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function GlassTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
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
          {label}
        </span>
        <span className="mt-1 block font-mono text-lg font-bold text-white">
          {payload[0].value?.toLocaleString("en-GB")}
        </span>
      </div>
    </div>
  );
}

function formatYAxis(v) {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `${(v / 1_000).toFixed(0)}k`;
  return String(v);
}

export function GlowingStepLineWidget({
  data,
  title = "Step Function",
  subtitle = "Discrete value transitions over time",
  lineColor = "#3B82F6",
  glowColor,
}) {
  const glow = glowColor || lineColor;

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

        <div className="mt-4 rounded-xl border border-white/5 bg-black/30 p-3" style={{ boxShadow: "inset 0 2px 6px rgba(0,0,0,0.6), inset 0 0 1px rgba(255,255,255,0.05)" }}>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid horizontal vertical={false} stroke="rgba(255,255,255,0.04)" />
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 11, fontFamily: "monospace" }}
                  interval="preserveStartEnd"
                  dy={8}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 11, fontFamily: "monospace" }}
                  tickFormatter={formatYAxis}
                  width={55}
                />
                <Tooltip
                  content={<GlassTooltip />}
                  cursor={{ stroke: "rgba(255,255,255,0.08)", strokeWidth: 1, strokeDasharray: "4 4" }}
                />

                <Line
                  type="stepAfter"
                  dataKey="value"
                  stroke={lineColor}
                  strokeWidth={2.5}
                  dot={{
                    r: 3,
                    fill: lineColor,
                    stroke: `${glow}60`,
                    strokeWidth: 6,
                  }}
                  activeDot={{
                    r: 5,
                    fill: lineColor,
                    stroke: `${glow}40`,
                    strokeWidth: 10,
                  }}
                  style={{ filter: `drop-shadow(0 0 6px ${glow}60)` }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GlowingStepLineWidget;
