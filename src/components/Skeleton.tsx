import type { ReactNode, CSSProperties } from 'react'

interface SkeletonLineProps {
  width?: string
  height?: string
  style?: CSSProperties
}

export function SkeletonLine({ width = '100%', height = '12px', style }: SkeletonLineProps) {
  return <div className="skeleton-line" style={{ width, height, borderRadius: '6px', ...style }} />
}

export function SkeletonBlock({ height = '80px', style }: { height?: string; style?: CSSProperties }) {
  return <div className="skeleton-block" style={{ height, borderRadius: 'var(--radius-sm)', ...style }} />
}

export function SkeletonCircle({ size = '40px' }: { size?: string }) {
  return <div className="skeleton-circle" style={{ width: size, height: size }} />
}

export function SkeletonCard({ children, style }: { children?: ReactNode; style?: CSSProperties }) {
  return <div className="skeleton-card" style={style}>{children}</div>
}

export function SkeletonStat() {
  return (
    <div className="skeleton-stat">
      <SkeletonLine width="60%" height="10px" />
      <SkeletonLine width="80%" height="22px" style={{ marginTop: 6 }} />
      <SkeletonLine width="40%" height="10px" style={{ marginTop: 4 }} />
    </div>
  )
}

export function SkeletonTable({ rows = 4 }: { rows?: number }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', gap: 16 }}>
        <SkeletonLine width="20%" height="12px" />
        <SkeletonLine width="25%" height="12px" />
        <SkeletonLine width="15%" height="12px" />
        <SkeletonLine width="15%" height="12px" />
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} style={{ display: 'flex', gap: 16 }}>
          <SkeletonLine width="20%" height="14px" />
          <SkeletonLine width="25%" height="14px" />
          <SkeletonLine width="15%" height="14px" />
          <SkeletonLine width="15%" height="14px" />
        </div>
      ))}
    </div>
  )
}
