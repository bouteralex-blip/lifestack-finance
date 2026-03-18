"use client"

import { useEffect, useRef, useState } from "react"

// =============================================================================
// PremiumGradientBackground -- Props & Types
// =============================================================================

export interface GradientOrb {
  id: string
  x: number
  y: number
  size: number
  color: string
  blur: number
  opacity: number
  speed: { x: number; y: number }
}

export interface PremiumGradientBackgroundProps {
  /** Color palette -- defaults to deep purples, teals, and warm accents */
  colors?: string[]
  /** Enable subtle orb animation */
  animated?: boolean
  /** Animation speed multiplier */
  animationSpeed?: number
  /** Enable scroll-linked parallax */
  scrollParallax?: boolean
  /** Parallax intensity (0-1) */
  parallaxIntensity?: number
  /** Background base color */
  baseColor?: string
  /** Number of gradient orbs */
  orbCount?: number
  /** Enable noise texture overlay */
  enableNoise?: boolean
  /** Noise opacity */
  noiseOpacity?: number
}

// =============================================================================
// PremiumGradientBackground
// =============================================================================

export function PremiumGradientBackground({
  colors = [
    "rgba(99, 102, 241, 0.6)",
    "rgba(139, 92, 246, 0.5)",
    "rgba(236, 72, 153, 0.4)",
    "rgba(59, 130, 246, 0.5)",
    "rgba(20, 184, 166, 0.4)",
    "rgba(251, 146, 60, 0.3)",
  ],
  animated = true,
  animationSpeed = 0.3,
  scrollParallax = true,
  parallaxIntensity = 0.15,
  baseColor = "#030712",
  orbCount = 6,
  enableNoise = true,
  noiseOpacity = 0.03,
}: PremiumGradientBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const orbsRef = useRef<GradientOrb[]>([])
  const animationRef = useRef<number>(0)
  const scrollRef = useRef(0)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)

    const orbs: GradientOrb[] = []
    for (let i = 0; i < orbCount; i++) {
      const angle = (i / orbCount) * Math.PI * 2
      const radiusX = 30 + (i % 3) * 15
      const radiusY = 20 + (i % 2) * 20

      orbs.push({
        id: `orb-${i}`,
        x: 50 + Math.cos(angle) * radiusX,
        y: 50 + Math.sin(angle) * radiusY,
        size: 300 + (i % 3) * 200,
        color: colors[i % colors.length],
        blur: 80 + (i % 4) * 30,
        opacity: 0.6 - (i % 3) * 0.15,
        speed: {
          x: (Math.cos(angle + i) * 0.02 + 0.005) * animationSpeed,
          y: (Math.sin(angle + i * 0.7) * 0.015 + 0.003) * animationSpeed,
        },
      })
    }
    orbsRef.current = orbs

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [colors, orbCount, animationSpeed])

  useEffect(() => {
    if (!scrollParallax) return

    const handleScroll = () => {
      scrollRef.current = window.scrollY
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [scrollParallax])

  useEffect(() => {
    if (!mounted || !animated) return

    let time = 0
    const animate = () => {
      time += 0.016
      const container = containerRef.current
      if (!container) {
        animationRef.current = requestAnimationFrame(animate)
        return
      }

      const orbElements =
        container.querySelectorAll<HTMLDivElement>("[data-orb]")

      orbsRef.current.forEach((orb, index) => {
        const newX =
          orb.x + Math.sin(time * orb.speed.x * 50 + index) * 0.5
        const newY =
          orb.y + Math.cos(time * orb.speed.y * 40 + index * 0.5) * 0.4

        const scrollOffset = scrollParallax
          ? scrollRef.current * parallaxIntensity * (0.5 + index * 0.1)
          : 0

        const element = orbElements[index]
        if (element) {
          element.style.transform = `translate(${newX - 50}%, ${newY - 50 + scrollOffset * 0.05}%)`
        }
      })

      animationRef.current = requestAnimationFrame(animate)
    }

    animationRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animationRef.current)
  }, [mounted, animated, scrollParallax, parallaxIntensity])

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 overflow-hidden"
      style={{ backgroundColor: baseColor }}
    >
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 120% 100% at 50% -20%, rgba(30,27,75,0.5) 0%, transparent 60%),
            radial-gradient(ellipse 100% 80% at 80% 100%, rgba(15,23,42,0.8) 0%, transparent 50%),
            radial-gradient(ellipse 80% 60% at 10% 90%, rgba(20,20,35,0.6) 0%, transparent 40%)
          `,
        }}
      />

      {mounted &&
        orbsRef.current.map((orb) => (
          <div
            key={orb.id}
            data-orb
            className="absolute rounded-full transition-transform duration-1000 ease-out"
            style={{
              left: "50%",
              top: "50%",
              width: orb.size,
              height: orb.size,
              background: `radial-gradient(circle at 30% 30%, ${orb.color}, transparent 70%)`,
              filter: `blur(${orb.blur}px)`,
              opacity: orb.opacity,
              transform: `translate(${orb.x - 50}%, ${orb.y - 50}%)`,
              willChange: "transform",
            }}
          />
        ))}

      <div
        className="absolute -top-1/4 -right-1/4 h-[80%] w-[80%] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(251,146,60,0.08) 0%, transparent 60%)",
          filter: "blur(100px)",
        }}
      />

      <div
        className="absolute -bottom-1/4 -left-1/4 h-[70%] w-[70%] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(59,130,246,0.1) 0%, transparent 50%)",
          filter: "blur(120px)",
        }}
      />

      <div
        className="absolute left-1/2 top-1/3 h-[60%] w-[50%] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          background:
            "radial-gradient(ellipse, rgba(139,92,246,0.06) 0%, transparent 50%)",
          filter: "blur(80px)",
        }}
      />

      <div
        className="absolute inset-0"
        style={{
          background: `conic-gradient(
            from 180deg at 50% 50%,
            rgba(99,102,241,0.03) 0deg,
            transparent 60deg,
            rgba(139,92,246,0.02) 120deg,
            transparent 180deg,
            rgba(59,130,246,0.03) 240deg,
            transparent 300deg,
            rgba(99,102,241,0.03) 360deg
          )`,
          filter: "blur(60px)",
        }}
      />

      {enableNoise && (
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            opacity: noiseOpacity,
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
            backgroundRepeat: "repeat",
          }}
        />
      )}

      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 70% at 50% 50%, transparent 30%, rgba(0,0,0,0.4) 100%)",
        }}
      />
    </div>
  )
}
