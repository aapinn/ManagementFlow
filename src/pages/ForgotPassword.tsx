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
    if (typeof result === 'string' && result.includes('tidak terdaftar')) {
      setError(result)
      return
    }
    setDemoCode(result as string)
    setStep('code')
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
    const err = await completePasswordReset(email)
    setLoading(false)
    if (err) {
      setError(err)
    } else {
      setStep('done')
    }
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
            {step === 'done' && 'Email Terkirim'}
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
          </form>
        )}

        {step === 'done' && (
          <div>
            <p style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.5, marginBottom: 20 }}>
              Kode berhasil diverifikasi! Email untuk mengatur ulang password telah dikirim ke <strong>{email}</strong>.
              Silakan cek inbox email Anda dan ikuti tautan yang diberikan.
            </p>
            <Link to="/login" className="btn btn-primary btn-full">Kembali ke Login</Link>
          </div>
        )}

        <div className="auth-links">
          <Link to="/login">Kembali ke Login</Link>
        </div>
      </div>
    </div>
  )
}
