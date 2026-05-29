import { requestExitMonitorFocus } from '../../utils/projectsMonitorEvents'
import useStore from '../../store/useStore'

export default function MonitorBackButton() {
  const monitorFocused = useStore((s) => s.monitorFocused)
  const currentIsland = useStore((s) => s.currentIsland)

  if (currentIsland !== 'projects' || !monitorFocused) return null

  return (
    <button
      type="button"
      onClick={() => requestExitMonitorFocus()}
      className="fixed left-4 top-4 z-30 rounded-md border border-white/20 bg-black/50 px-3 py-1.5 text-xs text-slate-200 backdrop-blur hover:border-white/40"
    >
      ← Back to island
    </button>
  )
}
