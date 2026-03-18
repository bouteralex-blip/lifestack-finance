"use client"

import { useEffect, useRef, useState } from "react"

// =============================================================================
// OceanWaveBackground -- Props & Types
// =============================================================================

export interface WaveLayer {
  id: string
  color: string
  amplitude: number
  frequency: number
  speed: number
  phase: number
  yOffset: number
  opacity: number
}

export interface OceanWaveBackgroundProps {
  /** Wave color palette -- from top to bottom */
  waveColors?: string[]
  /** Base background color */
  baseColor?: string
  /** Enable wave animation */
  animated?: boolean
  /** Animation speed multiplier */
  animationSpeed?: number
  /** Enable scroll-linked parallax */
  scrollParallax?: boolean
  /** Parallax intensity */
  parallaxIntensity?: number
  /** Number of wave layers */
  layerCount?: number
}

// =============================================================================
// OceanWaveBackground
// =============================================================================

export function OceanWaveBackground({
  waveColors = [
    "#0a3d2e",
    "#0d4a3a",
    "#115e4a",
    "#0e5c5a",
    "#0c4f6d",
    "#0a4470",
    "#083a6b",
    "#062f5a",
    "#042448",
    "#031c3a",
  ],
  baseColor = "#020c1b",
  animated = true,
  animationSpeed = 1,
  scrollParallax = true,
  parallaxIntensity = 0.08,
  layerCount = 10,
}: OceanWaveBackgroundProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const animationRef = useRef<number>(0)
  const scrollRef = useRef(0)
  const timeRef = useRef(0)
  const [mounted, setMounted] = useState(false)
  const wavesRef = useRef<WaveLayer[]>([])

  useEffect(() => {
    setMounted(true)

    const waves: WaveLayer[] = []
    for (let i = 0; i < layerCount; i++) {
      const progress = i / (layerCount - 1)
      waves.push({
        id: `wave-${i}`,
        color: waveColors[i % waveColors.length],
        amplitude: 30 + Math.sin(progress * Math.PI) * 50,
        frequency: 0.8 + (i % 3) * 0.3,
        speed: (0.3 + progress * 0.7) * animationSpeed,
        phase: (i * Math.PI) / 4,
        yOffset: 5 + progress * 95,
        opacity: 0.9 + progress * 0.1,
      })
    }
    wavesRef.current = waves

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [waveColors, layerCount, animationSpeed])

  useEffect(() => {
    if (!scrollParallax) return

    const handleScroll = () => {
      scrollRef.current = window.scrollY
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [scrollParallax])

  const generateWavePath = (
    wave: WaveLayer,
    time: number,
    scrollOffset: number,
    width: number,
    height: number
  ): string => {
    const points: string[] = []
    const segments = 100
    const baseY = (wave.yOffset / 100) * height + scrollOffset

    points.push(`M 0 ${height}`)
    points.push(`L 0 ${baseY}`)

    for (let i = 0; i <= segments; i++) {
      const x = (i / segments) * width
      const normalizedX = i / segments

      const primaryWave =
        Math.sin(
          normalizedX * Math.PI * 2 * wave.frequency +
            time * wave.speed +
            wave.phase
        ) * wave.amplitude

      const secondaryWave =
        Math.sin(
          normalizedX * Math.PI * 3 * wave.frequency +
            time * wave.speed * 0.7 +
            wave.phase * 1.5
        ) *
        (wave.amplitude * 0.3)

      const tertiaryWave =
        Math.sin(
          normalizedX * Math.PI * 5 +
            time * wave.speed * 0.4 +
            wave.phase * 2
        ) *
        (wave.amplitude * 0.15)

      const y = baseY + primaryWave + secondaryWave + tertiaryWave
      points.push(`L ${x} ${y}`)
    }

    points.push(`L ${width} ${height}`)
    points.push("Z")

    return points.join(" ")
  }

  useEffect(() => {
    if (!mounted || !animated) return

    const animate = () => {
      timeRef.current += 0.016

      const svg = svgRef.current
      if (!svg) {
        animationRef.current = requestAnimationFrame(animate)
        return
      }

      const width = svg.clientWidth || 1920
      const height = svg.clientHeight || 1080

      const pathElements =
        svg.querySelectorAll<SVGPathElement>("[data-wave-path]")

      wavesRef.current.forEach((wave, index) => {
        const layerDepth = index / wavesRef.current.length
        const scrollOffset = scrollParallax
          ? scrollRef.current * parallaxIntensity * (1 - layerDepth * 0.6)
          : 0

        const path = generateWavePath(
          wave,
          timeRef.current,
          scrollOffset,
          width,
          height
        )

        const element = pathElements[index]
        if (element) {
          element.setAttribute("d", path)
        }
      })

      animationRef.current = requestAnimationFrame(animate)
    }

    animationRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animationRef.current)
  }, [mounted, animated, scrollParallax, parallaxIntensity])

  const getInitialPath = (
    wave: WaveLayer,
    width: number,
    height: number
  ): string => {
    return generateWavePath(wave, 0, 0, width, height)
  }

  return (
    <div
      className="fixed inset-0 overflow-hidden"
      style={{ backgroundColor: baseColor }}
    >
      <div
        className="absolute -top-1/4 left-1/2 h-[80%] w-[150%] -translate-x-1/2"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(16,85,75,0.25) 0%, transparent 60%)",
          filter: "blur(80px)",
        }}
      />

      <svg
        ref={svgRef}
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 1920 1080"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          {mounted &&
            wavesRef.current.map((wave, index) => {
              const nextColor =
                wavesRef.current[index + 1]?.color || wave.color
              return (
                <linearGradient
                  key={`gradient-${wave.id}`}
                  id={`wave-gradient-${index}`}
                  x1="0%"
                  y1="0%"
                  x2="0%"
                  y2="100%"
                >
                  <stop
                    offset="0%"
                    stopColor={wave.color}
                    stopOpacity={wave.opacity}
                  />
                  <stop
                    offset="100%"
                    stopColor={nextColor}
                    stopOpacity={wave.opacity * 0.95}
                  />
                </linearGradient>
              )
            })}

          <filter
            id="wave-glow"
            x="-20%"
            y="-20%"
            width="140%"
            height="140%"
          >
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {mounted &&
          wavesRef.current.map((wave, index) => (
            <path
              key={wave.id}
              data-wave-path
              d={getInitialPath(wave, 1920, 1080)}
              fill={`url(#wave-gradient-${index})`}
              style={{
                filter: index < 3 ? "url(#wave-glow)" : undefined,
              }}
            />
          ))}
      </svg>

      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(135deg, rgba(255,255,255,0.03) 0%, transparent 30%, transparent 70%, rgba(255,255,255,0.01) 100%)",
        }}
      />

      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[30%]"
        style={{
          background:
            "linear-gradient(to bottom, rgba(20,120,100,0.15) 0%, transparent 100%)",
        }}
      />

      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[40%]"
        style={{
          background:
            "linear-gradient(to top, rgba(0,10,25,0.6) 0%, transparent 100%)",
        }}
      />

      <div
        className="pointer-events-none absolute inset-0"
        style={{
          opacity: 0.02,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
        }}
      />

      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 90% 80% at 50% 50%, transparent 40%, rgba(0,5,15,0.5) 100%)",
        }}
      />
    </div>
  )
}
