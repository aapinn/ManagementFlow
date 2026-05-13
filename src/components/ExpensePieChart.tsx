import { useState, useEffect } from 'react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { useExpense } from '../context/ExpenseContext'

const COLORS = ['#ef4444', '#f59e0b', '#3b82f6', '#8b5cf6', '#10b981', '#ec4899', '#6366f1', '#14b8a6']

function usePieSize() {
  const [size, setSize] = useState(() => {
    const w = window.innerWidth
    return { radius: w < 480 ? 55 : w < 768 ? 75 : 100, height: w < 768 ? 250 : 300 }
  })
  useEffect(() => {
    const handler = () => {
      const w = window.innerWidth
      setSize({ radius: w < 480 ? 55 : w < 768 ? 75 : 100, height: w < 768 ? 250 : 300 })
    }
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])
  return size
}

export default function ExpensePieChart() {
  const { expenses } = useExpense()
  const { radius, height } = usePieSize()

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
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={radius} label>
            {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
