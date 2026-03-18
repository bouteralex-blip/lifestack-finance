"use client"

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts"
import {
  LiquidGlassCard,
  InnerPlate,
  CardLabel,
  CardMetric,
} from "./LiquidGlassCard"

// =============================================================================
// Types
// =============================================================================

export interface MonthData {
  month: string
  income: number
  expenses: number
  savings: number
  tax: number
}

export interface IncomeExpenseChartWidgetProps {
  data: MonthData[]
}

// =============================================================================
// Custom Tooltip (internal)
// =============================================================================

function GlassTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: Array<{ value: number; dataKey: string; color: string }>
  label?: string
}) {
  if (!active || !payload?.length) return null

  const labels: Record<string, string> = {
    income: "Income",
    expenses: "Living Expenses",
    savings: "Savings",
    tax: "Tax",
  }

  return (
    <div
      className="relative overflow-hidden rounded-xl border border-white/10"
      style={{
        backgroundColor: "rgba(255,255,255,0.06)",
        backdropFilter: "blur(20px) saturate(1.3) brightness(1.08)",
        WebkitBackdropFilter: "blur(20px) saturate(1.3) brightness(1.08)",
        boxShadow: [
          "inset 0 1px 1px rgba(255,255,255,0.2)",
          "inset 0 -1px 1px rgba(0,0,0,0.4)",
          "0 8px 32px rgba(0,0,0,0.5)",
          "0 0 60px rgba(0,0,0,0.15)",
        ].join(", "),
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
            <div key={p.dataKey} className="flex items-center justify-between gap-6">
              <div className="flex items-center gap-2">
                <div
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: p.color }}
                />
                <span className="font-sans text-xs text-[#94A3B8]">
                  {labels[p.dataKey] || p.dataKey}
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
  )
}

// =============================================================================
// Y-axis formatter (internal)
// =============================================================================

function formatYAxis(value: number): string {
  if (value >= 1000) return `\u00A3${(value / 1000).toFixed(0)}k`
  return `\u00A3${value}`
}

// =============================================================================
// Component
// =============================================================================

export function IncomeExpenseChartWidget({ data }: IncomeExpenseChartWidgetProps) {
  // Calculate totals
  const totalIncome = data.reduce((s, d) => s + d.income, 0)
  const totalExpenses = data.reduce((s, d) => s + d.expenses, 0)
  const savingsRate = (
    ((totalIncome - totalExpenses) / totalIncome) *
    100
  ).toFixed(1)

  return (
    <LiquidGlassCard
      edgeThickness={1.5}
      cornerHighlight={0.7}
      blur={18}
      backlightColor="245,166,35"
      backlightIntensity={0.05}
    >
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
            <CardLabel>Avg Monthly</CardLabel>
            <CardMetric className="mt-0.5 block text-lg">
              {`\u00A3${Math.round(totalIncome / data.length).toLocaleString("en-GB")}`}
            </CardMetric>
          </div>
          <div>
            <CardLabel>Savings Rate</CardLabel>
            <span className="mt-0.5 block font-mono text-lg font-bold text-[#00D4AA]">
              {savingsRate}%
            </span>
          </div>
        </div>
      </div>

      {/* Stacked Bar Chart */}
      <div className="mt-6 h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            barCategoryGap="20%"
          >
            <CartesianGrid
              horizontal={true}
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
                fontFamily: "var(--font-mono, monospace)",
              }}
              dy={8}
            />

            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{
                fill: "#94A3B8",
                fontSize: 11,
                fontFamily: "var(--font-mono, monospace)",
              }}
              tickFormatter={formatYAxis}
              width={55}
            />

            <Tooltip
              content={<GlassTooltip />}
              cursor={{
                fill: "rgba(255,255,255,0.03)",
                radius: 4,
              }}
            />

            <Bar
              dataKey="expenses"
              stackId="cashflow"
              fill="#FF5C7A"
              radius={[0, 0, 0, 0]}
            >
              {data.map((_, index) => (
                <Cell
                  key={`exp-${index}`}
                  style={{
                    filter: "drop-shadow(0 0 3px rgba(255, 92, 122, 0.2))",
                  }}
                />
              ))}
            </Bar>

            <Bar
              dataKey="tax"
              stackId="cashflow"
              fill="#F5A623"
              radius={[0, 0, 0, 0]}
            >
              {data.map((_, index) => (
                <Cell
                  key={`tax-${index}`}
                  style={{
                    filter: "drop-shadow(0 0 3px rgba(245, 166, 35, 0.15))",
                  }}
                />
              ))}
            </Bar>

            <Bar
              dataKey="savings"
              stackId="cashflow"
              fill="#00D4AA"
              radius={[4, 4, 0, 0]}
            >
              {data.map((_, index) => (
                <Cell
                  key={`sav-${index}`}
                  style={{
                    filter: "drop-shadow(0 0 4px rgba(0, 212, 170, 0.25))",
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
          <InnerPlate key={stat.label}>
            <CardLabel>{stat.label}</CardLabel>
            <span
              className={`mt-0.5 block font-mono text-sm font-bold ${stat.color}`}
            >
              {stat.value}
            </span>
          </InnerPlate>
        ))}
      </div>
    </LiquidGlassCard>
  )
}
