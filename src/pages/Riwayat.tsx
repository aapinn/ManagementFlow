import { useState, useMemo } from 'react'
import { useIncome } from '../context/IncomeContext'
import { useExpense } from '../context/ExpenseContext'
import DataTable from '../components/DataTable'
import EditModal from '../components/EditModal'
import ConfirmDialog from '../components/ConfirmDialog'
import { usePageLoading } from '../hooks/usePageLoading'
import { ListPageSkeleton } from '../components/PageSkeleton'
import { useCountUp } from '../hooks/useCountUp'
import { useToast } from '../context/ToastContext'
import { formatRp, formatDate } from '../utils/format'
import type { Income, Expense } from '../types'
import type { Column } from '../components/DataTable'

type Transaction = (Income | Expense) & { _type: 'income' | 'expense' }

function isIncome(t: Transaction): t is Transaction & Income {
  return t._type === 'income'
}

export default function Riwayat() {
  const loading = usePageLoading()
  const { incomes, totalIncome, updateIncome, deleteIncome } = useIncome()
  const { expenses, totalExpense, updateExpense, deleteExpense } = useExpense()
  const { showToast } = useToast()

  const animIncome = useCountUp(totalIncome)
  const animExpense = useCountUp(totalExpense)

  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all')
  const [filterKategori, setFilterKategori] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  const [editing, setEditing] = useState<Transaction | null>(null)
  const [deleting, setDeleting] = useState<Transaction | null>(null)

  const transactions = useMemo<Transaction[]>(() => {
    const all: Transaction[] = [
      ...incomes.map((i) => ({ ...i, _type: 'income' as const })),
      ...expenses.map((e) => ({ ...e, _type: 'expense' as const })),
    ]
    return all.sort((a, b) => b.tanggal.localeCompare(a.tanggal))
  }, [incomes, expenses])

  const filtered = useMemo(() => {
    return transactions.filter((t) => {
      if (search && !t.keterangan.toLowerCase().includes(search.toLowerCase()) && !t.idTransaksi.toLowerCase().includes(search.toLowerCase())) return false
      if (filterType !== 'all' && t._type !== filterType) return false
      if (filterKategori && t.kategori !== filterKategori) return false
      if (dateFrom && t.tanggal < dateFrom) return false
      if (dateTo && t.tanggal > dateTo) return false
      return true
    })
  }, [transactions, search, filterType, filterKategori, dateFrom, dateTo])

  const allKategori = useMemo(() => {
    const set = new Set<string>()
    transactions.forEach((t) => set.add(t.kategori))
    return [...set].sort()
  }, [transactions])

  const columns: Column<Transaction>[] = [
    {
      key: '_type',
      label: 'Tipe',
      sortable: true,
      render: (t) => (
        <span className={`riwayat-type-badge riwayat-type-badge--${t._type}`}>
          {t._type === 'income' ? 'Pemasukan' : 'Pengeluaran'}
        </span>
      ),
    },
    {
      key: 'keterangan',
      label: 'Keterangan',
      sortable: true,
      render: (t) => <span className="riwayat-keterangan">{t.keterangan}</span>,
    },
    {
      key: 'kategori',
      label: 'Kategori',
      sortable: true,
      hideOnMobile: true,
      render: (t) => <span className="cat-tag">{t.kategori}</span>,
    },
    {
      key: 'jumlah',
      label: 'Jumlah',
      sortable: true,
      render: (t) => (
        <span className={t._type === 'income' ? 'text-income' : 'text-expense'}>
          {t._type === 'income' ? '+' : '−'}{formatRp(t.jumlah)}
        </span>
      ),
    },
    {
      key: 'tanggal',
      label: 'Tanggal',
      sortable: true,
      render: (t) => <span className="riwayat-tanggal">{formatDate(t.tanggal)}</span>,
    },
    {
      key: 'idTransaksi',
      label: 'ID',
      sortable: true,
      hideOnMobile: true,
      render: (t) => <span className="riwayat-id">{t.idTransaksi}</span>,
    },
  ]

  const handleEdit = (t: Transaction) => setEditing(t)
  const handleDelete = (t: Transaction) => setDeleting(t)

  const handleSave = (data: { jumlah: number; keterangan: string; kategori: string; idTransaksi: string; tanggal: string }) => {
    if (!editing) return
    if (isIncome(editing)) {
      updateIncome(editing.id, data as Parameters<typeof updateIncome>[1])
      showToast('Pemasukan berhasil diperbarui')
    } else {
      updateExpense(editing.id, data as Parameters<typeof updateExpense>[1])
      showToast('Pengeluaran berhasil diperbarui')
    }
    setEditing(null)
  }

  const handleDeleteConfirm = () => {
    if (!deleting) return
    if (isIncome(deleting)) {
      deleteIncome(deleting.id)
      showToast('Pemasukan berhasil dihapus', 'info')
    } else {
      deleteExpense(deleting.id)
      showToast('Pengeluaran berhasil dihapus', 'info')
    }
    setDeleting(null)
  }

  if (loading) return <ListPageSkeleton />

  return (
    <div className="page page-animate" style={{ '--section-gradient': 'var(--report-gradient)' } as React.CSSProperties}>
      <div className="page-header">
        <div>
          <h1>Riwayat</h1>
          <p className="page-subtitle">Semua transaksi pemasukan & pengeluaran</p>
        </div>
        <div className="riwayat-summary">
          <span className="riwayat-summary-item">
            <span className="riwayat-summary-label">Pemasukan</span>
            <span className="riwayat-summary-value text-income">{formatRp(animIncome)}</span>
          </span>
          <span className="riwayat-summary-item">
            <span className="riwayat-summary-label">Pengeluaran</span>
            <span className="riwayat-summary-value text-expense">{formatRp(animExpense)}</span>
          </span>
        </div>
      </div>

      <div className="card" style={{ '--section-gradient': 'var(--report-gradient)' } as React.CSSProperties}>
        <div className="card-row">
          <h3 className="card-title" style={{ marginBottom: 0 }}>
            <span className="card-title-icon">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
            </span>
            Riwayat Transaksi
          </h3>
          <span className="badge badge-income">{filtered.length} transaksi</span>
        </div>

        {/* Filters */}
        <div className="search-filter">
          <div className="search-field">
            <svg className="search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input className="search-input" placeholder="Cari transaksi..." value={search} onChange={(e) => setSearch(e.target.value)} />
            {search && <button className="search-clear" onClick={() => setSearch('')}>&times;</button>}
          </div>

          <select className="filter-select" value={filterType} onChange={(e) => setFilterType(e.target.value as typeof filterType)}>
            <option value="all">Semua Tipe</option>
            <option value="income">Pemasukan</option>
            <option value="expense">Pengeluaran</option>
          </select>

          <select className="filter-select" value={filterKategori} onChange={(e) => setFilterKategori(e.target.value)}>
            <option value="">Semua Kategori</option>
            {allKategori.map((k) => <option key={k} value={k}>{k}</option>)}
          </select>

          <input className="filter-date" type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} placeholder="Dari" />
          <input className="filter-date" type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} placeholder="Sampai" />
        </div>

        <DataTable<Transaction>
          data={filtered}
          columns={columns}
          onEdit={handleEdit}
          onDelete={handleDelete}
          getRowId={(item) => item.id}
          emptyTitle="Belum ada transaksi"
          emptyDescription="Tambahkan pemasukan atau pengeluaran untuk mulai mencatat"
        />
      </div>

      <EditModal
        open={!!editing}
        transaction={editing ? (({ _type: _t, ...rest }) => rest)(editing) : null}
        type={editing && isIncome(editing) ? 'income' : 'expense'}
        onSave={handleSave}
        onClose={() => setEditing(null)}
      />
      <ConfirmDialog
        open={!!deleting}
        title="Hapus Transaksi"
        message={`Yakin ingin menghapus "${deleting?.keterangan}"?`}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleting(null)}
      />
    </div>
  )
}
