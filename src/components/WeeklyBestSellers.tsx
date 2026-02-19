'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Heart, Star, ChevronRight, Trophy, ShoppingCart } from 'lucide-react'
import { useBestSellers } from '@/hooks/useProducts'
import { useCartStore } from '@/store/cartStore'

const isImageUrl = (str: string) => str?.startsWith('http') || str?.startsWith('/') || str?.startsWith('data:')

export default function WeeklyBestSellers() {
  const [wishlisted, setWishlisted] = useState<Set<string>>(new Set())
  const { bestSellers, loading } = useBestSellers(4)
  const addToCart = useCartStore((state) => state.addToCart)

  const toggleWishlist = (e: React.MouseEvent, id: string) => {
    e.preventDefault()
    setWishlisted(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const handleAddToCart = (e: React.MouseEvent, product: any) => {
    e.preventDefault()
    addToCart({ id: product.id!, name: product.name, price: product.price, image: product.image })
  }

  if (loading) {
    return (
      <section className="px-4 py-6 lg:px-8 lg:py-10">
        <div className="flex items-center justify-between mb-6">
          <div className="h-7 bg-surface rounded-lg w-44 animate-pulse" />
          <div className="h-5 bg-surface rounded-lg w-20 animate-pulse" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {[1,2,3,4].map(i => (
            <div key={i} className="h-28 bg-surface rounded-2xl animate-pulse" />
          ))}
        </div>
      </section>
    )
  }

  return (
    <section className="px-4 py-6 lg:px-8 lg:py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 lg:mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-yellow-500/25">
            <Trophy className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg lg:text-xl font-bold text-text">Najprodavanije</h2>
            <p className="text-xs text-muted hidden sm:block">Proizvodi koje kupci najviše vole</p>
          </div>
        </div>
        <Link 
          href="/products?sort=popular" 
          className="flex items-center gap-1 text-sm text-primary hover:text-primary/80 font-medium transition-colors"
        >
          Vidi sve
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
      
      {/* Products Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {bestSellers.map((product, index) => (
          <Link
            key={product.id}
            href={`/product/${product.slug || product.id}`}
            className="group flex items-center gap-4 bg-surface rounded-2xl p-4 lg:p-5 border border-white/5 hover:border-primary/20 transition-all duration-300 hover:shadow-xl hover:shadow-black/20"
          >
            {/* Rank Badge */}
            <div className="absolute -top-2 -left-2 w-7 h-7 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center text-white text-xs font-bold shadow-lg z-10 hidden lg:flex">
              #{index + 1}
            </div>

            {/* Image */}
            <div className="relative w-24 h-24 lg:w-28 lg:h-28 bg-gradient-to-br from-white/[0.03] to-white/[0.01] rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden">
              {isImageUrl(product.image) ? (
                <Image 
                  src={product.image} 
                  alt={product.name} 
                  fill
                  sizes="(max-width: 1024px) 96px, 112px"
                  className="object-cover transition-transform duration-300 group-hover:scale-110" 
                />
              ) : (
                <span className="text-4xl lg:text-5xl transition-transform duration-300 group-hover:scale-110">{product.image}</span>
              )}
              <button
                onClick={(e) => toggleWishlist(e, product.id!)}
                className="absolute top-2 right-2 p-1.5 bg-black/30 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-all hover:bg-black/50"
              >
                <Heart className={`w-4 h-4 ${wishlisted.has(product.id!) ? 'fill-danger text-danger' : 'text-white'}`} />
              </button>
            </div>
            
            {/* Content */}
            <div className="flex-1 min-w-0">
              <h3 className="text-sm lg:text-base font-medium text-text mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                {product.name}
              </h3>
              
              {/* Rating */}
              <div className="flex items-center gap-2 mb-2">
                <div className="flex items-center gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`w-3.5 h-3.5 ${i < Math.floor(product.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-muted/30'}`} 
                    />
                  ))}
                </div>
                <span className="text-xs text-muted">({product.reviews})</span>
              </div>

              {/* Price & Action */}
              <div className="flex items-center justify-between">
                <div className="flex items-baseline gap-2">
                  <span className="text-lg lg:text-xl font-bold text-primary">{product.price.toFixed(2)} KM</span>
                  {product.originalPrice && (
                    <span className="text-xs text-muted/60 line-through">{product.originalPrice.toFixed(2)} KM</span>
                  )}
                </div>
                <button
                  onClick={(e) => handleAddToCart(e, product)}
                  className="p-2.5 bg-primary/10 hover:bg-primary text-primary hover:text-white rounded-xl transition-all hover:scale-105"
                >
                  <ShoppingCart className="w-4 h-4" />
                </button>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
