import { useGLTF } from '@react-three/drei'
import { useMemo } from 'react'
import * as THREE from 'three'
import { useModelAvailable } from '../../hooks/useModelAvailable'

function normalizeSceneToOrigin(object) {
  object.updateMatrixWorld(true)
  const box = new THREE.Box3().setFromObject(object)
  if (box.isEmpty()) return

  const center = box.getCenter(new THREE.Vector3())
  object.position.set(-center.x, -box.min.y, -center.z)
}

function GltfMesh({ url, position = [0, 0, 0], scale = 1, rotation, ground = false }) {
  const { scene } = useGLTF(url)

  const clone = useMemo(() => {
    const next = scene.clone(true)
    if (ground) normalizeSceneToOrigin(next)
    return next
  }, [scene, ground])

  if (ground) {
    return (
      <group position={position} rotation={rotation}>
        <primitive object={clone} scale={scale} castShadow receiveShadow />
      </group>
    )
  }

  return (
    <primitive
      object={clone}
      position={position}
      scale={scale}
      rotation={rotation}
      castShadow
      receiveShadow
    />
  )
}

export default function SafeGltfModel({ url, fallback, ...meshProps }) {
  const available = useModelAvailable(url)

  if (available === null) return fallback
  if (!available) return fallback

  return <GltfMesh url={url} {...meshProps} />
}
