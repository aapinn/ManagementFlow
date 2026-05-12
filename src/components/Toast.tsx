import { useState, useEffect } from 'react'
import { useToast } from '../context/ToastContext'

function ToastItem({ id, message, type }: { id: string; message: string; type: 'success' | 'error' | 'info' | 'warning' }) {
  const [exiting, setExiting] = useState(false)
  const { removeToast } = useToast()
  const duration = 3000
  const [progress, setProgress] = useState(100)

  useEffect(() => {
    const start = Date.now()
    const tick = () => {
      const elapsed = Date.now() - start
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100)
      setProgress(remaining)
      if (elapsed < duration) requestAnimationFrame(tick)
    }
    const frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => setExiting(true), duration)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (exiting) {
      const t = setTimeout(() => removeToast(id), 300)
      return () => clearTimeout(t)
    }
  }, [exiting, id, removeToast])

  return (
    <div className={`toast toast--${type}${exiting ? ' toast--exit' : ''}`}>
      <span className="toast-icon">
        {type === 'success' ? '✓' : type === 'error' ? '✕' : type === 'warning' ? '⚠' : 'ℹ'}
      </span>
      <span className="toast-msg">{message}</span>
      <button className="toast-close" onClick={() => setExiting(true)}>&times;</button>
      <div className="toast-progress-track">
        <div className="toast-progress-fill" style={{ width: `${progress}%` }} />
      </div>
    </div>
  )
}

export default function ToastContainer() {
  const { toasts } = useToast()

  if (toasts.length === 0) return null

  return (
    <div className="toast-container">
      {toasts.map((t) => (
        <ToastItem key={t.id} id={t.id} message={t.message} type={t.type} />
      ))}
    </div>
  )
}
