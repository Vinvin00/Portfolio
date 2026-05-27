import { useEffect, useMemo, useRef, useState } from 'react'

const KEY_MAP = {
  KeyW: 'forward',
  ArrowUp: 'forward',
  KeyS: 'backward',
  ArrowDown: 'backward',
  KeyA: 'left',
  ArrowLeft: 'left',
  KeyD: 'right',
  ArrowRight: 'right',
}

export function useCharacterControls(enabled = true) {
  const prevEnabled = useRef(false)
  const [keys, setKeys] = useState({
    forward: false,
    backward: false,
    left: false,
    right: false,
  })

  useEffect(() => {
    if (prevEnabled.current === false && enabled === true) {
      setKeys({
        forward: false,
        backward: false,
        left: false,
        right: false,
      })
    }

    if (!enabled) {
      prevEnabled.current = enabled
      return undefined
    }

    const handleKeyDown = (event) => {
      const key = KEY_MAP[event.code]
      if (!key) return
      setKeys((prev) => ({ ...prev, [key]: true }))
    }

    const handleKeyUp = (event) => {
      const key = KEY_MAP[event.code]
      if (!key) return
      setKeys((prev) => ({ ...prev, [key]: false }))
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    prevEnabled.current = enabled

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [enabled])

  return useMemo(() => {
    if (!enabled) {
      return { x: 0, z: 0 }
    }

    const x = Number(keys.right) - Number(keys.left)
    const z = Number(keys.backward) - Number(keys.forward)
    const length = Math.hypot(x, z)

    if (length === 0) {
      return { x: 0, z: 0 }
    }

    return {
      x: x / length,
      z: z / length,
    }
  }, [enabled, keys])
}
