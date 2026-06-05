import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import VerifyEmail from './pages/VerifyEmail'
import Dashboard from './pages/Dashboard'
import Pemasukan from './pages/Pemasukan'
import Pengeluaran from './pages/Pengeluaran'
import Laporan from './pages/Laporan'
import BudgetPage from './pages/BudgetPage'
import GoalsPage from './pages/GoalsPage'
import Profile from './pages/Profile'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import './App.css'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/verify-email" element={<VerifyEmail />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/pemasukan" element={<Pemasukan />} />
          <Route path="/pengeluaran" element={<Pengeluaran />} />
          <Route path="/laporan" element={<Laporan />} />
          <Route path="/budget" element={<BudgetPage />} />
          <Route path="/goals" element={<GoalsPage />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}
