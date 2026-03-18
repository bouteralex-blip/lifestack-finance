"use client"

import { useEffect, useState, useId, useMemo } from "react"
import {
  generateDisplacementMap,
  generateSpecularMap,
  imageDataToDataUrl,
  SurfaceFunctions,
  type RefractionConfig,
} from "@/lib/liquid-glass-physics"

// =============================================================================
// LiquidGlassFilter -- Props & Types
// =============================================================================

export interface LiquidGlassFilterProps {
  /** Width of the element in pixels */
  width: number
  /** Height of the element in pixels */
  height: number
  /** Refractive index (1.0 = none, 1.5 = glass, 2.4 = diamond) */
  refractiveIndex?: number
  /** Bezel width as percentage of radius (0-1) */
  bezelWidth?: number
  /** Glass thickness for refraction calculation */
  glassThickness?: number
  /** Scale multiplier for the displacement effect */
  scale?: number
  /** Specular highlight opacity (0-1) */
  specularOpacity?: number
  /** Surface type for different glass profiles */
  surfaceType?: "convexSquircle" | "convexCircle" | "concave" | "lip"
  /** Additional blur amount */
  blurAmount?: number
}

// =============================================================================
// LiquidGlassFilter -- SVG filter definition
// =============================================================================

export function LiquidGlassFilter({
  width,
  height,
  refractiveIndex = 1.5,
  bezelWidth = 0.25,
  glassThickness = 15,
  scale = 1.0,
  specularOpacity = 0.5,
  surfaceType = "convexSquircle",
  blurAmount = 0,
}: LiquidGlassFilterProps) {
  const filterId = useId()
  const [displacementUrl, setDisplacementUrl] = useState<string>("")
  const [specularUrl, setSpecularUrl] = useState<string>("")
  const [maxDisplacement, setMaxDisplacement] = useState<number>(20)

  const config: RefractionConfig = useMemo(
    () => ({
      refractiveIndex,
      bezelWidth,
      glassThickness,
      samples: 127,
    }),
    [refractiveIndex, bezelWidth, glassThickness]
  )

  const surfaceFunction = useMemo(
    () => SurfaceFunctions[surfaceType],
    [surfaceType]
  )

  useEffect(() => {
    if (width <= 0 || height <= 0) return

    const { imageData, maxDisplacement: maxDisp } = generateDisplacementMap(
      width,
      height,
      config,
      surfaceFunction
    )
    const dispUrl = imageDataToDataUrl(imageData, width, height)
    setDisplacementUrl(dispUrl)
    setMaxDisplacement(maxDisp)

    const specData = generateSpecularMap(
      width,
      height,
      config,
      -Math.PI / 3,
      surfaceFunction
    )
    const specUrl = imageDataToDataUrl(specData, width, height)
    setSpecularUrl(specUrl)
  }, [width, height, config, surfaceFunction])

  if (!displacementUrl) {
    return null
  }

  const effectiveScale = maxDisplacement * scale

  return (
    <svg
      width="0"
      height="0"
      style={{ position: "absolute", visibility: "hidden" }}
      aria-hidden="true"
    >
      <defs>
        <filter
          id={`liquid-glass-${filterId}`}
          x="0"
          y="0"
          width="100%"
          height="100%"
          colorInterpolationFilters="sRGB"
        >
          <feImage
            href={displacementUrl}
            x="0"
            y="0"
            width={width}
            height={height}
            result="dispMap"
            preserveAspectRatio="none"
          />

          {blurAmount > 0 && (
            <feGaussianBlur
              in="SourceGraphic"
              stdDeviation={blurAmount}
              result="blurred"
            />
          )}

          <feDisplacementMap
            in={blurAmount > 0 ? "blurred" : "SourceGraphic"}
            in2="dispMap"
            scale={effectiveScale}
            xChannelSelector="R"
            yChannelSelector="G"
            result="refracted"
          />

          {specularOpacity > 0 && specularUrl && (
            <>
              <feImage
                href={specularUrl}
                x="0"
                y="0"
                width={width}
                height={height}
                result="specMap"
                preserveAspectRatio="none"
              />

              <feBlend
                in="refracted"
                in2="specMap"
                mode="screen"
                result="withSpecular"
              />

              <feComponentTransfer in="specMap" result="specAdjusted">
                <feFuncA type="linear" slope={specularOpacity} />
              </feComponentTransfer>

              <feComposite
                in="specAdjusted"
                in2="refracted"
                operator="over"
                result="final"
              />
            </>
          )}
        </filter>
      </defs>
    </svg>
  )
}

// =============================================================================
// useLiquidGlassFilter -- Hook for CSS usage
// =============================================================================

export function useLiquidGlassFilter(props: LiquidGlassFilterProps) {
  const filterId = useId()

  return {
    filterId: `liquid-glass-${filterId}`,
    filterUrl: `url(#liquid-glass-${filterId})`,
    FilterComponent: () => <LiquidGlassFilter {...props} />,
  }
}
