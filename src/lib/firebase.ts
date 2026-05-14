import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

export const firebaseConfig = {
  apiKey: 'AIzaSyCf8wKqR6j3nskzMdI7BuKy-IPR3NXU8C8',
  authDomain: 'managementflowbyaapinn.firebaseapp.com',
  projectId: 'managementflowbyaapinn',
  storageBucket: 'managementflowbyaapinn.firebasestorage.app',
  messagingSenderId: '8651513196',
  appId: '1:8651513196:web:887ec6bb6d342c76be6749',
  measurementId: 'G-CDHFPSNPNM',
}

export const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)
export const googleProvider = new GoogleAuthProvider()
