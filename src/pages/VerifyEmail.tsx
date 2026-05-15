import { useState, useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { auth } from '../lib/firebase'
import { useAuth } from '../context/AuthContext'
import { incrementRateLimit, getRateLimitMessage } from '../lib/rateLimit'

export default function VerifyEmail() {
  const [searchParams] = useSearchParams()
  const email = searchParams.get('email') || ''
  const alreadySent = searchParams.get('sent') === '1'
  const [error, setError] = useState('')
  const [sent, setSent] = useState(alreadySent)
  const [checking, setChecking] = useState(false)
  const { sendVerification, reloadUser } = useAuth()
  const navigate = useNavigate()
  const intervalRef = useRef<ReturnType<typeof setInterval>>(null)

  useEffect(() => {
    if (!email) {
      navigate('/register', { replace: true })
      return
    }
  }, [email]) // eslint-disable-line react-hooks/exhaustive-deps

  // Poll emailVerified setiap 3 detik
  useEffect(() => {
    intervalRef.current = setInterval(async () => {
      const fbUser = auth.currentUser
      if (!fbUser) return
      await fbUser.reload()
      if (fbUser.emailVerified) {
        clearInterval(intervalRef.current!)
        navigate('/dashboard', { replace: true })
      }
    }, 3000)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [navigate])

  const handleCheck = async () => {
    setChecking(true)
    await reloadUser()
    const fbUser = auth.currentUser
    if (fbUser?.emailVerified) {
      navigate('/dashboard', { replace: true })
    } else {
      setError('Email belum diverifikasi. Cek inbox/spam Anda.')
    }
    setChecking(false)
  }

  const handleResend = async () => {
    setError('')
    const limitMsg = getRateLimitMessage('verifyEmail')
    if (limitMsg) { setError(limitMsg); return }
    incrementRateLimit('verifyEmail')
    const err = await sendVerification()
    if (err) setError(err)
    else setSent(true)
  }

  if (!email) return null

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <span className="auth-logo">MF</span>
          <h1 className="auth-title">Verifikasi Email</h1>
          <p className="auth-subtitle">
            Email verifikasi telah dikirim ke <strong>{email}</strong>
          </p>
        </div>
        {error && <div className="auth-error">{error}</div>}
        {sent && (
          <p style={{ fontSize: 13, color: 'var(--text)', textAlign: 'center', marginBottom: 16, lineHeight: 1.5 }}>
            Klik tautan di email untuk memverifikasi akun Anda, lalu klik tombol di bawah.
          </p>
        )}
        <button className="btn btn-primary btn-full" onClick={handleCheck} disabled={checking}>
          {checking ? 'Memeriksa...' : 'Saya Sudah Verifikasi'}
        </button>
        <div className="auth-links">
          <button className="btn btn-outline btn-full" onClick={handleResend}>
            Kirim Ulang Email
          </button>
        </div>
        <p style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'center', marginTop: 16 }}>
          Email tidak sampai? Cek folder spam atau tunggu beberapa saat.
        </p>
      </div>
    </div>
  )
}
