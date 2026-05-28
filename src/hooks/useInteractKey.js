import { useEffect } from 'react'
import {
  MAIN_ISLAND_OBJECTS,
  PROJECTS,
  PROJECTS_ISLAND_OBJECTS,
} from '../config/objects'
import useStore from '../store/useStore'

const ACTION_MAP = {}

;[...MAIN_ISLAND_OBJECTS, ...PROJECTS_ISLAND_OBJECTS].forEach((obj) => {
  if (obj.action) {
    ACTION_MAP[obj.id] = obj.action
  }
})

PROJECTS.forEach((project) => {
  ACTION_MAP[project.id] = { type: 'overlay', value: `project-${project.id}` }
})

export function useInteractKey() {
  useEffect(() => {
    const handle = (e) => {
      const {
        nearbyObjectId,
        activeOverlay,
        isProjectsScreenOpen,
        introComplete,
        isRespawning,
        isDarkMode,
        setActiveOverlay,
        setCurrentIsland,
        setIsDarkMode,
        setIsProjectsScreenOpen,
      } = useStore.getState()

      if (e.code === 'Escape') {
        setActiveOverlay(null)
        if (isProjectsScreenOpen) setIsProjectsScreenOpen(false)
        return
      }

      if (e.code === 'KeyE' && isProjectsScreenOpen) {
        setIsProjectsScreenOpen(false)
        return
      }

      if (e.code === 'KeyE' && activeOverlay !== null) {
        setActiveOverlay(null)
        return
      }

      if (e.code === 'KeyE' && introComplete && !isRespawning && nearbyObjectId !== null) {
        const action = ACTION_MAP[nearbyObjectId]
        if (!action) return

        switch (action.type) {
          case 'overlay':
            setActiveOverlay(action.value)
            break
          case 'teleport':
            setActiveOverlay(null)
            setCurrentIsland(action.value)
            break
          case 'projectsScreen':
            setActiveOverlay(null)
            setIsProjectsScreenOpen(true)
            break
          case 'toggleDarkMode':
            setIsDarkMode(!isDarkMode)
            break
          default:
            break
        }
      }
    }

    window.addEventListener('keydown', handle)
    return () => window.removeEventListener('keydown', handle)
  }, [])
}
