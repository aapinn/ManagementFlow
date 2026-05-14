import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react'
import type { RecurringIncome } from '../types'
import { useAuth } from './AuthContext'
import { loadItems, saveItems } from '../lib/firestore'

interface RecurringIncomeContextType {
  recurringIncomes: RecurringIncome[]
  addRecurringIncome: (r: Omit<RecurringIncome, 'id' | 'aktif' | 'lastGenerated'>) => void
  updateRecurringIncome: (id: string, data: Partial<Omit<RecurringIncome, 'id'>>) => void
  deleteRecurringIncome: (id: string) => void
  recurringIncomesLoaded: boolean
}

const RecurringIncomeContext = createContext<RecurringIncomeContextType | null>(null)

export function RecurringIncomeProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const uid = user?.uid
  const [recurringIncomes, setRecurringIncomes] = useState<RecurringIncome[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    if (!uid) { setRecurringIncomes([]); setLoaded(true); return }
    setLoaded(false)
    loadItems<RecurringIncome>('recurringIncomes', uid).then((data) => {
      setRecurringIncomes(data)
      setLoaded(true)
    })
  }, [uid])

  const persist = useCallback((next: RecurringIncome[]) => {
    if (!uid) return
    setRecurringIncomes(next)
    saveItems('recurringIncomes', uid, next)
  }, [uid])

  const addRecurringIncome = useCallback((r: Omit<RecurringIncome, 'id' | 'aktif' | 'lastGenerated'>) => {
    const newItem: RecurringIncome = {
      ...r,
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 9),
      aktif: true,
    }
    persist([newItem, ...recurringIncomes])
  }, [recurringIncomes, persist])

  const updateRecurringIncome = useCallback((id: string, data: Partial<Omit<RecurringIncome, 'id'>>) => {
    persist(recurringIncomes.map((r) => (r.id === id ? { ...r, ...data } : r)))
  }, [recurringIncomes, persist])

  const deleteRecurringIncome = useCallback((id: string) => {
    persist(recurringIncomes.filter((r) => r.id !== id))
  }, [recurringIncomes, persist])

  return (
    <RecurringIncomeContext.Provider value={{ recurringIncomes, addRecurringIncome, updateRecurringIncome, deleteRecurringIncome, recurringIncomesLoaded: loaded }}>
      {children}
    </RecurringIncomeContext.Provider>
  )
}

export function useRecurringIncome() {
  const ctx = useContext(RecurringIncomeContext)
  if (!ctx) throw new Error('useRecurringIncome must be used within RecurringIncomeProvider')
  return ctx
}
