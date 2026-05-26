import { createContext, useContext, useState, useCallback, useMemo, useEffect, useRef, type ReactNode } from 'react'
import type { Expense } from '../types'
import { useAuth } from './AuthContext'
import { subscribeItems, saveItems } from '../lib/firestore'
import { showToast } from '../lib/toastBus'

interface ExpenseContextType {
  expenses: Expense[]
  addExpense: (expense: Omit<Expense, 'id' | 'tanggal'>) => void
  updateExpense: (id: string, data: Partial<Omit<Expense, 'id'>>) => void
  deleteExpense: (id: string) => void
  clearExpenses: () => void
  totalExpense: number
  averageMonthlyExpense: number
  currentMonthExpense: number
  expensesLoaded: boolean
}

const ExpenseContext = createContext<ExpenseContextType | null>(null)

export function ExpenseProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const uid = user?.uid
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [expensesLoaded, setExpensesLoaded] = useState(false)
  const unsubRef = useRef<(() => void) | null>(null)
  const prevDataRef = useRef<Expense[]>([])
  const initialLoadDoneRef = useRef(false)

  useEffect(() => {
    if (unsubRef.current) { unsubRef.current(); unsubRef.current = null }
    if (!uid) { setExpenses([]); setExpensesLoaded(true); return }
    setExpensesLoaded(false)
    initialLoadDoneRef.current = false
    prevDataRef.current = []
    unsubRef.current = subscribeItems<Expense>('expenses', uid, (data) => {
      setExpenses(data)
      if (initialLoadDoneRef.current) {
        const prevIds = new Set(prevDataRef.current.map((i) => i.id))
        const newItems = data.filter((i) => !prevIds.has(i.id))
        for (const item of newItems) {
          showToast(`Pengeluaran: Rp ${item.jumlah.toLocaleString('id-ID')} — ${item.keterangan}`)
        }
      } else {
        initialLoadDoneRef.current = true
        setExpensesLoaded(true)
      }
      prevDataRef.current = data
    })
    return () => { if (unsubRef.current) { unsubRef.current(); unsubRef.current = null } }
  }, [uid])

  const persist = useCallback((next: Expense[]) => {
    if (!uid) return
    setExpenses(next)
    prevDataRef.current = next
    saveItems('expenses', uid, next).then(() => showToast('Data pengeluaran telah disimpan'))
  }, [uid])

  const addExpense = useCallback((expense: Omit<Expense, 'id' | 'tanggal'>) => {
    const newItem: Expense = { ...expense, id: Date.now().toString(36) + Math.random().toString(36).slice(2, 9), tanggal: new Date().toISOString().split('T')[0] }
    persist([newItem, ...expenses])
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

  return <ExpenseContext.Provider value={{ expenses, addExpense, updateExpense, deleteExpense, clearExpenses, totalExpense, averageMonthlyExpense, currentMonthExpense, expensesLoaded }}>{children}</ExpenseContext.Provider>
}

export function useExpense() {
  const ctx = useContext(ExpenseContext)
  if (!ctx) throw new Error('useExpense must be used within ExpenseProvider')
  return ctx
}
