import { PROJECTS, PROJECTS_ISLAND_OBJECTS } from '../../config/objects'
import ProjectsDesk from './ProjectsDesk'
import ProjectsMonitorCamera from './ProjectsMonitorCamera'
import MonitorIframePortal from './MonitorIframePortal'
import SceneObject from './SceneObject'

export default function ProjectsIsland() {
  return (
    <group>
      <mesh position={[0, 0.25, 0]} receiveShadow>
        <cylinderGeometry args={[6, 6, 0.5, 64]} />
        <meshStandardMaterial color="#3a5647" />
      </mesh>

      <mesh position={[0, -2, 0]} receiveShadow>
        <cylinderGeometry args={[1, 1.1, 4, 32]} />
        <meshStandardMaterial color="#2a2f38" />
      </mesh>

      <ProjectsDesk />
      <ProjectsMonitorCamera />
      <MonitorIframePortal />

      {PROJECTS_ISLAND_OBJECTS.map((obj) => (
        <SceneObject key={obj.id} config={obj} />
      ))}

      {PROJECTS.map((project) => (
        <SceneObject
          key={project.id}
          config={{
            ...project,
            id: project.id,
            label: project.name,
            position: project.islandPosition,
            action: { type: 'overlay', value: `project-${project.id}` },
          }}
        />
      ))}
    </group>
  )
}
