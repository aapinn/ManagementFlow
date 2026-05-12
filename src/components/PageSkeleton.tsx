import { SkeletonLine, SkeletonBlock, SkeletonCircle, SkeletonStat, SkeletonTable, SkeletonCard } from './Skeleton'

function PageHeaderSkeleton() {
  return (
    <div className="page-header">
      <div>
        <SkeletonLine width="160px" height="22px" />
        <SkeletonLine width="240px" height="12px" style={{ marginTop: 6 }} />
      </div>
      <SkeletonBlock height="36px" style={{ width: 120, flexShrink: 0 }} />
    </div>
  )
}

export function DashboardSkeleton() {
  return (
    <div className="page page-animate">
      <div className="page-header">
        <div>
          <SkeletonLine width="160px" height="22px" />
          <SkeletonLine width="240px" height="12px" style={{ marginTop: 6 }} />
        </div>
      </div>

      <div className="stats-row">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonCard key={i}><SkeletonStat /></SkeletonCard>
        ))}
      </div>

      <SkeletonCard>
        <SkeletonLine width="120px" height="14px" style={{ marginBottom: 20 }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 32, justifyContent: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <SkeletonCircle size="64px" />
            <SkeletonLine width="80px" height="10px" />
            <SkeletonLine width="100px" height="14px" />
          </div>
          <SkeletonLine width="48px" height="2px" />
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <SkeletonCircle size="64px" />
            <SkeletonLine width="80px" height="10px" />
            <SkeletonLine width="100px" height="14px" />
          </div>
          <SkeletonLine width="48px" height="2px" />
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <SkeletonCircle size="64px" />
            <SkeletonLine width="80px" height="10px" />
            <SkeletonLine width="100px" height="14px" />
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 24, paddingTop: 20, borderTop: '1px solid var(--border-light)' }}>
          <SkeletonLine width="100px" height="12px" />
          <SkeletonLine width="100%" height="4px" />
          <SkeletonLine width="40px" height="12px" />
        </div>
      </SkeletonCard>

      <div className="grid-2col" style={{ marginBottom: 20 }}>
        <SkeletonCard>
          <SkeletonLine width="80px" height="14px" style={{ marginBottom: 16 }} />
          <SkeletonLine width="100%" height="14px" />
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
            <SkeletonLine width="60%" height="20px" />
            <SkeletonLine width="40px" height="14px" />
          </div>
          <SkeletonLine width="100%" height="14px" style={{ marginTop: 14 }} />
          <SkeletonLine width="60%" height="20px" style={{ marginTop: 8 }} />
        </SkeletonCard>
        <SkeletonCard>
          <SkeletonLine width="90px" height="14px" style={{ marginBottom: 16 }} />
          <SkeletonBlock height="200px" />
        </SkeletonCard>
      </div>

      <SkeletonCard>
        <SkeletonLine width="120px" height="14px" style={{ marginBottom: 16 }} />
        <SkeletonTable rows={3} />
      </SkeletonCard>
    </div>
  )
}

export function ListPageSkeleton() {
  return (
    <div className="page page-animate">
      <PageHeaderSkeleton />
      <div className="grid-2col" style={{ marginBottom: 20 }}>
        <SkeletonCard>
          <SkeletonLine width="100px" height="14px" style={{ marginBottom: 16 }} />
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonLine key={i} width={`${60 + i * 10}%`} height="36px" style={{ marginBottom: 12 }} />
          ))}
          <SkeletonBlock height="36px" style={{ width: 100, marginTop: 4 }} />
        </SkeletonCard>
        <SkeletonCard>
          <SkeletonLine width="120px" height="14px" style={{ marginBottom: 16 }} />
          <SkeletonBlock height="260px" />
        </SkeletonCard>
      </div>
      <SkeletonCard>
        <SkeletonLine width="100px" height="14px" style={{ marginBottom: 16 }} />
        <SkeletonTable rows={4} />
      </SkeletonCard>
    </div>
  )
}

export function LaporanSkeleton() {
  return (
    <div className="page page-animate">
      <PageHeaderSkeleton />
      <div className="stats-row">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonCard key={i}><SkeletonStat /></SkeletonCard>
        ))}
      </div>
      <div className="grid-2col" style={{ marginBottom: 20 }}>
        <SkeletonCard>
          <SkeletonLine width="120px" height="14px" style={{ marginBottom: 16 }} />
          <SkeletonBlock height="260px" />
        </SkeletonCard>
        <SkeletonCard>
          <SkeletonLine width="140px" height="14px" style={{ marginBottom: 16 }} />
          <SkeletonBlock height="260px" />
        </SkeletonCard>
      </div>
      <SkeletonCard>
        <SkeletonLine width="100px" height="14px" style={{ marginBottom: 16 }} />
        <SkeletonTable rows={3} />
      </SkeletonCard>
    </div>
  )
}

export function BudgetSkeleton() {
  return (
    <div className="page page-animate">
      <PageHeaderSkeleton />
      <SkeletonCard>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} style={{ padding: '12px 0', borderBottom: i < 4 ? '1px solid var(--border-light)' : 'none' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <SkeletonLine width="100px" height="14px" />
              <SkeletonLine width="160px" height="14px" />
            </div>
            <SkeletonLine width="100%" height="6px" />
          </div>
        ))}
      </SkeletonCard>
    </div>
  )
}

export function GoalsSkeleton() {
  return (
    <div className="page page-animate">
      <PageHeaderSkeleton />
      <div className="goals-grid">
        {Array.from({ length: 3 }).map((_, i) => (
          <SkeletonCard key={i}>
            <div style={{ display: 'flex', gap: 16 }}>
              <SkeletonCircle size="40px" />
              <div style={{ flex: 1 }}>
                <SkeletonLine width="60%" height="14px" />
                <SkeletonLine width="100%" height="6px" style={{ marginTop: 10 }} />
                <SkeletonLine width="50%" height="12px" style={{ marginTop: 8 }} />
              </div>
            </div>
          </SkeletonCard>
        ))}
      </div>
    </div>
  )
}

export function ProfileSkeleton() {
  return (
    <div className="page page-animate">
      <div className="page-header">
        <div>
          <SkeletonLine width="160px" height="22px" />
          <SkeletonLine width="240px" height="12px" style={{ marginTop: 6 }} />
        </div>
      </div>
      <div className="profile-hero">
        <SkeletonCircle size="64px" />
        <div>
          <SkeletonLine width="140px" height="18px" />
          <SkeletonLine width="180px" height="12px" style={{ marginTop: 4 }} />
        </div>
      </div>
      <div className="tabs">
        <SkeletonBlock height="34px" style={{ width: 80, borderRadius: '6px' }} />
        <SkeletonBlock height="34px" style={{ width: 100, borderRadius: '6px' }} />
      </div>
      <SkeletonCard style={{ maxWidth: 520 }}>
        <SkeletonLine width="120px" height="14px" style={{ marginBottom: 16 }} />
        <SkeletonLine width="100%" height="36px" style={{ marginBottom: 12 }} />
        <SkeletonLine width="100%" height="36px" style={{ marginBottom: 12 }} />
        <SkeletonBlock height="36px" style={{ width: 140 }} />
      </SkeletonCard>
    </div>
  )
}
