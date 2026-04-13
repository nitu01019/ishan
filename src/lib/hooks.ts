"use client";

import { useState, useEffect, useSyncExternalStore } from "react";

// ---------------------------------------------------------------------------
// SSR-safe media query hook using useSyncExternalStore
// Avoids hydration mismatch by returning consistent value on server & client
// ---------------------------------------------------------------------------

function getServerSnapshot(): boolean {
  // During SSR assume mobile-first so content is always visible on first paint
  return true;
}

/** Returns true when viewport is below the given breakpoint */
export function useIsMobile(breakpoint = 1024): boolean {
  const subscribe = (callback: () => void) => {
    const mql = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);
    mql.addEventListener("change", callback);
    return () => mql.removeEventListener("change", callback);
  };

  const getSnapshot = () => {
    return window.matchMedia(`(max-width: ${breakpoint - 1}px)`).matches;
  };

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
