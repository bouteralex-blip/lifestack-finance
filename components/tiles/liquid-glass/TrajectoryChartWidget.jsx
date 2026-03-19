"use client";

import { useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

/**
 * TrajectoryChartWidget.jsx
 *
 * Luminous Recharts Area Chart with neon-mint glow filters and forecast overlay.
 *
 * Props:
 *   data        - Array of { date, value, forecast? }
 *   footerStats - Array of { label, value, color }
 *   title       - optional chart heading
 *   subtitle    - optional secondary line
 *
 * AE Glass: bg-white/[0.08] backdrop-blur-[40px] saturate-[2.0]
 */

// ─── Internal: Time range filter ────────────────────────────────────────────

const TIME_RANGES = ["1M", "3M", "6M", "YTD", "1Y", "ALL"];

function filterByRange(data, range) {
  const len = data.length;
  const slices = { "1M": 2, "3M": 4, "6M": 7, YTD: 12, "1Y": 13 };
  if (range === "ALL") return data;
  return data.slice(Math.max(0, len - (slices[range] || len)));
}

// ─── Internal: Glass Tooltip ────────────────────────────────────────────────

function MintGlassTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;

  const mainValue = payload.find((p) => p.dataKey === "value");
  const forecastValue = payload.find((p) => p.dataKey === "forecast");
  const displayValue = mainValue?.value ?? forecastValue?.value;

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
          {displayValue != null
            ? `\u00A3${displayValue.toLocaleString("en-GB")}`
            : "--"}
        </span>
        {forecastValue && !mainValue && (
          <span className="mt-0.5 block text-[10px] uppercase tracking-wider text-emerald-100/40">
            Forecast
          </span>
        )}
      </div>
    </div>
  );
}

// ─── Internal: Y-axis formatter ─────────────────────────────────────────────

function formatYAxis(value) {
  if (value >= 1_000_000) return `\u00A3${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `\u00A3${(value / 1_000).toFixed(0)}k`;
  return `\u00A3${value}`;
}

// ─── Main ───────────────────────────────────────────────────────────────────

export function TrajectoryChartWidget({
  data,
  footerStats,
  title = "Net Worth Trajectory + Forecast",
  subtitle = "Historical performance with projected growth trajectory",
}) {
  const [activeRange, setActiveRange] = useState("ALL");
  if (!data || data.length === 0) return <div style={{display:'flex',alignItems:'center',justifyContent:'center',minHeight:200,color:'rgba(15,150,156,0.5)',fontSize:12,fontStyle:'italic',letterSpacing:'0.05em'}}>Awaiting Data Sync...</div>;
  const filteredData = filterByRange(data, activeRange);

  const lastHistoricalIndex = data.findIndex(
    (d) => d.forecast !== undefined && d.value !== undefined
  );
  const lastHistoricalDate =
    lastHistoricalIndex >= 0 ? data[lastHistoricalIndex].date : null;

  const NOISE_URI =
    "data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E";

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
      <div className="pointer-events-none absolute inset-0 opacity-[0.018]" style={{ backgroundImage: `url("${NOISE_URI}")`, backgroundSize: "256px 256px" }} aria-hidden="true" />

      {/* Header */}
      <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <span className="text-[11px] font-sans font-medium uppercase tracking-widest text-emerald-100/60">
            {title}
          </span>
          <p className="mt-1 text-[11px] text-emerald-100/30">{subtitle}</p>
        </div>

        {/* Time filter pills */}
        <div className="flex gap-1.5">
          {TIME_RANGES.map((range) => (
            <button
              key={range}
              onClick={() => setActiveRange(range)}
              className={`rounded-md px-3 py-1 font-mono text-xs font-medium transition-all ${
                activeRange === range
                  ? "bg-black/20 text-white shadow-[inset_0_1px_4px_rgba(0,0,0,0.5)]"
                  : "bg-white/5 text-emerald-100/50 hover:bg-white/10 hover:text-white"
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Chart inside inner plate */}
      <div className="relative z-10 mt-6 rounded-xl border border-white/5 bg-black/30 p-3" style={{ boxShadow: "inset 0 2px 6px rgba(0,0,0,0.6), inset 0 0 1px rgba(255,255,255,0.05)" }}>
        <div className="h-[360px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={filteredData}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="mintGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00E599" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#00E599" stopOpacity={0} />
                </linearGradient>
                <linearGradient
                  id="mintForecastGrad"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="0%" stopColor="#00E599" stopOpacity={0.12} />
                  <stop offset="100%" stopColor="#00E599" stopOpacity={0} />
                </linearGradient>
              </defs>

              <CartesianGrid
                horizontal
                vertical={false}
                stroke="rgba(255,255,255,0.04)"
              />

              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{
                  fill: "rgba(255,255,255,0.35)",
                  fontSize: 11,
                  fontFamily: "monospace",
                }}
                interval="preserveStartEnd"
                dy={8}
              />

              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{
                  fill: "rgba(255,255,255,0.35)",
                  fontSize: 11,
                  fontFamily: "monospace",
                }}
                tickFormatter={formatYAxis}
                width={60}
                dx={-4}
              />

              <Tooltip
                content={<MintGlassTooltip />}
                cursor={{
                  stroke: "rgba(255,255,255,0.08)",
                  strokeWidth: 1,
                  strokeDasharray: "4 4",
                }}
              />

              {lastHistoricalDate && activeRange === "ALL" && (
                <ReferenceLine
                  x={lastHistoricalDate}
                  stroke="rgba(255,255,255,0.08)"
                  strokeDasharray="6 4"
                  label={{
                    value: "Now",
                    position: "insideTopRight",
                    fill: "rgba(255,255,255,0.35)",
                    fontSize: 10,
                    fontFamily: "monospace",
                  }}
                />
              )}

              {/* Historical -- Neon Mint */}
              <Area
                type="monotone"
                dataKey="value"
                stroke="#00E599"
                strokeWidth={2}
                fill="url(#mintGrad)"
                dot={false}
                activeDot={{
                  r: 4,
                  fill: "#00E599",
                  stroke: "rgba(0,229,153,0.3)",
                  strokeWidth: 8,
                }}
                style={{
                  filter: "drop-shadow(0px 0px 6px rgba(0,229,153,0.4))",
                }}
                connectNulls={false}
              />

              {/* Forecast */}
              <Area
                type="monotone"
                dataKey="forecast"
                stroke="#00E599"
                strokeWidth={2}
                strokeDasharray="6 4"
                fill="url(#mintForecastGrad)"
                dot={false}
                activeDot={{
                  r: 4,
                  fill: "#00E599",
                  stroke: "rgba(0,229,153,0.3)",
                  strokeWidth: 8,
                }}
                style={{
                  filter: "drop-shadow(0px 0px 4px rgba(0,229,153,0.2))",
                  opacity: 0.7,
                }}
                connectNulls={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Footer stats */}
      <div className="relative z-10 mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {footerStats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-white/5 bg-black/30 p-2" style={{ boxShadow: "inset 0 2px 6px rgba(0,0,0,0.6), inset 0 0 1px rgba(255,255,255,0.05)" }}
          >
            <span className="text-[11px] font-sans font-medium uppercase tracking-widest text-emerald-100/60">
              {stat.label}
            </span>
            <span
              className={`mt-0.5 block font-mono text-sm font-bold ${stat.color}`}
            >
              {stat.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default TrajectoryChartWidget;
