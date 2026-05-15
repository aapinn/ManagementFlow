import { useState, useEffect } from 'react'
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES } from '../data/categories'
import { useFocusTrap } from '../hooks/useFocusTrap'
import RupiahInput from './RupiahInput'
import type { Income, Expense } from '../types'

interface EditModalProps {
  open: boolean
  transaction: (Income | Expense) | null
  type: 'income' | 'expense'
  onSave: (data: { jumlah: number; keterangan: string; kategori: string; idTransaksi: string; tanggal: string; catatan?: string }) => void
  onClose: () => void
}

export default function EditModal({ open, transaction, type, onSave, onClose }: EditModalProps) {
  const [jumlah, setJumlah] = useState('')
  const [keterangan, setKeterangan] = useState('')
  const [kategori, setKategori] = useState('')
  const [idTransaksi, setIdTransaksi] = useState('')
  const [tanggal, setTanggal] = useState('')
  const [catatan, setCatatan] = useState('')
  const trapRef = useFocusTrap(open)

  useEffect(() => {
    if (open) {
      const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
      document.addEventListener('keydown', h)
      return () => document.removeEventListener('keydown', h)
    }
  }, [open, onClose])

  useEffect(() => {
    if (transaction) {
      setJumlah(String(transaction.jumlah))
      setKeterangan(transaction.keterangan)
      setKategori(transaction.kategori)
      setIdTransaksi(transaction.idTransaksi)
      setTanggal(transaction.tanggal)
      setCatatan((transaction as any).catatan || '')
    } else {
      setJumlah(''); setKeterangan('')
      setKategori(type === 'income' ? 'Gaji' : 'Makanan')
      setIdTransaksi(''); setCatatan('')
      setTanggal(new Date().toISOString().split('T')[0])
    }
  }, [transaction, open, type])

  if (!open) return null

  const cats = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!jumlah || !keterangan || !kategori || !idTransaksi || !tanggal) return
    onSave({ jumlah: Number(jumlah), keterangan, kategori, idTransaksi, tanggal, catatan: catatan || undefined })
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" ref={trapRef} onClick={(e) => e.stopPropagation()}>
        <h3 className="modal-title">{transaction ? 'Edit Transaksi' : 'Tambah Transaksi'}</h3>
        <form onSubmit={submit}>
          <div className="form-group">
            <label htmlFor="ejumlah">Jumlah (Rp)</label>
            <RupiahInput id="ejumlah" value={jumlah} onChange={setJumlah} required />
          </div>
          <div className="form-group">
            <label htmlFor="eketerangan">Keterangan</label>
            <input id="eketerangan" type="text" value={keterangan} onChange={(e) => setKeterangan(e.target.value)} required />
          </div>
          <div className="form-group">
            <label htmlFor="ekategori">Kategori</label>
            <select id="ekategori" value={kategori} onChange={(e) => setKategori(e.target.value)} required>
              {cats.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="eid">ID Transaksi</label>
            <input id="eid" type="text" value={idTransaksi} onChange={(e) => setIdTransaksi(e.target.value)} required />
          </div>
          <div className="form-group">
            <label htmlFor="etgl">Tanggal</label>
            <input id="etgl" type="date" value={tanggal} onChange={(e) => setTanggal(e.target.value)} required />
          </div>
          <div className="form-group">
            <label htmlFor="ecat">Catatan <span className="text-muted">(opsional)</span></label>
            <input id="ecat" type="text" value={catatan} onChange={(e) => setCatatan(e.target.value)} placeholder="Catatan tambahan..." />
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn-outline" onClick={onClose}>Batal</button>
            <button type="submit" className="btn btn-primary">Simpan</button>
          </div>
        </form>
      </div>
    </div>
  )
}
