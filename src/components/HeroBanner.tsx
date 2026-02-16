'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useHeroProducts } from '@/hooks/useProducts'
import { Product } from '@/lib/realtimeProducts'

// Helper to check if string is an image URL or base64
const isImageUrl = (str: string) => str?.startsWith('http') || str?.startsWith('/') || str?.startsWith('data:')

// Default banner when no products are set for hero
const defaultBanner: Partial<Product> & { id: string } = {
  id: 'default',
  name: 'Dobrodošli u Shop',
  heroSubtitle: 'Pronađite najbolje proizvode po najboljim cijenama',
  image: '🛒',
}

export default function HeroBanner() {
  const [current, setCurrent] = useState(0)
  const { heroProducts, loading } = useHeroProducts()

  // Use hero products or fallback to default
  const banners = heroProducts.length > 0 ? heroProducts : [defaultBanner]

  useEffect(() => {
    if (banners.length <= 1) return
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % banners.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [banners.length])

  const prev = () => setCurrent((c) => (c - 1 + banners.length) % banners.length)
  const next = () => setCurrent((c) => (c + 1) % banners.length)

  if (loading) {
    return (
      <div className="relative mx-4 mt-4 lg:mx-8 lg:mt-6 rounded-2xl lg:rounded-3xl overflow-hidden bg-gradient-to-r from-primary/20 to-accent/20">
        <div className="h-48 md:h-64 lg:h-80 animate-pulse" />
      </div>
    )
  }

  return (
    <div className="mx-4 mt-4 lg:mx-8 lg:mt-6">
      {/* Banner container */}
      <div className="relative rounded-2xl lg:rounded-3xl overflow-hidden">
        <div className="relative h-52 sm:h-64 md:h-80 lg:h-96">
          {banners.map((banner, index) => (
            <div
              key={banner.id}
              className={`absolute inset-0 transition-all duration-700 ease-out ${
                index === current 
                  ? 'opacity-100 scale-100 translate-x-0' 
                  : index < current 
                    ? 'opacity-0 scale-95 -translate-x-8 pointer-events-none' 
                    : 'opacity-0 scale-95 translate-x-8 pointer-events-none'
              }`}
            >
              <div className="flex h-full">
                {/* Text content - left side with background */}
                <div className="w-[55%] sm:w-[50%] lg:w-[45%] bg-gradient-to-br from-surface via-surface to-primary/10 flex flex-col justify-center px-4 sm:px-6 lg:px-10">
                  <h2 className={`text-sm sm:text-lg md:text-xl lg:text-2xl xl:text-3xl font-bold text-text mb-1 sm:mb-2 lg:mb-3 line-clamp-2 leading-tight transition-all duration-500 delay-100 ${
                    index === current ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                  }`}>
                    {banner.name}
                  </h2>
                  <p className={`text-[10px] sm:text-xs lg:text-sm text-muted mb-2 sm:mb-3 lg:mb-4 line-clamp-2 transition-all duration-500 delay-200 ${
                    index === current ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                  }`}>
                    {banner.heroSubtitle || banner.category || 'Pogledajte ponudu'}
                  </p>
                  {banner.id !== 'default' && banner.price && (
                    <div className={`flex items-baseline gap-1.5 sm:gap-2 lg:gap-3 mb-2 sm:mb-3 lg:mb-4 transition-all duration-500 delay-300 ${
                      index === current ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                    }`}>
                      <span className="text-sm sm:text-lg lg:text-xl xl:text-2xl font-bold text-primary">
                        {banner.price.toFixed(2)} KM
                      </span>
                      {banner.originalPrice && (
                        <span className="text-[10px] sm:text-xs lg:text-sm text-muted/70 line-through">
                          {banner.originalPrice.toFixed(2)} KM
                        </span>
                      )}
                    </div>
                  )}
                  <Link
                    href={banner.id !== 'default' ? `/product/${banner.slug || banner.id}` : '/'}
                    className={`inline-flex items-center gap-1 bg-primary hover:bg-primary/90 text-white px-3 py-1.5 sm:px-4 sm:py-2 lg:px-5 lg:py-2.5 rounded-full text-[10px] sm:text-xs lg:text-sm font-medium transition-all duration-500 delay-400 hover:scale-105 shadow-lg shadow-primary/25 w-fit ${
                      index === current ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                    }`}
                  >
                    {banner.id !== 'default' ? 'Kupi sada' : 'Pogledaj ponudu'}
                    <ChevronRight className="w-3 h-3 lg:w-4 lg:h-4" />
                  </Link>
                </div>
                
                {/* Image container - right side */}
                <div className={`w-[45%] sm:w-[50%] lg:w-[55%] bg-gradient-to-br from-primary/5 to-accent/10 overflow-hidden transition-all duration-700 ${
                  index === current ? 'scale-100' : 'scale-110'
                }`}>
                  {banner.image && isImageUrl(banner.image) ? (
                    <img 
                      src={banner.image} 
                      alt={banner.name || ''} 
                      className={`w-full h-full object-cover transition-transform duration-700 ${
                        index === current ? 'scale-100' : 'scale-105'
                      }`}
                    />
                  ) : (
                    <div className="flex items-center justify-center w-full h-full bg-gradient-to-br from-primary/20 to-accent/20">
                      <span className={`text-5xl sm:text-6xl md:text-7xl lg:text-8xl drop-shadow-lg transition-all duration-500 ${
                        index === current ? 'scale-100 rotate-0' : 'scale-75 rotate-12'
                      }`}>{banner.image}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Controls outside the banner */}
      {banners.length > 1 && (
        <div className="flex items-center justify-between mt-3">
          {/* Dots indicator - left side */}
          <div className="flex gap-1.5 lg:gap-2">
            {banners.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrent(index)}
                className={`rounded-full transition-all duration-300 ${
                  index === current 
                    ? 'bg-primary w-4 sm:w-5 lg:w-6 h-1.5 sm:h-2' 
                    : 'bg-muted/30 hover:bg-muted/50 w-1.5 sm:w-2 h-1.5 sm:h-2'
                }`}
                aria-label={`Idi na slajd ${index + 1}`}
              />
            ))}
          </div>

          {/* Navigation arrows - right side */}
          <div className="flex gap-1.5">
            <button
              onClick={prev}
              className="p-1.5 sm:p-2 bg-surface hover:bg-white/10 rounded-full transition-all border border-white/10"
              aria-label="Prethodna"
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-muted" />
            </button>
            <button
              onClick={next}
              className="p-1.5 sm:p-2 bg-surface hover:bg-white/10 rounded-full transition-all border border-white/10"
              aria-label="Sljedeća"
            >
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-muted" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
