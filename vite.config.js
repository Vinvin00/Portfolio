import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    target: 'esnext',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        projects: resolve(__dirname, 'src/vincenzo-projects.html'),
      },
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/three/')) return 'vendor-three'
          if (
            id.includes('node_modules/@react-three/fiber') ||
            id.includes('node_modules/@react-three/drei')
          )
            return 'vendor-r3f'
          if (id.includes('node_modules/gsap/')) return 'vendor-gsap'
        },
      },
    },
  },
  server: {
    port: 5173,
    strictPort: true,
    open: true,
  },
})
