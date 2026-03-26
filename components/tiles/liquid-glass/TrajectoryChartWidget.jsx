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
      className="overflow-hidden rounded-[12px] border border-white/10"
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

  return (
    <div className="relative p-4">

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
      <div className="relative z-10 mt-6 bg-black/[0.25] rounded-[12px] shadow-[inset_0_1px_3px_rgba(0,0,0,0.5)] p-3">
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
        {(footerStats || []).map((stat) => (
          <div
            key={stat.label}
            className="bg-black/[0.25] rounded-[12px] shadow-[inset_0_1px_3px_rgba(0,0,0,0.5)] p-2"
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
