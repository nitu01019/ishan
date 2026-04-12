"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SparklesText } from "@/components/ui/sparkles-text";
import { Progress } from "@/components/ui/progress";

const MIN_DISPLAY_TIME = 2000;
const HARD_TIMEOUT = 4000; // Force-hide after 4s no matter what

export default function Preloader() {
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
          exit={{ opacity: 0, scale: 1.02 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#0B1120]"
        >
          {/* Subtle gradient background */}
          <div className="absolute inset-0 opacity-30">
            <div
              className="absolute inset-0"
              style={{
                background:
                  "radial-gradient(ellipse at 50% 50%, rgba(0,230,118,0.08) 0%, transparent 60%)",
              }}
            />
          </div>

          <div className="relative z-10 flex flex-col items-center gap-8 px-4">
            {/* Sparkles heading */}
            <SparklesText
              text="Getting Ishan's portfolio for you"
              className="text-2xl md:text-4xl lg:text-5xl font-heading font-bold text-white text-center"
              sparklesCount={15}
            />

            {/* Progress bar */}
            <div className="w-64 md:w-80">
              <Progress value={progress} />
              <p className="text-center text-text-secondary text-sm mt-3 font-mono">
                {Math.round(progress)}%
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
