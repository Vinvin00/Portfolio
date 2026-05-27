import { useEffect, useRef } from 'react'

const DARK_FOG_CONFIG = {
  highlightColor: 0x090909,
  midtoneColor: 0x24232a,
  lowlightColor: 0x100f22,
  baseColor: 0x1b1818,
}

const LIGHT_FOG_CONFIG = {
  highlightColor: 0x87d7e8,
  midtoneColor: 0x234864,
  lowlightColor: 0xa3bec5,
  baseColor: 0xcfbbbb,
}

export default function VantaBackground({ isDarkMode }) {
  const vantaRef = useRef(null)
  const vantaEffect = useRef(null)

  useEffect(() => {
    let cancelled = false

    const loadScript = (src) =>
      new Promise((resolve, reject) => {
        let script = document.querySelector(`script[src="${src}"]`)
        if (script) {
          if (script.dataset.loaded === 'true') {
            resolve()
            return
          }
          script.addEventListener('load', () => resolve(), { once: true })
          script.addEventListener('error', (event) => reject(event), { once: true })
          return
        }
        script = document.createElement('script')
        script.src = src
        script.onload = () => {
          script.dataset.loaded = 'true'
          resolve()
        }
        script.onerror = (event) => reject(event)
        document.head.appendChild(script)
      })

    const init = async () => {
      try {
        await loadScript('https://cdnjs.cloudflare.com/ajax/libs/three.js/r134/three.min.js')
        if (!window.THREE) {
          throw new Error('THREE failed to attach to window')
        }
        await loadScript('/vanta/vanta.fog.min.js')
        if (!window.VANTA || !window.VANTA.FOG) {
          throw new Error('VANTA.FOG is unavailable after script load')
        }
        if (!cancelled && vantaRef.current && !vantaEffect.current) {
          const palette = isDarkMode ? DARK_FOG_CONFIG : LIGHT_FOG_CONFIG
          vantaEffect.current = window.VANTA.FOG({
            el: vantaRef.current,
            THREE: window.THREE,
            mouseControls: true,
            touchControls: true,
            gyroControls: false,
            minHeight: 200.0,
            minWidth: 200.0,
            ...palette,
            blurFactor: 0.52,
            speed: 2.1,
            zoom: 0.9,
          })
        }
      } catch (err) {
        console.error('Vanta failed to load:', err)
      }
    }

    init()

    return () => {
      cancelled = true
      if (vantaEffect.current) {
        vantaEffect.current.destroy()
        vantaEffect.current = null
      }
    }
  }, [isDarkMode])

  return (
    <div
      ref={vantaRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 0,
        pointerEvents: 'none',
      }}
    />
  )
}
