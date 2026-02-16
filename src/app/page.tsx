'use client'

import { useEffect } from 'react'
import dynamic from 'next/dynamic'
import HeroBanner from '@/components/HeroBanner'
import CategoryGrid from '@/components/CategoryGrid'
import FlashDeals from '@/components/FlashDeals'
import { trackPageView } from '@/lib/cookieManager'

// Lazy load below-the-fold components
const DarkModeToggle = dynamic(() => import('@/components/DarkModeToggle'), { ssr: false })
const TopProducts = dynamic(() => import('@/components/TopProducts'))
const PromoBanner = dynamic(() => import('@/components/PromoBanner'))
const WeeklyBestSellers = dynamic(() => import('@/components/WeeklyBestSellers'))
const TrustBadges = dynamic(() => import('@/components/TrustBadges'))
const FeaturedProducts = dynamic(() => import('@/components/FeaturedProducts'))

export default function Home() {
  useEffect(() => {
    trackPageView()
  }, [])

  return (
    <div className="min-h-screen lg:py-6">
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
