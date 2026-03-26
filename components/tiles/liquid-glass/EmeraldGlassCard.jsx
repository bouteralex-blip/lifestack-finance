"use client";

/**
 * EmeraldGlassCard.jsx
 *
 * The master volumetric liquid-glass wrapper.
 *
 * AE Liquid Glass Recipe:
 *   Base:     relative overflow-hidden bg-white/[0.08] backdrop-blur-[40px] saturate-[2.0] rounded-2xl
 *   Rim/Drop: shadow-[inset_0_1px_2px_rgba(255,255,255,0.5),inset_0_-1px_1px_rgba(255,255,255,0.1),0_20px_40px_rgba(0,0,0,0.4)]
 *   Border:   border border-white/[0.15]
 *   Specular: after:absolute after:inset-0 after:bg-gradient-to-br after:from-white/[0.2] after:to-transparent after:pointer-events-none
 *
 * Props:
 *   children  - ReactNode content
 *   className - optional extra Tailwind classes
 *   title     - optional title rendered as emerald label
 */

// ─── Noise texture data URI (shared) ────────────────────────────────────────
const NOISE_URI =
  "data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E";

// ─── Sub-components ─────────────────────────────────────────────────────────

export function EmeraldInnerPlate({ children, className = "" }) {
  return (
    <div
      className={`bg-black/[0.25] rounded-[12px] shadow-[inset_0_1px_3px_rgba(0,0,0,0.5)] p-4 ${className}`}
    >
      {children}
    </div>
  );
}

export function EmeraldLabel({ children, className = "" }) {
  return (
    <span
      className={`text-[11px] font-normal uppercase tracking-widest text-white/[0.48] ${className}`}
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      {children}
    </span>
  );
}

export function EmeraldValue({ children, className = "" }) {
  return (
    <span
      className={`text-[36px] font-bold tracking-tight leading-none text-white ${className}`}
      style={{ fontFamily: "'Inter', sans-serif", letterSpacing: "-0.02em" }}
    >
      {children}
    </span>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────

export function EmeraldGlassCard({ children, className = "", title }) {
  return (
    <div
      className={`relative overflow-hidden bg-white/[0.04] backdrop-blur-[40px] saturate-[1.5] rounded-[18px] border border-white/[0.10] shadow-[inset_0_1px_1px_rgba(255,255,255,0.2),0_8px_32px_rgba(0,0,0,0.3)] ${className}`}
    >
      {/* ── AE Specular Shine (studio-lit top-left highlight) ──────────── */}
      <div
        className="pointer-events-none absolute inset-0 rounded-[18px] bg-gradient-to-br from-white/[0.2] to-transparent"
        aria-hidden="true"
      />

      {/* ── Fresnel conic rim ─────────────────────────────────────────── */}
      <div
        className="pointer-events-none absolute inset-0 rounded-[18px]"
        style={{
          background: `conic-gradient(
            from 315deg at 50% 50%,
            rgba(255,255,255,0.55) 0deg,
            rgba(255,255,255,0.35) 45deg,
            rgba(255,255,255,0.06) 90deg,
            rgba(255,255,255,0.03) 135deg,
            rgba(255,255,255,0.28) 180deg,
            rgba(255,255,255,0.18) 225deg,
            rgba(255,255,255,0.03) 270deg,
            rgba(255,255,255,0.14) 315deg,
            rgba(255,255,255,0.55) 360deg
          )`,
          mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          WebkitMask:
            "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          maskComposite: "exclude",
          WebkitMaskComposite: "xor",
          padding: "1.5px",
        }}
        aria-hidden="true"
      />

      {/* ── AE Displacement glare sweep (primary) ─────────────────────── */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(325deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.05) 15%, rgba(255,255,255,0.01) 28%, transparent 45%)",
        }}
        aria-hidden="true"
      />

      {/* ── Secondary glare (bottom-right fill light) ────────────────── */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(145deg, transparent 55%, rgba(255,255,255,0.03) 70%, rgba(255,255,255,0.06) 85%, rgba(255,255,255,0.03) 100%)",
        }}
        aria-hidden="true"
      />

      {/* ── Corner hotspots ───────────────────────────────────────────── */}
      <div
        className="pointer-events-none absolute left-0 top-0 h-1/2 w-1/2"
        style={{
          background:
            "radial-gradient(ellipse at 0% 0%, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.08) 25%, transparent 60%)",
        }}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute bottom-0 right-0 h-[35%] w-[35%]"
        style={{
          background:
            "radial-gradient(ellipse at 100% 100%, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0.05) 25%, transparent 55%)",
        }}
        aria-hidden="true"
      />

      {/* ── Top edge highlight line ──────────────────────────────────── */}
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

      {/* ── Left edge highlight line ─────────────────────────────────── */}
      <div
        className="pointer-events-none absolute bottom-[35%] left-0 top-[8%]"
        style={{
          width: "1px",
          background:
            "linear-gradient(180deg, transparent 0%, rgba(255,255,255,0.5) 15%, rgba(255,255,255,0.7) 40%, rgba(255,255,255,0.3) 70%, transparent 100%)",
          filter: "blur(0.3px)",
        }}
        aria-hidden="true"
      />

      {/* ── Surface noise (AE grain overlay) ─────────────────────────── */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.018]"
        style={{
          backgroundImage: `url("${NOISE_URI}")`,
          backgroundSize: "256px 256px",
        }}
        aria-hidden="true"
      />

      {/* ── Content ──────────────────────────────────────────────────── */}
      <div className="relative z-10">
        {title && <EmeraldLabel className="mb-3 block">{title}</EmeraldLabel>}
        {children}
      </div>
    </div>
  );
}

export default EmeraldGlassCard;
