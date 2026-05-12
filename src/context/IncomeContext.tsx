import { createContext, useContext, useState, useCallback, useMemo, useEffect, type ReactNode } from 'react'
import type { Income } from '../types'
import { useAuth } from './AuthContext'

interface IncomeContextType {
  incomes: Income[]
  addIncome: (income: Omit<Income, 'id' | 'tanggal'>) => void
  updateIncome: (id: string, data: Partial<Omit<Income, 'id'>>) => void
  deleteIncome: (id: string) => void
  clearIncomes: () => void
  totalIncome: number
}

const IncomeContext = createContext<IncomeContextType | null>(null)

export function IncomeProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const uid = user?.uid
  const [incomes, setIncomes] = useState<Income[]>([])

  useEffect(() => {
    if (!uid) { setIncomes([]); return }
    const stored = localStorage.getItem(`incomes_${uid}`)
    setIncomes(stored ? JSON.parse(stored) : [])
  }, [uid])

  const persist = useCallback((next: Income[]) => {
    if (!uid) return
    setIncomes(next)
    localStorage.setItem(`incomes_${uid}`, JSON.stringify(next))
  }, [uid])

  const addIncome = useCallback((income: Omit<Income, 'id' | 'tanggal'>) => {
    persist([{ ...income, id: Date.now().toString(36) + Math.random().toString(36).slice(2, 9), tanggal: new Date().toISOString().split('T')[0] }, ...incomes])
  }, [incomes, persist])

  const updateIncome = useCallback((id: string, data: Partial<Omit<Income, 'id'>>) => {
    persist(incomes.map((i) => (i.id === id ? { ...i, ...data } : i)))
  }, [incomes, persist])

  const deleteIncome = useCallback((id: string) => {
    persist(incomes.filter((i) => i.id !== id))
  }, [incomes, persist])

  const clearIncomes = useCallback(() => persist([]), [persist])

  const totalIncome = useMemo(() => incomes.reduce((s, i) => s + i.jumlah, 0), [incomes])

  return <IncomeContext.Provider value={{ incomes, addIncome, updateIncome, deleteIncome, clearIncomes, totalIncome }}>{children}</IncomeContext.Provider>
}

export function useIncome() {
  const ctx = useContext(IncomeContext)
  if (!ctx) throw new Error('useIncome must be used within IncomeProvider')
  return ctx
}
