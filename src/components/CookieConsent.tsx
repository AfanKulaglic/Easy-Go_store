'use client'

import { useState, useEffect, useCallback, createContext, useContext } from 'react'
import { Cookie, Shield, ChevronDown, ChevronUp, Settings2 } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  type CookiePreferences,
  CONSENT_KEY,
  getConsent,
  saveConsent as saveCookieConsent,
  clearNonEssentialCookies,
  initCookieManager,
} from '@/lib/cookieManager'

// ── Shared state so CookieSettingsButton can re-open the banner without reload ──
type ReopenFn = () => void
const ReopenContext = createContext<ReopenFn | null>(null)

export default function CookieConsent() {
  const pathname = usePathname()
  const [visible, setVisible] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const [animateIn, setAnimateIn] = useState(false)
  const [hasConsented, setHasConsented] = useState(true) // assume yes until checked (prevents flash)
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true,
    functional: false,
    analytics: false,
    marketing: false,
  })

  // Initialize cookie manager & check for existing consent on mount
  useEffect(() => {
    initCookieManager()

    const consent = getConsent()
    if (consent) {
      setHasConsented(true)
      return
    }
    // No consent — show the banner
    setHasConsented(false)
    const timer = setTimeout(() => {
      setVisible(true)
      requestAnimationFrame(() => setAnimateIn(true))
    }, 1200)
    return () => clearTimeout(timer)
  }, [])

  // Called by CookieSettingsButton to re-open the banner without any page reload
  const reopen = useCallback(() => {
    clearNonEssentialCookies()
    localStorage.removeItem(CONSENT_KEY)
    setHasConsented(false)
    setShowDetails(false)
    setPreferences({
      necessary: true,
      functional: false,
      analytics: false,
      marketing: false,
    })
    setVisible(true)
    requestAnimationFrame(() => setAnimateIn(true))
  }, [])

  const handleSave = useCallback((prefs: CookiePreferences) => {
    saveCookieConsent(prefs)
    setAnimateIn(false)
    setTimeout(() => {
      setVisible(false)
      setHasConsented(true)
    }, 300)
  }, [])

  const handleAcceptAll = () => {
    const all: CookiePreferences = {
      necessary: true,
      functional: true,
      analytics: true,
      marketing: true,
    }
    setPreferences(all)
    handleSave(all)
  }

  const handleRejectAll = () => {
    const minimal: CookiePreferences = {
      necessary: true,
      functional: false,
      analytics: false,
      marketing: false,
    }
    setPreferences(minimal)
    clearNonEssentialCookies()
    handleSave(minimal)
  }

  const handleSavePreferences = () => {
    handleSave(preferences)
  }

  const toggleCategory = (key: keyof CookiePreferences) => {
    if (key === 'necessary') return
    setPreferences(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const categories = [
    {
      key: 'necessary' as const,
      name: 'Neophodni kolačići',
      description: 'Potrebni za osnovne funkcije stranice poput navigacije, sigurnosti i pristupa zaštićenim područjima. Bez ovih kolačića stranica ne može pravilno funkcionisati.',
      cookies: 'easygo_session, easygo_csrf',
      locked: true,
    },
    {
      key: 'functional' as const,
      name: 'Funkcionalni kolačići',
      description: 'Omogućavaju personalizirana iskustva poput zapamćenog tema, jezika ili nedavno pregledanih proizvoda.',
      cookies: 'easygo_theme, easygo_lang, easygo_recent',
      locked: false,
    },
    {
      key: 'analytics' as const,
      name: 'Analitički kolačići',
      description: 'Pomažu nam razumjeti kako koristite stranicu — anonimni ID sesije, broj pregleda stranica i datum prvog posjeta.',
      cookies: 'easygo_sid, easygo_pageviews, easygo_first_visit',
      locked: false,
    },
    {
      key: 'marketing' as const,
      name: 'Marketinški kolačići',
      description: 'Koriste se za praćenje izvora posjeta i interesa korisnika radi relevantnijeg sadržaja.',
      cookies: 'easygo_ref, easygo_interests',
      locked: false,
    },
  ]

  return (
    <ReopenContext.Provider value={reopen}>
      {/* Banner */}
      {visible && (
        <div
          className={`fixed bottom-4 right-4 z-[9999] w-[calc(100vw-2rem)] sm:w-[420px] transition-all duration-300 ease-out ${
            animateIn
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-4'
          }`}
        >
          <div className="bg-surface border border-white/[0.08] rounded-2xl shadow-2xl shadow-black/30 overflow-hidden">
            
            {/* Header */}
            <div className="p-5 pb-3">
              <div className="flex items-start gap-3.5">
                <div className="relative flex-shrink-0">
                  <div className="absolute inset-0 bg-primary/20 rounded-xl blur-lg scale-125" />
                  <div className="relative h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center">
                    <Cookie className="w-5 h-5 text-white" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-[15px] font-bold text-text leading-tight">
                    Koristimo kolačiće 🍪
                  </h3>
                  <p className="text-[13px] text-muted mt-1.5 leading-relaxed">
                    Koristimo kolačiće za poboljšanje vašeg iskustva, analizu prometa i personalizaciju sadržaja.
                    Možete odabrati koje kolačiće prihvatate.
                  </p>
                </div>
              </div>
            </div>

            {/* Category toggles — expandable */}
            {showDetails && (
              <div className="px-5 pb-2 space-y-2.5 animate-[fadeSlideIn_0.25s_ease-out]">
                {categories.map(({ key, name, description, cookies, locked }) => (
                  <div
                    key={key}
                    className="bg-background/60 rounded-xl p-3.5 border border-white/[0.04]"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <span className="text-[13px] font-semibold text-text">{name}</span>
                      </div>
                      {locked ? (
                        <span className="text-[11px] text-accent font-medium bg-accent/10 px-2.5 py-1 rounded-full whitespace-nowrap">
                          Uvijek aktivni
                        </span>
                      ) : (
                        <button
                          onClick={() => toggleCategory(key)}
                          className={`relative w-11 h-6 rounded-full transition-colors duration-200 flex-shrink-0 ${
                            preferences[key]
                              ? 'bg-primary'
                              : 'bg-white/[0.1]'
                          }`}
                          aria-label={`${preferences[key] ? 'Isključi' : 'Uključi'} ${name}`}
                        >
                          <div
                            className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                              preferences[key] ? 'translate-x-[22px]' : 'translate-x-0.5'
                            }`}
                          />
                        </button>
                      )}
                    </div>
                    <p className="text-[11px] text-muted leading-relaxed mt-1.5">
                      {description}
                    </p>
                    <p className="text-[10px] text-muted/40 mt-1 font-mono">
                      {cookies}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Actions */}
            <div className="p-5 pt-3 space-y-2.5">
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="w-full flex items-center justify-center gap-1.5 text-[12px] text-muted hover:text-text font-medium transition-colors py-1"
              >
                <Settings2 className="w-3.5 h-3.5" />
                {showDetails ? 'Sakrij postavke' : 'Prilagodi postavke'}
                {showDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>

              <div className="flex gap-2">
                <button
                  onClick={handleRejectAll}
                  className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold text-muted bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] transition-all"
                >
                  Odbij sve
                </button>
                {showDetails ? (
                  <button
                    onClick={handleSavePreferences}
                    className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold text-white bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 shadow-lg shadow-primary/20 transition-all"
                  >
                    Spremi izbor
                  </button>
                ) : (
                  <button
                    onClick={handleAcceptAll}
                    className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold text-white bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 shadow-lg shadow-primary/20 transition-all"
                  >
                    Prihvati sve
                  </button>
                )}
              </div>
            </div>

            {/* Footer — privacy links + trust */}
            <div className="px-5 pb-4 pt-0">
              <div className="flex items-center justify-between border-t border-white/[0.04] pt-3">
                <div className="flex items-center gap-1.5 text-muted/50">
                  <Shield className="w-3 h-3" />
                  <span className="text-[10px]">GDPR & ePrivacy</span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-muted/60">
                  <Link href="/privacy" className="hover:text-text transition-colors">
                    Privatnost
                  </Link>
                  <span className="text-white/10">|</span>
                  <Link href="/terms" className="hover:text-text transition-colors">
                    Uslovi
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Settings button — only visible when consent was already given and banner is hidden */}
      {hasConsented && !visible && <CookieSettingsButtonInner pathname={pathname} />}
    </ReopenContext.Provider>
  )
}

// Inner settings button that uses context to reopen the banner (no reload)
function CookieSettingsButtonInner({ pathname }: { pathname: string }) {
  const reopen = useContext(ReopenContext)
  const isProductPage = pathname.startsWith('/product/')

  return (
    <button
      onClick={() => reopen?.()}
      className={`fixed right-4 z-[9998] h-10 w-10 rounded-full bg-surface border border-white/[0.08] shadow-lg shadow-black/20 flex items-center justify-center text-muted hover:text-primary hover:border-primary/30 transition-all group ${
        isProductPage ? 'bottom-20 lg:bottom-4' : 'bottom-4'
      }`}
      aria-label="Postavke kolačića"
      title="Postavke kolačića"
    >
      <Cookie className="w-4.5 h-4.5 group-hover:scale-110 transition-transform" />
    </button>
  )
}

// Keep the named export for backward compatibility but it's now a no-op
// (the button is rendered inside CookieConsent itself via context)
export function CookieSettingsButton() {
  return null
}
