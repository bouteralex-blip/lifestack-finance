"use client";

import { useState } from "react";

/**
 * CorrelationHeatmapWidget.jsx
 *
 * Matrix-style grid rendered as an HTML <table> to eliminate React key warnings.
 *
 * Props:
 *   data - { labels: string[], matrix: number[][] }
 */

function correlationColor(value) {
  if (value >= 0) {
    const t = Math.min(value, 1);
    return `rgba(0, 212, 170, ${(t * 0.7 + 0.05).toFixed(2)})`;
  }
  const t = Math.min(Math.abs(value), 1);
  return `rgba(255, 77, 77, ${(t * 0.7 + 0.05).toFixed(2)})`;
}

function correlationTextColor(value) {
  const abs = Math.abs(value);
  return abs > 0.5 ? "#F8FAFC" : "rgba(248,250,252,0.6)";
}

const MONO = "Geist Mono, monospace";

export function CorrelationHeatmapWidget({ data }) {
  const [hoveredCell, setHoveredCell] = useState(null);
  if (!data || !data.labels || !data.matrix) return <div style={{display:'flex',alignItems:'center',justifyContent:'center',minHeight:80,color:'rgba(15,150,156,0.5)',fontSize:12,fontStyle:'italic',letterSpacing:'0.05em'}}>Awaiting Data Sync...</div>;
  const { labels, matrix } = data;

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
        fontFamily: "Geist, sans-serif",
      }}
    >
      {/* AE specular shine */}
      <div
        className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-white/[0.2] to-transparent"
        aria-hidden="true"
      />
      {/* Primary glare */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(325deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.05) 15%, rgba(255,255,255,0.01) 28%, transparent 45%)",
        }}
        aria-hidden="true"
      />
      {/* Corner hotspot */}
      <div
        className="pointer-events-none absolute left-0 top-0 h-1/2 w-1/2"
        style={{
          background:
            "radial-gradient(ellipse at 0% 0%, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.08) 25%, transparent 60%)",
        }}
        aria-hidden="true"
      />
      {/* Top edge highlight */}
      <div
        className="pointer-events-none absolute left-[8%] right-[35%] top-0"
        style={{
          height: "1px",
          background:
            "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.7) 15%, rgba(255,255,255,0.9) 40%, rgba(255,255,255,0.4) 70%, transparent 100%)",
          filter: "blur(0.3px)",
        }}
        aria-hidden="true"
      />
      {/* Noise */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.018]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: "256px 256px",
        }}
        aria-hidden="true"
      />

      <div className="relative z-10">
        <div className="mb-6">
          <span className="text-[11px] font-medium uppercase tracking-widest text-emerald-100/60">
            Correlation Matrix
          </span>
          <p className="mt-1 text-[11px] text-emerald-100/30">
            Cross-asset correlation coefficients (trailing 12M)
          </p>
        </div>

        {/* Inner stabilized plate */}
        <div
          className="overflow-x-auto rounded-xl border border-white/5 bg-black/30 p-4"
          style={{
            boxShadow:
              "inset 0 2px 6px rgba(0,0,0,0.6), inset 0 0 1px rgba(255,255,255,0.05)",
          }}
        >
          {/* ── Table-based grid (no React list/key issues) ──────────── */}
          <table
            style={{
              borderCollapse: "separate",
              borderSpacing: "2px",
              width: "100%",
            }}
          >
            {/* Column header row */}
            <thead>
              <tr>
                {/* Corner cell */}
                <th style={{ width: 80 }} aria-hidden="true" />
                {labels.map((label) => (
                  <th
                    key={label}
                    style={{
                      padding: "0 0 8px 0",
                      verticalAlign: "bottom",
                      textAlign: "center",
                    }}
                  >
                    <span
                      style={{
                        fontFamily: MONO,
                        fontSize: 10,
                        fontWeight: 500,
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        color: "rgba(236,253,245,0.5)",
                        writingMode: "vertical-lr",
                        transform: "rotate(180deg)",
                        display: "inline-block",
                        maxHeight: 60,
                      }}
                    >
                      {label}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>

            {/* Data rows */}
            <tbody>
              {labels.map((rowLabel, ri) => (
                <tr key={rowLabel}>
                  {/* Row header */}
                  <td style={{ paddingRight: 8, verticalAlign: "middle" }}>
                    <span
                      style={{
                        fontFamily: MONO,
                        fontSize: 10,
                        fontWeight: 500,
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        color: "rgba(236,253,245,0.5)",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        display: "block",
                        maxWidth: 72,
                      }}
                    >
                      {rowLabel}
                    </span>
                  </td>

                  {/* Cells */}
                  {labels.map((colLabel, ci) => {
                    const value = matrix[ri][ci];
                    const isDiag = ri === ci;
                    const isHov =
                      hoveredCell !== null &&
                      hoveredCell[0] === ri &&
                      hoveredCell[1] === ci;

                    return (
                      <td
                        key={colLabel}
                        style={{
                          backgroundColor: isDiag
                            ? "rgba(255,255,255,0.08)"
                            : correlationColor(value),
                          borderRadius: 6,
                          textAlign: "center",
                          verticalAlign: "middle",
                          cursor: "crosshair",
                          aspectRatio: "1",
                          minHeight: 40,
                          padding: 0,
                          boxShadow: isHov
                            ? "0 0 12px rgba(255,255,255,0.15), inset 0 0 8px rgba(255,255,255,0.1)"
                            : "inset 0 1px 2px rgba(0,0,0,0.2)",
                          transform: isHov ? "scale(1.08)" : "scale(1)",
                          border: isHov
                            ? "1px solid rgba(255,255,255,0.2)"
                            : "1px solid rgba(255,255,255,0.03)",
                          transition: "all 0.15s",
                        }}
                        title={`${rowLabel} / ${colLabel}: ${value.toFixed(2)}`}
                        onMouseEnter={() => setHoveredCell([ri, ci])}
                        onMouseLeave={() => setHoveredCell(null)}
                      >
                        <span
                          style={{
                            fontFamily: MONO,
                            fontSize: 11,
                            fontWeight: 600,
                            color: correlationTextColor(value),
                          }}
                        >
                          {isDiag ? "1.00" : value.toFixed(2)}
                        </span>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Legend */}
        <div className="mt-4 flex items-center justify-center gap-3">
          <span
            className="text-[10px] text-[#FF4D4D]"
            style={{ fontFamily: MONO }}
          >
            -1.0
          </span>
          <div
            className="h-2 w-32 rounded-full"
            style={{
              background:
                "linear-gradient(90deg, rgba(255,77,77,0.7) 0%, rgba(255,77,77,0.1) 40%, rgba(255,255,255,0.05) 50%, rgba(0,212,170,0.1) 60%, rgba(0,212,170,0.7) 100%)",
            }}
          />
          <span
            className="text-[10px] text-[#00D4AA]"
            style={{ fontFamily: MONO }}
          >
            +1.0
          </span>
        </div>

        {/* Hover tooltip */}
        {hoveredCell && (
          <div className="mt-3 flex items-center justify-center">
            <div
              className="rounded-lg border border-white/10 bg-black/40 px-3 py-1.5"
              style={{ boxShadow: "inset 0 1px 4px rgba(0,0,0,0.5)" }}
            >
              <span className="text-xs text-emerald-100/60" style={{ fontFamily: MONO }}>
                {labels[hoveredCell[0]]}
              </span>
              <span className="mx-2 text-emerald-100/30">{" / "}</span>
              <span className="text-xs text-emerald-100/60" style={{ fontFamily: MONO }}>
                {labels[hoveredCell[1]]}
              </span>
              <span
                className="ml-3 text-sm font-bold text-[#F8FAFC]"
                style={{ fontFamily: MONO }}
              >
                {matrix[hoveredCell[0]][hoveredCell[1]].toFixed(2)}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CorrelationHeatmapWidget;
