import { memo, useEffect, useRef, useState } from 'react'
import useStore from '../../store/useStore'
import OverlayCard from './OverlayCard'

const TECH_STACK = ['React Native', 'TypeScript', 'Python', 'Node.js', 'Tailwind CSS']

const sansSemibold = "'GeneralSans-Semibold', 'VincenzoFont', system-ui, sans-serif"
const sansLight = "'GeneralSans-Light', 'VincenzoFont', system-ui, sans-serif"
const sansRegular = "'GeneralSans-Regular', 'VincenzoFont', system-ui, sans-serif"

const HEADSHOT_SIZE = 200

function AboutOverlay() {
  const isDarkMode = useStore((state) => state.isDarkMode)
  const contentRef = useRef(null)
  const [headshotError, setHeadshotError] = useState(false)

  useEffect(() => {
    const card = contentRef.current?.parentElement
    if (!card) return

    Object.assign(card.style, {
      maxWidth: '960px',
      borderRadius: '28px',
      padding: '42px 48px',
      background: isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.72)',
      backdropFilter: 'blur(36px) saturate(160%)',
      WebkitBackdropFilter: 'blur(36px) saturate(160%)',
      border: isDarkMode ? '1px solid rgba(255,255,255,0.12)' : '1px solid rgba(0,0,0,0.08)',
      borderTop: isDarkMode ? '1px solid rgba(255,255,255,0.18)' : '1px solid rgba(255,255,255,0.9)',
      boxShadow: isDarkMode
        ? '0 12px 40px rgba(0,0,0,0.38), 0 1px 0 rgba(255,255,255,0.08) inset'
        : '0 12px 36px rgba(0,0,0,0.10), 0 1px 0 rgba(255,255,255,0.85) inset',
    })
  }, [isDarkMode])

  const nameColor = isDarkMode ? 'rgba(255,255,255,0.92)' : 'rgba(0,0,0,0.82)'
  const subtitleColor = isDarkMode ? 'rgba(255,255,255,0.44)' : 'rgba(0,0,0,0.44)'
  const dividerColor = isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)'
  const stackLabelColor = isDarkMode ? 'rgba(255,255,255,0.28)' : 'rgba(0,0,0,0.28)'
  const headshotRing = isDarkMode
    ? '0 0 0 1px rgba(255,255,255,0.10), 0 6px 20px rgba(0,0,0,0.28)'
    : '0 0 0 1px rgba(0,0,0,0.06), 0 6px 16px rgba(0,0,0,0.10)'
  const fallbackBorder = isDarkMode ? '1px solid rgba(255,255,255,0.12)' : '1px solid rgba(0,0,0,0.08)'

  const subtitleStyle = {
    fontFamily: sansLight,
    fontSize: '17px',
    fontWeight: 300,
    color: subtitleColor,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    lineHeight: 1.6,
  }

  return (
    <OverlayCard className="max-w-[960px] rounded-[28px] p-0" contentClassName="space-y-0">
      <div ref={contentRef} className="pr-10">
        <div className="flex flex-row items-center gap-7">
          <div
            className="shrink-0 overflow-hidden"
            style={{
              width: HEADSHOT_SIZE,
              height: HEADSHOT_SIZE,
              borderRadius: 22,
              boxShadow: headshotRing,
            }}
          >
            {headshotError ? (
              <div
                className="flex h-full w-full items-center justify-center"
                style={{
                  background: isDarkMode ? 'rgba(55,138,221,0.10)' : 'rgba(55,138,221,0.08)',
                  border: fallbackBorder,
                  fontFamily: sansSemibold,
                  fontSize: '24px',
                  fontWeight: 600,
                  color: isDarkMode ? 'rgba(150,200,255,0.45)' : 'rgba(55,138,221,0.55)',
                }}
              >
                VB
              </div>
            ) : (
              <img
                src="/pfp.jpeg"
                alt="Vincenzo Balbi"
                className="h-full w-full object-cover"
                style={{ borderRadius: 22 }}
                onError={() => setHeadshotError(true)}
              />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <h2
              className="mb-3 truncate"
              style={{
                fontFamily: sansSemibold,
                fontWeight: 600,
                fontSize: '42px',
                letterSpacing: '-0.02em',
                color: nameColor,
                lineHeight: 1.15,
              }}
            >
              Vincenzo Balbi
            </h2>
            <div className="space-y-1.5">
              <p style={subtitleStyle}>Dual Degree — Business Administration & CS/AI</p>
              <p style={subtitleStyle}>IE University, Madrid</p>
              <p style={subtitleStyle}>Fullstack Dev · Nutrisync Collective</p>
            </div>
          </div>
        </div>

        <div className="my-7 h-px w-full" style={{ background: dividerColor }} />

        <div className="flex items-center gap-5 overflow-hidden">
          <span
            className="shrink-0 uppercase"
            style={{
              fontFamily: sansLight,
              fontSize: '13px',
              fontWeight: 300,
              letterSpacing: '0.14em',
              color: stackLabelColor,
            }}
          >
            Stack
          </span>
          <div className="flex min-w-0 flex-nowrap items-center gap-2.5 overflow-hidden">
            {TECH_STACK.map((tech) => (
              <span
                key={tech}
                className="inline-flex shrink-0 items-center rounded-[9px] px-3 py-2 text-[15px]"
                style={{
                  fontFamily: sansRegular,
                  fontWeight: 400,
                  background: isDarkMode ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.05)',
                  border: isDarkMode ? '1px solid rgba(255,255,255,0.14)' : '1px solid rgba(0,0,0,0.12)',
                  borderBottom: isDarkMode ? '2px solid rgba(0,0,0,0.18)' : '2px solid rgba(0,0,0,0.10)',
                  color: isDarkMode ? 'rgba(255,255,255,0.60)' : 'rgba(0,0,0,0.50)',
                }}
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      </div>
    </OverlayCard>
  )
}

export default memo(AboutOverlay)
