import { useState, useEffect, useRef } from 'react'

export function useCountUp(target: number, duration = 800, enabled = true) {
  const [value, setValue] = useState(0)
  const frameRef = useRef<number>(0)

  useEffect(() => {
    if (!enabled) { setValue(target); return }
    const start = performance.now()
    const from = 0
    const diff = target - from

    function tick(now: number) {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(Math.round(from + diff * eased))
      if (progress < 1) frameRef.current = requestAnimationFrame(tick)
    }

    frameRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frameRef.current)
  }, [target, duration, enabled])

  return value
}
