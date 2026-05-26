import { useState, useEffect } from 'react'

function detectMobile(): boolean {
  if (typeof navigator === 'undefined') return false
  return /Android|iPhone|iPad|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
}

export function useDeviceType(): boolean {
  const [isMobile, setIsMobile] = useState(detectMobile)

  useEffect(() => {
    const handler = () => setIsMobile(detectMobile())
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])

  return isMobile
}
