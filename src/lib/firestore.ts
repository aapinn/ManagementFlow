import { doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore'
import { db } from './firebase'

export async function loadItems<T>(collection: string, userId: string): Promise<T[]> {
  try {
    const ref = doc(db, collection, userId)
    const snap = await getDoc(ref)
    return snap.exists() ? (snap.data().items as T[]) : []
  } catch {
    return []
  }
}

function clean<T>(data: T): T {
  if (Array.isArray(data)) return data.map(clean) as T
  if (data && typeof data === 'object') {
    const cleaned: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(data as Record<string, unknown>)) {
      if (v !== undefined) cleaned[k] = clean(v)
    }
    return cleaned as T
  }
  return data
}

export async function saveItems<T>(collection: string, userId: string, items: T[]): Promise<void> {
  const ref = doc(db, collection, userId)
  await setDoc(ref, { items: clean(items) })
}

export async function deleteItems(collection: string, userId: string): Promise<void> {
  const ref = doc(db, collection, userId)
  await deleteDoc(ref)
}
