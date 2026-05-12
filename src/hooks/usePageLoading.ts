import { useState, useEffect } from 'react'

export function usePageLoading(delay = 320) {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), delay)
    return () => clearTimeout(t)
  }, [delay])

  return loading
}
