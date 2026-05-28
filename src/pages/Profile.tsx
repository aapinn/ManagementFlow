import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { useIncome } from '../context/IncomeContext'
import { useExpense } from '../context/ExpenseContext'
import { useBudget } from '../context/BudgetContext'
import { useGoal } from '../context/GoalContext'
import { useToast } from '../context/ToastContext'
import { usePageLoading } from '../hooks/usePageLoading'
import { ProfileSkeleton } from '../components/PageSkeleton'
import { loadItems, saveItems } from '../lib/firestore'
import { db } from '../lib/firebase'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import RupiahInput from '../components/RupiahInput'
import { IonIcon } from '@ionic/react'
import { paperPlane } from 'ionicons/icons'
import { EXPENSE_CATEGORIES } from '../data/categories'
import type { Goal } from '../types'

type Tab = 'profile' | 'settings' | 'budget' | 'goals'

export default function Profile() {
  const loading = usePageLoading()
  const { user, logout, updateName, changePassword } = useAuth()
  const uid = user?.uid
  const { theme, toggleTheme } = useTheme()
  const { incomes, clearIncomes, totalIncome } = useIncome()
  const { expenses, clearExpenses, totalExpense } = useExpense()
  const { budgets, setBudget, removeBudget, getBudget } = useBudget()
  const { goals, addGoal, updateGoal, deleteGoal, addToGoal } = useGoal()
  const { showToast } = useToast()
  const [tab, setTab] = useState<Tab>('profile')
  const [name, setName] = useState(user?.name || '')
  const [email] = useState(user?.email || '')
  const [saving, setSaving] = useState(false)
  const [safeLimit, setSafeLimit] = useState('')
  const [pwCurrent, setPwCurrent] = useState('')
  const [pwNew, setPwNew] = useState('')
  const [pwConfirm, setPwConfirm] = useState('')
  const [pwSaving, setPwSaving] = useState(false)
  const [botLink, setBotLink] = useState('')
  const [botCreating, setBotCreating] = useState(false)

  const BUDGET_ICONS = ['🎯', '🏠', '✈️', '🚗', '📚', '💻', '🏥', '🎓', '💍', '🎮']

  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7))
  const formatMonth = (ym: string) => {
    const [y, m] = ym.split('-')
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
    return `${months[Number(m) - 1]} ${y}`
  }
  const monthBudgets = budgets.filter((b) => b.month === selectedMonth)
  const spentInMonth = (kategori: string) =>
    expenses.filter((e) => e.tanggal.startsWith(selectedMonth) && e.kategori === kategori)
      .reduce((sum, e) => sum + e.jumlah, 0)
  const getMonths = () => {
    const now = new Date()
    const months: string[] = []
    for (let i = 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      months.push(d.toISOString().slice(0, 7))
    }
    return months
  }

  const [goalShowForm, setGoalShowForm] = useState(false)
  const [goalName, setGoalName] = useState('')
  const [goalTarget, setGoalTarget] = useState('')
  const [goalCurrent, setGoalCurrent] = useState('')
  const [goalDeadline, setGoalDeadline] = useState('')
  const [goalIcon, setGoalIcon] = useState('🎯')
  const [goalEditId, setGoalEditId] = useState<string | null>(null)
  const [goalTopUp, setGoalTopUp] = useState<string | null>(null)
  const [goalTopUpAmount, setGoalTopUpAmount] = useState('')

  const resetGoalForm = () => { setGoalName(''); setGoalTarget(''); setGoalCurrent(''); setGoalDeadline(''); setGoalIcon('🎯'); setGoalEditId(null); setGoalShowForm(false) }
  const handleGoalSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!goalName || !goalTarget) return
    const data = { name: goalName, targetAmount: Number(goalTarget), currentAmount: Number(goalCurrent) || 0, deadline: goalDeadline || undefined }
    if (goalEditId) {
      updateGoal(goalEditId, data)
      showToast('Target berhasil diperbarui')
    } else {
      addGoal(data)
      showToast('Target baru berhasil dibuat')
    }
    resetGoalForm()
  }
  const handleGoalEdit = (g: Goal) => {
    setGoalName(g.name); setGoalTarget(String(g.targetAmount)); setGoalCurrent(String(g.currentAmount))
    setGoalDeadline(g.deadline || ''); setGoalEditId(g.id); setGoalShowForm(true)
  }
  const handleGoalTopUp = (id: string) => {
    if (!goalTopUpAmount || Number(goalTopUpAmount) <= 0) return
    addToGoal(id, Number(goalTopUpAmount))
    showToast('Dana berhasil ditambahkan ke target')
    setGoalTopUp(null); setGoalTopUpAmount('')
  }

  useEffect(() => {
    if (!uid) return
    loadItems<{ value: number }>('settings', uid).then((data) => {
      const item = data.find((d) => d.value !== undefined)
      setSafeLimit(item?.value ? String(item.value) : '')
    })
  }, [uid])

  if (loading) return <ProfileSkeleton />

  const initials = name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || 'U'

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) { showToast('Nama tidak boleh kosong', 'error'); return }
    setSaving(true)
    const err = await updateName(name.trim())
    setSaving(false)
    if (err) { showToast(err, 'error'); return }
    showToast('Profil berhasil diperbarui')
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!pwCurrent || !pwNew || !pwConfirm) {
      showToast('Silakan isi semua field', 'error')
      return
    }
    if (pwNew !== pwConfirm) {
      showToast('Password baru tidak cocok', 'error')
      return
    }
    if (pwNew.length < 6) {
      showToast('Password baru minimal 6 karakter', 'error')
      return
    }
    setPwSaving(true)
    const err = await changePassword(pwCurrent, pwNew)
    setPwSaving(false)
    if (err) {
      showToast(err, 'error')
    } else {
      showToast('Password berhasil diubah')
      setPwCurrent('')
      setPwNew('')
      setPwConfirm('')
    }
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
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return
      const reader = new FileReader()
      reader.onload = async (ev) => {
        try {
          const data = JSON.parse(ev.target?.result as string)
          if (!uid) { showToast('Silakan login terlebih dahulu', 'error'); return }
          if (data.incomes) await saveItems('incomes', uid, data.incomes)
          if (data.expenses) await saveItems('expenses', uid, data.expenses)
          if (data.budgets) await saveItems('budgets', uid, data.budgets)
          if (data.goals) await saveItems('goals', uid, data.goals)
          showToast('Data berhasil dipulihkan! Memuat ulang...')
          setTimeout(() => window.location.reload(), 1200)
        } catch { showToast('File backup tidak valid', 'error') }
      }
      reader.readAsText(file)
    }
    input.click()
  }

  const handleSaveSafeLimit = async () => {
    if (!uid) return
    await saveItems('settings', uid, [{ value: Number(safeLimit) || 0 }])
    showToast('Batas aman saldo diperbarui')
  }

  const handleGenerateBotLink = async () => {
    if (!uid) return
    setBotCreating(true)
    const code = Date.now().toString(36) + Math.random().toString(36).slice(2, 9)
    try {
      await setDoc(doc(db, 'botLinks', code), {
        uid,
        createdAt: serverTimestamp(),
        expiresAtTimestamp: Date.now() + 5 * 60 * 1000,
      })
      setBotLink(`Kirim kode ini ke bot Telegram:\n\n/link ${code}\n\nKode berlaku 5 menit.`)
      showToast('Kode berhasil dibuat!')
    } catch (e) {
      console.error('Gagal buat kode:', e)
      showToast('Gagal membuat kode: ' + (e instanceof Error ? e.message : 'unknown'), 'error')
    }
    setBotCreating(false)
  }



  return (
    <div className="page page-animate" style={{ '--section-gradient': 'var(--profile-gradient)' } as React.CSSProperties}>
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
        <button className={`tab ${tab === 'budget' ? 'tab--active' : ''}`} onClick={() => setTab('budget')}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></svg>
          Budget
        </button>
        <button className={`tab ${tab === 'goals' ? 'tab--active' : ''}`} onClick={() => setTab('goals')}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" /></svg>
          Target
        </button>
      </div>

      <div className="card" style={{ '--section-gradient': 'var(--profile-gradient)' } as React.CSSProperties}>
        {tab === 'profile' && (
          <form onSubmit={handleSave}>
            <h3 className="card-title">
              <span className="card-title-icon">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              </span>
              Informasi Akun
            </h3>
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
            <h3 className="card-title">
              <span className="card-title-icon">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              </span>
              Ringkasan Data
            </h3>
            <div className="stats-row" style={{ marginBottom: 0 }}>
              <div className="stat-mini stat-mini--income"><span className="stat-mini-label">Pemasukan</span><span className="stat-mini-value">Rp {totalIncome.toLocaleString('id-ID')}</span></div>
              <div className="stat-mini stat-mini--expense"><span className="stat-mini-label">Pengeluaran</span><span className="stat-mini-value">Rp {totalExpense.toLocaleString('id-ID')}</span></div>
              <div className="stat-mini stat-mini--dashboard"><span className="stat-mini-label">Transaksi</span><span className="stat-mini-value">{incomes.length + expenses.length}</span></div>
              <div className="stat-mini stat-mini--goals"><span className="stat-mini-label">Target</span><span className="stat-mini-value">{goals.length}</span></div>
            </div>
          </form>
        )}
        {tab === 'settings' && (
          <div>
            <h3 className="card-title">
              <span className="card-title-icon">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
              </span>
              Pengaturan
            </h3>

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
                  <RupiahInput
                    value={safeLimit}
                    onChange={setSafeLimit}
                    placeholder="0"
                    style={{ width: 120, padding: '6px 10px', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-sm)', fontSize: 13, fontFamily: 'var(--sans)', background: 'var(--bg)', color: 'var(--text-h)', outline: 'none' }}
                  />
                  <button className="btn btn-primary btn-sm" onClick={handleSaveSafeLimit}>
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
              <div className="settings-row" style={{ flexDirection: 'column', alignItems: 'stretch', gap: 8 }}>
                <span style={{ fontWeight: 600 }}>Ubah Password</span>
                <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <input type="password" value={pwCurrent} onChange={(e) => setPwCurrent(e.target.value)} placeholder="Password saat ini" style={{ padding: '6px 10px', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-sm)', fontSize: 13, fontFamily: 'var(--sans)', background: 'var(--bg)', color: 'var(--text-h)', outline: 'none' }} />
                  <input type="password" value={pwNew} onChange={(e) => setPwNew(e.target.value)} placeholder="Password baru (min 6 karakter)" style={{ padding: '6px 10px', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-sm)', fontSize: 13, fontFamily: 'var(--sans)', background: 'var(--bg)', color: 'var(--text-h)', outline: 'none' }} />
                  <input type="password" value={pwConfirm} onChange={(e) => setPwConfirm(e.target.value)} placeholder="Konfirmasi password baru" style={{ padding: '6px 10px', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-sm)', fontSize: 13, fontFamily: 'var(--sans)', background: 'var(--bg)', color: 'var(--text-h)', outline: 'none' }} />
                  <button type="submit" className="btn btn-primary btn-sm" disabled={pwSaving}>{pwSaving ? 'Menyimpan...' : 'Simpan Password'}</button>
                </form>
              </div>
            </div>

            <div className="settings-divider" />

            <div className="settings-group">
              <h4 className="settings-group-title"><IonIcon icon={paperPlane} style={{ verticalAlign: 'middle', marginRight: 4 }} /> Telegram Bot</h4>
              <div className="settings-row" style={{ flexDirection: 'column', alignItems: 'stretch', gap: 8 }}>
                <p className="text-muted" style={{ fontSize: 12, margin: 0 }}>
                  Catat pemasukan & pengeluaran via Telegram. Hubungkan akun dengan kode sekali pakai.
                </p>
                {botLink ? (
                  <div style={{ background: 'var(--bg-secondary)', padding: 12, borderRadius: 'var(--radius-sm)', fontSize: 13, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                    {botLink}
                  </div>
                ) : (
                  <button className="btn btn-outline btn-sm" onClick={handleGenerateBotLink} disabled={botCreating}>
                    {botCreating ? 'Membuat kode...' : 'Buat Kode Link'}
                  </button>
                )}
              </div>
            </div>

            <div className="settings-divider" />

            <div className="settings-group">
              <h4 className="settings-group-title">Akun</h4>
              <div className="settings-row">
                <span>Keluar dari aplikasi</span>
                <button className="btn btn-danger btn-sm" onClick={logout}>Logout</button>
              </div>
            </div>
          </div>
        )}
        {tab === 'budget' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <h3 className="card-title" style={{ marginBottom: 0 }}>
                <span className="card-title-icon">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                </span>
                Budget Pengeluaran — {formatMonth(selectedMonth)}
              </h3>
              <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} className="filter-select" style={{ width: 140 }}>
                {getMonths().map((m) => <option key={m} value={m}>{formatMonth(m)}</option>)}
              </select>
            </div>

            {monthBudgets.length === 0 && (
              <p className="text-muted" style={{ fontSize: 13, marginBottom: 12 }}>Belum ada budget untuk bulan ini. Klik 'Tambah Budget' di bawah.</p>
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
                        <button className="btn btn-outline btn-sm" onClick={() => { const a = prompt(`Masukkan budget untuk ${kategori} (Rp):`); if (a && Number(a) > 0) { setBudget(selectedMonth, kategori, Number(a)); showToast(`Budget ${kategori} berhasil disimpan`) } }}>Edit</button>
                        <button className="btn btn-danger btn-sm" onClick={() => { const id = monthBudgets.find((b) => b.kategori === kategori)?.id; if (id) { removeBudget(id); showToast(`Budget ${kategori} dihapus`, 'info') } }}>Hapus</button>
                      </>
                    ) : (
                      <button className="btn btn-primary btn-sm" onClick={() => { const a = prompt(`Masukkan budget untuk ${kategori} (Rp):`); if (a && Number(a) > 0) { setBudget(selectedMonth, kategori, Number(a)); showToast(`Budget ${kategori} berhasil disimpan`) } }}>Tambah Budget</button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
        {tab === 'goals' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <h3 className="card-title" style={{ marginBottom: 0 }}>
                <span className="card-title-icon">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                </span>
                Target Keuangan — {goals.filter((g) => g.currentAmount >= g.targetAmount).length} tercapai
              </h3>
              <button className="btn btn-primary btn-sm" onClick={() => { resetGoalForm(); setGoalShowForm(!goalShowForm) }}>
                {goalShowForm ? 'Batal' : '+ Baru'}
              </button>
            </div>

            {goalShowForm && (
              <div className="card" style={{ marginBottom: 16, padding: 16, '--section-gradient': 'var(--goals-gradient)' } as React.CSSProperties}>
                <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>{goalEditId ? 'Edit Target' : 'Target Baru'}</h4>
                <form onSubmit={handleGoalSubmit}>
                  <div className="form-group">
                    <label>Nama Target</label>
                    <input type="text" value={goalName} onChange={(e) => setGoalName(e.target.value)} placeholder="Mis: Beli Laptop" required />
                  </div>
                  <div className="grid-2col">
                    <div className="form-group">
                      <label>Target (Rp)</label>
                      <RupiahInput value={goalTarget} onChange={setGoalTarget} placeholder="Jumlah target" required />
                    </div>
                    <div className="form-group">
                      <label>Sudah Terkumpul (Rp)</label>
                      <RupiahInput value={goalCurrent} onChange={setGoalCurrent} placeholder="0" />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Deadline <span className="text-muted">(opsional)</span></label>
                    <input type="date" value={goalDeadline} onChange={(e) => setGoalDeadline(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label>Ikon</label>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {BUDGET_ICONS.map((ic) => (
                        <button key={ic} type="button" className={`btn btn-sm ${goalIcon === ic ? 'btn-primary' : 'btn-outline'}`} onClick={() => setGoalIcon(ic)} style={{ fontSize: 18, padding: '4px 8px' }}>{ic}</button>
                      ))}
                    </div>
                  </div>
                  <div className="modal-actions" style={{ marginTop: 12 }}>
                    <button type="button" className="btn btn-outline btn-sm" onClick={resetGoalForm}>Batal</button>
                    <button type="submit" className="btn btn-primary btn-sm">{goalEditId ? 'Simpan' : 'Buat Target'}</button>
                  </div>
                </form>
              </div>
            )}

            {goals.length === 0 && !goalShowForm && (
              <p className="text-muted" style={{ fontSize: 13 }}>Belum ada target keuangan.</p>
            )}

            <div>
              {goals.map((g, i) => {
                const pct = g.targetAmount > 0 ? Math.min((g.currentAmount / g.targetAmount) * 100, 100) : 0
                const achieved = g.currentAmount >= g.targetAmount
                return (
                  <div key={g.id} className={`goal-card${achieved ? ' goal-card--done' : ''}`} style={{ marginBottom: 12 }}>
                    <div className="goal-icon">{BUDGET_ICONS[i % BUDGET_ICONS.length]}</div>
                    <div className="goal-body">
                      <div className="goal-header">
                        <span className="goal-name">{g.name}</span>
                        <span className={`goal-pct ${achieved ? 'text-income' : ''}`}>{achieved ? '✓ Tercapai' : `${Math.round(pct)}%`}</span>
                      </div>
                      <div className="budget-bar-track">
                        <div className="budget-bar-fill" style={{ width: `${pct}%`, background: achieved ? '#00ffd1' : 'var(--accent)' }} />
                      </div>
                      <div className="goal-amounts">
                        Rp {g.currentAmount.toLocaleString('id-ID')} / Rp {g.targetAmount.toLocaleString('id-ID')}
                      </div>
                      {g.deadline && <div className="goal-deadline">Deadline: {g.deadline}</div>}
                      <div className="goal-actions">
                        {goalTopUp === g.id ? (
                          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                            <RupiahInput value={goalTopUpAmount} onChange={setGoalTopUpAmount} placeholder="Jumlah" style={{ width: 120, padding: '4px 8px', border: '1px solid var(--border)', borderRadius: 4, fontSize: 13, fontFamily: 'var(--sans)', background: 'var(--bg)', color: 'var(--text-h)' }} />
                            <button className="btn btn-primary btn-sm" onClick={() => handleGoalTopUp(g.id)}>Tambah</button>
                            <button className="btn btn-outline btn-sm" onClick={() => setGoalTopUp(null)}>Batal</button>
                          </div>
                        ) : (
                          <>
                            <button className="btn btn-primary btn-sm" onClick={() => { setGoalTopUp(g.id); setGoalTopUpAmount('') }}>+ Tambah Dana</button>
                            <button className="btn btn-outline btn-sm" onClick={() => handleGoalEdit(g)}>Ubah</button>
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
        )}
      </div>
    </div>
  )
}
