import { createContext, useContext, useState, useCallback, useMemo, useEffect, type ReactNode } from 'react'
import type { Expense } from '../types'
import { useAuth } from './AuthContext'

interface ExpenseContextType {
  expenses: Expense[]
  addExpense: (expense: Omit<Expense, 'id' | 'tanggal'>) => void
  updateExpense: (id: string, data: Partial<Omit<Expense, 'id'>>) => void
  deleteExpense: (id: string) => void
  clearExpenses: () => void
  totalExpense: number
  averageMonthlyExpense: number
  currentMonthExpense: number
}

const ExpenseContext = createContext<ExpenseContextType | null>(null)

export function ExpenseProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const uid = user?.uid
  const [expenses, setExpenses] = useState<Expense[]>([])

  useEffect(() => {
    if (!uid) { setExpenses([]); return }
    const stored = localStorage.getItem(`expenses_${uid}`)
    setExpenses(stored ? JSON.parse(stored) : [])
  }, [uid])

  const persist = useCallback((next: Expense[]) => {
    if (!uid) return
    setExpenses(next)
    localStorage.setItem(`expenses_${uid}`, JSON.stringify(next))
  }, [uid])

  const addExpense = useCallback((expense: Omit<Expense, 'id' | 'tanggal'>) => {
    persist([{ ...expense, id: Date.now().toString(36) + Math.random().toString(36).slice(2, 9), tanggal: new Date().toISOString().split('T')[0] }, ...expenses])
  }, [expenses, persist])

  const updateExpense = useCallback((id: string, data: Partial<Omit<Expense, 'id'>>) => {
    persist(expenses.map((e) => (e.id === id ? { ...e, ...data } : e)))
  }, [expenses, persist])

  const deleteExpense = useCallback((id: string) => {
    persist(expenses.filter((e) => e.id !== id))
  }, [expenses, persist])

  const clearExpenses = useCallback(() => persist([]), [persist])

  const totalExpense = useMemo(() => expenses.reduce((s, e) => s + e.jumlah, 0), [expenses])

  const currentMonth = new Date().toISOString().slice(0, 7)

  const currentMonthExpense = useMemo(
    () => expenses.filter((e) => e.tanggal.startsWith(currentMonth)).reduce((s, e) => s + e.jumlah, 0),
    [expenses, currentMonth],
  )

  const averageMonthlyExpense = useMemo(() => {
    const byMonth: Record<string, number> = {}
    for (const e of expenses) {
      const m = e.tanggal.slice(0, 7)
      byMonth[m] = (byMonth[m] || 0) + e.jumlah
    }
    const months = Object.keys(byMonth)
    if (months.length === 0) return 0
    return months.reduce((sum, m) => sum + byMonth[m], 0) / months.length
  }, [expenses])

  return <ExpenseContext.Provider value={{ expenses, addExpense, updateExpense, deleteExpense, clearExpenses, totalExpense, averageMonthlyExpense, currentMonthExpense }}>{children}</ExpenseContext.Provider>
}

export function useExpense() {
  const ctx = useContext(ExpenseContext)
  if (!ctx) throw new Error('useExpense must be used within ExpenseProvider')
  return ctx
}
