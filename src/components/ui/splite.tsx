'use client'

import { useState, useEffect, useCallback, useRef, Component, memo } from 'react'
import type { ReactNode } from 'react'
// Use /next subpath: the default entry ships as an async RSC component incompatible with client-only rendering.
import Spline from '@splinetool/react-spline/next'

const RETRY_DELAY_MS = 500

function SplineLoader() {
  return (
    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-black">
      <div className="w-full max-w-[320px] flex flex-col items-center gap-6 animate-pulse">
        {/* Head */}
        <div className="w-20 h-20 rounded-full bg-white/5" />
        {/* Shoulders + torso */}
        <div className="w-40 h-6 rounded-full bg-white/5" />
        <div className="w-32 h-28 rounded-2xl bg-white/5" />
        {/* Arms */}
        <div className="flex w-full justify-between -mt-24">
          <div className="w-8 h-24 rounded-xl bg-white/5" />
          <div className="w-8 h-24 rounded-xl bg-white/5" />
        </div>
        {/* Legs */}
        <div className="flex gap-6 mt-2">
          <div className="w-10 h-28 rounded-xl bg-white/5" />
          <div className="w-10 h-28 rounded-xl bg-white/5" />
        </div>
        <p className="text-white/30 text-sm mt-2">Loading 3D scene&#8230;</p>
      </div>
    </div>
  )
}

interface ErrorBoundaryProps {
  fallback: ReactNode
  children: ReactNode
  onError?: () => void
}

interface ErrorBoundaryState {
  hasError: boolean
}

class SplineErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private retryTimerId: ReturnType<typeof setTimeout> | null = null

  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true }
  }

  componentDidCatch() {
    // Clear any previous pending retry before scheduling a new one.
    if (this.retryTimerId !== null) {
      clearTimeout(this.retryTimerId)
      this.retryTimerId = null
    }
    // Warn on retry attempt so operators can see failure cadence in dev tools.
    console.warn('[SplineErrorBoundary] render error caught; scheduling retry')
    // Schedule a local backoff tracker mirroring the parent's retry delay so
    // componentWillUnmount can cancel any in-flight timer and avoid
    // setState-on-unmounted warnings during the backoff window.
    this.retryTimerId = setTimeout(() => {
      this.retryTimerId = null
    }, RETRY_DELAY_MS)
    this.props.onError?.()
  }

  componentWillUnmount() {
    if (this.retryTimerId !== null) {
      clearTimeout(this.retryTimerId)
      this.retryTimerId = null
    }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback
    }
    return this.props.children
  }
}

interface SplineSceneProps {
  scene: string
  className?: string
}

function SplineSceneInner({ scene, className }: SplineSceneProps) {
  const [retryKey, setRetryKey] = useState(0)
  const [retries, setRetries] = useState(0)
  const [loaded, setLoaded] = useState(false)
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  // Once Spline has successfully loaded, treat subsequent errors as non-fatal
  // (e.g., the runtime's own scene version migration). Retrying after load
  // remounts the <Spline /> component and causes a flicker loop.
  const hasLoadedRef = useRef(false)
  const maxRetries = 2

  const handleError = useCallback(() => {
    if (hasLoadedRef.current) {
      console.warn('[SplineScene] post-load error ignored to prevent flicker loop')
      return
    }
    if (retries < maxRetries) {
      if (retryTimerRef.current !== null) {
        clearTimeout(retryTimerRef.current)
      }
      console.warn(
        `[SplineScene] retry ${retries + 1}/${maxRetries} scheduled in ${RETRY_DELAY_MS}ms`,
      )
      retryTimerRef.current = setTimeout(() => {
        retryTimerRef.current = null
        setRetries((r) => r + 1)
        setRetryKey((k) => k + 1)
      }, RETRY_DELAY_MS)
    }
  }, [retries])

  useEffect(() => {
    hasLoadedRef.current = false
    setRetries(0)
    setRetryKey(0)
    setLoaded(false)
  }, [scene])

  useEffect(() => {
    return () => {
      if (retryTimerRef.current !== null) {
        clearTimeout(retryTimerRef.current)
        retryTimerRef.current = null
      }
    }
  }, [])

  const handleLoad = useCallback(() => {
    hasLoadedRef.current = true
    setLoaded(true)
  }, [])

  const errorFallback = (
    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-black">
      <div className="text-center">
        {retries < maxRetries ? (
          <SplineLoader />
        ) : (
          <>
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-accent-green/10 flex items-center justify-center">
              <svg className="w-10 h-10 text-accent-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.91 11.672a.375.375 0 010 .656l-5.603 3.113a.375.375 0 01-.557-.328V8.887c0-.286.307-.466.557-.327l5.603 3.112z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-white/40 text-sm">3D scene unavailable</p>
            <button
              onClick={() => { setRetries(0); setRetryKey((k) => k + 1) }}
              className="mt-3 text-accent-green text-xs hover:underline"
            >
              Try again
            </button>
          </>
        )}
      </div>
    </div>
  )

  return (
    <SplineErrorBoundary key={retryKey} fallback={errorFallback} onError={handleError}>
      <div className="relative w-full h-full">
        {/* Skeleton placeholder shown until Spline fires onLoad */}
        {!loaded && (
          <div className="absolute inset-0 z-10">
            <SplineLoader />
          </div>
        )}
        <div
          className="w-full h-full transition-opacity duration-700 ease-out"
          style={{ opacity: loaded ? 1 : 0 }}
        >
          <Spline scene={scene} className={className} onLoad={handleLoad} />
        </div>
      </div>
    </SplineErrorBoundary>
  )
}

// Memo prevents parent re-renders (e.g., Hero's word-rotation interval) from
// resetting this component, which would re-trigger the load cycle.
export const SplineScene = memo(SplineSceneInner)
