"use client";

import { useState } from "react";
import { Play, Volume2, Lock } from "lucide-react";
import type { Video } from "@/types";

interface VideoCardProps {
  readonly video: Video;
  readonly variant: "portrait" | "landscape";
  readonly showSound?: boolean;
  readonly onPlay?: () => void;
}

export default function VideoCard({ video, variant, showSound = false, onPlay }: VideoCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const isPortrait = variant === "portrait";
  const hasThumbnail = video.thumbnailUrl.length > 0;

  const handleClick = () => {
    onPlay?.();
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
  };

  return (
    <div className="group" onClick={handleClick} onContextMenu={handleContextMenu}>
      <div
        className={`relative overflow-hidden rounded-2xl border border-border-glow
          hover:border-border-glow-hover transition-all duration-200
          hover:-translate-y-1 hover:shadow-green cursor-pointer
          ${isPortrait ? "aspect-[9/16]" : "aspect-video"}`}
      >
        {/* Thumbnail or gradient placeholder */}
        {hasThumbnail && !imageError ? (
          <>
            {/* Shimmer skeleton while image loads */}
            {!imageLoaded && !imageError && (
              <div className="absolute inset-0 bg-gradient-to-br from-bg-card via-bg-card-alt to-bg-card animate-pulse" />
            )}

            {/* Actual thumbnail */}
            <img
              src={video.thumbnailUrl}
              alt={video.title}
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
                imageLoaded ? "opacity-100" : "opacity-0"
              }`}
              loading="lazy"
              decoding="async"
              draggable={false}
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
              onContextMenu={(e) => e.preventDefault()}
            />
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-bg-card via-bg-card-alt to-bg-card" />
        )}

        {/* Protected badge */}
        <div className="absolute top-3 left-3 z-10 flex items-center gap-1 px-2 py-1 rounded-full bg-black/50 backdrop-blur-sm">
          <Lock className="w-3 h-3 text-[#00E676]" />
          <span className="text-[10px] font-medium text-white/80">Protected</span>
        </div>

        {/* Duration badge */}
        {video.duration && (
          <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs font-medium px-1.5 py-0.5 rounded z-10">
            {video.duration}
          </div>
        )}

        {/* Play button overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-70 group-hover:opacity-100 transition-opacity">
          <div className="w-14 h-14 rounded-full bg-red-600 flex items-center justify-center shadow-lg">
            <Play className="w-6 h-6 text-white fill-white ml-1" />
          </div>
        </div>

        {/* Sound icon */}
        {showSound && (
          <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 flex items-center justify-center">
            <Volume2 className="w-4 h-4 text-white" />
          </div>
        )}

        {/* Title overlay for landscape */}
        {!isPortrait && video.title && video.title !== "Your Video Title" && (
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
            <p className="text-sm font-medium text-white truncate">{video.title}</p>
          </div>
        )}
      </div>

      {/* Info below portrait cards */}
      {isPortrait && (
        <div className="flex items-center justify-between mt-3 px-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent-green to-accent-teal" />
            <span className="text-sm font-medium text-white">{video.creatorName}</span>
          </div>
          {video.viewCount && <span className="text-sm text-text-secondary">{video.viewCount}</span>}
        </div>
      )}
    </div>
  );
}
