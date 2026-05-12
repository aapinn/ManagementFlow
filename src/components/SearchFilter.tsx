import { useRef, useEffect } from 'react'
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES } from '../data/categories'
import { daysAgo } from '../utils/format'

interface SearchFilterProps {
  search: string
  onSearchChange: (v: string) => void
  kategori: string
  onKategoriChange: (v: string) => void
  dateFrom: string
  onDateFromChange: (v: string) => void
  dateTo: string
  onDateToChange: (v: string) => void
  type: 'income' | 'expense'
}

const PRESETS = [
  { label: '7 hari', days: 6 },
  { label: '30 hari', days: 29 },
  { label: 'Bulan ini', days: 'month' as const },
]

export default function SearchFilter({
  search, onSearchChange,
  kategori, onKategoriChange,
  dateFrom, onDateFromChange,
  dateTo, onDateToChange,
  type,
}: SearchFilterProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const categories = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES
  const hasFilter = search || kategori || dateFrom || dateTo

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === '/' && !['INPUT', 'SELECT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
        e.preventDefault()
        inputRef.current?.focus()
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [])

  const applyPreset = (preset: typeof PRESETS[number]) => {
    if (preset.days === 'month') {
      const now = new Date()
      onDateFromChange(new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10))
    } else {
      onDateFromChange(daysAgo(preset.days))
    }
    onDateToChange(new Date().toISOString().slice(0, 10))
  }

  const isPresetActive = (preset: typeof PRESETS[number]) => {
    const today = new Date().toISOString().slice(0, 10)
    if (dateTo !== today) return false
    if (preset.days === 'month') {
      const first = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10)
      return dateFrom === first
    }
    return dateFrom === daysAgo(preset.days)
  }

  return (
    <div className="search-filter">
      <div className="search-field">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="search-icon">
          <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          ref={inputRef}
          type="text"
          placeholder="Cari transaksi... (/)"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="search-input"
        />
        {search && (
          <button className="search-clear" onClick={() => onSearchChange('')}>&times;</button>
        )}
      </div>
      <select value={kategori} onChange={(e) => onKategoriChange(e.target.value)} className="filter-select">
        <option value="">Semua kategori</option>
        {categories.map((c) => <option key={c} value={c}>{c}</option>)}
      </select>
      <div className="filter-presets">
        {PRESETS.map((p) => (
          <button
            key={p.label}
            className={`btn btn-sm ${isPresetActive(p) ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => applyPreset(p)}
          >
            {p.label}
          </button>
        ))}
      </div>
      <input type="date" value={dateFrom} onChange={(e) => onDateFromChange(e.target.value)} className="filter-date" title="Dari tanggal" />
      <input type="date" value={dateTo} onChange={(e) => onDateToChange(e.target.value)} className="filter-date" title="Sampai tanggal" />
      {hasFilter && (
        <button className="btn btn-outline btn-sm" onClick={() => { onSearchChange(''); onKategoriChange(''); onDateFromChange(''); onDateToChange('') }}>
          Reset
        </button>
      )}
    </div>
  )
}
