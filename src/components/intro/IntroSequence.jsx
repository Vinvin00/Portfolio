import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import useStore from '../../store/useStore'

const INTRO_START_Y = 50
const LANDING_Y = 1

export default function IntroSequence() {
  const setPlayerPosition = useStore((s) => s.setPlayerPosition)
  const setIntroComplete = useStore((s) => s.setIntroComplete)
  const introComplete = useStore((s) => s.introComplete)

  const [overlayVisible, setOverlayVisible] = useState(!introComplete)
  const overlayRef = useRef(null)
  const promptRef = useRef(null)
  const pulseRef = useRef(null)
  const transitionTimelineRef = useRef(null)
  const landingTriggeredRef = useRef(introComplete)

  useEffect(() => {
    if (introComplete || !overlayRef.current || !promptRef.current) {
      setOverlayVisible(false)
      return undefined
    }

    setOverlayVisible(true)
    setPlayerPosition({ x: 0, y: INTRO_START_Y, z: 0 })
    gsap.set(overlayRef.current, { opacity: 1 })

    const introNameTween = gsap.fromTo(
      '#intro-name',
      { opacity: 0, letterSpacing: '0.6em', y: -16 },
      {
        opacity: 0.85,
        letterSpacing: '0.2em',
        y: 0,
        duration: 1.1,
        ease: 'power3.out',
      },
    )

    pulseRef.current = gsap.fromTo(
      promptRef.current,
      { opacity: 0.3 },
      { opacity: 0.7, duration: 1.1, ease: 'sine.inOut', yoyo: true, repeat: -1 },
    )

    const handleLand = () => {
      if (landingTriggeredRef.current) return
      landingTriggeredRef.current = true

      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('pointerdown', onPointerDown)
      pulseRef.current?.kill()

      const landing = { y: INTRO_START_Y }
      transitionTimelineRef.current?.kill()
      transitionTimelineRef.current = gsap
        .timeline({
          onComplete: () => {
            setPlayerPosition({ x: 0, y: LANDING_Y, z: 0 })
            setIntroComplete(true)
            setOverlayVisible(false)
            gsap.set('#intro-name', { opacity: 0 })
          },
        })
        .to(
          overlayRef.current,
          {
            opacity: 0,
            duration: 0.75,
            ease: 'power2.out',
          },
          0.08,
        )
        .to(
          '#intro-name',
          {
            opacity: 0,
            duration: 0.75,
            ease: 'power2.out',
          },
          0,
        )
        .to(
          landing,
          {
            y: 1.12,
            duration: 1.45,
            ease: 'power2.in',
            onUpdate: () => {
              setPlayerPosition({ x: 0, y: landing.y, z: 0 })
            },
          },
          0,
        )
        .to(landing, {
          y: LANDING_Y,
          duration: 0.28,
          ease: 'elastic.out(1, 0.28)',
          onUpdate: () => {
            setPlayerPosition({ x: 0, y: landing.y, z: 0 })
          },
        })
    }

    function onKeyDown(e) {
      if (e.key !== ' ' && e.code !== 'Space') return
      e.preventDefault()
      handleLand()
    }

    function onPointerDown(e) {
      e.preventDefault()
      e.stopPropagation()
      handleLand()
    }

    window.addEventListener('keydown', onKeyDown)
    if (window.matchMedia('(pointer: coarse)').matches) {
      window.addEventListener('pointerdown', onPointerDown)
    }

    return () => {
      introNameTween.kill()
      pulseRef.current?.kill()
      transitionTimelineRef.current?.kill()
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('pointerdown', onPointerDown)
    }
  }, [introComplete, setIntroComplete, setPlayerPosition])

  if (!overlayVisible) return null

  return (
    <div
      ref={overlayRef}
      className="pointer-events-none fixed inset-0 z-40 select-none"
      style={{ background: 'linear-gradient(180deg, rgba(8,10,14,0.6), rgba(8,10,14,0.18))' }}
    >
      <div
        ref={promptRef}
        style={{
          position: 'fixed',
          bottom: '28%',
          left: '50%',
          transform: 'translateX(-50%)',
          fontFamily: 'VincenzoFont, serif',
          fontSize: '0.75rem',
          letterSpacing: '0.25em',
          color: 'rgba(255, 255, 255, 0.55)',
        }}
      >
        PRESS SPACE TO START
      </div>
    </div>
  )
}
