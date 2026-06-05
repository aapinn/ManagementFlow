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

const TOKEN = process.env.TELEGRAM_BOT_TOKEN
const API = `https://api.telegram.org/bot${TOKEN}`

async function send(chatId: number, text: string) {
  if (!TOKEN) { console.error('send: TOKEN not set'); return }
  const res = await fetch(`${API}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text }),
  })
  if (!res.ok) {
    const body = await res.text()
    console.error(`send: HTTP ${res.status}`, body)
  }
}

async function getUid(db: admin.firestore.Firestore, chatId: number): Promise<string | null> {
  const snap = await db.collection('botUsers').doc(String(chatId)).get()
  return snap.exists ? (snap.data()?.uid ?? null) : null
}

function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 9)
}

function parseArgs(args: string[]): { jumlah: number; keterangan: string } | null {
  if (args.length < 2) return null
  const jumlah = parseInt(args[0].replace(/\./g, ''), 10)
  if (isNaN(jumlah) || jumlah <= 0) return null
  return { jumlah, keterangan: args.slice(1).join(' ') }
}

interface K extends Record<string, string[]> {}
function k<K extends K>(obj: K): K { return obj }

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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(200).json({ ok: true })
  }

  const { message } = req.body
  if (!message?.text) return res.status(200).json({ ok: true })

  const chatId = message.chat.id
  const text = message.text.trim()
  const parts = text.split(/\s+/)
  const cmd = parts[0].toLowerCase()
  const args = parts.slice(1)

  if (cmd === '/start') {
    await send(chatId, 'Halo! Saya bot ManagementFlow.\n\n/link <kode> — Hubungkan akun Anda (dapatkan dari Profile > Telegram Bot)\n/masuk <jumlah> <keterangan> — Catat pemasukan\n/keluar <jumlah> <keterangan> — Catat pengeluaran')
    return res.status(200).json({ ok: true })
  }

  try {
    const fb = getAdmin()
    const db = fb.firestore()

    if (cmd === '/link') {
      if (args.length === 0) {
        await send(chatId, 'Gunakan: /link <kode>\n\nKode bisa didapat dari menu Profile > Telegram Bot di aplikasi ManagementFlow.')
        return res.status(200).json({ ok: true })
      }

      const code = args[0]
      const linkSnap = await db.collection('botLinks').doc(code).get()
      if (!linkSnap.exists) {
        await send(chatId, 'Kode tidak valid.')
        return res.status(200).json({ ok: true })
      }

      const linkData = linkSnap.data()!
      if ((linkData.expiresAtTimestamp || 0) < Date.now()) {
        await send(chatId, 'Kode sudah kedaluwarsa. Buat kode baru dari aplikasi.')
        await db.collection('botLinks').doc(code).delete()
        return res.status(200).json({ ok: true })
      }

      await db.collection('botUsers').doc(String(chatId)).set({
        uid: linkData.uid,
        linkedAt: admin.firestore.FieldValue.serverTimestamp(),
      })
      await db.collection('botLinks').doc(code).delete()
      await send(chatId, '✅ Akun berhasil dihubungkan!\n\nSekarang kamu bisa:\n/masuk <jumlah> <keterangan>\n/keluar <jumlah> <keterangan>\n\nContoh: /masuk 500000 gaji')
      return res.status(200).json({ ok: true })
    }

    const uid = await getUid(db, chatId)
    if (!uid) {
      await send(chatId, 'Akun belum dihubungkan. Kirim /link <kode> terlebih dahulu.')
      return res.status(200).json({ ok: true })
    }

    if (cmd === '/masuk') {
      const parsed = parseArgs(args)
      if (!parsed) {
        await send(chatId, 'Gunakan: /masuk <jumlah> <keterangan>\nContoh: /masuk 500000 gaji bulanan')
        return res.status(200).json({ ok: true })
      }

      const incomeCat = classifyCategory(parsed.keterangan, 'income')
      const ref = db.collection('incomes').doc(uid)
      const snap = await ref.get()
      const items = snap.exists ? (snap.data()?.items ?? []) : []
      items.push({
        id: genId(),
        idTransaksi: `TG-${Date.now().toString(36).toUpperCase()}`,
        jumlah: parsed.jumlah,
        keterangan: parsed.keterangan,
        kategori: incomeCat,
        tanggal: new Date().toISOString().slice(0, 10),
        catatan: 'via Telegram',
      })
      await ref.set({ items })

      // Send FCM push notification
      const fcmSnap = await db.collection('fcmTokens').doc(uid).get()
      if (fcmSnap.exists) {
        const fcmToken = fcmSnap.data()?.token
        if (fcmToken) {
          fb.messaging().send({
            token: fcmToken,
            notification: {
              title: 'Pemasukan Baru',
              body: `Rp ${parsed.jumlah.toLocaleString('id-ID')} — ${parsed.keterangan}`,
            },
          }).catch((e: unknown) => console.error('FCM send error:', e instanceof Error ? e.message : e))
        }
      }

      await send(chatId, `✅ Pemasukan tercatat:\nRp ${parsed.jumlah.toLocaleString('id-ID')} — ${parsed.keterangan}\n🗂️ Kategori: ${incomeCat}`)
      return res.status(200).json({ ok: true })
    }

    if (cmd === '/keluar') {
      const parsed = parseArgs(args)
      if (!parsed) {
        await send(chatId, 'Gunakan: /keluar <jumlah> <keterangan>\nContoh: /keluar 25000 nasi goreng')
        return res.status(200).json({ ok: true })
      }

      const expenseCat = classifyCategory(parsed.keterangan, 'expense')

      const ref = db.collection('expenses').doc(uid)
      const snap = await ref.get()
      const items = snap.exists ? (snap.data()?.items ?? []) : []
      items.push({
        id: genId(),
        idTransaksi: `TG-${Date.now().toString(36).toUpperCase()}`,
        jumlah: parsed.jumlah,
        keterangan: parsed.keterangan,
        kategori: expenseCat,
        tanggal: new Date().toISOString().slice(0, 10),
        catatan: 'via Telegram',
      })
      await ref.set({ items })

      // Send FCM push notification
      const fcmSnap = await db.collection('fcmTokens').doc(uid).get()
      if (fcmSnap.exists) {
        const fcmToken = fcmSnap.data()?.token
        if (fcmToken) {
          fb.messaging().send({
            token: fcmToken,
            notification: {
              title: 'Pengeluaran Baru',
              body: `Rp ${parsed.jumlah.toLocaleString('id-ID')} — ${parsed.keterangan}`,
            },
          }).catch((e: unknown) => console.error('FCM send error:', e instanceof Error ? e.message : e))
        }
      }

      await send(chatId, `✅ Pengeluaran tercatat:\nRp ${parsed.jumlah.toLocaleString('id-ID')} — ${parsed.keterangan}\n🗂️ Kategori: ${expenseCat}`)
      return res.status(200).json({ ok: true })
    }

    await send(chatId, 'Perintah tidak dikenal. Gunakan /link, /masuk, atau /keluar.')
  } catch (err) {
    console.error('Handler error:', err instanceof Error ? err.message : err)
    console.error('Stack:', err instanceof Error ? err.stack : '')
    await send(chatId, 'Terjadi kesalahan. Coba lagi nanti.')
  }

  res.status(200).json({ ok: true })
}
