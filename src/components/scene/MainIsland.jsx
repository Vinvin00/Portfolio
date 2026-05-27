import { MODELS } from '../../config/models'
import SafeGltfModel from './SafeGltfModel'

const ISLAND_SCALE = 3.2
export const MAIN_ISLAND_RADIUS = 7

function ProceduralIsland() {
  return (
    <group>
      <mesh position={[0, -0.25, 0]} receiveShadow>
        <cylinderGeometry args={[MAIN_ISLAND_RADIUS, MAIN_ISLAND_RADIUS, 0.5, 64]} />
        <meshStandardMaterial color="#2f4f3a" />
      </mesh>
      <mesh position={[0, -2, 0]} receiveShadow>
        <cylinderGeometry args={[1, 1.25, 4, 32]} />
        <meshStandardMaterial color="#2a2f38" />
      </mesh>
    </group>
  )
}

export default function MainIsland() {
  return (
    <group position={[0, -2.2, 0]}>
      <SafeGltfModel url={MODELS.island} fallback={<ProceduralIsland />} scale={ISLAND_SCALE} />
    </group>
  )
}
