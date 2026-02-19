'use client'

import { useEffect } from 'react'
import dynamic from 'next/dynamic'
import HeroBanner from '@/components/HeroBanner'
import CategoryGrid from '@/components/CategoryGrid'
import FlashDeals from '@/components/FlashDeals'
import TopProducts from '@/components/TopProducts'
import PromoBanner from '@/components/PromoBanner'
import WeeklyBestSellers from '@/components/WeeklyBestSellers'
import TrustBadges from '@/components/TrustBadges'
import FeaturedProducts from '@/components/FeaturedProducts'
import { trackPageView } from '@/lib/cookieManager'

// Only DarkModeToggle needs dynamic import (client-only, no SSR)
const DarkModeToggle = dynamic(() => import('@/components/DarkModeToggle'), { ssr: false })

export default function Home() {
  useEffect(() => {
    trackPageView()
  }, [])

  return (
    <div className="min-h-screen lg:py-6 max-w-7xl mx-auto">
      <HeroBanner />
      <CategoryGrid />
      <FlashDeals />
      <div className="px-4 py-4 lg:px-8">
        <DarkModeToggle />
      </div>
      <TopProducts />
      
      {/* Trust badges */}
      <TrustBadges />
      
      <WeeklyBestSellers />
      
      {/* Promo banner */}
      <div className="lg:px-8">
        <PromoBanner 
          title="Flash ponude - do 50% popusta!"
          subtitle="Ograničene količine, požuri dok traje akcija"
          buttonText="Pogledaj ponude"
          href="/products/category/rasprodaja"
          variant="danger"
          emoji="⚡"
        />
      </div>
      
      <FeaturedProducts />
    </div>
  )
}
