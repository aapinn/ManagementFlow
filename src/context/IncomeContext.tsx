import { createContext, useContext, useState, useCallback, useMemo, useEffect, useRef, type ReactNode } from 'react'
import type { Income } from '../types'
import { useAuth } from './AuthContext'
import { subscribeItems, saveItems } from '../lib/firestore'
import { showToast } from '../lib/toastBus'

interface IncomeContextType {
  incomes: Income[]
  addIncome: (income: Omit<Income, 'id' | 'tanggal'>) => void
  updateIncome: (id: string, data: Partial<Omit<Income, 'id'>>) => void
  deleteIncome: (id: string) => void
  clearIncomes: () => void
  totalIncome: number
  incomesLoaded: boolean
}

const IncomeContext = createContext<IncomeContextType | null>(null)

export function IncomeProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const uid = user?.uid
  const [incomes, setIncomes] = useState<Income[]>([])
  const [incomesLoaded, setIncomesLoaded] = useState(false)
  const unsubRef = useRef<(() => void) | null>(null)
  const prevDataRef = useRef<Income[]>([])
  const initialLoadDoneRef = useRef(false)
  const uidRef = useRef(uid)

  useEffect(() => {
    uidRef.current = uid
    if (unsubRef.current) { unsubRef.current(); unsubRef.current = null }
    if (!uid) { setIncomes([]); setIncomesLoaded(true); return }
    setIncomesLoaded(false)
    initialLoadDoneRef.current = false
    prevDataRef.current = []
    unsubRef.current = subscribeItems<Income>('incomes', uid, (data) => {
      setIncomes(data)
      if (initialLoadDoneRef.current) {
        const prevIds = new Set(prevDataRef.current.map((i) => i.id))
        const newItems = data.filter((i) => !prevIds.has(i.id))
        for (const item of newItems) {
          showToast(`Pemasukan: Rp ${item.jumlah.toLocaleString('id-ID')} — ${item.keterangan}`)
        }
      } else {
        initialLoadDoneRef.current = true
        setIncomesLoaded(true)
      }
      prevDataRef.current = data
    })
    return () => { if (unsubRef.current) { unsubRef.current(); unsubRef.current = null } }
  }, [uid])

  const persist = useCallback((next: Income[]) => {
    if (!uid) return
    setIncomes(next)
    prevDataRef.current = next
    saveItems('incomes', uid, next).then(() => showToast('Data pemasukan telah disimpan'))
  }, [uid])

  const addIncome = useCallback((income: Omit<Income, 'id' | 'tanggal'>) => {
    const newItem: Income = { ...income, id: Date.now().toString(36) + Math.random().toString(36).slice(2, 9), tanggal: new Date().toISOString().split('T')[0] }
    persist([newItem, ...incomes])
  }, [incomes, persist])

  const updateIncome = useCallback((id: string, data: Partial<Omit<Income, 'id'>>) => {
    persist(incomes.map((i) => (i.id === id ? { ...i, ...data } : i)))
  }, [incomes, persist])

  const deleteIncome = useCallback((id: string) => {
    persist(incomes.filter((i) => i.id !== id))
  }, [incomes, persist])

  const clearIncomes = useCallback(() => persist([]), [persist])

  const totalIncome = useMemo(() => incomes.reduce((s, i) => s + i.jumlah, 0), [incomes])

  return <IncomeContext.Provider value={{ incomes, addIncome, updateIncome, deleteIncome, clearIncomes, totalIncome, incomesLoaded }}>{children}</IncomeContext.Provider>
}

export function useIncome() {
  const ctx = useContext(IncomeContext)
  if (!ctx) throw new Error('useIncome must be used within IncomeProvider')
  return ctx
}
