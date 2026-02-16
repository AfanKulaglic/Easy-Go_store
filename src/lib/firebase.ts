// Firebase must only run on client side
import { initializeApp, getApps, FirebaseApp } from 'firebase/app'
import { getAuth, Auth } from 'firebase/auth'
import { getFirestore, Firestore, initializeFirestore } from 'firebase/firestore'
import { getStorage, FirebaseStorage } from 'firebase/storage'
import { getDatabase, Database } from 'firebase/database'

const firebaseConfig = {
  apiKey: "AIzaSyB6gdI1mHkrLlh6bBrDkoSTVQejCWPbry0",
  authDomain: "easygo-a9fd0.firebaseapp.com",
  databaseURL: "https://easygo-a9fd0-default-rtdb.firebaseio.com",
  projectId: "easygo-a9fd0",
  storageBucket: "easygo-a9fd0.firebasestorage.app",
  messagingSenderId: "630977237034",
  appId: "1:630977237034:web:9d8c0a57eb9bd95679f353"
}

// Lazy initialization - only initialize on client
let app: FirebaseApp | undefined
let auth: Auth | undefined
let db: Firestore | undefined
let storage: FirebaseStorage | undefined
let realtimeDb: Database | undefined

function getFirebaseApp() {
  if (typeof window === 'undefined') {
    return undefined
  }
  if (!app) {
    try {
      app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]
    } catch (error) {
      console.error('[Firebase] Failed to initialize app:', error)
      return undefined
    }
  }
  return app
}

export function getFirebaseAuth() {
  if (!auth) {
    const firebaseApp = getFirebaseApp()
    if (firebaseApp) {
      auth = getAuth(firebaseApp)
    }
  }
  return auth
}

export function getFirebaseDb() {
  if (!db) {
    const firebaseApp = getFirebaseApp()
    if (firebaseApp) {
      try {
        db = getFirestore(firebaseApp)
      } catch (error) {
        console.error('[Firebase] Failed to initialize Firestore:', error)
        return undefined
      }
    }
  }
  return db
}

export function getFirebaseStorage() {
  if (!storage) {
    const firebaseApp = getFirebaseApp()
    if (firebaseApp) {
      storage = getStorage(firebaseApp)
    }
  }
  return storage
}

export function getFirebaseRealtimeDb() {
  if (!realtimeDb) {
    const firebaseApp = getFirebaseApp()
    if (firebaseApp) {
      try {
        realtimeDb = getDatabase(firebaseApp)
      } catch (error) {
        console.error('[Firebase] Failed to initialize Realtime Database:', error)
        return undefined
      }
    }
  }
  return realtimeDb
}

export default getFirebaseApp
