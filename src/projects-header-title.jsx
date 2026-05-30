import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import CurvedLoop from './components/ui/CurvedLoop'
import './components/ui/CurvedLoop.css'

const rootEl = document.getElementById('projects-title-root')

if (rootEl) {
  createRoot(rootEl).render(
    <StrictMode>
      <CurvedLoop
        marqueeText="   projects  ✦"
        speed={1.4}
        curveAmount={10}
        direction="right"
        interactive
        className="projects-curved-loop-text"
      />
    </StrictMode>,
  )
}
