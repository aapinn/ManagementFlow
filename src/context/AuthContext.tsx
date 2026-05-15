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
  sendEmailVerification,
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
  updateName: (name: string) => Promise<string | null>
  changePassword: (currentPassword: string, newPassword: string) => Promise<string | null>
  sendVerification: () => Promise<string | null>
  reloadUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

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

  useEffect(() => {
    const hasRedirect = Object.keys(sessionStorage).some((k) =>
      k.startsWith('firebase:redirectState')
    )
    if (!hasRedirect) return

    getRedirectResult(auth)
      .then((result) => {
        if (result?.user?.email) {
          window.location.href = '/dashboard'
        }
      })
      .catch(() => {
        // ignore
      })
  }, [])

  const login = useCallback(async (email: string, password: string): Promise<string | null> => {
    try {
      await signInWithEmailAndPassword(auth, email, password)
      return null
    } catch (err: unknown) {
      const e = err as { code?: string; message?: string }
      console.error('Login error:', e.code, e.message)
      if (e.code === 'auth/user-not-found' || e.code === 'auth/invalid-credential') return 'Email atau password salah'
      if (e.code === 'auth/invalid-email') return 'Format email tidak valid'
      if (e.code === 'auth/too-many-requests') return 'Terlalu banyak percobaan. Coba lagi nanti.'
      if (e.code === 'auth/operation-not-supported') return 'Metode login ini tidak didukung'
      return `Terjadi kesalahan. ${e.message || 'Silakan coba lagi.'}`
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
      const e = err as { code?: string; message?: string }
      console.error('Register error:', e.code, e.message)
      if (e.code === 'auth/email-already-in-use') return 'Email sudah terdaftar'
      if (e.code === 'auth/weak-password') return 'Password terlalu lemah. Minimal 6 karakter.'
      if (e.code === 'auth/invalid-email') return 'Format email tidak valid'
      if (e.code === 'auth/operation-not-allowed') return 'Pendaftaran email sedang dinonaktifkan. Hubungi admin.'
      if (e.code === 'auth/too-many-requests') return 'Terlalu banyak percobaan. Coba lagi nanti.'
      return `Gagal mendaftar. ${e.message || 'Silakan coba lagi.'}`
    }
  }, [])

  const logout = useCallback(async () => {
    await signOut(auth)
  }, [])

  const sendVerification = useCallback(async (): Promise<string | null> => {
    const fbUser = auth.currentUser
    if (!fbUser) return 'Anda harus login terlebih dahulu'
    try {
      await sendEmailVerification(fbUser, {
        url: `${window.location.origin}/dashboard`,
      })
      return null
    } catch {
      return 'Gagal mengirim email verifikasi. Silakan coba lagi.'
    }
  }, [])

  const reloadUser = useCallback(async () => {
    const fbUser = auth.currentUser
    if (fbUser) {
      await fbUser.reload()
      setUser({
        uid: fbUser.uid,
        email: fbUser.email || '',
        name: fbUser.displayName || fbUser.email?.split('@')[0] || 'User',
      })
    }
  }, [])

  const updateName = useCallback(async (name: string): Promise<string | null> => {
    const fbUser = auth.currentUser
    if (!fbUser) return 'Anda harus login terlebih dahulu'
    try {
      await updateProfile(fbUser, { displayName: name })
      setUser((prev) => prev ? { ...prev, name } : null)
      return null
    } catch {
      return 'Gagal memperbarui profil. Silakan coba lagi.'
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
        updateName,
        changePassword,
        sendVerification,
        reloadUser,
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
