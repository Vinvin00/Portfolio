import { Billboard, Text } from '@react-three/drei'
import { Suspense, useState } from 'react'
import { useModelAvailable } from '../../hooks/useModelAvailable'
import useStore from '../../store/useStore'
import CanvasErrorBoundary from './CanvasErrorBoundary'
import SafeGltfModel from './SafeGltfModel'

function ObjectLabel({ label, isNear }) {
  const [underline, setUnderline] = useState(null)
  const labelColor = isNear ? '#ffffff' : '#c8d0e0'

  return (
    <>
      <Text
        fontSize={0.24}
        color={labelColor}
        anchorX="center"
        anchorY="middle"
        onSync={(troika) => {
          const bounds = troika.textRenderInfo?.blockBounds
          if (!bounds) return

          setUnderline({
            width: bounds[2] - bounds[0],
            y: bounds[1] - 0.02,
          })
        }}
      >
        {label}
      </Text>
      {isNear && underline ? (
        <mesh position={[0, underline.y, 0.001]}>
          <planeGeometry args={[underline.width, 0.025]} />
          <meshBasicMaterial color={labelColor} toneMapped={false} />
        </mesh>
      ) : null}
    </>
  )
}

function PlaceholderMesh({ config, isNear }) {
  const { placeholderGeometry, placeholderArgs, placeholderColor, position } = config
  const emissiveIntensity = isNear ? 0.22 : 0.05
  const yOffset = placeholderGeometry === 'box' ? 0.75 : 0.5
  const placeholderRotationY = config.faceCenter ? Math.atan2(-position.x, -position.z) : 0
  const placeholderRotation =
    placeholderGeometry === 'torus' ? [Math.PI / 2, 0, 0] : [0, placeholderRotationY, 0]

  return (
    <mesh
      position={[position.x, position.y + yOffset, position.z]}
      rotation={placeholderRotation}
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

  const modelPosition = [
    config.position.x + (config.modelOffsetX ?? 0),
    config.position.y + (config.modelOffsetY ?? 0),
    config.position.z + (config.modelOffsetZ ?? 0),
  ]
  const modelRotation =
    config.modelRotation ??
    (config.faceCenter
      ? [
          0,
          Math.atan2(-modelPosition[0], -modelPosition[2]) + (config.modelFacingOffsetY ?? 0),
          0,
        ]
      : undefined)

  return (
    <CanvasErrorBoundary fallback={placeholder}>
      <Suspense fallback={placeholder}>
        <SafeGltfModel
          url={config.model}
          fallback={placeholder}
          position={modelPosition}
          rotation={modelRotation}
          scale={config.modelScale ?? 1}
          ground={config.modelGround ?? false}
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
          config.position.x + (config.labelOffsetX ?? 0),
          config.position.y + (config.labelOffsetY ?? 0) + (config.placeholderGeometry === 'sphere' ? 1.1 : 1.8),
          config.position.z + (config.labelOffsetZ ?? 0),
        ]}
      >
        <ObjectLabel label={config.label} isNear={isNear} />
      </Billboard>
    </group>
  )
}
