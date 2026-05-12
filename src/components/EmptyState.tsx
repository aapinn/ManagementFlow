import type { ReactNode } from 'react'

interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description?: string
  action?: ReactNode
}

function IconDefault() {
  return (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-muted)', opacity: 0.5 }}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="12" y1="18" x2="12" y2="12" />
      <line x1="9" y1="15" x2="15" y2="15" />
    </svg>
  )
}

function IconChart() {
  return (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-muted)', opacity: 0.5 }}>
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
      <path d="M2 20h20" />
    </svg>
  )
}

function IconTarget() {
  return (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-muted)', opacity: 0.5 }}>
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  )
}

function IconWallet() {
  return (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-muted)', opacity: 0.5 }}>
      <rect x="1" y="6" width="22" height="14" rx="2" ry="2" />
      <path d="M16 12a2 2 0 1 1 4 0 2 2 0 0 1-4 0z" />
      <path d="M5 6V4a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v2" />
    </svg>
  )
}

export default function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="empty-state" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: '48px 24px' }}>
      {icon}
      <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-muted)' }}>{title}</div>
      {description && <div style={{ fontSize: 12, color: 'var(--text-muted)', maxWidth: 280, lineHeight: 1.5 }}>{description}</div>}
      {action && <div style={{ marginTop: 4 }}>{action}</div>}
    </div>
  )
}

export const EMPTY_ICONS = {
  default: <IconDefault />,
  chart: <IconChart />,
  target: <IconTarget />,
  wallet: <IconWallet />,
}
