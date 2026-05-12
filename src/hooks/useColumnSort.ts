import { useState, useMemo } from 'react'

export type SortDir = 'asc' | 'desc'

export interface SortConfig {
  key: string
  dir: SortDir
}

export function useColumnSort<T extends Record<string, unknown>>(items: T[], defaultKey = '') {
  const [sort, setSort] = useState<SortConfig>({ key: defaultKey, dir: 'desc' })

  const toggle = (key: string) => {
    setSort((prev) => ({
      key,
      dir: prev.key === key && prev.dir === 'desc' ? 'asc' : 'desc',
    }))
  }

  const sorted = useMemo(() => {
    if (!sort.key) return items
    return [...items].sort((a, b) => {
      const av = a[sort.key]
      const bv = b[sort.key]
      if (av == null) return 1
      if (bv == null) return -1
      if (typeof av === 'number' && typeof bv === 'number') {
        return sort.dir === 'desc' ? bv - av : av - bv
      }
      const cmp = String(av).localeCompare(String(bv), 'id')
      return sort.dir === 'desc' ? -cmp : cmp
    })
  }, [items, sort])

  return { sorted, sort, toggle }
}
