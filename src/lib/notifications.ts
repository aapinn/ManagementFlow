import { doc, setDoc, deleteDoc } from 'firebase/firestore'
import { getToken, onMessage, type Messaging } from 'firebase/messaging'
import { db } from './firebase'

const VAPID_KEY = 'BOYjwfIzqB2eGFQP8JWRFHqxAuvOGY51ZqyxsYnZCxw4uaz9Hv-VIHvxTabHSM196exfVCnmpPk5ABbca9bxD1A'

export async function requestNotificationPermission(uid: string, messaging: Messaging): Promise<boolean> {
  try {
    const perm = await Notification.requestPermission()
    if (perm !== 'granted') return false

    const token = await getToken(messaging, { vapidKey: VAPID_KEY })
    if (token) {
      await setDoc(doc(db, 'fcmTokens', uid), { token })
      return true
    }
    return false
  } catch {
    return false
  }
}

export function onForegroundMessage(messaging: Messaging, handler: (payload: unknown) => void) {
  return onMessage(messaging, handler)
}

export async function removeFcmToken(uid: string) {
  try {
    await deleteDoc(doc(db, 'fcmTokens', uid))
  } catch {
    // non-critical
  }
}
