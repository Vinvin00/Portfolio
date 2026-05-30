import { useGLTF } from '@react-three/drei'

export const MODELS = {
  island: '/models/island.glb',
  character: '/models/character.fbx',
  idleAnimation: '/models/Happy_Idle.fbx',
  walkAnimation: '/models/Walking.fbx',
  fallAnimation: '/models/Falling.fbx',
}

// Preload all GLTF assets at module level so they are cached before components mount.
useGLTF.preload(MODELS.island)
