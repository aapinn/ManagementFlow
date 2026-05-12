export const INCOME_CATEGORIES = [
  'Gaji',
  'Freelance',
  'Investasi',
  'Bisnis',
  'Hadiah',
  'Lainnya',
] as const

export const EXPENSE_CATEGORIES = [
  'Makanan',
  'Transport',
  'Tagihan',
  'Hiburan',
  'Belanja',
  'Kesehatan',
  'Pendidikan',
  'Lainnya',
] as const

export type IncomeCategory = typeof INCOME_CATEGORIES[number]
export type ExpenseCategory = typeof EXPENSE_CATEGORIES[number]
