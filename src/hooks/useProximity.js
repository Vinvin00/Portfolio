import { useFrame } from '@react-three/fiber'
import { useRef, useState } from 'react'
import useStore from '../store/useStore'

const DELTA_THRESHOLD_SQ = 0.1 * 0.1 // skip recompute when player hasn't moved > 0.1 units

export function useProximity(objects, threshold = 2) {
  const [nearestId, setNearestId] = useState(null)
  const nearestRef = useRef(null)
  const lastPositionRef = useRef({ x: null, y: null, z: null })
  const thresholdSq = threshold * threshold

  useFrame(() => {
    const { playerPosition } = useStore.getState()

    // Skip expensive scan if the player hasn't moved enough since last check.
    const last = lastPositionRef.current
    if (last.x !== null) {
      const ddx = playerPosition.x - last.x
      const ddy = playerPosition.y - last.y
      const ddz = playerPosition.z - last.z
      if (ddx * ddx + ddy * ddy + ddz * ddz < DELTA_THRESHOLD_SQ) return
    }
    lastPositionRef.current = { x: playerPosition.x, y: playerPosition.y, z: playerPosition.z }

    let nearest = null
    let nearestDistanceSq = Number.POSITIVE_INFINITY

    objects.forEach((object) => {
      const dx = playerPosition.x - object.position.x
      const dy = playerPosition.y - object.position.y
      const dz = playerPosition.z - object.position.z
      const distSq = dx * dx + dy * dy + dz * dz

      if (distSq < nearestDistanceSq) {
        nearestDistanceSq = distSq
        nearest = object.id
      }
    })

    const nextNearest = nearestDistanceSq <= thresholdSq ? nearest : null

    if (nearestRef.current !== nextNearest) {
      nearestRef.current = nextNearest
      setNearestId(nextNearest)
      useStore.getState().setNearbyObjectId(nextNearest)
    }
  })

  return nearestId
}
