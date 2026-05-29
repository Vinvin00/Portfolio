import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import { createPortal } from 'react-dom'
import * as THREE from 'three'
import { cornersToViewportRect, getMonitorScreenCorners } from '../../utils/monitorScreen'
import { projectsMonitorMeshRef } from '../../store/monitorRef'
import useStore from '../../store/useStore'

const IFRAME_FADE_MS = 300
const PROJECTS_SITE_PATH = '/projects-site'

const cornerBuffer = [
  new THREE.Vector3(),
  new THREE.Vector3(),
  new THREE.Vector3(),
  new THREE.Vector3(),
]

export default function MonitorIframePortal() {
  const monitorFocused = useStore((s) => s.monitorFocused)
  const monitorIframeVisible = useStore((s) => s.monitorIframeVisible)
  const isProjectsScreenOpen = useStore((s) => s.isProjectsScreenOpen)

  const wrapperRef = useRef(null)
  const iframeRef = useRef(null)
  const { camera, gl } = useThree()
  const opacityRef = useRef(0)

  const portalRoot = useMemo(() => {
    const el = document.createElement('div')
    el.setAttribute('data-monitor-iframe-root', 'true')
    return el
  }, [])

  useEffect(() => {
    document.body.appendChild(portalRoot)
    return () => {
      portalRoot.remove()
    }
  }, [portalRoot])

  useEffect(() => {
    if (!monitorIframeVisible) {
      opacityRef.current = 0
      if (wrapperRef.current) wrapperRef.current.style.opacity = '0'
    }
  }, [monitorIframeVisible])

  useFrame(() => {
    const wrapper = wrapperRef.current
    if (!wrapper) return

    const show = isProjectsScreenOpen && monitorFocused && monitorIframeVisible
    const monitor = projectsMonitorMeshRef.current

    if (!show || !monitor) {
      wrapper.style.opacity = '0'
      wrapper.style.pointerEvents = 'none'
      return
    }

    getMonitorScreenCorners(monitor, cornerBuffer)
    const rect = cornersToViewportRect(cornerBuffer, camera, gl.domElement)

    const canvasRect = gl.domElement.getBoundingClientRect()
    const maxW = canvasRect.width * 0.85
    const maxH = canvasRect.height * 0.85
    if (
      !Number.isFinite(rect.width) ||
      !Number.isFinite(rect.height) ||
      rect.width < 8 ||
      rect.height < 8 ||
      rect.width > maxW ||
      rect.height > maxH
    ) {
      wrapper.style.opacity = '0'
      wrapper.style.pointerEvents = 'none'
      return
    }

    wrapper.style.position = 'fixed'
    wrapper.style.left = `${rect.left}px`
    wrapper.style.top = `${rect.top}px`
    wrapper.style.width = `${rect.width}px`
    wrapper.style.height = `${rect.height}px`
    wrapper.style.margin = '0'
    wrapper.style.padding = '0'
    wrapper.style.border = 'none'
    wrapper.style.borderRadius = '0'
    wrapper.style.overflow = 'hidden'
    wrapper.style.zIndex = '20'
    wrapper.style.pointerEvents = 'all'
    wrapper.style.transition = `opacity ${IFRAME_FADE_MS}ms ease`
    wrapper.style.opacity = '1'
    opacityRef.current = 1
  })

  if (!isProjectsScreenOpen) return null

  return createPortal(
    <div ref={wrapperRef} style={{ opacity: 0, pointerEvents: 'none' }}>
      <iframe
        ref={iframeRef}
        title="Projects showcase"
        src={PROJECTS_SITE_PATH}
        style={{
          display: 'block',
          width: '100%',
          height: '100%',
          margin: 0,
          padding: 0,
          border: 'none',
          borderRadius: 0,
          background: '#1a1a2e',
        }}
      />
    </div>,
    portalRoot,
  )
}
