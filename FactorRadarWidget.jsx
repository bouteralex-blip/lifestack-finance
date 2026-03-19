"use client";

import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

/**
 * FactorRadarWidget.jsx
 *
 * Futuristic radar chart for multi-factor portfolio analysis.
 *
 * Props:
 *   data - Array of { factor, portfolio, benchmark }
 *          factor:    string (axis label)
 *          portfolio: number (0-100)
 *          benchmark: number (0-100)
 *
 * AE Glass: bg-white/[0.08] backdrop-blur-[40px] saturate-[2.0]
 */

// ─── Internal: Glass Tooltip ────────────────────────────────────────────────

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
        <div className="mt-1.5 flex flex-col gap-1">
          {payload.map((p) => (
            <div key={p.dataKey} className="flex items-center gap-2">
              <div
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: p.color }}
              />
              <span className="font-mono text-xs text-emerald-100/60">
                {p.dataKey === "portfolio" ? "Portfolio" : "Benchmark"}
              </span>
              <span className="ml-auto font-mono text-sm font-bold text-white">
                {p.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Main ───────────────────────────────────────────────────────────────────

export function FactorRadarWidget({ data }) {
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
        {/* Header */}
        <div className="mb-4">
          <span className="text-[11px] font-sans font-medium uppercase tracking-widest text-emerald-100/60">
            Factor Exposure Analysis
          </span>
          <p className="mt-1 text-[11px] text-emerald-100/30">
            Portfolio vs benchmark factor tilts
          </p>
        </div>

        {/* Radar Chart */}
        <div className="rounded-xl border border-white/5 bg-black/30 p-3" style={{ boxShadow: "inset 0 2px 6px rgba(0,0,0,0.6), inset 0 0 1px rgba(255,255,255,0.05)" }}>
          <div className="mx-auto h-[320px] w-full max-w-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="75%" data={data}>
                <defs>
                  <linearGradient
                    id="radarPortfolioGrad"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor="#00E599" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#00E599" stopOpacity={0.05} />
                  </linearGradient>
                  <linearGradient
                    id="radarBenchmarkGrad"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="#3B82F6" stopOpacity={0.03} />
                  </linearGradient>
                </defs>

                <PolarGrid
                  stroke="rgba(255,255,255,0.06)"
                  gridType="polygon"
                />

                <PolarAngleAxis
                  dataKey="factor"
                  tick={{
                    fill: "rgba(255,255,255,0.45)",
                    fontSize: 10,
                    fontFamily: "monospace",
                  }}
                />

                <PolarRadiusAxis
                  angle={90}
                  domain={[0, 100]}
                  tick={false}
                  axisLine={false}
                />

                <Radar
                  name="benchmark"
                  dataKey="benchmark"
                  stroke="#3B82F6"
                  strokeWidth={1.5}
                  fill="url(#radarBenchmarkGrad)"
                  strokeDasharray="4 3"
                  dot={false}
                  style={{
                    filter: "drop-shadow(0 0 4px rgba(59,130,246,0.25))",
                  }}
                />

                <Radar
                  name="portfolio"
                  dataKey="portfolio"
                  stroke="#00E599"
                  strokeWidth={2}
                  fill="url(#radarPortfolioGrad)"
                  dot={{
                    r: 3,
                    fill: "#00E599",
                    stroke: "rgba(0,229,153,0.3)",
                    strokeWidth: 6,
                  }}
                  style={{
                    filter: "drop-shadow(0 0 6px rgba(0,229,153,0.35))",
                  }}
                />

                <Tooltip content={<GlassTooltip />} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-4 flex items-center justify-center gap-6">
          {[
            { label: "Portfolio", color: "#00E599", dash: false },
            { label: "Benchmark", color: "#3B82F6", dash: true },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-2">
              <div className="relative flex items-center">
                <div
                  className="h-0.5 w-4"
                  style={{
                    backgroundColor: item.color,
                    boxShadow: `0 0 6px ${item.color}40`,
                    ...(item.dash
                      ? {
                          backgroundImage: `repeating-linear-gradient(90deg, ${item.color} 0px, ${item.color} 4px, transparent 4px, transparent 7px)`,
                          backgroundColor: "transparent",
                        }
                      : {}),
                  }}
                />
                {!item.dash && (
                  <div
                    className="absolute right-0 h-2 w-2 -translate-y-0 translate-x-1/2 rounded-full"
                    style={{
                      backgroundColor: item.color,
                      boxShadow: `0 0 4px ${item.color}50`,
                    }}
                  />
                )}
              </div>
              <span className="font-sans text-xs text-[#94A3B8]">
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default FactorRadarWidget;
