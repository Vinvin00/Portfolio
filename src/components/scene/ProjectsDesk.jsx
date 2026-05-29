import { useGLTF } from '@react-three/drei'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { getMonitorFacingNormal, getMonitorWorldCenter } from '../../utils/monitorScreen'
import { projectsMonitorMeshRef } from '../../store/monitorRef'
import useStore from '../../store/useStore'

const DESK_MODEL_URL = '/models/standing-desk.glb'
const MONITOR_MESH_NAME = 'Screen'
const DESK_POSITION = [0, 0.2, 0]
const DESK_SCALE = 1.1
const DESK_ROTATION = [0, Math.PI, 0]

useGLTF.preload(DESK_MODEL_URL)

function findMonitorMesh(root) {
  let found = null
  root.traverse((child) => {
    if (found) return
    if (child.isMesh && child.name === MONITOR_MESH_NAME) {
      found = child
    }
  })
  return found
}

export default function ProjectsDesk() {
  const loggedRef = useRef(false)
  const { scene } = useGLTF(DESK_MODEL_URL)
  const setMonitorScreenReady = useStore((s) => s.setMonitorScreenReady)

  const deskScene = useMemo(() => {
    const clone = scene.clone(true)
    clone.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true
        child.receiveShadow = true
        if (child.geometry && !child.geometry.boundingBox) {
          child.geometry.computeBoundingBox()
        }
      }
    })
    return clone
  }, [scene])

  useEffect(() => {
    const monitor = findMonitorMesh(deskScene)
    if (!monitor) {
      console.warn(`[ProjectsDesk] Monitor mesh "${MONITOR_MESH_NAME}" not found in ${DESK_MODEL_URL}`)
      projectsMonitorMeshRef.current = null
      setMonitorScreenReady(false)
      return undefined
    }

    projectsMonitorMeshRef.current = monitor

    const worldPos = new THREE.Vector3()
    const worldDir = new THREE.Vector3()
    monitor.getWorldPosition(worldPos)
    monitor.getWorldDirection(worldDir)
    console.log('[ProjectsDesk] monitor getWorldPosition():', worldPos.toArray())
    console.log('[ProjectsDesk] monitor getWorldDirection():', worldDir.toArray())

    const facing = getMonitorFacingNormal(monitor)
    const center = getMonitorWorldCenter(monitor)
    console.log('[ProjectsDesk] monitor screen center (bbox):', center.toArray())
    console.log('[ProjectsDesk] monitor facing normal (bbox):', facing.toArray())

    loggedRef.current = true
    setMonitorScreenReady(true)

    return () => {
      projectsMonitorMeshRef.current = null
      loggedRef.current = false
      setMonitorScreenReady(false)
    }
  }, [deskScene, setMonitorScreenReady])

  return (
    <group position={DESK_POSITION} rotation={DESK_ROTATION}>
      <primitive object={deskScene} scale={DESK_SCALE} />
    </group>
  )
}
