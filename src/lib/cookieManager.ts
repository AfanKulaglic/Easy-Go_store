/**
 * Cookie Manager — EU GDPR / ePrivacy Directive compliant
 *
 * Manages real browser cookies based on user consent.
 * Categories:
 *   - necessary:  session, security, cart — always allowed (exempt from consent)
 *   - functional: theme, language, recently-viewed products
 *   - analytics:  anonymous session tracking, page-view counting
 *   - marketing:  referral source, interest-based tracking
 */

// ── Types ──────────────────────────────────────────────

export interface CookiePreferences {
  necessary: boolean   // always true
  functional: boolean
  analytics: boolean
  marketing: boolean
}

export interface StoredConsent {
  version: string
  preferences: CookiePreferences
  timestamp: string
}

export type CookieCategory = keyof CookiePreferences

// ── Constants ──────────────────────────────────────────

export const CONSENT_KEY = 'easygo_cookie_consent'
export const CONSENT_VERSION = '1.0'

// Map every cookie name → its category so we know which to set/clear
const COOKIE_REGISTRY: Record<string, { category: CookieCategory; maxAgeDays: number; description: string }> = {
  // Necessary — exempt from consent
  easygo_session:       { category: 'necessary',  maxAgeDays: 1,   description: 'Session identifier' },
  easygo_csrf:          { category: 'necessary',  maxAgeDays: 1,   description: 'CSRF protection token' },

  // Functional
  easygo_theme:         { category: 'functional', maxAgeDays: 365, description: 'Preferred colour theme' },
  easygo_lang:          { category: 'functional', maxAgeDays: 365, description: 'Preferred language' },
  easygo_recent:        { category: 'functional', maxAgeDays: 30,  description: 'Recently viewed products' },

  // Analytics
  easygo_sid:           { category: 'analytics',  maxAgeDays: 1,   description: 'Anonymous session ID' },
  easygo_pageviews:     { category: 'analytics',  maxAgeDays: 1,   description: 'Page-view count per session' },
  easygo_first_visit:   { category: 'analytics',  maxAgeDays: 365, description: 'First-visit timestamp' },

  // Marketing
  easygo_ref:           { category: 'marketing',  maxAgeDays: 30,  description: 'Referral source' },
  easygo_interests:     { category: 'marketing',  maxAgeDays: 90,  description: 'Interest categories' },
}

// ── Low-level cookie helpers ───────────────────────────

function setCookie(name: string, value: string, maxAgeDays: number): void {
  const maxAge = maxAgeDays * 86400
  // SameSite=Lax is the recommended default for GDPR; Secure when served over HTTPS
  const secure = typeof window !== 'undefined' && window.location.protocol === 'https:' ? '; Secure' : ''
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}; SameSite=Lax${secure}`
}

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`))
  return match ? decodeURIComponent(match[1]) : null
}

function deleteCookie(name: string): void {
  document.cookie = `${name}=; path=/; max-age=0; SameSite=Lax`
}

// ── Consent helpers ────────────────────────────────────

/** Read stored consent from localStorage (consent record itself is not a cookie) */
export function getConsent(): StoredConsent | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(CONSENT_KEY)
    if (!raw) return null
    const parsed: StoredConsent = JSON.parse(raw)
    if (parsed.version !== CONSENT_VERSION) return null
    return parsed
  } catch {
    return null
  }
}

/** Check if a specific category is currently consented to */
export function hasConsent(category: CookieCategory): boolean {
  if (category === 'necessary') return true
  const consent = getConsent()
  if (!consent) return false
  return consent.preferences[category] === true
}

/** Save consent and apply it (set or clear cookies accordingly) */
export function saveConsent(prefs: CookiePreferences): void {
  const consent: StoredConsent = {
    version: CONSENT_VERSION,
    preferences: { ...prefs, necessary: true },
    timestamp: new Date().toISOString(),
  }
  localStorage.setItem(CONSENT_KEY, JSON.stringify(consent))
  applyConsent(consent.preferences)
}

// ── Apply / enforce consent ────────────────────────────

/** Set cookies for allowed categories; delete cookies for denied ones */
export function applyConsent(prefs: CookiePreferences): void {
  if (typeof document === 'undefined') return

  for (const [name, meta] of Object.entries(COOKIE_REGISTRY)) {
    if (prefs[meta.category]) {
      // Category allowed — set the cookie if not already present
      if (!getCookie(name)) {
        const value = generateCookieValue(name)
        setCookie(name, value, meta.maxAgeDays)
      }
    } else {
      // Category denied — remove the cookie
      deleteCookie(name)
    }
  }
}

/** Remove ALL non-necessary cookies (used on reject-all or consent withdrawal) */
export function clearNonEssentialCookies(): void {
  if (typeof document === 'undefined') return
  for (const [name, meta] of Object.entries(COOKIE_REGISTRY)) {
    if (meta.category !== 'necessary') {
      deleteCookie(name)
    }
  }
}

// ── Cookie value generators ────────────────────────────

function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}

function generateCookieValue(name: string): string {
  switch (name) {
    case 'easygo_session':
      return generateId()
    case 'easygo_csrf':
      return generateId()
    case 'easygo_theme':
      // Reads current theme from localStorage or DOM
      if (typeof document !== 'undefined') {
        return document.documentElement.getAttribute('data-theme') || 'dark'
      }
      return 'dark'
    case 'easygo_lang':
      return document.documentElement.lang || 'bs'
    case 'easygo_recent':
      return '[]' // will be populated as user browses products
    case 'easygo_sid':
      return generateId()
    case 'easygo_pageviews':
      return '1'
    case 'easygo_first_visit':
      return new Date().toISOString()
    case 'easygo_ref':
      try {
        return document.referrer ? new URL(document.referrer).hostname : 'direct'
      } catch {
        return 'direct'
      }
    case 'easygo_interests':
      return '[]'
    default:
      return ''
  }
}

// ── Public API for other components ────────────────────

/** Track a page view (increments counter if analytics is consented) */
export function trackPageView(): void {
  if (!hasConsent('analytics')) return
  const current = parseInt(getCookie('easygo_pageviews') || '0', 10)
  setCookie('easygo_pageviews', String(current + 1), 1)
}

/** Record a recently viewed product (if functional is consented) */
export function trackRecentProduct(productId: string): void {
  if (!hasConsent('functional')) return
  try {
    const raw = getCookie('easygo_recent') || '[]'
    const recent: string[] = JSON.parse(raw)
    const updated = [productId, ...recent.filter(id => id !== productId)].slice(0, 10)
    setCookie('easygo_recent', JSON.stringify(updated), 30)
  } catch {
    setCookie('easygo_recent', JSON.stringify([productId]), 30)
  }
}

/** Record a user interest category (if marketing is consented) */
export function trackInterest(interest: string): void {
  if (!hasConsent('marketing')) return
  try {
    const raw = getCookie('easygo_interests') || '[]'
    const interests: string[] = JSON.parse(raw)
    if (!interests.includes(interest)) {
      interests.push(interest)
      setCookie('easygo_interests', JSON.stringify(interests.slice(-20)), 90)
    }
  } catch {
    setCookie('easygo_interests', JSON.stringify([interest]), 90)
  }
}

/** Sync theme cookie when user changes theme (if functional is consented) */
export function syncThemeCookie(theme: string): void {
  if (!hasConsent('functional')) return
  setCookie('easygo_theme', theme, 365)
}

/** Get list of all cookies with their info for the cookie policy page */
export function getCookieRegistry() {
  return Object.entries(COOKIE_REGISTRY).map(([name, meta]) => ({
    name,
    ...meta,
  }))
}

/** Initialize — call once on app mount to enforce existing consent */
export function initCookieManager(): void {
  const consent = getConsent()
  if (consent) {
    applyConsent(consent.preferences)
  } else {
    // No consent yet — only set necessary cookies
    applyConsent({
      necessary: true,
      functional: false,
      analytics: false,
      marketing: false,
    })
  }
}
