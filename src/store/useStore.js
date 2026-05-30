import { create } from 'zustand'

const useStore = create((set) => ({
  currentIsland: 'main',
  activeOverlay: null,
  nearbyObjectId: null,
  isProjectsScreenOpen: false,
  monitorFocused: false,
  monitorScreenReady: false,
  monitorIframeVisible: false,
  isDarkMode: true,
  introComplete: false,
  introLandingStarted: false,
  sceneReady: false,
  isRespawning: false,
  playerPosition: { x: 0, y: 1, z: 0 },

  setCurrentIsland: (currentIsland) =>
    set({
      currentIsland,
      ...(currentIsland !== 'projects'
        ? {
            monitorFocused: false,
            monitorScreenReady: false,
            monitorIframeVisible: false,
          }
        : {}),
    }),
  setActiveOverlay: (activeOverlay) => set({ activeOverlay }),
  setNearbyObjectId: (nearbyObjectId) => set({ nearbyObjectId }),
  setIsProjectsScreenOpen: (isProjectsScreenOpen) =>
    set({
      isProjectsScreenOpen,
      ...(!isProjectsScreenOpen
        ? {
            monitorFocused: false,
            monitorIframeVisible: false,
          }
        : {}),
    }),
  setMonitorFocused: (monitorFocused) => set({ monitorFocused }),
  setMonitorScreenReady: (monitorScreenReady) => set({ monitorScreenReady }),
  setMonitorIframeVisible: (monitorIframeVisible) => set({ monitorIframeVisible }),
  setIsDarkMode: (isDarkMode) => set({ isDarkMode }),
  setIntroComplete: (introComplete) => set({ introComplete }),
  setIntroLandingStarted: (introLandingStarted) => set({ introLandingStarted }),
  setSceneReady: (sceneReady) => set({ sceneReady }),
  setIsRespawning: (isRespawning) => set({ isRespawning }),
  setPlayerPosition: (playerPosition) => set({ playerPosition }),
}))

export default useStore
