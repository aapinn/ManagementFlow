import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithRedirect,
  getRedirectResult,
  signOut,
  updateProfile,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  onAuthStateChanged,
  sendPasswordResetEmail,
  fetchSignInMethodsForEmail,
} from 'firebase/auth'
import { auth, googleProvider } from '../lib/firebase'
import type { User } from '../types'

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<string | null>
  loginWithGoogle: () => Promise<string | null>
  register: (name: string, email: string, password: string) => Promise<string | null>
  logout: () => Promise<void>
  isAuthenticated: boolean
  isEmailVerified: (email: string) => boolean
  sendVerificationCode: (email: string) => string
  verifyCode: (email: string, code: string) => boolean
  sendPasswordResetCode: (email: string) => Promise<string | null>
  verifyResetCode: (email: string, code: string) => boolean
  completePasswordReset: (email: string) => Promise<string | null>
  changePassword: (currentPassword: string, newPassword: string) => Promise<string | null>
}

const AuthContext = createContext<AuthContextType | null>(null)

function generateCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000))
}

function getVerifiedEmails(): string[] {
  return JSON.parse(localStorage.getItem('verifiedEmails') || '[]')
}

function addVerifiedEmail(email: string) {
  const list = getVerifiedEmails()
  if (!list.includes(email)) {
    list.push(email)
    localStorage.setItem('verifiedEmails', JSON.stringify(list))
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email || '',
          name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
        })
      } else {
        setUser(null)
      }
      setLoading(false)
    })
    return unsub
  }, [])

  // Handle redirect result from Google Sign-In
  useEffect(() => {
    getRedirectResult(auth)
      .then((result) => {
        if (result?.user?.email) {
          addVerifiedEmail(result.user.email)
          window.location.href = '/dashboard'
        }
      })
      .catch(() => {
        // ignore — redirect sign-in failed silently
      })
  }, [])

  const login = useCallback(async (email: string, password: string): Promise<string | null> => {
    try {
      await signInWithEmailAndPassword(auth, email, password)
      return null
    } catch (err: unknown) {
      const e = err as { code?: string }
      if (e.code === 'auth/user-not-found' || e.code === 'auth/invalid-credential') return 'Email atau password salah'
      if (e.code === 'auth/invalid-email') return 'Format email tidak valid'
      if (e.code === 'auth/too-many-requests') return 'Terlalu banyak percobaan. Coba lagi nanti.'
      return 'Terjadi kesalahan. Silakan coba lagi.'
    }
  }, [])

  const loginWithGoogle = useCallback((): Promise<string | null> => {
    signInWithRedirect(auth, googleProvider)
    return Promise.resolve(null)
  }, [])

  const register = useCallback(async (name: string, email: string, password: string): Promise<string | null> => {
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password)
      await updateProfile(cred.user, { displayName: name })
      return null
    } catch (err: unknown) {
      const e = err as { code?: string }
      if (e.code === 'auth/email-already-in-use') return 'Email sudah terdaftar'
      if (e.code === 'auth/weak-password') return 'Password terlalu lemah. Minimal 6 karakter.'
      if (e.code === 'auth/invalid-email') return 'Format email tidak valid'
      return 'Gagal mendaftar. Silakan coba lagi.'
    }
  }, [])

  const logout = useCallback(async () => {
    await signOut(auth)
  }, [])

  const isEmailVerified = useCallback((email: string): boolean => {
    return getVerifiedEmails().includes(email)
  }, [])

  const sendVerificationCode = useCallback((email: string): string => {
    const code = generateCode()
    const data = JSON.parse(localStorage.getItem('emailVerifications') || '{}')
    data[email] = { code, expiry: Date.now() + 10 * 60 * 1000 }
    localStorage.setItem('emailVerifications', JSON.stringify(data))
    return code
  }, [])

  const verifyCode = useCallback((email: string, code: string): boolean => {
    const data = JSON.parse(localStorage.getItem('emailVerifications') || '{}')
    const entry = data[email]
    if (!entry) return false
    if (Date.now() > entry.expiry) {
      delete data[email]
      localStorage.setItem('emailVerifications', JSON.stringify(data))
      return false
    }
    if (entry.code !== code) return false
    delete data[email]
    localStorage.setItem('emailVerifications', JSON.stringify(data))
    addVerifiedEmail(email)
    return true
  }, [])

  const sendPasswordResetCode = useCallback(async (email: string): Promise<string | null> => {
    try {
      const methods = await fetchSignInMethodsForEmail(auth, email)
      if (methods.length === 0) return 'Email tidak terdaftar'
      const code = generateCode()
      const data = JSON.parse(localStorage.getItem('resetCodes') || '{}')
      data[email] = { code, expiry: Date.now() + 10 * 60 * 1000 }
      localStorage.setItem('resetCodes', JSON.stringify(data))
      return code
    } catch {
      return 'Terjadi kesalahan. Silakan coba lagi.'
    }
  }, [])

  const verifyResetCode = useCallback((email: string, code: string): boolean => {
    const data = JSON.parse(localStorage.getItem('resetCodes') || '{}')
    const entry = data[email]
    if (!entry) return false
    if (Date.now() > entry.expiry) {
      delete data[email]
      localStorage.setItem('resetCodes', JSON.stringify(data))
      return false
    }
    if (entry.code !== code) return false
    delete data[email]
    localStorage.setItem('resetCodes', JSON.stringify(data))
    return true
  }, [])

  const completePasswordReset = useCallback(async (email: string): Promise<string | null> => {
    try {
      await sendPasswordResetEmail(auth, email)
      return null
    } catch {
      return 'Gagal mengirim email reset. Silakan coba lagi.'
    }
  }, [])

  const changePassword = useCallback(async (currentPassword: string, newPassword: string): Promise<string | null> => {
    const firebaseUser = auth.currentUser
    if (!firebaseUser || !firebaseUser.email) return 'Anda harus login terlebih dahulu'

    try {
      const cred = EmailAuthProvider.credential(firebaseUser.email, currentPassword)
      await reauthenticateWithCredential(firebaseUser, cred)
      await updatePassword(firebaseUser, newPassword)
      return null
    } catch (err: unknown) {
      const e = err as { code?: string }
      if (e.code === 'auth/wrong-password') return 'Password saat ini salah'
      if (e.code === 'auth/weak-password') return 'Password baru terlalu lemah. Minimal 6 karakter.'
      if (e.code === 'auth/requires-recent-login') return 'Sesi telah habis. Silakan login ulang.'
      return 'Gagal mengubah password. Silakan coba lagi.'
    }
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        loginWithGoogle,
        register,
        logout,
        isAuthenticated: !!user,
        isEmailVerified,
        sendVerificationCode,
        verifyCode,
        sendPasswordResetCode,
        verifyResetCode,
        completePasswordReset,
        changePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
