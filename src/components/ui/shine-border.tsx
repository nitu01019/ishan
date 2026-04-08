"use client"

import { cn } from "@/lib/utils"

type TColorProp = string | string[]

interface ShineBorderProps {
  borderRadius?: number
  borderWidth?: number
  duration?: number
  color?: TColorProp
  className?: string
  children: React.ReactNode
}

export function ShineBorder({
  borderRadius = 8,
  borderWidth = 2,
  duration = 10,
  color = "#000000",
  className,
  children,
}: ShineBorderProps) {
  const colors = color instanceof Array ? color : [color]

  // Build a conic gradient with color beams evenly distributed around 360 degrees.
  // Each color gets a narrow bright band with transparent gaps between them.
  const segmentSize = 360 / colors.length
  const colorStops = colors
    .map((c, i) => {
      const start = i * segmentSize
      const peakStart = start + segmentSize * 0.15
      const peakEnd = start + segmentSize * 0.35
      const end = start + segmentSize * 0.5
      return `transparent ${start}deg, ${c} ${peakStart}deg, ${c} ${peakEnd}deg, transparent ${end}deg`
    })
    .join(", ")

  const conicGradient = `conic-gradient(from 0deg, ${colorStops})`

  return (
    <div
      className={cn(
        "relative w-full",
        className,
      )}
    >
      {/* Shine border overlay -- mask-composite clips to border region only */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: `${borderRadius}px`,
          padding: `${borderWidth}px`,
          overflow: "hidden",
          WebkitMask:
            "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          mask:
            "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          WebkitMaskComposite: "xor",
          maskComposite: "exclude",
          pointerEvents: "none",
          zIndex: 50,
        }}
      >
        {/* Large spinning conic gradient -- clipped by parent mask to border area */}
        {/* Paused on mobile via prefers-reduced-motion and media query */}
        <div
          className="motion-reduce:!hidden md:[animation-play-state:running] [animation-play-state:paused]"
          style={{
            position: "absolute",
            inset: "-200%",
            background: conicGradient,
            animation: `spin ${duration}s linear infinite`,
          }}
        />
      </div>
      {children}
    </div>
  )
}
