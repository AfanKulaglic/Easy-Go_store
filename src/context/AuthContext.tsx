'use client'

import { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from 'react'
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile,
  sendPasswordResetEmail,
  User
} from 'firebase/auth'
import { ref, set, get, update } from 'firebase/database'
import { getFirebaseAuth, getFirebaseRealtimeDb } from '@/lib/firebase'
import { migrateGuestOrders } from '@/lib/realtimeProducts'

export interface UserProfile {
  uid: string
  email: string | null
  displayName: string | null
  photoURL: string | null
  phone?: string
  address?: string
  city?: string
  createdAt?: string
}

interface AuthContextType {
  user: User | null
  userProfile: UserProfile | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, name: string) => Promise<void>
  loginWithGoogle: () => Promise<void>
  logout: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  updateUserProfile: (data: Partial<UserProfile>) => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  // Load user profile from Realtime Database
  const loadUserProfile = useCallback(async (firebaseUser: User) => {
    try {
      const db = getFirebaseRealtimeDb()
      if (!db) return
      const userRef = ref(db, `users/${firebaseUser.uid}`)
      const snapshot = await get(userRef)
      if (snapshot.exists()) {
        setUserProfile(snapshot.val() as UserProfile)
      } else {
        // Create profile for first time
        const newProfile: UserProfile = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
          createdAt: new Date().toISOString(),
        }
        await set(userRef, newProfile)
        setUserProfile(newProfile)
      }
    } catch (error) {
      console.error('Error loading user profile:', error)
    }
  }, [])

  // Listen for auth state changes
  useEffect(() => {
    const auth = getFirebaseAuth()
    if (!auth) {
      setLoading(false)
      return
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser)
      if (firebaseUser) {
        await loadUserProfile(firebaseUser)
        // Migrate any guest orders from this device to the logged-in user
        try {
          const migrated = await migrateGuestOrders(firebaseUser.uid)
          if (migrated > 0) {
            console.log(`Migrated ${migrated} guest order(s) to user ${firebaseUser.uid}`)
          }
        } catch (e) {
          console.error('Error migrating guest orders:', e)
        }
      } else {
        setUserProfile(null)
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [loadUserProfile])

  const login = useCallback(async (email: string, password: string) => {
    const auth = getFirebaseAuth()
    if (!auth) throw new Error('Firebase auth not initialized')
    await signInWithEmailAndPassword(auth, email, password)
  }, [])

  const register = useCallback(async (email: string, password: string, name: string) => {
    const auth = getFirebaseAuth()
    if (!auth) throw new Error('Firebase auth not initialized')
    const credential = await createUserWithEmailAndPassword(auth, email, password)
    
    // Update display name
    await updateProfile(credential.user, { displayName: name })
    
    // Create user profile in database
    const db = getFirebaseRealtimeDb()
    if (db) {
      const userRef = ref(db, `users/${credential.user.uid}`)
      await set(userRef, {
        uid: credential.user.uid,
        email: credential.user.email,
        displayName: name,
        photoURL: null,
        createdAt: new Date().toISOString(),
      })
    }
  }, [])

  const loginWithGoogle = useCallback(async () => {
    const auth = getFirebaseAuth()
    if (!auth) throw new Error('Firebase auth not initialized')
    const provider = new GoogleAuthProvider()
    await signInWithPopup(auth, provider)
  }, [])

  const logout = useCallback(async () => {
    const auth = getFirebaseAuth()
    if (!auth) throw new Error('Firebase auth not initialized')
    await signOut(auth)
    setUser(null)
    setUserProfile(null)
  }, [])

  const resetPassword = useCallback(async (email: string) => {
    const auth = getFirebaseAuth()
    if (!auth) throw new Error('Firebase auth not initialized')
    await sendPasswordResetEmail(auth, email)
  }, [])

  const updateUserProfile = useCallback(async (data: Partial<UserProfile>) => {
    if (!user) throw new Error('Not authenticated')
    const db = getFirebaseRealtimeDb()
    if (!db) throw new Error('Database not initialized')
    
    const userRef = ref(db, `users/${user.uid}`)
    await update(userRef, data)
    
    setUserProfile(prev => prev ? { ...prev, ...data } : null)
    
    // Also update Firebase Auth profile if name changed
    if (data.displayName) {
      const auth = getFirebaseAuth()
      if (auth?.currentUser) {
        await updateProfile(auth.currentUser, { displayName: data.displayName })
      }
    }
  }, [user])

  const contextValue = useMemo(() => ({
    user,
    userProfile,
    loading,
    login,
    register,
    loginWithGoogle,
    logout,
    resetPassword,
    updateUserProfile,
  }), [user, userProfile, loading, login, register, loginWithGoogle, logout, resetPassword, updateUserProfile])

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
