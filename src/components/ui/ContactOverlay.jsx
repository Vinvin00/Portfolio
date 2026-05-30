import { memo } from 'react'
import useStore from '../../store/useStore'
import OverlayCard from './OverlayCard'

function ContactOverlay() {
  const isDarkMode = useStore((state) => state.isDarkMode)

  return (
    <OverlayCard title="Contact">
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-3 text-sm">
          <span style={{ color: isDarkMode ? 'rgba(255,255,255,0.38)' : 'rgba(0,0,0,0.35)', fontWeight: 300 }}>
            Email
          </span>
          <a
            href="mailto:balbi.vincenzo@gmail.com"
            style={{ color: 'rgba(150, 200, 255, 0.95)' }}
          >
            balbi.vincenzo@gmail.com
          </a>
        </div>
        <div
          className="h-px w-full"
          style={{ background: isDarkMode ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.1)' }}
        />
        <div className="flex items-center justify-between gap-3 text-sm">
          <span style={{ color: isDarkMode ? 'rgba(255,255,255,0.38)' : 'rgba(0,0,0,0.35)', fontWeight: 300 }}>
            LinkedIn
          </span>
          <a
            href="https://www.linkedin.com/in/vincenzobalbi/"
            target="_blank"
            rel="noreferrer"
            style={{ color: 'rgba(150, 200, 255, 0.95)' }}
          >
            Open profile
          </a>
        </div>
        <div
          className="h-px w-full"
          style={{ background: isDarkMode ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.1)' }}
        />
        <div className="flex items-center justify-between gap-3 text-sm">
          <span style={{ color: isDarkMode ? 'rgba(255,255,255,0.38)' : 'rgba(0,0,0,0.35)', fontWeight: 300 }}>
            GitHub
          </span>
          <a
            href="https://github.com/Vinvin00"
            target="_blank"
            rel="noreferrer"
            style={{ color: 'rgba(150, 200, 255, 0.95)' }}
          >
            Open repository list
          </a>
        </div>
      </div>
    </OverlayCard>
  )
}

export default memo(ContactOverlay)
