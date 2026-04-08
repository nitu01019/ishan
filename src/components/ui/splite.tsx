'use client'

import { Suspense, lazy, useState, useEffect, useCallback, Component } from 'react'
import type { ReactNode } from 'react'

const Spline = lazy(() => import('@splinetool/react-spline'))

function SplineLoader() {
  return (
    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-black">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-3 relative">
          <div className="absolute inset-0 rounded-full border-2 border-accent-green/20" />
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-accent-green animate-spin" />
        </div>
        <p className="text-white/40 text-sm">Loading 3D scene…</p>
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
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true }
  }

  componentDidCatch() {
    this.props.onError?.()
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

export function SplineScene({ scene, className }: SplineSceneProps) {
  const [retryKey, setRetryKey] = useState(0)
  const [retries, setRetries] = useState(0)
  const maxRetries = 2

  const handleError = useCallback(() => {
    if (retries < maxRetries) {
      const timer = setTimeout(() => {
        setRetries((r) => r + 1)
        setRetryKey((k) => k + 1)
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [retries])

  useEffect(() => {
    setRetries(0)
    setRetryKey(0)
  }, [scene])

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
      <Suspense fallback={<SplineLoader />}>
        <Spline scene={scene} className={className} />
      </Suspense>
    </SplineErrorBoundary>
  )
}
