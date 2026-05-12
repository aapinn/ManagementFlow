import { useEffect, useRef } from 'react'

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

export function useFocusTrap(active: boolean) {
  const ref = useRef<HTMLDivElement>(null)
  const prevFocus = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!active) return
    prevFocus.current = document.activeElement as HTMLElement

    const el = ref.current
    if (!el) return

    const first = el.querySelectorAll<HTMLElement>(FOCUSABLE)
    const firstFocusable = first[0]
    firstFocusable?.focus()

    function handleKey(e: KeyboardEvent) {
      if (e.key !== 'Tab' || !el) return
      const focusable = el.querySelectorAll<HTMLElement>(FOCUSABLE)
      const firstEl = focusable[0]
      const lastEl = focusable[focusable.length - 1]

      if (e.shiftKey) {
        if (document.activeElement === firstEl) {
          e.preventDefault()
          lastEl?.focus()
        }
      } else {
        if (document.activeElement === lastEl) {
          e.preventDefault()
          firstEl?.focus()
        }
      }
    }

    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('keydown', handleKey)
      prevFocus.current?.focus()
    }
  }, [active])

  return ref
}
