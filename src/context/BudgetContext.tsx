import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react'
import type { Budget } from '../types'
import { useAuth } from './AuthContext'
import { loadItems, saveItems } from '../lib/firestore'
import { showToast } from '../lib/toastBus'

interface BudgetContextType {
  budgets: Budget[]
  setBudget: (month: string, kategori: string, amount: number) => void
  removeBudget: (id: string) => void
  getBudget: (month: string, kategori: string) => number
  budgetsLoaded: boolean
}

const BudgetContext = createContext<BudgetContextType | null>(null)

export function BudgetProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const uid = user?.uid
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    if (!uid) { setBudgets([]); setLoaded(true); return }
    setLoaded(false)
    loadItems<Budget>('budgets', uid).then((data) => {
      setBudgets(data)
      setLoaded(true)
    })
  }, [uid])

  const persist = useCallback((next: Budget[]) => {
    if (!uid) return
    setBudgets(next)
    saveItems('budgets', uid, next).then(() => showToast('Data budget telah disimpan'))
  }, [uid])

  const handleSetBudget = useCallback((month: string, kategori: string, amount: number) => {
    const existing = budgets.find((b) => b.month === month && b.kategori === kategori)
    let next: Budget[]
    if (existing) {
      next = budgets.map((b) => (b.id === existing.id ? { ...b, amount } : b))
    } else {
      next = [...budgets, { id: crypto.randomUUID(), month, kategori, amount }]
    }
    persist(next)
  }, [budgets, persist])

  const removeBudget = useCallback((id: string) => {
    persist(budgets.filter((b) => b.id !== id))
  }, [budgets, persist])

  const getBudget = useCallback(
    (month: string, kategori: string) => {
      return budgets.find((b) => b.month === month && b.kategori === kategori)?.amount ?? 0
    },
    [budgets],
  )

  return (
    <BudgetContext.Provider value={{ budgets, setBudget: handleSetBudget, removeBudget, getBudget, budgetsLoaded: loaded }}>
      {children}
    </BudgetContext.Provider>
  )
}

export function useBudget() {
  const ctx = useContext(BudgetContext)
  if (!ctx) throw new Error('useBudget must be used within BudgetProvider')
  return ctx
}
