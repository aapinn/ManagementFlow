import { useEffect } from 'react'
import { useRecurringIncome } from '../context/RecurringIncomeContext'
import { useIncome } from '../context/IncomeContext'
import { useToast } from '../context/ToastContext'

export default function RecurringIncomeAuto() {
  const { recurringIncomes, updateRecurringIncome } = useRecurringIncome()
  const { addIncome } = useIncome()
  const { showToast } = useToast()

  useEffect(() => {
    const today = new Date()
    const todayDate = today.getDate()
    const currentMonth = today.toISOString().slice(0, 7)

    for (const r of recurringIncomes) {
      if (!r.aktif) continue
      if (r.lastGenerated === currentMonth) continue
      if (todayDate < r.tanggalHari) continue

      addIncome({
        jumlah: r.jumlah,
        keterangan: r.keterangan + ' (otomatis)',
        kategori: r.kategori,
        idTransaksi: r.idTransaksi + '-' + currentMonth.replace('-', ''),
        catatan: r.catatan,
      })
      updateRecurringIncome(r.id, { lastGenerated: currentMonth })
      showToast(`Pemasukan rutin "${r.keterangan}" otomatis ditambahkan`)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return null
}
