const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
const MONTHS_FULL = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']

export function formatRp(n: number): string {
  return `Rp ${n.toLocaleString('id-ID')}`
}

export function formatNumber(n: number): string {
  return n.toLocaleString('id-ID')
}

export function formatMonth(ym: string): string {
  const [y, m] = ym.split('-')
  return `${MONTHS[Number(m) - 1]} ${y}`
}

export function formatMonthFull(ym: string): string {
  const [y, m] = ym.split('-')
  return `${MONTHS_FULL[Number(m) - 1]} ${y}`
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' })
}

export function formatDateLong(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
}

export function thisMonthKey(): string {
  return new Date().toISOString().slice(0, 7)
}

export function daysAgo(n: number): string {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString().slice(0, 10)
}

export function highlightMatch(text: string, query: string): string {
  if (!query) return text
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const regex = new RegExp(`(${escaped})`, 'gi')
  return text.replace(regex, '<mark>$1</mark>')
}
