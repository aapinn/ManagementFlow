import { useState } from 'react'
import { EXPENSE_CATEGORIES } from '../data/categories'
import { useExpense } from '../context/ExpenseContext'
import { useToast } from '../context/ToastContext'
import RupiahInput from './RupiahInput'

export default function ExpenseForm() {
  const { addExpense, currentMonthExpense, averageMonthlyExpense } = useExpense()
  const { showToast } = useToast()
  const [jumlah, setJumlah] = useState('')
  const [keterangan, setKeterangan] = useState('')
  const [kategori, setKategori] = useState('Makanan')
  const [idTransaksi, setIdTransaksi] = useState('')
  const [catatan, setCatatan] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!jumlah || !keterangan || !idTransaksi) return
    addExpense({ jumlah: Number(jumlah), keterangan, kategori: kategori as never, idTransaksi, catatan: catatan || undefined })
    const newTotal = currentMonthExpense + Number(jumlah)
    if (averageMonthlyExpense > 0 && newTotal > averageMonthlyExpense) {
      showToast(`Pengeluaran bulan ini Rp ${newTotal.toLocaleString('id-ID')} melebihi rata-rata Rp ${averageMonthlyExpense.toLocaleString('id-ID')}!`, 'warning')
    }
    showToast('Pengeluaran berhasil dicatat')
    setJumlah(''); setKeterangan(''); setIdTransaksi(''); setCatatan('')
  }

  return (
    <form className="card" onSubmit={handleSubmit}>
      <h3 className="card-title">Tambah Pengeluaran</h3>
      <div className="form-group">
        <label htmlFor="ej">Jumlah (Rp)</label>
        <RupiahInput id="ej" value={jumlah} onChange={setJumlah} placeholder="Masukkan jumlah" required />
      </div>
      <div className="form-group">
        <label htmlFor="ek">Keterangan</label>
        <input id="ek" type="text" value={keterangan} onChange={(e) => setKeterangan(e.target.value)} placeholder="Mis: Sewa Bulanan" required />
      </div>
      <div className="form-group">
        <label htmlFor="ekat">Kategori</label>
        <select id="ekat" value={kategori} onChange={(e) => setKategori(e.target.value)} required>
          {EXPENSE_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      <div className="form-group">
        <label htmlFor="eid">ID Transaksi</label>
        <input id="eid" type="text" value={idTransaksi} onChange={(e) => setIdTransaksi(e.target.value)} placeholder="Masukkan ID transaksi" required />
      </div>
      <div className="form-group">
        <label htmlFor="ecat">Catatan <span className="text-muted">(opsional)</span></label>
        <input id="ecat" type="text" value={catatan} onChange={(e) => setCatatan(e.target.value)} placeholder="Catatan tambahan..." />
      </div>
      <button type="submit" className="btn btn-primary">Simpan</button>
    </form>
  )
}
