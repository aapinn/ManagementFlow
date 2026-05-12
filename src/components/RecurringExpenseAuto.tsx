import { useEffect } from 'react'
import { useRecurringExpense } from '../context/RecurringExpenseContext'
import { useExpense } from '../context/ExpenseContext'
import { useToast } from '../context/ToastContext'

export default function RecurringExpenseAuto() {
  const { recurringExpenses, updateRecurringExpense } = useRecurringExpense()
  const { addExpense } = useExpense()
  const { showToast } = useToast()

  useEffect(() => {
    const today = new Date()
    const todayDate = today.getDate()
    const currentMonth = today.toISOString().slice(0, 7)

    for (const r of recurringExpenses) {
      if (!r.aktif) continue
      if (r.lastGenerated === currentMonth) continue
      if (todayDate < r.tanggalHari) continue

      addExpense({
        jumlah: r.jumlah,
        keterangan: r.keterangan + ' (otomatis)',
        kategori: r.kategori,
        idTransaksi: r.idTransaksi + '-' + currentMonth.replace('-', ''),
        catatan: r.catatan,
      })
      updateRecurringExpense(r.id, { lastGenerated: currentMonth })
      showToast(`Pengeluaran rutin "${r.keterangan}" otomatis ditambahkan`)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return null
}
