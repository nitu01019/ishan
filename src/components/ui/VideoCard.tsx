"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Play, Volume2, Lock, X } from "lucide-react";
import { formatDuration } from "@/lib/format-duration";
import type { Video } from "@/types";

// ---------------------------------------------------------------------------
// YouTube helpers
// ---------------------------------------------------------------------------

const YOUTUBE_REGEX =
  /(?:youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/)|youtu\.be\/)/;

function extractYouTubeId(url: string): string | null {
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  return match?.[1] ?? null;
}

function isYouTubeUrl(url: string): boolean {
  return YOUTUBE_REGEX.test(url);
}

// ---------------------------------------------------------------------------
// Preload tracking — avoid duplicate fetches across card instances
// ---------------------------------------------------------------------------

const preloadedHeadUrls = new Set<string>();
const preloadedRangeUrls = new Set<string>();

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface VideoCardProps {
  readonly video: Video;
  readonly variant: "portrait" | "landscape";
  readonly showSound?: boolean;
  readonly onPlay?: () => void;
}

export default function VideoCard({ video, variant, showSound = false, onPlay }: VideoCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPreloading, setIsPreloading] = useState(false);

  const cardRef = useRef<HTMLDivElement>(null);

  const isPortrait = variant === "portrait";
  const hasThumbnail = video.thumbnailUrl.length > 0;
  const isYouTube = isYouTubeUrl(video.videoUrl);
  const youtubeId = isYouTube ? extractYouTubeId(video.videoUrl) : null;

  // -----------------------------------------------------------------------
  // Task 3: Warm DNS + TCP for direct video files when card enters viewport
  // -----------------------------------------------------------------------
  useEffect(() => {
    if (isYouTube) return;

    const videoUrl = video.videoUrl;
    if (!videoUrl || preloadedHeadUrls.has(videoUrl)) return;

    const el = cardRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry?.isIntersecting && !preloadedHeadUrls.has(videoUrl)) {
          preloadedHeadUrls.add(videoUrl);
          fetch(videoUrl, { method: "HEAD", mode: "cors" }).catch(() => {
            // Best-effort — silently ignore failures
          });
          observer.disconnect();
        }
      },
      { rootMargin: "200px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [isYouTube, video.videoUrl]);

  // -----------------------------------------------------------------------
  // Task 3 (hover): Preload first 500 KB of direct video on hover
  // -----------------------------------------------------------------------
  const preloadVideoRange = useCallback(() => {
    if (isYouTube) return;

    const videoUrl = video.videoUrl;
    if (!videoUrl || preloadedRangeUrls.has(videoUrl)) return;

    preloadedRangeUrls.add(videoUrl);
    fetch(videoUrl, {
      method: "GET",
      headers: { Range: "bytes=0-500000" },
      mode: "cors",
    }).catch(() => {
      // Best-effort — silently ignore failures
    });
  }, [isYouTube, video.videoUrl]);

  // -----------------------------------------------------------------------
  // Task 2: Predictive preload for YouTube — hidden iframe on hover
  // -----------------------------------------------------------------------
  const handlePointerEnter = useCallback(() => {
    if (isYouTube && youtubeId && !isPlaying) {
      setIsPreloading(true);
    }
    if (!isYouTube) {
      preloadVideoRange();
    }
  }, [isYouTube, youtubeId, isPlaying, preloadVideoRange]);

  const handleClick = () => {
    if (isYouTube && youtubeId) {
      // Play inline — replace thumbnail with YouTube iframe
      setIsPlaying(true);
    } else if (video.videoUrl) {
      // Non-YouTube videos: play inline with HTML5 video
      setIsPlaying(true);
    } else {
      onPlay?.();
    }
  };

  const handleStop = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsPlaying(false);
    setIsPreloading(false);
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
  };

  return (
    <div
      className="group"
      ref={cardRef}
      onContextMenu={handleContextMenu}
      onMouseEnter={handlePointerEnter}
      onTouchStart={handlePointerEnter}
    >
      <div
        className={`relative overflow-hidden rounded-2xl border border-border-glow
          transition-all duration-200
          ${isPlaying ? "" : "hover:border-border-glow-hover hover:-translate-y-1 hover:shadow-green cursor-pointer"}
          ${isPortrait ? "aspect-[9/16]" : "aspect-video"}`}
        onClick={isPlaying ? undefined : handleClick}
        onKeyDown={isPlaying ? undefined : (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); handleClick(); } }}
        role={isPlaying ? undefined : "button"}
        tabIndex={isPlaying ? undefined : 0}
        aria-label={isPlaying ? undefined : `Play video: ${video.title}`}
      >
        {/* ---- HIDDEN YOUTUBE PRELOAD IFRAME ---- */}
        {isPreloading && !isPlaying && youtubeId && (
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${youtubeId}?rel=0&modestbranding=1`}
            className="absolute inset-0 w-full h-full opacity-0 pointer-events-none"
            allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            tabIndex={-1}
            aria-hidden="true"
            title={`Preloading ${video.title}`}
          />
        )}

        {/* ---- INLINE PLAYER ---- */}
        {isPlaying && youtubeId ? (
          <>
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&rel=0&modestbranding=1`}
              className="absolute inset-0 w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title={video.title}
            />
            {/* Close / stop button */}
            <button
              onClick={handleStop}
              className="absolute top-2 right-2 z-20 w-8 h-8 rounded-full bg-black/70 hover:bg-black/90 flex items-center justify-center transition-colors"
              aria-label="Stop video"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </>
        ) : isPlaying && !youtubeId ? (
          <>
            <video
              src={video.videoUrl}
              poster={video.thumbnailUrl}
              className="absolute inset-0 w-full h-full object-cover"
              autoPlay
              controls
              playsInline
              title={video.title}
            />
            {/* Close / stop button */}
            <button
              onClick={handleStop}
              className="absolute top-2 right-2 z-20 w-8 h-8 rounded-full bg-black/70 hover:bg-black/90 flex items-center justify-center transition-colors"
              aria-label="Stop video"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </>
        ) : (
          <>
            {/* ---- THUMBNAIL ---- */}
            {hasThumbnail && !imageError ? (
              <>
                {!imageLoaded && !imageError && (
                  <div className="absolute inset-0 bg-gradient-to-br from-bg-card via-bg-card-alt to-bg-card animate-pulse" />
                )}
                <img
                  src={video.thumbnailUrl}
                  alt={video.title}
                  className={`absolute inset-0 w-full h-full object-cover transition-all duration-300 group-hover:scale-105 ${
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
                {formatDuration(video.duration)}
              </div>
            )}

            {/* Play button overlay */}
            <div className="absolute inset-0 flex items-center justify-center opacity-70 group-hover:opacity-100 transition-opacity">
              <div className="w-14 h-14 rounded-full bg-red-600 flex items-center justify-center shadow-lg transition-transform duration-200 group-hover:scale-110">
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
          </>
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
