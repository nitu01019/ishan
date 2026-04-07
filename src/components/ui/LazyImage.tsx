"use client";

import { useState } from "react";

interface LazyImageProps {
  readonly src: string;
  readonly alt: string;
  readonly className?: string;
  readonly aspectRatio?: string;
}

export default function LazyImage({ src, alt, className = "", aspectRatio }: LazyImageProps) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  if (!src || error) {
    return (
      <div className={`bg-gradient-to-br from-[#111827] via-[#1E293B] to-[#111827] ${className}`}
           style={aspectRatio ? { aspectRatio } : undefined}
           role="img"
           aria-label={alt}
      />
    );
  }

  return (
    <div className={`relative overflow-hidden ${className}`} style={aspectRatio ? { aspectRatio } : undefined}>
      {!loaded && (
        <div className="absolute inset-0 bg-gradient-to-br from-[#111827] via-[#1E293B] to-[#111827] animate-pulse" />
      )}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        draggable={false}
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
        onContextMenu={(e) => e.preventDefault()}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          loaded ? "opacity-100" : "opacity-0"
        }`}
      />
    </div>
  );
}
