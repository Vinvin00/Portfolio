import { useAnimations, useFBX } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useCallback, useEffect, useMemo, useRef } from 'react'
import { MODELS } from '../../config/models'

const CHARACTER_SCALE = 0.01
const IDLE_CLIP = 'Happy_Idle'
const WALK_CLIP = 'Walking'
const ANIMATION_FADE_DURATION = 0.25

function stripRootMotion(clip) {
  const cloned = clip.clone()
  cloned.tracks = cloned.tracks.filter((track) => {
    const name = track.name.toLowerCase()
    return !(name.includes('hips.position') || name.includes('root.position'))
  })
  return cloned
}

function FallingRig({ visible }) {
  const fallCharacter = useFBX(MODELS.fallAnimation)
  const { actions: fallActions } = useAnimations(fallCharacter.animations ?? [], fallCharacter)

  useEffect(() => {
    const first = Object.values(fallActions ?? {})[0]
    first?.reset().play()
  }, [fallActions])

  useFrame(() => {
    fallCharacter.position.set(0, 0, 0)
    fallCharacter.rotation.set(0, 0, 0)
  })

  return <primitive object={fallCharacter} scale={CHARACTER_SCALE} visible={visible} />
}

export default function CharacterFbx({ isMoving, introComplete, hasDedicatedFall }) {
  const gameplayCharacter = useFBX(MODELS.character)
  const idleSource = useFBX(MODELS.idleAnimation)
  const walkSource = useFBX(MODELS.walkAnimation)

  const gameplayClips = useMemo(() => {
    const clips = []

    if (idleSource.animations?.[0]) {
      const idle = stripRootMotion(idleSource.animations[0])
      idle.name = IDLE_CLIP
      clips.push(idle)
    }

    if (walkSource.animations?.[0]) {
      const walk = stripRootMotion(walkSource.animations[0])
      walk.name = WALK_CLIP
      clips.push(walk)
    }

    if (clips.length === 0 && gameplayCharacter.animations?.length) {
      return gameplayCharacter.animations.map((clip) => stripRootMotion(clip))
    }

    return clips
  }, [gameplayCharacter.animations, idleSource.animations, walkSource.animations])

  const { actions: gameplayActions } = useAnimations(gameplayClips, gameplayCharacter)
  const currentActionRef = useRef(null)

  const playAnimation = useCallback(
    (nextAnimation, fadeDuration = ANIMATION_FADE_DURATION) => {
      if (!gameplayActions || !nextAnimation) return
      if (currentActionRef.current === nextAnimation) return

      const incomingAction = gameplayActions[nextAnimation]
      if (!incomingAction) return

      const outgoingAction = currentActionRef.current
        ? gameplayActions[currentActionRef.current]
        : null

      outgoingAction?.fadeOut(fadeDuration)
      incomingAction.reset().fadeIn(fadeDuration).play()
      currentActionRef.current = nextAnimation
    },
    [gameplayActions],
  )

  useEffect(() => {
    if (gameplayActions && Object.keys(gameplayActions).length > 0) {
      console.log('[CharacterFbx] Gameplay clips:', Object.keys(gameplayActions))
    }
  }, [gameplayActions])

  useEffect(() => {
    if (!gameplayActions || Object.keys(gameplayActions).length === 0) return

    const fallback = Object.keys(gameplayActions)[0]
    const target = introComplete
      ? isMoving
        ? (gameplayActions[WALK_CLIP] ? WALK_CLIP : fallback)
        : (gameplayActions[IDLE_CLIP] ? IDLE_CLIP : fallback)
      : (gameplayActions[IDLE_CLIP] ? IDLE_CLIP : fallback)

    if (!target) return
    playAnimation(target, ANIMATION_FADE_DURATION)
  }, [gameplayActions, introComplete, isMoving, playAnimation])

  useFrame(() => {
    gameplayCharacter.position.set(0, 0, 0)
    gameplayCharacter.rotation.set(0, 0, 0)
  })

  const showFallModel = !introComplete && hasDedicatedFall
  const showGameplayModel = introComplete || !hasDedicatedFall

  return (
    <group>
      {hasDedicatedFall ? <FallingRig visible={showFallModel} /> : null}
      <primitive object={gameplayCharacter} scale={CHARACTER_SCALE} visible={showGameplayModel} />
    </group>
  )
}
