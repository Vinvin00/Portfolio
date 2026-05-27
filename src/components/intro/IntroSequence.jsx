import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import useStore from '../../store/useStore'

export default function IntroSequence() {
  const setPlayerPosition = useStore((s) => s.setPlayerPosition)
  const setIntroComplete = useStore((s) => s.setIntroComplete)

  const [promptVisible, setPromptVisible] = useState(false)
  const promptRef = useRef(null)
  const pulseRef = useRef(null)
  const introHasRunRef = useRef(false)
  const landingTriggeredRef = useRef(false)

  // Fade-in + pulse when prompt becomes visible
  useEffect(() => {
    if (!promptVisible || !promptRef.current) return

    const node = promptRef.current
    gsap.set(node, { opacity: 0 })

    const fadeIn = gsap.to(node, {
      opacity: 0.5,
      duration: 0.6,
      ease: 'power1.out',
      onComplete() {
        pulseRef.current = gsap.fromTo(
          node,
          { opacity: 0.3 },
          { opacity: 0.65, duration: 1.2, ease: 'sine.inOut', yoyo: true, repeat: -1 },
        )
      },
    })

    return () => {
      fadeIn.kill()
      pulseRef.current?.kill()
    }
  }, [promptVisible])

  // Main intro sequence — runs exactly once
  useEffect(() => {
    console.log('[intro] effect firing, introComplete:', useStore.getState().introComplete, 'hasRun:', introHasRunRef.current)
    if (useStore.getState().introComplete || introHasRunRef.current) return
    introHasRunRef.current = true

    let cancelled = false
    const tweens = []

    setPlayerPosition({ x: 0, y: 50, z: 0 })
    console.log('[intro] setPlayerPosition to Y=50')

    // Step 1 — fall from Y=50 to Y=12 (mid-air pause)
    console.log('[intro] starting fall tween Y=50 → Y=12')
    const fall = { y: 50 }
    const fallTween = gsap.to(fall, {
      y: 12,
      duration: 1.6,
      ease: 'power2.in',
      onUpdate() {
        if (cancelled) return
        setPlayerPosition({ x: 0, y: fall.y, z: 0 })
      },
      onComplete() {
        if (cancelled) return
        setPlayerPosition({ x: 0, y: 12, z: 0 })

        // Step 2 — name animates in
        const nameTween = gsap.fromTo(
          '#intro-name',
          { opacity: 0, letterSpacing: '0.6em', y: -16 },
          {
            opacity: 0.85,
            letterSpacing: '0.2em',
            y: 0,
            duration: 1.1,
            ease: 'power3.out',
            onComplete() {
              if (cancelled) return
              // Step 3 — show prompt and arm listeners
              setPromptVisible(true)
              window.addEventListener('keydown', onKeyDown)
              if (window.matchMedia('(pointer: coarse)').matches) {
                window.addEventListener('pointerdown', onPointerDown)
              }
            },
          },
        )
        tweens.push(nameTween)
      },
    })
    tweens.push(fallTween)

    // ── Landing handler ──

    function handleLand() {
      if (landingTriggeredRef.current) return
      landingTriggeredRef.current = true
      console.log('[intro] landing triggered')

      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('pointerdown', onPointerDown)

      pulseRef.current?.kill()

      if (promptRef.current) {
        gsap.to(promptRef.current, { opacity: 0, duration: 0.3 })
      }
      gsap.to('#intro-name', { opacity: 0, duration: 0.4 })

      const landing = { y: 12 }

      const landTween = gsap.to(landing, {
        y: 1.1,
        duration: 0.55,
        ease: 'power2.in',
        delay: 0.15,
        onUpdate() {
          if (cancelled) return
          setPlayerPosition({ x: 0, y: landing.y, z: 0 })
        },
        onComplete() {
          if (cancelled) return
          const bounceTween = gsap.to(landing, {
            y: 1.0,
            duration: 0.25,
            ease: 'elastic.out(1, 0.3)',
            onUpdate() {
              if (cancelled) return
              setPlayerPosition({ x: 0, y: landing.y, z: 0 })
            },
            onComplete() {
              if (cancelled) return
              setPlayerPosition({ x: 0, y: 1, z: 0 })
              console.log('[intro] calling setIntroComplete(true)')
              setIntroComplete(true)
              setPromptVisible(false)
              gsap.to('#intro-name', { opacity: 0.85, duration: 0.5, delay: 0.1 })
            },
          })
          tweens.push(bounceTween)
        },
      })
      tweens.push(landTween)
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

    // ── Cleanup ──

    return () => {
      cancelled = true
      introHasRunRef.current = false
      landingTriggeredRef.current = false
      tweens.forEach((t) => t.kill())
      pulseRef.current?.kill()
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('pointerdown', onPointerDown)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!promptVisible) return null

  return (
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
        color: 'rgba(255, 255, 255, 0.5)',
        zIndex: 40,
        pointerEvents: 'none',
        userSelect: 'none',
      }}
    >
      SPACE TO LAND
    </div>
  )
}
