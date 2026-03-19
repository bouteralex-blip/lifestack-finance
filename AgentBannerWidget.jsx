"use client";

/**
 * AgentBannerWidget.jsx
 *
 * AI synthesis block with left-border amber accent.
 *
 * Props:
 *   data - { badgeLabel, insightText, confidence }
 *
 * AE Glass: bg-white/[0.08] backdrop-blur-[40px] saturate-[2.0]
 *           AE rim/drop shadow, specular shine, Fresnel rim, noise
 */

const NOISE_URI =
  "data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E";

function ZapIcon({ size = 20, className = "" }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z" />
    </svg>
  );
}

export function AgentBannerWidget({ data }) {
  const { badgeLabel, insightText, confidence } = data;

  return (
    <div
      className="relative overflow-hidden rounded-r-2xl border-l-4 border-l-[#F5A623] bg-white/[0.08] backdrop-blur-[40px] saturate-[2.0] border border-white/[0.15] p-4"
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
      <div
        className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-white/[0.2] to-transparent"
        aria-hidden="true"
      />
      {/* Primary glare sweep */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: "linear-gradient(325deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.05) 15%, rgba(255,255,255,0.01) 28%, transparent 45%)" }}
        aria-hidden="true"
      />
      {/* Corner hotspot */}
      <div
        className="pointer-events-none absolute left-0 top-0 h-1/2 w-1/2"
        style={{ background: "radial-gradient(ellipse at 0% 0%, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.08) 25%, transparent 60%)" }}
        aria-hidden="true"
      />
      {/* Top edge highlight */}
      <div
        className="pointer-events-none absolute left-[8%] right-[35%] top-0"
        style={{ height: "1px", background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.7) 15%, rgba(255,255,255,0.9) 40%, rgba(255,255,255,0.4) 70%, transparent 100%)", filter: "blur(0.3px)" }}
        aria-hidden="true"
      />
      {/* Noise */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.018]"
        style={{ backgroundImage: `url("${NOISE_URI}")`, backgroundSize: "256px 256px" }}
        aria-hidden="true"
      />

      {/* Content */}
      <div className="relative z-10 flex items-start gap-4 md:items-center">
        {/* Lightning bolt icon */}
        <div className="flex-none">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#F5A623]/10"
            style={{ boxShadow: "0 0 16px rgba(245,166,35,0.2), 0 0 40px rgba(245,166,35,0.06)" }}
          >
            <ZapIcon size={20} className="text-[#F5A623]" />
          </div>
        </div>

        {/* Text content */}
        <div className="min-w-0 flex-1">
          <div
            className="rounded-xl border border-white/5 bg-black/30 p-2"
            style={{ boxShadow: "inset 0 2px 6px rgba(0,0,0,0.6), inset 0 0 1px rgba(255,255,255,0.05)" }}
          >
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#F5A623]">
              {badgeLabel}
            </span>
            <p className="mt-1.5 text-sm italic leading-relaxed text-emerald-50/80">
              {insightText}
            </p>
          </div>
        </div>

        {/* Confidence badge */}
        <div className="flex-none self-center">
          <div
            className="rounded-md border border-white/5 bg-black/30 px-3 py-1.5"
            style={{ boxShadow: "inset 0 2px 6px rgba(0,0,0,0.6), inset 0 0 1px rgba(255,255,255,0.05)" }}
          >
            <span className="text-[10px] font-medium uppercase tracking-wider text-emerald-100/50">
              Confidence
            </span>
            <span className="ml-1.5 font-mono text-sm font-bold text-white">
              {confidence}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AgentBannerWidget;
