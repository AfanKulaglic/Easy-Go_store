'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Heart, ShoppingCart } from 'lucide-react'
import { useCartStore } from '@/store/cartStore'
import { Product } from '@/lib/realtimeProducts'

interface ProductCardProps {
  product: Product
  variant?: 'default' | 'flash'
  priority?: boolean
}

// Helper to check if string is an image URL or base64
const isImageUrl = (str: string) => str?.startsWith('http') || str?.startsWith('/') || str?.startsWith('data:')

export default function ProductCard({ product, variant = 'default', priority = false }: ProductCardProps) {
  const [isWishlisted, setIsWishlisted] = useState(false)
  const addToCart = useCartStore((state) => state.addToCart)

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    addToCart({ id: product.id!, name: product.name, price: product.price, image: product.image })
  }

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsWishlisted(!isWishlisted)
  }

  const getBadgeText = () => {
    if (product.discountPercent) return `-${product.discountPercent}%`
    if (product.badge === 'sale') return 'Akcija'
    if (product.badge === 'new') return 'Novo'
    return null
  }

  // Render product image (URL or emoji)
  const renderImage = (size: 'sm' | 'md' | 'lg' = 'md') => {
    const sizeClasses = {
      sm: 'text-4xl',
      md: 'text-5xl',
      lg: 'text-5xl lg:text-6xl'
    }
    
    if (isImageUrl(product.image)) {
      return (
        <Image 
          src={product.image} 
          alt={product.name} 
          width={300}
          height={300}
          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
          className="w-full h-full object-cover"
          loading={priority ? 'eager' : 'lazy'}
          priority={priority}
        />
      )
    }
    return <span className={`${sizeClasses[size]} transition-transform duration-200 group-hover:scale-105`}>{product.image}</span>
  }

  if (variant === 'flash') {
    return (
      <Link href={`/product/${product.slug || product.id}`} className="flex-shrink-0 w-40 lg:w-full bg-surface rounded-2xl overflow-hidden transition-all duration-200 hover:scale-[1.02] hover:shadow-lg hover:shadow-black/20">
        <div className="relative h-32 lg:h-36 bg-gradient-to-b from-gray-100 to-gray-50 dark:from-white/[0.08] dark:to-white/[0.03] flex items-center justify-center overflow-hidden">
          {renderImage('sm')}
          {discount > 0 && <span className="absolute top-3 left-3 bg-danger text-white text-[10px] font-semibold px-2.5 py-0.5 rounded-lg z-10 shadow-lg shadow-danger/30">-{discount}%</span>}
        </div>
        <div className="p-4">
          <h3 className="text-sm lg:text-base text-text/90 line-clamp-1 mb-2">{product.name}</h3>
          <div className="flex items-baseline gap-2 mb-3">
            <span className="text-accent font-semibold">{product.price.toFixed(2)} KM</span>
            {product.originalPrice && <span className="text-xs text-muted/70 line-through">{product.originalPrice.toFixed(2)} KM</span>}
          </div>
          {product.soldPercent !== undefined && (
            <div className="w-full bg-white/[0.06] rounded-full h-1">
              <div className="bg-danger/80 h-1 rounded-full" style={{ width: `${product.soldPercent}%` }} />
            </div>
          )}
        </div>
      </Link>
    )
  }

  const badgeText = getBadgeText()

  return (
    <Link href={`/product/${product.slug || product.id}`} className="group bg-surface rounded-2xl overflow-hidden transition-all duration-200 hover:scale-[1.02] hover:shadow-xl hover:shadow-black/25">
      <div className="relative h-44 bg-gradient-to-b from-gray-100 to-gray-50 dark:from-white/[0.08] dark:to-white/[0.03] flex items-center justify-center overflow-hidden">
        {renderImage('md')}
        {badgeText && (
          <span className={`absolute top-3 left-3 text-[10px] font-semibold tracking-wide uppercase px-2.5 py-1 rounded-lg z-10 shadow-lg backdrop-blur-sm ${
            product.badge === 'sale' || product.discountPercent ? 'bg-danger text-white shadow-danger/30' : 'bg-accent text-white shadow-accent/30'
          }`}>{badgeText}</span>
        )}
        <button onClick={handleWishlist} className="absolute top-3 right-3 p-2 rounded-full opacity-0 group-hover:opacity-100 hover:bg-white/10 transition-all z-10">
          <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-danger text-danger' : 'text-white/60 hover:text-white'}`} />
        </button>
      </div>
      <div className="p-4">
        <h3 className="text-sm text-text/90 line-clamp-2 mb-3 leading-relaxed">{product.name}</h3>
        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-primary font-semibold">{product.price.toFixed(2)} KM</span>
            {product.originalPrice && <span className="text-xs text-muted/60 line-through">{product.originalPrice.toFixed(2)} KM</span>}
          </div>
          <button onClick={handleAddToCart} className="p-2.5 rounded-xl bg-white/[0.04] hover:bg-primary/20 transition-all">
            <ShoppingCart className="w-4 h-4 text-muted group-hover:text-primary transition-colors" />
          </button>
        </div>
      </div>
    </Link>
  )
}
