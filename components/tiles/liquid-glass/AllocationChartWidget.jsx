"use client";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

/**
 * AllocationChartWidget.jsx
 *
 * Custom SVG Donut / Radial chart for asset allocation.
 *
 * Props:
 *   data       - Array of { name, value, color, amount }
 *   totalLabel - optional label above total (default "Total AUM")
 *   totalValue - optional formatted total (default "£361,560")
 *
 * AE Glass: bg-white/[0.08] backdrop-blur-[40px] saturate-[2.0]
 */

// ─── Internal: Glass Tooltip ────────────────────────────────────────────────

function GlassTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;

  return (
    <div
      className="relative overflow-hidden rounded-xl border border-white/10"
      style={{
        backgroundColor: "rgba(255,255,255,0.06)",
        backdropFilter: "blur(20px) saturate(1.3) brightness(1.08)",
        WebkitBackdropFilter: "blur(20px) saturate(1.3) brightness(1.08)",
        boxShadow:
          "inset 0 1px 1px rgba(255,255,255,0.2), inset 0 -1px 1px rgba(0,0,0,0.4), 0 8px 32px rgba(0,0,0,0.5)",
      }}
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 40%)",
        }}
      />
      <div className="relative z-10 px-4 py-3">
        <div className="flex items-center gap-2">
          <div
            className="h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: d.color }}
          />
          <span className="font-sans text-xs text-[#94A3B8]">{d.name}</span>
        </div>
        <div className="mt-1.5 flex items-baseline gap-2">
          <span className="font-mono text-lg font-bold text-[#F8FAFC]">
            {d.value}%
          </span>
          <span className="font-mono text-xs text-[#94A3B8]">{d.amount}</span>
        </div>
      </div>
    </div>
  );
}

// ─── Main ───────────────────────────────────────────────────────────────────

const NOISE_URI =
  "data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E";

export function AllocationChartWidget({
  data,
  totalLabel = "Total AUM",
  totalValue = "\u00A3361,560",
}) {
  if (!data || data.length === 0) return <div style={{display:'flex',alignItems:'center',justifyContent:'center',minHeight:80,color:'rgba(15,150,156,0.5)',fontSize:12,fontStyle:'italic',letterSpacing:'0.05em'}}>Awaiting Data Sync...</div>;
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
      {/* Primary glare sweep */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: "linear-gradient(325deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.05) 15%, rgba(255,255,255,0.01) 28%, transparent 45%)" }}
        aria-hidden="true"
      />
      {/* Secondary glare */}
      <div className="pointer-events-none absolute inset-0" style={{ background: "linear-gradient(145deg, transparent 55%, rgba(255,255,255,0.03) 70%, rgba(255,255,255,0.06) 85%, rgba(255,255,255,0.03) 100%)" }} aria-hidden="true" />
      {/* Corner hotspots */}
      <div className="pointer-events-none absolute left-0 top-0 h-1/2 w-1/2" style={{ background: "radial-gradient(ellipse at 0% 0%, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.08) 25%, transparent 60%)" }} aria-hidden="true" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-[35%] w-[35%]" style={{ background: "radial-gradient(ellipse at 100% 100%, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0.05) 25%, transparent 55%)" }} aria-hidden="true" />
      {/* Top edge highlight */}
      <div className="pointer-events-none absolute left-[8%] right-[35%] top-0" style={{ height: "1px", background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.7) 15%, rgba(255,255,255,0.9) 40%, rgba(255,255,255,0.4) 70%, transparent 100%)", filter: "blur(0.3px)" }} aria-hidden="true" />
      {/* Noise */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.018]" style={{ backgroundImage: `url("${NOISE_URI}")`, backgroundSize: "256px 256px" }} aria-hidden="true" />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-sans text-xs font-semibold uppercase tracking-[0.15em] text-[#94A3B8]">
              Asset Allocation
            </h3>
            <p className="mt-1 font-sans text-[11px] text-[#94A3B8] opacity-50">
              Portfolio distribution by asset class
            </p>
          </div>
          <div className="text-right">
            <span className="font-sans text-sm text-[#94A3B8]">
              {totalLabel}
            </span>
            <span className="mt-0.5 block font-mono text-xl font-bold text-[#F8FAFC]">
              {totalValue}
            </span>
          </div>
        </div>

        {/* Donut chart */}
        <div className="mx-auto mt-4 h-[220px] w-full max-w-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={95}
                paddingAngle={3}
                dataKey="value"
                stroke="none"
                cornerRadius={4}
              >
                {data.map((entry) => (
                  <Cell
                    key={entry.name}
                    fill={entry.color}
                    style={{
                      filter: `drop-shadow(0 0 4px ${entry.color}40)`,
                    }}
                  />
                ))}
              </Pie>
              <Tooltip content={<GlassTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Legend rows */}
        <div className="mt-2 flex flex-col gap-2">
          {data.map((item) => (
            <div
              key={item.name}
              className="flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <div
                  className="h-2 w-2 rounded-full"
                  style={{
                    backgroundColor: item.color,
                    boxShadow: `0 0 6px ${item.color}50`,
                  }}
                />
                <span className="font-sans text-xs text-[#94A3B8]">
                  {item.name}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs text-[#F8FAFC]">
                  {item.value}%
                </span>
                <span className="font-mono text-[11px] text-[#94A3B8] opacity-50">
                  {item.amount}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default AllocationChartWidget;
