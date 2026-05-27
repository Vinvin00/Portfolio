import { useEffect, useState } from 'react'

/** True when the URL serves a real asset (not Vite's HTML fallback). */
export async function isModelAvailable(url) {
  if (!url) return false

  try {
    const response = await fetch(url, { method: 'HEAD' })
    if (!response.ok) return false

    const contentType = response.headers.get('content-type') ?? ''
    if (contentType.includes('text/html')) return false

    return true
  } catch {
    return false
  }
}

export function useModelAvailable(url) {
  const [available, setAvailable] = useState(null)

  useEffect(() => {
    if (!url) return undefined

    let cancelled = false

    isModelAvailable(url).then((ok) => {
      if (!cancelled) setAvailable(ok)
    })

    return () => {
      cancelled = true
    }
  }, [url])

  return url ? available : false
}
