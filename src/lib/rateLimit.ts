const RATE_LIMIT_KEY = 'mf_rateLimits'
const LOGIN_FAIL_KEY = 'mf_loginFailures'

const MAX_ATTEMPTS = 3

type RateLimitAction = 'register' | 'verifyEmail' | 'forgotPassword'

interface RateLimitEntry {
  date: string
  count: number
}

type RateLimits = Record<RateLimitAction, RateLimitEntry>

const DEFAULTS: RateLimits = {
  register: { date: '', count: 0 },
  verifyEmail: { date: '', count: 0 },
  forgotPassword: { date: '', count: 0 },
}

function today(): string {
  return new Date().toISOString().slice(0, 10)
}

function getLimits(): RateLimits {
  try {
    const raw = localStorage.getItem(RATE_LIMIT_KEY)
    if (!raw) return { ...DEFAULTS, ...mapEntries() }
    const parsed = JSON.parse(raw)
    const result = { ...DEFAULTS }
    for (const key of Object.keys(DEFAULTS) as RateLimitAction[]) {
      if (parsed[key] && typeof parsed[key].date === 'string' && typeof parsed[key].count === 'number') {
        result[key] = parsed[key]
      }
    }
    return result
  } catch {
    return { ...DEFAULTS, ...mapEntries() }
  }
}

function mapEntries(): Partial<RateLimits> {
  const result: Partial<RateLimits> = {}
  for (const key of Object.keys(DEFAULTS) as RateLimitAction[]) {
    result[key] = { date: '', count: 0 }
  }
  return result
}

function saveLimits(limits: RateLimits) {
  localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(limits))
}

export function checkRateLimit(action: RateLimitAction): boolean {
  const limits = getLimits()
  const entry = limits[action]
  const todayStr = today()

  if (entry.date !== todayStr) {
    entry.date = todayStr
    entry.count = 0
    saveLimits(limits)
  }

  return entry.count < MAX_ATTEMPTS
}

export function incrementRateLimit(action: RateLimitAction): void {
  const limits = getLimits()
  const entry = limits[action]
  const todayStr = today()

  if (entry.date !== todayStr) {
    entry.date = todayStr
    entry.count = 1
  } else {
    entry.count++
  }

  saveLimits(limits)
}

export function getRateLimitMessage(action: RateLimitAction): string | null {
  if (checkRateLimit(action)) return null
  return `Terlalu banyak percobaan. Batas ${MAX_ATTEMPTS} kali sehari. Silakan coba lagi besok.`
}

// ── Login failure tracker (not rate-limited, just counting) ──

function getLoginFailures(email: string): number {
  try {
    const raw = localStorage.getItem(LOGIN_FAIL_KEY)
    if (!raw) return 0
    const data: Record<string, number> = JSON.parse(raw)
    return data[email.toLowerCase()] || 0
  } catch {
    return 0
  }
}

function setLoginFailures(email: string, count: number): void {
  try {
    const raw = localStorage.getItem(LOGIN_FAIL_KEY)
    const data: Record<string, number> = raw ? JSON.parse(raw) : {}
    data[email.toLowerCase()] = count
    localStorage.setItem(LOGIN_FAIL_KEY, JSON.stringify(data))
  } catch {
    // ignore
  }
}

export function recordLoginFailure(email: string): void {
  setLoginFailures(email, getLoginFailures(email) + 1)
}

export function resetLoginFailures(email: string): void {
  setLoginFailures(email, 0)
}

export function shouldForcePasswordReset(email: string): boolean {
  return getLoginFailures(email) >= 3
}
