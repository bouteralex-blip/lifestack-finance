"use client"

import { useRef, useState, useEffect, useId, useCallback } from "react"
import {
  generateDisplacementMap,
  imageDataToDataUrl,
  SurfaceFunctions,
  type RefractionConfig,
} from "@/lib/liquid-glass-physics"

// =============================================================================
// GlassTileBackground -- Props & Types
// =============================================================================

export interface TileConfig {
  id: string
  x: number
  y: number
  width: number
  height: number
  refractiveIndex: number
  bezelWidth: number
  surfaceType: keyof typeof SurfaceFunctions
  rotation: number
}

export interface GlassTileBackgroundProps {
  /** Background image URL */
  backgroundImage: string
  /** Number of tile columns */
  columns?: number
  /** Number of tile rows */
  rows?: number
  /** Gap between tiles in pixels */
  gap?: number
  /** Tile corner radius */
  borderRadius?: number
  /** Base refractive index */
  refractiveIndex?: number
  /** Enable scroll-responsive refraction */
  enableScrollRefraction?: boolean
}

// =============================================================================
// GlassTile (internal)
// =============================================================================

interface GlassTileProps {
  tile: TileConfig
  scrollOffset: number
  scrollVelocity: number
  backgroundImage: string
  containerHeight: number
  borderRadius: number
}

function GlassTile({
  tile,
  scrollOffset,
  scrollVelocity,
  backgroundImage,
  containerHeight,
  borderRadius,
}: GlassTileProps) {
  const filterId = useId().replace(/:/g, "")
  const [displacementUrl, setDisplacementUrl] = useState("")
  const [maxDisplacement, setMaxDisplacement] = useState(15)

  useEffect(() => {
    if (tile.width <= 0 || tile.height <= 0) return

    const config: RefractionConfig = {
      refractiveIndex: tile.refractiveIndex,
      bezelWidth: tile.bezelWidth,
      glassThickness: 12,
      samples: 64,
    }

    const surfaceFunction = SurfaceFunctions[tile.surfaceType]
    const { imageData, maxDisplacement: maxDisp } = generateDisplacementMap(
      Math.round(tile.width),
      Math.round(tile.height),
      config,
      surfaceFunction
    )

    const url = imageDataToDataUrl(
      imageData,
      Math.round(tile.width),
      Math.round(tile.height)
    )
    setDisplacementUrl(url)
    setMaxDisplacement(maxDisp)
  }, [tile])

  const velocityFactor = Math.min(Math.abs(scrollVelocity) / 50, 1)
  const dynamicScale = maxDisplacement * (1 + velocityFactor * 0.3)

  const parallaxFactor = 0.5 + (tile.y / containerHeight) * 0.3
  const backgroundOffset = scrollOffset * parallaxFactor

  return (
    <>
      {displacementUrl && (
        <svg
          width="0"
          height="0"
          style={{ position: "absolute", visibility: "hidden" }}
          aria-hidden="true"
        >
          <defs>
            <filter
              id={filterId}
              x="-20%"
              y="-20%"
              width="140%"
              height="140%"
              colorInterpolationFilters="sRGB"
            >
              <feImage
                href={displacementUrl}
                x="0"
                y="0"
                width={tile.width}
                height={tile.height}
                result="dispMap"
                preserveAspectRatio="none"
              />
              <feDisplacementMap
                in="SourceGraphic"
                in2="dispMap"
                scale={dynamicScale}
                xChannelSelector="R"
                yChannelSelector="G"
                result="refracted"
              />
            </filter>
          </defs>
        </svg>
      )}

      <div
        className="absolute overflow-hidden"
        style={{
          left: tile.x,
          top: tile.y,
          width: tile.width,
          height: tile.height,
          borderRadius,
          transform: `rotate(${tile.rotation}deg)`,
        }}
      >
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url(${backgroundImage})`,
            backgroundSize: "cover",
            backgroundPosition: `${-tile.x}px ${-tile.y + backgroundOffset}px`,
            backgroundAttachment: "scroll",
            filter: displacementUrl ? `url(#${filterId})` : undefined,
            transition: "background-position 0.05s linear",
          }}
        />

        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.05) 25%, rgba(255,255,255,0.02) 50%, rgba(255,255,255,0.05) 75%, rgba(255,255,255,0.08) 100%)`,
            backdropFilter: "blur(2px) saturate(1.1)",
          }}
        />

        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-[2px]"
          style={{
            background: `linear-gradient(90deg, transparent 5%, rgba(255,255,255,${0.3 + velocityFactor * 0.2}) 30%, rgba(255,255,255,${0.5 + velocityFactor * 0.3}) 50%, rgba(255,255,255,${0.3 + velocityFactor * 0.2}) 70%, transparent 95%)`,
          }}
        />

        <div
          className="pointer-events-none absolute inset-y-0 left-0 w-[1px]"
          style={{
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.3) 10%, rgba(255,255,255,0.15) 50%, rgba(255,255,255,0.05) 90%)",
          }}
        />

        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: `linear-gradient(${135 + (scrollOffset % 360) * 0.1}deg, rgba(255,255,255,0.08) 0%, transparent 40%, transparent 100%)`,
            transition: "background 0.1s ease-out",
          }}
        />

        <div
          className="pointer-events-none absolute inset-0"
          style={{
            borderRadius,
            border: "1px solid rgba(255,255,255,0.1)",
            boxShadow:
              "inset 0 1px 0 rgba(255,255,255,0.1), 0 4px 16px rgba(0,0,0,0.2), 0 0 40px rgba(0,0,0,0.1)",
          }}
        />
      </div>
    </>
  )
}

// =============================================================================
// GlassTileBackground -- Main Component
// =============================================================================

export function GlassTileBackground({
  backgroundImage,
  columns = 4,
  rows = 6,
  gap = 16,
  borderRadius = 16,
  refractiveIndex = 1.5,
  enableScrollRefraction = true,
}: GlassTileBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [tiles, setTiles] = useState<TileConfig[]>([])
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 })
  const [scrollState, setScrollState] = useState({
    offset: 0,
    velocity: 0,
    lastTimestamp: 0,
  })

  useEffect(() => {
    if (!enableScrollRefraction) return

    let lastScrollY = window.scrollY
    let lastTime = performance.now()
    let rafId: number

    const updateScroll = () => {
      const currentScrollY = window.scrollY
      const currentTime = performance.now()
      const dt = currentTime - lastTime

      if (dt > 0) {
        const velocity = ((currentScrollY - lastScrollY) / dt) * 16
        setScrollState({
          offset: currentScrollY,
          velocity: velocity * 0.7 + scrollState.velocity * 0.3,
          lastTimestamp: currentTime,
        })
      }

      lastScrollY = currentScrollY
      lastTime = currentTime
    }

    const onScroll = () => {
      rafId = requestAnimationFrame(updateScroll)
    }

    window.addEventListener("scroll", onScroll, { passive: true })
    return () => {
      window.removeEventListener("scroll", onScroll)
      cancelAnimationFrame(rafId)
    }
  }, [enableScrollRefraction, scrollState.velocity])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0]
      if (entry) {
        setContainerSize({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        })
      }
    })

    observer.observe(container)
    return () => observer.disconnect()
  }, [])

  const generateTiles = useCallback(() => {
    if (containerSize.width <= 0 || containerSize.height <= 0) return

    const surfaceTypes: (keyof typeof SurfaceFunctions)[] = [
      "convexSquircle",
      "convexCircle",
      "lip",
      "concave",
    ]

    const newTiles: TileConfig[] = []
    const tileWidth = (containerSize.width - gap * (columns + 1)) / columns
    const tileHeight = (containerSize.height - gap * (rows + 1)) / rows

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < columns; col++) {
        const xJitter = (Math.random() - 0.5) * gap * 0.3
        const yJitter = (Math.random() - 0.5) * gap * 0.3

        newTiles.push({
          id: `tile-${row}-${col}`,
          x: gap + col * (tileWidth + gap) + xJitter,
          y: gap + row * (tileHeight + gap) + yJitter,
          width: tileWidth,
          height: tileHeight,
          refractiveIndex: refractiveIndex + (Math.random() - 0.5) * 0.3,
          bezelWidth: 0.15 + Math.random() * 0.1,
          surfaceType: surfaceTypes[(row + col) % surfaceTypes.length],
          rotation: (Math.random() - 0.5) * 1.5,
        })
      }
    }

    setTiles(newTiles)
  }, [containerSize, columns, rows, gap, refractiveIndex])

  useEffect(() => {
    generateTiles()
  }, [generateTiles])

  return (
    <div ref={containerRef} className="fixed inset-0 overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          transform: `translateY(${scrollState.offset * 0.1}px)`,
          transition: "transform 0.05s linear",
        }}
      />

      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 30%, transparent 0%, rgba(0,0,0,0.2) 70%, rgba(0,0,0,0.4) 100%)",
        }}
      />

      {tiles.map((tile) => (
        <GlassTile
          key={tile.id}
          tile={tile}
          scrollOffset={scrollState.offset}
          scrollVelocity={scrollState.velocity}
          backgroundImage={backgroundImage}
          containerHeight={containerSize.height}
          borderRadius={borderRadius}
        />
      ))}

      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: `
            radial-gradient(circle at 70% 20%, rgba(255,200,100,0.08) 0%, transparent 40%),
            radial-gradient(circle at 20% 80%, rgba(100,150,255,0.06) 0%, transparent 50%)
          `,
          mixBlendMode: "overlay",
        }}
      />
    </div>
  )
}
