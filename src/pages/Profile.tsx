import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { useIncome } from '../context/IncomeContext'
import { useExpense } from '../context/ExpenseContext'
import { useBudget } from '../context/BudgetContext'
import { useGoal } from '../context/GoalContext'
import { useToast } from '../context/ToastContext'
import { usePageLoading } from '../hooks/usePageLoading'
import { ProfileSkeleton } from '../components/PageSkeleton'

type Tab = 'profile' | 'settings'

export default function Profile() {
  const loading = usePageLoading()
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const { incomes, clearIncomes, totalIncome } = useIncome()
  const { expenses, clearExpenses, totalExpense } = useExpense()
  const { budgets } = useBudget()
  const { goals } = useGoal()
  const { showToast } = useToast()
  const [tab, setTab] = useState<Tab>('profile')
  const [name, setName] = useState(user?.name || '')
  const [email] = useState(user?.email || '')
  const [saving, setSaving] = useState(false)
  const [safeLimit, setSafeLimit] = useState(() => {
    if (!user) return ''
    return localStorage.getItem(`safeLimit_${user.uid}`) || ''
  })

  if (loading) return <ProfileSkeleton />

  const initials = name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || 'U'

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    if (user) localStorage.setItem('user', JSON.stringify({ ...user, name }))
    setTimeout(() => { setSaving(false); showToast('Profil berhasil diperbarui') }, 400)
  }

  const handleReset = () => {
    if (window.confirm('Hapus semua data pemasukan dan pengeluaran?')) {
      clearIncomes(); clearExpenses()
      showToast('Semua data berhasil dihapus', 'info')
    }
  }

  const handleBackup = () => {
    const data = { incomes, expenses, budgets, goals, user, exportedAt: new Date().toISOString() }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `managementflow-backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    showToast('Backup berhasil diunduh')
  }

  const handleRestore = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return
      const reader = new FileReader()
      reader.onload = (ev) => {
        try {
          const data = JSON.parse(ev.target?.result as string)
          if (data.incomes) localStorage.setItem('incomes', JSON.stringify(data.incomes))
          if (data.expenses) localStorage.setItem('expenses', JSON.stringify(data.expenses))
          if (data.budgets) localStorage.setItem('budgets', JSON.stringify(data.budgets))
          if (data.goals) localStorage.setItem('goals', JSON.stringify(data.goals))
          showToast('Data berhasil dipulihkan! Memuat ulang...')
          setTimeout(() => window.location.reload(), 1200)
        } catch { showToast('File backup tidak valid', 'error') }
      }
      reader.readAsText(file)
    }
    input.click()
  }

  return (
    <div className="page page-animate">
      <div className="page-header">
        <h1>Profile & Pengaturan</h1>
        <p className="page-subtitle">Kelola akun dan preferensi Anda</p>
      </div>

      <div className="profile-hero">
        <div className="profile-hero-avatar">{initials}</div>
        <div>
          <h2 style={{ margin: 0 }}>{name}</h2>
          <p className="text-muted" style={{ marginTop: 2 }}>{email}</p>
          <div style={{ display: 'flex', gap: 16, marginTop: 8, fontSize: 12, color: 'var(--text-muted)' }}>
            <span>{incomes.length + expenses.length} transaksi</span>
            <span>{goals.length} target</span>
            <span>{budgets.length} budget</span>
          </div>
        </div>
      </div>

      <div className="tabs">
        <button className={`tab ${tab === 'profile' ? 'tab--active' : ''}`} onClick={() => setTab('profile')}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
          Profil
        </button>
        <button className={`tab ${tab === 'settings' ? 'tab--active' : ''}`} onClick={() => setTab('settings')}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" /></svg>
          Pengaturan
        </button>
      </div>

      <div className="card" style={{ maxWidth: 520 }}>
        {tab === 'profile' ? (
          <form onSubmit={handleSave}>
            <h3 className="card-title">Informasi Akun</h3>
            <div className="form-group">
              <label htmlFor="pn">Nama Lengkap</label>
              <input id="pn" type="text" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="form-group">
              <label htmlFor="pe">Email</label>
              <input id="pe" type="email" value={email} disabled className="input-disabled" />
            </div>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Menyimpan...' : 'Simpan Perubahan'}</button>

            <div className="settings-divider" />
            <h3 className="card-title">Ringkasan Data</h3>
            <div className="stats-row" style={{ marginBottom: 0 }}>
              <div className="stat-mini"><span className="stat-mini-label">Pemasukan</span><span className="stat-mini-value text-income">Rp {totalIncome.toLocaleString('id-ID')}</span></div>
              <div className="stat-mini"><span className="stat-mini-label">Pengeluaran</span><span className="stat-mini-value text-expense">Rp {totalExpense.toLocaleString('id-ID')}</span></div>
              <div className="stat-mini"><span className="stat-mini-label">Transaksi</span><span className="stat-mini-value">{incomes.length + expenses.length}</span></div>
              <div className="stat-mini"><span className="stat-mini-label">Target</span><span className="stat-mini-value">{goals.length}</span></div>
            </div>
          </form>
        ) : (
          <div>
            <h3 className="card-title">Pengaturan</h3>

            <div className="settings-group">
              <h4 className="settings-group-title">Tampilan</h4>
              <div className="settings-row">
                <span>Tema</span>
                <button className="btn btn-outline btn-sm" onClick={toggleTheme}>{theme === 'light' ? '☀️ Terang' : '🌙 Gelap'}</button>
              </div>
            </div>

            <div className="settings-divider" />

            <div className="settings-group">
              <h4 className="settings-group-title">Keamanan Saldo</h4>
              <div className="settings-row">
                <div>
                  <span>Batas Aman Saldo</span>
                  <p className="text-muted" style={{ fontSize: 12, marginTop: 2 }}>Notifikasi jika saldo turun di bawah jumlah ini (0 = nonaktif)</p>
                </div>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <input
                    type="number"
                    value={safeLimit}
                    onChange={(e) => setSafeLimit(e.target.value)}
                    placeholder="0"
                    style={{ width: 120, padding: '6px 10px', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-sm)', fontSize: 13, fontFamily: 'var(--sans)', background: 'var(--bg)', color: 'var(--text-h)', outline: 'none' }}
                  />
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => {
                      if (!user) return
                      localStorage.setItem(`safeLimit_${user.uid}`, safeLimit || '0')
                      showToast('Batas aman saldo diperbarui')
                    }}
                  >
                    Simpan
                  </button>
                </div>
              </div>
            </div>

            <div className="settings-divider" />

            <div className="settings-group">
              <h4 className="settings-group-title">Data</h4>
              <div className="settings-row">
                <div><span>Backup Data</span><p className="text-muted" style={{ fontSize: 12, marginTop: 2 }}>Download semua data sebagai file JSON</p></div>
                <button className="btn btn-outline btn-sm" onClick={handleBackup}>Backup</button>
              </div>
              <div className="settings-row">
                <div><span>Restore Data</span><p className="text-muted" style={{ fontSize: 12, marginTop: 2 }}>Pulihkan data dari file backup</p></div>
                <button className="btn btn-outline btn-sm" onClick={handleRestore}>Restore</button>
              </div>
              <div className="settings-row">
                <div><span>Hapus Semua Data</span><p className="text-muted" style={{ fontSize: 12, marginTop: 2 }}>Menghapus semua pemasukan & pengeluaran</p></div>
                <button className="btn btn-danger btn-sm" onClick={handleReset}>Reset</button>
              </div>
            </div>

            <div className="settings-divider" />

            <div className="settings-group">
              <h4 className="settings-group-title">Akun</h4>
              <div className="settings-row">
                <span>Keluar dari aplikasi</span>
                <button className="btn btn-danger btn-sm" onClick={() => { logout(); window.location.href = '/login' }}>Logout</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
