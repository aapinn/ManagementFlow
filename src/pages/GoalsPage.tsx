import { useState } from 'react'
import { useGoal } from '../context/GoalContext'
import { useToast } from '../context/ToastContext'
import EmptyState, { EMPTY_ICONS } from '../components/EmptyState'
import { usePageLoading } from '../hooks/usePageLoading'
import { GoalsSkeleton } from '../components/PageSkeleton'
import type { Goal } from '../types'

const ICONS = ['🎯', '🏠', '✈️', '🚗', '📚', '💻', '🏥', '🎓', '💍', '🎮']

export default function GoalsPage() {
  const loading = usePageLoading()
  const { goals, addGoal, updateGoal, deleteGoal, addToGoal } = useGoal()
  const { showToast } = useToast()
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [target, setTarget] = useState('')
  const [current, setCurrent] = useState('')
  const [deadline, setDeadline] = useState('')
  const [icon, setIcon] = useState('🎯')
  const [editId, setEditId] = useState<string | null>(null)
  const [topUp, setTopUp] = useState<string | null>(null)
  const [topUpAmount, setTopUpAmount] = useState('')

  if (loading) return <GoalsSkeleton />

  const resetForm = () => { setName(''); setTarget(''); setCurrent(''); setDeadline(''); setIcon('🎯'); setEditId(null); setShowForm(false) }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !target) return
    const data = { name, targetAmount: Number(target), currentAmount: Number(current) || 0, deadline: deadline || undefined }
    if (editId) {
      updateGoal(editId, data)
      showToast('Target berhasil diperbarui')
    } else {
      addGoal(data)
      showToast('Target baru berhasil dibuat')
    }
    resetForm()
  }

  const handleEdit = (g: Goal) => {
    setName(g.name); setTarget(String(g.targetAmount)); setCurrent(String(g.currentAmount))
    setDeadline(g.deadline || ''); setEditId(g.id); setShowForm(true)
  }

  const handleTopUp = (id: string) => {
    if (!topUpAmount || Number(topUpAmount) <= 0) return
    addToGoal(id, Number(topUpAmount))
    showToast('Dana berhasil ditambahkan ke target')
    setTopUp(null); setTopUpAmount('')
  }

  return (
    <div className="page page-animate">
      <div className="page-header">
        <div>
          <h1>Target Keuangan</h1>
          <p className="page-subtitle">{goals.length} target — {goals.filter((g) => g.currentAmount >= g.targetAmount).length} tercapai</p>
        </div>
        <button className="btn btn-primary" onClick={() => { resetForm(); setShowForm(!showForm) }}>
          {showForm ? 'Batal' : '+ Target Baru'}
        </button>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: 20 }}>
          <h3 className="card-title">{editId ? 'Edit Target' : 'Target Baru'}</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Nama Target</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Mis: Beli Laptop" required />
            </div>
            <div className="grid-2col">
              <div className="form-group">
                <label>Target (Rp)</label>
                <input type="number" value={target} onChange={(e) => setTarget(e.target.value)} placeholder="Jumlah target" required />
              </div>
              <div className="form-group">
                <label>Sudah Terkumpul (Rp)</label>
                <input type="number" value={current} onChange={(e) => setCurrent(e.target.value)} placeholder="0" />
              </div>
            </div>
            <div className="form-group">
              <label>Deadline <span className="text-muted">(opsional)</span></label>
              <input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Ikon</label>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {ICONS.map((ic) => (
                  <button key={ic} type="button" className={`btn btn-sm ${icon === ic ? 'btn-primary' : 'btn-outline'}`} onClick={() => setIcon(ic)} style={{ fontSize: 18, padding: '4px 8px' }}>{ic}</button>
                ))}
              </div>
            </div>
            <div className="modal-actions" style={{ marginTop: 12 }}>
              <button type="button" className="btn btn-outline" onClick={resetForm}>Batal</button>
              <button type="submit" className="btn btn-primary">{editId ? 'Simpan' : 'Buat Target'}</button>
            </div>
          </form>
        </div>
      )}

      {goals.length === 0 && !showForm && (
        <div className="card"><EmptyState icon={EMPTY_ICONS.target} title="Belum ada target keuangan" description="Buat target keuangan pertama Anda untuk mulai melacak pencapaian" /></div>
      )}

      <div className="goals-grid">
        {goals.map((g, i) => {
          const pct = g.targetAmount > 0 ? Math.min((g.currentAmount / g.targetAmount) * 100, 100) : 0
          const achieved = g.currentAmount >= g.targetAmount
          return (
            <div key={g.id} className={`goal-card${achieved ? ' goal-card--done' : ''} stagger-item`} style={{ animationDelay: `${i * 0.08}s` }}>
              <div className="goal-icon">{ICONS[goals.indexOf(g) % ICONS.length]}</div>
              <div className="goal-body">
                <div className="goal-header">
                  <span className="goal-name">{g.name}</span>
                  <span className={`goal-pct ${achieved ? 'text-income' : ''}`}>{achieved ? '✓ Tercapai' : `${Math.round(pct)}%`}</span>
                </div>
                <div className="budget-bar-track">
                  <div className={`budget-bar-fill${achieved ? '' : ''}`} style={{ width: `${pct}%`, background: achieved ? '#059669' : 'var(--accent)' }} />
                </div>
                <div className="goal-amounts">
                  Rp {g.currentAmount.toLocaleString('id-ID')} / Rp {g.targetAmount.toLocaleString('id-ID')}
                </div>
                {g.deadline && <div className="goal-deadline">Deadline: {g.deadline}</div>}
                <div className="goal-actions">
                  {topUp === g.id ? (
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      <input type="number" value={topUpAmount} onChange={(e) => setTopUpAmount(e.target.value)} placeholder="Jumlah" style={{ width: 120, padding: '4px 8px', border: '1px solid var(--border)', borderRadius: 4, fontSize: 13, fontFamily: 'var(--sans)', background: 'var(--bg)', color: 'var(--text-h)' }} autoFocus />
                      <button className="btn btn-primary btn-sm" onClick={() => handleTopUp(g.id)}>Tambah</button>
                      <button className="btn btn-outline btn-sm" onClick={() => setTopUp(null)}>Batal</button>
                    </div>
                  ) : (
                    <>
                      <button className="btn btn-primary btn-sm" onClick={() => { setTopUp(g.id); setTopUpAmount('') }}>+ Tambah Dana</button>
                      <button className="btn btn-outline btn-sm" onClick={() => handleEdit(g)}>Ubah</button>
                      <button className="btn btn-danger btn-sm" onClick={() => { deleteGoal(g.id); showToast('Target dihapus', 'info') }}>Hapus</button>
                    </>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
