import useStore from '../store/useStore'

export function requestExitMonitorFocus() {
  useStore.getState().setIsProjectsScreenOpen(false)
}
