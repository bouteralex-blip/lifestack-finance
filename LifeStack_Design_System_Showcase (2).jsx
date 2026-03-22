import { useState, useEffect, useMemo } from "react";
import {
  AreaChart, Area, BarChart, Bar, ComposedChart, Line,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, ReferenceLine
} from "recharts";

// ═══════════════════════════════════════════════════════════════════
// DESIGN TOKENS — Single source of truth
// ═══════════════════════════════════════════════════════════════════
const C = {
  bg: "#05161A", bgAlt: "#072E33", surface: "#0A3A40", raised: "#0D4A52",
  t1: "rgba(255,255,255,0.92)", t2: "rgba(255,255,255,0.68)",
  t3: "rgba(255,255,255,0.45)", t4: "rgba(255,255,255,0.25)",
  cyan: "#00BCD4", cyanLight: "#4DD0E1", cyanSubtle: "rgba(0,188,212,0.12)",
  gold: "#FFB300", goldSubtle: "rgba(255,179,0,0.10)",
  blue: "#2979FF", purple: "#8B5CF6",
  pos: "#00C853", posMuted: "#089981", posBg: "rgba(0,200,83,0.12)",
  neg: "#FF1744", negMuted: "#F23645", negBg: "rgba(255,23,68,0.12)",
  warn: "#FFC107", warnBg: "rgba(255,193,7,0.10)",
  ch1: "#3B82F6", ch2: "#10B981", ch3: "#F59E0B", ch4: "#8B5CF6",
  ch5: "#06B6D4", ch6: "#EC4899", ch7: "#F97316", ch8: "#A78BFA",
  border: "rgba(255,255,255,0.08)", borderStrong: "rgba(255,255,255,0.15)",
  grid: "rgba(255,255,255,0.06)", tick: "#94A3B8",
};

const F = {
  sans: "'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif",
  mono: "'JetBrains Mono', 'SF Mono', 'Fira Code', monospace",
};

// ═══════════════════════════════════════════════════════════════════
// GLASS SYSTEM
// ═══════════════════════════════════════════════════════════════════
const quietGlass = {
  background: "rgba(255,255,255,0.04)",
  backdropFilter: "blur(12px) saturate(150%)",
  WebkitBackdropFilter: "blur(12px) saturate(150%)",
  border: `1px solid ${C.border}`,
  borderRadius: 16,
  boxShadow: "0 4px 24px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.06)",
  position: "relative",
  overflow: "hidden",
};

const heavyGlass = {
  background: "rgba(255,255,255,0.08)",
  backdropFilter: "blur(20px) saturate(180%)",
  WebkitBackdropFilter: "blur(20px) saturate(180%)",
  border: `1px solid ${C.borderStrong}`,
  borderRadius: 20,
  boxShadow: "0 8px 32px rgba(0,0,0,0.3), 0 2px 8px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.12)",
  position: "relative",
  overflow: "hidden",
};

// Specular highlight
const Shine = () => (
  <div style={{ position: "absolute", top: 0, left: "8%", right: "30%", height: 1,
    background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.25) 40%, rgba(255,255,255,0.4) 50%, rgba(255,255,255,0.25) 60%, transparent)",
    pointerEvents: "none", zIndex: 2 }} />
);

const Noise = () => (
  <div style={{ position: "absolute", inset: 0, opacity: 0.03, pointerEvents: "none", borderRadius: "inherit", zIndex: 2,
    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
    backgroundSize: "128px 128px" }} />
);

// ═══════════════════════════════════════════════════════════════════
// GLASS CARD COMPONENTS
// ═══════════════════════════════════════════════════════════════════
const GlassCard = ({ children, style, heavy, span }) => (
  <div style={{ ...(heavy ? heavyGlass : quietGlass), gridColumn: span ? `span ${span}` : undefined, ...style }}>
    <Shine /><Noise />{children}
  </div>
);

const CardHeader = ({ title, subtitle, badge, right }) => (
  <div style={{ padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center",
    borderBottom: `1px solid ${C.border}` }}>
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ fontSize: 15, fontWeight: 700, color: C.t1, fontFamily: F.sans }}>{title}</span>
        {badge && <span style={{ fontSize: 9, fontWeight: 700, padding: "3px 8px", borderRadius: 6,
          background: badge.bg || C.cyanSubtle, color: badge.color || C.cyan, letterSpacing: 0.8,
          textTransform: "uppercase", fontFamily: F.mono }}>{badge.text}</span>}
      </div>
      {subtitle && <div style={{ fontSize: 11, color: C.t3, marginTop: 3, fontFamily: F.sans }}>{subtitle}</div>}
    </div>
    {right}
  </div>
);

// ═══════════════════════════════════════════════════════════════════
// KPI TILE — Horizon UI MiniStatistics
// ═══════════════════════════════════════════════════════════════════
const KpiTile = ({ label, value, delta, deltaLabel, severity, icon, iconBg, sparkData }) => {
  const sev = severity === "critical" ? C.neg : severity === "warning" ? C.warn : severity === "success" ? C.pos : null;
  const deltaColor = delta > 0 ? C.pos : delta < 0 ? C.neg : C.t3;
  const sparkMax = sparkData ? Math.max(...sparkData) : 0;
  const sparkMin = sparkData ? Math.min(...sparkData) : 0;
  const sparkRange = sparkMax - sparkMin || 1;
  const sparkW = 72, sparkH = 22;
  const sparkPoints = sparkData?.map((v, i) =>
    `${(i / (sparkData.length - 1)) * sparkW},${sparkH - ((v - sparkMin) / sparkRange) * sparkH}`
  ).join(" ");

  return (
    <div style={{ ...quietGlass, padding: "18px 20px", display: "flex", alignItems: "center", gap: 14,
      borderLeft: sev ? `3px solid ${sev}` : undefined, minHeight: 90 }}>
      <Shine />
      {icon && <div style={{ width: 44, height: 44, borderRadius: 12,
        background: iconBg || C.cyanSubtle, display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0, fontSize: 18 }}>{icon}</div>}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 12, fontWeight: 500, color: C.t2, fontFamily: F.sans, marginBottom: 4 }}>{label}</div>
        <div style={{ fontSize: 26, fontWeight: 700, color: C.t1, fontFamily: F.mono, lineHeight: 1.1, letterSpacing: -0.5 }}>{value}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
          {delta !== undefined && (
            <span style={{ fontSize: 12, fontWeight: 700, color: deltaColor, fontFamily: F.mono }}>
              {delta > 0 ? "▲" : delta < 0 ? "▼" : "—"} {Math.abs(delta).toFixed(2)}%
            </span>
          )}
          {deltaLabel && <span style={{ fontSize: 11, color: C.t3 }}>{deltaLabel}</span>}
        </div>
      </div>
      {sparkData && (
        <svg width={sparkW} height={sparkH} style={{ flexShrink: 0, opacity: 0.7 }}>
          <polyline points={sparkPoints} fill="none" stroke={delta >= 0 ? C.pos : C.neg}
            strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════
// GLASS TOOLTIP
// ═══════════════════════════════════════════════════════════════════
const GlassTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "rgba(10,20,30,0.88)", backdropFilter: "blur(16px)",
      border: `1px solid ${C.border}`, borderRadius: 12, padding: "12px 16px",
      boxShadow: "0 8px 32px rgba(0,0,0,0.5)", minWidth: 180 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: C.t3, textTransform: "uppercase",
        letterSpacing: 1, marginBottom: 8, fontFamily: F.sans }}>{label}</div>
      {payload.map((entry, i) => (
        <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, marginBottom: 4 }}>
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: entry.color,
              boxShadow: `0 0 6px ${entry.color}` }} />
            <span style={{ fontSize: 12, color: C.t2, fontFamily: F.sans }}>{entry.name}</span>
          </span>
          <span style={{ fontSize: 12, fontWeight: 600, color: C.t1, fontFamily: F.mono }}>
            {typeof entry.value === "number" ? `£${entry.value.toLocaleString()}` : entry.value}
          </span>
        </div>
      ))}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════
// CONCENTRIC PROGRESS RINGS
// ═══════════════════════════════════════════════════════════════════
const ProgressRings = ({ rings }) => {
  const [animated, setAnimated] = useState(false);
  useEffect(() => { const t = setTimeout(() => setAnimated(true), 300); return () => clearTimeout(t); }, []);
  const size = 180, cx = size / 2, cy = size / 2, sw = 14;
  const radii = [72, 52, 34];

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <defs>
          {rings.map((r, i) => (
            <filter key={i} id={`rGlow${i}`}>
              <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor={r.color} floodOpacity="0.5" />
            </filter>
          ))}
        </defs>
        {rings.map((ring, i) => {
          const r = radii[i];
          const circ = 2 * Math.PI * r;
          const pct = Math.min(ring.value / ring.max * 100, 100);
          const offset = animated ? circ - (pct / 100) * circ : circ;
          return (
            <g key={i}>
              <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={sw} />
              <circle cx={cx} cy={cy} r={r} fill="none" stroke={ring.color} strokeWidth={sw}
                strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
                transform={`rotate(-90 ${cx} ${cy})`} filter={`url(#rGlow${i})`}
                style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)" }} />
            </g>
          );
        })}
      </svg>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {rings.map((ring, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ width: 10, height: 10, borderRadius: "50%", background: ring.color,
              boxShadow: `0 0 8px ${ring.color}` }} />
            <span style={{ fontSize: 12, color: C.t2, fontFamily: F.sans }}>{ring.label}</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: C.t1, fontFamily: F.mono, marginLeft: "auto" }}>
              {Math.round(ring.value / ring.max * 100)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════
// MONTE CARLO FAN CHART (pure SVG)
// ═══════════════════════════════════════════════════════════════════
const MonteCarloFan = ({ data }) => {
  const W = 520, H = 200, pad = { t: 10, r: 10, b: 30, l: 50 };
  const iW = W - pad.l - pad.r, iH = H - pad.t - pad.b;
  const maxV = Math.max(...data.map(d => d.p90));
  const minV = Math.min(...data.map(d => d.p10));
  const sx = (i) => pad.l + (i / (data.length - 1)) * iW;
  const sy = (v) => pad.t + iH - ((v - minV) / (maxV - minV)) * iH;

  const fanPath = (keyTop, keyBot) => {
    const top = data.map((d, i) => `${sx(i)},${sy(d[keyTop])}`).join(" L ");
    const bot = [...data].reverse().map((d, i) => `${sx(data.length - 1 - i)},${sy(d[keyBot])}`).join(" L ");
    return `M ${top} L ${bot} Z`;
  };
  const linePath = (key) => data.map((d, i) => `${i === 0 ? "M" : "L"} ${sx(i)},${sy(d[key])}`).join(" ");

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ overflow: "visible" }}>
      <defs>
        <linearGradient id="fanGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={C.ch1} stopOpacity={0.25} />
          <stop offset="100%" stopColor={C.ch1} stopOpacity={0.02} />
        </linearGradient>
        <filter id="mcGlow"><feGaussianBlur stdDeviation="3" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      {/* Grid lines */}
      {[0, 0.25, 0.5, 0.75, 1].map((p, i) => (
        <line key={i} x1={pad.l} x2={W - pad.r} y1={pad.t + iH * (1 - p)} y2={pad.t + iH * (1 - p)}
          stroke={C.grid} strokeWidth={1} />
      ))}
      {/* Fan bands */}
      <path d={fanPath("p90", "p10")} fill="url(#fanGrad)" />
      <path d={fanPath("p75", "p25")} fill={C.ch1} fillOpacity={0.12} />
      {/* Median line with glow */}
      <path d={linePath("p50")} fill="none" stroke={C.ch1} strokeWidth={2.5}
        strokeLinecap="round" filter="url(#mcGlow)" />
      {/* Today marker */}
      <line x1={sx(2)} y1={pad.t} x2={sx(2)} y2={H - pad.b} stroke={C.t3} strokeWidth={1} strokeDasharray="4 3" />
      <text x={sx(2)} y={pad.t - 4} fill={C.t3} fontSize={9} textAnchor="middle" fontFamily={F.sans}>Today</text>
      {/* X-axis labels */}
      {data.map((d, i) => i % 2 === 0 && (
        <text key={i} x={sx(i)} y={H - 6} fill={C.tick} fontSize={10} textAnchor="middle" fontFamily={F.sans}>{d.year}</text>
      ))}
      {/* Y-axis labels */}
      {[minV, minV + (maxV - minV) * 0.5, maxV].map((v, i) => (
        <text key={i} x={pad.l - 8} y={sy(v) + 4} fill={C.tick} fontSize={10} textAnchor="end" fontFamily={F.mono}>
          £{Math.round(v / 1000)}k
        </text>
      ))}
    </svg>
  );
};

// ═══════════════════════════════════════════════════════════════════
// SIDEBAR NAV
// ═══════════════════════════════════════════════════════════════════
const navSections = [
  { label: "COMMAND CENTRE", items: [
    { icon: "◉", label: "Intelligence Hub", id: "hub", accent: C.cyan },
    { icon: "£", label: "Wealth Engine", id: "wealth", accent: C.gold },
  ]},
  { label: "RESEARCH", items: [
    { icon: "≡", label: "Market & Research", id: "markets", accent: C.ch1 },
    { icon: "◆", label: "Career & Infra", id: "career", accent: C.ch5 },
  ]},
  { label: "SYSTEM", items: [
    { icon: "⚙", label: "Systems & Info", id: "systems", accent: C.purple },
  ]},
];

const Sidebar = ({ active, onNav }) => (
  <div style={{ width: 260, minWidth: 260, height: "100vh", position: "sticky", top: 0,
    background: C.bgAlt, borderRight: `1px solid ${C.border}`, display: "flex",
    flexDirection: "column", padding: "20px 0", overflowY: "auto", zIndex: 50 }}>
    {/* Brand */}
    <div style={{ padding: "0 20px 20px", borderBottom: `1px solid ${C.border}` }}>
      <div style={{ fontSize: 9, fontWeight: 800, color: C.cyan, letterSpacing: 3, textTransform: "uppercase", fontFamily: F.mono }}>LIFESTACK OS</div>
      <div style={{ fontSize: 18, fontWeight: 800, color: C.t1, marginTop: 4, fontFamily: F.sans }}>Wealth Intelligence</div>
      <div style={{ fontSize: 10, color: C.cyan, fontWeight: 600, marginTop: 2 }}>v4.0 · Horizon Glass</div>
      <div style={{ fontSize: 9, color: C.t3, marginTop: 4 }}>22 Mar 2026 · Live Data</div>
    </div>
    {/* Nav groups */}
    {navSections.map(sec => (
      <div key={sec.label} style={{ marginTop: 16 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: C.t3, letterSpacing: 1.5, textTransform: "uppercase",
          padding: "0 20px", marginBottom: 6, fontFamily: F.sans }}>{sec.label}</div>
        {sec.items.map(item => {
          const isActive = active === item.id;
          return (
            <div key={item.id} onClick={() => onNav(item.id)} style={{
              display: "flex", alignItems: "center", gap: 12, padding: "10px 20px", cursor: "pointer",
              borderLeft: isActive ? `3px solid ${item.accent}` : "3px solid transparent",
              background: isActive ? `${item.accent}12` : "transparent",
              transition: "all 0.15s ease",
            }}>
              <span style={{ fontSize: 14, color: isActive ? item.accent : C.t3, width: 20, textAlign: "center" }}>{item.icon}</span>
              <span style={{ fontSize: 13, fontWeight: isActive ? 700 : 400,
                color: isActive ? C.t1 : C.t2, fontFamily: F.sans }}>{item.label}</span>
            </div>
          );
        })}
      </div>
    ))}
    {/* Data status */}
    <div style={{ marginTop: "auto", padding: "16px 20px", borderTop: `1px solid ${C.border}` }}>
      <div style={{ fontSize: 10, color: C.t3, marginBottom: 6 }}>DATA QUALITY</div>
      <div style={{ height: 6, borderRadius: 3, background: "rgba(255,255,255,0.06)", overflow: "hidden", display: "flex" }}>
        <div style={{ width: "38%", background: C.pos, borderRadius: 3 }} />
        <div style={{ width: "42%", background: C.ch1 }} />
        <div style={{ width: "20%", background: C.warn }} />
      </div>
      <div style={{ display: "flex", gap: 12, marginTop: 6 }}>
        {[{ c: C.pos, l: "Live 10" }, { c: C.ch1, l: "Fresh 20" }, { c: C.warn, l: "Stale 16" }].map(d => (
          <span key={d.l} style={{ fontSize: 9, color: C.t3, display: "flex", alignItems: "center", gap: 4 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: d.c }} />{d.l}
          </span>
        ))}
      </div>
    </div>
  </div>
);

// ═══════════════════════════════════════════════════════════════════
// SAMPLE DATA
// ═══════════════════════════════════════════════════════════════════
const nwData = [
  { d: "Oct", nw: 235400, a: 368200 }, { d: "Nov", nw: 241800, a: 374600 },
  { d: "Dec", nw: 238200, a: 370100 }, { d: "Jan", nw: 244600, a: 377400 },
  { d: "Feb", nw: 239100, a: 371800 }, { d: "Mar", nw: 247000, a: 375700 },
];
const monthlyReturns = [
  { m: "Oct", r: 2.1, b: 1.8 }, { m: "Nov", r: 2.7, b: 2.1 }, { m: "Dec", r: -1.5, b: -0.8 },
  { m: "Jan", r: 2.6, b: 1.9 }, { m: "Feb", r: -2.2, b: -1.4 }, { m: "Mar", r: 3.3, b: 2.4 },
];
const factorData = [
  { f: "Growth", p: 0.72, b: 0.55 }, { f: "Value", p: 0.31, b: 0.45 },
  { f: "Momentum", p: 0.65, b: 0.50 }, { f: "Quality", p: 0.58, b: 0.60 },
  { f: "Low Vol", p: 0.22, b: 0.40 }, { f: "Size", p: 0.45, b: 0.35 },
];
const allocData = [
  { name: "ETFs", value: 28, color: C.ch1 }, { name: "Pension", value: 22, color: C.ch5 },
  { name: "Cash/FD", value: 16, color: "#78909C" }, { name: "Crypto", value: 13, color: C.ch4 },
  { name: "Investments", value: 12, color: C.ch2 }, { name: "Stocks", value: 5, color: C.ch6 },
  { name: "Other", value: 4, color: C.ch7 },
];
const mcData = [
  { year: 2024, p10: 210, p25: 225, p50: 247, p75: 270, p90: 295 },
  { year: 2025, p10: 220, p25: 245, p50: 275, p75: 310, p90: 350 },
  { year: 2026, p10: 230, p25: 268, p50: 312, p75: 365, p90: 425 },
  { year: 2027, p10: 235, p25: 290, p50: 358, p75: 435, p90: 520 },
  { year: 2028, p10: 238, p25: 310, p50: 410, p75: 520, p90: 640 },
  { year: 2029, p10: 240, p25: 330, p50: 470, p75: 620, p90: 790 },
  { year: 2030, p10: 242, p25: 350, p50: 540, p75: 740, p90: 980 },
];
const holdingsTop = [
  { name: "JPM Global Eq.", val: "£65.2k", ret: "+12.4%", cls: "ETF", w: "ISA" },
  { name: "BTC (Ledger)", val: "£29.9k", ret: "-18.2%", cls: "Crypto", w: "GIA" },
  { name: "iShares Core MSCI", val: "£24.8k", ret: "+8.7%", cls: "ETF", w: "ISA" },
  { name: "Pension (Aviva)", val: "£82.1k", ret: "+6.3%", cls: "Pension", w: "SIPP" },
  { name: "Monzo Cash", val: "£15.8k", ret: "+0.1%", cls: "Cash", w: "GIA" },
];
const alertsData = [
  { sev: "critical", metric: "Concentration", msg: "HHI 2,847 — single position risk elevated" },
  { sev: "warning", metric: "ISA Deadline", msg: "29 days to utilise £20k ISA allowance" },
  { sev: "warning", metric: "Drift", msg: "Crypto overweight by 4.2% vs target allocation" },
  { sev: "info", metric: "Rebalance", msg: "Quarterly review due — 3 trade proposals generated" },
];

// ═══════════════════════════════════════════════════════════════════
// MAIN DASHBOARD
// ═══════════════════════════════════════════════════════════════════
export default function LifeStackShowcase() {
  const [activeNav, setActiveNav] = useState("wealth");
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: C.bg, fontFamily: F.sans, color: C.t1 }}>
      {/* Ambient glow orbs */}
      <div style={{ position: "fixed", top: "-15%", right: "-8%", width: "55vw", height: "55vw",
        background: `radial-gradient(circle, ${C.cyan}08 0%, transparent 65%)`, pointerEvents: "none", zIndex: 0 }} />
      <div style={{ position: "fixed", bottom: "-15%", left: "-8%", width: "45vw", height: "45vw",
        background: `radial-gradient(circle, ${C.ch1}06 0%, transparent 65%)`, pointerEvents: "none", zIndex: 0 }} />

      {/* Sidebar */}
      <Sidebar active={activeNav} onNav={setActiveNav} />

      {/* Main content */}
      <div style={{ flex: 1, padding: 24, overflowY: "auto", display: "flex", flexDirection: "column", gap: 24, position: "relative", zIndex: 1 }}>

        {/* HEADER BAR */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 22, fontWeight: 800, color: C.t1 }}>Executive Summary</div>
            <div style={{ fontSize: 12, color: C.t3, marginTop: 2 }}>T1 · Portfolio Overview · 22 March 2026</div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {["1M", "3M", "6M", "YTD", "1Y"].map(p => (
              <button key={p} style={{ padding: "6px 14px", borderRadius: 8, fontSize: 11, fontWeight: 600,
                background: p === "6M" ? C.cyanSubtle : "rgba(255,255,255,0.04)",
                color: p === "6M" ? C.cyan : C.t3, border: `1px solid ${p === "6M" ? C.cyan + "30" : C.border}`,
                cursor: "pointer", fontFamily: F.mono, transition: "all 0.15s" }}>{p}</button>
            ))}
          </div>
        </div>

        {/* KPI STRIP — 6 tiles */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 16 }}>
          <KpiTile label="Net Worth" value="£247,000" delta={4.92} deltaLabel="6M" severity="success"
            icon="💰" iconBg={C.cyanSubtle} sparkData={nwData.map(d => d.nw)} />
          <KpiTile label="Total Assets" value="£375,700" delta={2.14} deltaLabel="6M"
            icon="📊" iconBg={C.goldSubtle} sparkData={nwData.map(d => d.a)} />
          <KpiTile label="6M Return" value="+4.92%" delta={4.92} deltaLabel="vs MSCI +3.8%"
            icon="📈" iconBg={C.posBg} />
          <KpiTile label="FIRE Progress" value="13.7%" delta={1.2} deltaLabel="target 100%" severity="warning"
            icon="🔥" iconBg={C.warnBg} />
          <KpiTile label="Cash Buffer" value="2.6 mo" delta={-0.4} deltaLabel="vs 3mo target" severity="critical"
            icon="🛡" iconBg={C.negBg} />
          <KpiTile label="Active Return" value="+1.12%" delta={1.12} deltaLabel="vs benchmark"
            icon="⚡" iconBg="rgba(139,92,246,0.12)" />
        </div>

        {/* CHART ZONE — 8+4 split */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: 20 }}>

          {/* Net Worth Trajectory — span 8 */}
          <GlassCard span={8}>
            <CardHeader title="Net Worth Trajectory" subtitle="Historical + 6-month trailing"
              badge={{ text: "LIVE", bg: C.posBg, color: C.pos }}
              right={<span style={{ fontSize: 11, color: C.t3, fontFamily: F.mono }}>Updated 03:15</span>} />
            <div style={{ padding: "16px 20px", position: "relative", zIndex: 1 }}>
              {mounted && (
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={nwData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="fillNW" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={C.ch2} stopOpacity={0.35} />
                        <stop offset="50%" stopColor={C.ch2} stopOpacity={0.08} />
                        <stop offset="95%" stopColor={C.ch2} stopOpacity={0} />
                      </linearGradient>
                      <filter id="glowNW" height="300%">
                        <feGaussianBlur stdDeviation="4" result="b" />
                        <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
                      </filter>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={C.grid} vertical={false} />
                    <XAxis dataKey="d" axisLine={false} tickLine={false} tick={{ fill: C.tick, fontSize: 11 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: C.tick, fontSize: 11, fontFamily: F.mono }}
                      tickFormatter={v => `£${(v / 1000).toFixed(0)}k`} width={55} />
                    <Tooltip content={<GlassTooltip />} cursor={{ stroke: "rgba(255,255,255,0.08)" }} />
                    <Area type="monotone" dataKey="nw" name="Net Worth" stroke={C.ch2} strokeWidth={2.5}
                      fillOpacity={1} fill="url(#fillNW)" filter="url(#glowNW)" dot={false} />
                    <Area type="monotone" dataKey="a" name="Total Assets" stroke={C.ch5} strokeWidth={1.5}
                      fillOpacity={0} dot={false} strokeDasharray="5 3" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </GlassCard>

          {/* Right stack — span 4 */}
          <div style={{ gridColumn: "span 4", display: "flex", flexDirection: "column", gap: 20 }}>
            {/* Allocation donut */}
            <GlassCard>
              <CardHeader title="Asset Allocation" subtitle="By asset class" />
              <div style={{ padding: "8px 16px", display: "flex", alignItems: "center", gap: 12, position: "relative", zIndex: 1 }}>
                {mounted && (
                  <ResponsiveContainer width="50%" height={160}>
                    <PieChart>
                      <Pie data={allocData} cx="50%" cy="50%" innerRadius={42} outerRadius={70}
                        paddingAngle={2} dataKey="value" stroke="none" cornerRadius={3}>
                        {allocData.map((e, i) => <Cell key={i} fill={e.color} />)}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                )}
                <div style={{ display: "flex", flexDirection: "column", gap: 6, flex: 1 }}>
                  {allocData.map(a => (
                    <div key={a.name} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11 }}>
                      <span style={{ width: 8, height: 8, borderRadius: 2, background: a.color, flexShrink: 0 }} />
                      <span style={{ color: C.t2, flex: 1 }}>{a.name}</span>
                      <span style={{ color: C.t1, fontFamily: F.mono, fontWeight: 600 }}>{a.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </GlassCard>

            {/* Progress rings */}
            <GlassCard>
              <CardHeader title="Portfolio Quality" subtitle="Scorecard" />
              <div style={{ padding: 16, position: "relative", zIndex: 1 }}>
                <ProgressRings rings={[
                  { label: "FIRE Progress", value: 247, max: 1800, color: C.ch2 },
                  { label: "Diversification", value: 76, max: 100, color: C.ch1 },
                  { label: "Tax Efficiency", value: 60, max: 100, color: C.gold },
                ]} />
              </div>
            </GlassCard>
          </div>
        </div>

        {/* SECOND ROW — Monte Carlo + Factor Radar + Alerts */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: 20 }}>

          {/* Monte Carlo Fan — span 5 */}
          <GlassCard span={5}>
            <CardHeader title="Wealth Projection" subtitle="Monte Carlo · 10,000 simulations"
              badge={{ text: "P50 £540k", bg: "rgba(59,130,246,0.12)", color: C.ch1 }} />
            <div style={{ padding: "12px 16px", position: "relative", zIndex: 1 }}>
              <MonteCarloFan data={mcData} />
              <div style={{ display: "flex", gap: 16, marginTop: 12, justifyContent: "center" }}>
                {[{ l: "P90 (Bull)", c: C.ch1, o: 0.25 }, { l: "P50 (Base)", c: C.ch1, o: 1 }, { l: "P10 (Bear)", c: C.ch1, o: 0.15 }].map(b => (
                  <span key={b.l} style={{ fontSize: 10, color: C.t3, display: "flex", alignItems: "center", gap: 5 }}>
                    <span style={{ width: 16, height: 3, borderRadius: 2, background: b.c, opacity: b.o }} />{b.l}
                  </span>
                ))}
              </div>
            </div>
          </GlassCard>

          {/* Factor Radar — span 3 */}
          <GlassCard span={3}>
            <CardHeader title="Factor Exposure" subtitle="vs MSCI benchmark" />
            <div style={{ padding: "8px 0", position: "relative", zIndex: 1 }}>
              {mounted && (
                <ResponsiveContainer width="100%" height={220}>
                  <RadarChart cx="50%" cy="50%" outerRadius="70%" data={factorData}>
                    <PolarGrid stroke={C.grid} gridType="polygon" />
                    <PolarAngleAxis dataKey="f" tick={{ fill: C.tick, fontSize: 10 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 1]} tick={false} axisLine={false} />
                    <Radar name="Portfolio" dataKey="p" stroke={C.ch1} fill={C.ch1} fillOpacity={0.25} strokeWidth={2} />
                    <Radar name="Benchmark" dataKey="b" stroke={C.gold} fill={C.gold} fillOpacity={0.08}
                      strokeWidth={1} strokeDasharray="4 4" />
                  </RadarChart>
                </ResponsiveContainer>
              )}
            </div>
          </GlassCard>

          {/* Risk Alerts — span 4 */}
          <GlassCard span={4}>
            <CardHeader title="Governance Alerts" subtitle="Agent-generated" badge={{ text: `${alertsData.length} ACTIVE`, bg: C.negBg, color: C.neg }} />
            <div style={{ padding: "12px 16px", display: "flex", flexDirection: "column", gap: 10, position: "relative", zIndex: 1 }}>
              {alertsData.map((a, i) => {
                const sc = a.sev === "critical" ? C.neg : a.sev === "warning" ? C.warn : C.ch1;
                return (
                  <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "10px 12px",
                    borderRadius: 10, background: `${sc}10`, border: `1px solid ${sc}25`, transition: "all 0.15s" }}>
                    <span style={{ width: 8, height: 8, borderRadius: "50%", background: sc, marginTop: 4,
                      boxShadow: `0 0 8px ${sc}`, flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: sc, textTransform: "uppercase",
                        letterSpacing: 0.8, fontFamily: F.mono }}>{a.metric}</div>
                      <div style={{ fontSize: 12, color: C.t2, marginTop: 3, lineHeight: 1.4 }}>{a.msg}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </GlassCard>
        </div>

        {/* THIRD ROW — Monthly Returns + Holdings Table */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: 20 }}>

          {/* Monthly Returns — span 5 */}
          <GlassCard span={5}>
            <CardHeader title="Monthly Returns" subtitle="Portfolio vs benchmark" />
            <div style={{ padding: "16px 20px", position: "relative", zIndex: 1 }}>
              {mounted && (
                <ResponsiveContainer width="100%" height={220}>
                  <ComposedChart data={monthlyReturns} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={C.grid} vertical={false} />
                    <XAxis dataKey="m" axisLine={false} tickLine={false} tick={{ fill: C.tick, fontSize: 11 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: C.tick, fontSize: 11, fontFamily: F.mono }}
                      tickFormatter={v => `${v}%`} width={40} />
                    <Tooltip content={<GlassTooltip />} />
                    <ReferenceLine y={0} stroke={C.border} />
                    <Bar dataKey="r" name="Portfolio" radius={[6, 6, 0, 0]} maxBarSize={32}>
                      {monthlyReturns.map((e, i) => (
                        <Cell key={i} fill={e.r >= 0 ? C.ch2 : C.neg} fillOpacity={0.7} />
                      ))}
                    </Bar>
                    <Line type="monotone" dataKey="b" name="Benchmark" stroke={C.gold}
                      strokeWidth={2} dot={false} strokeDasharray="5 3" />
                  </ComposedChart>
                </ResponsiveContainer>
              )}
            </div>
          </GlassCard>

          {/* Holdings Table — span 7 */}
          <GlassCard span={7}>
            <CardHeader title="Top Holdings" subtitle="By current market value"
              right={<span style={{ fontSize: 11, color: C.cyan, cursor: "pointer", fontWeight: 600 }}>View All →</span>} />
            <div style={{ padding: "0 20px 16px", position: "relative", zIndex: 1 }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    {["Holding", "Value", "Return", "Class", "Wrapper"].map(h => (
                      <th key={h} style={{ fontSize: 10, fontWeight: 700, color: C.t3, textTransform: "uppercase",
                        letterSpacing: 0.8, padding: "12px 8px", borderBottom: `1px solid ${C.border}`,
                        textAlign: h === "Holding" ? "left" : "right", fontFamily: F.sans }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {holdingsTop.map((h, i) => {
                    const isPos = h.ret.startsWith("+");
                    return (
                      <tr key={i} style={{ transition: "background 0.15s" }}
                        onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.03)"}
                        onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                        <td style={{ fontSize: 13, fontWeight: 600, color: C.t1, padding: "12px 8px",
                          borderBottom: i < holdingsTop.length - 1 ? `1px solid ${C.border}` : "none" }}>{h.name}</td>
                        <td style={{ fontSize: 13, fontWeight: 600, color: C.t1, fontFamily: F.mono,
                          textAlign: "right", padding: "12px 8px",
                          borderBottom: i < holdingsTop.length - 1 ? `1px solid ${C.border}` : "none" }}>{h.val}</td>
                        <td style={{ fontSize: 12, fontWeight: 700, fontFamily: F.mono, textAlign: "right",
                          padding: "12px 8px", color: isPos ? C.pos : C.neg,
                          borderBottom: i < holdingsTop.length - 1 ? `1px solid ${C.border}` : "none" }}>
                          {isPos ? "▲" : "▼"} {h.ret}
                        </td>
                        <td style={{ textAlign: "right", padding: "12px 8px",
                          borderBottom: i < holdingsTop.length - 1 ? `1px solid ${C.border}` : "none" }}>
                          <span style={{ fontSize: 10, padding: "3px 8px", borderRadius: 6,
                            background: "rgba(255,255,255,0.06)", color: C.t2, fontWeight: 600 }}>{h.cls}</span>
                        </td>
                        <td style={{ textAlign: "right", padding: "12px 8px",
                          borderBottom: i < holdingsTop.length - 1 ? `1px solid ${C.border}` : "none" }}>
                          <span style={{ fontSize: 10, padding: "3px 8px", borderRadius: 6,
                            background: C.cyanSubtle, color: C.cyan, fontWeight: 600, fontFamily: F.mono }}>{h.w}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </div>

        {/* FOOTER — Action Queue */}
        <GlassCard heavy>
          <div style={{ padding: 20, display: "flex", alignItems: "flex-start", gap: 20 }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: "linear-gradient(135deg, #00BCD4, #0097A7)",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0, color: "#fff",
              boxShadow: "0 4px 16px rgba(0,188,212,0.3)" }}>⚡</div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                <span style={{ fontSize: 10, fontWeight: 800, color: C.t3, letterSpacing: 1.5, textTransform: "uppercase" }}>
                  MORNING COMMAND · AGENT SYNTHESIS
                </span>
                <span style={{ fontSize: 9, padding: "2px 8px", borderRadius: 4, background: C.cyanSubtle,
                  color: C.cyan, fontWeight: 700, fontFamily: F.mono }}>REFLATION · 29%</span>
              </div>
              <p style={{ fontSize: 14, color: C.t1, lineHeight: 1.6, margin: 0 }}>
                Net worth at £247k with 6M return +4.92%. Priority: utilise ISA allowance before 5 April deadline (29 days).
                Crypto overweight by 4.2% — consider trimming into ISA rebalance. Market regime is late-cycle reflation;
                risk budget should tighten. Three rebalance proposals awaiting approval.
              </p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, flexShrink: 0 }}>
              <button style={{ padding: "8px 20px", borderRadius: 10, background: C.cyan, color: C.bg,
                fontSize: 12, fontWeight: 700, border: "none", cursor: "pointer",
                boxShadow: `0 4px 16px ${C.cyan}40`, transition: "all 0.15s" }}>Review Actions</button>
              <button style={{ padding: "8px 20px", borderRadius: 10, background: "rgba(255,255,255,0.06)",
                color: C.t2, fontSize: 12, fontWeight: 600, border: `1px solid ${C.border}`,
                cursor: "pointer", transition: "all 0.15s" }}>Dismiss</button>
            </div>
          </div>
        </GlassCard>

      </div>
    </div>
  );
}
