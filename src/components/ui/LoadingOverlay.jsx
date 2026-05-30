import { useEffect, useRef } from 'react'
import { useProgress } from '@react-three/drei'
import useStore from '../../store/useStore'

const MIN_VISIBLE_MS = 200

export default function LoadingOverlay({ onFadeComplete }) {
  const overlayRef = useRef(null)
  const barRef = useRef(null)
  const pctRef = useRef(null)
  const mountTimeRef = useRef(Date.now())
  const fadeStartedRef = useRef(false)
  const onFadeCompleteRef = useRef(onFadeComplete)
  const sceneReady = useStore((s) => s.sceneReady)
  const { progress } = useProgress()

  useEffect(() => {
    onFadeCompleteRef.current = onFadeComplete
  }, [onFadeComplete])

  // Keep progress bar in sync without React re-renders
  useEffect(() => {
    if (barRef.current) barRef.current.style.width = `${progress}%`
    if (pctRef.current) pctRef.current.textContent = `${Math.round(progress)}%`
  }, [progress])

  const dismiss = useRef(null)
  dismiss.current = () => {
    if (fadeStartedRef.current || !overlayRef.current) return
    fadeStartedRef.current = true
    overlayRef.current.style.transition = 'opacity 0.35s cubic-bezier(0.4,0,0.2,1)'
    overlayRef.current.style.opacity = '0'
    window.setTimeout(() => {
      if (overlayRef.current) overlayRef.current.style.visibility = 'hidden'
      onFadeCompleteRef.current?.()
    }, 350)
  }

  // Dismiss when the Canvas signals it's ready
  useEffect(() => {
    if (!sceneReady) return undefined
    const elapsed = Date.now() - mountTimeRef.current
    const waitMs = Math.max(0, MIN_VISIBLE_MS - elapsed)
    const t = window.setTimeout(() => dismiss.current(), waitMs)
    return () => window.clearTimeout(t)
  }, [sceneReady])

  // Hard fallback — never stuck longer than 5s regardless of sceneReady
  useEffect(() => {
    const t = window.setTimeout(() => dismiss.current(), 5000)
    return () => window.clearTimeout(t)
  }, [])

  return (
    <div
      ref={overlayRef}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: '#0d1117',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'none',
        opacity: 1,
      }}
    >
      {/* Name */}
      <div
        style={{
          fontFamily: '"DM Sans", system-ui, -apple-system, sans-serif',
          fontSize: 'clamp(28px, 5vw, 60px)',
          fontWeight: 300,
          letterSpacing: '0.2em',
          color: 'rgba(255,255,255,0.88)',
          textTransform: 'uppercase',
          marginBottom: '6px',
          userSelect: 'none',
        }}
      >
        Vincenzo
      </div>

      {/* Subtitle */}
      <div
        style={{
          fontFamily: '"DM Sans", system-ui, -apple-system, sans-serif',
          fontSize: '10px',
          fontWeight: 300,
          letterSpacing: '0.35em',
          color: 'rgba(255,255,255,0.28)',
          textTransform: 'uppercase',
          marginBottom: '44px',
          userSelect: 'none',
        }}
      >
        Portfolio
      </div>

      {/* Progress bar track */}
      <div
        style={{
          width: 'min(260px, 55vw)',
          height: '1px',
          background: 'rgba(255,255,255,0.07)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          ref={barRef}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            height: '100%',
            width: `${progress}%`,
            background: 'rgba(255,255,255,0.55)',
            transition: 'width 0.12s linear',
          }}
        />
      </div>

      {/* Percentage */}
      <div
        ref={pctRef}
        style={{
          marginTop: '10px',
          fontFamily: '"DM Mono", ui-monospace, SFMono-Regular, monospace',
          fontSize: '10px',
          letterSpacing: '0.08em',
          color: 'rgba(255,255,255,0.22)',
          userSelect: 'none',
        }}
      >
        {Math.round(progress)}%
      </div>
    </div>
  )
}
