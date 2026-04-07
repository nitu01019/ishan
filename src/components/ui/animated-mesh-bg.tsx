"use client"

import dynamic from "next/dynamic"
import { cn } from "@/lib/utils"

// Lazy load the WebGL shader - show CSS fallback while loading
const MeshGradient = dynamic(
  () => import("@paper-design/shaders-react").then((mod) => mod.MeshGradient),
  {
    ssr: false,
    loading: () => (
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse at 20% 50%, rgba(6,182,212,0.15) 0%, transparent 50%),
            radial-gradient(ellipse at 80% 20%, rgba(8,145,178,0.12) 0%, transparent 50%),
            radial-gradient(ellipse at 40% 80%, rgba(249,115,22,0.08) 0%, transparent 50%)
          `,
        }}
      />
    ),
  }
)

interface AnimatedMeshBgProps {
  className?: string
  children: React.ReactNode
}

export function AnimatedMeshBg({ className, children }: AnimatedMeshBgProps) {
  return (
    <div className={cn("relative overflow-clip", className)}>
      {/* WebGL mesh gradient background (lazy loaded) */}
      <div className="absolute inset-0 z-0 opacity-50">
        <MeshGradient
          colors={["#0B1120", "#06b6d4", "#0891b2", "#164e63", "#f97316"]}
          speed={0.2}
          distortion={0.6}
          swirl={0.15}
          style={{ width: "100%", height: "100%" }}
        />
      </div>

      {/* Subtle grid overlay */}
      <div
        className="absolute inset-0 z-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
      />

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  )
}
