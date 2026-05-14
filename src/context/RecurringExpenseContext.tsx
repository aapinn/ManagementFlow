import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react'
import type { RecurringExpense } from '../types'
import { useAuth } from './AuthContext'
import { loadItems, saveItems } from '../lib/firestore'

interface RecurringExpenseContextType {
  recurringExpenses: RecurringExpense[]
  addRecurringExpense: (r: Omit<RecurringExpense, 'id' | 'aktif' | 'lastGenerated'>) => void
  updateRecurringExpense: (id: string, data: Partial<Omit<RecurringExpense, 'id'>>) => void
  deleteRecurringExpense: (id: string) => void
  recurringExpensesLoaded: boolean
}

const RecurringExpenseContext = createContext<RecurringExpenseContextType | null>(null)

export function RecurringExpenseProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const uid = user?.uid
  const [recurringExpenses, setRecurringExpenses] = useState<RecurringExpense[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    if (!uid) { setRecurringExpenses([]); setLoaded(true); return }
    setLoaded(false)
    loadItems<RecurringExpense>('recurringExpenses', uid).then((data) => {
      setRecurringExpenses(data)
      setLoaded(true)
    })
  }, [uid])

  const persist = useCallback((next: RecurringExpense[]) => {
    if (!uid) return
    setRecurringExpenses(next)
    saveItems('recurringExpenses', uid, next)
  }, [uid])

  const addRecurringExpense = useCallback((r: Omit<RecurringExpense, 'id' | 'aktif' | 'lastGenerated'>) => {
    const newItem: RecurringExpense = {
      ...r,
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 9),
      aktif: true,
    }
    persist([newItem, ...recurringExpenses])
  }, [recurringExpenses, persist])

  const updateRecurringExpense = useCallback((id: string, data: Partial<Omit<RecurringExpense, 'id'>>) => {
    persist(recurringExpenses.map((r) => (r.id === id ? { ...r, ...data } : r)))
  }, [recurringExpenses, persist])

  const deleteRecurringExpense = useCallback((id: string) => {
    persist(recurringExpenses.filter((r) => r.id !== id))
  }, [recurringExpenses, persist])

  return (
    <RecurringExpenseContext.Provider value={{ recurringExpenses, addRecurringExpense, updateRecurringExpense, deleteRecurringExpense, recurringExpensesLoaded: loaded }}>
      {children}
    </RecurringExpenseContext.Provider>
  )
}

export function useRecurringExpense() {
  const ctx = useContext(RecurringExpenseContext)
  if (!ctx) throw new Error('useRecurringExpense must be used within RecurringExpenseProvider')
  return ctx
}
