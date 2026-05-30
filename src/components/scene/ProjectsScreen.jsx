import { Html } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useEffect, useRef, useState } from 'react'
import { getProjectsLookAtTarget } from '../../utils/projectsView'
import { DEFAULT_PROJECTS_TUNING } from '../../store/projectsViewTuning'
import useStore from '../../store/useStore'
import ScaledProjectsIframe from './ScaledProjectsIframe'

const APPEAR_DELAY_MS = 800
const IFRAME_FADE_MS = 300

const frameStyle = {
  position: 'relative',
  boxSizing: 'border-box',
  width: '100%',
  height: '100%',
  background: '#000',
  border: '3px solid #000',
  borderRadius: 0,
  overflow: 'hidden',
  boxShadow: '0 0 40px rgba(0, 0, 0, 0.85)',
}

const loadingStyle = {
  boxSizing: 'border-box',
  width: '100%',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  background: '#0d1117',
  color: '#94a3b8',
  fontFamily: 'monospace',
  fontSize: '11px',
  letterSpacing: '0.06em',
}

function LoadingView({ progress }) {
  return (
    <div style={loadingStyle}>
      <span>Loading projects…</span>
      <div
        style={{
          marginTop: '12px',
          width: '70%',
          height: '4px',
          background: 'rgba(255,255,255,0.1)',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${progress}%`,
            background: '#3b82f6',
            transition: 'width 0.08s linear',
          }}
        />
      </div>
    </div>
  )
}

export default function ProjectsScreen() {
  const isProjectsScreenOpen = useStore((s) => s.isProjectsScreenOpen)
  const groupRef = useRef(null)
  const tuning = DEFAULT_PROJECTS_TUNING
  const [phase, setPhase] = useState('hidden')
  const [loadProgress, setLoadProgress] = useState(0)

  useEffect(() => {
    if (!isProjectsScreenOpen) {
      setPhase('hidden')
      setLoadProgress(0)
      return undefined
    }

    const showLoadingTimer = window.setTimeout(() => setPhase('loading'), APPEAR_DELAY_MS)
    const showContentTimer = window.setTimeout(
      () => setPhase('content'),
      APPEAR_DELAY_MS + 480,
    )

    return () => {
      window.clearTimeout(showLoadingTimer)
      window.clearTimeout(showContentTimer)
    }
  }, [isProjectsScreenOpen])

  useEffect(() => {
    if (phase !== 'loading') {
      setLoadProgress(0)
      return undefined
    }

    const start = performance.now()
    let frameId = 0

    const tick = (now) => {
      const elapsed = now - start
      const t = Math.min(elapsed / 480, 1)
      setLoadProgress(t * 100)
      if (t < 1) frameId = requestAnimationFrame(tick)
    }

    frameId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frameId)
  }, [phase])

  useFrame(({ camera }) => {
    if (!groupRef.current || phase === 'hidden') return
    const lookAtTarget = getProjectsLookAtTarget()
    const towardCamera = camera.position.clone().sub(lookAtTarget).normalize()
    groupRef.current.position
      .copy(lookAtTarget)
      .addScaledVector(towardCamera, tuning.panelDistance)
    groupRef.current.quaternion.copy(camera.quaternion)
  })

  if (!isProjectsScreenOpen || phase === 'hidden') return null

  const showIframe = phase === 'content'

  return (
    <group ref={groupRef}>
      <Html
        center
        transform
        distanceFactor={tuning.panelDistanceFactor}
        zIndexRange={[100, 0]}
        style={{
          width: `${tuning.panelWidth}px`,
          height: `${tuning.panelHeight}px`,
          overflow: 'hidden',
          transform: `translate(${tuning.panelOffsetX}px, ${tuning.panelOffsetY}px)`,
          transformOrigin: 'center center',
          pointerEvents: showIframe ? 'auto' : 'none',
        }}
      >
        <div style={frameStyle}>
          {phase === 'loading' ? <LoadingView progress={loadProgress} /> : null}

          {showIframe ? (
            <ScaledProjectsIframe title="Projects" fadeMs={IFRAME_FADE_MS} />
          ) : null}
        </div>
      </Html>
    </group>
  )
}
