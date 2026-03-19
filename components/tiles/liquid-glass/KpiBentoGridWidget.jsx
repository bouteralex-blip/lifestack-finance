"use client";

/**
 * KpiBentoGridWidget.jsx
 *
 * Dense 6-column KPI bento grid with per-tile glass cards.
 *
 * Props:
 *   data  - Array of { label, value, delta, deltaType, subtext? }
 *           deltaType: "positive" | "negative" | "warning"
 *   title - optional section heading
 *
 * AE Glass: bg-white/[0.08] backdrop-blur-[40px] saturate-[2.0]
 *           AE rim/drop shadow, specular shine, Fresnel rim, noise
 */

const NOISE_URI =
  "data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E";

const BADGE_STYLES = {
  positive: "bg-teal-500/20 text-teal-400",
  negative: "bg-rose-500/20 text-rose-400",
  warning: "bg-amber-500/20 text-amber-400",
};

function DeltaBadge({ delta, type }) {
  return (
    <span
      className={`inline-block rounded-md px-2 py-0.5 font-mono text-xs font-medium ${BADGE_STYLES[type]}`}
    >
      {delta}
    </span>
  );
}

function GlassTile({ children, backlightColor = "255,255,255" }) {
  return (
    <div className="relative flex flex-col">
      {/* backlight glow */}
      <div
        className="pointer-events-none absolute -inset-[30%] -z-10"
        style={{
          background: `radial-gradient(ellipse 55% 60% at 50% 55%, rgba(${backlightColor},0.05) 0%, transparent 75%)`,
          filter: "blur(20px)",
        }}
        aria-hidden="true"
      />

      <div
        className="relative flex flex-1 flex-col overflow-hidden rounded-2xl bg-white/[0.08] backdrop-blur-[40px] saturate-[2.0] border border-white/[0.15] p-5"
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
        {/* Primary glare sweep */}
        <div className="pointer-events-none absolute inset-0" style={{ background: "linear-gradient(325deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.05) 15%, rgba(255,255,255,0.01) 28%, transparent 45%)" }} aria-hidden="true" />
        {/* Corner hotspot */}
        <div className="pointer-events-none absolute left-0 top-0 h-1/2 w-1/2" style={{ background: "radial-gradient(ellipse at 0% 0%, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.08) 25%, transparent 60%)" }} aria-hidden="true" />
        {/* Top edge highlight */}
        <div className="pointer-events-none absolute left-[8%] right-[35%] top-0" style={{ height: "1px", background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.7) 15%, rgba(255,255,255,0.9) 40%, rgba(255,255,255,0.4) 70%, transparent 100%)", filter: "blur(0.3px)" }} aria-hidden="true" />
        {/* Noise */}
        <div className="pointer-events-none absolute inset-0 opacity-[0.018]" style={{ backgroundImage: `url("${NOISE_URI}")`, backgroundSize: "256px 256px" }} aria-hidden="true" />
        <div className="relative z-10 flex flex-1 flex-col">{children}</div>
      </div>
    </div>
  );
}

// ─── Main ───────────────────────────────────────────────────────────────────

export function KpiBentoGridWidget({ data, title, className = "" }) {
  const BACKLIGHT = {
    positive: "0,212,170",
    negative: "255,92,122",
    warning: "245,166,35",
  };

  return (
    <section className={className}>
      {title && (
        <h2 className="mb-8 font-sans text-2xl font-bold tracking-tight text-[#F8FAFC] md:text-3xl">
          {title}
        </h2>
      )}

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        {data.map((kpi) => (
          <GlassTile
            key={kpi.label}
            backlightColor={BACKLIGHT[kpi.deltaType]}
          >
            <span className="text-xs uppercase tracking-wide text-slate-400 opacity-50">
              {kpi.label}
            </span>

            <div className="mt-2 flex flex-col gap-1.5">
              <span className="font-mono text-[28px] font-bold leading-none text-[#F8FAFC] lg:text-[32px]">
                {kpi.value}
              </span>
              <DeltaBadge delta={kpi.delta} type={kpi.deltaType} />
            </div>

            {kpi.subtext && (
              <span className="mt-auto pt-2 text-[11px] text-slate-500 opacity-30">
                {kpi.subtext}
              </span>
            )}
          </GlassTile>
        ))}
      </div>
    </section>
  );
}

export default KpiBentoGridWidget;
