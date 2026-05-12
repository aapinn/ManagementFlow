import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react'
import type { Goal } from '../types'
import { useAuth } from './AuthContext'

interface GoalContextType {
  goals: Goal[]
  addGoal: (g: Omit<Goal, 'id' | 'createdAt'>) => void
  updateGoal: (id: string, data: Partial<Omit<Goal, 'id'>>) => void
  deleteGoal: (id: string) => void
  addToGoal: (id: string, amount: number) => void
}

const GoalContext = createContext<GoalContextType | null>(null)

export function GoalProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const uid = user?.uid
  const [goals, setGoals] = useState<Goal[]>([])

  useEffect(() => {
    if (!uid) { setGoals([]); return }
    const stored = localStorage.getItem(`goals_${uid}`)
    setGoals(stored ? JSON.parse(stored) : [])
  }, [uid])

  const persist = useCallback((next: Goal[]) => {
    if (!uid) return
    setGoals(next)
    localStorage.setItem(`goals_${uid}`, JSON.stringify(next))
  }, [uid])

  const addGoal = useCallback((g: Omit<Goal, 'id' | 'createdAt'>) => {
    const newGoal: Goal = { ...g, id: Date.now().toString(36) + Math.random().toString(36).slice(2, 9), createdAt: new Date().toISOString().split('T')[0] }
    persist([newGoal, ...goals])
  }, [goals, persist])

  const updateGoal = useCallback((id: string, data: Partial<Omit<Goal, 'id'>>) => {
    persist(goals.map((g) => (g.id === id ? { ...g, ...data } : g)))
  }, [goals, persist])

  const deleteGoal = useCallback((id: string) => {
    persist(goals.filter((g) => g.id !== id))
  }, [goals, persist])

  const addToGoal = useCallback((id: string, amount: number) => {
    persist(goals.map((g) => (g.id === id ? { ...g, currentAmount: g.currentAmount + amount } : g)))
  }, [goals, persist])

  return <GoalContext.Provider value={{ goals, addGoal, updateGoal, deleteGoal, addToGoal }}>{children}</GoalContext.Provider>
}

export function useGoal() {
  const ctx = useContext(GoalContext)
  if (!ctx) throw new Error('useGoal must be used within GoalProvider')
  return ctx
}
