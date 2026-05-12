import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react'
import type { Budget } from '../types'
import { useAuth } from './AuthContext'

interface BudgetContextType {
  budgets: Budget[]
  setBudget: (month: string, kategori: string, amount: number) => void
  removeBudget: (id: string) => void
  getBudget: (month: string, kategori: string) => number
}

const BudgetContext = createContext<BudgetContextType | null>(null)

export function BudgetProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const uid = user?.uid
  const [budgets, setBudgets] = useState<Budget[]>([])

  useEffect(() => {
    if (!uid) { setBudgets([]); return }
    const stored = localStorage.getItem(`budgets_${uid}`)
    setBudgets(stored ? JSON.parse(stored) : [])
  }, [uid])

  const handleSetBudget = useCallback((month: string, kategori: string, amount: number) => {
    setBudgets((prev) => {
      const existing = prev.find((b) => b.month === month && b.kategori === kategori)
      let next: Budget[]
      if (existing) {
        next = prev.map((b) => (b.id === existing.id ? { ...b, amount } : b))
      } else {
        next = [...prev, { id: crypto.randomUUID(), month, kategori, amount }]
      }
      if (uid) localStorage.setItem(`budgets_${uid}`, JSON.stringify(next))
      return next
    })
  }, [uid])

  const removeBudget = useCallback((id: string) => {
    setBudgets((prev) => {
      const next = prev.filter((b) => b.id !== id)
      if (uid) localStorage.setItem(`budgets_${uid}`, JSON.stringify(next))
      return next
    })
  }, [uid])

  const getBudget = useCallback(
    (month: string, kategori: string) => {
      return budgets.find((b) => b.month === month && b.kategori === kategori)?.amount ?? 0
    },
    [budgets],
  )

  return (
    <BudgetContext.Provider value={{ budgets, setBudget: handleSetBudget, removeBudget, getBudget }}>
      {children}
    </BudgetContext.Provider>
  )
}

export function useBudget() {
  const ctx = useContext(BudgetContext)
  if (!ctx) throw new Error('useBudget must be used within BudgetProvider')
  return ctx
}
