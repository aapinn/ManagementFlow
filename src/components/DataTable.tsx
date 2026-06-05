import { useState, useMemo, useEffect, type ReactNode } from 'react'

export interface Column<T> {
  key: string
  label: string
  sortable?: boolean
  hideOnMobile?: boolean
  render: (item: T) => ReactNode
}

interface DataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  onEdit?: (item: T) => void
  onDelete?: (item: T) => void
  emptyTitle?: string
  emptyDescription?: string
  getRowId: (item: T) => string
  pageSize?: number
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function DataTable<T>({
  data,
  columns,
  onEdit,
  onDelete,
  emptyTitle = 'Belum ada data',
  emptyDescription = '',
  getRowId,
  pageSize = 15,
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState('')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const [page, setPage] = useState(0)

  useEffect(() => { setPage(0) }, [data.length])

  const toggleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'desc' ? 'asc' : 'desc'))
    } else {
      setSortKey(key)
      setSortDir('desc')
    }
  }

  const sorted = useMemo(() => {
    if (!sortKey) return data
    return [...data].sort((a, b) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const av = (a as any)[sortKey]
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const bv = (b as any)[sortKey]
      if (av == null) return 1
      if (bv == null) return -1
      if (typeof av === 'number' && typeof bv === 'number') {
        return sortDir === 'desc' ? bv - av : av - bv
      }
      const cmp = String(av).localeCompare(String(bv), 'id')
      return sortDir === 'desc' ? -cmp : cmp
    })
  }, [data, sortKey, sortDir])

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize))
  const offset = page * pageSize
  const paged = sorted.slice(offset, offset + pageSize)

  const sortIcon = (key: string) => {
    if (sortKey !== key) return ' ↕'
    return sortDir === 'asc' ? ' ↑' : ' ↓'
  }

  function Pagination() {
    if (sorted.length <= pageSize) return null
    return (
      <div className="datatable-pagination">
        <button className="btn btn-sm" disabled={page === 0} onClick={() => setPage(page - 1)}>← Sebelumnya</button>
        <span className="datatable-pagination-info">{page + 1} / {totalPages}</span>
        <button className="btn btn-sm" disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)}>Berikutnya →</button>
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="datatable-empty">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.3 }}>
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
        </svg>
        <div className="datatable-empty-title">{emptyTitle}</div>
        {emptyDescription && <div className="datatable-empty-desc">{emptyDescription}</div>}
      </div>
    )
  }

  return (
    <>
      {/* Desktop table view */}
      <div className="datatable-wrapper">
        <table className="datatable">
          <thead>
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={col.hideOnMobile ? 'hide-mobile' : ''}
                  style={{ cursor: col.sortable ? 'pointer' : 'default', userSelect: 'none' }}
                  onClick={() => col.sortable && toggleSort(col.key)}
                >
                  {col.label}
                  {col.sortable && <span className="datatable-sort-icon">{sortIcon(col.key)}</span>}
                </th>
              ))}
              {(onEdit || onDelete) && <th className="datatable-actions-th">Aksi</th>}
            </tr>
          </thead>
          <tbody>
            {paged.map((item) => (
              <tr key={getRowId(item)}>
                {columns.map((col) => (
                  <td key={col.key} className={col.hideOnMobile ? 'hide-mobile' : ''}>
                    {col.render(item)}
                  </td>
                ))}
                {(onEdit || onDelete) && (
                  <td>
                    <div className="row-actions">
                      {onEdit && (
                        <button className="btn-icon" onClick={() => onEdit(item)} title="Edit">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                        </button>
                      )}
                      {onDelete && (
                        <button className="btn-icon btn-icon--danger" onClick={() => onDelete(item)} title="Hapus">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
        <Pagination />
      </div>

      {/* Mobile card view */}
      <div className="datatable-cards">
        {paged.map((item) => (
          <div key={getRowId(item)} className="datatable-card">
            {columns.filter((c) => !c.hideOnMobile).map((col) => (
              <div key={col.key} className="datatable-card-field">
                <span className="datatable-card-label">{col.label}</span>
                <span className="datatable-card-value">{col.render(item)}</span>
              </div>
            ))}
            {(onEdit || onDelete) && (
              <div className="row-actions" style={{ opacity: 1, marginTop: 8, justifyContent: 'flex-end' }}>
                {onEdit && (
                  <button className="btn-icon" onClick={() => onEdit(item)} title="Edit">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  </button>
                )}
                {onDelete && (
                  <button className="btn-icon btn-icon--danger" onClick={() => onDelete(item)} title="Hapus">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
        <Pagination />
      </div>
    </>
  )
}
