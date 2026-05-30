import { useMemo } from 'react'
import { MAIN_ISLAND_OBJECTS } from '../../config/objects'
import { useProximity } from '../../hooks/useProximity'

function toProximityObject(object) {
  const yOffset = object.placeholderGeometry === 'box' ? 0.75 : 0.5

  return {
    id: object.id,
    position: {
      x: object.position.x,
      y: object.position.y + yOffset,
      z: object.position.z,
    },
  }
}

export default function ProximityTracker() {
  const objects = useMemo(() => MAIN_ISLAND_OBJECTS.map(toProximityObject), [])
  useProximity(objects, 2)
  return null
}
