import { useState } from 'react'
import { EXPENSE_CATEGORIES } from '../data/categories'
import { useRecurringExpense } from '../context/RecurringExpenseContext'
import { useToast } from '../context/ToastContext'

export default function RecurringExpenseForm() {
  const { recurringExpenses, addRecurringExpense, updateRecurringExpense, deleteRecurringExpense } = useRecurringExpense()
  const { showToast } = useToast()
  const [jumlah, setJumlah] = useState('')
  const [keterangan, setKeterangan] = useState('')
  const [kategori, setKategori] = useState('Makanan')
  const [idTransaksi, setIdTransaksi] = useState('')
  const [catatan, setCatatan] = useState('')
  const [tanggalHari, setTanggalHari] = useState('1')
  const [showForm, setShowForm] = useState(false)

  const resetForm = () => {
    setJumlah(''); setKeterangan(''); setIdTransaksi(''); setCatatan(''); setTanggalHari('1')
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!jumlah || !keterangan || !idTransaksi) return

    addRecurringExpense({
      jumlah: Number(jumlah),
      keterangan,
      kategori: kategori as never,
      idTransaksi,
      catatan: catatan || undefined,
      tanggalHari: Number(tanggalHari),
    })
    showToast('Pengeluaran rutin berhasil ditambahkan')
    resetForm()
    setShowForm(false)
  }

  const active = recurringExpenses.filter((r) => r.aktif)
  const inactive = recurringExpenses.filter((r) => !r.aktif)

  return (
    <div className="card" style={{ marginTop: 20 }}>
      <div className="card-row">
        <h3 className="card-title" style={{ marginBottom: 0 }}>
          Pengeluaran Rutin
          <span className="text-muted" style={{ fontWeight: 400, fontSize: 12, marginLeft: 8 }}>
            ({active.length} aktif)
          </span>
        </h3>
        <button className="btn btn-sm btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Batal' : '+ Tambah Rutin'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} style={{ marginTop: 12, paddingTop: 16, borderTop: '1px solid var(--border-light)' }}>
          <div className="form-group">
            <label htmlFor="rej">Jumlah (Rp)</label>
            <input id="rej" type="number" value={jumlah} onChange={(e) => setJumlah(e.target.value)} placeholder="Masukkan jumlah" required />
          </div>
          <div className="form-group">
            <label htmlFor="rek">Keterangan</label>
            <input id="rek" type="text" value={keterangan} onChange={(e) => setKeterangan(e.target.value)} placeholder="Mis: Sewa Bulanan" required />
          </div>
          <div className="form-group">
            <label htmlFor="rekat">Kategori</label>
            <select id="rekat" value={kategori} onChange={(e) => setKategori(e.target.value)} required>
              {EXPENSE_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="reid">ID Transaksi</label>
            <input id="reid" type="text" value={idTransaksi} onChange={(e) => setIdTransaksi(e.target.value)} placeholder="Masukkan ID transaksi" required />
          </div>
          <div className="form-group">
            <label htmlFor="rehari">Tanggal setiap bulan</label>
            <select id="rehari" value={tanggalHari} onChange={(e) => setTanggalHari(e.target.value)} required>
              {Array.from({ length: 31 }, (_, i) => (
                <option key={i + 1} value={i + 1}>{i + 1}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="recat">Catatan <span className="text-muted">(opsional)</span></label>
            <input id="recat" type="text" value={catatan} onChange={(e) => setCatatan(e.target.value)} placeholder="Catatan tambahan..." />
          </div>
          <button type="submit" className="btn btn-primary">Simpan Rutin</button>
        </form>
      )}

      {recurringExpenses.length > 0 && (
        <div style={{ marginTop: 16 }}>
          {active.map((r) => (
            <div key={r.id} className="budget-row" style={{ padding: '10px 0' }}>
              <div className="budget-header">
                <span className="budget-kategori" style={{ fontSize: 13 }}>{r.keterangan}</span>
                <span className="budget-amounts" style={{ fontSize: 12 }}>
                  Rp {r.jumlah.toLocaleString('id-ID')} — Tgl {r.tanggalHari}
                </span>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 4, flexWrap: 'wrap' }}>
                <span className="cat-tag">{r.kategori}</span>
                <span className="text-muted" style={{ fontSize: 11 }}>
                  {r.lastGenerated ? `Terakhir: ${r.lastGenerated}` : 'Belum pernah'}
                </span>
                <div style={{ marginLeft: 'auto', display: 'flex', gap: 4 }}>
                  <button
                    className="btn-icon"
                    onClick={() => { updateRecurringExpense(r.id, { aktif: false }); showToast('Pengeluaran rutin dinonaktifkan', 'info') }}
                    title="Nonaktifkan"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>
                  </button>
                  <button className="btn-icon btn-icon--danger" onClick={() => { deleteRecurringExpense(r.id); showToast('Pengeluaran rutin dihapus', 'info') }} title="Hapus">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
          {inactive.length > 0 && (
            <details style={{ marginTop: 8 }}>
              <summary className="text-muted" style={{ cursor: 'pointer', fontSize: 12 }}>
                Nonaktif ({inactive.length})
              </summary>
              {inactive.map((r) => (
                <div key={r.id} className="budget-row" style={{ padding: '8px 0', opacity: 0.5 }}>
                  <div className="budget-header">
                    <span className="budget-kategori" style={{ fontSize: 13 }}>{r.keterangan}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                    <span className="cat-tag">{r.kategori}</span>
                    <button className="btn-icon" onClick={() => { updateRecurringExpense(r.id, { aktif: true }); showToast('Pengeluaran rutin diaktifkan') }} title="Aktifkan">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
                    </button>
                    <button className="btn-icon btn-icon--danger" onClick={() => { deleteRecurringExpense(r.id); showToast('Pengeluaran rutin dihapus', 'info') }} title="Hapus">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                    </button>
                  </div>
                </div>
              ))}
            </details>
          )}
        </div>
      )}

      {recurringExpenses.length === 0 && !showForm && (
        <p className="empty-state" style={{ margin: '16px 0 0' }}>
          Belum ada pengeluaran rutin. Tambah untuk otomatis dicatat setiap bulan.
        </p>
      )}
    </div>
  )
}
