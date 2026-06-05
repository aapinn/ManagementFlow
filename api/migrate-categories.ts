import type { VercelRequest, VercelResponse } from '@vercel/node'
import admin from 'firebase-admin'

function getAdmin() {
  if (admin.apps.length > 0) return admin
  const key = process.env.FIREBASE_ADMIN_KEY
  if (!key) throw new Error('FIREBASE_ADMIN_KEY env not set')
  admin.initializeApp({
    credential: admin.credential.cert(JSON.parse(key)),
    projectId: process.env.FIREBASE_PROJECT_ID || 'managementflowbyaapinn',
  })
  return admin
}

const expenseKeywords: Record<string, string[]> = {
  Makanan: [
    'jajan', 'makan', 'minum', 'nasi', 'mie', 'ayam', 'bakso', 'soto', 'sate',
    'goreng', 'kopi', 'teh', 'susu', 'roti', 'kue', 'buah', 'sayur', 'lauk',
    'catering', 'restoran', 'cafe', 'warteg', 'padang', 'seafood', 'burger', 'pizza',
    'snack', 'cemilan', 'martabak', 'cilok', 'seblak', 'pentol', 'siomay', 'batagor',
    'dimsum', 'indomie', 'pop mie', 'sembako', 'beras', 'telur', 'minyak goreng',
    'gula', 'bumbu', 'sarapan', 'tahu', 'tempe', 'ikan', 'daging', 'sayuran',
    'biskuit', 'coklat', 'permen', 'es krim', 'makanan', 'gabut',
    'beli makan', 'beli minum', 'bayar makan', 'jajan pasar',
  ],
  Transport: [
    'bensin', 'tambal ban', 'angkot', 'bus', 'kereta', 'taksi', 'grab', 'gojek',
    'ojek', 'transjakarta', 'tol', 'parkir', 'bbm', 'solar', 'pertalite', 'pertamax',
    'kendaraan', 'bahan bakar', 'isi bensin', 'service', 'oli', 'ban', 'sparepart',
    'cuci motor', 'cuci mobil', 'transport', 'transportasi', 'angkutan', 'karcis',
    'taxi', 'gocar', 'pesawat', 'kapal', 'bengkel', 'montir', 'stnk',
    'pajak kendaraan', 'travel', 'naik angkot', 'naik bus', 'naik kereta',
  ],
  Tagihan: [
    'listrik', 'air', 'pdam', 'pln', 'bpjs', 'pajak', 'telpon', 'telepon', 'internet',
    'wifi', 'pulsa', 'kuota', 'tagihan', 'iuran', 'sewa', 'bpjs kesehatan',
    'bpjs ketenagakerjaan', 'pbb', 'cicilan', 'kredit', 'pinjaman', 'token listrik',
    'langganan', 'subscription', 'domisili', 'hosting', 'domain',
  ],
  Hiburan: [
    'nonton', 'film', 'netflix', 'spotify', 'youtube', 'game', 'steam', 'playstation',
    'bioskop', 'konser', 'liburan', 'jalan-jalan', 'wisata', 'traveling', 'vacation',
    'rekreasi', 'musik', 'streaming', 'jalan jalan', 'nobar', 'topup', 'top up',
    'diamond', 'vip', 'tv kabel', 'hiburan', 'refreshing', 'libur',
  ],
  Belanja: [
    'baju', 'celana', 'sepatu', 'sandal', 'tas', 'aksesoris', 'kosmetik', 'skincare',
    'makeup', 'fashion', 'pakaian', 'belanja', 'shopping', 'shopee', 'tokopedia',
    'lazada', 'bukalapak', 'perlengkapan', 'perabot', 'furniture', 'dekorasi',
    'alat rumah tangga', 'alat masak', 'piring', 'gelas', 'handuk',
    'baterai', 'hiasan', 'sprei', 'gorden',
  ],
  Kesehatan: [
    'obat', 'dokter', 'rumah sakit', 'klinik', 'apotek', 'vitamin', 'medical',
    'check up', 'berobat', 'periksa', 'vaksin', 'masker', 'kesehatan', 'gigi',
    'mata', 'rs', 'puskesmas', 'bidan', 'sakit', 'demam', 'batuk', 'pilek',
    'lab', 'laboratorium', 'tes darah', 'konsultasi',
  ],
  Pendidikan: [
    'kursus', 'les', 'buku', 'sekolah', 'kuliah', 'universitas', 'training',
    'seminar', 'workshop', 'belajar', 'uang saku', 'spp', 'modul',
    'privat', 'bimbel', 'bimbingan belajar', 'online course', 'course',
    'kelas', 'pelatihan', 'pendidikan', 'daftar ulang',
  ],
}

const incomeKeywords: Record<string, string[]> = {
  Gaji: [
    'gaji', 'salary', 'upah', 'honor', 'penghasilan', 'pendapatan', 'thr',
    'bonus', 'gaji bulanan', 'gaiji',
  ],
  Freelance: [
    'freelance', 'proyek', 'project', 'desain', 'coding', 'nulis', 'konten',
    'fotografi', 'videografi', 'kerja lepas', 'design', 'developer',
    'website', 'aplikasi', 'design grafis', 'edit video', 'fotografer',
  ],
  Investasi: [
    'dividen', 'saham', 'crypto', 'reksadana', 'deposito', 'bunga bank',
    'profit', 'capital gain', 'investasi', 'trading', 'forex', 'emas',
    'cryptocurrency', 'bitcoin', 'reksa dana', 'obligasi',
  ],
  Bisnis: [
    'bisnis', 'jualan', 'dagang', 'dagangan', 'penjualan', 'omset', 'revenue',
    'usaha', 'toko', 'warung', 'reseller', 'dropship', 'affiliate',
    'jasa', 'order', 'pesanan', 'customer',
  ],
  Hadiah: [
    'hadiah', 'gift', 'bonus', 'rejeki', 'angpao', 'kado', 'giveaway',
    'menang lomba', 'doorprize', 'undian', 'berkah', 'rezeki', 'pemberian',
  ],
}

function classifyCategory(keterangan: string, type: 'income' | 'expense'): string {
  const lower = keterangan.toLowerCase()
  const map = type === 'expense' ? expenseKeywords : incomeKeywords

  let bestScore = 0
  let bestCat = 'Lainnya'

  for (const [cat, keywords] of Object.entries(map)) {
    let score = 0
    for (const kw of keywords) {
      if (lower.includes(kw)) {
        score += kw.length > 4 ? 3 : 2
        if (lower.startsWith(kw) || lower.endsWith(kw)) score += 1
      }
    }
    if (score > bestScore) {
      bestScore = score
      bestCat = cat
    }
  }

  return bestCat
}

interface LogEntry {
  uid: string
  id: string
  keterangan: string
  oldKategori: string
  newKategori: string
}

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  const start = Date.now()

  try {
    const fb = getAdmin()
    const db = fb.firestore()

    const logs: LogEntry[] = []
    let incomeMigrated = 0
    let expenseMigrated = 0
    let incomeSkipped = 0
    let expenseSkipped = 0

    // Migrate incomes
    const incomeSnap = await db.collection('incomes').listDocuments()
    for (const docRef of incomeSnap) {
      const doc = await docRef.get()
      if (!doc.exists) continue
      const data = doc.data()
      const items = data?.items ?? []
      let changed = false
      for (const item of items) {
        if (!item.keterangan) continue
        const newCat = classifyCategory(item.keterangan, 'income')
        if (item.kategori !== newCat) {
          logs.push({
            uid: docRef.id,
            id: item.id,
            keterangan: item.keterangan,
            oldKategori: item.kategori,
            newKategori: newCat,
          })
          item.kategori = newCat
          changed = true
        }
      }
      if (changed) {
        await docRef.set({ items })
        incomeMigrated++
      } else {
        incomeSkipped++
      }
    }

    // Migrate expenses
    const expenseSnap = await db.collection('expenses').listDocuments()
    for (const docRef of expenseSnap) {
      const doc = await docRef.get()
      if (!doc.exists) continue
      const data = doc.data()
      const items = data?.items ?? []
      let changed = false
      for (const item of items) {
        if (!item.keterangan) continue
        const newCat = classifyCategory(item.keterangan, 'expense')
        if (item.kategori !== newCat) {
          logs.push({
            uid: docRef.id,
            id: item.id,
            keterangan: item.keterangan,
            oldKategori: item.kategori,
            newKategori: newCat,
          })
          item.kategori = newCat
          changed = true
        }
      }
      if (changed) {
        await docRef.set({ items })
        expenseMigrated++
      } else {
        expenseSkipped++
      }
    }

    const elapsed = Date.now() - start

    res.status(200).json({
      ok: true,
      elapsed: `${elapsed}ms`,
      summary: {
        incomeDocsMigrated: incomeMigrated,
        incomeDocsSkipped: incomeSkipped,
        expenseDocsMigrated: expenseMigrated,
        expenseDocsSkipped: expenseSkipped,
        totalItemsChanged: logs.length,
      },
      changes: logs.slice(0, 100),
    })
  } catch (err) {
    console.error('Migration error:', err instanceof Error ? err.message : err)
    res.status(500).json({ ok: false, error: String(err) })
  }
}
