import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { useExpense } from '../context/ExpenseContext'

const COLORS = ['#ef4444', '#f59e0b', '#3b82f6', '#8b5cf6', '#10b981', '#ec4899', '#6366f1', '#14b8a6']

export default function ExpensePieChart() {
  const { expenses } = useExpense()

  const data = expenses.reduce<{ name: string; value: number }[]>((acc, exp) => {
    const existing = acc.find((i) => i.name === exp.kategori)
    if (existing) {
      existing.value += exp.jumlah
    } else {
      acc.push({ name: exp.kategori, value: exp.jumlah })
    }
    return acc
  }, [])

  if (data.length === 0) {
    return (
      <div className="card">
        <h3 className="card-title">Diagram Pengeluaran</h3>
        <p className="empty-state">Belum ada data</p>
      </div>
    )
  }

  return (
    <div className="card">
      <h3 className="card-title">Diagram Pengeluaran</h3>
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
