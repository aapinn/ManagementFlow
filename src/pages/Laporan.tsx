import { useMemo } from 'react'
import { useIncome } from '../context/IncomeContext'
import { useExpense } from '../context/ExpenseContext'
import BudgetPanel from '../components/BudgetPanel'
import EmptyState, { EMPTY_ICONS } from '../components/EmptyState'
import { useCountUp } from '../hooks/useCountUp'
import { useToast } from '../context/ToastContext'
import { useColumnSort } from '../hooks/useColumnSort'
import { usePageLoading } from '../hooks/usePageLoading'
import { LaporanSkeleton } from '../components/PageSkeleton'
import { formatRp, formatMonth } from '../utils/format'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, AreaChart, Area } from 'recharts'

function groupByMonth(items: { tanggal: string; jumlah: number }[]) {
  const map = new Map<string, number>()
  for (const item of items) { const m = item.tanggal.slice(0, 7); map.set(m, (map.get(m) || 0) + item.jumlah) }
  return map
}

function exportCSV(rows: { kategori: string; keterangan: string; jumlah: number; tanggal: string; idTransaksi: string; catatan?: string; type: string }[]) {
  const header = 'Tipe,Kategori,Keterangan,Jumlah,ID Transaksi,Tanggal,Catatan'
  const lines = rows.map((r) => [r.type, r.kategori, `"${r.keterangan}"`, r.jumlah, r.idTransaksi, r.tanggal, r.catatan ? `"${r.catatan}"` : ''].join(','))
  const csv = [header, ...lines].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = `laporan-keuangan-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
}

export default function Laporan() {
  const loading = usePageLoading()
  const { incomes, totalIncome } = useIncome()
  const { expenses, totalExpense } = useExpense()
  const { showToast } = useToast()

  const animIncome = useCountUp(totalIncome)
  const animExpense = useCountUp(totalExpense)
  const animSaldo = useCountUp(Math.abs(totalIncome - totalExpense))
  const saldo = totalIncome - totalExpense

  const incomeByMonth = groupByMonth(incomes)
  const expenseByMonth = groupByMonth(expenses)
  const allMonths = [...new Set([...incomeByMonth.keys(), ...expenseByMonth.keys()])].sort()

  const chartData = allMonths.map((m) => ({
    bulan: formatMonth(m),
    Pemasukan: incomeByMonth.get(m) || 0,
    Pengeluaran: expenseByMonth.get(m) || 0,
  }))

  const cumulativeData = useMemo(() => {
    const cum: number[] = []
    return chartData.map((d) => {
      const prev = cum.length > 0 ? cum[cum.length - 1] : 0
      const saldo = prev + d.Pemasukan - d.Pengeluaran
      cum.push(saldo)
      return { ...d, Saldo: saldo }
    })
  }, [chartData])

  const handleExport = () => {
    exportCSV([...incomes.map((i) => ({ ...i, type: 'Pemasukan' })), ...expenses.map((e) => ({ ...e, type: 'Pengeluaran' }))])
    showToast('Data berhasil diexport sebagai CSV')
  }

  const hasData = chartData.length > 0
  const { sorted: sortedRecap, sort: recapSort, toggle: toggleRecap } = useColumnSort(
    chartData.map((d) => ({ ...d, _selisih: d.Pemasukan - d.Pengeluaran })),
    'bulan'
  )
  if (loading) return <LaporanSkeleton />

  const sortIcon = (key: string) => {
    if (recapSort.key !== key) return ' ↕'
    return recapSort.dir === 'asc' ? ' ↑' : ' ↓'
  }

  return (
    <div className="page page-animate">
      <div className="page-header">
        <div>
          <h1>Laporan & Budget</h1>
          <p className="page-subtitle">Rekapan keuangan dan target budget bulanan</p>
        </div>
        <button className="btn btn-outline" onClick={handleExport}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          Export CSV
        </button>
      </div>

      <div className="stats-row">
        <div className="stat-mini stagger-item" style={{ animationDelay: '0s' }}>
          <span className="stat-mini-label">Total Pemasukan</span>
          <span className="stat-mini-value text-income">Rp {animIncome.toLocaleString('id-ID')}</span>
        </div>
        <div className="stat-mini stagger-item" style={{ animationDelay: '0.04s' }}>
          <span className="stat-mini-label">Total Pengeluaran</span>
          <span className="stat-mini-value text-expense">Rp {animExpense.toLocaleString('id-ID')}</span>
        </div>
        <div className="stat-mini stagger-item" style={{ animationDelay: '0.08s' }}>
          <span className="stat-mini-label">Saldo Bersih</span>
          <span className={`stat-mini-value ${saldo >= 0 ? 'text-income' : 'text-expense'}`}>Rp {animSaldo.toLocaleString('id-ID')}</span>
        </div>
        <div className="stat-mini stagger-item" style={{ animationDelay: '0.12s' }}>
          <span className="stat-mini-label">Efisiensi</span>
          <span className="stat-mini-value">{totalIncome > 0 ? `${Math.round((1 - totalExpense / totalIncome) * 100)}%` : '0%'}</span>
        </div>
      </div>

      <div className="grid-2col">
        {hasData ? (
          <div className="card">
            <h3 className="card-title">Grafik Bulanan</h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="bulan" tick={{ fontSize: 11, fill: 'var(--text)' }} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--text)' }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="Pemasukan" fill="#059669" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Pengeluaran" fill="#dc2626" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <EmptyState icon={EMPTY_ICONS.chart} title="Belum ada data grafik" description="Transaksi Anda akan muncul di grafik bulanan" />
          </div>
        )}
        {hasData ? (
          <div className="card">
            <h3 className="card-title">Tren Saldo Kumulatif</h3>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={cumulativeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="bulan" tick={{ fontSize: 11, fill: 'var(--text)' }} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--text)' }} />
                <Tooltip />
                <Area type="monotone" dataKey="Saldo" stroke="#7c6cf0" fill="rgba(124, 108, 240, 0.15)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <EmptyState icon={EMPTY_ICONS.chart} title="Belum ada tren saldo" description="Grafik saldo kumulatif akan muncul setelah ada transaksi" />
          </div>
        )}
      </div>

      <div className="grid-2col" style={{ marginBottom: 20 }}>
        <BudgetPanel />
          <div className="card">
            <h3 className="card-title">Rekapan Bulanan</h3>
            <div className="table-scroll">
              <table className="table">
                <thead>
                  <tr>
                    <th style={{ cursor: 'pointer', userSelect: 'none' }} onClick={() => toggleRecap('bulan')}>Bulan{sortIcon('bulan')}</th>
                    <th style={{ cursor: 'pointer', userSelect: 'none' }} onClick={() => toggleRecap('Pemasukan')}>Pemasukan{sortIcon('Pemasukan')}</th>
                    <th style={{ cursor: 'pointer', userSelect: 'none' }} onClick={() => toggleRecap('Pengeluaran')}>Pengeluaran{sortIcon('Pengeluaran')}</th>
                    <th style={{ cursor: 'pointer', userSelect: 'none' }} onClick={() => toggleRecap('_selisih')}>Saldo{sortIcon('_selisih')}</th>
                  </tr>
                </thead>
                <tbody>
                  {chartData.length === 0 ? (
                    <tr><td colSpan={4} style={{ padding: 0 }}>
                      <EmptyState icon={EMPTY_ICONS.default} title="Belum ada data" description="Rekapan bulanan akan muncul setelah ada transaksi" />
                    </td></tr>
                  ) : (
                    sortedRecap.map((row: Record<string, unknown>, i) => {
                      const r = row as { bulan: string; Pemasukan: number; Pengeluaran: number; _selisih: number }
                      return (
                        <tr key={r.bulan} className="stagger-item" style={{ animationDelay: `${i * 0.05}s` }}>
                          <td className="text-semibold">{r.bulan}</td>
                          <td className="text-income">{formatRp(r.Pemasukan)}</td>
                          <td className="text-expense">{formatRp(r.Pengeluaran)}</td>
                          <td className={r._selisih >= 0 ? 'text-income' : 'text-expense'}>{formatRp(r._selisih)}</td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
      </div>
    </div>
  )
}
