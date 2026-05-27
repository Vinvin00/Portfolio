import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { gsap } from 'gsap'
import CanvasErrorBoundary from './components/scene/CanvasErrorBoundary'
import Character from './components/scene/Character'
import MainIsland from './components/scene/MainIsland'
import ProjectsIsland from './components/scene/ProjectsIsland'
import IslandObjects from './components/scene/IslandObjects'
import ProximityTracker from './components/scene/ProximityTracker'
import IntroSequence from './components/intro/IntroSequence'
import LoadingOverlay from './components/ui/LoadingOverlay'
import OverlayCard from './components/ui/OverlayCard'
import CVPopup from './components/ui/CVPopup'
import ContactOverlay from './components/ui/ContactOverlay'
import ProjectCard from './components/ui/ProjectCard'
import { PROJECTS } from './config/objects'
import { useInteractKey } from './hooks/useInteractKey'
import useStore from './store/useStore'

const DARK_SCENE = '#2b2a38'
const LIGHT_SCENE = '#f5f0e8'
const HINT_LABELS = {
  campfire: '[E] Toggle light',
  'back-portal': '[E] Return to main island',
  'projects-door': '[E] Enter projects',
}

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
      return currentIsland === 'projects' ? '#6f7f8f' : '#5f7694'
    }

    return currentIsland === 'projects' ? '#fff3df' : '#fff6e8'
  }, [currentIsland, isDarkMode])

  const ambientIntensity = currentIsland === 'projects' ? 0.55 : 0.4

  return (
    <>
      <color attach="background" args={[backgroundColor]} />
      <fogExp2
        attach="fog"
        args={[backgroundColor, isDarkMode ? 0.018 : 0.012]}
      />
      <ambientLight color={ambientColor} intensity={ambientIntensity} />
      <directionalLight
        position={[-12, 16, 8]}
        intensity={isDarkMode ? 1.1 : 0.95}
        color={isDarkMode ? '#a7b9e2' : '#fff2d8'}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
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
    <div className={`relative h-screen w-screen overflow-hidden ${isDarkMode ? 'dark' : ''}`}>
      {/* Persistent name — opacity starts at 0; IntroSequence GSAP animates it in and out */}
      <div
        id="intro-name"
        className="pointer-events-none fixed left-1/2 top-8 z-30 -translate-x-1/2 text-2xl tracking-widest text-white/85 drop-shadow-lg md:text-3xl"
        style={{ fontFamily: 'VincenzoFont, serif', opacity: 0 }}
      >
        Vincenzo
      </div>

      {nearbyObjectId && !activeOverlay && introComplete ? (
        <div className="pointer-events-none fixed bottom-8 left-1/2 z-30 -translate-x-1/2 rounded-full border border-white/10 bg-gray-900/90 px-5 py-2 text-sm tracking-wide text-white backdrop-blur-sm transition-opacity duration-200">
          {HINT_LABELS[nearbyObjectId] ?? '[E] Interact'}
        </div>
      ) : null}

      <Canvas
        className="h-screen w-screen"
        style={{ background: '#0d1117' }}
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
              </>
            )}
            {showIsland && currentIsland === 'projects' && <ProjectsIsland />}
          </Suspense>
        </CanvasErrorBoundary>
      </Canvas>

      {/* IntroSequence is a DOM component — must live outside the Canvas */}
      <IntroSequence introEnabled={introEnabled} />

      <LoadingOverlay onFadeComplete={() => setIntroEnabled(true)} />

      {activeOverlay === 'about' ? (
        <OverlayCard title="About">
          <p>
            <span className="font-semibold text-white">Name:</span> Vincenzo
          </p>
          <p>
            <span className="font-semibold text-white">Location:</span> Madrid / Segovia
          </p>
          <p>
            <span className="font-semibold text-white">Skills:</span> Python, APIs, automation,
            GitHub Actions, React (beginner)
          </p>
          <p>Developer building cool things.</p>
          <div className="mt-2 flex h-28 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-xs text-white/70">
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
      {activeOverlay === 'cv' ? <CVPopup /> : null}
    </div>
  )
}
