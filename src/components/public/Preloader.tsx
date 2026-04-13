"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

const MIN_DISPLAY_TIME = 2000;
const HARD_TIMEOUT = 4000; // Force-hide after 4s no matter what

interface PreloaderProps {
  portfolioName?: string;
  loadingMessage?: string;
}

export default function Preloader({
  portfolioName = "Neil's Portfolio",
  loadingMessage = "Loading...",
}: PreloaderProps) {
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [show, setShow] = useState(true);
  const minTimeRef = useRef<number>(Date.now());

  // Remove the SSR preloader overlay once this JS component mounts
  useEffect(() => {
    const ssrOverlay = document.getElementById("ssr-preloader");
    if (ssrOverlay) ssrOverlay.remove();
  }, []);

  // Hard timeout — ALWAYS hide after 4 seconds, even if progress didn't finish
  useEffect(() => {
    const hardTimer = setTimeout(() => {
      setShow(false);
    }, HARD_TIMEOUT);
    return () => clearTimeout(hardTimer);
  }, []);

  useEffect(() => {
    minTimeRef.current = Date.now();

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setIsComplete(true);
          return 100;
        }
        // Faster increments to finish within 2-3 seconds
        const increment =
          prev < 40
            ? Math.random() * 6 + 3
            : prev < 75
              ? Math.random() * 5 + 2
              : Math.random() * 3 + 1;
        return Math.min(prev + increment, 100);
      });
    }, 60);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (isComplete) {
      const elapsed = Date.now() - minTimeRef.current;
      const remaining = Math.max(0, MIN_DISPLAY_TIME - elapsed);
      const hideTimer = setTimeout(() => setShow(false), remaining + 200);
      return () => clearTimeout(hideTimer);
    }
  }, [isComplete]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black"
        >
          {/* Portfolio name */}
          <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight text-center px-4">
            {portfolioName}
          </h1>

          {/* Loading bar — thin, white, animated */}
          <div className="mt-6 w-48 h-0.5 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Loading message */}
          <p className="mt-3 text-sm text-white/50">
            {loadingMessage}
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
