import { useState, useRef, useEffect } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import Sidebar from './Sidebar'
import ToastContainer from './Toast'
import { useAuth } from '../context/AuthContext'

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setDropdownOpen(false)
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [])

  const initials = user?.name?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || 'U'

  return (
    <div className="app-layout">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="main-area">
        <header className="topbar">
          <button className="hamburger" onClick={() => setSidebarOpen(true)} aria-label="Buka menu">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          <span className="topbar-title">ManagementFlow</span>
          <div className="topbar-right" ref={dropdownRef}>
            <button className="avatar" onClick={() => setDropdownOpen(!dropdownOpen)}>{initials}</button>
            {dropdownOpen && (
              <div className="dropdown">
                <div className="dropdown-header">
                  <span className="dropdown-name">{user?.name}</span>
                  <span className="dropdown-email">{user?.email}</span>
                </div>
                <hr className="dropdown-divider" />
                <button className="dropdown-btn" onClick={() => { navigate('/profile'); setDropdownOpen(false) }}>
                  Profile & Pengaturan
                </button>
                <hr className="dropdown-divider" />
                <button className="dropdown-btn dropdown-btn--danger" onClick={() => { logout(); navigate('/login'); setDropdownOpen(false) }}>
                  Logout
                </button>
              </div>
            )}
          </div>
        </header>
        <main className="main-content">
          <Outlet />
        </main>
      </div>
      <ToastContainer />
    </div>
  )
}
