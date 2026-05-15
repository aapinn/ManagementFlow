import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react'
import { setShowToast } from '../lib/toastBus'

interface Toast {
  id: string
  message: string
  type: 'success' | 'error' | 'info' | 'warning'
  createdAt: number
}

interface ToastContextType {
  toasts: Toast[]
  showToast: (message: string, type?: Toast['type']) => void
  removeToast: (id: string) => void
}

const ToastContext = createContext<ToastContextType | null>(null)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const showToast = useCallback((message: string, type: Toast['type'] = 'success') => {
    const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 9)
    setToasts((prev) => [...prev, { id, message, type, createdAt: Date.now() }])
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  useEffect(() => {
    setShowToast(showToast)
  }, [showToast])

  return (
    <ToastContext.Provider value={{ toasts, showToast, removeToast }}>
      {children}
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
