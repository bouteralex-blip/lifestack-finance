"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

/**
 * IncomeExpenseChartWidget.jsx
 *
 * Luminous stacked/segmented bar chart for monthly cash flow.
 *
 * Props:
 *   data - Array of { month, income, expenses, savings, tax }
 *
 * AE Glass: bg-white/[0.08] backdrop-blur-[40px] saturate-[2.0]
 */

// ─── Internal: Glass Tooltip ────────────────────────────────────────────────

const LABELS = {
  income: "Income",
  expenses: "Living Expenses",
  savings: "Savings",
  tax: "Tax",
};

function GlassTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;

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
        <span className="block font-sans text-xs text-[#94A3B8]">{label}</span>
        <div className="mt-2 flex flex-col gap-1.5">
          {payload.map((p) => (
            <div
              key={p.dataKey}
              className="flex items-center justify-between gap-6"
            >
              <div className="flex items-center gap-2">
                <div
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: p.color }}
                />
                <span className="font-sans text-xs text-[#94A3B8]">
                  {LABELS[p.dataKey] || p.dataKey}
                </span>
              </div>
              <span className="font-mono text-xs font-medium text-[#F8FAFC]">
                {`\u00A3${p.value.toLocaleString("en-GB")}`}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Internal: Y-axis formatter ─────────────────────────────────────────────

function formatYAxis(value) {
  if (value >= 1000) return `\u00A3${(value / 1000).toFixed(0)}k`;
  return `\u00A3${value}`;
}

// ─── Main ───────────────────────────────────────────────────────────────────

export function IncomeExpenseChartWidget({ data }) {
  if (!data || data.length === 0) return <div style={{display:'flex',alignItems:'center',justifyContent:'center',minHeight:80,color:'rgba(15,150,156,0.5)',fontSize:12,fontStyle:'italic',letterSpacing:'0.05em'}}>Awaiting Data Sync...</div>;
  const totalIncome = data.reduce((s, d) => s + d.income, 0);
  const totalExpenses = data.reduce((s, d) => s + d.expenses, 0);
  const savingsRate = (
    ((totalIncome - totalExpenses) / totalIncome) *
    100
  ).toFixed(1);

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
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h3 className="font-sans text-xs font-semibold uppercase tracking-[0.15em] text-[#94A3B8]">
              {"Income & Expense Breakdown"}
            </h3>
            <p className="mt-1 font-sans text-[11px] text-[#94A3B8] opacity-50">
              Monthly cash flow analysis
            </p>
          </div>
          <div className="flex gap-4">
            <div>
              <span className="font-sans text-sm text-[#94A3B8]">
                Avg Monthly
              </span>
              <span className="mt-0.5 block font-mono text-lg font-bold text-[#F8FAFC]">
                {`\u00A3${Math.round(totalIncome / data.length).toLocaleString("en-GB")}`}
              </span>
            </div>
            <div>
              <span className="font-sans text-sm text-[#94A3B8]">
                Savings Rate
              </span>
              <span className="mt-0.5 block font-mono text-lg font-bold text-[#00D4AA]">
                {savingsRate}%
              </span>
            </div>
          </div>
        </div>

        {/* Bar Chart */}
        <div className="mt-6 h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              barCategoryGap="20%"
            >
              <CartesianGrid
                horizontal
                vertical={false}
                stroke="rgba(255,255,255,0.04)"
              />
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{
                  fill: "#94A3B8",
                  fontSize: 11,
                  fontFamily: "monospace",
                }}
                dy={8}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{
                  fill: "#94A3B8",
                  fontSize: 11,
                  fontFamily: "monospace",
                }}
                tickFormatter={formatYAxis}
                width={55}
              />
              <Tooltip
                content={<GlassTooltip />}
                cursor={{ fill: "rgba(255,255,255,0.03)", radius: 4 }}
              />

              <Bar dataKey="expenses" stackId="cf" fill="#FF5C7A" radius={[0, 0, 0, 0]}>
                {data.map((_, i) => (
                  <Cell
                    key={`exp-${i}`}
                    style={{
                      filter: "drop-shadow(0 0 3px rgba(255,92,122,0.2))",
                    }}
                  />
                ))}
              </Bar>
              <Bar dataKey="tax" stackId="cf" fill="#F5A623" radius={[0, 0, 0, 0]}>
                {data.map((_, i) => (
                  <Cell
                    key={`tax-${i}`}
                    style={{
                      filter: "drop-shadow(0 0 3px rgba(245,166,35,0.15))",
                    }}
                  />
                ))}
              </Bar>
              <Bar dataKey="savings" stackId="cf" fill="#00D4AA" radius={[4, 4, 0, 0]}>
                {data.map((_, i) => (
                  <Cell
                    key={`sav-${i}`}
                    style={{
                      filter: "drop-shadow(0 0 4px rgba(0,212,170,0.25))",
                    }}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="mt-3 flex flex-wrap gap-5">
          {[
            { label: "Expenses", color: "#FF5C7A" },
            { label: "Tax", color: "#F5A623" },
            { label: "Savings", color: "#00D4AA" },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-2">
              <div
                className="h-2 w-2 rounded-full"
                style={{
                  backgroundColor: item.color,
                  boxShadow: `0 0 6px ${item.color}40`,
                }}
              />
              <span className="font-sans text-xs text-[#94A3B8]">
                {item.label}
              </span>
            </div>
          ))}
        </div>

        {/* Summary row */}
        <div className="mt-4 grid grid-cols-3 gap-3">
          {[
            {
              label: "Total Income",
              value: `\u00A3${totalIncome.toLocaleString("en-GB")}`,
              color: "text-[#F8FAFC]",
            },
            {
              label: "Total Expenses",
              value: `\u00A3${totalExpenses.toLocaleString("en-GB")}`,
              color: "text-[#FF5C7A]",
            },
            {
              label: "Net Saved",
              value: `\u00A3${(totalIncome - totalExpenses).toLocaleString("en-GB")}`,
              color: "text-[#00D4AA]",
            },
          ].map((stat) => (
            <div
              key={stat.label}
            className="rounded-lg bg-black/30 p-2"
            style={{
              boxShadow:
                "inset 0 2px 6px rgba(0,0,0,0.6), inset 0 0 1px rgba(255,255,255,0.05)",
            }}
            >
              <span className="font-sans text-sm text-[#94A3B8]">
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
    </div>
  );
}

export default IncomeExpenseChartWidget;
