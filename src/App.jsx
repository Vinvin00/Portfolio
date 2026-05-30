import { Suspense, useEffect, useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { gsap } from 'gsap'
import * as THREE from 'three'
import CanvasErrorBoundary from './components/scene/CanvasErrorBoundary'
import Character from './components/scene/Character'
import MainIsland from './components/scene/MainIsland'
import IslandObjects from './components/scene/IslandObjects'
import ProximityTracker from './components/scene/ProximityTracker'
import VantaBackground from './components/scene/VantaBackground'
import IntroSequence from './components/intro/IntroSequence'
import LoadingOverlay from './components/ui/LoadingOverlay'
import OverlayCard from './components/ui/OverlayCard'
import CVPopup from './components/ui/CVPopup'
import AboutOverlay from './components/ui/AboutOverlay'
import ContactOverlay from './components/ui/ContactOverlay'
import ProjectsScreen from './components/scene/ProjectsScreen'
import ProjectsCameraController from './components/scene/ProjectsCameraController'
import HUDBar from './components/ui/HUDBar'
import { useInteractKey } from './hooks/useInteractKey'
import useStore from './store/useStore'

const DARK_SCENE = '#2b2a38'
const LIGHT_SCENE = '#f5f0e8'

function SceneEnvironment({ isDarkMode }) {
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

  const ambientColor = isDarkMode ? '#7a9bb8' : '#fff6e8'
  const ambientIntensity = isDarkMode ? 1.2 : 0.46

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
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
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

function SceneReadySignal() {
  const setSceneReady = useStore((s) => s.setSceneReady)
  useEffect(() => {
    setSceneReady(true)
  }, [setSceneReady])
  return null
}

export default function App() {
  useInteractKey()

  // Remove stale iframe portals from earlier broken builds
  useEffect(() => {
    document.querySelectorAll('[data-monitor-iframe-root]').forEach((el) => el.remove())
  }, [])

  const introComplete = useStore((state) => state.introComplete)
  const introLandingStarted = useStore((state) => state.introLandingStarted)
  const activeOverlay = useStore((state) => state.activeOverlay)
  const nearbyObjectId = useStore((state) => state.nearbyObjectId)
  const isDarkMode = useStore((state) => state.isDarkMode)

  const [introEnabled, setIntroEnabled] = useState(false)
  const showIsland = introComplete || introLandingStarted

  return (
    <div
      className={`relative h-screen w-screen overflow-hidden transition-colors duration-[400ms] ${isDarkMode ? 'dark' : ''}`}
      style={{ fontFamily: '"DM Sans", system-ui, -apple-system, sans-serif' }}
    >
      <VantaBackground isDarkMode={isDarkMode} />

      <Canvas
        dpr={[1, 1.5]}
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
        onCreated={({ gl }) => {
          gl.shadowMap.type = THREE.PCFSoftShadowMap
          gl.outputColorSpace = THREE.SRGBColorSpace
          gl.toneMapping = THREE.ACESFilmicToneMapping
        }}
        camera={{
          fov: 48,
          near: 0.1,
          far: 120,
          position: [10, 8, 10],
        }}
      >
        <SceneReadySignal />
        <CanvasErrorBoundary fallback={null}>
          <Suspense fallback={<SceneFallback />}>
            <SceneEnvironment isDarkMode={isDarkMode} />
            <Character />
            <ProjectsCameraController />
            {introComplete ? <ProximityTracker /> : null}
            {showIsland && (
              <>
                <MainIsland />
                <IslandObjects />
                <ProjectsScreen />
              </>
            )}
          </Suspense>
        </CanvasErrorBoundary>
      </Canvas>

      {/* IntroSequence is a DOM component — must live outside the Canvas */}
      <IntroSequence introEnabled={introEnabled} />

      <LoadingOverlay onFadeComplete={() => setIntroEnabled(true)} />
      <HUDBar />
      {activeOverlay === 'about' ? <AboutOverlay /> : null}

      {activeOverlay === 'contact' ? <ContactOverlay /> : null}
      {activeOverlay === 'exploration' ? (
        <OverlayCard title="Exploration">
          <p>Exploration zone placeholder. More secrets are coming soon.</p>
        </OverlayCard>
      ) : null}
{nearbyObjectId === 'cv-stand' && !activeOverlay && introComplete ? <CVPopup /> : null}
    </div>
  )
}
