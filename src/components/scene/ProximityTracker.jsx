import { useMemo } from 'react'
import { MAIN_ISLAND_OBJECTS, PROJECTS, PROJECTS_ISLAND_OBJECTS } from '../../config/objects'
import { useProximity } from '../../hooks/useProximity'

function toProximityObject(object) {
  const sourcePosition = object.position ?? object.islandPosition
  const yOffset = object.placeholderGeometry === 'box' ? 0.75 : 0.5

  return {
    id: object.id,
    position: {
      x: sourcePosition.x,
      y: sourcePosition.y + yOffset,
      z: sourcePosition.z,
    },
  }
}

export default function ProximityTracker({ currentIsland }) {
  const objects = useMemo(() => {
    if (currentIsland === 'projects') {
      return [...PROJECTS_ISLAND_OBJECTS, ...PROJECTS.map((project) => ({ ...project, position: project.islandPosition }))]
        .map(toProximityObject)
    }

    return MAIN_ISLAND_OBJECTS.map(toProximityObject)
  }, [currentIsland])

  useProximity(objects, 2)
  return null
}
