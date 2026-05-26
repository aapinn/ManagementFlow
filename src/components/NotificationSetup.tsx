import { useEffect, useRef } from 'react'
import { messaging } from '../lib/firebase'
import { requestNotificationPermission, onForegroundMessage } from '../lib/notifications'
import { useAuth } from '../context/AuthContext'
import { showToast } from '../lib/toastBus'

export default function NotificationSetup() {
  const { user } = useAuth()
  const doneRef = useRef(false)

  useEffect(() => {
    if (!user?.uid || doneRef.current) return
    doneRef.current = true

    if ('serviceWorker' in navigator && 'Notification' in window) {
      navigator.serviceWorker.register('/firebase-messaging-sw.js').catch(() => {
        // service worker registration failed; FCM background notifications won't work
      })

      setTimeout(() => requestNotificationPermission(user.uid, messaging), 5000)
    }

    const unsub = onForegroundMessage(messaging, (payload: unknown) => {
      const p = payload as { notification?: { title?: string; body?: string } }
      if (p.notification?.body) {
        showToast(p.notification.body)
      }
    })

    return () => unsub()
  }, [user?.uid])

  return null
}
