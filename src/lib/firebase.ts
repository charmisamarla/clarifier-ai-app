import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

// ─── Mock mode detection ──────────────────────────────────────────────────────
export const IS_MOCK_MODE =
  !import.meta.env.VITE_FIREBASE_API_KEY ||
  import.meta.env.VITE_FIREBASE_API_KEY === 'placeholder'

// ─── Firebase config ──────────────────────────────────────────────────────────
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'placeholder',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'placeholder.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'placeholder',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'placeholder.appspot.com',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '000000',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:000000:web:000000',
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)

if (IS_MOCK_MODE) {
  console.info(
    '🎭 Running in MOCK mode — no Firebase credentials found.\n' +
    'Add VITE_FIREBASE_* variables to your .env file to enable real auth and database.'
  )
}
