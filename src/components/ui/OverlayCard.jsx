import { gsap } from 'gsap'
import { useEffect, useRef } from 'react'
import useStore from '../../store/useStore'

export default function OverlayCard({ title, children }) {
  const setActiveOverlay = useStore((state) => state.setActiveOverlay)
  const cardRef = useRef(null)

  useEffect(() => {
    if (!cardRef.current) return undefined

    gsap.fromTo(
      cardRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' },
    )
  }, [])

  return (
    <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div
        ref={cardRef}
        className="relative w-[90%] max-w-lg rounded-2xl border border-white/10 bg-gray-900/80 p-7 text-white shadow-2xl backdrop-blur-md"
      >
        <button
          type="button"
          onClick={() => setActiveOverlay(null)}
          className="absolute right-4 top-3 text-2xl leading-none text-white/70 transition hover:text-white"
          aria-label="Close overlay"
        >
          ×
        </button>

        <h2 className="mb-4 text-2xl font-semibold tracking-wide">{title}</h2>
        <div className="space-y-3 text-left text-sm text-white/90">{children}</div>
      </div>
    </div>
  )
}
