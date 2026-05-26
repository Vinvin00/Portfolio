import { Billboard, Text } from '@react-three/drei'
import { useEffect, useMemo } from 'react'
import { useProximity } from '../../hooks/useProximity'
import useStore from '../../store/useStore'

const OBJECTS = [
  {
    id: 'about-door',
    label: 'About',
    position: { x: 3, y: 0.75, z: 0 },
    geometry: 'box',
    args: [0.8, 1.5, 0.5],
    color: '#4169a8',
  },
  {
    id: 'projects-door',
    label: 'Projects',
    position: { x: -3, y: 0.75, z: 0 },
    geometry: 'box',
    args: [0.8, 1.5, 0.5],
    color: '#2f7a52',
  },
  {
    id: 'mailbox',
    label: 'Contact',
    position: { x: 0, y: 0.5, z: 3 },
    geometry: 'box',
    args: [0.7, 0.8, 0.7],
    color: '#a24545',
  },
  {
    id: 'cv-stand',
    label: 'CV',
    position: { x: 0, y: 0.5, z: -3 },
    geometry: 'box',
    args: [0.4, 1, 0.6],
    color: '#8a7d35',
  },
  {
    id: 'campfire',
    label: 'Campfire',
    position: { x: 5, y: 0.5, z: 2 },
    geometry: 'sphere',
    args: [0.45, 24, 24],
    color: '#ad6536',
  },
  {
    id: 'exploration-door',
    label: 'Explore',
    position: { x: 4, y: 0.75, z: -2 },
    geometry: 'box',
    args: [0.8, 1.5, 0.5],
    color: '#5a4d9f',
  },
]

export default function IslandObjects() {
  const setActiveOverlay = useStore((state) => state.setActiveOverlay)
  const activeOverlay = useStore((state) => state.activeOverlay)
  const setCurrentIsland = useStore((state) => state.setCurrentIsland)
  const isDarkMode = useStore((state) => state.isDarkMode)
  const setIsDarkMode = useStore((state) => state.setIsDarkMode)

  const proximityObjects = useMemo(
    () => OBJECTS.map((object) => ({ id: object.id, position: object.position })),
    [],
  )

  const nearObjectId = useProximity(proximityObjects, 2)

  useEffect(() => {
    if (nearObjectId === 'about-door') {
      setActiveOverlay('about')
      return
    }

    if (nearObjectId === 'mailbox') {
      setActiveOverlay('contact')
      return
    }

    if (nearObjectId === 'cv-stand') {
      setActiveOverlay('cv')
      return
    }

    if (nearObjectId === 'exploration-door') {
      setActiveOverlay('exploration')
      return
    }

    if (nearObjectId === 'projects-door') {
      setActiveOverlay(null)
      setCurrentIsland('projects')
      return
    }

    if (activeOverlay === 'about' || activeOverlay === 'contact' || activeOverlay === 'cv' || activeOverlay === 'exploration') {
      setActiveOverlay(null)
    }
  }, [activeOverlay, nearObjectId, setActiveOverlay, setCurrentIsland])

  useEffect(() => {
    if (nearObjectId !== 'campfire') return undefined

    const handleToggle = (event) => {
      if (event.code !== 'KeyE') return
      setIsDarkMode(!isDarkMode)
    }

    window.addEventListener('keydown', handleToggle)

    return () => {
      window.removeEventListener('keydown', handleToggle)
    }
  }, [isDarkMode, nearObjectId, setIsDarkMode])

  return (
    <group>
      {OBJECTS.map((object) => (
        <group key={object.id} position={[object.position.x, object.position.y, object.position.z]}>
          <mesh castShadow receiveShadow>
            {object.geometry === 'box' ? (
              <boxGeometry args={object.args} />
            ) : (
              <sphereGeometry args={object.args} />
            )}
            <meshStandardMaterial
              color={object.color}
              emissive={object.color}
              emissiveIntensity={nearObjectId === object.id ? 0.18 : 0.05}
            />
          </mesh>

          <Billboard position={[0, 1.1, 0]}>
            <Text fontSize={0.24} color="#f3f6ff" anchorX="center" anchorY="middle">
              {object.label}
            </Text>
          </Billboard>
        </group>
      ))}

      {nearObjectId === 'campfire' ? (
        <Billboard position={[5, 1.6, 2]}>
          <Text fontSize={0.22} color="#f3f6ff" anchorX="center" anchorY="middle">
            Press E to toggle light
          </Text>
        </Billboard>
      ) : null}
    </group>
  )
}
