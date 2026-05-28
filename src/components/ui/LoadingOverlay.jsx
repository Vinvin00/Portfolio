import { useEffect, useLayoutEffect, useRef } from 'react'
import { gsap } from 'gsap'
import useStore from '../../store/useStore'

const N = 19
const MIN_VISIBLE_MS = 2000
const ROTS = [
  { ry: 270, a: 0.5 },
  { ry: 0, a: 0.85 },
  { ry: 90, a: 0.4 },
  { ry: 180, a: 0.0 },
]

const FACE_COUNT = 3
const FACE_TEXT = 'Loading'

const SCOPED_STYLES = `
  .loading-overlay__stage {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    min-height: 0;
    overflow: hidden;
  }

  .loading-overlay__pov {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    transform-origin: center center;
    perspective: 1200px;
    transform-style: preserve-3d;
  }

  .loading-overlay__tray {
    position: relative;
    width: 400px;
    transform-style: preserve-3d;
  }

  .loading-overlay__die {
    width: 400px;
    height: 55px;
    padding-bottom: 9px;
    position: relative;
    transform-style: preserve-3d;
    overflow: hidden;
  }

  .loading-overlay__cube {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    transform-style: preserve-3d;
  }

  .loading-overlay__face {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
    font-family: 'Montserrat', system-ui, sans-serif;
    font-weight: 900;
    font-size: 52px;
    letter-spacing: -0.02em;
    color: #fff;
    transform-style: preserve-3d;
    user-select: none;
  }
`

function Die() {
  return (
    <div className="loading-overlay__die">
      <div className="loading-overlay__cube">
        {Array.from({ length: FACE_COUNT }, (_, i) => (
          <div key={i} className="loading-overlay__face">
            {FACE_TEXT}
          </div>
        ))}
      </div>
    </div>
  )
}

export default function LoadingOverlay({ onFadeComplete }) {
  const overlayRef = useRef(null)
  const povRef = useRef(null)
  const trayRef = useRef(null)
  const animCtxRef = useRef(null)
  const motionTimelinesRef = useRef([])
  const mountTimeRef = useRef(Date.now())
  const fadeStartedRef = useRef(false)
  const onFadeCompleteRef = useRef(onFadeComplete)
  const sceneReady = useStore((s) => s.sceneReady)

  useEffect(() => {
    onFadeCompleteRef.current = onFadeComplete
  }, [onFadeComplete])

  useEffect(() => {
    const id = 'loading-overlay-montserrat'
    if (document.getElementById(id)) return undefined

    const link = document.createElement('link')
    link.id = id
    link.rel = 'stylesheet'
    link.href =
      'https://fonts.googleapis.com/css2?family=Montserrat:wght@900&display=swap'
    document.head.appendChild(link)

    return () => {
      document.getElementById(id)?.remove()
    }
  }, [])

  useLayoutEffect(() => {
    const root = overlayRef.current
    const tray = trayRef.current
    const pov = povRef.current
    if (!root || !tray || !pov) return undefined

    const dies = gsap.utils.toArray('.loading-overlay__die', tray)
    const rots = ROTS
    const timelines = []

    const layout = () => {
      gsap.set(tray, { height: N * 56 })
      gsap.set(pov, { scale: window.innerHeight / (N * 56) })
    }

    const ctx = gsap.context(() => {
      dies.forEach((die) => {
        const faces = gsap.utils.toArray('.loading-overlay__face', die)
        faces.forEach((face, fi) => {
          gsap.set(face, {
            z: 200,
            rotateY: rots[fi % 4].ry,
            transformOrigin: '50% 50% -201px',
            force3D: true,
          })
        })
      })

      dies.forEach((die, i) => {
        const cube = die.querySelector('.loading-overlay__cube')
        const faces = gsap.utils.toArray('.loading-overlay__face', die)
        const hue = (i / N) * 75 + 130

        const tl = gsap.timeline({ repeat: -1, yoyo: true })
        tl.fromTo(
          cube,
          { rotateY: -90 },
          { rotateY: 90, duration: 2, ease: 'power1.inOut', force3D: true },
        )

        faces.forEach((face, fi) => {
          const fromL = rots[fi % 4].a * 100
          const toL = rots[(fi + 1) % 4].a * 100
          tl.fromTo(
            face,
            { color: `hsl(${hue}, 67%, ${fromL}%)` },
            {
              color: `hsl(${hue}, 67%, ${toL}%)`,
              duration: 2,
              ease: 'power1.inOut',
            },
            0,
          )
        })

        tl.progress(i / N)
        timelines.push(tl)
      })

      gsap.set(dies, { opacity: 0 })
      const introTween = gsap.to(dies, {
        opacity: 1,
        duration: 0.6,
        stagger: -0.05,
        ease: 'power1.out',
      })
      timelines.push(introTween)

      const trayTl = gsap
        .timeline({ repeat: -1 })
        .fromTo(
          tray,
          { yPercent: -3 },
          { yPercent: 0, duration: 2, ease: 'power1.inOut', yoyo: true },
        )
        .fromTo(
          tray,
          { rotationX: -15 },
          { rotationX: 15, duration: 4, ease: 'power1.inOut', yoyo: true },
          0,
        )
        .fromTo(
          tray,
          { scale: 1 },
          { scale: 1.2, duration: 2, ease: 'power3.inOut', yoyo: true },
          0,
        )
      timelines.push(trayTl)

      layout()
    }, root)

    motionTimelinesRef.current = timelines
    animCtxRef.current = ctx
    window.addEventListener('resize', layout)

    return () => {
      window.removeEventListener('resize', layout)
      motionTimelinesRef.current = []
      ctx.revert()
      animCtxRef.current = null
    }
  }, [])

  useEffect(() => {
    if (!sceneReady || !overlayRef.current || fadeStartedRef.current) return undefined

    const elapsed = Date.now() - mountTimeRef.current
    const waitMs = Math.max(0, MIN_VISIBLE_MS - elapsed)

    const startFade = () => {
      if (fadeStartedRef.current || !overlayRef.current) return
      fadeStartedRef.current = true

      motionTimelinesRef.current.forEach((tl) => {
        tl.pause()
      })

      gsap.to(overlayRef.current, {
        opacity: 0,
        duration: 1.6,
        delay: 1.2,
        ease: 'power2.out',
        onComplete() {
          gsap.set(overlayRef.current, { visibility: 'hidden' })
          animCtxRef.current?.revert()
          animCtxRef.current = null
          motionTimelinesRef.current = []
          onFadeCompleteRef.current?.()
        },
      })
    }

    const timer = window.setTimeout(startFade, waitMs)

    return () => window.clearTimeout(timer)
  }, [sceneReady])

  return (
    <div
      ref={overlayRef}
      className="loading-overlay pointer-events-none fixed inset-0 z-50 flex flex-col items-center"
      style={{ background: '#0d1117', opacity: 1 }}
    >
      <style>{SCOPED_STYLES}</style>
      <div className="flex h-full w-full flex-col items-center">
        <div className="loading-overlay__stage">
          <div ref={povRef} className="loading-overlay__pov">
            <div ref={trayRef} className="loading-overlay__tray">
              {Array.from({ length: N }, (_, i) => (
                <Die key={i} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
