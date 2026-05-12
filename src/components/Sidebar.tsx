import { useMemo } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { useBudget } from '../context/BudgetContext'
import { useExpense } from '../context/ExpenseContext'
import type { ReactNode } from 'react'

interface SidebarProps { isOpen: boolean; onClose: () => void }
interface NavItem { label: string; icon: ReactNode; path: string; badge?: number }

function IconSquare() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  )
}
function IconTrendUp() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" />
    </svg>
  )
}
function IconTrendDown() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" /><polyline points="17 18 23 18 23 12" />
    </svg>
  )
}
function IconBarChart() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  )
}
function IconDollar() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  )
}
function IconTarget() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" />
    </svg>
  )
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const { budgets } = useBudget()
  const { expenses } = useExpense()
  const navigate = useNavigate()

  const thisMonth = new Date().toISOString().slice(0, 7)
  const overBudgetCount = useMemo(() => {
    return budgets.filter((b) => {
      if (b.month !== thisMonth) return false
      const spent = expenses.filter((e) => e.tanggal.startsWith(thisMonth) && e.kategori === b.kategori).reduce((s, e) => s + e.jumlah, 0)
      return spent > b.amount
    }).length
  }, [budgets, expenses, thisMonth])

  const navItems: NavItem[] = [
    { label: 'Dashboard', icon: <IconSquare />, path: '/dashboard' },
    { label: 'Pemasukan', icon: <IconTrendUp />, path: '/pemasukan' },
    { label: 'Pengeluaran', icon: <IconTrendDown />, path: '/pengeluaran' },
    { label: 'Laporan', icon: <IconBarChart />, path: '/laporan' },
    { label: 'Budget', icon: <IconDollar />, path: '/budget', badge: overBudgetCount > 0 ? overBudgetCount : undefined },
    { label: 'Target', icon: <IconTarget />, path: '/goals' },
  ]

  const initials = user?.name?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || 'U'

  return (
    <>
      {isOpen && <div className="sidebar-overlay" onClick={onClose} />}
      <aside className={`sidebar${isOpen ? ' sidebar--open' : ''}`}>
        <div className="sidebar-header">
          <NavLink to="/dashboard" className="sidebar-brand" onClick={onClose}>
            <span className="brand-icon">MF</span>
            <span className="brand-name">ManagementFlow</span>
          </NavLink>
          <button className="sidebar-close" onClick={onClose} aria-label="Tutup menu">&times;</button>
        </div>
        <nav className="sidebar-nav">
          {navItems.map(({ label, icon, path, badge }) => (
            <NavLink key={label} to={path} end className={({ isActive }) => `nav-item${isActive ? ' nav-item--active' : ''}`} onClick={onClose}>
              <span className="nav-icon">{icon}</span>
              <span style={{ flex: 1 }}>{label}</span>
              {badge !== undefined && <span className="nav-badge">{badge}</span>}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-footer">
          <button className="sidebar-theme-btn" onClick={toggleTheme} title={`Ganti ke ${theme === 'light' ? 'gelap' : 'terang'}`}>
            <span className="theme-icon">
              {theme === 'light' ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" /></svg>
              )}
            </span>
          </button>
          <button className="sidebar-user" onClick={() => { navigate('/profile'); onClose() }}>
            <span className="avatar sidebar-avatar">{initials}</span>
            <div className="sidebar-user-info">
              <span className="sidebar-user-name">{user?.name || 'User'}</span>
              <span className="sidebar-user-email">{user?.email || ''}</span>
            </div>
          </button>
          <button className="sidebar-logout-btn" onClick={logout} title="Logout">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </button>
        </div>
      </aside>
    </>
  )
}
