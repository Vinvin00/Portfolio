import { create } from 'zustand'

const useStore = create((set) => ({
  currentIsland: 'main',
  activeOverlay: null,
  isDarkMode: true,
  introComplete: false,
  playerPosition: { x: 0, y: 0, z: 0 },

  setCurrentIsland: (currentIsland) => set({ currentIsland }),
  setActiveOverlay: (activeOverlay) => set({ activeOverlay }),
  setIsDarkMode: (isDarkMode) => set({ isDarkMode }),
  setIntroComplete: (introComplete) => set({ introComplete }),
  setPlayerPosition: (playerPosition) => set({ playerPosition }),
}))

export default useStore
