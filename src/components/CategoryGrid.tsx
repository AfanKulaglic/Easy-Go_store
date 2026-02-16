'use client'

import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { useCategories } from '@/hooks/useProducts'

// Map text icons to emojis
const iconMap: Record<string, string> = {
  'camera': '📷',
  'binoculars': '🔭',
  'projector': '📽️',
  'home': '🏠',
  'headphones': '🎧',
  'smartphone': '📱',
  'tent': '⛺',
  'tag': '🏷️',
}

// Check if string is an emoji (length 1-2 or starts with emoji)
const isEmoji = (str: string) => {
  if (!str) return false
  // Check if it's a short string (emojis are typically 1-4 chars due to unicode)
  if (str.length <= 4) {
    // Simple check - if it's not alphanumeric, it's likely an emoji
    return !/^[a-zA-Z0-9]+$/.test(str)
  }
  return false
}

// Get display icon - either the emoji itself or mapped from text
const getDisplayIcon = (icon: string): string => {
  if (isEmoji(icon)) return icon
  return iconMap[icon.toLowerCase()] || '📦'
}

export default function CategoryGrid() {
  const { categories, loading } = useCategories()
  
  // Filter categories to show only those marked for home page
  const homeCategories = categories.filter(cat => cat.showOnHome !== false)

  if (loading) {
    return (
      <section className="px-4 py-6 lg:px-8 lg:py-10">
        <div className="flex items-center justify-between mb-5">
          <div className="h-7 bg-surface rounded-lg w-32 animate-pulse" />
          <div className="h-5 bg-surface rounded-lg w-20 animate-pulse" />
        </div>
        <div className="grid grid-cols-4 lg:grid-cols-8 gap-3">
          {[1,2,3,4,5,6,7,8].map(i => (
            <div key={i} className="aspect-square bg-surface rounded-2xl animate-pulse" />
          ))}
        </div>
      </section>
    )
  }

  if (homeCategories.length === 0) {
    return null
  }

  return (
    <section className="px-4 py-6 lg:px-8 lg:py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-5 lg:mb-6">
        <h2 className="text-lg lg:text-xl font-bold text-text">Kategorije</h2>
        <Link 
          href="/products" 
          className="flex items-center gap-1 text-sm text-primary hover:text-primary/80 font-medium transition-colors"
        >
          Vidi sve
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-4 lg:grid-cols-8 gap-3 lg:gap-4">
        {homeCategories.map((category, index) => {
          const displayIcon = getDisplayIcon(category.icon)
          
          return (
            <Link
              key={category.id}
              href={`/products/category/${category.slug}`}
              className="group flex flex-col items-center p-3 lg:p-4 rounded-2xl transition-all duration-300 hover:scale-105 hover:-translate-y-1 bg-surface border border-white/5 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/10 aspect-square"
              style={{ animationDelay: `${index * 30}ms` }}
            >
              <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 flex-shrink-0 bg-gradient-to-br from-primary/20 to-accent/10">
                <span className="text-xl lg:text-2xl">{displayIcon}</span>
              </div>
              <span className="text-[10px] lg:text-xs text-center font-medium line-clamp-2 mt-2 h-8 flex items-center transition-colors text-text group-hover:text-primary">
                {category.name}
              </span>
            </Link>
          )
        })}
        
        {/* Hardcoded Rasprodaja card - always at the end */}
        <Link
          href="/products/category/rasprodaja"
          className="group flex flex-col items-center p-3 lg:p-4 rounded-2xl transition-all duration-300 hover:scale-105 hover:-translate-y-1 bg-secondary/20 border-2 border-orange-500 shadow-lg shadow-orange-500/30 hover:shadow-xl hover:shadow-orange-500/40 aspect-square"
          style={{ animationDelay: `${homeCategories.length * 30}ms` }}
        >
          <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 flex-shrink-0 bg-gradient-to-br from-danger to-red-600 shadow-lg shadow-danger/30">
            <span className="text-xl lg:text-2xl">🏷️</span>
          </div>
          <span className="text-[10px] lg:text-xs text-center font-medium line-clamp-2 mt-2 h-8 flex items-center transition-colors text-danger">
            Rasprodaja
          </span>
        </Link>
      </div>
    </section>
  )
}
