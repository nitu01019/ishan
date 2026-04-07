"use client";

import { useRef, useEffect, useState } from "react";
import { Play, Pause, Volume2, VolumeX, Maximize } from "lucide-react";

interface ProtectedVideoPlayerProps {
  readonly src: string;
  readonly poster?: string;
  readonly isYouTube?: boolean;
  readonly className?: string;
}

export default function ProtectedVideoPlayer({
  src,
  poster,
  isYouTube = false,
  className = "",
}: ProtectedVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showControls, setShowControls] = useState(true);

  useEffect(() => {
    const hideTimer = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 3000);
    return () => clearTimeout(hideTimer);
  }, [isPlaying, showControls]);

  // Prevent keyboard shortcuts for saving
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === "s" || e.key === "S")) {
        e.preventDefault();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
  };

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play();
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (!video || !video.duration || !isFinite(video.duration)) return;
    setProgress((video.currentTime / video.duration) * 100);
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const video = videoRef.current;
    if (!video || !video.duration || !isFinite(video.duration)) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    video.currentTime = percent * video.duration;
  };

  const handleFullscreen = () => {
    const container = videoRef.current?.parentElement?.parentElement;
    if (container?.requestFullscreen) {
      container.requestFullscreen();
    }
  };

  // YouTube embed
  if (isYouTube) {
    const videoId = extractYouTubeId(src);
    return (
      <div
        className={`relative ${className}`}
        onContextMenu={handleContextMenu}
        style={{ userSelect: "none", WebkitUserSelect: "none" }}
      >
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1&showinfo=0`}
          className="w-full h-full rounded-xl"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title="Video player"
        />
        {/* Watermark overlay */}
        <div className="absolute bottom-4 right-4 text-white/20 text-sm font-bold pointer-events-none select-none">
          Ishan
        </div>
      </div>
    );
  }

  // Direct video player
  return (
    <div
      className={`relative group bg-black rounded-xl overflow-hidden ${className}`}
      onContextMenu={handleContextMenu}
      onMouseMove={() => setShowControls(true)}
      style={{
        userSelect: "none",
        WebkitUserSelect: "none",
        WebkitTouchCallout: "none",
      }}
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        onTimeUpdate={handleTimeUpdate}
        onEnded={() => setIsPlaying(false)}
        onClick={togglePlay}
        className="w-full h-full object-contain"
        playsInline
        controlsList="nodownload nofullscreen noremoteplayback"
        disablePictureInPicture
        onContextMenu={handleContextMenu}
      />

      {/* Transparent anti-screenshot overlay */}
      <div
        className="absolute inset-0 z-10"
        style={{ pointerEvents: "none" }}
      />

      {/* Watermark */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-20">
        <span className="text-white/[0.07] text-6xl font-bold rotate-[-25deg]">
          Ishan
        </span>
      </div>

      {/* Small corner watermark */}
      <div className="absolute bottom-12 right-4 text-white/20 text-sm font-bold pointer-events-none select-none z-20">
        Ishan
      </div>

      {/* Custom controls */}
      <div
        className={`absolute bottom-0 left-0 right-0 z-30 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity duration-300 ${
          showControls ? "opacity-100" : "opacity-0"
        }`}
      >
        {/* Progress bar */}
        <div
          className="w-full h-1 bg-white/20 rounded-full cursor-pointer mb-3 group/progress"
          onClick={handleSeek}
        >
          <div
            className="h-full bg-accent-green rounded-full relative"
            style={{ width: `${progress}%` }}
          >
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-accent-green rounded-full opacity-0 group-hover/progress:opacity-100 transition-opacity" />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={togglePlay} className="text-white hover:text-accent-green transition-colors">
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current" />}
            </button>
            <button onClick={toggleMute} className="text-white hover:text-accent-green transition-colors">
              {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>
          </div>
          <button onClick={handleFullscreen} className="text-white hover:text-accent-green transition-colors">
            <Maximize className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Big play button overlay when paused */}
      {!isPlaying && (
        <button
          onClick={togglePlay}
          className="absolute inset-0 z-20 flex items-center justify-center"
        >
          <div className="w-16 h-16 rounded-full bg-accent-green/90 flex items-center justify-center shadow-xl backdrop-blur-sm">
            <Play className="w-7 h-7 text-black fill-black ml-1" />
          </div>
        </button>
      )}
    </div>
  );
}

function extractYouTubeId(url: string): string {
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  return match?.[1] ?? url;
}
