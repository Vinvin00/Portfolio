import { useFrame, useThree } from '@react-three/fiber'
import { gsap } from 'gsap'
import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { getMonitorFacingNormal, getMonitorWorldCenter } from '../../utils/monitorScreen'
import { projectsMonitorMeshRef } from '../../store/monitorRef'
import useStore from '../../store/useStore'

const MONITOR_CAM_OFFSET = 2.5
const MONITOR_CAM_TWEEN_DURATION = 1.4
const MONITOR_CAM_TWEEN_EASE = 'power3.inOut'
const MONITOR_CAM_RETURN_DURATION = 1.1
const MONITOR_CAM_RETURN_EASE = 'power3.inOut'
const CAMERA_OFFSET = { x: 10, y: 8, z: 10 }

export default function ProjectsMonitorCamera() {
  const { camera } = useThree()
  const currentIsland = useStore((s) => s.currentIsland)
  const sceneReady = useStore((s) => s.sceneReady)
  const monitorScreenReady = useStore((s) => s.monitorScreenReady)
  const monitorFocused = useStore((s) => s.monitorFocused)
  const setMonitorFocused = useStore((s) => s.setMonitorFocused)
  const setMonitorCameraLocked = useStore((s) => s.setMonitorCameraLocked)
  const setMonitorIframeVisible = useStore((s) => s.setMonitorIframeVisible)

  const tweenRef = useRef(null)
  const hasEnteredRef = useRef(false)
  const lookTargetRef = useRef(new THREE.Vector3())
  const focusTweenRef = useRef({ t: 0 })

  const center = useRef(new THREE.Vector3())
  const facing = useRef(new THREE.Vector3())
  const targetCamPos = useRef(new THREE.Vector3())

  const runReturnTween = () => {
    tweenRef.current?.kill()
    setMonitorIframeVisible(false)
    setMonitorFocused(false)
    setMonitorCameraLocked(true)

    const lookAtCurrent = lookTargetRef.current.clone()
    const { playerPosition: pos } = useStore.getState()
    const returnCam = new THREE.Vector3(
      pos.x + CAMERA_OFFSET.x,
      pos.y + CAMERA_OFFSET.y,
      pos.z + CAMERA_OFFSET.z,
    )
    const returnLook = new THREE.Vector3(pos.x, pos.y, pos.z)

    focusTweenRef.current.t = 0
    tweenRef.current = gsap.to(camera.position, {
      x: returnCam.x,
      y: returnCam.y,
      z: returnCam.z,
      duration: MONITOR_CAM_RETURN_DURATION,
      ease: MONITOR_CAM_RETURN_EASE,
      onUpdate: () => {
        lookAtCurrent.lerp(returnLook, focusTweenRef.current.t)
        camera.up.set(0, 1, 0)
        camera.lookAt(lookAtCurrent)
      },
      onStart: () => {
        gsap.to(focusTweenRef.current, {
          t: 1,
          duration: MONITOR_CAM_RETURN_DURATION,
          ease: MONITOR_CAM_RETURN_EASE,
        })
      },
      onComplete: () => {
        camera.position.copy(returnCam)
        camera.up.set(0, 1, 0)
        camera.lookAt(returnLook)
        lookTargetRef.current.copy(returnLook)
        setMonitorCameraLocked(false)
      },
    })
  }

  useEffect(() => {
    if (currentIsland !== 'projects') {
      hasEnteredRef.current = false
      tweenRef.current?.kill()
      setMonitorCameraLocked(false)
      return undefined
    }

    if (!sceneReady || !monitorScreenReady || hasEnteredRef.current) {
      return undefined
    }

    const monitor = projectsMonitorMeshRef.current
    if (!monitor) return undefined

    hasEnteredRef.current = true
    setMonitorCameraLocked(true)
    setMonitorIframeVisible(false)
    setMonitorFocused(false)

    getMonitorWorldCenter(monitor, center.current)
    getMonitorFacingNormal(monitor, facing.current)
    targetCamPos.current.copy(center.current).addScaledVector(facing.current, MONITOR_CAM_OFFSET)
    targetCamPos.current.y = center.current.y

    const lookDir = new THREE.Vector3()
    camera.getWorldDirection(lookDir)
    lookTargetRef.current.copy(camera.position).addScaledVector(lookDir, 10)

    tweenRef.current?.kill()
    focusTweenRef.current.t = 0

    tweenRef.current = gsap.to(camera.position, {
      x: targetCamPos.current.x,
      y: targetCamPos.current.y,
      z: targetCamPos.current.z,
      duration: MONITOR_CAM_TWEEN_DURATION,
      ease: MONITOR_CAM_TWEEN_EASE,
      onUpdate: () => {
        lookTargetRef.current.lerp(center.current, focusTweenRef.current.t)
        camera.up.set(0, 1, 0)
        camera.lookAt(lookTargetRef.current)
      },
      onStart: () => {
        gsap.to(focusTweenRef.current, {
          t: 1,
          duration: MONITOR_CAM_TWEEN_DURATION,
          ease: MONITOR_CAM_TWEEN_EASE,
        })
      },
      onComplete: () => {
        camera.up.set(0, 1, 0)
        camera.lookAt(center.current)
        lookTargetRef.current.copy(center.current)
        setMonitorFocused(true)
        setMonitorCameraLocked(true)
        setMonitorIframeVisible(true)
      },
    })

    return () => {
      tweenRef.current?.kill()
    }
  }, [
    camera,
    currentIsland,
    monitorScreenReady,
    sceneReady,
    setMonitorCameraLocked,
    setMonitorFocused,
    setMonitorIframeVisible,
  ])

  useFrame(() => {
    if (!monitorFocused) return
    camera.up.set(0, 1, 0)
    camera.lookAt(lookTargetRef.current)
  })

  useEffect(() => {
    const onExitRequest = () => {
      if (!useStore.getState().monitorFocused) return
      runReturnTween()
    }

    window.addEventListener('projects-monitor-exit', onExitRequest)
    return () => window.removeEventListener('projects-monitor-exit', onExitRequest)
  }, [camera, setMonitorCameraLocked, setMonitorFocused, setMonitorIframeVisible])

  useEffect(
    () => () => {
      tweenRef.current?.kill()
    },
    [],
  )

  return null
}
