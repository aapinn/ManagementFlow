import { useState } from 'react'
import { INCOME_CATEGORIES } from '../data/categories'
import { useIncome } from '../context/IncomeContext'
import { useToast } from '../context/ToastContext'
import RupiahInput from './RupiahInput'

export default function IncomeForm() {
  const { addIncome } = useIncome()
  const { showToast } = useToast()
  const [jumlah, setJumlah] = useState('')
  const [keterangan, setKeterangan] = useState('')
  const [kategori, setKategori] = useState('Gaji')
  const [idTransaksi, setIdTransaksi] = useState('')
  const [catatan, setCatatan] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!jumlah || !keterangan || !idTransaksi) return
    addIncome({ jumlah: Number(jumlah), keterangan, kategori: kategori as never, idTransaksi, catatan: catatan || undefined })
    showToast('Pemasukan berhasil dicatat')
    setJumlah(''); setKeterangan(''); setIdTransaksi(''); setCatatan('')
  }

  return (
    <form className="card" onSubmit={handleSubmit}>
      <h3 className="card-title">Tambah Pemasukan</h3>
      <div className="form-group">
        <label htmlFor="ij">Jumlah (Rp)</label>
        <RupiahInput id="ij" value={jumlah} onChange={setJumlah} placeholder="Masukkan jumlah" required />
      </div>
      <div className="form-group">
        <label htmlFor="ik">Keterangan</label>
        <input id="ik" type="text" value={keterangan} onChange={(e) => setKeterangan(e.target.value)} placeholder="Mis: Gaji Bulanan" required />
      </div>
      <div className="form-group">
        <label htmlFor="ikat">Kategori</label>
        <select id="ikat" value={kategori} onChange={(e) => setKategori(e.target.value)} required>
          {INCOME_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      <div className="form-group">
        <label htmlFor="iid">ID Transaksi</label>
        <input id="iid" type="text" value={idTransaksi} onChange={(e) => setIdTransaksi(e.target.value)} placeholder="Masukkan ID transaksi" required />
      </div>
      <div className="form-group">
        <label htmlFor="icat">Catatan <span className="text-muted">(opsional)</span></label>
        <input id="icat" type="text" value={catatan} onChange={(e) => setCatatan(e.target.value)} placeholder="Catatan tambahan..." />
      </div>
      <button type="submit" className="btn btn-primary">Simpan</button>
    </form>
  )
}
