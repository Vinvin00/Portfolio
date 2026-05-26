import { useFrame } from '@react-three/fiber'
import { useRef, useState } from 'react'
import useStore from '../store/useStore'

export function useProximity(objects, threshold = 2) {
  const [nearestId, setNearestId] = useState(null)
  const nearestRef = useRef(null)

  useFrame(() => {
    const { playerPosition } = useStore.getState()

    let nearest = null
    let nearestDistance = Number.POSITIVE_INFINITY

    objects.forEach((object) => {
      const dx = playerPosition.x - object.position.x
      const dy = playerPosition.y - object.position.y
      const dz = playerPosition.z - object.position.z
      const distance = Math.sqrt(dx * dx + dy * dy + dz * dz)

      if (distance < nearestDistance) {
        nearestDistance = distance
        nearest = object.id
      }
    })

    const nextNearest = nearestDistance <= threshold ? nearest : null

    if (nearestRef.current !== nextNearest) {
      nearestRef.current = nextNearest
      setNearestId(nextNearest)
    }
  })

  return nearestId
}
