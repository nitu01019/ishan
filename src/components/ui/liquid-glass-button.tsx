"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

const liquidButtonVariants = {
  default: "text-white hover:scale-105",
  green: "text-black hover:scale-105",
  outline: "text-white border border-white/20 hover:scale-105",
}

const liquidButtonSizes = {
  default: "h-10 px-6 py-2",
  sm: "h-8 px-4 text-xs",
  lg: "h-12 px-8 text-base",
  xl: "h-14 px-10 text-lg",
}

export interface LiquidButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof liquidButtonVariants
  size?: keyof typeof liquidButtonSizes
  href?: string
}

const LiquidButton = React.forwardRef<HTMLButtonElement, LiquidButtonProps>(
  ({ className, variant = "default", size = "default", href, children, ...props }, ref) => {
    const isGreen = variant === "green"
    const classes = cn(
      "relative inline-flex items-center justify-center cursor-pointer gap-2 whitespace-nowrap rounded-full text-sm font-semibold transition-all duration-300 disabled:pointer-events-none disabled:opacity-50 overflow-hidden",
      liquidButtonVariants[variant],
      liquidButtonSizes[size],
      className
    )

    const glassOverlay = (
      <>
        <div className={cn(
          "absolute inset-0 rounded-full",
          isGreen ? "bg-[#00E676]" : "backdrop-blur-md bg-white/5"
        )} />
        <div className="absolute inset-0 rounded-full" style={{
          boxShadow: isGreen
            ? "inset 0 1px 1px rgba(255,255,255,0.4), inset 0 -1px 1px rgba(0,0,0,0.1), 0 0 20px rgba(0,230,118,0.15)"
            : "inset 0 1px 1px rgba(255,255,255,0.15), inset 0 -1px 1px rgba(255,255,255,0.05), 0 0 12px rgba(255,255,255,0.05)"
        }} />
        <div className={cn(
          "absolute top-0 left-[10%] right-[10%] h-[45%] rounded-full opacity-30",
          isGreen ? "bg-gradient-to-b from-white/60 to-transparent" : "bg-gradient-to-b from-white/20 to-transparent"
        )} />
      </>
    )

    const content = (
      <>
        {glassOverlay}
        <span className="relative z-10 flex items-center gap-2">{children}</span>
      </>
    )

    if (href) {
      return <a href={href} className={classes}>{content}</a>
    }

    return (
      <button ref={ref} className={classes} {...props}>{content}</button>
    )
  }
)
LiquidButton.displayName = "LiquidButton"

export { LiquidButton }
