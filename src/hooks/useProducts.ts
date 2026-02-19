'use client'

// All hooks now consume from the single DataCacheContext — zero extra Firebase subscriptions.
import {
  useDataCache,
  useCachedProducts,
  useCachedCategories,
  useCachedSubcategories,
  useCachedFlashDeals,
  useCachedBestSellers,
  useCachedFeaturedProducts,
  useCachedProductById,
  useCachedRelatedProducts,
  useCachedHeroProducts,
} from '@/context/DataCacheContext'

// Re-export cached hooks under legacy names so existing imports keep working

export function useProducts() {
  return useCachedProducts()
}

export function useCategories() {
  return useCachedCategories()
}

export function useSubcategories() {
  return useCachedSubcategories()
}

export function useFlashDeals() {
  return useCachedFlashDeals()
}

export function useBestSellers(limit = 4) {
  return useCachedBestSellers(limit)
}

export function useFeaturedProducts(limit = 6) {
  return useCachedFeaturedProducts(limit)
}

export function useProductById(id: string) {
  return useCachedProductById(id)
}

export function useProductBySlug(slugOrId: string) {
  const { products, loading } = useCachedProducts()
  const product = products.find(p => p.slug === slugOrId) || products.find(p => p.id === slugOrId)
  return { product, loading }
}

export function useRelatedProducts(slugOrId: string, limit = 4) {
  const { products, loading } = useCachedProducts()
  const product = products.find(p => p.slug === slugOrId) || products.find(p => p.id === slugOrId)

  const related = product
    ? products.filter(p => p.id !== product.id && p.categorySlug === product.categorySlug).slice(0, limit)
    : products.slice(0, limit)

  return { related, loading }
}

export function useHeroProducts() {
  return useCachedHeroProducts()
}
