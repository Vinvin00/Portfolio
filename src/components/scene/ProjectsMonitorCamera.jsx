import { useEffect, useRef } from 'react'
import useStore from '../../store/useStore'

/** Delay before showing iframe — matches Character projects camera tween (~1.25s). */
const IFRAME_REVEAL_MS = 1250

export default function ProjectsMonitorCamera() {
  const isProjectsScreenOpen = useStore((s) => s.isProjectsScreenOpen)
  const monitorScreenReady = useStore((s) => s.monitorScreenReady)
  const setMonitorFocused = useStore((s) => s.setMonitorFocused)
  const setMonitorIframeVisible = useStore((s) => s.setMonitorIframeVisible)
  const revealTimerRef = useRef(null)

  useEffect(() => {
    if (!isProjectsScreenOpen) {
      if (revealTimerRef.current) {
        window.clearTimeout(revealTimerRef.current)
        revealTimerRef.current = null
      }
      setMonitorFocused(false)
      setMonitorIframeVisible(false)
      return undefined
    }

    if (!monitorScreenReady) {
      return undefined
    }

    revealTimerRef.current = window.setTimeout(() => {
      if (!useStore.getState().isProjectsScreenOpen) return
      setMonitorFocused(true)
      setMonitorIframeVisible(true)
    }, IFRAME_REVEAL_MS)

    return () => {
      if (revealTimerRef.current) {
        window.clearTimeout(revealTimerRef.current)
        revealTimerRef.current = null
      }
    }
  }, [
    isProjectsScreenOpen,
    monitorScreenReady,
    setMonitorFocused,
    setMonitorIframeVisible,
  ])

  return null
}
