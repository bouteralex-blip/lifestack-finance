"use client"

import { useEffect, useRef, useState } from "react"

// =============================================================================
// LeafyGlassBackground -- Props & Types
// =============================================================================

export interface LeafyGlassBackgroundProps {
  /** Path to the leaf background image */
  backgroundImage?: string
  /** Optional className for the outer wrapper */
  className?: string
}

// =============================================================================
// LeafyGlassBackground -- Scroll-driven light beams over foliage
// =============================================================================

export function LeafyGlassBackground({
  backgroundImage = "/images/leaves-bg.jpg",
  className = "",
}: LeafyGlassBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    let raf = 0
    let prevScroll = 0
    let smoothVelocity = 0

    const update = () => {
      const scroll = window.scrollY
      const maxScroll =
        document.documentElement.scrollHeight - window.innerHeight
      const progress = maxScroll > 0 ? scroll / maxScroll : 0
      const rawVelocity = scroll - prevScroll
      smoothVelocity = smoothVelocity * 0.9 + rawVelocity * 0.1
      prevScroll = scroll

      const absV = Math.min(Math.abs(smoothVelocity), 40)
      const vNorm = absV / 40

      const el = containerRef.current
      if (el) {
        el.style.setProperty("--beam-angle", `${-20 + progress * 40}deg`)
        el.style.setProperty("--beam-opacity", `${0.08 + vNorm * 0.15}`)
        el.style.setProperty("--hl-x", `${35 + progress * 30}%`)
        el.style.setProperty("--hl-y", `${20 + progress * 40}%`)
        el.style.setProperty("--spec-opacity", `${0.04 + vNorm * 0.12}`)
        el.style.setProperty("--para-y", `${scroll * 0.02}%`)
      }

      raf = requestAnimationFrame(update)
    }

    raf = requestAnimationFrame(update)
    return () => cancelAnimationFrame(raf)
  }, [mounted])

  return (
    <div
      ref={containerRef}
      className={`fixed inset-0 overflow-hidden ${className}`}
    >
      {/* Layer 1: Leaf photograph with parallax */}
      <div
        className="absolute inset-[-5%] h-[110%] w-[110%]"
        style={{
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          transform: "translateY(var(--para-y, 0%))",
          willChange: "transform",
        }}
      />

      {/* Layer 2: Depth darkening */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 120% 100% at var(--hl-x, 40%) var(--hl-y, 30%), rgba(0,15,10,0.1) 0%, rgba(0,10,8,0.45) 40%, rgba(0,5,5,0.7) 70%, rgba(0,2,3,0.85) 100%)",
        }}
      />

      {/* Layer 3: Primary light beam */}
      <div
        className="absolute inset-0"
        style={{
          opacity: "var(--beam-opacity, 0.08)",
          background:
            "linear-gradient(var(--beam-angle, 0deg), transparent 0%, transparent 25%, rgba(100,200,180,0.8) 35%, rgba(120,220,190,1) 45%, rgba(80,180,160,0.5) 55%, transparent 65%, transparent 100%)",
          mixBlendMode: "soft-light",
        }}
      />

      {/* Layer 4: Secondary crossing beam */}
      <div
        className="absolute inset-0"
        style={{
          opacity: "var(--beam-opacity, 0.08)",
          background:
            "linear-gradient(calc(var(--beam-angle, 0deg) + 70deg), transparent 0%, transparent 35%, rgba(50,160,140,0.6) 45%, rgba(70,180,160,0.9) 50%, rgba(40,150,130,0.4) 55%, transparent 65%, transparent 100%)",
          mixBlendMode: "soft-light",
        }}
      />

      {/* Layer 5: Specular highlight */}
      <div
        className="absolute inset-0"
        style={{
          opacity: "var(--spec-opacity, 0.04)",
          background:
            "radial-gradient(ellipse 35% 40% at var(--hl-x, 40%) var(--hl-y, 30%), rgba(150,240,210,1) 0%, rgba(100,200,180,0.5) 30%, transparent 60%)",
          mixBlendMode: "screen",
        }}
      />

      {/* Layer 6: Atmospheric haze */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 100% 60% at 50% 100%, rgba(5,30,25,0.6) 0%, transparent 70%)",
        }}
      />

      {/* Layer 7: Vignette */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 75% 70% at 50% 45%, transparent 30%, rgba(0,5,3,0.5) 70%, rgba(0,3,2,0.8) 100%)",
        }}
      />

      {/* Layer 8: Film grain */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
          backgroundSize: "256px 256px",
        }}
      />
    </div>
  )
}
