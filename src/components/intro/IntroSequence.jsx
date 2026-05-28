import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin'
import useStore from '../../store/useStore'

const INTRO_START_Y = 12
const LANDING_Y = 1
const INTRO_NAME = 'Vincenzo Balbi — Portfolio'

gsap.registerPlugin(ScrambleTextPlugin)

function finalizeIntroName(el) {
  if (el) el.textContent = INTRO_NAME
}

export default function IntroSequence({ introEnabled }) {
  const setPlayerPosition = useStore((s) => s.setPlayerPosition)
  const setIntroComplete = useStore((s) => s.setIntroComplete)
  const setIntroLandingStarted = useStore((s) => s.setIntroLandingStarted)
  const introComplete = useStore((s) => s.introComplete)

  const promptRef = useRef(null)
  const promptRevealTweenRef = useRef(null)
  const pulseRef = useRef(null)
  const nameRevealTweenRef = useRef(null)
  const transitionTimelineRef = useRef(null)
  const introActivatedRef = useRef(false)
  const landingTriggeredRef = useRef(introComplete)
  const introNameRef = useRef(null)

  useEffect(() => {
    if (!introEnabled || introComplete || introActivatedRef.current || !promptRef.current) {
      return undefined
    }
    introActivatedRef.current = true
    landingTriggeredRef.current = false
    setIntroLandingStarted(false)

    gsap.set(promptRef.current, { opacity: 0 })
    const nameEl = introNameRef.current
    if (nameEl) {
      nameEl.textContent = ''
      gsap.set(nameEl, { opacity: 0 })
      nameRevealTweenRef.current?.kill()
      const onNameSettled = () => finalizeIntroName(nameEl)
      nameRevealTweenRef.current = gsap.to(nameEl, {
        duration: 1.15,
        opacity: 1,
        ease: 'none',
        delay: 1.8,
        scrambleText: {
          text: INTRO_NAME,
          chars: 'upperCase',
          speed: 0.5,
          delimiter: '',
        },
        onComplete: onNameSettled,
        onInterrupt: onNameSettled,
      })
    }

    promptRevealTweenRef.current = gsap.to(promptRef.current, {
      opacity: 0.6,
      duration: 0.45,
      ease: 'power2.out',
      delay: 0.15,
      onComplete: () => {
        pulseRef.current = gsap.fromTo(
          promptRef.current,
          { opacity: 0.3 },
          { opacity: 0.7, duration: 1.1, ease: 'sine.inOut', yoyo: true, repeat: -1 },
        )
      },
    })

    const handleLand = () => {
      if (landingTriggeredRef.current) return
      landingTriggeredRef.current = true
      setIntroLandingStarted(true)
      finalizeIntroName(introNameRef.current)
      nameRevealTweenRef.current?.kill()

      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('pointerdown', onPointerDown)
      promptRevealTweenRef.current?.kill()
      pulseRef.current?.kill()
      setPlayerPosition({ x: 0, y: INTRO_START_Y, z: 0 })

      const landing = { y: INTRO_START_Y }
      transitionTimelineRef.current?.kill()
      transitionTimelineRef.current = gsap
        .timeline({
          onComplete: () => {
            setPlayerPosition({ x: 0, y: LANDING_Y, z: 0 })
            setIntroComplete(true)
          },
        })
        .to(promptRef.current, { opacity: 0, duration: 0.3, ease: 'power2.out' }, 0)
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
      promptRevealTweenRef.current?.kill()
      pulseRef.current?.kill()
      finalizeIntroName(introNameRef.current)
      nameRevealTweenRef.current?.kill()
      transitionTimelineRef.current?.kill()
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('pointerdown', onPointerDown)
      if (!landingTriggeredRef.current) {
        introActivatedRef.current = false
      }
    }
  }, [introComplete, introEnabled, setIntroComplete, setIntroLandingStarted, setPlayerPosition])

  return (
    <div className="pointer-events-none fixed inset-0 z-40 select-none">
      <h1
        ref={introNameRef}
        aria-label={INTRO_NAME}
        className="fixed left-1/2 top-6 z-30 -translate-x-1/2 text-[0.65rem] uppercase tracking-widest text-slate-300/65 md:text-xs"
        style={{ fontFamily: '"DM Sans", system-ui, sans-serif', fontWeight: 300, opacity: 0 }}
      />
      <div
        ref={promptRef}
        style={{
          position: 'fixed',
          bottom: '28%',
          left: '50%',
          transform: 'translateX(-50%)',
          fontFamily: '"DM Sans", system-ui, sans-serif',
          fontSize: '0.75rem',
          letterSpacing: '0.25em',
          color: 'rgba(255, 255, 255, 0.55)',
          opacity: 0,
        }}
      >
        PRESS SPACE TO START
      </div>
    </div>
  )
}
