importScripts('https://www.gstatic.com/firebasejs/12.13.0/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/12.13.0/firebase-messaging-compat.js')

firebase.initializeApp({
  apiKey: 'AIzaSyCf8wKqR6j3nskzMdI7BuKy-IPR3NXU8C8',
  authDomain: 'managementflowbyaapinn.firebaseapp.com',
  projectId: 'managementflowbyaapinn',
  storageBucket: 'managementflowbyaapinn.firebasestorage.app',
  messagingSenderId: '8651513196',
  appId: '1:8651513196:web:887ec6bb6d342c76be6749',
  measurementId: 'G-CDHFPSNPNM',
})

const messaging = firebase.messaging()

messaging.onBackgroundMessage((payload) => {
  const { notification } = payload
  const title = notification?.title ?? 'ManagementFlow'
  const options = {
    body: notification?.body ?? '',
    icon: '/icon-192.png',
  }
  self.registration.showNotification(title, options)
})
