import { useFrame, useThree } from '@react-three/fiber'
import { gsap } from 'gsap'
import { useLayoutEffect, useRef } from 'react'
import * as THREE from 'three'
import useStore from '../../store/useStore'
import { getProjectsViewTargets, PROJECTS_VIEW } from '../../utils/projectsView'

const CAMERA_OFFSET = { x: 10, y: 8, z: 10 }
const RETURN_DURATION = 0.85

function getIsometricCameraTarget() {
  const { playerPosition: pos } = useStore.getState()
  return {
    position: new THREE.Vector3(
      pos.x + CAMERA_OFFSET.x,
      pos.y + CAMERA_OFFSET.y,
      pos.z + CAMERA_OFFSET.z,
    ),
    lookAt: new THREE.Vector3(pos.x, pos.y, pos.z),
  }
}

function applyProjectsCamera(camera, lookAtRef) {
  const { targetCamPos, lookAtTarget } = getProjectsViewTargets()
  camera.position.copy(targetCamPos)
  camera.up.set(0, 1, 0)
  camera.lookAt(lookAtTarget)
  lookAtRef.current.copy(lookAtTarget)
}

export default function ProjectsCameraController() {
  const { camera } = useThree()
  const isProjectsScreenOpen = useStore((s) => s.isProjectsScreenOpen)
  const tweenRef = useRef(null)
  const lookAtRef = useRef(new THREE.Vector3())
  const hasOpenedRef = useRef(false)
  const isTweeningRef = useRef(false)

  useLayoutEffect(() => {
    tweenRef.current?.kill()

    if (isProjectsScreenOpen) {
      hasOpenedRef.current = true
      isTweeningRef.current = true

      const { targetCamPos, lookAtTarget } = getProjectsViewTargets()
      lookAtRef.current.copy(lookAtTarget)

      const lookDir = new THREE.Vector3()
      camera.getWorldDirection(lookDir)
      const lookStart = camera.position.clone().addScaledVector(lookDir, 10)
      const lookBlend = { t: 0 }

      const pos = {
        x: camera.position.x,
        y: camera.position.y,
        z: camera.position.z,
      }

      tweenRef.current = gsap.to(pos, {
        x: targetCamPos.x,
        y: targetCamPos.y,
        z: targetCamPos.z,
        duration: PROJECTS_VIEW.tweenDuration,
        ease: 'power3.inOut',
        onStart: () => {
          gsap.to(lookBlend, {
            t: 1,
            duration: PROJECTS_VIEW.tweenDuration,
            ease: 'power3.inOut',
          })
        },
        onUpdate: () => {
          camera.position.set(pos.x, pos.y, pos.z)
          const aim = new THREE.Vector3().copy(lookStart).lerp(lookAtTarget, lookBlend.t)
          camera.up.set(0, 1, 0)
          camera.lookAt(aim)
        },
        onComplete: () => {
          applyProjectsCamera(camera, lookAtRef)
          isTweeningRef.current = false
        },
      })
    } else if (hasOpenedRef.current) {
      isTweeningRef.current = true
      const { position: targetPos, lookAt: targetLook } = getIsometricCameraTarget()
      const lookStart = lookAtRef.current.clone()
      const lookBlend = { t: 0 }

      const pos = {
        x: camera.position.x,
        y: camera.position.y,
        z: camera.position.z,
      }

      tweenRef.current = gsap.to(pos, {
        x: targetPos.x,
        y: targetPos.y,
        z: targetPos.z,
        duration: RETURN_DURATION,
        ease: 'power2.inOut',
        onStart: () => {
          gsap.to(lookBlend, {
            t: 1,
            duration: RETURN_DURATION,
            ease: 'power2.inOut',
          })
        },
        onUpdate: () => {
          camera.position.set(pos.x, pos.y, pos.z)
          const aim = new THREE.Vector3().copy(lookStart).lerp(targetLook, lookBlend.t)
          camera.up.set(0, 1, 0)
          camera.lookAt(aim)
        },
        onComplete: () => {
          camera.position.copy(targetPos)
          camera.up.set(0, 1, 0)
          camera.lookAt(targetLook)
          isTweeningRef.current = false
        },
      })
    }

    return () => {
      tweenRef.current?.kill()
      isTweeningRef.current = false
    }
  }, [camera, isProjectsScreenOpen])

  // Live retune while projects view is open (after intro tween)
  useFrame(() => {
    if (!isProjectsScreenOpen || isTweeningRef.current) return
    applyProjectsCamera(camera, lookAtRef)
  })

  useLayoutEffect(
    () => () => {
      tweenRef.current?.kill()
    },
    [],
  )

  return null
}

export function isProjectsCameraActive() {
  return useStore.getState().isProjectsScreenOpen
}
