"use client";

import { useEffect, useRef, useState, useCallback } from "react";

const STUCK_THRESHOLD_MS = 10_000;
const CHECK_INTERVAL_MS = 2_000;

export default function StuckDetector() {
  const [mounted, setMounted] = useState(false);
  const [isStuck, setIsStuck] = useState(false);
  const lastInteractionRef = useRef<number>(0);
  const overflowHiddenSinceRef = useRef<number | null>(null);

  const handleInteraction = useCallback(() => {
    lastInteractionRef.current = Date.now();
  }, []);

  useEffect(() => {
    setMounted(true);
    lastInteractionRef.current = Date.now();
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const events: ReadonlyArray<keyof WindowEventMap> = [
      "click",
      "keydown",
      "mousemove",
      "touchstart",
      "scroll",
    ];

    for (const event of events) {
      window.addEventListener(event, handleInteraction, { passive: true });
    }

    const intervalId = setInterval(() => {
      const bodyOverflow = document.body.style.overflow;
      const htmlOverflow = document.documentElement.style.overflow;
      const isOverflowLocked =
        bodyOverflow === "hidden" || htmlOverflow === "hidden";

      if (isOverflowLocked) {
        if (overflowHiddenSinceRef.current === null) {
          overflowHiddenSinceRef.current = Date.now();
        }

        const lockedDuration = Date.now() - overflowHiddenSinceRef.current;
        const idleDuration = Date.now() - lastInteractionRef.current;

        if (
          lockedDuration >= STUCK_THRESHOLD_MS &&
          idleDuration >= STUCK_THRESHOLD_MS
        ) {
          setIsStuck(true);
        }
      } else {
        overflowHiddenSinceRef.current = null;
        setIsStuck(false);
      }
    }, CHECK_INTERVAL_MS);

    return () => {
      for (const event of events) {
        window.removeEventListener(event, handleInteraction);
      }
      clearInterval(intervalId);
    };
  }, [mounted, handleInteraction]);

  if (!isStuck) {
    return null;
  }

  const handleRefresh = () => {
    document.body.style.overflow = "";
    document.documentElement.style.overflow = "";
    window.location.reload();
  };

  const handleDismiss = () => {
    lastInteractionRef.current = Date.now();
    overflowHiddenSinceRef.current = Date.now();
    setIsStuck(false);
  };

  return (
    <div
      role="alert"
      style={{
        position: "fixed",
        bottom: "1.5rem",
        right: "1.5rem",
        zIndex: 99999,
        display: "flex",
        alignItems: "center",
        gap: "0.75rem",
        padding: "0.875rem 1.25rem",
        borderRadius: "0.75rem",
        backgroundColor: "rgba(30, 30, 40, 0.95)",
        border: "1px solid rgba(255, 255, 255, 0.15)",
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.5)",
        backdropFilter: "blur(12px)",
        color: "#ffffff",
        fontSize: "0.875rem",
        fontFamily: "system-ui, -apple-system, sans-serif",
        maxWidth: "calc(100vw - 3rem)",
        animation: "stuckFadeIn 0.3s ease-out",
      }}
    >
      <style
        dangerouslySetInnerHTML={{
          __html: `@keyframes stuckFadeIn {
  from { opacity: 0; transform: translateY(1rem); }
  to { opacity: 1; transform: translateY(0); }
}`,
        }}
      />
      <span style={{ flexShrink: 0, fontSize: "1.125rem" }} aria-hidden="true">
        !
      </span>
      <span>Page seems stuck.</span>
      <button
        onClick={handleRefresh}
        style={{
          padding: "0.375rem 0.75rem",
          borderRadius: "0.5rem",
          border: "none",
          backgroundColor: "#00E676",
          color: "#000000",
          fontWeight: 600,
          fontSize: "0.8125rem",
          cursor: "pointer",
          whiteSpace: "nowrap",
          flexShrink: 0,
        }}
      >
        Refresh
      </button>
      <button
        onClick={handleDismiss}
        aria-label="Dismiss"
        style={{
          padding: "0.25rem",
          border: "none",
          backgroundColor: "transparent",
          color: "rgba(255, 255, 255, 0.5)",
          cursor: "pointer",
          fontSize: "1.125rem",
          lineHeight: 1,
          flexShrink: 0,
        }}
      >
        x
      </button>
    </div>
  );
}
