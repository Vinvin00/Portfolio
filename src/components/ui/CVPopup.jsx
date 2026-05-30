import { memo } from 'react'
import useStore from '../../store/useStore'

function CVPopup() {
  const isDarkMode = useStore((state) => state.isDarkMode)

  return (
    <div
      className="fixed bottom-48 left-1/2 z-40 -translate-x-1/2 rounded-[18px] px-5 py-3 transition-colors duration-[400ms]"
      style={{
        background: isDarkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)',
        backdropFilter: 'blur(28px) saturate(180%)',
        border: isDarkMode ? '1px solid rgba(255, 255, 255, 0.13)' : '1px solid rgba(0, 0, 0, 0.1)',
        boxShadow: isDarkMode
          ? '0 8px 32px rgba(0,0,0,0.4), 0 1px 0 rgba(255,255,255,0.08) inset'
          : '0 8px 28px rgba(0,0,0,0.14), 0 1px 0 rgba(255,255,255,0.2) inset',
        color: isDarkMode ? 'rgba(255, 255, 255, 0.88)' : 'rgba(0, 0, 0, 0.72)',
        fontFamily: '"DM Sans", system-ui, -apple-system, sans-serif',
      }}
    >
      <a
        href="/VincenzoBalbiCV.pdf"
        download="VincenzoBalbiCV.pdf"
        className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm transition-opacity hover:opacity-90"
        style={{ fontWeight: 400 }}
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
          <path
            d="M6 1.5V7.5M6 7.5L3.75 5.25M6 7.5L8.25 5.25M2 9.5H10"
            stroke={isDarkMode ? 'rgba(255,255,255,0.82)' : 'rgba(0,0,0,0.62)'}
            strokeWidth="1"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span>Download CV</span>
      </a>
    </div>
  )
}

export default memo(CVPopup)
