export function requestExitMonitorFocus() {
  window.dispatchEvent(new Event('projects-monitor-exit'))
}
