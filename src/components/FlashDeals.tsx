'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Zap, ChevronRight, Clock, Heart, ShoppingCart, Star } from 'lucide-react'
import { useFlashDeals } from '@/hooks/useProducts'
import { useCartStore } from '@/store/cartStore'
import { Product } from '@/lib/realtimeProducts'
import { ProductCardSkeleton } from './Loading'

const isImageUrl = (str: string) => str?.startsWith('http') || str?.startsWith('/') || str?.startsWith('data:')

function FlashDealCard({ product }: { product: Product }) {
  const [isWishlisted, setIsWishlisted] = useState(false)
  const addToCart = useCartStore((state) => state.addToCart)

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : product.discountPercent || 0

  const soldPercent = product.soldPercent || Math.floor(Math.random() * 40 + 50)

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    addToCart({ id: product.id!, name: product.name, price: product.price, image: product.image })
  }

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsWishlisted(!isWishlisted)
  }

  return (
    <Link 
      href={`/product/${product.slug || product.id}`} 
      className="group flex-shrink-0 w-40 lg:w-52 bg-surface rounded-2xl overflow-hidden border border-white/5 hover:border-primary/20 transition-all duration-300 hover:shadow-lg hover:shadow-black/10"
    >
      {/* Image Container */}
      <div className="relative h-32 lg:h-36 bg-white/[0.02] flex items-center justify-center overflow-hidden">
        {/* Discount Badge */}
        {discount > 0 && (
          <div className="absolute top-2 left-2 z-10 bg-danger text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md">
            -{discount}%
          </div>
        )}

        {/* Wishlist */}
        <button 
          onClick={handleWishlist} 
          className="absolute top-2 right-2 z-10 p-1.5 rounded-lg bg-surface/80 opacity-0 group-hover:opacity-100 transition-all"
        >
          <Heart className={`w-3.5 h-3.5 ${isWishlisted ? 'fill-danger text-danger' : 'text-muted'}`} />
        </button>

        {/* Image */}
        {isImageUrl(product.image) ? (
          <img 
            src={product.image} 
            alt={product.name} 
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" 
          />
        ) : (
          <span className="text-4xl lg:text-5xl">{product.image}</span>
        )}
      </div>

      {/* Content */}
      <div className="p-3">
        {/* Category & Rating */}
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[9px] text-primary font-medium uppercase tracking-wide">{product.category}</span>
          <div className="flex items-center gap-0.5">
            <Star className="w-2.5 h-2.5 fill-yellow-400 text-yellow-400" />
            <span className="text-[9px] text-muted">{product.rating || 4.5}</span>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-xs font-medium text-text line-clamp-1 mb-2">
          {product.name}
        </h3>

        {/* Price Row */}
        <div className="flex items-center gap-1.5 mb-2">
          <span className="text-sm font-bold text-primary">{product.price.toFixed(2)} KM</span>
          {product.originalPrice && (
            <span className="text-[10px] text-muted line-through">{product.originalPrice.toFixed(2)}</span>
          )}
        </div>

        {/* Progress Bar */}
        <div className="mb-2.5">
          <div className="flex items-center justify-between text-[9px] text-muted mb-1">
            <span>Prodano {soldPercent}%</span>
            <span className="text-danger">{100 - soldPercent} preostalo</span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-1 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-danger to-orange-500 h-full rounded-full" 
              style={{ width: `${soldPercent}%` }} 
            />
          </div>
        </div>

        {/* Add to Cart */}
        <button 
          onClick={handleAddToCart}
          className="w-full flex items-center justify-center gap-1.5 bg-primary/10 hover:bg-primary text-primary hover:text-white py-2 rounded-lg text-[11px] font-medium transition-all"
        >
          <ShoppingCart className="w-3.5 h-3.5" />
          Dodaj
        </button>
      </div>
    </Link>
  )
}

export default function FlashDeals() {
  const [timeLeft, setTimeLeft] = useState({ hours: 5, minutes: 30, seconds: 0 })
  const { flashDeals, loading } = useFlashDeals()

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 }
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 }
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 }
        return { hours: 5, minutes: 30, seconds: 0 }
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const formatTime = (n: number) => n.toString().padStart(2, '0')

  if (loading) {
    return (
      <section className="px-4 py-6 lg:px-8 lg:py-8">
        <div className="flex items-center justify-between mb-5">
          <div className="h-7 bg-surface rounded-lg w-40 animate-pulse" />
          <div className="h-6 bg-surface rounded-lg w-28 animate-pulse" />
        </div>
        <div className="flex gap-3 overflow-hidden">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="w-40 lg:w-52 flex-shrink-0">
              <ProductCardSkeleton />
            </div>
          ))}
        </div>
      </section>
    )
  }

  if (flashDeals.length === 0) return null

  return (
    <section className="px-4 py-6 lg:px-8 lg:py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 lg:w-11 lg:h-11 bg-gradient-to-br from-danger to-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-danger/25">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg lg:text-xl font-bold text-text">Flash Ponude</h2>
            <p className="text-[11px] text-muted hidden sm:block">Ograničena ponuda</p>
          </div>
        </div>
        
        {/* Timer */}
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-danger hidden sm:block" />
          <div className="flex items-center gap-0.5">
            <div className="bg-danger text-white w-7 h-7 rounded-lg text-xs font-mono font-bold flex items-center justify-center">
              {formatTime(timeLeft.hours)}
            </div>
            <span className="text-danger font-bold text-sm">:</span>
            <div className="bg-danger text-white w-7 h-7 rounded-lg text-xs font-mono font-bold flex items-center justify-center">
              {formatTime(timeLeft.minutes)}
            </div>
            <span className="text-danger font-bold text-sm">:</span>
            <div className="bg-danger text-white w-7 h-7 rounded-lg text-xs font-mono font-bold flex items-center justify-center">
              {formatTime(timeLeft.seconds)}
            </div>
          </div>
        </div>
      </div>

      {/* Products - horizontal scroll on all screen sizes */}
      <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 lg:-mx-8 lg:px-8 scrollbar-hide">
        {flashDeals.map((product) => (
          <FlashDealCard key={product.id} product={product} />
        ))}
      </div>

      {/* View All */}
      <div className="mt-5 text-center lg:text-right">
        <Link 
          href="/products?filter=flash" 
          className="inline-flex items-center gap-1 text-xs text-danger hover:text-danger/80 font-medium transition-colors"
        >
          Vidi sve ponude
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </section>
  )
}
