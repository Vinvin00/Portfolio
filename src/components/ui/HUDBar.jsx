import useStore from '../../store/useStore'

function KeyChip({ label, isPrimary = false, wide = false }) {
  const isDarkMode = useStore((state) => state.isDarkMode)

  const style = isPrimary
    ? {
        background: 'rgba(100, 160, 255, 0.13)',
        border: '1px solid rgba(100, 160, 255, 0.28)',
        borderBottom: '2px solid rgba(45, 80, 140, 0.45)',
        color: 'rgba(150, 200, 255, 0.95)',
      }
    : {
        background: isDarkMode ? 'rgba(255, 255, 255, 0.09)' : 'rgba(0, 0, 0, 0.08)',
        border: isDarkMode ? '1px solid rgba(255, 255, 255, 0.16)' : '1px solid rgba(0, 0, 0, 0.15)',
        borderBottom: isDarkMode ? '2px solid rgba(0, 0, 0, 0.2)' : '2px solid rgba(0, 0, 0, 0.12)',
        color: isDarkMode ? 'rgba(255, 255, 255, 0.82)' : 'rgba(0, 0, 0, 0.62)',
      }

  return (
    <span
      className={`inline-flex h-6 items-center justify-center rounded-[7px] px-2 text-[11px] ${wide ? 'min-w-[34px]' : 'min-w-[24px]'}`}
      style={{ ...style, fontFamily: '"DM Mono", ui-monospace, SFMono-Regular, Menlo, monospace' }}
    >
      {label}
    </span>
  )
}

function VerticalDivider() {
  const isDarkMode = useStore((state) => state.isDarkMode)
  return (
    <span
      className="mx-1 inline-block h-7 w-px"
      style={{ background: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.14)' }}
    />
  )
}

export default function HUDBar() {
  const introComplete = useStore((state) => state.introComplete)
  const activeOverlay = useStore((state) => state.activeOverlay)
  const isDarkMode = useStore((state) => state.isDarkMode)

  if (!introComplete || activeOverlay) return null

  return (
    <div
      className="fixed bottom-6 left-1/2 z-40 -translate-x-1/2 rounded-2xl px-4 py-3 opacity-0 [animation:hudFadeIn_0.3s_ease-out_forwards]"
      style={{
        background: isDarkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)',
        backdropFilter: 'blur(28px) saturate(180%)',
        border: isDarkMode ? '1px solid rgba(255, 255, 255, 0.13)' : '1px solid rgba(0, 0, 0, 0.1)',
        boxShadow: isDarkMode
          ? '0 8px 32px rgba(0,0,0,0.4), 0 1px 0 rgba(255,255,255,0.08) inset'
          : '0 8px 26px rgba(0,0,0,0.16), 0 1px 0 rgba(255,255,255,0.26) inset',
      }}
    >
      <div className="flex items-center gap-3">
        <div className="grid grid-cols-3 gap-1">
          <span />
          <KeyChip label="W" />
          <span />
          <KeyChip label="A" />
          <KeyChip label="S" />
          <KeyChip label="D" />
        </div>
        <span
          className="text-xs tracking-[0.08em]"
          style={{ color: isDarkMode ? 'rgba(255, 255, 255, 0.38)' : 'rgba(0, 0, 0, 0.4)', fontWeight: 300 }}
        >
          Move
        </span>

        <VerticalDivider />

        <KeyChip label="E" isPrimary />
        <span
          className="text-xs tracking-[0.08em]"
          style={{ color: isDarkMode ? 'rgba(255, 255, 255, 0.38)' : 'rgba(0, 0, 0, 0.4)', fontWeight: 300 }}
        >
          Interact
        </span>
      </div>
    </div>
  )
}
