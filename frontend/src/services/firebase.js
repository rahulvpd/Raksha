import { initializeApp } from 'firebase/app'
import { getDatabase, ref, onValue, set, push, off } from 'firebase/database'

const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL:       import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
}

// Only init if API key is present
let db = null
try {
  if (firebaseConfig.apiKey && firebaseConfig.apiKey !== 'your_firebase_api_key') {
    const app = initializeApp(firebaseConfig)
    db = getDatabase(app)
  }
} catch (e) {
  console.warn('Firebase not initialized:', e.message)
}

// ── EMERGENCY REALTIME ────────────────────────────────
export const pushEmergency = async (emergencyData) => {
  if (!db) return null
  const emergencyRef = ref(db, `emergencies/${emergencyData.emergency_id}`)
  await set(emergencyRef, {
    ...emergencyData,
    timestamp: Date.now(),
    status: 'ACTIVE'
  })
}

export const watchEmergency = (emergencyId, callback) => {
  if (!db) return () => {}
  const emergencyRef = ref(db, `emergencies/${emergencyId}`)
  onValue(emergencyRef, (snap) => callback(snap.val()))
  return () => off(emergencyRef)
}

export const watchAllEmergencies = (callback) => {
  if (!db) return () => {}
  const emergenciesRef = ref(db, 'emergencies')
  onValue(emergenciesRef, (snap) => {
    const data = snap.val()
    callback(data ? Object.values(data) : [])
  })
  return () => off(emergenciesRef)
}

// ── BLOOD BANK ALERTS ─────────────────────────────────
export const pushBloodBankAlert = async (bankId, alertData) => {
  if (!db) return null
  const alertRef = ref(db, `alerts/bloodbanks/${bankId}`)
  await push(alertRef, {
    ...alertData,
    timestamp: Date.now(),
    acknowledged: false
  })
}

export const watchBloodBankAlerts = (bankId, callback) => {
  if (!db) return () => {}
  const alertRef = ref(db, `alerts/bloodbanks/${bankId}`)
  onValue(alertRef, (snap) => {
    const data = snap.val()
    callback(data ? Object.values(data) : [])
  })
  return () => off(alertRef)
}

// ── DONOR ALERTS ──────────────────────────────────────
export const pushDonorAlert = async (bloodGroup, alertData) => {
  if (!db) return null
  const key = bloodGroup.replace('+', 'pos').replace('-', 'neg')
  const alertRef = ref(db, `alerts/donors/${key}`)
  await push(alertRef, { ...alertData, timestamp: Date.now() })
}

export const watchDonorAlerts = (bloodGroup, callback) => {
  if (!db) return () => {}
  const key = bloodGroup.replace('+', 'pos').replace('-', 'neg')
  const alertRef = ref(db, `alerts/donors/${key}`)
  onValue(alertRef, (snap) => {
    const data = snap.val()
    callback(data ? Object.values(data) : [])
  })
  return () => off(alertRef)
}

export { db }
