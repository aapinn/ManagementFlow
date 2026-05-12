import { useState, type FormEvent } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function VerifyEmail() {
  const [searchParams] = useSearchParams()
  const email = searchParams.get('email') || ''
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const { verifyCode, sendVerificationCode, isEmailVerified } = useAuth()
  const [demoCode, setDemoCode] = useState(() => email ? sendVerificationCode(email) : '')
  const navigate = useNavigate()

  if (!email) {
    navigate('/register', { replace: true })
    return null
  }

  if (isEmailVerified(email)) {
    navigate('/dashboard', { replace: true })
    return null
  }

  if (success) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <div className="auth-header">
            <span className="auth-logo">MF</span>
            <h1 className="auth-title">Email Terverifikasi</h1>
            <p className="auth-subtitle">Akun Anda sudah siap digunakan</p>
          </div>
          <button className="btn btn-primary btn-full" onClick={() => navigate('/dashboard')}>
            Lanjut ke Dashboard
          </button>
        </div>
      </div>
    )
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    setError('')
    if (!code || code.length !== 6) {
      setError('Masukkan kode verifikasi 6 digit')
      return
    }
    const ok = verifyCode(email, code)
    if (ok) {
      setSuccess(true)
    } else {
      setError('Kode verifikasi salah atau sudah kedaluwarsa')
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <span className="auth-logo">MF</span>
          <h1 className="auth-title">Verifikasi Email</h1>
          <p className="auth-subtitle">Kode telah dikirim ke <strong>{email}</strong></p>
        </div>
        {error && <div className="auth-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="code">Kode Verifikasi (6 digit)</label>
            <input
              id="code"
              type="text"
              inputMode="numeric"
              pattern="[0-9]{6}"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="000000"
              required
              style={{ textAlign: 'center', fontSize: 24, letterSpacing: 8, fontWeight: 700 }}
            />
          </div>
          <button type="submit" className="btn btn-primary btn-full">Verifikasi</button>
        </form>
        <div className="auth-links">
          <button
            className="btn btn-outline btn-full"
            onClick={() => {
              const generated = sendVerificationCode(email)
              setDemoCode(generated)
              setError('')
              setCode('')
            }}
          >
            Kirim Ulang Kode
          </button>
        </div>
        <p style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'center', marginTop: 16 }}>
          Demo: kode verifikasi Anda adalah <strong>{demoCode}</strong>
        </p>
      </div>
    </div>
  )
}
