import { MAIN_ISLAND_OBJECTS } from '../../config/objects'
import SceneObject from './SceneObject'

export default function IslandObjects() {
  return (
    <group>
      {MAIN_ISLAND_OBJECTS.map((obj) => (
        <SceneObject key={obj.id} config={obj} />
      ))}
    </group>
  )
}
