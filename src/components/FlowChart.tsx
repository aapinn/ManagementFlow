interface FlowChartProps {
  totalIncome: number
  totalExpense: number
}

export default function FlowChart({ totalIncome, totalExpense }: FlowChartProps) {
  const saldo = totalIncome - totalExpense
  const hasData = totalIncome > 0 || totalExpense > 0
  const ratio = totalIncome > 0 ? Math.round((totalExpense / totalIncome) * 100) : 0

  if (!hasData) {
    return (
      <div className="card">
        <h3 className="card-title">Alur Keuangan</h3>
        <p className="empty-state" style={{ padding: '32px 0', margin: 0, textAlign: 'center' }}>
          Belum ada data — mulai catat pemasukan dan pengeluaran Anda
        </p>
      </div>
    )
  }

  return (
    <div className="card" style={{ marginBottom: 24, padding: '28px 24px' }}>
      <h3 className="card-title" style={{ marginBottom: 28, fontSize: 14, fontWeight: 500, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5 }}>Alur Keuangan</h3>

      <div className="flow-bubbles">
        <div className="flow-bubble">
          <div className="flow-bubble-circle flow-bubble-circle--income">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
              <polyline points="17 6 23 6 23 12" />
            </svg>
          </div>
          <span className="flow-bubble-label">Pemasukan</span>
          <span className="flow-bubble-value">Rp {totalIncome.toLocaleString('id-ID')}</span>
        </div>

        <div className="flow-bubble-connector">
          <div className="flow-bubble-line" />
          <span className="flow-bubble-dot" />
        </div>

        <div className={`flow-bubble flow-bubble--${saldo >= 0 ? 'saldo' : 'defisit'}`}>
          <div className={`flow-bubble-circle ${saldo >= 0 ? 'flow-bubble-circle--saldo' : 'flow-bubble-circle--defisit'}`}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="6" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <span className="flow-bubble-label">Saldo</span>
          <span className="flow-bubble-value" style={{ color: saldo >= 0 ? 'var(--accent)' : '#dc2626' }}>
            {saldo >= 0 ? '' : '−'}Rp {Math.abs(saldo).toLocaleString('id-ID')}
          </span>
        </div>

        <div className="flow-bubble-connector">
          <div className="flow-bubble-line" />
          <span className="flow-bubble-dot" />
        </div>

        <div className="flow-bubble">
          <div className="flow-bubble-circle flow-bubble-circle--expense">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" />
              <polyline points="17 18 23 18 23 12" />
            </svg>
          </div>
          <span className="flow-bubble-label">Pengeluaran</span>
          <span className="flow-bubble-value">Rp {totalExpense.toLocaleString('id-ID')}</span>
        </div>
      </div>

      <div className="flow-ratio">
        <span className="flow-ratio-label">Rasio pengeluaran</span>
        <div className="flow-ratio-track">
          <div className="flow-ratio-fill" style={{ width: `${Math.min(ratio, 100)}%` }} />
        </div>
        <span className="flow-ratio-pct">{ratio}%</span>
      </div>
    </div>
  )
}
