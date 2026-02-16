import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { ref, set, get as firebaseGet } from 'firebase/database'
import { getFirebaseRealtimeDb } from '@/lib/firebase'

export interface CartItem {
  id: string
  name: string
  price: number
  image: string
  quantity: number
  variantKey?: string // Unique key for variant combination
}

interface CartStore {
  items: CartItem[]
  userId: string | null
  addToCart: (product: Omit<CartItem, 'quantity'>) => void
  removeFromCart: (id: string, variantKey?: string) => void
  updateQuantity: (id: string, quantity: number, variantKey?: string) => void
  clearCart: () => void
  getTotalItems: () => number
  getTotalPrice: () => number
  setUserId: (uid: string | null) => void
  syncFromFirebase: (uid: string) => Promise<void>
  syncToFirebase: () => void
}

const syncCartToFirebase = (uid: string, items: CartItem[]) => {
  try {
    const db = getFirebaseRealtimeDb()
    if (!db || !uid) return
    const cartRef = ref(db, `carts/${uid}`)
    set(cartRef, { items, updatedAt: new Date().toISOString() })
  } catch (e) {
    // Silent fail - local cart still works
  }
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      userId: null,
      setUserId: (uid) => {
        set({ userId: uid })
        if (uid) {
          get().syncFromFirebase(uid)
        }
      },
      syncFromFirebase: async (uid) => {
        try {
          const db = getFirebaseRealtimeDb()
          if (!db) return
          const cartRef = ref(db, `carts/${uid}`)
          const snapshot = await firebaseGet(cartRef)
          if (snapshot.exists()) {
            const data = snapshot.val()
            const localItems = get().items
            const firebaseItems: CartItem[] = data.items || []
            
            // Merge: if local cart has items and firebase has items, combine them
            if (localItems.length > 0 && firebaseItems.length > 0) {
              const merged = [...firebaseItems]
              for (const localItem of localItems) {
                const key = localItem.variantKey ? `${localItem.id}-${localItem.variantKey}` : localItem.id
                const existing = merged.find(m => {
                  const mKey = m.variantKey ? `${m.id}-${m.variantKey}` : m.id
                  return mKey === key
                })
                if (!existing) {
                  merged.push(localItem)
                }
              }
              set({ items: merged })
              syncCartToFirebase(uid, merged)
            } else if (firebaseItems.length > 0) {
              set({ items: firebaseItems })
            } else if (localItems.length > 0) {
              syncCartToFirebase(uid, localItems)
            }
          } else {
            // No firebase cart yet, push local
            const localItems = get().items
            if (localItems.length > 0) {
              syncCartToFirebase(uid, localItems)
            }
          }
        } catch (e) {
          // Silent fail
        }
      },
      syncToFirebase: () => {
        const { userId, items } = get()
        if (userId) {
          syncCartToFirebase(userId, items)
        }
      },
      addToCart: (product) => {
        set((state) => {
          // Use combination of id and variantKey for uniqueness
          const itemKey = product.variantKey ? `${product.id}-${product.variantKey}` : product.id
          const existing = state.items.find((item) => {
            const existingKey = item.variantKey ? `${item.id}-${item.variantKey}` : item.id
            return existingKey === itemKey
          })
          let newItems: CartItem[]
          if (existing) {
            newItems = state.items.map((item) => {
              const existingKey = item.variantKey ? `${item.id}-${item.variantKey}` : item.id
              return existingKey === itemKey
                ? { ...item, quantity: item.quantity + 1 }
                : item
            })
          } else {
            newItems = [...state.items, { ...product, quantity: 1 }]
          }
          // Sync to firebase
          if (state.userId) {
            syncCartToFirebase(state.userId, newItems)
          }
          return { items: newItems }
        })
      },
      removeFromCart: (id, variantKey) => {
        set((state) => {
          const newItems = state.items.filter((item) => {
            if (variantKey) {
              return !(item.id === id && item.variantKey === variantKey)
            }
            return item.id !== id
          })
          if (state.userId) {
            syncCartToFirebase(state.userId, newItems)
          }
          return { items: newItems }
        })
      },
      updateQuantity: (id, quantity, variantKey) => {
        set((state) => {
          const newItems = state.items.map((item) => {
            if (variantKey) {
              return (item.id === id && item.variantKey === variantKey) ? { ...item, quantity } : item
            }
            return item.id === id ? { ...item, quantity } : item
          })
          if (state.userId) {
            syncCartToFirebase(state.userId, newItems)
          }
          return { items: newItems }
        })
      },
      clearCart: () => {
        const { userId } = get()
        if (userId) {
          syncCartToFirebase(userId, [])
        }
        set({ items: [] })
      },
      getTotalItems: () => get().items.reduce((sum, item) => sum + item.quantity, 0),
      getTotalPrice: () =>
        get().items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    }),
    { name: 'cart-storage' }
  )
)
