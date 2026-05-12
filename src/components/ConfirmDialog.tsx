import { useEffect } from 'react'
import { useFocusTrap } from '../hooks/useFocusTrap'

interface ConfirmDialogProps {
  open: boolean
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  danger?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Hapus',
  cancelLabel = 'Batal',
  danger = true,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const trapRef = useFocusTrap(open)

  useEffect(() => {
    if (open) {
      const handleKey = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onCancel()
      }
      document.addEventListener('keydown', handleKey)
      return () => document.removeEventListener('keydown', handleKey)
    }
  }, [open, onCancel])

  if (!open) return null

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal modal--sm" ref={trapRef} onClick={(e) => e.stopPropagation()}>
        <h3 className="modal-title">{title}</h3>
        <p className="modal-message">{message}</p>
        <div className="modal-actions">
          <button className="btn btn-outline" onClick={onCancel}>{cancelLabel}</button>
          <button className={`btn ${danger ? 'btn-danger' : 'btn-primary'}`} onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
