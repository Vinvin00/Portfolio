import { gsap } from 'gsap'
import { memo, useEffect, useRef } from 'react'
import useStore from '../../store/useStore'

function OverlayCard({ title, children, className = '', contentClassName = '' }) {
  const setActiveOverlay = useStore((state) => state.setActiveOverlay)
  const isDarkMode = useStore((state) => state.isDarkMode)
  const backdropRef = useRef(null)
  const cardRef = useRef(null)
  const closingRef = useRef(false)

  useEffect(() => {
    if (!cardRef.current || !backdropRef.current) return undefined

    const ctx = gsap.context(() => {
      gsap.set(backdropRef.current, { opacity: 0 })
      gsap.set(cardRef.current, { opacity: 0, scale: 0.96, y: 10 })
      gsap.to(backdropRef.current, { opacity: 1, duration: 0.22, ease: 'power2.out' })
      gsap.to(cardRef.current, {
        opacity: 1,
        scale: 1,
        y: 0,
        duration: 0.25,
        ease: 'power2.out',
      })
    }, cardRef)

    return () => ctx.revert()
  }, [])

  const closeWithAnimation = () => {
    if (!cardRef.current || !backdropRef.current || closingRef.current) return
    closingRef.current = true

    gsap.to(cardRef.current, {
      opacity: 0,
      scale: 0.96,
      y: 8,
      duration: 0.2,
      ease: 'power2.inOut',
    })
    gsap.to(backdropRef.current, {
      opacity: 0,
      duration: 0.2,
      ease: 'power2.inOut',
      onComplete: () => {
        setActiveOverlay(null)
      },
    })
  }

  return (
    <div
      ref={backdropRef}
      className="fixed inset-0 z-50 flex items-center justify-center px-4 backdrop-blur-sm transition-colors duration-[400ms]"
      style={{ background: isDarkMode ? 'rgba(0,0,0,0.35)' : 'rgba(0,0,0,0.18)' }}
      onClick={closeWithAnimation}
      role="presentation"
    >
      <div
        ref={cardRef}
        className={`relative w-full max-w-[480px] rounded-[24px] p-8 ${className}`}
        style={{
          background: isDarkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)',
          backdropFilter: 'blur(28px) saturate(180%)',
          border: isDarkMode ? '1px solid rgba(255, 255, 255, 0.13)' : '1px solid rgba(0, 0, 0, 0.1)',
          boxShadow: isDarkMode
            ? '0 8px 32px rgba(0,0,0,0.4), 0 1px 0 rgba(255,255,255,0.08) inset'
            : '0 8px 28px rgba(0,0,0,0.14), 0 1px 0 rgba(255,255,255,0.2) inset',
          color: isDarkMode ? 'rgba(255, 255, 255, 0.88)' : 'rgba(0, 0, 0, 0.72)',
          transition: 'background-color 0.4s ease, border-color 0.4s ease, color 0.4s ease',
          fontFamily: '"DM Sans", system-ui, -apple-system, sans-serif',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={closeWithAnimation}
          className="absolute right-5 top-5 z-10 text-xl leading-none transition"
          style={{ color: isDarkMode ? 'rgba(255, 255, 255, 0.22)' : 'rgba(0, 0, 0, 0.35)' }}
          aria-label="Close overlay"
        >
          ×
        </button>

        {title ? (
          <>
            <div className="pr-8">
              <h2 className="text-[18px]" style={{ fontWeight: 400 }}>
                {title}
              </h2>
            </div>
            <div
              className="my-4 h-px w-full"
              style={{ background: isDarkMode ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.1)' }}
            />
          </>
        ) : null}

        <div className={`space-y-3 text-left text-sm ${contentClassName}`} style={{ fontWeight: 400 }}>
          {children}
        </div>
      </div>
    </div>
  )
}

export default memo(OverlayCard)
