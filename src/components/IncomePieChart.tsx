import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { useIncome } from '../context/IncomeContext'

const COLORS = ['#6366f1', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6']

export default function IncomePieChart() {
  const { incomes } = useIncome()

  const data = incomes.reduce<{ name: string; value: number }[]>((acc, income) => {
    const existing = acc.find((i) => i.name === income.kategori)
    if (existing) {
      existing.value += income.jumlah
    } else {
      acc.push({ name: income.kategori, value: income.jumlah })
    }
    return acc
  }, [])

  if (data.length === 0) {
    return (
      <div className="card">
        <h3 className="card-title">Diagram Pemasukan</h3>
        <p className="empty-state">Belum ada data</p>
      </div>
    )
  }

  return (
    <div className="card">
      <h3 className="card-title">Diagram Pemasukan</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
            {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
