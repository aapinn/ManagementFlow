import { useState, useMemo } from 'react'
import { EXPENSE_CATEGORIES } from '../data/categories'
import { useBudget } from '../context/BudgetContext'
import { useExpense } from '../context/ExpenseContext'

export default function BudgetPanel() {
  const { budgets, setBudget, removeBudget } = useBudget()
  const { expenses } = useExpense()
  const [editing, setEditing] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')

  const currentMonth = new Date().toISOString().slice(0, 7)

  const spent = useMemo(() => {
    const map: Record<string, number> = {}
    for (const e of expenses) {
      if (e.tanggal.startsWith(currentMonth)) {
        map[e.kategori] = (map[e.kategori] || 0) + e.jumlah
      }
    }
    return map
  }, [expenses, currentMonth])

  const existingCategories = budgets
    .filter((b) => b.month === currentMonth)
    .map((b) => b.kategori)
  const availableCategories = EXPENSE_CATEGORIES.filter((c) => !existingCategories.includes(c))

  const startEdit = (kategori: string, amount: number) => {
    setEditing(kategori)
    setEditValue(String(amount))
  }

  const saveEdit = (kategori: string) => {
    const amount = Number(editValue)
    if (amount > 0) {
      setBudget(currentMonth, kategori, amount)
    }
    setEditing(null)
  }

  const thisMonthBudgets = budgets.filter((b) => b.month === currentMonth)

  return (
    <div className="card">
      <h3 className="card-title">Budget Bulanan ({currentMonth})</h3>

      {thisMonthBudgets.length === 0 && (
        <p className="empty-state">Belum ada budget. Tambah budget untuk kategori pengeluaran.</p>
      )}

      {thisMonthBudgets.map((b) => {
        const s = spent[b.kategori] || 0
        const pct = b.amount > 0 ? Math.min((s / b.amount) * 100, 100) : 0
        const isOver = s > b.amount

        return (
          <div key={b.kategori} className="budget-row">
            <div className="budget-header">
              <span className="budget-kategori">{b.kategori}</span>
              <span className="budget-amounts">
                {editing === b.kategori ? (
                  <span className="budget-edit">
                    <input
                      type="number"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') saveEdit(b.kategori)
                        if (e.key === 'Escape') setEditing(null)
                      }}
                    />
                    <button className="btn btn-primary btn-sm" onClick={() => saveEdit(b.kategori)}>Simpan</button>
                  </span>
                ) : (
                  <>
                    Rp {s.toLocaleString('id-ID')} / Rp {b.amount.toLocaleString('id-ID')}
                  </>
                )}
              </span>
            </div>
            <div className="budget-bar-track">
              <div
                className={`budget-bar-fill${isOver ? ' budget-bar--over' : ''}`}
                style={{ width: `${pct}%` }}
              />
            </div>
            <div className="budget-actions">
              <button className="btn-icon" onClick={() => startEdit(b.kategori, b.amount)} title="Edit budget">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
              </button>
              <button className="btn-icon btn-icon--danger" onClick={() => removeBudget(b.id)} title="Hapus budget">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
              </button>
            </div>
          </div>
        )
      })}

      {availableCategories.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <label className="form-group" style={{ marginBottom: 0 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>Tambah Budget</span>
            <div style={{ display: 'flex', gap: 8 }}>
              <select
                id="new-budget-kategori"
                className="filter-select"
                defaultValue=""
                onChange={(e) => {
                  if (e.target.value) {
                    setBudget(currentMonth, e.target.value, 0)
                    startEdit(e.target.value, 0)
                    e.target.value = ''
                  }
                }}
              >
                <option value="" disabled>Pilih kategori</option>
                {availableCategories.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </label>
        </div>
      )}
    </div>
  )
}
