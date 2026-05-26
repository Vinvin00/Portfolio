export default function MainIsland() {
  return (
    <group>
      <mesh position={[0, 0.25, 0]} receiveShadow>
        <cylinderGeometry args={[8, 8, 0.5, 64]} />
        <meshStandardMaterial color="#2f4f3a" />
      </mesh>

      <mesh position={[0, -2, 0]} receiveShadow>
        <cylinderGeometry args={[1, 1.25, 4, 32]} />
        <meshStandardMaterial color="#2a2f38" />
      </mesh>
    </group>
  )
}
