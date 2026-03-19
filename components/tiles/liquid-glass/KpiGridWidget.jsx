"use client";

/**
 * KpiGridWidget.jsx
 *
 * High-density small-metric grid (6 tiles, emerald variant).
 *
 * Props:
 *   data - Array of { label, value, delta, deltaType, subtext? }
 *          deltaType: "positive" | "negative" | "warning"
 *
 * AE Glass: bg-white/[0.08] backdrop-blur-[40px] saturate-[2.0] -- via EmeraldGlassCard
 */

import { EmeraldGlassCard } from "./EmeraldGlassCard";

export function KpiGridWidget({ data }) {
  if (!data || data.length === 0) return <div style={{display:'flex',alignItems:'center',justifyContent:'center',minHeight:80,color:'rgba(15,150,156,0.5)',fontSize:12,fontStyle:'italic',letterSpacing:'0.05em'}}>Awaiting Data Sync...</div>;
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
      {data.map((kpi) => (
        <EmeraldGlassCard key={kpi.label} className="flex flex-col p-4">
          <div className="rounded-lg bg-black/30 p-2 shadow-inner">
            {/* Label */}
            <span className="text-[11px] font-sans font-medium uppercase tracking-widest text-emerald-100/60">
              {kpi.label}
            </span>

            {/* Value */}
            <div className="mt-2">
              <span className="font-mono text-2xl font-medium tracking-tight text-white">
                {kpi.value}
              </span>
            </div>

            {/* Delta Badge */}
            <div className="mt-2">
              <span
                className={`inline-block rounded px-1.5 py-0.5 font-mono text-[11px] font-medium ${
                  kpi.deltaType === "positive"
                    ? "bg-[#00E599]/10 text-[#00E599]"
                    : kpi.deltaType === "negative"
                      ? "bg-[#FF4D4D]/10 text-[#FF4D4D]"
                      : "bg-[#F5A623]/10 text-[#F5A623]"
                }`}
              >
                {kpi.delta}
              </span>
            </div>

            {/* Subtext */}
            {kpi.subtext && (
              <span className="mt-auto block pt-2 text-[10px] text-emerald-100/30">
                {kpi.subtext}
              </span>
            )}
          </div>
        </EmeraldGlassCard>
      ))}
    </div>
  );
}

export default KpiGridWidget;
