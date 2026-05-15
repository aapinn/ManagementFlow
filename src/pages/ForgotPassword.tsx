import { useState, type FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { sendPasswordResetEmail } from 'firebase/auth'
import { auth } from '../lib/firebase'
import { incrementRateLimit, getRateLimitMessage } from '../lib/rateLimit'

export default function ForgotPassword() {
  const [searchParams] = useSearchParams()
  const forced = searchParams.get('force') === '1'
  const urlEmail = searchParams.get('email') || ''
  const [email, setEmail] = useState(urlEmail)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    const limitMsg = getRateLimitMessage('forgotPassword')
    if (limitMsg) { setError(limitMsg); return }
    if (!email) {
      setError('Masukkan email Anda')
      return
    }
    setLoading(true)
    incrementRateLimit('forgotPassword')
    try {
      await sendPasswordResetEmail(auth, email)
      setDone(true)
    } catch {
      setError('Gagal mengirim email reset. Silakan coba lagi.')
    }
    setLoading(false)
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <span className="auth-logo">MF</span>
          <h1 className="auth-title">ManagementFlow</h1>
          <p className="auth-subtitle">Lupa Password</p>
        </div>
        {forced && (
          <div className="auth-warning">
            Terlalu banyak percobaan login gagal. Harap reset password Anda untuk keamanan akun.
          </div>
        )}
        {error && <div className="auth-error">{error}</div>}

        {!done ? (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                required
              />
            </div>
            <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
              {loading ? 'Mengirim...' : 'Kirim Email Reset'}
            </button>
          </form>
        ) : (
          <div>
            <p style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.5, marginBottom: 16 }}>
              Email reset password telah dikirim ke <strong>{email}</strong>. Klik tautan di email untuk mengatur ulang password Anda.
            </p>
            <button className="btn btn-primary btn-full" onClick={() => setDone(false)}>
              Kirim Ulang
            </button>
          </div>
        )}

        <div className="auth-links">
          <Link to="/login">Kembali ke Login</Link>
        </div>
      </div>
    </div>
  )
}
