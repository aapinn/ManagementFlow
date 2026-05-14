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

export async function saveItems<T>(collection: string, userId: string, items: T[]): Promise<void> {
  const ref = doc(db, collection, userId)
  await setDoc(ref, { items })
}

export async function deleteItems(collection: string, userId: string): Promise<void> {
  const ref = doc(db, collection, userId)
  await deleteDoc(ref)
}
