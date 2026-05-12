import { useState } from 'react'
import { EXPENSE_CATEGORIES } from '../data/categories'
import { useBudget } from '../context/BudgetContext'
import { useExpense } from '../context/ExpenseContext'
import EmptyState, { EMPTY_ICONS } from '../components/EmptyState'
import { useToast } from '../context/ToastContext'
import { usePageLoading } from '../hooks/usePageLoading'
import { BudgetSkeleton } from '../components/PageSkeleton'

function formatMonth(ym: string) {
  const [y, m] = ym.split('-')
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
  return `${months[Number(m) - 1]} ${y}`
}

function getMonths() {
  const now = new Date()
  const months: string[] = []
  for (let i = 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    months.push(d.toISOString().slice(0, 7))
  }
  return months
}

export default function BudgetPage() {
  const loading = usePageLoading()
  const { budgets, setBudget, removeBudget, getBudget } = useBudget()
  const { expenses } = useExpense()
  const { showToast } = useToast()
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7))

  if (loading) return <BudgetSkeleton />

  const months = getMonths()

  const monthBudgets = budgets.filter((b) => b.month === selectedMonth)

  const spentInMonth = (kategori: string) =>
    expenses
      .filter((e) => e.tanggal.startsWith(selectedMonth) && e.kategori === kategori)
      .reduce((sum, e) => sum + e.jumlah, 0)

  const handleSetBudget = (kategori: string) => {
    const amount = prompt(`Masukkan budget untuk ${kategori} (Rp):`)
    if (amount && Number(amount) > 0) {
      setBudget(selectedMonth, kategori, Number(amount))
      showToast(`Budget ${kategori} berhasil disimpan`)
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Budget</h1>
          <p className="page-subtitle">Atur target pengeluaran per kategori</p>
        </div>
        <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} className="filter-select" style={{ width: 160 }}>
          {months.map((m) => <option key={m} value={m}>{formatMonth(m)}</option>)}
        </select>
      </div>

      <div className="card">
        <h3 className="card-title">Budget Pengeluaran — {formatMonth(selectedMonth)}</h3>

        {monthBudgets.length === 0 && (
          <div style={{ marginBottom: 16 }}><EmptyState icon={EMPTY_ICONS.wallet} title="Belum ada budget" description="Klik 'Tambah Budget' di bawah untuk mengatur target pengeluaran" /></div>
        )}
        {EXPENSE_CATEGORIES.map((kategori) => {
          const budget = getBudget(selectedMonth, kategori)
          const spent = spentInMonth(kategori)
          const pct = budget > 0 ? Math.min((spent / budget) * 100, 100) : 0
          const isOver = spent > budget && budget > 0

          return (
            <div key={kategori} className="budget-row">
              <div className="budget-header">
                <span className="budget-kategori">{kategori}</span>
                {budget > 0 ? (
                  <span className="budget-amounts">
                    Rp {spent.toLocaleString('id-ID')} / Rp {budget.toLocaleString('id-ID')}
                    <span className={isOver ? 'text-expense' : 'text-income'} style={{ marginLeft: 8, fontSize: 12 }}>
                      ({isOver ? `${Math.round((spent / budget) * 100 - 100)}% lebih` : `${Math.round(pct)}%`})
                    </span>
                  </span>
                ) : (
                  <span className="text-muted">Belum ada budget</span>
                )}
              </div>
              {budget > 0 && (
                <div className="budget-bar-track">
                  <div className={`budget-bar-fill${isOver ? ' budget-bar--over' : ''}`} style={{ width: `${pct}%` }} />
                </div>
              )}
              <div className="budget-actions" style={{ justifyContent: 'flex-start', gap: 8 }}>
                {budget > 0 ? (
                  <>
                    <button className="btn btn-outline btn-sm" onClick={() => handleSetBudget(kategori)}>Edit</button>
                    <button className="btn btn-danger btn-sm" onClick={() => { removeBudget(monthBudgets.find((b) => b.kategori === kategori)?.id || ''); showToast(`Budget ${kategori} dihapus`, 'info') }}>Hapus</button>
                  </>
                ) : (
                  <button className="btn btn-primary btn-sm" onClick={() => handleSetBudget(kategori)}>Tambah Budget</button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
