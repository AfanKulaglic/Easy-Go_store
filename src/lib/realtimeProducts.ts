'use client'

import { 
  ref, 
  get, 
  set, 
  push, 
  update, 
  remove, 
  onValue,
  query,
  orderByChild,
  equalTo,
  limitToFirst,
  Database
} from 'firebase/database'
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage'
import { getFirebaseRealtimeDb, getFirebaseStorage } from './firebase'

export interface ProductReview {
  id: string
  name: string
  rating: number
  comment: string
  date: string
  avatar?: string
}

export interface ProductVariant {
  id: string
  value: string
  price: number
  stock?: number
  image?: string
}

export interface Product {
  id?: string
  name: string
  slug?: string
  price: number
  originalPrice?: number
  category: string
  categorySlug: string
  subcategoryId?: string
  subcategorySlug?: string
  image: string
  images?: string[]
  videoUrl?: string
  description: string
  rating: number
  reviews: number
  stock?: number
  productReviews?: ProductReview[]
  badge?: 'sale' | 'new' | 'discount' | ''
  discountPercent?: number
  soldPercent?: number
  isFlashDeal?: boolean
  showInHero?: boolean
  heroSubtitle?: string
  colors?: string[]
  features?: string[]
  variants?: ProductVariant[]
  hideStandardVariant?: boolean
  standardVariantLabel?: string
  warrantyText?: string
  deliveryTime?: string
  returnDays?: number
  createdAt?: number
  updatedAt?: number
}

export interface Category {
  id?: string
  name: string
  slug: string
  icon: string
  showOnHome?: boolean
}

export interface Subcategory {
  id?: string
  name: string
  slug: string
  categoryId: string
}

export interface ChatMessage {
  id?: string
  name: string
  email: string
  message: string
  adminReply?: string
  repliedAt?: number
  createdAt: number
  read: boolean
}

export interface OrderItem {
  productId: string
  productName: string
  productImage: string
  selectedVariants?: string
  price: number
  quantity: number
}

export interface Order {
  id?: string
  items: OrderItem[]
  totalPrice: number
  customerName: string
  customerSurname: string
  customerEmail: string
  customerPhone: string
  customerAddress: string
  customerCity: string
  status: 'new' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  seen: boolean
  createdAt: number
  updatedAt?: number
}

export interface ProductView {
  id?: string
  productId: string
  productName: string
  viewedAt: number
  userAgent?: string
  referrer?: string
}

// Generate URL slug from text
export function generateSlug(text: string): string {
  const charMap: Record<string, string> = {
    'č': 'c', 'ć': 'c', 'đ': 'dj', 'š': 's', 'ž': 'z',
    'Č': 'c', 'Ć': 'c', 'Đ': 'dj', 'Š': 's', 'Ž': 'z'
  }
  return text
    .split('')
    .map(c => charMap[c] || c)
    .join('')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

// Helper to convert object to array with IDs
function objectToArray<T>(obj: Record<string, T> | null): (T & { id: string })[] {
  if (!obj) return []
  return Object.entries(obj).map(([id, data]) => ({ ...data, id }))
}

// Ensure products have slugs
function ensureProductSlugs(products: Product[]): Product[] {
  return products.map(p => ({
    ...p,
    slug: p.slug || generateSlug(p.name)
  }))
}

// Products
export const getProducts = async (): Promise<Product[]> => {
  console.log('[Realtime DB] Fetching products...')
  const db = getFirebaseRealtimeDb()
  if (!db) {
    console.error('[Realtime DB] Database not available')
    return []
  }
  try {
    const snapshot = await get(ref(db, 'products'))
    const products = ensureProductSlugs(objectToArray<Product>(snapshot.val()))
    console.log(`[Realtime DB] Fetched ${products.length} products`)
    return products
  } catch (error) {
    console.error('[Realtime DB] Error fetching products:', error)
    return []
  }
}

export const getProductById = async (id: string): Promise<Product | null> => {
  const db = getFirebaseRealtimeDb()
  if (!db) return null
  try {
    const snapshot = await get(ref(db, `products/${id}`))
    if (!snapshot.exists()) return null
    const product = { id, ...snapshot.val() } as Product
    product.slug = product.slug || generateSlug(product.name)
    return product
  } catch (error) {
    console.error('[Realtime DB] Error fetching product:', error)
    return null
  }
}

// Recursively remove undefined values from an object (Firebase rejects undefined)
const deepCleanUndefined = (obj: unknown): unknown => {
  if (obj === null || obj === undefined) return null
  if (Array.isArray(obj)) return obj.map(deepCleanUndefined)
  if (typeof obj === 'object') {
    return Object.fromEntries(
      Object.entries(obj as Record<string, unknown>)
        .filter(([_, v]) => v !== undefined)
        .map(([k, v]) => [k, deepCleanUndefined(v)])
    )
  }
  return obj
}

export const addProduct = async (product: Omit<Product, 'id'>): Promise<string> => {
  const db = getFirebaseRealtimeDb()
  if (!db) throw new Error('Database not initialized')
  
  const cleanProduct = deepCleanUndefined(product)
  
  const newRef = push(ref(db, 'products'))
  await set(newRef, {
    ...(cleanProduct as Record<string, unknown>),
    createdAt: Date.now(),
    updatedAt: Date.now()
  })
  return newRef.key!
}

export const updateProduct = async (id: string, product: Partial<Product>): Promise<void> => {
  const db = getFirebaseRealtimeDb()
  if (!db) throw new Error('Database not initialized')
  
  const cleanProduct = deepCleanUndefined(product)
  
  await update(ref(db, `products/${id}`), {
    ...(cleanProduct as Record<string, unknown>),
    updatedAt: Date.now()
  })
}

export const deleteProduct = async (id: string): Promise<void> => {
  const db = getFirebaseRealtimeDb()
  if (!db) throw new Error('Database not initialized')
  await remove(ref(db, `products/${id}`))
}

export const subscribeToProducts = (
  callback: (products: Product[]) => void,
  options?: { limit?: number; orderBy?: string }
) => {
  const db = getFirebaseRealtimeDb()
  if (!db) {
    callback([])
    return () => {}
  }
  
  // Use query with limit if specified
  const productsRef = ref(db, 'products')
  const productsQuery = options?.limit 
    ? query(productsRef, limitToFirst(options.limit))
    : productsRef
  
  const unsubscribe = onValue(productsQuery, (snapshot) => {
    const products = ensureProductSlugs(objectToArray<Product>(snapshot.val()))
    callback(products)
  })
  return unsubscribe
}

// Categories
export const getCategories = async (): Promise<Category[]> => {
  console.log('[Realtime DB] Fetching categories...')
  const db = getFirebaseRealtimeDb()
  if (!db) {
    console.error('[Realtime DB] Database not available')
    return []
  }
  try {
    const snapshot = await get(ref(db, 'categories'))
    const categories = objectToArray<Category>(snapshot.val())
    console.log(`[Realtime DB] Fetched ${categories.length} categories`)
    return categories
  } catch (error) {
    console.error('[Realtime DB] Error fetching categories:', error)
    return []
  }
}

export const addCategory = async (category: Omit<Category, 'id'>): Promise<string> => {
  const db = getFirebaseRealtimeDb()
  if (!db) throw new Error('Database not initialized')
  const newRef = push(ref(db, 'categories'))
  await set(newRef, category)
  return newRef.key!
}

export const updateCategory = async (id: string, category: Partial<Category>): Promise<void> => {
  const db = getFirebaseRealtimeDb()
  if (!db) throw new Error('Database not initialized')
  await update(ref(db, `categories/${id}`), category)
}

export const deleteCategory = async (id: string): Promise<void> => {
  const db = getFirebaseRealtimeDb()
  if (!db) throw new Error('Database not initialized')
  await remove(ref(db, `categories/${id}`))
}

export const subscribeToCategories = (callback: (categories: Category[]) => void) => {
  const db = getFirebaseRealtimeDb()
  if (!db) {
    callback([])
    return () => {}
  }
  return onValue(ref(db, 'categories'), (snapshot) => {
    const categories = objectToArray<Category>(snapshot.val())
    callback(categories)
  })
}

// Subcategories
export const getSubcategories = async (): Promise<Subcategory[]> => {
  const db = getFirebaseRealtimeDb()
  if (!db) return []
  try {
    const snapshot = await get(ref(db, 'subcategories'))
    return objectToArray<Subcategory>(snapshot.val())
  } catch (error) {
    console.error('[Realtime DB] Error fetching subcategories:', error)
    return []
  }
}

export const addSubcategory = async (subcategory: Omit<Subcategory, 'id'>): Promise<string> => {
  const db = getFirebaseRealtimeDb()
  if (!db) throw new Error('Database not initialized')
  const newRef = push(ref(db, 'subcategories'))
  await set(newRef, subcategory)
  return newRef.key!
}

export const updateSubcategory = async (id: string, subcategory: Partial<Subcategory>): Promise<void> => {
  const db = getFirebaseRealtimeDb()
  if (!db) throw new Error('Database not initialized')
  await update(ref(db, `subcategories/${id}`), subcategory)
}

export const deleteSubcategory = async (id: string): Promise<void> => {
  const db = getFirebaseRealtimeDb()
  if (!db) throw new Error('Database not initialized')
  await remove(ref(db, `subcategories/${id}`))
}

export const subscribeToSubcategories = (callback: (subcategories: Subcategory[]) => void) => {
  const db = getFirebaseRealtimeDb()
  if (!db) {
    callback([])
    return () => {}
  }
  return onValue(ref(db, 'subcategories'), (snapshot) => {
    const subcategories = objectToArray<Subcategory>(snapshot.val())
    callback(subcategories)
  })
}

// Messages
export const getMessages = async (): Promise<ChatMessage[]> => {
  const db = getFirebaseRealtimeDb()
  if (!db) return []
  try {
    const snapshot = await get(ref(db, 'messages'))
    const messages = objectToArray<ChatMessage>(snapshot.val())
    return messages.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
  } catch (error) {
    console.error('[Realtime DB] Error fetching messages:', error)
    return []
  }
}

export const addMessage = async (message: Omit<ChatMessage, 'id' | 'createdAt' | 'read'>): Promise<string> => {
  const db = getFirebaseRealtimeDb()
  if (!db) throw new Error('Database not initialized')
  const newRef = push(ref(db, 'messages'))
  await set(newRef, {
    ...message,
    createdAt: Date.now(),
    read: false
  })
  return newRef.key!
}

export const markMessageAsRead = async (id: string): Promise<void> => {
  const db = getFirebaseRealtimeDb()
  if (!db) throw new Error('Database not initialized')
  await update(ref(db, `messages/${id}`), { read: true })
}

export const deleteMessage = async (id: string): Promise<void> => {
  const db = getFirebaseRealtimeDb()
  if (!db) throw new Error('Database not initialized')
  await remove(ref(db, `messages/${id}`))
}

export const replyToMessage = async (id: string, reply: string): Promise<void> => {
  const db = getFirebaseRealtimeDb()
  if (!db) throw new Error('Database not initialized')
  await update(ref(db, `messages/${id}`), { 
    adminReply: reply,
    repliedAt: Date.now(),
    read: true
  })
}

export const subscribeToMessages = (callback: (messages: ChatMessage[]) => void) => {
  const db = getFirebaseRealtimeDb()
  if (!db) {
    callback([])
    return () => {}
  }
  return onValue(ref(db, 'messages'), (snapshot) => {
    const messages = objectToArray<ChatMessage>(snapshot.val())
    callback(messages.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)))
  })
}

// Orders
export const getOrders = async (): Promise<Order[]> => {
  const db = getFirebaseRealtimeDb()
  if (!db) return []
  try {
    const snapshot = await get(ref(db, 'orders'))
    const orders = objectToArray<Order>(snapshot.val())
    return orders.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
  } catch (error) {
    console.error('[Realtime DB] Error fetching orders:', error)
    return []
  }
}

export const addOrder = async (order: Omit<Order, 'id' | 'createdAt' | 'seen' | 'status'>): Promise<string> => {
  const db = getFirebaseRealtimeDb()
  if (!db) throw new Error('Database not initialized')
  const newRef = push(ref(db, 'orders'))
  await set(newRef, {
    ...order,
    status: 'new',
    seen: false,
    createdAt: Date.now()
  })
  return newRef.key!
}

export const updateOrder = async (id: string, data: Partial<Order>): Promise<void> => {
  const db = getFirebaseRealtimeDb()
  if (!db) throw new Error('Database not initialized')
  await update(ref(db, `orders/${id}`), {
    ...data,
    updatedAt: Date.now()
  })
}

export const markOrderAsSeen = async (id: string): Promise<void> => {
  const db = getFirebaseRealtimeDb()
  if (!db) throw new Error('Database not initialized')
  await update(ref(db, `orders/${id}`), { seen: true })
}

export const deleteOrder = async (id: string): Promise<void> => {
  const db = getFirebaseRealtimeDb()
  if (!db) throw new Error('Database not initialized')
  await remove(ref(db, `orders/${id}`))
}

export const subscribeToOrders = (callback: (orders: Order[]) => void) => {
  const db = getFirebaseRealtimeDb()
  if (!db) {
    callback([])
    return () => {}
  }
  return onValue(ref(db, 'orders'), (snapshot) => {
    const orders = objectToArray<Order>(snapshot.val())
    callback(orders.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)))
  })
}

// Helper functions
export const getFlashDeals = async (): Promise<Product[]> => {
  const products = await getProducts()
  return products.filter(p => p.isFlashDeal === true)
}

export const getProductsByCategory = async (categorySlug: string): Promise<Product[]> => {
  const products = await getProducts()
  return products.filter(p => p.categorySlug === categorySlug)
}

// Image Upload
export const uploadProductImage = async (file: File): Promise<string> => {
  const storage = getFirebaseStorage()
  if (!storage) throw new Error('Firebase Storage not initialized')
  
  const timestamp = Date.now()
  const fileName = `products/${timestamp}_${file.name}`
  const sRef = storageRef(storage, fileName)
  
  await uploadBytes(sRef, file)
  return await getDownloadURL(sRef)
}

// Video Upload
export const uploadProductVideo = async (file: File): Promise<string> => {
  const storage = getFirebaseStorage()
  if (!storage) throw new Error('Firebase Storage not initialized')
  
  const timestamp = Date.now()
  const fileName = `videos/${timestamp}_${file.name}`
  const sRef = storageRef(storage, fileName)
  
  await uploadBytes(sRef, file)
  return await getDownloadURL(sRef)
}

// Product Views
export const trackProductView = async (productId: string, productName: string): Promise<void> => {
  const db = getFirebaseRealtimeDb()
  if (!db) return
  
  try {
    const newRef = push(ref(db, 'productViews'))
    await set(newRef, {
      productId,
      productName,
      viewedAt: Date.now(),
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : '',
      referrer: typeof document !== 'undefined' ? document.referrer : ''
    })
  } catch (error) {
    console.error('Error tracking product view:', error)
  }
}

export const getProductViews = async (): Promise<ProductView[]> => {
  const db = getFirebaseRealtimeDb()
  if (!db) return []
  try {
    const snapshot = await get(ref(db, 'productViews'))
    const views = objectToArray<ProductView>(snapshot.val())
    return views.sort((a, b) => (b.viewedAt || 0) - (a.viewedAt || 0))
  } catch (error) {
    console.error('[Realtime DB] Error fetching product views:', error)
    return []
  }
}

export const subscribeToProductViews = (callback: (views: ProductView[]) => void) => {
  const db = getFirebaseRealtimeDb()
  if (!db) {
    callback([])
    return () => {}
  }
  return onValue(ref(db, 'productViews'), (snapshot) => {
    const views = objectToArray<ProductView>(snapshot.val())
    callback(views.sort((a, b) => (b.viewedAt || 0) - (a.viewedAt || 0)))
  })
}
