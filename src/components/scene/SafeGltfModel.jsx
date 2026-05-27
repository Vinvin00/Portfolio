import { useGLTF } from '@react-three/drei'
import { useModelAvailable } from '../../hooks/useModelAvailable'

function GltfMesh({ url, position = [0, 0, 0], scale = 1, rotation }) {
  const { scene } = useGLTF(url)

  return (
    <primitive
      object={scene.clone()}
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
