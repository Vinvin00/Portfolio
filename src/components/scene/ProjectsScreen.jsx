import { Html } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef, useState } from 'react'
import { PROJECTS } from '../../config/objects'
import { getProjectsLookAtTarget } from '../../utils/projectsView'
import useStore from '../../store/useStore'

/** Wait until camera zoom is mostly done (tween is 0.9s in Character.jsx). */
const APPEAR_DELAY_MS = 720
const LOADING_DURATION_MS = 480

const frameStyle = {
  background: '#1a1a1a',
  borderRadius: '10px',
  padding: '6px',
  boxShadow: '0 0 40px rgba(0, 0, 0, 0.8), inset 0 0 0 1px rgba(255, 255, 255, 0.06)',
  fontFamily: 'monospace',
}

const screenStyle = {
  background: '#0d1117',
  borderRadius: '6px',
  padding: '8px',
  minHeight: '120px',
  border: '1px solid rgba(255, 255, 255, 0.08)',
}

const topBarStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '6px',
}

const closeButtonStyle = {
  marginTop: '10px',
  width: '100%',
  padding: '5px',
  background: 'rgba(255, 255, 255, 0.05)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderRadius: '6px',
  color: '#888',
  fontSize: '10px',
  cursor: 'pointer',
}

const contentRevealStyle = {
  animation: 'projectsScreenIn 0.4s ease-out forwards',
}

function LoadingView({ progress }) {
  return (
    <div style={screenStyle}>
      <div style={{ fontSize: '10px', color: '#64748b', marginBottom: '10px', letterSpacing: '0.06em' }}>
        INITIALIZING...
      </div>
      <div
        style={{
          fontSize: '11px',
          color: '#94a3b8',
          marginBottom: '12px',
          minHeight: '14px',
        }}
      >
        Loading projects
        <span style={{ opacity: progress > 0.33 ? 1 : 0.25 }}>.</span>
        <span style={{ opacity: progress > 0.66 ? 1 : 0.25 }}>.</span>
        <span style={{ opacity: progress > 0.9 ? 1 : 0.25 }}>.</span>
      </div>
      <div
        style={{
          height: '4px',
          background: 'rgba(255, 255, 255, 0.08)',
          borderRadius: '2px',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${progress}%`,
            background: 'linear-gradient(90deg, #2563eb, #3b82f6)',
            borderRadius: '2px',
            transition: 'width 0.08s linear',
          }}
        />
      </div>
      <div style={{ fontSize: '9px', color: '#475569', marginTop: '8px' }}>
        {Math.round(progress)}%
      </div>
    </div>
  )
}

export default function ProjectsScreen() {
  const isProjectsScreenOpen = useStore((s) => s.isProjectsScreenOpen)
  const setIsProjectsScreenOpen = useStore((s) => s.setIsProjectsScreenOpen)
  const groupRef = useRef(null)
  const lookAtTarget = useMemo(() => getProjectsLookAtTarget(), [])
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
      APPEAR_DELAY_MS + LOADING_DURATION_MS,
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
      const t = Math.min(elapsed / LOADING_DURATION_MS, 1)
      setLoadProgress(t * 100)
      if (t < 1) frameId = requestAnimationFrame(tick)
    }

    frameId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frameId)
  }, [phase])

  useFrame(({ camera }) => {
    if (!groupRef.current || phase === 'hidden') return
    const towardCamera = camera.position.clone().sub(lookAtTarget).normalize()
    groupRef.current.position.copy(lookAtTarget).addScaledVector(towardCamera, 0.06)
    groupRef.current.quaternion.copy(camera.quaternion)
  })

  if (!isProjectsScreenOpen || phase === 'hidden') return null

  return (
    <group ref={groupRef}>
      <Html
        center
        transform
        sprite
        distanceFactor={1.35}
        zIndexRange={[100, 0]}
        style={{ width: '260px', pointerEvents: phase === 'content' ? 'auto' : 'none' }}
      >
        <style>
          {`
            @keyframes projectsScreenIn {
              from {
                opacity: 0;
                transform: scale(0.97);
              }
              to {
                opacity: 1;
                transform: scale(1);
              }
            }
          `}
        </style>
        <div style={frameStyle}>
          <div style={topBarStyle}>
            <span style={{ fontSize: '9px', color: '#555' }}>VB-01</span>
            <span
              style={{
                width: '10px',
                height: '10px',
                background: phase === 'loading' ? '#eab308' : '#22c55e',
                borderRadius: '50%',
                transition: 'background 0.25s ease',
              }}
            />
          </div>
          {phase === 'loading' ? (
            <LoadingView progress={loadProgress} />
          ) : (
            <div style={contentRevealStyle}>
              <div style={screenStyle}>
                {PROJECTS.map((project, index) => (
                  <div key={project.id}>
                    {index > 0 ? (
                      <div
                        style={{
                          height: '1px',
                          background: 'rgba(255, 255, 255, 0.05)',
                          margin: '10px 0',
                        }}
                      />
                    ) : null}
                    <div style={{ fontSize: '11px', color: '#e2e8f0', marginBottom: '2px' }}>
                      {project.name}
                    </div>
                    <div style={{ fontSize: '9px', color: '#64748b', marginBottom: '5px' }}>
                      {project.description}
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '3px',
                      }}
                    >
                      {project.tech?.map((t) => (
                        <span
                          key={t}
                          style={{
                            background: 'rgba(255, 255, 255, 0.06)',
                            color: '#94a3b8',
                            padding: '2px 5px',
                            borderRadius: '4px',
                            fontSize: '9px',
                          }}
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                    <a
                      href={project.github}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        fontSize: '9px',
                        color: '#3b82f6',
                        textDecoration: 'none',
                        display: 'block',
                        marginTop: '5px',
                      }}
                    >
                      GitHub →
                    </a>
                  </div>
                ))}
                <button
                  type="button"
                  style={closeButtonStyle}
                  onClick={() => setIsProjectsScreenOpen(false)}
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </Html>
    </group>
  )
}
