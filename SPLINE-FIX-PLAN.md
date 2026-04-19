# Spline 3D Robot Restoration Plan

**Target:** `/Users/nitishbhardwaj/Desktop/video-editor-portfolio/frontend`
**Live:** https://jolly-dango-e53dcc.netlify.app (current prod commit ede5177)
**Goal:** Restore Spline 3D robot in Hero; fix "broken + loads very late" symptoms.

## 1. Root Cause

Commit ede5177 removed `'unsafe-eval'` from CSP `script-src` in `next.config.mjs:47`. Spline runtime ships Rapier physics as WebAssembly; WASM instantiation is blocked without `'wasm-unsafe-eval'`. First render fails → SplineErrorBoundary 2 retries × 2s backoff = 4s lockout before fallback renders. Matches both "doesn't render" and "loads very late."

## 2. Primary Fix

Add `'wasm-unsafe-eval'` to `script-src` (narrow, preserves `'unsafe-eval'` removal). If still broken, fallback to re-adding `'unsafe-eval'` with justifying comment.

## 3. Seven Workstreams (disjoint files)

| WS | Owner | Files | Depends |
|---|---|---|---|
| AG1 CSP patch | general-purpose | `next.config.mjs` | — |
| AG2 Hero defer + skeleton | general-purpose | `src/components/public/sections/Hero.tsx` | — |
| AG3 Spline boundary tuning | general-purpose | `src/components/ui/splite.tsx` | — |
| AG4 Preconnect hints | general-purpose | `src/app/layout.tsx` | — |
| AG5 Local build smoke | general-purpose | — (read-only verification) | AG1+2+3+4 |
| AG6 Preview deploy | general-purpose | — (netlify deploy) | AG5 |
| AG7 Prod push + verify | general-purpose | git ops | AG6 + orchestrator OK |

## 4. Acceptance Criteria

- Robot renders on desktop lg+ within 3s cold load
- Zero CSP violations in browser console
- `Content-Security-Policy` response header contains `wasm-unsafe-eval`
- Mobile (<lg) unaffected
- No LCP regression

## 5. Non-Goals

- Don't swap Spline scene URL
- Don't migrate to three.js / R3F
- Don't remove Rapier
- Don't touch mobile

## 6. Rollback

Single-file revert on next.config.mjs if CSP change breaks anything. <5 min.
