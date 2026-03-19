"use client";

/**
 * ContributionHeatmapWidget.jsx
 *
 * GitHub-style contribution heatmap grid.
 * Renders a 7-row (days of week) x N-column (weeks) grid of intensity cells.
 *
 * Props:
 *   data       - Array of { date (string YYYY-MM-DD), count (number) }
 *   title      - optional heading
 *   subtitle   - optional secondary text
 *   colorScale - optional array of 5 hex colors from empty to max intensity
 *                defaults to emerald scale
 *
 * AE Glass: bg-white/[0.08] backdrop-blur-[40px] saturate-[2.0]
 */

import { useState, useMemo } from "react";

const DEFAULT_COLORS = [
  "rgba(255,255,255,0.04)", // 0 - empty
  "#064E3B",               // 1 - low
  "#047857",               // 2 - medium-low
  "#10B981",               // 3 - medium-high
  "#00E599",               // 4 - max
];

const DAY_LABELS = ["Mon", "", "Wed", "", "Fri", "", ""];

function getIntensity(count, maxCount) {
  if (!count || count <= 0) return 0;
  const pct = count / maxCount;
  if (pct <= 0.25) return 1;
  if (pct <= 0.50) return 2;
  if (pct <= 0.75) return 3;
  return 4;
}

export function ContributionHeatmapWidget({
  data,
  title = "Contribution Activity",
  subtitle = "Daily activity over the last year",
  colorScale,
}) {
  const colors = colorScale || DEFAULT_COLORS;
  const [hoveredCell, setHoveredCell] = useState(null);

  const { weeks, maxCount, totalCount } = useMemo(() => {
    const items = data || [];
    const countMap = {};
    let max = 0;
    let total = 0;

    items.forEach((d) => {
      countMap[d.date] = d.count;
      if (d.count > max) max = d.count;
      total += d.count;
    });

    // Build 52 weeks x 7 days grid
    const today = new Date();
    const weeksArr = [];

    // Find the last Sunday (or today if Sunday)
    const lastDay = new Date(today);
    lastDay.setDate(lastDay.getDate() + (6 - lastDay.getDay()));

    const startDay = new Date(lastDay);
    startDay.setDate(startDay.getDate() - 52 * 7 + 1);

    let currentWeek = [];
    const cursor = new Date(startDay);

    while (cursor <= lastDay) {
      const dateStr = cursor.toISOString().slice(0, 10);
      currentWeek.push({
        date: dateStr,
        count: countMap[dateStr] || 0,
        dayOfWeek: cursor.getDay(),
      });

      if (currentWeek.length === 7) {
        weeksArr.push(currentWeek);
        currentWeek = [];
      }

      cursor.setDate(cursor.getDate() + 1);
    }

    if (currentWeek.length) {
      weeksArr.push(currentWeek);
    }

    return { weeks: weeksArr, maxCount: max || 1, totalCount: total };
  }, [data]);

  const cellSize = 12;
  const cellGap = 3;
  const labelW = 28;
  const svgW = labelW + weeks.length * (cellSize + cellGap);
  const svgH = 7 * (cellSize + cellGap) + 20;

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
        <div className="flex items-start justify-between">
          <div>
            <span className="text-[11px] font-sans font-medium uppercase tracking-widest text-emerald-100/60">
              {title}
            </span>
            <p className="mt-1 text-[11px] text-emerald-100/30">{subtitle}</p>
          </div>
          <span className="font-mono text-sm font-bold text-white">
            {totalCount.toLocaleString("en-GB")} total
          </span>
        </div>

        <div className="mt-4 overflow-x-auto rounded-xl border border-white/5 bg-black/30 p-4" style={{ boxShadow: "inset 0 2px 6px rgba(0,0,0,0.6), inset 0 0 1px rgba(255,255,255,0.05)" }}>
          <svg viewBox={`0 0 ${svgW} ${svgH}`} width="100%" height={svgH}>
            {/* Day labels */}
            {DAY_LABELS.map((label, i) => (
              <text
                key={`day-${i}`}
                x={labelW - 6}
                y={i * (cellSize + cellGap) + cellSize - 1}
                textAnchor="end"
                fill="rgba(255,255,255,0.3)"
                fontSize="9"
                fontFamily="monospace"
                style={{ visibility: label ? "visible" : "hidden" }}
              >
                {label || "."}
              </text>
            ))}

            {/* Grid cells - flattened to single array */}
            {weeks.flatMap((week, wi) =>
              week.map((day, di) => {
                const intensity = getIntensity(day.count, maxCount);
                const x = labelW + wi * (cellSize + cellGap);
                const y = di * (cellSize + cellGap);
                const isHovered = hoveredCell?.date === day.date;

                return (
                  <rect
                    key={`${wi}-${di}`}
                    x={x}
                    y={y}
                    width={cellSize}
                    height={cellSize}
                    rx={2}
                    fill={colors[intensity]}
                    opacity={isHovered ? 1 : 0.85}
                    stroke={isHovered ? "rgba(255,255,255,0.3)" : "none"}
                    strokeWidth={1}
                    onMouseEnter={() => setHoveredCell(day)}
                    onMouseLeave={() => setHoveredCell(null)}
                    style={{ cursor: "default", transition: "opacity 0.15s" }}
                  />
                );
              })
            )}
          </svg>

          {/* Hover tooltip */}
          {hoveredCell && (
            <div className="mt-2 text-center text-xs text-emerald-100/50">
              <span className="font-mono text-white">{hoveredCell.count}</span>
              {" contributions on "}
              <span className="font-mono">{hoveredCell.date}</span>
            </div>
          )}

          {/* Intensity legend */}
          <div className="mt-3 flex items-center justify-end gap-1.5">
            <span className="mr-1 text-[10px] text-emerald-100/40">Less</span>
            {colors.map((c, i) => (
              <div
                key={i}
                className="h-3 w-3 rounded-sm"
                style={{ backgroundColor: c }}
              />
            ))}
            <span className="ml-1 text-[10px] text-emerald-100/40">More</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ContributionHeatmapWidget;
