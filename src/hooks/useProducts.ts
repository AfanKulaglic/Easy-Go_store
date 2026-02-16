'use client'

import { useState, useEffect } from 'react'
import { 
  Product, Category, Subcategory,
  subscribeToProducts, subscribeToCategories, subscribeToSubcategories 
} from '@/lib/realtimeProducts'
import { 
  products as localProducts, 
  categories as localCategories 
} from '@/lib/productData'

// Try to use cached data from context, fallback to direct subscription
export function useProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check sessionStorage for cached data first
    try {
      const cached = sessionStorage.getItem('easygo_data_cache')
      if (cached) {
        const data = JSON.parse(cached)
        if (data.products && data.products.length > 0 && Date.now() - data.timestamp < 5 * 60 * 1000) {
          setProducts(data.products)
          setLoading(false)
          return
        }
      }
    } catch (e) {
      // Ignore cache errors
    }

    const unsubscribe = subscribeToProducts((firebaseProducts) => {
      if (firebaseProducts.length > 0) {
        setProducts(firebaseProducts)
      } else {
        // Fallback to local data if Firebase is empty
        setProducts(localProducts as Product[])
      }
      setLoading(false)
    }, { limit: 50 })

    return () => unsubscribe()
  }, [])

  return { products, loading }
}

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check sessionStorage for cached data first
    try {
      const cached = sessionStorage.getItem('easygo_data_cache')
      if (cached) {
        const data = JSON.parse(cached)
        if (data.categories && data.categories.length > 0 && Date.now() - data.timestamp < 5 * 60 * 1000) {
          setCategories(data.categories)
          setLoading(false)
          return
        }
      }
    } catch (e) {
      // Ignore cache errors
    }

    const unsubscribe = subscribeToCategories((firebaseCategories) => {
      if (firebaseCategories.length > 0) {
        setCategories(firebaseCategories)
      } else {
        // Fallback to local data if Firebase is empty
        setCategories(localCategories as Category[])
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  return { categories, loading }
}

export function useSubcategories() {
  const [subcategories, setSubcategories] = useState<Subcategory[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check sessionStorage for cached data first
    try {
      const cached = sessionStorage.getItem('easygo_data_cache')
      if (cached) {
        const data = JSON.parse(cached)
        if (data.subcategories && Date.now() - data.timestamp < 5 * 60 * 1000) {
          setSubcategories(data.subcategories)
          setLoading(false)
          return
        }
      }
    } catch (e) {
      // Ignore cache errors
    }

    const unsubscribe = subscribeToSubcategories((firebaseSubcategories) => {
      setSubcategories(firebaseSubcategories)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  return { subcategories, loading }
}

export function useFlashDeals() {
  const { products, loading } = useProducts()
  const flashDeals = products.filter(p => p.isFlashDeal)
  return { flashDeals, loading }
}

export function useBestSellers(limit = 4) {
  const { products, loading } = useProducts()
  const bestSellers = [...products]
    .sort((a, b) => (b.reviews || 0) - (a.reviews || 0))
    .slice(0, limit)
  return { bestSellers, loading }
}

export function useFeaturedProducts(limit = 6) {
  const { products, loading } = useProducts()
  const featured = products.slice(0, limit)
  return { featured, loading }
}

export function useProductById(id: string) {
  const { products, loading } = useProducts()
  const product = products.find(p => p.id === id)
  return { product, loading }
}

export function useProductBySlug(slugOrId: string) {
  const { products, loading } = useProducts()
  // Try slug first, then fallback to id for backwards compatibility
  const product = products.find(p => p.slug === slugOrId) || products.find(p => p.id === slugOrId)
  return { product, loading }
}

export function useRelatedProducts(slugOrId: string, limit = 4) {
  const { products, loading } = useProducts()
  const product = products.find(p => p.slug === slugOrId) || products.find(p => p.id === slugOrId)
  
  const related = product 
    ? products.filter(p => p.id !== product.id && p.categorySlug === product.categorySlug).slice(0, limit)
    : products.slice(0, limit)
  
  return { related, loading }
}

export function useHeroProducts() {
  const { products, loading } = useProducts()
  const heroProducts = products.filter(p => p.showInHero)
  return { heroProducts, loading }
}
