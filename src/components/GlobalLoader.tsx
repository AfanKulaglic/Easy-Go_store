'use client'

import { useDataCache } from '@/context/DataCacheContext'
import { Loading3D } from './Loading3D'

export function GlobalLoader({ children }: { children: React.ReactNode }) {
  const { loading, progress, isInitialized } = useDataCache()

  // Show 3D loader while loading
  if (loading && !isInitialized) {
    return <Loading3D progress={progress} text="Učitavanje podataka..." />
  }

  return <>{children}</>
}
