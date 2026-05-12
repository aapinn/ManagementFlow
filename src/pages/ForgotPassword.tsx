import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

type Step = 'email' | 'code' | 'done'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState<Step>('email')
  const [demoCode, setDemoCode] = useState('')
  const [resetLink, setResetLink] = useState('')
  const [resendCount, setResendCount] = useState(0)
  const [resendCooldown, setResendCooldown] = useState(0)
  const { sendPasswordResetCode, verifyResetCode, completePasswordReset } = useAuth()

  const handleSendCode = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    if (!email) {
      setError('Masukkan email Anda')
      return
    }
    setLoading(true)
    const result = await sendPasswordResetCode(email)
    setLoading(false)
    if (result === null) {
      setError('Gagal mengirim kode. Silakan coba lagi.')
      return
    }
    if (typeof result === 'string' && (result.includes('tidak terdaftar') || result.includes('Tunggu') || result.includes('Terlalu banyak'))) {
      setError(result)
      return
    }
    setDemoCode(result as string)
    setResendCount(1)
    setStep('code')
    startCooldown()
  }

  const handleResendCode = async () => {
    setError('')
    setLoading(true)
    const result = await sendPasswordResetCode(email)
    setLoading(false)
    if (result === null) {
      setError('Gagal mengirim kode. Silakan coba lagi.')
      return
    }
    if (typeof result === 'string' && (result.includes('tidak terdaftar') || result.includes('Tunggu') || result.includes('Terlalu banyak'))) {
      setError(result)
      return
    }
    setDemoCode(result as string)
    setResendCount((c) => c + 1)
    startCooldown()
  }

  const startCooldown = () => {
    setResendCooldown(60)
    const interval = setInterval(() => {
      setResendCooldown((c) => {
        if (c <= 1) {
          clearInterval(interval)
          return 0
        }
        return c - 1
      })
    }, 1000)
  }

  const handleVerifyCode = (e: FormEvent) => {
    e.preventDefault()
    setError('')
    if (!code || code.length !== 6) {
      setError('Masukkan kode verifikasi 6 digit')
      return
    }
    const ok = verifyResetCode(email, code)
    if (ok) {
      handleCompleteReset()
    } else {
      setError('Kode verifikasi salah atau sudah kedaluwarsa')
    }
  }

  const handleCompleteReset = async () => {
    setLoading(true)
    const result = await completePasswordReset(email)
    setLoading(false)
    if (!result) {
      setError('Gagal mengirim email reset. Silakan coba lagi.')
      return
    }
    if (typeof result === 'string') {
      setError(result)
      return
    }
    setResetLink(result.resetLink)
    setStep('done')
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <span className="auth-logo">MF</span>
          <h1 className="auth-title">ManagementFlow</h1>
          <p className="auth-subtitle">
            {step === 'email' && 'Lupa Password'}
            {step === 'code' && 'Verifikasi Email'}
            {step === 'done' && 'Atur Ulang Password'}
          </p>
        </div>
        {error && <div className="auth-error">{error}</div>}

        {step === 'email' && (
          <form onSubmit={handleSendCode}>
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
              {loading ? 'Mengirim...' : 'Kirim Kode Verifikasi'}
            </button>
          </form>
        )}

        {step === 'code' && (
          <form onSubmit={handleVerifyCode}>
            <p style={{ fontSize: 13, color: 'var(--text)', marginBottom: 16, lineHeight: 1.5 }}>
              Kode verifikasi telah dikirim ke <strong>{email}</strong>. Masukkan kode 6 digit untuk melanjutkan.
            </p>
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
            <button type="submit" className="btn btn-primary btn-full">Verifikasi Kode</button>
            <p style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'center', marginTop: 16 }}>
              Demo: kode verifikasi Anda adalah <strong>{demoCode}</strong>
            </p>
            {resendCount < 3 ? (
              <button
                type="button"
                className="btn btn-outline btn-full"
                style={{ marginTop: 8 }}
                disabled={resendCooldown > 0 || loading}
                onClick={handleResendCode}
              >
                {resendCooldown > 0
                  ? `Kirim Ulang (${resendCooldown}s)`
                  : loading
                    ? 'Mengirim...'
                    : 'Kirim Ulang Kode'}
              </button>
            ) : (
              <p style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'center', marginTop: 12 }}>
                Anda telah mencapai batas maksimal kirim ulang.
              </p>
            )}
          </form>
        )}

        {step === 'done' && (
          <div>
            <p style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.5, marginBottom: 16 }}>
              Kode berhasil diverifikasi! Klik tautan di bawah untuk mengatur ulang password Anda:
            </p>
            <a
              href={resetLink}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary btn-full"
              style={{ marginBottom: 12, textDecoration: 'none' }}
            >
              Buka Tautan Reset Password
            </a>
            <p style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'center', lineHeight: 1.5 }}>
              Atau salin tautan ini ke browser:{' '}
              <a href={resetLink} target="_blank" rel="noopener noreferrer" style={{ wordBreak: 'break-all', fontSize: 10 }}>
                {resetLink}
              </a>
            </p>
          </div>
        )}

        <div className="auth-links">
          <Link to="/login">Kembali ke Login</Link>
        </div>
      </div>
    </div>
  )
}
