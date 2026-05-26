import { Billboard, Text } from '@react-three/drei'
import { useEffect, useMemo } from 'react'
import { useProximity } from '../../hooks/useProximity'
import useStore from '../../store/useStore'

const PROJECT_OBJECTS = [
  { id: 'weather-spotify-door', position: { x: 2, y: 0.75, z: 0 } },
  { id: 'back-portal', position: { x: -4, y: 0.5, z: 0 } },
]

export default function ProjectsIsland() {
  const setActiveOverlay = useStore((state) => state.setActiveOverlay)
  const activeOverlay = useStore((state) => state.activeOverlay)
  const setCurrentIsland = useStore((state) => state.setCurrentIsland)

  const nearObjectId = useProximity(useMemo(() => PROJECT_OBJECTS, []), 2)

  useEffect(() => {
    if (nearObjectId === 'weather-spotify-door') {
      setActiveOverlay('project-weather-spotify')
      return
    }

    if (activeOverlay === 'project-weather-spotify') {
      setActiveOverlay(null)
    }
  }, [activeOverlay, nearObjectId, setActiveOverlay])

  useEffect(() => {
    if (nearObjectId !== 'back-portal') return undefined

    const handleBack = (event) => {
      if (event.code !== 'KeyE') return
      setActiveOverlay(null)
      setCurrentIsland('main')
    }

    window.addEventListener('keydown', handleBack)

    return () => {
      window.removeEventListener('keydown', handleBack)
    }
  }, [nearObjectId, setActiveOverlay, setCurrentIsland])

  return (
    <group>
      <mesh position={[0, 0.25, 0]} receiveShadow>
        <cylinderGeometry args={[6, 6, 0.5, 64]} />
        <meshStandardMaterial color="#3a5647" />
      </mesh>

      <mesh position={[0, -2, 0]} receiveShadow>
        <cylinderGeometry args={[1, 1.1, 4, 32]} />
        <meshStandardMaterial color="#2a2f38" />
      </mesh>

      <group position={[2, 0.75, 0]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[0.9, 1.5, 0.6]} />
          <meshStandardMaterial color="#2f7981" emissive="#2f7981" emissiveIntensity={0.08} />
        </mesh>
        <Billboard position={[0, 1.1, 0]}>
          <Text fontSize={0.22} color="#f3f6ff" anchorX="center" anchorY="middle">
            Weather Spotify
          </Text>
        </Billboard>
      </group>

      <group position={[-4, 0.5, 0]}>
        <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
          <torusGeometry args={[0.7, 0.16, 20, 60]} />
          <meshStandardMaterial
            color="#4b88ff"
            emissive="#4b88ff"
            emissiveIntensity={nearObjectId === 'back-portal' ? 0.65 : 0.35}
          />
        </mesh>

        <Billboard position={[0, 1, 0]}>
          <Text fontSize={0.2} color="#f3f6ff" anchorX="center" anchorY="middle">
            Press E to return
          </Text>
        </Billboard>
      </group>
    </group>
  )
}
