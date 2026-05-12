import { useTheme } from '../context/ThemeContext'
import { useIncome } from '../context/IncomeContext'
import { useExpense } from '../context/ExpenseContext'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

export default function Settings() {
  const { theme, toggleTheme } = useTheme()
  const { clearIncomes } = useIncome()
  const { clearExpenses } = useExpense()
  const { logout } = useAuth()
  const { showToast } = useToast()

  const handleReset = () => {
    if (window.confirm('Hapus semua data pemasukan dan pengeluaran?')) {
      clearIncomes()
      clearExpenses()
      showToast('Semua data berhasil dihapus', 'info')
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>Pengaturan</h1>
        <p className="page-subtitle">Atur preferensi aplikasi Anda</p>
      </div>

      <div className="card" style={{ maxWidth: 500 }}>
        <div className="settings-group">
          <h3 className="settings-group-title">Tampilan</h3>
          <div className="settings-row">
            <span>Tema</span>
            <button className="btn btn-outline" onClick={toggleTheme}>
              {theme === 'light' ? '☀️ Terang' : '🌙 Gelap'}
            </button>
          </div>
        </div>

        <div className="settings-divider" />

        <div className="settings-group">
          <h3 className="settings-group-title">Data</h3>
          <div className="settings-row">
            <div>
              <span>Hapus Semua Data</span>
              <p className="text-muted" style={{ fontSize: 12, marginTop: 2 }}>
                Menghapus semua data pemasukan dan pengeluaran
              </p>
            </div>
            <button className="btn btn-danger" onClick={handleReset}>
              Reset Data
            </button>
          </div>
        </div>

        <div className="settings-divider" />

        <div className="settings-group">
          <h3 className="settings-group-title">Akun</h3>
          <div className="settings-row">
            <span>Keluar dari aplikasi</span>
            <button className="btn btn-danger" onClick={() => { logout(); window.location.href = '/login' }}>
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
