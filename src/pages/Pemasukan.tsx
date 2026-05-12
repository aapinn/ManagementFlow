import { useState, useMemo } from 'react'
import { useIncome } from '../context/IncomeContext'
import IncomeForm from '../components/IncomeForm'
import IncomePieChart from '../components/IncomePieChart'
import RecurringIncomeForm from '../components/RecurringIncomeForm'
import SearchFilter from '../components/SearchFilter'
import EditModal from '../components/EditModal'
import ConfirmDialog from '../components/ConfirmDialog'
import EmptyState, { EMPTY_ICONS } from '../components/EmptyState'
import { useCountUp } from '../hooks/useCountUp'
import { useColumnSort } from '../hooks/useColumnSort'
import { usePageLoading } from '../hooks/usePageLoading'
import { ListPageSkeleton } from '../components/PageSkeleton'
import { useToast } from '../context/ToastContext'
import { formatRp, highlightMatch } from '../utils/format'
import type { Income } from '../types'
import type { SortDir } from '../hooks/useColumnSort'

function SortTh({ label, sortKey, sort, onClick }: { label: string; sortKey: string; sort: { key: string; dir: SortDir }; onClick: (k: string) => void }) {
  const icon = sort.key !== sortKey ? ' ↕' : sort.dir === 'asc' ? ' ↑' : ' ↓'
  return <th style={{ cursor: 'pointer', userSelect: 'none' }} onClick={() => onClick(sortKey)}>{label}{icon}</th>
}

export default function Pemasukan() {
  const loading = usePageLoading()
  const { incomes, addIncome, totalIncome, updateIncome, deleteIncome } = useIncome()
  const { showToast } = useToast()
  const animTotal = useCountUp(totalIncome)

  const [search, setSearch] = useState('')
  const [kategori, setKategori] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [editing, setEditing] = useState<Income | null>(null)
  const [deleting, setDeleting] = useState<Income | null>(null)

  const filtered = useMemo(() => {
    return incomes.filter((t) => {
      if (search && !t.keterangan.toLowerCase().includes(search.toLowerCase()) && !t.idTransaksi.toLowerCase().includes(search.toLowerCase())) return false
      if (kategori && t.kategori !== kategori) return false
      if (dateFrom && t.tanggal < dateFrom) return false
      if (dateTo && t.tanggal > dateTo) return false
      return true
    })
  }, [incomes, search, kategori, dateFrom, dateTo])

  const { sorted, sort, toggle } = useColumnSort(filtered as unknown as Record<string, unknown>[], 'tanggal')

  const handleSave = (data: { jumlah: number; keterangan: string; kategori: string; idTransaksi: string; tanggal: string }) => {
    if (editing) {
      updateIncome(editing.id, data as Parameters<typeof updateIncome>[1])
      showToast('Pemasukan berhasil diperbarui')
      setEditing(null)
    }
  }

  const handleDelete = () => {
    if (deleting) {
      deleteIncome(deleting.id)
      showToast('Pemasukan berhasil dihapus', 'info')
      setDeleting(null)
    }
  }

  if (loading) return <ListPageSkeleton />

  const handleDuplicate = (t: Income) => {
    addIncome({ jumlah: t.jumlah, keterangan: t.keterangan + ' (copy)', kategori: t.kategori, idTransaksi: t.idTransaksi + '-copy', catatan: t.catatan })
    showToast('Pemasukan digandakan')
  }

  return (
    <div className="page page-animate">
      <div className="page-header">
        <div>
          <h1>Pemasukan</h1>
          <p className="page-subtitle">Kelola semua pemasukan Anda</p>
        </div>
        <div className="page-summary">
          <span className="summary-label">Total Pemasukan</span>
          <span className="summary-value">{formatRp(animTotal)}</span>
        </div>
      </div>

      <div className="grid-2col" style={{ marginBottom: 20 }}>
        <IncomeForm />
        <IncomePieChart />
      </div>

      <RecurringIncomeForm />

      <div className="card" style={{ marginTop: 20 }}>
        <div className="card-row">
          <h3 className="card-title" style={{ marginBottom: 0 }}>Riwayat Pemasukan</h3>
          <span className="badge badge-income">{filtered.length} transaksi</span>
        </div>

        <SearchFilter
          type="income"
          search={search} onSearchChange={setSearch}
          kategori={kategori} onKategoriChange={setKategori}
          dateFrom={dateFrom} onDateFromChange={setDateFrom}
          dateTo={dateTo} onDateToChange={setDateTo}
        />

        <div className="table-scroll">
          <table className="table">
            <thead>
              <tr>
                <SortTh label="ID" sortKey="idTransaksi" sort={sort} onClick={toggle} />
                <SortTh label="Keterangan" sortKey="keterangan" sort={sort} onClick={toggle} />
                <SortTh label="Kategori" sortKey="kategori" sort={sort} onClick={toggle} />
                <SortTh label="Jumlah" sortKey="jumlah" sort={sort} onClick={toggle} />
                <SortTh label="Tanggal" sortKey="tanggal" sort={sort} onClick={toggle} />
                <th style={{ width: 90 }}></th>
              </tr>
            </thead>
            <tbody>
              {sorted.length === 0 ? (
                <tr><td colSpan={6} style={{ padding: 0 }}>
                  <EmptyState icon={EMPTY_ICONS.default} title="Belum ada pemasukan" description="Tambahkan pemasukan pertama Anda menggunakan form di atas" />
                </td></tr>
              ) : (
                (sorted as unknown as Income[]).map((t, i) => (
                  <tr key={t.id} className="stagger-item" style={{ animationDelay: `${i * 0.03}s` }}>
                    <td className="text-mono" dangerouslySetInnerHTML={{ __html: highlightMatch(t.idTransaksi, search) }} />
                    <td dangerouslySetInnerHTML={{ __html: highlightMatch(t.keterangan, search) }} />
                    <td><span className="cat-tag">{t.kategori}</span></td>
                    <td className="text-income">{formatRp(t.jumlah)}</td>
                    <td className="text-muted">{t.tanggal}</td>
                    <td>
                      <div className="row-actions">
                        <button className="btn-icon" onClick={() => handleDuplicate(t)} title="Duplikat">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>
                        </button>
                        <button className="btn-icon" onClick={() => setEditing(t)} title="Edit">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                        </button>
                        <button className="btn-icon btn-icon--danger" onClick={() => setDeleting(t)} title="Hapus">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <EditModal open={!!editing} transaction={editing} type="income" onSave={handleSave} onClose={() => setEditing(null)} />
      <ConfirmDialog open={!!deleting} title="Hapus Pemasukan" message={`Yakin ingin menghapus "${deleting?.keterangan}"?`} onConfirm={handleDelete} onCancel={() => setDeleting(null)} />
    </div>
  )
}
