"use client";

import { useEffect, useCallback } from "react";
import { X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import ProtectedVideoPlayer from "./ProtectedVideoPlayer";

interface VideoLightboxProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly videoUrl: string;
  readonly posterUrl?: string;
}

const YOUTUBE_REGEX =
  /(?:youtube\.com\/(?:watch\?v=|embed\/|v\/)|youtu\.be\/)/;

export default function VideoLightbox({
  isOpen,
  onClose,
  videoUrl,
  posterUrl,
}: VideoLightboxProps) {
  const isYouTube = YOUTUBE_REGEX.test(videoUrl);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    },
    [onClose],
  );

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, handleKeyDown]);

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md"
          onClick={handleBackdropClick}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-50 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
            aria-label="Close video"
          >
            <X className="w-5 h-5 text-white" />
          </button>

          {/* Video container */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="w-full max-w-5xl mx-4 aspect-video"
          >
            {videoUrl ? (
              <ProtectedVideoPlayer
                src={videoUrl}
                poster={posterUrl}
                isYouTube={isYouTube}
                className="w-full h-full"
              />
            ) : (
              <div className="w-full h-full rounded-xl bg-[#111827] border border-white/10 flex items-center justify-center">
                <p className="text-text-secondary text-lg">Video coming soon</p>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
