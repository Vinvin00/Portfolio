import useStore from '../../store/useStore'

export default function Nameplate() {
  const isDarkMode = useStore((state) => state.isDarkMode)

  return (
    <div
      className="pointer-events-none fixed left-1/2 top-6 z-40 -translate-x-1/2 text-[14px] uppercase tracking-[0.2em] transition-colors duration-[400ms]"
      style={{
        fontFamily: '"DM Sans", system-ui, -apple-system, sans-serif',
        fontWeight: 300,
        color: isDarkMode ? 'rgba(255, 255, 255, 0.45)' : 'rgba(0, 0, 0, 0.35)',
      }}
    >
      Vincenzo
    </div>
  )
}
