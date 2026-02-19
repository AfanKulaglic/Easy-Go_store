'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { TrendingUp, ChevronRight, Heart, Plus, Star } from 'lucide-react'
import { useFeaturedProducts } from '@/hooks/useProducts'
import { ProductGridSkeleton } from './Loading'
import { useCartStore } from '@/store/cartStore'
import { Product } from '@/lib/realtimeProducts'

const isImageUrl = (str: string) => str?.startsWith('http') || str?.startsWith('/') || str?.startsWith('data:')

export default function TopProducts() {
  const { featured: topProducts, loading } = useFeaturedProducts(6)
  const [wishlisted, setWishlisted] = useState<Set<string>>(new Set())
  const addToCart = useCartStore((state) => state.addToCart)

  const toggleWishlist = (e: React.MouseEvent, id: string) => {
    e.preventDefault()
    setWishlisted(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const handleAddToCart = (e: React.MouseEvent, product: Product) => {
    e.preventDefault()
    addToCart({ id: product.id!, name: product.name, price: product.price, image: product.image })
  }

  const renderStars = (rating: number) => Array.from({ length: 5 }).map((_, i) => (
    <Star key={i} className={`w-3 h-3 ${i < Math.floor(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-muted/30'}`} />
  ))

  const getBadgeStyle = (product: Product) => {
    if (product.discountPercent) return { text: `-${product.discountPercent}%`, className: 'bg-gradient-to-r from-danger to-red-600' }
    if (product.badge === 'sale') return { text: 'Akcija', className: 'bg-gradient-to-r from-danger to-red-600' }
    if (product.badge === 'new') return { text: 'Novo', className: 'bg-gradient-to-r from-accent to-emerald-500' }
    return null
  }

  if (loading) {
    return (
      <section className="px-4 py-6 lg:px-8 lg:py-10">
        <div className="flex items-center justify-between mb-6">
          <div className="h-7 bg-surface rounded-lg w-40 animate-pulse" />
          <div className="h-5 bg-surface rounded-lg w-20 animate-pulse" />
        </div>
        <ProductGridSkeleton count={6} />
      </section>
    )
  }

  return (
    <section className="px-4 py-6 lg:px-8 lg:py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 lg:mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center shadow-lg shadow-primary/25">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg lg:text-xl font-bold text-text">Top Proizvodi</h2>
            <p className="text-xs text-muted hidden sm:block">Najpopularniji izbor naših kupaca</p>
          </div>
        </div>
        <Link 
          href="/products" 
          className="flex items-center gap-1 text-sm text-primary hover:text-primary/80 font-medium transition-colors"
        >
          Vidi sve
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Products Grid - Same as FeaturedProducts */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 lg:gap-5">
        {topProducts.map((product, index) => {
          const badgeInfo = getBadgeStyle(product)
          return (
            <Link 
              key={product.id} 
              href={`/product/${product.slug || product.id}`}
              className="group bg-surface rounded-2xl overflow-hidden border border-white/5 hover:border-primary/20 transition-all duration-300 hover:shadow-xl hover:shadow-black/25 hover:-translate-y-1"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {/* Image */}
              <div className="relative h-36 lg:h-44 bg-gradient-to-br from-white/[0.03] to-white/[0.01] flex items-center justify-center overflow-hidden">
                {isImageUrl(product.image) ? (
                  <Image 
                    src={product.image} 
                    alt={product.name} 
                    fill
                    sizes="(max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 16vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-110" 
                  />
                ) : (
                  <span className="text-5xl lg:text-6xl transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3">{product.image}</span>
                )}
                
                {badgeInfo && (
                  <span className={`absolute top-3 left-3 text-[10px] font-bold px-2.5 py-1 rounded-lg text-white shadow-lg ${badgeInfo.className}`}>
                    {badgeInfo.text}
                  </span>
                )}
                
                <button 
                  onClick={(e) => toggleWishlist(e, product.id!)} 
                  className="absolute top-3 right-3 p-2 bg-black/30 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-all hover:bg-black/50 hover:scale-110"
                >
                  <Heart className={`w-4 h-4 ${wishlisted.has(product.id!) ? 'fill-danger text-danger' : 'text-white'}`} />
                </button>

                <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-3">
                  <button 
                    onClick={(e) => handleAddToCart(e, product)}
                    className="px-4 py-1.5 bg-primary text-white text-xs font-semibold rounded-full hover:bg-primary/90 transition-colors shadow-lg shadow-primary/25"
                  >
                    Dodaj u korpu
                  </button>
                </div>
              </div>

              <div className="p-4">
                <h3 className="text-sm text-text/90 line-clamp-2 mb-2 min-h-[2.5rem] group-hover:text-primary transition-colors">
                  {product.name}
                </h3>
                
                <div className="flex items-center gap-1 mb-2">
                  {renderStars(product.rating)}
                  <span className="text-[10px] text-muted ml-1">({product.reviews})</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-base font-bold text-primary">{product.price.toFixed(2)} KM</span>
                    {product.originalPrice && (
                      <span className="text-[10px] text-muted/60 line-through">{product.originalPrice.toFixed(2)} KM</span>
                    )}
                  </div>
                  <button 
                    onClick={(e) => handleAddToCart(e, product)} 
                    className="w-8 h-8 rounded-xl bg-primary/10 hover:bg-primary flex items-center justify-center text-primary hover:text-white transition-all hover:scale-110"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
