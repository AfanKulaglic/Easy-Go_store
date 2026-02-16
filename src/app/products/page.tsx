'use client'

import { useState, useMemo, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Search, SlidersHorizontal, Grid3X3, LayoutList, X, ChevronDown, Package, Heart, ShoppingCart } from 'lucide-react'
import { useProducts, useCategories, useSubcategories } from '@/hooks/useProducts'
import ProductCard from '@/components/ProductCard'
import { ProductGridSkeleton } from '@/components/Loading'
import { Product } from '@/lib/realtimeProducts'
import { useCartStore } from '@/store/cartStore'

type SortOption = 'default' | 'price-asc' | 'price-desc' | 'name' | 'newest'
type ViewMode = 'grid' | 'list'

export default function ProductsPage() {
  const { products, loading: productsLoading } = useProducts()
  const { categories, loading: categoriesLoading } = useCategories()
  const { subcategories, loading: subcategoriesLoading } = useSubcategories()
  const searchParams = useSearchParams()
  
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<SortOption>('default')
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [showFilters, setShowFilters] = useState(false)
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000])
  const [quickFilter, setQuickFilter] = useState<'sale' | 'new' | 'popular' | null>(null)

  useEffect(() => {
    const search = searchParams.get('search')
    if (search) {
      setSearchQuery(search)
    }
  }, [searchParams])

  const loading = productsLoading || categoriesLoading || subcategoriesLoading

  // Get subcategories for selected category
  const categorySubcategories = useMemo(() => {
    if (!selectedCategory) return []
    const category = categories.find(c => c.slug === selectedCategory)
    if (!category) return []
    return subcategories.filter(s => s.categoryId === category.id)
  }, [subcategories, categories, selectedCategory])

  const filteredProducts = useMemo(() => {
    let result = [...products]

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(p => 
        p.name.toLowerCase().includes(query) ||
        p.category?.toLowerCase().includes(query) ||
        p.description?.toLowerCase().includes(query)
      )
    }

    if (selectedCategory) {
      result = result.filter(p => p.categorySlug === selectedCategory)
    }

    if (selectedSubcategory) {
      result = result.filter(p => p.subcategoryId === selectedSubcategory)
    }

    result = result.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1])

    if (quickFilter === 'sale') {
      result = result.filter(p => p.badge === 'sale' || p.badge === 'discount' || (p.originalPrice && p.originalPrice > p.price))
    } else if (quickFilter === 'new') {
      result = result.filter(p => p.badge === 'new')
    } else if (quickFilter === 'popular') {
      result = result.filter(p => p.reviews > 0 || p.rating >= 4)
    }

    switch (sortBy) {
      case 'price-asc':
        result.sort((a, b) => a.price - b.price)
        break
      case 'price-desc':
        result.sort((a, b) => b.price - a.price)
        break
      case 'name':
        result.sort((a, b) => a.name.localeCompare(b.name))
        break
      case 'newest':
        result.sort((a, b) => (b.reviews || 0) - (a.reviews || 0))
        break
    }

    return result
  }, [products, searchQuery, selectedCategory, selectedSubcategory, sortBy, priceRange, quickFilter])

  const selectedCategoryName = categories.find(c => c.slug === selectedCategory)?.name

  const clearFilters = () => {
    setSearchQuery('')
    setSelectedCategory(null)
    setSelectedSubcategory(null)
    setSortBy('default')
    setPriceRange([0, 1000])
    setQuickFilter(null)
  }

  const handleCategoryChange = (categorySlug: string | null) => {
    setSelectedCategory(categorySlug)
    setSelectedSubcategory(null) // Reset subcategory when category changes
  }

  const hasActiveFilters = searchQuery || selectedCategory || selectedSubcategory || sortBy !== 'default' || priceRange[0] > 0 || priceRange[1] < 1000 || quickFilter

  return (
    <div className="min-h-screen bg-background pb-8">
      <div className="max-w-7xl mx-auto px-4 py-6 lg:px-8">
        
        {/* Page Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg shadow-primary/25">
            <Package className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg lg:text-xl font-bold text-text">
              {selectedCategoryName || 'Svi proizvodi'}
            </h1>
            <p className="text-xs text-muted">
              {filteredProducts.length} {filteredProducts.length === 1 ? 'proizvod' : 'proizvoda'}
            </p>
          </div>
        </div>

        {/* Category Pills - Horizontal scroll on mobile */}
        <div className="mb-4 -mx-4 px-4 lg:mx-0 lg:px-0">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <button
              onClick={() => handleCategoryChange(null)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                !selectedCategory 
                  ? 'bg-primary text-white shadow-lg shadow-primary/25' 
                  : 'bg-surface text-muted border border-white/10 hover:border-primary/30'
              }`}
            >
              Sve
            </button>
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => handleCategoryChange(cat.slug)}
                className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedCategory === cat.slug 
                    ? 'bg-primary text-white shadow-lg shadow-primary/25' 
                    : 'bg-surface text-muted border border-white/10 hover:border-primary/30'
                }`}
              >
                {cat.icon && cat.icon.length <= 2 && <span>{cat.icon}</span>}
                <span>{cat.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Subcategory Pills - Show when category is selected */}
        {categorySubcategories.length > 0 && (
          <div className="mb-4 -mx-4 px-4 lg:mx-0 lg:px-0">
            <p className="text-xs text-muted mb-2">Podkategorije</p>
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              <button
                onClick={() => setSelectedSubcategory(null)}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  !selectedSubcategory 
                    ? 'bg-accent text-white shadow-lg shadow-accent/25' 
                    : 'bg-surface text-muted border border-white/10 hover:border-accent/30'
                }`}
              >
                Sve
              </button>
              {categorySubcategories.map(sub => (
                <button
                  key={sub.id}
                  onClick={() => setSelectedSubcategory(sub.id!)}
                  className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    selectedSubcategory === sub.id 
                      ? 'bg-accent text-white shadow-lg shadow-accent/25' 
                      : 'bg-surface text-muted border border-white/10 hover:border-accent/30'
                  }`}
                >
                  {sub.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Search and Controls Bar */}
        <div className="flex gap-2 mb-5">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <input
              type="text"
              placeholder="Pretraži..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-surface border border-white/10 rounded-xl py-2.5 pl-10 pr-10 text-sm text-text placeholder:text-muted focus:outline-none focus:border-primary transition-colors"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-white/10 rounded-full"
              >
                <X className="w-4 h-4 text-muted" />
              </button>
            )}
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl border transition-colors ${
              showFilters || hasActiveFilters ? 'bg-primary/20 border-primary/30 text-primary' : 'bg-surface border-white/10 text-muted'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span className="text-sm hidden sm:inline">Filteri</span>
          </button>

          {/* Sort Dropdown */}
          <div className="relative hidden sm:block">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="appearance-none bg-surface border border-white/10 rounded-xl px-3 py-2.5 pr-8 text-sm text-text focus:outline-none focus:border-primary cursor-pointer"
            >
              <option value="default">Sortiraj</option>
              <option value="price-asc">Cijena ↑</option>
              <option value="price-desc">Cijena ↓</option>
              <option value="name">A-Z</option>
              <option value="newest">Popularno</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
          </div>

          {/* View Mode Toggle */}
          <div className="hidden lg:flex bg-surface border border-white/10 rounded-xl overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2.5 transition-colors ${viewMode === 'grid' ? 'bg-primary/20 text-primary' : 'text-muted hover:text-text'}`}
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2.5 transition-colors ${viewMode === 'list' ? 'bg-primary/20 text-primary' : 'text-muted hover:text-text'}`}
            >
              <LayoutList className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mobile Filter Panel */}
        {showFilters && (
          <div className="lg:hidden mb-5 bg-surface rounded-2xl p-4 border border-white/5 space-y-4">
            {/* Sort on mobile */}
            <div>
              <label className="text-xs text-muted mb-2 block">Sortiraj</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="w-full bg-background border border-white/10 rounded-xl px-3 py-2.5 text-sm text-text focus:outline-none focus:border-primary"
              >
                <option value="default">Zadano</option>
                <option value="price-asc">Cijena: Niža → Viša</option>
                <option value="price-desc">Cijena: Viša → Niža</option>
                <option value="name">Naziv: A-Z</option>
                <option value="newest">Popularnost</option>
              </select>
            </div>

            {/* Price Range */}
            <div>
              <label className="text-xs text-muted mb-2 block">Cijena (KM)</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={priceRange[0] || ''}
                  onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                  placeholder="0"
                  className="w-full bg-background border border-white/10 rounded-xl px-3 py-2.5 text-sm text-text focus:outline-none focus:border-primary"
                />
                <span className="text-muted">-</span>
                <input
                  type="number"
                  value={priceRange[1] === 1000 ? '' : priceRange[1]}
                  onChange={(e) => setPriceRange([priceRange[0], e.target.value === '' ? 1000 : Number(e.target.value)])}
                  placeholder="1000"
                  className="w-full bg-background border border-white/10 rounded-xl px-3 py-2.5 text-sm text-text focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            {/* Quick Filters */}
            <div>
              <label className="text-xs text-muted mb-2 block">Brzi filteri</label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setQuickFilter(quickFilter === 'sale' ? null : 'sale')}
                  className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-xl border transition-all ${
                    quickFilter === 'sale'
                      ? 'bg-danger/20 border-danger/40 text-danger shadow-md shadow-danger/10'
                      : 'bg-surface border-white/10 text-muted hover:border-danger/30 hover:text-danger'
                  }`}
                >
                  🔥 Na akciji
                </button>
                <button
                  onClick={() => setQuickFilter(quickFilter === 'new' ? null : 'new')}
                  className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-xl border transition-all ${
                    quickFilter === 'new'
                      ? 'bg-accent/20 border-accent/40 text-accent shadow-md shadow-accent/10'
                      : 'bg-surface border-white/10 text-muted hover:border-accent/30 hover:text-accent'
                  }`}
                >
                  ✨ Novo
                </button>
                <button
                  onClick={() => setQuickFilter(quickFilter === 'popular' ? null : 'popular')}
                  className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-xl border transition-all ${
                    quickFilter === 'popular'
                      ? 'bg-primary/20 border-primary/40 text-primary shadow-md shadow-primary/10'
                      : 'bg-surface border-white/10 text-muted hover:border-primary/30 hover:text-primary'
                  }`}
                >
                  ⭐ Popularno
                </button>
              </div>
            </div>

            {hasActiveFilters && (
              <button 
                onClick={clearFilters}
                className="w-full py-2.5 text-sm text-danger hover:bg-danger/10 rounded-xl transition-colors"
              >
                Očisti filtere
              </button>
            )}
          </div>
        )}

        <div className="flex gap-6">
          {/* Desktop Sidebar Filters */}
          <aside className="hidden lg:block w-56 flex-shrink-0">
            <div className="bg-surface rounded-2xl p-4 border border-white/5 sticky top-24">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-text text-sm">Filteri</h3>
                {hasActiveFilters && (
                  <button onClick={clearFilters} className="text-xs text-primary hover:underline">
                    Očisti
                  </button>
                )}
              </div>

              {/* Price Range */}
              <div className="mb-5">
                <h4 className="text-xs font-medium text-muted mb-2">Cijena (KM)</h4>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={priceRange[0] || ''}
                    onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                    placeholder="0"
                    className="w-full bg-background border border-white/10 rounded-lg px-2.5 py-2 text-sm text-text focus:outline-none focus:border-primary"
                  />
                  <span className="text-muted text-xs">-</span>
                  <input
                    type="number"
                    value={priceRange[1] === 1000 ? '' : priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], e.target.value === '' ? 1000 : Number(e.target.value)])}
                    placeholder="1000"
                    className="w-full bg-background border border-white/10 rounded-lg px-2.5 py-2 text-sm text-text focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              {/* Quick Filters */}
              <div>
                <h4 className="text-xs font-medium text-muted mb-2">Brzi filteri</h4>
                <div className="space-y-1.5">
                  <button
                    onClick={() => setQuickFilter(quickFilter === 'sale' ? null : 'sale')}
                    className={`w-full text-left px-3 py-2.5 text-xs rounded-xl border transition-all flex items-center gap-2 ${
                      quickFilter === 'sale'
                        ? 'bg-danger/15 border-danger/40 text-danger shadow-sm shadow-danger/10'
                        : 'bg-background border-white/10 text-muted hover:border-danger/30 hover:text-danger hover:bg-danger/5'
                    }`}
                  >
                    🔥 Na akciji
                    {quickFilter === 'sale' && <span className="ml-auto text-[10px] bg-danger/20 px-1.5 py-0.5 rounded-full">✓</span>}
                  </button>
                  <button
                    onClick={() => setQuickFilter(quickFilter === 'new' ? null : 'new')}
                    className={`w-full text-left px-3 py-2.5 text-xs rounded-xl border transition-all flex items-center gap-2 ${
                      quickFilter === 'new'
                        ? 'bg-accent/15 border-accent/40 text-accent shadow-sm shadow-accent/10'
                        : 'bg-background border-white/10 text-muted hover:border-accent/30 hover:text-accent hover:bg-accent/5'
                    }`}
                  >
                    ✨ Novo
                    {quickFilter === 'new' && <span className="ml-auto text-[10px] bg-accent/20 px-1.5 py-0.5 rounded-full">✓</span>}
                  </button>
                  <button
                    onClick={() => setQuickFilter(quickFilter === 'popular' ? null : 'popular')}
                    className={`w-full text-left px-3 py-2.5 text-xs rounded-xl border transition-all flex items-center gap-2 ${
                      quickFilter === 'popular'
                        ? 'bg-primary/15 border-primary/40 text-primary shadow-sm shadow-primary/10'
                        : 'bg-background border-white/10 text-muted hover:border-primary/30 hover:text-primary hover:bg-primary/5'
                    }`}
                  >
                    ⭐ Popularno
                    {quickFilter === 'popular' && <span className="ml-auto text-[10px] bg-primary/20 px-1.5 py-0.5 rounded-full">✓</span>}
                  </button>
                </div>
              </div>
            </div>
          </aside>

          {/* Products Grid */}
          <div className="flex-1 min-w-0">
            {loading ? (
              <ProductGridSkeleton count={6} />
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-12 bg-surface rounded-2xl border border-white/5">
                <div className="text-4xl mb-3">🔍</div>
                <h3 className="text-base font-medium text-text mb-1">Nema rezultata</h3>
                <p className="text-sm text-muted mb-4">Pokušajte sa drugim filterima</p>
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 bg-primary text-white rounded-xl text-sm hover:bg-primary/90 transition-colors"
                >
                  Očisti filtere
                </button>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
                {filteredProducts.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredProducts.map(product => (
                  <ListProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// List View Product Card
function ListProductCard({ product }: { product: Product }) {
  const addToCart = useCartStore((state) => state.addToCart)
  const isImageUrl = (str: string) => str?.startsWith('http') || str?.startsWith('/') || str?.startsWith('data:')

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    addToCart({ id: product.id!, name: product.name, price: product.price, image: product.image })
  }

  return (
    <Link 
      href={`/product/${product.slug || product.id}`}
      className="group flex gap-3 bg-surface rounded-xl p-3 border border-white/5 hover:border-primary/20 transition-all"
    >
      <div className="w-24 h-24 bg-gradient-to-b from-gray-100 to-gray-50 dark:from-white/[0.08] dark:to-white/[0.03] rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden">
        {isImageUrl(product.image) ? (
          <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
        ) : (
          <span className="text-3xl">{product.image}</span>
        )}
      </div>
      <div className="flex-1 min-w-0 flex flex-col justify-between">
        <div>
          <div className="flex items-start gap-2">
            <h3 className="text-sm font-medium text-text line-clamp-2 group-hover:text-primary transition-colors">
              {product.name}
            </h3>
            {product.badge && (
              <span className={`text-[9px] px-1.5 py-0.5 rounded-full flex-shrink-0 ${
                product.badge === 'sale' ? 'bg-danger/20 text-danger' : 'bg-accent/20 text-accent'
              }`}>
                {product.badge === 'sale' ? 'Akcija' : 'Novo'}
              </span>
            )}
          </div>
          <p className="text-xs text-muted mt-0.5">{product.category}</p>
        </div>
        <div className="flex items-center justify-between mt-2">
          <div>
            <span className="text-base font-bold text-primary">{product.price.toFixed(2)} KM</span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-[10px] text-muted line-through ml-1.5">{product.originalPrice.toFixed(2)}</span>
            )}
          </div>
          <button 
            onClick={handleAddToCart}
            className="p-2 bg-primary/20 hover:bg-primary text-primary hover:text-white rounded-lg transition-all"
          >
            <ShoppingCart className="w-4 h-4" />
          </button>
        </div>
      </div>
    </Link>
  )
}