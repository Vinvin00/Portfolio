import { create } from 'zustand'

const useStore = create((set) => ({
  currentIsland: 'main',
  activeOverlay: null,
  nearbyObjectId: null,
  isDarkMode: true,
  introComplete: false,
  sceneReady: false,
  isRespawning: false,
  playerPosition: { x: 0, y: 0, z: 0 },

  setCurrentIsland: (currentIsland) => set({ currentIsland }),
  setActiveOverlay: (activeOverlay) => set({ activeOverlay }),
  setNearbyObjectId: (nearbyObjectId) => set({ nearbyObjectId }),
  setIsDarkMode: (isDarkMode) => set({ isDarkMode }),
  setIntroComplete: (introComplete) => set({ introComplete }),
  setSceneReady: (sceneReady) => set({ sceneReady }),
  setIsRespawning: (isRespawning) => set({ isRespawning }),
  setPlayerPosition: (playerPosition) => set({ playerPosition }),
}))

export default useStore
