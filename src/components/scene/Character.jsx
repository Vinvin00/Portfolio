import { useFrame, useThree } from '@react-three/fiber'
import { useAnimations, useGLTF } from '@react-three/drei'
import { gsap } from 'gsap'
import { Suspense, useCallback, useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { getProjectsViewTargets } from '../../utils/projectsView'
import { MODELS } from '../../config/models'
import { useCharacterControls } from '../../hooks/useCharacterControls'
import useStore from '../../store/useStore'
import CanvasErrorBoundary from './CanvasErrorBoundary'
import CharacterFbx, { FallingRig } from './CharacterFbx'

const GLB_CHARACTER_URL = '/models/character.glb'
const CHARACTER_SCALE = 0.01
const CHARACTER_Y_OFFSET = 0
const IDLE_CLIP = 'Happy_Idle'
const WALK_CLIP = 'Walking'
const ANIMATION_FADE_DURATION = 0.25

const CAMERA_OFFSET = { x: 10, y: 8, z: 10 }
const SPEED = 3
const ISLAND_RADIUS = 8 // Must match the cylinder radius in MainIsland.jsx.
const EDGE_DRIFT_DURATION = 0.35
const EDGE_DRIFT_SPEED = 1.5
const VOID_FALL_TARGET_Y = -18
const VOID_FALL_DURATION = 1.4
const RESPAWN_HEIGHT_Y = 16
const REENTRY_APPROACH_Y = 1.2
const REENTRY_FALL_DURATION = 1.1
const REENTRY_BOUNCE_DURATION = 0.45
const LANDED_Y = 1
const FALL_CAMERA_LOOK_AT_Y = 1

useGLTF.preload(GLB_CHARACTER_URL)

function CharacterPlaceholder() {
  return (
    <mesh castShadow receiveShadow position={[0, 0.5, 0]}>
      <boxGeometry args={[0.5, 1, 0.5]} />
      <meshStandardMaterial color="#d3d9e7" roughness={0.55} metalness={0.1} />
    </mesh>
  )
}

function GlbCharacterModel({ groupRef, isMoving, introComplete }) {
  const currentAnimRef = useRef(null)
  const needsIdleOnLandRef = useRef(false)
  const { scene, animations } = useGLTF(GLB_CHARACTER_URL)
  const { actions } = useAnimations(animations, groupRef)
  const actionCount = actions ? Object.keys(actions).length : 0

  const playAnimation = useCallback(
    (nextAnimation, fadeDuration = ANIMATION_FADE_DURATION) => {
      if (!actions || !nextAnimation) return
      if (currentAnimRef.current === nextAnimation) return

      const incomingAction = actions[nextAnimation]
      if (!incomingAction) return

      const outgoingAction = currentAnimRef.current ? actions[currentAnimRef.current] : null
      outgoingAction?.fadeOut(fadeDuration)

      incomingAction.reset().fadeIn(fadeDuration).play()
      currentAnimRef.current = nextAnimation
    },
    [actions],
  )

  useEffect(() => {
    if (!actions) return
    console.log('[Character] Available animation clips:', Object.keys(actions))
  }, [actions])

  useEffect(() => {
    if (!introComplete) {
      currentAnimRef.current = null
      needsIdleOnLandRef.current = false
      return
    }
    needsIdleOnLandRef.current = true
  }, [introComplete])

  useEffect(() => {
    if (!introComplete) return
    if (!actions || actionCount === 0) return

    const targetClip = isMoving ? WALK_CLIP : IDLE_CLIP
    const resolvedClip = actions[targetClip]
      ? targetClip
      : actions[IDLE_CLIP]
        ? IDLE_CLIP
        : Object.keys(actions)[0]

    if (!resolvedClip) return

    console.log('[Character] animation transition:', currentAnimRef.current, '→', resolvedClip, '(introComplete:', introComplete, 'isMoving:', isMoving, ')')
    playAnimation(resolvedClip, ANIMATION_FADE_DURATION)
    if (!isMoving && resolvedClip === IDLE_CLIP) {
      needsIdleOnLandRef.current = false
    }
  }, [actionCount, actions, introComplete, isMoving, playAnimation])

  useFrame(() => {
    if (!needsIdleOnLandRef.current || !introComplete || isMoving) return
    if (!actions?.[IDLE_CLIP]) return

    currentAnimRef.current = null
    playAnimation(IDLE_CLIP, ANIMATION_FADE_DURATION)
    needsIdleOnLandRef.current = false
  })

  return (
    <>
      {!introComplete ? <FallingRig visible /> : null}
      <primitive object={scene} scale={CHARACTER_SCALE} visible={introComplete} />
    </>
  )
}

export default function Character() {
  const groupRef = useRef(null)
  const firstIslandRender = useRef(true)
  const fallLoopTimelineRef = useRef(null)
  const isFallingRef = useRef(false)
  const isZoomedRef = useRef(false)
  const projectsCameraTweenRef = useRef(null)
  const [isFallingVisual, setIsFallingVisual] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)

  const { camera } = useThree()

  const currentIsland = useStore((s) => s.currentIsland)
  const introComplete = useStore((s) => s.introComplete)
  const playerPosition = useStore((s) => s.playerPosition)
  const setPlayerPosition = useStore((s) => s.setPlayerPosition)
  const isProjectsScreenOpen = useStore((s) => s.isProjectsScreenOpen)

  const canMove = introComplete && !isTransitioning && !isFallingVisual && !isProjectsScreenOpen
  const direction = useCharacterControls(canMove)
  const isMoving = direction.x !== 0 || direction.z !== 0

  useEffect(() => {
    const getFollowTarget = () => {
      const { playerPosition: pos } = useStore.getState()
      return {
        x: pos.x + CAMERA_OFFSET.x,
        y: pos.y + CAMERA_OFFSET.y,
        z: pos.z + CAMERA_OFFSET.z,
      }
    }

    projectsCameraTweenRef.current?.kill()

    if (isProjectsScreenOpen) {
      isZoomedRef.current = true

      const p = useStore.getState().playerPosition
      const {
        lookAtTarget,
        lookAtAtOrbit,
        targetCamPos,
        orbitCamPos,
        hasVerticalMove,
      } = getProjectsViewTargets(p, CAMERA_OFFSET)

      const lookDir = new THREE.Vector3()
      camera.getWorldDirection(lookDir)
      const lookAtCurrent = camera.position.clone().addScaledVector(lookDir, 10)
      const lookAtFrom = lookAtAtOrbit.clone()
      const lookAtTo = lookAtTarget.clone()
      const vertical = { t: 0 }

      const applyProjectsCamera = (camPos, lookAt) => {
        camera.position.copy(camPos)
        camera.up.set(0, 1, 0)
        camera.lookAt(lookAt)
      }

      const timeline = gsap.timeline({
        onComplete: () => applyProjectsCamera(targetCamPos, lookAtTarget),
      })

      timeline.to(camera.position, {
        x: orbitCamPos.x,
        y: orbitCamPos.y,
        z: orbitCamPos.z,
        duration: 0.9,
        ease: 'power2.inOut',
        onUpdate: () => {
          lookAtCurrent.lerp(lookAtAtOrbit, 0.38)
          camera.up.set(0, 1, 0)
          camera.lookAt(lookAtCurrent)
        },
        onComplete: () => applyProjectsCamera(orbitCamPos, lookAtAtOrbit),
      })

      if (hasVerticalMove) {
        timeline.to(vertical, {
          t: 1,
          duration: 0.35,
          ease: 'power2.inOut',
          onUpdate: () => {
            const { t } = vertical
            camera.position.set(
              orbitCamPos.x,
              THREE.MathUtils.lerp(orbitCamPos.y, targetCamPos.y, t),
              orbitCamPos.z,
            )
            lookAtCurrent.copy(lookAtFrom).lerp(lookAtTo, t)
            camera.up.set(0, 1, 0)
            camera.lookAt(lookAtCurrent)
          },
        })
      }

      projectsCameraTweenRef.current = timeline

      return () => {
        projectsCameraTweenRef.current?.kill()
      }
    }

    const followTarget = getFollowTarget()
    const lookAtTarget = new THREE.Vector3()

    projectsCameraTweenRef.current = gsap.to(camera.position, {
      x: followTarget.x,
      y: followTarget.y,
      z: followTarget.z,
      duration: 0.7,
      ease: 'power2.inOut',
      onUpdate: () => {
        const p = useStore.getState().playerPosition
        lookAtTarget.set(p.x, p.y, p.z)
        camera.lookAt(lookAtTarget)
      },
      onComplete: () => {
        isZoomedRef.current = false
      },
    })

    return () => {
      projectsCameraTweenRef.current?.kill()
    }
  }, [camera, isProjectsScreenOpen])

  const triggerFallLoop = (fallStartPosition, moveDirection) => {
    if (isFallingRef.current || isTransitioning || !introComplete) return

    isFallingRef.current = true
    setIsFallingVisual(true)
    // TODO: trigger fall animation clip
    fallLoopTimelineRef.current?.kill()

    const driftDistance = EDGE_DRIFT_SPEED * EDGE_DRIFT_DURATION
    const fallState = {
      x: fallStartPosition.x,
      y: fallStartPosition.y,
      z: fallStartPosition.z,
    }

    const driftTargetX = fallStartPosition.x + moveDirection.x * driftDistance
    const driftTargetZ = fallStartPosition.z + moveDirection.z * driftDistance

    fallLoopTimelineRef.current = gsap.timeline({
      onComplete: () => {
        setPlayerPosition({ x: 0, y: LANDED_Y, z: 0 })
        isFallingRef.current = false
        setIsFallingVisual(false)
      },
    })

    fallLoopTimelineRef.current
      .to(
        fallState,
        {
          x: driftTargetX,
          z: driftTargetZ,
          duration: EDGE_DRIFT_DURATION,
          ease: 'power1.in',
          onUpdate: () => {
            setPlayerPosition({ x: fallState.x, y: fallState.y, z: fallState.z })
          },
        },
        0,
      )
      .to(
        fallState,
        {
          y: VOID_FALL_TARGET_Y,
          duration: VOID_FALL_DURATION,
          ease: 'power3.in',
          onUpdate: () => {
            setPlayerPosition({ x: fallState.x, y: fallState.y, z: fallState.z })
          },
        },
        0,
      )
      .add(() => {
        fallState.x = 0
        fallState.y = RESPAWN_HEIGHT_Y
        fallState.z = 0
        setPlayerPosition({ x: 0, y: RESPAWN_HEIGHT_Y, z: 0 })
      })
      .to(fallState, {
        y: REENTRY_APPROACH_Y,
        duration: REENTRY_FALL_DURATION,
        ease: 'power2.in',
        onUpdate: () => {
          setPlayerPosition({ x: 0, y: fallState.y, z: 0 })
        },
      })
      .to(fallState, {
        y: LANDED_Y,
        duration: REENTRY_BOUNCE_DURATION,
        ease: 'elastic.out(1, 0.28)',
        onUpdate: () => {
          setPlayerPosition({ x: 0, y: fallState.y, z: 0 })
        },
      })
  }

  useEffect(() => {
    if (!introComplete) return undefined
    if (firstIslandRender.current) {
      firstIslandRender.current = false
      return undefined
    }

    setIsTransitioning(true)
    const fall = { y: 8 }
    setPlayerPosition({ x: 0, y: 8, z: 0 })

    const tl = gsap.timeline({
      onComplete: () => {
        setPlayerPosition({ x: 0, y: 1 + CHARACTER_Y_OFFSET, z: 0 })
        setIsTransitioning(false)
      },
    })

    tl.to(fall, {
      y: 1.15,
      duration: 0.5,
      ease: 'power2.in',
      onUpdate: () => setPlayerPosition({ x: 0, y: fall.y, z: 0 }),
    }).to(fall, {
      y: 1,
      duration: 0.2,
      ease: 'elastic.out(1, 0.3)',
      onUpdate: () => setPlayerPosition({ x: 0, y: fall.y, z: 0 }),
    })

    return () => tl.kill()
  }, [currentIsland, introComplete, setPlayerPosition])

  useFrame((_, delta) => {
    if (canMove && isMoving && !isFallingRef.current) {
      // Move relative to camera yaw (ignore pitch) so W is "up" on screen.
      const forward = new THREE.Vector3()
      camera.getWorldDirection(forward)
      forward.y = 0
      if (forward.lengthSq() === 0) {
        forward.set(0, 0, -1)
      } else {
        forward.normalize()
      }

      const right = new THREE.Vector3().crossVectors(forward, new THREE.Vector3(0, 1, 0)).normalize()

      const move = new THREE.Vector3()
        .addScaledVector(right, direction.x)
        .addScaledVector(forward, -direction.z)

      if (move.lengthSq() > 0) move.normalize()

      const nextPosition = {
        x: playerPosition.x + move.x * SPEED * delta,
        y: playerPosition.y,
        z: playerPosition.z + move.z * SPEED * delta,
      }
      setPlayerPosition(nextPosition)

      const distFromCenter = Math.sqrt(nextPosition.x ** 2 + nextPosition.z ** 2)
      if (distFromCenter > ISLAND_RADIUS) {
        triggerFallLoop(nextPosition, move)
      }

      if (groupRef.current) {
        const angle = Math.atan2(move.x, move.z)
        groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, angle, 0.15)
      }
    }

    if (groupRef.current) {
      groupRef.current.position.set(
        playerPosition.x,
        playerPosition.y + CHARACTER_Y_OFFSET,
        playerPosition.z,
      )
    }

    if (!isFallingRef.current && !isZoomedRef.current) {
      const target = new THREE.Vector3(
        playerPosition.x + CAMERA_OFFSET.x,
        playerPosition.y + CAMERA_OFFSET.y,
        playerPosition.z + CAMERA_OFFSET.z,
      )
      camera.position.lerp(target, 0.08)
      camera.lookAt(playerPosition.x, playerPosition.y, playerPosition.z)
    } else if (isFallingRef.current && !isZoomedRef.current) {
      const lockedTarget = new THREE.Vector3(CAMERA_OFFSET.x, CAMERA_OFFSET.y, CAMERA_OFFSET.z)
      camera.position.lerp(lockedTarget, 0.12)
      camera.lookAt(0, FALL_CAMERA_LOOK_AT_Y, 0)
    }

    camera.updateProjectionMatrix()
  })

  useEffect(
    () => () => {
      fallLoopTimelineRef.current?.kill()
      projectsCameraTweenRef.current?.kill()
    },
    [],
  )

  return (
    <group ref={groupRef} castShadow visible={!isProjectsScreenOpen}>
      <CanvasErrorBoundary
        fallback={
          <CanvasErrorBoundary fallback={<CharacterPlaceholder />}>
            <Suspense fallback={<CharacterPlaceholder />}>
              <CharacterFbx
                isMoving={isMoving}
                introComplete={introComplete && !isFallingVisual}
              />
            </Suspense>
          </CanvasErrorBoundary>
        }
      >
        <Suspense
          fallback={
            <CanvasErrorBoundary fallback={<CharacterPlaceholder />}>
              <Suspense fallback={<CharacterPlaceholder />}>
                <CharacterFbx
                  isMoving={isMoving}
                  introComplete={introComplete && !isFallingVisual}
                />
              </Suspense>
            </CanvasErrorBoundary>
          }
        >
          <GlbCharacterModel
            groupRef={groupRef}
            isMoving={isMoving}
            introComplete={introComplete && !isFallingVisual}
          />
        </Suspense>
      </CanvasErrorBoundary>
    </group>
  )
}
