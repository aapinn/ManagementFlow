import { useMemo, useEffect, useRef, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useIncome } from '../context/IncomeContext'
import { useExpense } from '../context/ExpenseContext'
import { useToast } from '../context/ToastContext'
import { useBudget } from '../context/BudgetContext'
import { useGoal } from '../context/GoalContext'
import { useRecurringIncome } from '../context/RecurringIncomeContext'
import { useRecurringExpense } from '../context/RecurringExpenseContext'
import { loadItems } from '../lib/firestore'
import FlowChart from '../components/FlowChart'
import EmptyState, { EMPTY_ICONS } from '../components/EmptyState'
import { useCountUp } from '../hooks/useCountUp'
import { usePageLoading } from '../hooks/usePageLoading'
import { DashboardSkeleton } from '../components/PageSkeleton'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { useDeviceType } from '../hooks/useDeviceType'

function formatDate(): string {
  return new Date().toLocaleDateString('id-ID', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })
}

function monthKey(d: Date = new Date()) {
  return d.toISOString().slice(0, 7)
}

function dayOfMonth(d: Date = new Date()) {
  return d.getDate()
}

export default function Dashboard() {
  const loading = usePageLoading()
  const isMobile = useDeviceType()
  const { user } = useAuth()
  const uid = user?.uid
  const { incomes, totalIncome } = useIncome()
  const { expenses, totalExpense, currentMonthExpense, averageMonthlyExpense } = useExpense()
  const { budgets } = useBudget()
  const { goals } = useGoal()
  const { recurringIncomes } = useRecurringIncome()
  const { recurringExpenses } = useRecurringExpense()
  const [safeLimit, setSafeLimit] = useState(0)

  useEffect(() => {
    if (!uid) { setSafeLimit(0); return }
    loadItems<{ value: number }>('settings', uid).then((data) => {
      const item = data.find((d) => d.value !== undefined)
      setSafeLimit(item?.value ?? 0)
    })
  }, [uid])

  const saldo = totalIncome - totalExpense
  const totalTrans = incomes.length + expenses.length
  const saldoBelowSafe = safeLimit > 0 && saldo < safeLimit
  const animIncome = useCountUp(totalIncome)
  const animExpense = useCountUp(totalExpense)
  const animSaldo = useCountUp(Math.abs(saldo))
  const animTrans = useCountUp(totalTrans)

  const thisMonth = monthKey()
  const prevMonth = monthKey(new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1))

  const monthIncome = useMemo(() =>
    incomes.filter((i) => i.tanggal.startsWith(thisMonth)).reduce((s, i) => s + i.jumlah, 0), [incomes, thisMonth])
  const monthExpense = useMemo(() =>
    expenses.filter((e) => e.tanggal.startsWith(thisMonth)).reduce((s, e) => s + e.jumlah, 0), [expenses, thisMonth])
  const prevMonthIncome = useMemo(() =>
    incomes.filter((i) => i.tanggal.startsWith(prevMonth)).reduce((s, i) => s + i.jumlah, 0), [incomes, prevMonth])
  const prevMonthExpense = useMemo(() =>
    expenses.filter((e) => e.tanggal.startsWith(prevMonth)).reduce((s, e) => s + e.jumlah, 0), [expenses, prevMonth])

  const incomeChange = prevMonthIncome > 0 ? Math.round(((monthIncome - prevMonthIncome) / prevMonthIncome) * 100) : 0
  const expenseChange = prevMonthExpense > 0 ? Math.round(((monthExpense - prevMonthExpense) / prevMonthExpense) * 100) : 0

  const overBudgetCount = useMemo(() => {
    return budgets.filter((b) => {
      if (b.month !== thisMonth) return false
      const spent = expenses.filter((e) => e.tanggal.startsWith(thisMonth) && e.kategori === b.kategori).reduce((s, e) => s + e.jumlah, 0)
      return spent > b.amount
    }).length
  }, [budgets, expenses, thisMonth])

  // Last 7 days chart data
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    const key = d.toISOString().slice(0, 10)
    return {
      hari: d.toLocaleDateString('id-ID', { weekday: 'short' }),
      Pemasukan: incomes.filter((x) => x.tanggal === key).reduce((s, x) => s + x.jumlah, 0),
      Pengeluaran: expenses.filter((x) => x.tanggal === key).reduce((s, x) => s + x.jumlah, 0),
    }
  })

  const stats = [
    { label: 'Total Pemasukan', raw: animIncome, change: `${incomes.length} transaksi`, up: true, variant: 'hero' as const },
    { label: 'Total Pengeluaran', raw: animExpense, change: `${expenses.length} transaksi`, up: false, variant: '' as const },
    { label: 'Saldo Bersih', raw: animSaldo, change: saldo >= 0 ? 'Positif' : 'Negatif', up: saldo >= 0, variant: '' as const },
    { label: 'Total Transaksi', raw: animTrans, change: 'Semua waktu', up: true, variant: '' as const },
  ]

  const all = [
    ...incomes.map((i) => ({ ...i, type: 'income' as const })),
    ...expenses.map((e) => ({ ...e, type: 'expense' as const })),
  ].sort((a, b) => b.tanggal.localeCompare(a.tanggal)).slice(0, 5)

  const hasData7 = last7.some((d) => d.Pemasukan > 0 || d.Pengeluaran > 0)
  const animMonthIncome = useCountUp(monthIncome)
  const animMonthExpense = useCountUp(monthExpense)

  // ── Skor Kesehatan ──
  const savingsRate = monthIncome > 0 ? (monthIncome - monthExpense) / monthIncome : 0
  const monthBudgets = useMemo(() => budgets.filter((b) => b.month === thisMonth), [budgets, thisMonth])
  const budgetHealth = monthBudgets.length > 0
    ? monthBudgets.filter((b) => {
        const spent = expenses.filter((e) => e.tanggal.startsWith(thisMonth) && e.kategori === b.kategori).reduce((s, e) => s + e.jumlah, 0)
        return spent <= b.amount
      }).length / monthBudgets.length
    : 1
  const goalHealth = goals.length > 0
    ? goals.filter((g) => g.currentAmount >= g.targetAmount).length / goals.length
    : 1
  const rawScore = savingsRate * 0.5 + budgetHealth * 0.3 + goalHealth * 0.2
  const scoreGrade = rawScore >= 0.8 ? 'A' : rawScore >= 0.6 ? 'B' : rawScore >= 0.4 ? 'C' : rawScore >= 0.2 ? 'D' : 'E'
  const scoreColor = rawScore >= 0.8 ? '#00ffd1' : rawScore >= 0.6 ? 'var(--accent)' : rawScore >= 0.4 ? '#d97706' : rawScore >= 0.2 ? '#ea580c' : '#ff7f50'

  // ── Top kategori ──
  const topCategory = useMemo(() => {
    const map: Record<string, number> = {}
    for (const e of expenses) {
      if (!e.tanggal.startsWith(thisMonth)) continue
      map[e.kategori] = (map[e.kategori] || 0) + e.jumlah
    }
    const entries = Object.entries(map).sort((a, b) => b[1] - a[1])
    return entries.length > 0 ? { name: entries[0][0], amount: entries[0][1] } : null
  }, [expenses, thisMonth])

  // ── Recurring ──
  const upcomingRecurring = useMemo(() => {
    const today = dayOfMonth()
    const items: { label: string; jumlah: number; hari: number; type: 'income' | 'expense' }[] = []
    for (const r of recurringIncomes) {
      if (!r.aktif || r.tanggalHari <= today || r.lastGenerated === thisMonth) continue
      items.push({ label: r.keterangan, jumlah: r.jumlah, hari: r.tanggalHari, type: 'income' })
    }
    for (const r of recurringExpenses) {
      if (!r.aktif || r.tanggalHari <= today || r.lastGenerated === thisMonth) continue
      items.push({ label: r.keterangan, jumlah: r.jumlah, hari: r.tanggalHari, type: 'expense' })
    }
    return items.sort((a, b) => a.hari - b.hari)
  }, [recurringIncomes, recurringExpenses, thisMonth])

  const dailyAvgExpense = monthExpense > 0 ? Math.round(monthExpense / dayOfMonth()) : 0

  const { showToast } = useToast()
  const alertedRef = useRef(false)

  const overBudgetNames = useMemo(() => {
    return budgets.filter((b) => {
      if (b.month !== thisMonth) return false
      const spent = expenses.filter((e) => e.tanggal.startsWith(thisMonth) && e.kategori === b.kategori).reduce((s, e) => s + e.jumlah, 0)
      return spent > b.amount
    }).map((b) => b.kategori)
  }, [budgets, expenses, thisMonth])

  const achievedGoals = useMemo(() =>
    goals.filter((g) => g.currentAmount >= g.targetAmount),
    [goals],
  )

  const nearingGoals = useMemo(() =>
    goals.filter((g) => {
      if (g.targetAmount <= 0) return false
      const pct = g.currentAmount / g.targetAmount
      return pct >= 0.8 && pct < 1
    }),
    [goals],
  )

  useEffect(() => {
    if (loading || alertedRef.current) return
    alertedRef.current = true

    const alerts: { msg: string; type: 'success' | 'error' | 'info' | 'warning' }[] = []

    if (saldo < 0) {
      alerts.push({ msg: `Saldo Anda negatif Rp ${Math.abs(saldo).toLocaleString('id-ID')}! Segera lakukan penambahan pemasukan.`, type: 'warning' })
    }

    if (saldoBelowSafe) {
      alerts.push({ msg: `Saldo Rp ${saldo.toLocaleString('id-ID')} di bawah batas aman Rp ${safeLimit.toLocaleString('id-ID')}.`, type: 'warning' })
    }

    if (overBudgetNames.length > 0) {
      const names = overBudgetNames.slice(0, 3).join(', ')
      alerts.push({ msg: `${overBudgetNames.length} kategori budget terlampaui: ${names}${overBudgetNames.length > 3 ? '...' : ''}`, type: 'warning' })
    }

    if (averageMonthlyExpense > 0 && currentMonthExpense > averageMonthlyExpense) {
      const pct = Math.round(((currentMonthExpense - averageMonthlyExpense) / averageMonthlyExpense) * 100)
      alerts.push({ msg: `Pengeluaran bulan ini Rp ${currentMonthExpense.toLocaleString('id-ID')} (${pct}% di atas rata-rata).`, type: 'warning' })
    }

    if (achievedGoals.length > 0) {
      alerts.push({ msg: `Selamat! Target "${achievedGoals[0].name}" telah tercapai! 🎉`, type: 'success' })
    }

    if (nearingGoals.length > 0) {
      const pct = Math.round((nearingGoals[0].currentAmount / nearingGoals[0].targetAmount) * 100)
      alerts.push({ msg: `Target "${nearingGoals[0].name}" sudah ${pct}% — hampir tercapai!`, type: 'info' })
    }

    if (totalTrans === 0) {
      alerts.push({ msg: 'Belum ada transaksi. Mulai catat pemasukan atau pengeluaran pertama Anda!', type: 'info' })
    }

    alerts.slice(0, 4).forEach((a, i) => {
      setTimeout(() => showToast(a.msg, a.type), i * 400)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading])

  if (loading) return <DashboardSkeleton />

  if (isMobile) {
    const absSaldo = Math.abs(saldo)
    const growthAmount = saldo > 0 ? monthIncome - monthExpense : 0
    const growthPct = monthExpense > 0 ? Math.round(((monthIncome - monthExpense) / monthExpense) * 100) : 0

    return (
      <div className="mob-dashboard">
        {/* ── Header ── */}
        <div className="mob-header">
          <div className="mob-header-left">
            <span className="mob-greeting">Welcome Back 👋</span>
            <h1 className="mob-username">{user?.name || 'User'}</h1>
          </div>
        </div>

        {/* ── Balance Card ── */}
        <div className="mob-balance-card">
          <div className="mob-balance-top">
            <span className="mob-balance-label">Saldo Bersih</span>
          </div>
          <div className="mob-balance-amount">Rp. {absSaldo.toLocaleString('id-ID')}</div>
          <div className="mob-balance-growth">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" />
            </svg>
            <span>+{growthAmount.toLocaleString('id-ID')} &bull; +{growthPct}%</span>
          </div>
        </div>
        {/* ── Stats Row ── */}
        <div className="mob-stats-row">
          <div className="mob-stat-card">
            <svg className="mob-stat-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" /><polyline points="17 18 23 18 23 12" />
            </svg>
            <span className="mob-stat-label">Total Pemasukan</span>
            <span className="mob-stat-value">Rp. {monthIncome.toLocaleString('id-ID')}</span>
            <span className="mob-stat-change mob-stat-change--up">{incomes.length} transaksi</span>
          </div>
          <div className="mob-stat-card">
            <svg className="mob-stat-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" />
            </svg>
            <span className="mob-stat-label">Total Pengeluaran</span>
            <span className="mob-stat-value">Rp. {monthExpense.toLocaleString('id-ID')}</span>
            <span className="mob-stat-change mob-stat-change--up">{expenses.length} transaksi</span>
          </div>
        </div>

        {/* ── Safe Limit Banner ── */}
        {saldoBelowSafe && (
          <div className="safe-limit-banner" style={{ margin: 0 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            <div className="safe-limit-banner-body">
              <strong>Saldo di bawah batas aman!</strong>
              <p>Saldo saat ini Rp {saldo.toLocaleString('id-ID')} — di bawah batas aman Rp {safeLimit.toLocaleString('id-ID')}. Atur di Profile & Pengaturan.</p>
            </div>
          </div>
        )}

        {/* ── Alur Keuangan ── */}
        <FlowChart totalIncome={totalIncome} totalExpense={totalExpense} />

        {/* ── Kesehatan & Ringkasan ── */}
        {totalTrans > 0 && (
          <>
            <div className="health-insight-grid" style={{ margin: 0 }}>
              <div className="card health-card" style={{ '--section-gradient': 'var(--dashboard-gradient)' } as React.CSSProperties}>
                <span className="card-title">
                  <span className="card-title-icon">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                  </span>
                  Skor Kesehatan
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div className="health-score-ring" style={{ borderColor: scoreColor }}>
                    <span style={{ color: scoreColor, fontSize: 22, fontWeight: 700 }}>{scoreGrade}</span>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div className="health-metric">
                      <span className="health-metric-label">Rasio Tabungan</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div className="health-bar-track">
                          <div className="health-bar-fill" style={{ width: `${Math.max(0, Math.round(savingsRate * 100))}%`, background: savingsRate >= 0.2 ? 'var(--income)' : 'var(--expense)' }} />
                        </div>
                        <span className={savingsRate >= 0.2 ? 'text-income' : 'text-expense'} style={{ fontSize: 12, fontWeight: 600, minWidth: 40, textAlign: 'right' }}>
                          {Math.round(savingsRate * 100)}%
                        </span>
                      </div>
                    </div>
                    <div className="health-metric">
                      <span className="health-metric-label">Kepatuhan Budget</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div className="health-bar-track">
                          <div className="health-bar-fill" style={{ width: `${Math.round(budgetHealth * 100)}%`, background: budgetHealth >= 0.7 ? 'var(--income)' : 'var(--budget)' }} />
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 600, minWidth: 40, textAlign: 'right', color: 'var(--text-h)' }}>
                          {Math.round(budgetHealth * 100)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card insight-card" style={{ '--section-gradient': 'var(--dashboard-gradient)' } as React.CSSProperties}>
                <span className="card-title">
                  <span className="card-title-icon">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
                  </span>
                  Ringkasan Bulan Ini
                </span>
                <div className="insight-grid">
                  <div className="insight-item">
                    <span className="insight-label">Efisiensi</span>
                    <span className="insight-value" style={{ fontWeight: 600 }}>
                      {totalIncome > 0 ? `${Math.round((1 - totalExpense / totalIncome) * 100)}%` : '0%'}
                    </span>
                  </div>
                  {dailyAvgExpense > 0 && (
                    <div className="insight-item">
                      <span className="insight-label">Rata-rata/hari</span>
                      <span className="insight-value">Rp {dailyAvgExpense.toLocaleString('id-ID')}</span>
                    </div>
                  )}
                  {topCategory && (
                    <div className="insight-item">
                      <span className="insight-label">Terbanyak</span>
                      <span className="insight-value" style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <span className="cat-tag">{topCategory.name}</span>
                        Rp {topCategory.amount.toLocaleString('id-ID')}
                      </span>
                    </div>
                  )}
                  {overBudgetCount > 0 && (
                    <div className="insight-item">
                      <span className="insight-label">Budget Over</span>
                      <span className="insight-value text-expense">{overBudgetCount} kategori</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* ── Akan Datang ── */}
            {upcomingRecurring.length > 0 && (
              <div className="card" style={{ '--section-gradient': 'var(--dashboard-gradient)' } as React.CSSProperties}>
                <h3 className="card-title">
                  <span className="card-title-icon">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                  </span>
                  Akan Datang Bulan Ini
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {upcomingRecurring.map((r, i) => (
                    <div key={i} className="recurring-upcoming-item">
                      <div className="recurring-upcoming-left">
                        <span className="recurring-upcoming-day">Tgl {r.hari}</span>
                        <span className="recurring-upcoming-label">{r.label}</span>
                      </div>
                      <span className={r.type === 'income' ? 'text-income' : 'text-expense'} style={{ fontWeight: 600, fontSize: 13 }}>
                        {r.type === 'income' ? '+' : '−'}Rp {r.jumlah.toLocaleString('id-ID')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── Bulan Ini & 7 Hari ── */}
            <div className="grid-2col" style={{ margin: 0 }}>
              <div className="card" style={{ '--section-gradient': 'var(--dashboard-gradient)' } as React.CSSProperties}>
                <h3 className="card-title">
                  <span className="card-title-icon">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                  </span>
                  Bulan Ini
                </h3>
                <div className="summary-stats">
                  <div className="summary-stat">
                    <span className="summary-stat-label">Pemasukan</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span className="summary-stat-value text-income">Rp {animMonthIncome.toLocaleString('id-ID')}</span>
                      {prevMonthIncome > 0 && (
                        <span className={`stat-mini-change stat-mini-change--${incomeChange >= 0 ? 'up' : 'down'}`}>
                          {incomeChange >= 0 ? '+' : ''}{incomeChange}%
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="summary-stat">
                    <span className="summary-stat-label">Pengeluaran</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span className="summary-stat-value text-expense">Rp {animMonthExpense.toLocaleString('id-ID')}</span>
                      {prevMonthExpense > 0 && (
                        <span className={`stat-mini-change stat-mini-change--${expenseChange <= 0 ? 'up' : 'down'}`}>
                          {expenseChange >= 0 ? '+' : ''}{expenseChange}%
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="summary-divider" />
                  <div className="summary-stat">
                    <span className="summary-stat-label">Saldo Bulan Ini</span>
                    <span className={`summary-stat-value ${monthIncome - monthExpense >= 0 ? 'text-income' : 'text-expense'}`}>
                      Rp {(monthIncome - monthExpense).toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>
              </div>
              <div className="card" style={{ '--section-gradient': 'var(--dashboard-gradient)' } as React.CSSProperties}>
                <h3 className="card-title">
                  <span className="card-title-icon">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
                  </span>
                  7 Hari Terakhir
                </h3>
                {hasData7 ? (
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={last7}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                      <XAxis dataKey="hari" tick={{ fontSize: 11, fill: 'var(--text)' }} />
                      <YAxis tick={{ fontSize: 11, fill: 'var(--text)' }} />
                      <Tooltip />
                      <Bar dataKey="Pemasukan" fill="#00ffd1" radius={[3, 3, 0, 0]} />
                      <Bar dataKey="Pengeluaran" fill="#ff7f50" radius={[3, 3, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <EmptyState icon={EMPTY_ICONS.chart} title="Data 7 hari" description="Grafik akan muncul setelah ada transaksi minggu ini" />
                )}
              </div>
            </div>
          </>
        )}

        {/* ── Transaksi Terbaru ── */}
        <div className="card" style={{  '--section-gradient': 'var(--dashboard-gradient)' } as React.CSSProperties}>
          <h3 className="card-title">
            <span className="card-title-icon">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
            </span>
            Transaksi Terbaru
          </h3>
          <div className="table-scroll">
            <table className="table">
              <thead>
                <tr>
                  <th>Keterangan</th><th>Kategori</th><th>Jumlah</th><th>Tanggal</th><th>Tipe</th>
                </tr>
              </thead>
              <tbody>
                {all.length === 0 ? (
                  <tr><td colSpan={5} style={{ padding: 0 }}>
                    <EmptyState icon={EMPTY_ICONS.wallet} title="Belum ada transaksi" description="Mulai catat pemasukan atau pengeluaran pertama Anda" />
                  </td></tr>
                ) : (
                  all.map((t, i) => (
                    <tr key={`${t.id}-${i}`} className="stagger-item" style={{ animationDelay: `${i * 0.05}s` }}>
                      <td data-label="Keterangan">{t.keterangan}</td>
                      <td data-label="Kategori"><span className="cat-tag">{t.kategori}</span></td>
                      <td data-label="Jumlah" className={t.type === 'income' ? 'text-income' : 'text-expense'}>Rp {t.jumlah.toLocaleString('id-ID')}</td>
                      <td data-label="Tanggal" className="text-muted">{t.tanggal}</td>
                      <td data-label="Tipe"><span className={`badge ${t.type === 'income' ? 'badge-income' : 'badge-expense'}`}>{t.type === 'income' ? 'Pemasukan' : 'Pengeluaran'}</span></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    )
  }

  return (
      <div className="page page-animate">
        <div className="page-header">
          <div>
            <h1>Dashboard</h1>
            <p className="page-subtitle">{formatDate()}</p>
            <span className="page-header-accent" />
          </div>
        </div>

        {saldoBelowSafe && (
          <div className="safe-limit-banner">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            <div className="safe-limit-banner-body">
              <strong>Saldo di bawah batas aman!</strong>
              <p>Saldo saat ini Rp {saldo.toLocaleString('id-ID')} — di bawah batas aman Rp {safeLimit.toLocaleString('id-ID')}. Atur di Profile & Pengaturan.</p>
            </div>
          </div>
        )}

      <div className="stats-row">
        {stats.map((s, i) => (
          <div key={s.label} className={`stat-mini stat-mini--${s.variant} stagger-item`} style={{ animationDelay: `${i * 0.06}s` }}>
            <span className="stat-mini-label">{s.label}</span>
            {s.label === 'Total Transaksi' ? (
              <span className="stat-mini-value">{s.raw.toLocaleString('id-ID')}</span>
            ) : (
              <span className="stat-mini-value">Rp {s.raw.toLocaleString('id-ID')}</span>
            )}
            <span className={`stat-mini-change stat-mini-change--${s.up ? 'up' : 'down'}`}>{s.change}</span>
          </div>
        ))}
      </div>

      <FlowChart totalIncome={totalIncome} totalExpense={totalExpense} />

      {totalTrans > 0 && (
        <div className="health-insight-grid">
          <div className="card health-card" style={{ '--section-gradient': 'var(--dashboard-gradient)' } as React.CSSProperties}>
            <span className="card-title">
              <span className="card-title-icon">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
              </span>
              Skor Kesehatan
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div className="health-score-ring" style={{ borderColor: scoreColor }}>
                <span style={{ color: scoreColor, fontSize: 22, fontWeight: 700 }}>{scoreGrade}</span>
              </div>
              <div style={{ flex: 1 }}>
                <div className="health-metric">
                  <span className="health-metric-label">Rasio Tabungan</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div className="health-bar-track">
                      <div className="health-bar-fill" style={{ width: `${Math.max(0, Math.round(savingsRate * 100))}%`, background: savingsRate >= 0.2 ? 'var(--income)' : 'var(--expense)' }} />
                    </div>
                    <span className={savingsRate >= 0.2 ? 'text-income' : 'text-expense'} style={{ fontSize: 12, fontWeight: 600, minWidth: 40, textAlign: 'right' }}>
                      {Math.round(savingsRate * 100)}%
                    </span>
                  </div>
                </div>
                <div className="health-metric">
                  <span className="health-metric-label">Kepatuhan Budget</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div className="health-bar-track">
                      <div className="health-bar-fill" style={{ width: `${Math.round(budgetHealth * 100)}%`, background: budgetHealth >= 0.7 ? 'var(--income)' : 'var(--budget)' }} />
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 600, minWidth: 40, textAlign: 'right', color: 'var(--text-h)' }}>
                      {Math.round(budgetHealth * 100)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="card insight-card" style={{ '--section-gradient': 'var(--dashboard-gradient)' } as React.CSSProperties}>
            <span className="card-title">
              <span className="card-title-icon">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
              </span>
              Ringkasan Bulan Ini
            </span>
            <div className="insight-grid">
              <div className="insight-item">
                <span className="insight-label">Efisiensi</span>
                <span className="insight-value" style={{ fontWeight: 600 }}>
                  {totalIncome > 0 ? `${Math.round((1 - totalExpense / totalIncome) * 100)}%` : '0%'}
                </span>
              </div>
              {dailyAvgExpense > 0 && (
                <div className="insight-item">
                  <span className="insight-label">Rata-rata/hari</span>
                  <span className="insight-value">Rp {dailyAvgExpense.toLocaleString('id-ID')}</span>
                </div>
              )}
              {topCategory && (
                <div className="insight-item">
                  <span className="insight-label">Terbanyak</span>
                  <span className="insight-value" style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span className="cat-tag">{topCategory.name}</span>
                    Rp {topCategory.amount.toLocaleString('id-ID')}
                  </span>
                </div>
              )}
              {overBudgetCount > 0 && (
                <div className="insight-item">
                  <span className="insight-label">Budget Over</span>
                  <span className="insight-value text-expense">{overBudgetCount} kategori</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {upcomingRecurring.length > 0 && (
        <div className="card" style={{ marginBottom: 20, '--section-gradient': 'var(--dashboard-gradient)' } as React.CSSProperties}>
          <h3 className="card-title">
            <span className="card-title-icon">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            </span>
            Akan Datang Bulan Ini
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {upcomingRecurring.map((r, i) => (
              <div key={i} className="recurring-upcoming-item">
                <div className="recurring-upcoming-left">
                  <span className="recurring-upcoming-day">Tgl {r.hari}</span>
                  <span className="recurring-upcoming-label">{r.label}</span>
                </div>
                <span className={r.type === 'income' ? 'text-income' : 'text-expense'} style={{ fontWeight: 600, fontSize: 13 }}>
                  {r.type === 'income' ? '+' : '−'}Rp {r.jumlah.toLocaleString('id-ID')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {totalTrans > 0 && (
        <div className="grid-2col" style={{ marginBottom: 20 }}>
          <div className="card" style={{ '--section-gradient': 'var(--dashboard-gradient)' } as React.CSSProperties}>
            <h3 className="card-title">
              <span className="card-title-icon">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              </span>
              Bulan Ini
            </h3>
            <div className="summary-stats">
              <div className="summary-stat">
                <span className="summary-stat-label">Pemasukan</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span className="summary-stat-value text-income">Rp {animMonthIncome.toLocaleString('id-ID')}</span>
                  {prevMonthIncome > 0 && (
                    <span className={`stat-mini-change stat-mini-change--${incomeChange >= 0 ? 'up' : 'down'}`}>
                      {incomeChange >= 0 ? '+' : ''}{incomeChange}%
                    </span>
                  )}
                </div>
              </div>
              <div className="summary-stat">
                <span className="summary-stat-label">Pengeluaran</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span className="summary-stat-value text-expense">Rp {animMonthExpense.toLocaleString('id-ID')}</span>
                  {prevMonthExpense > 0 && (
                    <span className={`stat-mini-change stat-mini-change--${expenseChange <= 0 ? 'up' : 'down'}`}>
                      {expenseChange >= 0 ? '+' : ''}{expenseChange}%
                    </span>
                  )}
                </div>
              </div>
              <div className="summary-divider" />
              <div className="summary-stat">
                <span className="summary-stat-label">Saldo Bulan Ini</span>
                <span className={`summary-stat-value ${monthIncome - monthExpense >= 0 ? 'text-income' : 'text-expense'}`}>
                  Rp {(monthIncome - monthExpense).toLocaleString('id-ID')}
                </span>
              </div>
            </div>
          </div>
          <div className="card" style={{ '--section-gradient': 'var(--dashboard-gradient)' } as React.CSSProperties}>
            <h3 className="card-title">
              <span className="card-title-icon">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
              </span>
              7 Hari Terakhir
            </h3>
            {hasData7 ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={last7}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="hari" tick={{ fontSize: 11, fill: 'var(--text)' }} />
                  <YAxis tick={{ fontSize: 11, fill: 'var(--text)' }} />
                  <Tooltip />
                    <Bar dataKey="Pemasukan" fill="#00ffd1" radius={[3, 3, 0, 0]} />
                    <Bar dataKey="Pengeluaran" fill="#ff7f50" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState icon={EMPTY_ICONS.chart} title="Data 7 hari" description="Grafik akan muncul setelah ada transaksi minggu ini" />
            )}
          </div>
        </div>
      )}

      <div className="card" style={{ '--section-gradient': 'var(--dashboard-gradient)' } as React.CSSProperties}>
        <h3 className="card-title">
          <span className="card-title-icon">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
          </span>
          Transaksi Terbaru
        </h3>
        <div className="table-scroll">
          <table className="table">
            <thead>
              <tr>
                <th>Keterangan</th><th>Kategori</th><th>Jumlah</th><th>Tanggal</th><th>Tipe</th>
              </tr>
            </thead>
            <tbody>
              {all.length === 0 ? (
                <tr><td colSpan={5} style={{ padding: 0 }}>
                  <EmptyState icon={EMPTY_ICONS.wallet} title="Belum ada transaksi" description="Mulai catat pemasukan atau pengeluaran pertama Anda" />
                </td></tr>
              ) : (
                all.map((t, i) => (
                  <tr key={`${t.id}-${i}`} className="stagger-item" style={{ animationDelay: `${i * 0.05}s` }}>
                    <td data-label="Keterangan">{t.keterangan}</td>
                    <td data-label="Kategori"><span className="cat-tag">{t.kategori}</span></td>
                    <td data-label="Jumlah" className={t.type === 'income' ? 'text-income' : 'text-expense'}>Rp {t.jumlah.toLocaleString('id-ID')}</td>
                    <td data-label="Tanggal" className="text-muted">{t.tanggal}</td>
                    <td data-label="Tipe"><span className={`badge ${t.type === 'income' ? 'badge-income' : 'badge-expense'}`}>{t.type === 'income' ? 'Pemasukan' : 'Pengeluaran'}</span></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
