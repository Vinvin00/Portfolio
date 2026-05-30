import { useEffect } from 'react'
import { MAIN_ISLAND_OBJECTS } from '../config/objects'
import useStore from '../store/useStore'

const ACTION_MAP = {}

MAIN_ISLAND_OBJECTS.forEach((obj) => {
  if (obj.action) {
    ACTION_MAP[obj.id] = obj.action
  }
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
        setIsDarkMode,
        setIsProjectsScreenOpen,
      } = useStore.getState()

      if (e.code === 'Escape') {
        if (isProjectsScreenOpen) {
          setIsProjectsScreenOpen(false)
          return
        }
        setActiveOverlay(null)
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
