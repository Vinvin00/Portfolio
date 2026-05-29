import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { gsap } from 'gsap'
import CanvasErrorBoundary from './components/scene/CanvasErrorBoundary'
import Character from './components/scene/Character'
import MainIsland from './components/scene/MainIsland'
import ProjectsIsland from './components/scene/ProjectsIsland'
import IslandObjects from './components/scene/IslandObjects'
import ProximityTracker from './components/scene/ProximityTracker'
import VantaBackground from './components/scene/VantaBackground'
import IntroSequence from './components/intro/IntroSequence'
import LoadingOverlay from './components/ui/LoadingOverlay'
import OverlayCard from './components/ui/OverlayCard'
import CVPopup from './components/ui/CVPopup'
import ContactOverlay from './components/ui/ContactOverlay'
import ProjectCard from './components/ui/ProjectCard'
import ProjectsScreen from './components/scene/ProjectsScreen'
import HUDBar from './components/ui/HUDBar'
import MonitorBackButton from './components/ui/MonitorBackButton'
import { PROJECTS } from './config/objects'
import { useInteractKey } from './hooks/useInteractKey'
import useStore from './store/useStore'

const DARK_SCENE = '#2b2a38'
const LIGHT_SCENE = '#f5f0e8'

function SceneEnvironment({ isDarkMode, currentIsland }) {
  const [backgroundColor, setBackgroundColor] = useState(isDarkMode ? DARK_SCENE : LIGHT_SCENE)
  const colorRef = useRef(backgroundColor)

  useEffect(() => {
    const fromColor = colorRef.current
    const toColor = isDarkMode ? DARK_SCENE : LIGHT_SCENE

    const tween = gsap.fromTo(
      { progress: 0 },
      { progress: 0 },
      {
        progress: 1,
        duration: 0.6,
        ease: 'power2.out',
        onUpdate: function updateBackground() {
          const nextColor = gsap.utils.interpolate(fromColor, toColor, this.progress())
          colorRef.current = nextColor
          setBackgroundColor(nextColor)
        },
      },
    )

    return () => {
      tween.kill()
    }
  }, [isDarkMode])

  const ambientColor = useMemo(() => {
    if (isDarkMode) {
      return currentIsland === 'projects' ? '#8fafc8' : '#7a9bb8'
    }

    return currentIsland === 'projects' ? '#fff3df' : '#fff6e8'
  }, [currentIsland, isDarkMode])

  const ambientIntensity = isDarkMode
    ? currentIsland === 'projects'
      ? 1.4
      : 1.2
    : currentIsland === 'projects'
      ? 0.62
      : 0.46

  return (
    <>
      <fogExp2
        attach="fog"
        args={[backgroundColor, isDarkMode ? 0.018 : 0.012]}
      />
      <ambientLight color={ambientColor} intensity={ambientIntensity} />
      <directionalLight
        position={[-12, 16, 8]}
        intensity={isDarkMode ? 1.8 : 1.02}
        color={isDarkMode ? '#a7b9e2' : '#fff2d8'}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <pointLight
        position={[12, 8, -8]}
        intensity={isDarkMode ? 1.2 : 0}
        color="#7ba8d4"
        distance={60}
        decay={1.5}
      />
    </>
  )
}

function SceneFallback() {
  return null
}

export default function App() {
  useInteractKey()

  const currentIsland = useStore((state) => state.currentIsland)
  const introComplete = useStore((state) => state.introComplete)
  const introLandingStarted = useStore((state) => state.introLandingStarted)
  const activeOverlay = useStore((state) => state.activeOverlay)
  const nearbyObjectId = useStore((state) => state.nearbyObjectId)
  const isDarkMode = useStore((state) => state.isDarkMode)
  const setSceneReady = useStore((state) => state.setSceneReady)

  const [introEnabled, setIntroEnabled] = useState(false)
  const showIsland = introComplete || introLandingStarted

  const activeProject = activeOverlay?.startsWith('project-')
    ? PROJECTS.find((project) => `project-${project.id}` === activeOverlay)
    : null

  return (
    <div
      className={`relative h-screen w-screen overflow-hidden transition-colors duration-[400ms] ${isDarkMode ? 'dark' : ''}`}
      style={{ fontFamily: '"DM Sans", system-ui, -apple-system, sans-serif' }}
    >
      <VantaBackground isDarkMode={isDarkMode} />

      <Canvas
        className="h-screen w-screen"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'transparent',
          zIndex: 1,
        }}
        gl={{ alpha: true, antialias: true }}
        shadows
        onCreated={() => setSceneReady(true)}
        camera={{
          fov: 48,
          near: 0.1,
          far: 120,
          position: [10, 8, 10],
        }}
      >
        <CanvasErrorBoundary fallback={null}>
          <Suspense fallback={<SceneFallback />}>
            <SceneEnvironment isDarkMode={isDarkMode} currentIsland={currentIsland} />
            <Character />
            {introComplete ? <ProximityTracker currentIsland={currentIsland} /> : null}
            {showIsland && currentIsland === 'main' && (
              <>
                <MainIsland />
                <IslandObjects />
                <ProjectsScreen />
              </>
            )}
            {showIsland && currentIsland === 'projects' && <ProjectsIsland />}
          </Suspense>
        </CanvasErrorBoundary>
      </Canvas>

      {/* IntroSequence is a DOM component — must live outside the Canvas */}
      <IntroSequence introEnabled={introEnabled} />

      <LoadingOverlay onFadeComplete={() => setIntroEnabled(true)} />
      <HUDBar />
      <MonitorBackButton />

      {activeOverlay === 'about' ? (
        <OverlayCard title="About">
          <p>
            <span
              style={{
                color: isDarkMode ? 'rgba(255,255,255,0.38)' : 'rgba(0,0,0,0.35)',
                fontWeight: 300,
              }}
            >
              Name:
            </span>{' '}
            Vincenzo
          </p>
          <p>
            <span
              style={{
                color: isDarkMode ? 'rgba(255,255,255,0.38)' : 'rgba(0,0,0,0.35)',
                fontWeight: 300,
              }}
            >
              Location:
            </span>{' '}
            Madrid / Segovia
          </p>
          <p>
            <span
              style={{
                color: isDarkMode ? 'rgba(255,255,255,0.38)' : 'rgba(0,0,0,0.35)',
                fontWeight: 300,
              }}
            >
              Skills:
            </span>{' '}
            Python, APIs, automation,
            GitHub Actions, React (beginner)
          </p>
          <p>Developer building cool things.</p>
          <div
            className="mt-2 flex h-28 items-center justify-center rounded-[18px] text-xs"
            style={{
              background: isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
              border: isDarkMode ? '1px solid rgba(255,255,255,0.13)' : '1px solid rgba(0,0,0,0.1)',
              color: isDarkMode ? 'rgba(255,255,255,0.22)' : 'rgba(0,0,0,0.35)',
            }}
          >
            Headshot placeholder
          </div>
        </OverlayCard>
      ) : null}

      {activeOverlay === 'contact' ? <ContactOverlay /> : null}
      {activeOverlay === 'exploration' ? (
        <OverlayCard title="Exploration">
          <p>Exploration zone placeholder. More secrets are coming soon.</p>
        </OverlayCard>
      ) : null}
      {activeOverlay?.startsWith('project-') ? <ProjectCard project={activeProject} /> : null}
      {nearbyObjectId === 'cv-stand' && !activeOverlay && introComplete ? <CVPopup /> : null}
    </div>
  )
}
