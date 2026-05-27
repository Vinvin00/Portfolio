import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import useStore from '../../store/useStore'

export default function LoadingOverlay({ onFadeComplete }) {
  const overlayRef = useRef(null)
  const sceneReady = useStore((s) => s.sceneReady)

  useEffect(() => {
    if (!sceneReady || !overlayRef.current) return

    const tween = gsap.to(overlayRef.current, {
      opacity: 0,
      duration: 1.6,
      delay: 1.2,
      ease: 'power2.out',
      onComplete() {
        onFadeComplete?.()
      },
    })

    return () => tween.kill()
  }, [sceneReady, onFadeComplete])

  return (
    <div
      ref={overlayRef}
      className="pointer-events-none fixed inset-0 z-50"
      style={{ background: '#0d1117', opacity: 1 }}
    />
  )
}
