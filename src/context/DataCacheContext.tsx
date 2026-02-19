'use client'

import { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from 'react'
import { 
  Product, Category, Subcategory,
  subscribeToProducts, subscribeToCategories, subscribeToSubcategories 
} from '@/lib/realtimeProducts'
import { 
  products as localProducts, 
  categories as localCategories 
} from '@/lib/productData'

const CACHE_KEY = 'easygo_data_cache'
const CACHE_EXPIRY = 5 * 60 * 1000 // 5 minutes

interface CachedData {
  products: Product[]
  categories: Category[]
  subcategories: Subcategory[]
  timestamp: number
}

interface DataCacheContextType {
  products: Product[]
  categories: Category[]
  subcategories: Subcategory[]
  loading: boolean
  progress: number
  isInitialized: boolean
  refreshData: () => void
}

const DataCacheContext = createContext<DataCacheContextType | null>(null)

export function DataCacheProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [subcategories, setSubcategories] = useState<Subcategory[]>([])
  const [loading, setLoading] = useState(true)
  const [progress, setProgress] = useState(0)
  const [isInitialized, setIsInitialized] = useState(false)
  
  const [productsLoaded, setProductsLoaded] = useState(false)
  const [categoriesLoaded, setCategoriesLoaded] = useState(false)
  const [subcategoriesLoaded, setSubcategoriesLoaded] = useState(false)

  // Load from cache
  const loadFromCache = useCallback((): CachedData | null => {
    if (typeof window === 'undefined') return null
    
    try {
      const cached = sessionStorage.getItem(CACHE_KEY)
      if (cached) {
        const data: CachedData = JSON.parse(cached)
        // Check if cache is still valid
        if (Date.now() - data.timestamp < CACHE_EXPIRY) {
          return data
        }
      }
    } catch (e) {
      console.error('Error loading cache:', e)
    }
    return null
  }, [])

  // Save to cache - skip if data is too large
  const saveToCache = useCallback((data: Omit<CachedData, 'timestamp'>) => {
    if (typeof window === 'undefined') return
    
    try {
      const cacheData: CachedData = {
        ...data,
        timestamp: Date.now()
      }
      const jsonString = JSON.stringify(cacheData)
      
      // Skip caching if data is larger than 2MB (sessionStorage limit is ~5MB)
      if (jsonString.length > 2 * 1024 * 1024) {
        console.log('Cache skipped - data too large')
        return
      }
      
      // Clear old cache first to make room
      sessionStorage.removeItem(CACHE_KEY)
      sessionStorage.setItem(CACHE_KEY, jsonString)
    } catch (e) {
      // Silently fail - caching is optional
      console.log('Cache skipped due to storage limit')
    }
  }, [])

  // Update progress based on loaded data
  useEffect(() => {
    let loadedCount = 0
    if (productsLoaded) loadedCount++
    if (categoriesLoaded) loadedCount++
    if (subcategoriesLoaded) loadedCount++
    
    const newProgress = (loadedCount / 3) * 100
    setProgress(newProgress)
    
    if (loadedCount === 3) {
      setLoading(false)
      setIsInitialized(true)
    }
  }, [productsLoaded, categoriesLoaded, subcategoriesLoaded])

  // Initialize data
  useEffect(() => {
    // Try to load from cache first
    const cached = loadFromCache()
    if (cached && cached.products.length > 0) {
      setProducts(cached.products)
      setCategories(cached.categories)
      setSubcategories(cached.subcategories)
      setProductsLoaded(true)
      setCategoriesLoaded(true)
      setSubcategoriesLoaded(true)
    }

    // Always subscribe to Firebase for live updates (stale-while-revalidate)
    if (!cached || !cached.products.length) {
      setProgress(10)
    }

    // Subscribe to Firebase data
    const unsubProducts = subscribeToProducts((firebaseProducts) => {
      if (firebaseProducts.length > 0) {
        setProducts(firebaseProducts)
      } else {
        setProducts(localProducts as Product[])
      }
      setProductsLoaded(true)
    })

    const unsubCategories = subscribeToCategories((firebaseCategories) => {
      if (firebaseCategories.length > 0) {
        setCategories(firebaseCategories)
      } else {
        setCategories(localCategories as Category[])
      }
      setCategoriesLoaded(true)
    })

    const unsubSubcategories = subscribeToSubcategories((firebaseSubcategories) => {
      setSubcategories(firebaseSubcategories)
      setSubcategoriesLoaded(true)
    })

    return () => {
      unsubProducts()
      unsubCategories()
      unsubSubcategories()
    }
  }, [loadFromCache])

  // Save to cache when data changes
  useEffect(() => {
    if (isInitialized && products.length > 0) {
      saveToCache({ products, categories, subcategories })
    }
  }, [products, categories, subcategories, isInitialized, saveToCache])

  const refreshData = useCallback(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(CACHE_KEY)
    }
    setLoading(true)
    setProgress(0)
    setProductsLoaded(false)
    setCategoriesLoaded(false)
    setSubcategoriesLoaded(false)
    setIsInitialized(false)
    
    // Re-subscribe to get fresh data
    const unsubProducts = subscribeToProducts((firebaseProducts) => {
      if (firebaseProducts.length > 0) {
        setProducts(firebaseProducts)
      }
      setProductsLoaded(true)
    })

    const unsubCategories = subscribeToCategories((firebaseCategories) => {
      if (firebaseCategories.length > 0) {
        setCategories(firebaseCategories)
      }
      setCategoriesLoaded(true)
    })

    const unsubSubcategories = subscribeToSubcategories((firebaseSubcategories) => {
      setSubcategories(firebaseSubcategories)
      setSubcategoriesLoaded(true)
    })

    // Cleanup after a short delay
    setTimeout(() => {
      unsubProducts()
      unsubCategories()
      unsubSubcategories()
    }, 5000)
  }, [])

  const contextValue = useMemo(() => ({
    products,
    categories,
    subcategories,
    loading,
    progress,
    isInitialized,
    refreshData
  }), [products, categories, subcategories, loading, progress, isInitialized, refreshData])

  return (
    <DataCacheContext.Provider value={contextValue}>
      {children}
    </DataCacheContext.Provider>
  )
}

export function useDataCache() {
  const context = useContext(DataCacheContext)
  if (!context) {
    throw new Error('useDataCache must be used within a DataCacheProvider')
  }
  return context
}

// Convenience hooks that use the cache
export function useCachedProducts() {
  const { products, loading } = useDataCache()
  return { products, loading }
}

export function useCachedCategories() {
  const { categories, loading } = useDataCache()
  return { categories, loading }
}

export function useCachedSubcategories() {
  const { subcategories, loading } = useDataCache()
  return { subcategories, loading }
}

export function useCachedFlashDeals() {
  const { products, loading } = useDataCache()
  const flashDeals = products.filter(p => p.isFlashDeal)
  return { flashDeals, loading }
}

export function useCachedBestSellers(limit = 4) {
  const { products, loading } = useDataCache()
  const bestSellers = [...products]
    .sort((a, b) => (b.reviews || 0) - (a.reviews || 0))
    .slice(0, limit)
  return { bestSellers, loading }
}

export function useCachedFeaturedProducts(limit = 6) {
  const { products, loading } = useDataCache()
  const featured = products.slice(0, limit)
  return { featured, loading }
}

export function useCachedProductById(id: string) {
  const { products, loading } = useDataCache()
  const product = products.find(p => p.id === id)
  return { product, loading }
}

export function useCachedRelatedProducts(productId: string, limit = 4) {
  const { products, loading } = useDataCache()
  const product = products.find(p => p.id === productId)
  
  const related = product 
    ? products.filter(p => p.id !== productId && p.categorySlug === product.categorySlug).slice(0, limit)
    : products.slice(0, limit)
  
  return { related, loading }
}

export function useCachedHeroProducts() {
  const { products, loading } = useDataCache()
  const heroProducts = products.filter(p => p.showInHero)
  return { heroProducts, loading }
}
