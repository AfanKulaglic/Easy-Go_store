'use client'

import { useState, useEffect, useRef } from 'react'
import { Search, Menu, ShoppingCart, Home, MessageCircle, X, TrendingUp, Clock, ArrowLeft, Moon, Sun, Phone, User, LogOut, LogIn } from 'lucide-react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useProducts, useCategories } from '@/hooks/useProducts'
import { Product } from '@/lib/realtimeProducts'
import { useTheme } from '@/context/ThemeContext'
import { useAuth } from '@/context/AuthContext'
import { useCartStore } from '@/store/cartStore'

const isImageUrl = (str: string) => str?.startsWith('http') || str?.startsWith('/') || str?.startsWith('data:')

const popularSearches = ['Kamera', 'WiFi', 'Sigurnost', 'Smart Home']

export default function Header() {
  const [searchQuery, setSearchQuery] = useState('')
  const [showResults, setShowResults] = useState(false)
  const [searchResults, setSearchResults] = useState<Product[]>([])
  const [isFocused, setIsFocused] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { products } = useProducts()
  const { categories } = useCategories()
  const { theme, toggleTheme } = useTheme()
  const { user, userProfile, logout } = useAuth()
  const totalItems = useCartStore((state) => state.getTotalItems())
  const searchRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [mounted, setMounted] = useState(false)

  const isDark = theme === 'dark'

  useEffect(() => {
    setMounted(true)
  }, [])

  const navItems = [
    { href: '/', icon: Home, label: 'Početna' },
    { href: '/chat', icon: MessageCircle, label: 'Chat' },
    { href: '/cart', icon: ShoppingCart, label: 'Korpa' },
    { href: '/contact', icon: Phone, label: 'Kontakt' },
  ]

  // Search products
  useEffect(() => {
    if (searchQuery.trim().length > 1) {
      const query = searchQuery.toLowerCase()
      const results = products.filter(p => 
        p.name.toLowerCase().includes(query) ||
        p.category?.toLowerCase().includes(query) ||
        p.description?.toLowerCase().includes(query)
      ).slice(0, 6)
      setSearchResults(results)
      setShowResults(true)
    } else {
      setSearchResults([])
      if (searchQuery.length === 0 && isFocused) {
        setShowResults(true)
      } else {
        setShowResults(false)
      }
    }
  }, [searchQuery, products, isFocused])

  // Close search on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowResults(false)
        setIsFocused(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Close menu on route change
  useEffect(() => {
    setMenuOpen(false)
  }, [pathname])

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery)}`)
      closeSearch()
    }
  }

  const handleResultClick = (slugOrId: string) => {
    setSearchQuery('')
    closeSearch()
    router.push(`/product/${slugOrId}`)
  }

  const handlePopularSearch = (term: string) => {
    setSearchQuery(term)
    router.push(`/products?search=${encodeURIComponent(term)}`)
    closeSearch()
  }

  const handleFocus = () => {
    setIsFocused(true)
    setShowResults(true)
  }

  const closeSearch = () => {
    setIsFocused(false)
    setShowResults(false)
    inputRef.current?.blur()
  }

  return (
    <>
      {/* Overlay for mobile when search is focused */}
      {isFocused && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={closeSearch}
        />
      )}

      {/* Mobile Menu Overlay */}
      {menuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-[60] lg:hidden"
          onClick={() => setMenuOpen(false)}
        />
      )}

      {/* Mobile Slide-down Menu */}
      <div className={`fixed top-0 left-0 right-0 bg-background z-[70] lg:hidden transform transition-transform duration-300 ease-out ${
        menuOpen ? 'translate-y-0' : '-translate-y-full'
      }`}>
        <div className="max-h-[85vh] overflow-y-auto">
          {/* Menu Header */}
          <div className="flex items-center justify-between p-4 border-b border-white/10">
            <h2 className="text-lg font-bold text-text">Menu</h2>
            <button 
              onClick={() => setMenuOpen(false)}
              className="p-2 hover:bg-white/5 rounded-xl transition-colors"
            >
              <X className="w-5 h-5 text-muted" />
            </button>
          </div>

          {/* Dark Mode Toggle */}
          <div className="p-4 border-b border-white/5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                  isDark 
                    ? 'bg-gradient-to-br from-indigo-500 to-purple-600' 
                    : 'bg-gradient-to-br from-yellow-400 to-orange-500'
                }`}>
                  {isDark ? <Moon className="w-5 h-5 text-white" /> : <Sun className="w-5 h-5 text-white" />}
                </div>
                <div>
                  <p className="text-sm font-medium text-text">{isDark ? 'Tamni mod' : 'Svijetli mod'}</p>
                  <p className="text-xs text-muted">{isDark ? 'Ugodan za oči' : 'Klasičan izgled'}</p>
                </div>
              </div>
              <button
                onClick={toggleTheme}
                className={`relative w-12 h-6 rounded-full transition-all ${
                  isDark ? 'bg-indigo-500' : 'bg-orange-400'
                }`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${
                  isDark ? 'left-1' : 'left-7'
                }`} />
              </button>
            </div>
          </div>

          {/* User Account Section */}
          <div className="p-4 border-b border-white/5">
            {user ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt="" className="w-12 h-12 rounded-xl object-cover" />
                  ) : (
                    <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl flex items-center justify-center">
                      <span className="text-lg font-bold text-primary">
                        {(userProfile?.displayName || user.email || '?')[0].toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text truncate">{userProfile?.displayName || 'Korisnik'}</p>
                    <p className="text-xs text-muted truncate">{user.email}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link
                    href="/settings"
                    onClick={() => setMenuOpen(false)}
                    className="flex-1 text-center text-xs font-medium text-primary bg-primary/10 hover:bg-primary/20 py-2 rounded-lg transition-colors"
                  >
                    Moj profil
                  </Link>
                  <button
                    onClick={async () => { await logout(); setMenuOpen(false) }}
                    className="flex-1 text-center text-xs font-medium text-danger bg-danger/10 hover:bg-danger/20 py-2 rounded-lg transition-colors"
                  >
                    Odjava
                  </button>
                </div>
              </div>
            ) : (
              <Link
                href="/auth/login"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 w-full"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl flex items-center justify-center">
                  <User className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-text">Prijavite se</p>
                  <p className="text-xs text-muted">Za sve funkcije i praćenje narudžbi</p>
                </div>
                <div className="bg-primary text-white text-xs font-medium px-3 py-1.5 rounded-lg">
                  Prijava
                </div>
              </Link>
            )}
          </div>

          {/* Navigation Items */}
          <div className="p-2">
            {navItems.map(({ href, icon: Icon, label }) => {
              const isActive = pathname === href
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                    isActive 
                      ? 'bg-primary/10 text-primary' 
                      : 'text-text hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{label}</span>
                  {label === 'Korpa' && mounted && totalItems > 0 && (
                    <span className="ml-auto bg-danger text-white text-xs px-2 py-0.5 rounded-full">
                      {totalItems}
                    </span>
                  )}
                </Link>
              )
            })}
          </div>

          {/* Categories Section */}
          <div className="p-4 border-t border-white/5">
            <h3 className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">Kategorije</h3>
            <div className="space-y-1">
              {categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/products/category/${category.slug}`}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-text hover:bg-white/5 transition-colors"
                >
                  <span className="text-lg">{category.icon}</span>
                  <span className="font-medium">{category.name}</span>
                </Link>
              ))}
              
              {/* Rasprodaja */}
              <Link
                href="/products/category/rasprodaja"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl bg-danger/10 text-danger hover:bg-danger/20 transition-colors"
              >
                <span className="text-lg">🏷️</span>
                <span className="font-medium">Rasprodaja</span>
              </Link>
            </div>
          </div>

          {/* Informacije Section */}
          <div className="p-4 border-t border-white/5">
            <h3 className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">Informacije</h3>
            <div className="space-y-1">
              <Link
                href="/o-nama"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-text hover:bg-white/5 transition-colors"
              >
                <span className="text-lg">ℹ️</span>
                <span className="font-medium">O nama</span>
              </Link>
              <Link
                href="/dostava"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-text hover:bg-white/5 transition-colors"
              >
                <span className="text-lg">🚚</span>
                <span className="font-medium">Dostava</span>
              </Link>
              <Link
                href="/garancija"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-text hover:bg-white/5 transition-colors"
              >
                <span className="text-lg">🛡️</span>
                <span className="font-medium">Garancija</span>
              </Link>
              <Link
                href="/reklamacije"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-text hover:bg-white/5 transition-colors"
              >
                <span className="text-lg">📋</span>
                <span className="font-medium">Reklamacije i povrat</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <header className="fixed top-0 left-0 right-0 z-50 bg-background border-b border-white/5">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-3 lg:px-8 lg:py-4">
          {/* Logo - hide on mobile when focused */}
          <Link href="/" className={`flex items-center gap-2 lg:gap-3 ${isFocused ? 'hidden lg:flex' : ''}`}>
            <div className="h-8 lg:h-10 w-auto">
              <img src="/assets/images/full-logo.png" alt="Logo" className="h-full w-auto object-contain" />
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-6">
            {navItems.map(({ href, icon: Icon, label }) => {
              const isActive = pathname === href
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-2 text-sm transition-colors relative ${
                    isActive ? 'text-primary' : 'text-muted hover:text-text'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{label}</span>
                  {label === 'Korpa' && mounted && totalItems > 0 && (
                    <span className="absolute -top-2 -right-3 w-4 h-4 bg-danger rounded-full text-[10px] flex items-center justify-center text-white">
                      {totalItems}
                    </span>
                  )}
                </Link>
              )
            })}
          </nav>

          {/* Search */}
          <div 
            className={`relative z-50 transition-all duration-200 ${
              isFocused 
                ? 'flex-1 lg:flex-1 lg:mx-8 lg:max-w-lg' 
                : 'flex-1 mx-3 max-w-md lg:max-w-lg lg:mx-8'
            }`} 
            ref={searchRef}
          >
            <form onSubmit={handleSearch}>
              <div className="relative flex items-center gap-2">
                {/* Back button on mobile when focused */}
                {isFocused && (
                  <button 
                    type="button"
                    onClick={closeSearch}
                    className="p-2 -ml-2 lg:hidden flex-shrink-0"
                  >
                    <ArrowLeft className="w-5 h-5 text-text" />
                  </button>
                )}
                <div className="relative flex-1">
                  <Search className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 lg:w-5 lg:h-5 transition-colors ${
                    isFocused ? 'text-primary' : 'text-muted'
                  }`} />
                  <input
                    ref={inputRef}
                    type="text"
                    placeholder="Šta tražite danas?"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={handleFocus}
                    className={`w-full bg-background border rounded-xl py-2.5 lg:py-3 pl-10 lg:pl-12 pr-10 text-sm text-text placeholder:text-muted focus:outline-none transition-all ${
                      isFocused 
                        ? 'border-primary shadow-lg shadow-primary/10' 
                        : 'border-white/10 hover:border-white/20'
                    }`}
                  />
                  {searchQuery && (
                    <button 
                      type="button"
                      onClick={() => { setSearchQuery(''); inputRef.current?.focus() }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-white/10 rounded-full transition-colors"
                    >
                      <X className="w-4 h-4 text-muted" />
                    </button>
                  )}
                </div>
              </div>
            </form>

            {/* Search Dropdown */}
            {showResults && (
              <div className={`bg-surface border border-white/10 shadow-2xl shadow-black/30 overflow-hidden z-50 max-h-[75vh] overflow-y-auto ${
                isFocused 
                  ? 'fixed left-0 right-0 top-[60px] rounded-none border-x-0 border-t-0 lg:absolute lg:left-0 lg:right-0 lg:top-full lg:mt-2 lg:rounded-2xl lg:border' 
                  : 'absolute top-full left-0 right-0 mt-2 rounded-2xl'
              }`}>
                
                {/* No query - show suggestions */}
                {searchQuery.length === 0 && (
                  <>
                    <div className="p-4 border-b border-white/5">
                      <div className="flex items-center gap-2 text-xs text-muted mb-3">
                        <TrendingUp className="w-3.5 h-3.5" />
                        <span>Popularno</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {popularSearches.map((term) => (
                          <button
                            key={term}
                            onClick={() => handlePopularSearch(term)}
                            className="px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary text-sm rounded-full transition-colors"
                          >
                            {term}
                          </button>
                        ))}
                      </div>
                    </div>

                    {products.length > 0 && (
                      <div className="p-4">
                        <div className="flex items-center gap-2 text-xs text-muted mb-3">
                          <Clock className="w-3.5 h-3.5" />
                          <span>Preporučeno</span>
                        </div>
                        <div className="space-y-1">
                          {products.slice(0, 4).map((product) => (
                            <button
                              key={product.id}
                              onClick={() => handleResultClick(product.slug || product.id!)}
                              className="w-full flex items-center gap-3 p-3 hover:bg-white/5 rounded-xl transition-colors text-left"
                            >
                              <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden">
                                {isImageUrl(product.image) ? (
                                  <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                                ) : (
                                  <span className="text-xl">{product.image}</span>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm text-text truncate">{product.name}</p>
                                <p className="text-xs text-muted">{product.category}</p>
                              </div>
                              <span className="text-sm font-bold text-primary">{product.price.toFixed(2)} KM</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}

                {/* Search Results */}
                {searchQuery.length > 1 && searchResults.length > 0 && (
                  <>
                    <div className="p-2">
                      {searchResults.map((product, index) => (
                        <button
                          key={product.id}
                          onClick={() => handleResultClick(product.slug || product.id!)}
                          className={`w-full flex items-center gap-3 p-3 hover:bg-white/5 rounded-xl transition-colors text-left ${
                            index === 0 ? 'bg-white/[0.02]' : ''
                          }`}
                        >
                          <div className="w-14 h-14 bg-white/5 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden">
                            {isImageUrl(product.image) ? (
                              <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-2xl">{product.image}</span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-text line-clamp-1 font-medium">{product.name}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs text-muted">{product.category}</span>
                              {product.badge && (
                                <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                                  product.badge === 'sale' ? 'bg-danger/20 text-danger' : 'bg-accent/20 text-accent'
                                }`}>
                                  {product.badge === 'sale' ? 'Akcija' : 'Novo'}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <span className="text-base font-bold text-primary">{product.price.toFixed(2)} KM</span>
                            {product.originalPrice && product.originalPrice > product.price && (
                              <span className="text-[11px] text-muted line-through block">{product.originalPrice.toFixed(2)}</span>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                    <Link
                      href={`/products?search=${encodeURIComponent(searchQuery)}`}
                      onClick={closeSearch}
                      className="flex items-center justify-center gap-2 p-4 text-sm text-primary hover:bg-primary/5 border-t border-white/5 transition-colors font-medium"
                    >
                      <Search className="w-4 h-4" />
                      <span>Vidi sve rezultate za "{searchQuery}"</span>
                    </Link>
                  </>
                )}

                {/* No Results */}
                {searchQuery.length > 1 && searchResults.length === 0 && (
                  <div className="p-8 text-center">
                    <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Search className="w-8 h-8 text-muted" />
                    </div>
                    <p className="text-base text-text mb-1">Nema rezultata</p>
                    <p className="text-sm text-muted">Pokušajte s drugim pojmom za "{searchQuery}"</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right side - User + Dark mode toggle + Burger menu (mobile) */}
          <div className={`flex items-center gap-2 ${isFocused ? 'hidden lg:flex' : ''}`}>
            {/* Desktop dark mode toggle */}
            <button
              onClick={toggleTheme}
              className="hidden lg:flex p-2 hover:bg-white/5 rounded-lg transition-colors"
              aria-label="Toggle theme"
            >
              {isDark ? <Moon className="w-5 h-5 text-muted" /> : <Sun className="w-5 h-5 text-muted" />}
            </button>

            {/* Desktop user button */}
            {user ? (
              <Link
                href="/settings"
                className="hidden lg:flex items-center gap-2 p-1.5 hover:bg-white/5 rounded-lg transition-colors"
              >
                {user.photoURL ? (
                  <img src={user.photoURL} alt="" className="w-7 h-7 rounded-full object-cover" />
                ) : (
                  <div className="w-7 h-7 bg-primary/20 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-primary">
                      {(userProfile?.displayName || user.email || '?')[0].toUpperCase()}
                    </span>
                  </div>
                )}
              </Link>
            ) : (
              <Link
                href="/auth/login"
                className="hidden lg:flex items-center gap-2 text-sm text-muted hover:text-text transition-colors p-2"
              >
                <User className="w-4 h-4" />
                <span>Prijava</span>
              </Link>
            )}

            {/* Mobile burger menu */}
            <button 
              onClick={() => setMenuOpen(true)}
              className="p-2 hover:bg-white/5 rounded-lg transition-colors lg:hidden" 
              aria-label="Menu"
            >
              <Menu className="w-5 h-5 text-muted" />
            </button>
          </div>
        </div>
      </header>
    </>
  )
}
