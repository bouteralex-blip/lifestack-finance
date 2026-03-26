"use client";

/**
 * CIOInsightBannerWidget.jsx
 *
 * Alternative narrative synthesis tile with configurable accent color.
 *
 * AE Liquid Glass Recipe:
 *   Base:     bg-white/[0.08] backdrop-blur-[40px] saturate-[2.0]
 *   Rim/Drop: AE rim + drop shadow
 *   Border:   border-white/[0.15] + accent left border
 *   Specular: gradient shine overlay
 *
 * Props:
 *   data - { badgeLabel, insightText, confidence, accentColor? }
 */

// ─── Inline Zap Icon ────────────────────────────────────────────────────────

function ZapIcon({ size = 20, style = {}, className = "" }) {
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
      style={style}
    >
      <path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z" />
    </svg>
  );
}

// ─── Main ───────────────────────────────────────────────────────────────────

export function CIOInsightBannerWidget({ data }) {
  if (!data) return <div style={{display:'flex',alignItems:'center',justifyContent:'center',minHeight:80,color:'rgba(15,150,156,0.5)',fontSize:12,fontStyle:'italic',letterSpacing:'0.05em'}}>Awaiting Data Sync...</div>;
  const {
    badgeLabel,
    insightText,
    confidence,
    accentColor = "rgb(245,158,11)",
  } = data;

  return (
    <div
      className="relative flex items-start gap-4 overflow-hidden rounded-[18px] bg-white/[0.08] backdrop-blur-[40px] saturate-[2.0] border border-white/[0.15] border-l-4 p-4 md:items-center"
      style={{
        borderLeftColor: accentColor,
        boxShadow: [
          "inset 0 1px 2px rgba(255,255,255,0.5)",
          "inset 0 -1px 1px rgba(255,255,255,0.1)",
          "0 20px 40px rgba(0,0,0,0.4)",
        ].join(", "),
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      {/* AE Specular Shine */}
      <div
        className="pointer-events-none absolute inset-0 rounded-[18px] bg-gradient-to-br from-white/[0.2] to-transparent"
        aria-hidden="true"
      />

      {/* Glow icon */}
      <div className="relative z-10 flex-none">
        <div
          className="relative flex h-10 w-10 items-center justify-center rounded-lg"
          style={{
            backgroundColor: `color-mix(in srgb, ${accentColor} 12%, transparent)`,
          }}
        >
          <ZapIcon size={20} style={{ color: accentColor }} />
          <div
            className="pointer-events-none absolute inset-0 rounded-lg"
            style={{
              boxShadow: `0 0 20px color-mix(in srgb, ${accentColor} 30%, transparent), 0 0 50px color-mix(in srgb, ${accentColor} 10%, transparent)`,
            }}
            aria-hidden="true"
          />
        </div>
      </div>

      {/* Text */}
      <div className="relative z-10 min-w-0 flex-1">
        <span
          className="text-[10px] font-bold uppercase tracking-widest"
          style={{ color: accentColor }}
        >
          {badgeLabel}
        </span>
        <p className="mt-1.5 text-sm italic leading-relaxed text-slate-300">
          {insightText}
        </p>
      </div>

      {/* Confidence badge -- inner stabilized plate */}
      <div className="relative z-10 flex-none self-center">
        <div
          className="rounded-md border border-white/10 bg-black/30 px-3 py-1.5"
          style={{
            boxShadow:
              "inset 0 2px 6px rgba(0,0,0,0.6), inset 0 0 1px rgba(255,255,255,0.05)",
          }}
        >
          <span
            className="text-[10px] font-medium uppercase tracking-wider text-slate-400"
            style={{ fontFamily: "Geist, sans-serif" }}
          >
            Confidence
          </span>
          <span
            className="ml-1.5 text-sm font-bold text-[#F8FAFC]"
            style={{ fontFamily: "Geist Mono, monospace" }}
          >
            {confidence}%
          </span>
        </div>
      </div>

      {/* Top accent edge highlight */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{
          background: `linear-gradient(90deg, transparent 0%, color-mix(in srgb, ${accentColor} 20%, transparent) 20%, color-mix(in srgb, ${accentColor} 6%, transparent) 80%, transparent 100%)`,
        }}
        aria-hidden="true"
      />
    </div>
  );
}

export default CIOInsightBannerWidget;
