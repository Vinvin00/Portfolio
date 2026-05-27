import { Billboard, Text } from '@react-three/drei'
import { Suspense } from 'react'
import { useModelAvailable } from '../../hooks/useModelAvailable'
import useStore from '../../store/useStore'
import CanvasErrorBoundary from './CanvasErrorBoundary'
import SafeGltfModel from './SafeGltfModel'

function PlaceholderMesh({ config, isNear }) {
  const { placeholderGeometry, placeholderArgs, placeholderColor, position } = config
  const emissiveIntensity = isNear ? 0.22 : 0.05
  const yOffset = placeholderGeometry === 'box' ? 0.75 : 0.5

  return (
    <mesh
      position={[position.x, position.y + yOffset, position.z]}
      rotation={placeholderGeometry === 'torus' ? [Math.PI / 2, 0, 0] : [0, 0, 0]}
      castShadow
      receiveShadow
    >
      {placeholderGeometry === 'box' && <boxGeometry args={placeholderArgs} />}
      {placeholderGeometry === 'sphere' && <sphereGeometry args={placeholderArgs} />}
      {placeholderGeometry === 'torus' && <torusGeometry args={[0.7, 0.16, 20, 60]} />}
      <meshStandardMaterial
        color={placeholderColor}
        emissive={placeholderColor}
        emissiveIntensity={emissiveIntensity}
      />
    </mesh>
  )
}

function OptionalModel({ config, placeholder }) {
  const available = useModelAvailable(config.model)

  if (!config.model || available === false) return placeholder
  if (available === null) return placeholder

  return (
    <CanvasErrorBoundary fallback={placeholder}>
      <Suspense fallback={placeholder}>
        <SafeGltfModel
          url={config.model}
          fallback={placeholder}
          position={[config.position.x, config.position.y, config.position.z]}
        />
      </Suspense>
    </CanvasErrorBoundary>
  )
}

export default function SceneObject({ config }) {
  const nearbyObjectId = useStore((state) => state.nearbyObjectId)
  const isNear = nearbyObjectId === config.id
  const placeholder = <PlaceholderMesh config={config} isNear={isNear} />

  return (
    <group>
      <OptionalModel config={config} placeholder={placeholder} />

      <Billboard
        position={[
          config.position.x,
          config.position.y + (config.placeholderGeometry === 'sphere' ? 1.1 : 1.8),
          config.position.z,
        ]}
      >
        <Text
          fontSize={0.24}
          color={isNear ? '#ffffff' : '#c8d0e0'}
          anchorX="center"
          anchorY="middle"
        >
          {config.label}
        </Text>
      </Billboard>
    </group>
  )
}
