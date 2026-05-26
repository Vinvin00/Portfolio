import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { gsap } from 'gsap'
import Character from './components/scene/Character'
import MainIsland from './components/scene/MainIsland'
import ProjectsIsland from './components/scene/ProjectsIsland'
import IslandObjects from './components/scene/IslandObjects'
import IntroSequence from './components/intro/IntroSequence'
import OverlayCard from './components/ui/OverlayCard'
import CVPopup from './components/ui/CVPopup'
import ContactOverlay from './components/ui/ContactOverlay'
import ProjectCard from './components/ui/ProjectCard'
import useStore from './store/useStore'

const DARK_SCENE = '#0d1117'
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
        args={[backgroundColor, isDarkMode ? 0.07 : 0.05]}
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
  const currentIsland = useStore((state) => state.currentIsland)
  const activeOverlay = useStore((state) => state.activeOverlay)
  const isDarkMode = useStore((state) => state.isDarkMode)

  return (
    <div className={`relative h-screen w-screen overflow-hidden ${isDarkMode ? 'dark' : ''}`}>
      <div className="pointer-events-none fixed left-1/2 top-5 z-30 -translate-x-1/2 text-2xl tracking-widest text-white/85 drop-shadow-lg md:text-3xl" style={{ fontFamily: 'Cinzel, serif' }}>
        Vincenzo
      </div>

      <Canvas
        className="h-screen w-screen"
        shadows
        camera={{
          fov: 48,
          near: 0.1,
          far: 120,
          position: [10, 8, 10],
        }}
      >
        <Suspense fallback={<SceneFallback />}>
          <SceneEnvironment isDarkMode={isDarkMode} currentIsland={currentIsland} />

          <IntroSequence />
          <Character />

          {currentIsland === 'main' ? (
            <>
              <MainIsland />
              <IslandObjects />
            </>
          ) : (
            <ProjectsIsland />
          )}
        </Suspense>
      </Canvas>

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
      {activeOverlay === 'project-weather-spotify' ? <ProjectCard /> : null}
      {activeOverlay === 'cv' ? <CVPopup /> : null}
    </div>
  )
}
