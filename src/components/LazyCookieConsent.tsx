'use client'

import dynamic from 'next/dynamic'

const CookieConsent = dynamic(() => import('@/components/CookieConsent').then(m => ({ default: m.default })), { ssr: false })
const CookieSettingsButton = dynamic(() => import('@/components/CookieConsent').then(m => ({ default: m.CookieSettingsButton })), { ssr: false })

export default function LazyCookieConsent() {
  return (
    <>
      <CookieConsent />
      <CookieSettingsButton />
    </>
  )
}
