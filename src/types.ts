import type { IncomeCategory, ExpenseCategory } from './data/categories'

export interface User {
  uid: string
  email: string
  name: string
}

export interface Income {
  id: string
  idTransaksi: string
  jumlah: number
  keterangan: string
  kategori: IncomeCategory
  tanggal: string
  catatan?: string
}

export interface Expense {
  id: string
  idTransaksi: string
  jumlah: number
  keterangan: string
  kategori: ExpenseCategory
  tanggal: string
  catatan?: string
}

export interface Budget {
  id: string
  month: string
  kategori: string
  amount: number
}

export interface Goal {
  id: string
  name: string
  targetAmount: number
  currentAmount: number
  deadline?: string
  createdAt: string
}

export interface RecurringIncome {
  id: string
  jumlah: number
  keterangan: string
  kategori: IncomeCategory
  idTransaksi: string
  catatan?: string
  tanggalHari: number
  aktif: boolean
  lastGenerated?: string
}

export interface RecurringExpense {
  id: string
  jumlah: number
  keterangan: string
  kategori: ExpenseCategory
  idTransaksi: string
  catatan?: string
  tanggalHari: number
  aktif: boolean
  lastGenerated?: string
}
