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

function k<K extends Record<string, string[]>>(obj: K): K { return obj }

const expenseKeywords = k({
  Makanan: [
    'nasi', 'mie', 'ayam', 'bakso', 'soto', 'sate', 'goreng', 'kopi', 'teh',
    'roti', 'kue', 'buah', 'sayur', 'lauk', 'ikan', 'daging', 'tempe', 'tahu',
    'telur', 'susu', 'catering', 'restoran', 'cafe', 'warteg', 'padang',
    'seafood', 'burger', 'pizza', 'snack', 'martabak', 'cilok', 'seblak',
    'pentol', 'siomay', 'batagor', 'dimsum', 'indomie', 'sembako', 'beras',
    'minyak', 'gula', 'bumbu', 'sarapan', 'biskuit', 'coklat', 'permen',
    'jajan', 'makan', 'minum', 'makanan', 'cemilan', 'gabut',
  ],
  Transport: [
    'bensin', 'solar', 'pertalite', 'pertamax', 'premium', 'bbm',
    'angkot', 'bus', 'kereta', 'taksi', 'taxi', 'grab', 'gojek', 'ojek',
    'gocar', 'transjakarta', 'tol', 'parkir', 'bengkel', 'montir',
    'tambal', 'oli', 'ban', 'sparepart', 'service', 'stnk',
    'kendaraan', 'transport', 'transportasi', 'angkutan', 'karcis',
    'pesawat', 'kapal', 'travel', 'bahan bakar',
  ],
  Tagihan: [
    'listrik', 'pln', 'pdam', 'air', 'bpjs', 'pbb', 'pajak',
    'telpon', 'telepon', 'internet', 'wifi', 'pulsa', 'kuota',
    'tagihan', 'iuran', 'sewa', 'cicilan', 'kredit', 'pinjaman',
    'token', 'langganan', 'subscription', 'hosting', 'domain',
  ],
  Hiburan: [
    'nonton', 'film', 'netflix', 'spotify', 'youtube', 'game', 'steam',
    'playstation', 'bioskop', 'konser', 'liburan', 'wisata', 'traveling',
    'jalan-jalan', 'rekreasi', 'musik', 'streaming', 'nobar',
    'topup', 'diamond', 'vip', 'tv', 'hiburan',
  ],
  Belanja: [
    'baju', 'celana', 'sepatu', 'sandal', 'tas', 'aksesoris',
    'kosmetik', 'skincare', 'makeup', 'fashion', 'pakaian',
    'belanja', 'shopping', 'shopee', 'tokopedia', 'lazada',
    'perlengkapan', 'perabot', 'furniture', 'dekorasi',
    'piring', 'gelas', 'handuk', 'baterai', 'sprei', 'gorden',
  ],
  Kesehatan: [
    'obat', 'dokter', 'rs', 'rumah sakit', 'klinik', 'apotek',
    'vitamin', 'vaksin', 'masker', 'berobat', 'periksa',
    'puskesmas', 'bidan', 'sakit', 'demam', 'batuk', 'pilek',
    'lab', 'laboratorium', 'konsultasi', 'kesehatan', 'gigi', 'mata',
  ],
  Pendidikan: [
    'kursus', 'les', 'buku', 'sekolah', 'kuliah', 'spp', 'modul',
    'training', 'seminar', 'workshop', 'privat', 'bimbel',
    'course', 'kelas', 'pelatihan', 'belajar', 'pendidikan',
  ],
})

const incomeKeywords = k({
  Gaji: [
    'gaji', 'salary', 'upah', 'honor', 'thr', 'penghasilan', 'pendapatan',
    'bonus', 'tunjangan', 'insentif', 'komisi',
  ],
  Freelance: [
    'freelance', 'proyek', 'project', 'desain', 'design', 'coding',
    'programming', 'developer', 'nulis', 'konten', 'fotografi', 'videografi',
    'website', 'aplikasi', 'fotografer', 'editing',
  ],
  Investasi: [
    'dividen', 'saham', 'crypto', 'reksadana', 'deposito', 'bunga',
    'profit', 'investasi', 'trading', 'forex', 'emas', 'bitcoin',
    'obligasi', 'capital',
  ],
  Bisnis: [
    'bisnis', 'jualan', 'dagang', 'penjualan', 'omset', 'revenue',
    'usaha', 'toko', 'warung', 'reseller', 'dropship', 'affiliate',
    'jasa', 'order', 'pesanan', 'customer', 'client',
  ],
  Hadiah: [
    'hadiah', 'gift', 'rejeki', 'rezeki', 'angpao', 'kado',
    'giveaway', 'doorprize', 'undian', 'berkah',
  ],
})

function classifyCategory(keterangan: string, type: 'income' | 'expense'): string {
  const lower = keterangan.toLowerCase()
  const words = lower.split(/\s+/).filter(Boolean)
  const map = type === 'expense' ? expenseKeywords : incomeKeywords

  let bestScore = 0
  let bestCat = 'Lainnya'

  for (const [cat, keywords] of Object.entries(map)) {
    let score = 0
    for (const kw of keywords) {
      if (lower.includes(kw)) {
        score += 10
      }
      for (const word of words) {
        if (word === kw) {
          score += 5
        }
        if (word.length >= 4 && word.includes(kw) && kw.length >= 3) {
          score += 3
        }
        if (kw.includes(word) && word.length >= 4) {
          score += 2
        }
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
