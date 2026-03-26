"use client";

/**
 * ScatterBubbleMatrixWidget.jsx
 *
 * Multi-series scatter/bubble chart using Recharts ScatterChart.
 * Each series has a distinct colour and optional z-axis (bubble size).
 *
 * Props:
 *   series  - Array of { name, color, glowColor?, points: [{ x, y, z? }] }
 *   title   - optional heading
 *   subtitle - optional secondary text
 *   xLabel  - optional X axis label
 *   yLabel  - optional Y axis label
 *
 * AE Glass: bg-white/[0.08] backdrop-blur-[40px] saturate-[2.0]
 */

import { useId } from "react";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function GlassTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const point = payload[0]?.payload;
  if (!point) return null;

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
        <div className="flex gap-4">
          <div>
            <span className="text-[10px] uppercase tracking-widest text-emerald-100/40">X</span>
            <span className="block font-mono text-sm font-bold text-white">{point.x}</span>
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-widest text-emerald-100/40">Y</span>
            <span className="block font-mono text-sm font-bold text-white">{point.y}</span>
          </div>
          {point.z != null && (
            <div>
              <span className="text-[10px] uppercase tracking-widest text-emerald-100/40">Size</span>
              <span className="block font-mono text-sm font-bold text-white">{point.z}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function ScatterBubbleMatrixWidget({
  series,
  title = "Risk-Return Matrix",
  subtitle = "Multi-series scatter analysis",
  xLabel = "Risk (%)",
  yLabel = "Return (%)",
}) {
  const uid = useId();
  const hasBubbles = (series || []).some((s) => s.points?.some((p) => p.z != null));

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
              <ScatterChart margin={{ top: 20, right: 20, left: 0, bottom: 10 }}>
                <CartesianGrid
                  horizontal
                  vertical
                  stroke="rgba(255,255,255,0.04)"
                />
                <XAxis
                  dataKey="x"
                  type="number"
                  name={xLabel}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 11, fontFamily: "monospace" }}
                  label={{
                    value: xLabel,
                    position: "insideBottomRight",
                    offset: -5,
                    style: { fill: "rgba(255,255,255,0.3)", fontSize: 10, fontFamily: "monospace" },
                  }}
                />
                <YAxis
                  dataKey="y"
                  type="number"
                  name={yLabel}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 11, fontFamily: "monospace" }}
                  width={50}
                  label={{
                    value: yLabel,
                    angle: -90,
                    position: "insideLeft",
                    style: { fill: "rgba(255,255,255,0.3)", fontSize: 10, fontFamily: "monospace" },
                  }}
                />
                {hasBubbles && (
                  <ZAxis dataKey="z" type="number" range={[40, 400]} />
                )}
                <Tooltip content={<GlassTooltip />} />

                {(series || []).map((s) => (
                  <Scatter
                    key={s.name}
                    name={s.name}
                    data={s.points}
                    fill={s.color}
                    fillOpacity={0.7}
                    stroke={s.color}
                    strokeWidth={1}
                    style={{
                      filter: `drop-shadow(0 0 6px ${s.glowColor || s.color}50)`,
                    }}
                  />
                ))}
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-3 flex flex-wrap gap-4">
          {(series || []).map((s) => (
            <div key={s.name} className="flex items-center gap-2">
              <div
                className="h-3 w-3 rounded-full"
                style={{
                  backgroundColor: s.color,
                  boxShadow: `0 0 8px ${s.glowColor || s.color}50`,
                }}
              />
              <span className="text-xs text-emerald-100/50">{s.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ScatterBubbleMatrixWidget;
