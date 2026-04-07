"use client";

import { ArrowRight } from "lucide-react";

interface ButtonProps {
  readonly children: React.ReactNode;
  readonly variant?: "primary" | "outline" | "dark";
  readonly href?: string;
  readonly className?: string;
  readonly onClick?: () => void;
  readonly type?: "button" | "submit";
  readonly showArrow?: boolean;
}

export default function Button({
  children,
  variant = "primary",
  href,
  className = "",
  onClick,
  type = "button",
  showArrow = true,
}: ButtonProps) {
  const base = "inline-flex items-center gap-2 font-semibold transition-all duration-150 active:scale-95";

  const variants = {
    primary: "bg-accent-green text-black rounded-full px-8 py-3 hover:brightness-110",
    outline: "border border-accent-green text-accent-green rounded-full px-8 py-3 hover:bg-accent-green hover:text-black",
    dark: "bg-bg-primary text-white rounded-xl px-6 py-3 hover:bg-bg-card",
  };

  const classes = `${base} ${variants[variant]} ${className}`;

  if (href) {
    return (
      <a href={href} className={classes}>
        {children}
        {showArrow && <ArrowRight className="w-4 h-4" />}
      </a>
    );
  }

  return (
    <button type={type} onClick={onClick} className={classes}>
      {children}
      {showArrow && <ArrowRight className="w-4 h-4" />}
    </button>
  );
}
