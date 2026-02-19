'use client'

import { useState, useEffect, useMemo } from 'react'
import { 
  Package, MessageSquare, FolderOpen, Plus, Pencil, Trash2, 
  X, Eye, ChevronLeft, ChevronDown, Menu, LogOut, Upload, Reply, Send, Moon, Sun, Lock, User, Star, ShoppingBag, Bell,
  BarChart3, TrendingUp, TrendingDown, DollarSign, Users, ShoppingCart, Layers, Mail
} from 'lucide-react'
import Link from 'next/link'
import { 
  Product, Category, ChatMessage, Subcategory, Order, ProductView, ProductVariant,
  subscribeToProducts, subscribeToCategories, subscribeToMessages, subscribeToSubcategories, subscribeToOrders, subscribeToProductViews,
  addProduct, updateProduct, deleteProduct,
  addCategory, updateCategory, deleteCategory,
  addSubcategory, updateSubcategory, deleteSubcategory,
  markMessageAsRead, deleteMessage, replyToMessage,
  updateOrder, markOrderAsSeen, deleteOrder,
  generateSlug
} from '@/lib/realtimeProducts'
import { categories as localCategories } from '@/lib/productData'

type Tab = 'orders' | 'analytics' | 'products' | 'categories' | 'messages'

// Helper to convert timestamp (number or Firestore Timestamp) to Date
const toDate = (timestamp: number | { toDate?: () => Date } | undefined): Date | null => {
  if (!timestamp) return null
  if (typeof timestamp === 'number') return new Date(timestamp)
  if (typeof timestamp === 'object' && timestamp.toDate) return timestamp.toDate()
  return null
}

// Admin credentials
const ADMIN_USERNAME = 'adiseg'
const ADMIN_PASSWORD = 'adis0910'

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loginUsername, setLoginUsername] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [rememberMe, setRememberMe] = useState(true)

  // Check for saved admin session on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('easygo_admin_session')
      if (saved) {
        const { username, password } = JSON.parse(saved)
        if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
          setIsAuthenticated(true)
        } else {
          localStorage.removeItem('easygo_admin_session')
        }
      }
    } catch {
      localStorage.removeItem('easygo_admin_session')
    }
  }, [])

  const [activeTab, setActiveTab] = useState<Tab>('orders')
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [subcategories, setSubcategories] = useState<Subcategory[]>([])
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [productViews, setProductViews] = useState<ProductView[]>([])
  const [loading, setLoading] = useState(true)
  const [showSidebar, setShowSidebar] = useState(false)
  const [showNewOrderAlert, setShowNewOrderAlert] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [editingSubcategory, setEditingSubcategory] = useState<Subcategory | null>(null)
  const [showProductModal, setShowProductModal] = useState(false)
  const [showCategoryModal, setShowCategoryModal] = useState(false)
  const [showSubcategoryModal, setShowSubcategoryModal] = useState(false)
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyText, setReplyText] = useState('')
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')

  // Handle login
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setLoginError('')
    
    if (loginUsername === ADMIN_USERNAME && loginPassword === ADMIN_PASSWORD) {
      setIsAuthenticated(true)
      if (rememberMe) {
        localStorage.setItem('easygo_admin_session', JSON.stringify({ username: loginUsername, password: loginPassword }))
      }
    } else {
      setLoginError('Pogrešno korisničko ime ili lozinka')
    }
  }

  // Handle logout
  const handleLogout = () => {
    setIsAuthenticated(false)
    setLoginUsername('')
    setLoginPassword('')
    localStorage.removeItem('easygo_admin_session')
  }

  // Sync with main app theme
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'dark' | 'light' | null
    if (savedTheme) {
      setTheme(savedTheme)
      document.documentElement.setAttribute('data-theme', savedTheme)
    }
    
    // Listen for theme changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'theme' && e.newValue) {
        setTheme(e.newValue as 'dark' | 'light')
        document.documentElement.setAttribute('data-theme', e.newValue)
      }
    }
    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(newTheme)
    localStorage.setItem('theme', newTheme)
    document.documentElement.setAttribute('data-theme', newTheme)
  }


  useEffect(() => {
    if (!isAuthenticated) return
    
    const unsubProducts = subscribeToProducts(setProducts)
    const unsubCategories = subscribeToCategories(setCategories)
    const unsubSubcategories = subscribeToSubcategories(setSubcategories)
    const unsubMessages = subscribeToMessages(setMessages)
    const unsubOrders = subscribeToOrders((newOrders) => {
      setOrders(prevOrders => {
        // Check if there's a new unseen order
        const newUnseenOrders = newOrders.filter(o => !o.seen)
        const prevUnseenCount = prevOrders.filter(o => !o.seen).length
        if (newUnseenOrders.length > prevUnseenCount && prevOrders.length > 0) {
          setShowNewOrderAlert(true)
        }
        return newOrders
      })
    })
    const unsubViews = subscribeToProductViews(setProductViews)
    setLoading(false)
    
    return () => {
      unsubProducts()
      unsubCategories()
      unsubSubcategories()
      unsubMessages()
      unsubOrders()
      unsubViews()
    }
  }, [isAuthenticated])

  const unreadCount = messages.filter(m => !m.read).length
  const newOrdersCount = orders.filter(o => !o.seen).length

  // Analytics calculations
  const analytics = useMemo(() => {
    const now = new Date()
    const startOfWeek = new Date(now)
    startOfWeek.setDate(now.getDate() - now.getDay())
    startOfWeek.setHours(0, 0, 0, 0)
    
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const startOfYear = new Date(now.getFullYear(), 0, 1)
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)

    // Filter orders by time period
    const ordersThisWeek = orders.filter(o => {
      const orderDate = toDate(o.createdAt)
      return orderDate && orderDate >= startOfWeek
    })
    
    const ordersThisMonth = orders.filter(o => {
      const orderDate = toDate(o.createdAt)
      return orderDate && orderDate >= startOfMonth
    })
    
    const ordersLastMonth = orders.filter(o => {
      const orderDate = toDate(o.createdAt)
      return orderDate && orderDate >= startOfLastMonth && orderDate <= endOfLastMonth
    })
    
    const ordersThisYear = orders.filter(o => {
      const orderDate = toDate(o.createdAt)
      return orderDate && orderDate >= startOfYear
    })

    // Revenue calculations
    const revenueThisWeek = ordersThisWeek.reduce((sum, o) => sum + o.totalPrice, 0)
    const revenueThisMonth = ordersThisMonth.reduce((sum, o) => sum + o.totalPrice, 0)
    const revenueLastMonth = ordersLastMonth.reduce((sum, o) => sum + o.totalPrice, 0)
    const revenueThisYear = ordersThisYear.reduce((sum, o) => sum + o.totalPrice, 0)
    const totalRevenue = orders.reduce((sum, o) => sum + o.totalPrice, 0)

    // Monthly growth
    const monthlyGrowth = revenueLastMonth > 0 
      ? ((revenueThisMonth - revenueLastMonth) / revenueLastMonth * 100).toFixed(1)
      : revenueThisMonth > 0 ? '100' : '0'

    // Product sales analysis
    const productSales: Record<string, { name: string, quantity: number, revenue: number, image: string }> = {}
    orders.forEach(order => {
      order.items.forEach(item => {
        if (!productSales[item.productId]) {
          productSales[item.productId] = { name: item.productName, quantity: 0, revenue: 0, image: item.productImage }
        }
        productSales[item.productId].quantity += item.quantity
        productSales[item.productId].revenue += item.price * item.quantity
      })
    })

    const sortedProducts = Object.entries(productSales)
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => b.quantity - a.quantity)

    const topProducts = sortedProducts.slice(0, 5)
    const worstProducts = sortedProducts.slice(-5).reverse()

    // Orders by status
    const ordersByStatus = {
      new: orders.filter(o => o.status === 'new').length,
      processing: orders.filter(o => o.status === 'processing').length,
      shipped: orders.filter(o => o.status === 'shipped').length,
      delivered: orders.filter(o => o.status === 'delivered').length,
      cancelled: orders.filter(o => o.status === 'cancelled').length,
    }

    // Average order value
    const avgOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0

    // Daily orders for the last 7 days
    const dailyOrders: { date: string, orders: number, revenue: number }[] = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now)
      date.setDate(date.getDate() - i)
      date.setHours(0, 0, 0, 0)
      const nextDate = new Date(date)
      nextDate.setDate(nextDate.getDate() + 1)
      
      const dayOrders = orders.filter(o => {
        const orderDate = toDate(o.createdAt)
        return orderDate && orderDate >= date && orderDate < nextDate
      })
      
      dailyOrders.push({
        date: date.toLocaleDateString('bs-BA', { weekday: 'short', day: 'numeric' }),
        orders: dayOrders.length,
        revenue: dayOrders.reduce((sum, o) => sum + o.totalPrice, 0)
      })
    }

    // Monthly orders for the last 6 months
    const monthlyOrders: { month: string, orders: number, revenue: number }[] = []
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0)
      
      const monthOrders = orders.filter(o => {
        const orderDate = toDate(o.createdAt)
        return orderDate && orderDate >= monthStart && orderDate <= monthEnd
      })
      
      monthlyOrders.push({
        month: monthStart.toLocaleDateString('bs-BA', { month: 'short' }),
        orders: monthOrders.length,
        revenue: monthOrders.reduce((sum, o) => sum + o.totalPrice, 0)
      })
    }

    return {
      ordersThisWeek: ordersThisWeek.length,
      ordersThisMonth: ordersThisMonth.length,
      ordersThisYear: ordersThisYear.length,
      totalOrders: orders.length,
      revenueThisWeek,
      revenueThisMonth,
      revenueThisYear,
      totalRevenue,
      monthlyGrowth: parseFloat(monthlyGrowth as string),
      topProducts,
      worstProducts,
      ordersByStatus,
      avgOrderValue,
      dailyOrders,
      monthlyOrders,
      uniqueCustomers: new Set(orders.map(o => o.customerEmail)).size,
    }
  }, [orders])

  const handleDeleteProduct = async (id: string) => {
    if (confirm('Jeste li sigurni da želite obrisati ovaj proizvod?')) {
      await deleteProduct(id)
    }
  }

  const handleDeleteCategory = async (id: string) => {
    if (confirm('Jeste li sigurni da želite obrisati ovu kategoriju?')) {
      await deleteCategory(id)
    }
  }

  const handleDeleteSubcategory = async (id: string) => {
    if (confirm('Jeste li sigurni da želite obrisati ovu podkategoriju?')) {
      await deleteSubcategory(id)
    }
  }

  const handleDeleteMessage = async (id: string) => {
    if (confirm('Jeste li sigurni da želite obrisati ovu poruku?')) {
      await deleteMessage(id)
    }
  }

  const handleReplyMessage = async (id: string) => {
    if (!replyText.trim()) return
    await replyToMessage(id, replyText)
    setReplyingTo(null)
    setReplyText('')
  }

  const tabs = [
    { id: 'orders' as Tab, label: 'Narudžbe', icon: ShoppingBag, count: newOrdersCount },
    { id: 'products' as Tab, label: 'Proizvodi', icon: Package, count: products.length },
    { id: 'categories' as Tab, label: 'Kategorije', icon: FolderOpen, count: categories.length },
    { id: 'messages' as Tab, label: 'Poruke', icon: MessageSquare, count: unreadCount },
    { id: 'analytics' as Tab, label: 'Statistika', icon: BarChart3, count: 0 },
  ]

  // Show login form if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 bg-background flex items-center justify-center p-4 z-[100] overflow-hidden">
        <div className="w-full max-w-sm">
          <div className="bg-surface rounded-2xl p-6 border border-white/5 shadow-xl">
            {/* Logo/Header */}
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/80 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/25">
                <Lock className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-xl font-bold text-text">Admin Panel</h1>
              <p className="text-sm text-muted mt-1">Prijavite se za pristup</p>
            </div>

            {/* Login Form */}
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="text-xs text-muted mb-1.5 block">Korisničko ime</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                  <input
                    type="text"
                    value={loginUsername}
                    onChange={(e) => setLoginUsername(e.target.value)}
                    placeholder="Unesite korisničko ime"
                    className="w-full bg-background border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-text placeholder:text-muted focus:outline-none focus:border-primary transition-colors"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-muted mb-1.5 block">Lozinka</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                  <input
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Unesite lozinku"
                    className="w-full bg-background border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-text placeholder:text-muted focus:outline-none focus:border-primary transition-colors"
                    required
                  />
                </div>
              </div>

              {loginError && (
                <div className="bg-danger/10 text-danger text-sm px-4 py-2.5 rounded-xl">
                  {loginError}
                </div>
              )}

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="rememberMe"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-white/20 bg-background text-primary focus:ring-primary/50 cursor-pointer accent-[var(--primary)]"
                />
                <label htmlFor="rememberMe" className="text-sm text-muted cursor-pointer select-none">
                  Zapamti me na ovom uređaju
                </label>
              </div>

              <button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-white py-3 rounded-xl font-medium transition-colors shadow-lg shadow-primary/25"
              >
                Prijava
              </button>
            </form>

            {/* Back to store link */}
            <div className="mt-6 text-center">
              <Link href="/" className="text-sm text-muted hover:text-primary transition-colors">
                ← Nazad na prodavnicu
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background fixed inset-0 z-[100] overflow-y-auto overflow-x-hidden" data-theme={theme}>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-background border-b border-white/5">
        <div className="px-4 py-3 flex items-center justify-between">
          <button onClick={() => setShowSidebar(true)} className="p-2 -ml-2 hover:bg-white/5 rounded-xl">
            <Menu className="w-5 h-5 text-text" />
          </button>
          <h1 className="font-semibold text-text text-sm">Admin Panel</h1>
          <div className="flex items-center gap-1">
            <button onClick={toggleTheme} className="p-2 hover:bg-white/5 rounded-xl">
              {theme === 'dark' ? <Sun className="w-4 h-4 text-muted" /> : <Moon className="w-4 h-4 text-muted" />}
            </button>
            <button onClick={handleLogout} className="p-2 hover:bg-white/5 rounded-xl">
              <LogOut className="w-4 h-4 text-muted" />
            </button>
          </div>
        </div>
        
        {/* Mobile Tab Bar */}
        <div className="px-3 pb-2 flex gap-1.5 overflow-x-auto scrollbar-hide">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                activeTab === tab.id 
                  ? 'bg-primary text-white' 
                  : 'bg-white/5 text-muted'
              }`}
            >
              <tab.icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              {tab.count > 0 && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                  activeTab === tab.id ? 'bg-white/20' : 'bg-primary/20 text-primary'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="flex min-h-screen w-full overflow-x-hidden">
        {/* Sidebar Overlay */}
        {showSidebar && (
          <div className="lg:hidden fixed inset-0 bg-black/50 z-40" onClick={() => setShowSidebar(false)} />
        )}

        {/* Sidebar */}
        <aside className={`fixed lg:fixed top-0 left-0 h-screen w-72 bg-surface border-r border-white/5 z-50 transform transition-transform lg:transform-none ${showSidebar ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
          <div className="p-5 lg:p-6 border-b border-white/5">
            <div className="flex items-center justify-between">
              <Link href="/" className="flex items-center gap-3">
                <div className="h-9 w-auto">
                  <img src="/assets/images/logo.png" alt="Logo" className="h-full w-auto object-contain" />
                </div>
                <div>
                  <span className="font-semibold text-text text-sm block">Admin Panel</span>
                  <span className="text-[10px] text-muted">Upravljanje shopom</span>
                </div>
              </Link>
              <button onClick={() => setShowSidebar(false)} className="lg:hidden p-1.5 hover:bg-white/5 rounded-lg">
                <X className="w-5 h-5 text-muted" />
              </button>
            </div>
          </div>

          <nav className="p-4 space-y-1.5">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setShowSidebar(false) }}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${
                  activeTab === tab.id 
                    ? 'bg-primary text-white shadow-lg shadow-primary/25' 
                    : 'text-muted hover:bg-white/5 hover:text-text'
                }`}
              >
                <div className="flex items-center gap-3">
                  <tab.icon className="w-5 h-5" />
                  <span className="font-medium text-sm">{tab.label}</span>
                </div>
                {tab.count > 0 && (
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    activeTab === tab.id ? 'bg-white/20' : 'bg-primary/20 text-primary'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </nav>

          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/5 space-y-1.5">
            <button 
              onClick={toggleTheme}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-muted hover:text-text rounded-xl hover:bg-white/5 transition-colors text-sm"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              <span>{theme === 'dark' ? 'Svijetli mod' : 'Tamni mod'}</span>
            </button>
            <Link href="/" className="flex items-center gap-3 px-4 py-2.5 text-muted hover:text-text rounded-xl hover:bg-white/5 transition-colors text-sm">
              <ChevronLeft className="w-4 h-4" />
              <span>Nazad na shop</span>
            </Link>
            <button 
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-danger hover:bg-danger/10 rounded-xl transition-colors text-sm"
            >
              <LogOut className="w-4 h-4" />
              <span>Odjava</span>
            </button>
          </div>
        </aside>


        {/* Main Content */}
        <main className="flex-1 p-3 lg:p-8 pt-28 lg:pt-8 lg:ml-72 pb-6 overflow-x-hidden">
          <div className="max-w-6xl mx-auto w-full overflow-hidden">
            
            {/* Quick Stats - Mobile & Desktop */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 lg:gap-4 mb-4 lg:mb-8">
              <div className={`bg-surface rounded-xl p-3 lg:p-5 border ${newOrdersCount > 0 ? 'border-danger/50' : 'border-white/5'}`}>
                <div className="flex items-center gap-2 mb-1 lg:mb-2">
                  <ShoppingBag className={`w-4 h-4 lg:w-5 lg:h-5 ${newOrdersCount > 0 ? 'text-danger' : 'text-secondary'}`} />
                  {newOrdersCount > 0 && (
                    <span className="text-[9px] lg:text-xs text-danger bg-danger/10 px-1.5 py-0.5 rounded-full animate-pulse">{newOrdersCount}</span>
                  )}
                </div>
                <p className="text-lg lg:text-2xl font-bold text-text">{orders.length}</p>
                <p className="text-[10px] lg:text-xs text-muted">Narudžbe</p>
              </div>
              
              <div className="bg-surface rounded-xl p-3 lg:p-5 border border-white/5">
                <div className="flex items-center gap-2 mb-1 lg:mb-2">
                  <DollarSign className="w-4 h-4 lg:w-5 lg:h-5 text-primary" />
                </div>
                <p className="text-lg lg:text-2xl font-bold text-text">{analytics.totalRevenue.toFixed(0)}</p>
                <p className="text-[10px] lg:text-xs text-muted">Prihod (KM)</p>
              </div>
              
              <div className="bg-surface rounded-xl p-3 lg:p-5 border border-white/5">
                <div className="flex items-center gap-2 mb-1 lg:mb-2">
                  <Package className="w-4 h-4 lg:w-5 lg:h-5 text-accent" />
                </div>
                <p className="text-lg lg:text-2xl font-bold text-text">{products.length}</p>
                <p className="text-[10px] lg:text-xs text-muted">Proizvodi</p>
              </div>
              
              <div className="bg-surface rounded-xl p-3 lg:p-5 border border-white/5">
                <div className="flex items-center gap-2 mb-1 lg:mb-2">
                  <MessageSquare className="w-4 h-4 lg:w-5 lg:h-5 text-danger" />
                  {unreadCount > 0 && (
                    <span className="text-[9px] lg:text-xs text-danger bg-danger/10 px-1.5 py-0.5 rounded-full">{unreadCount}</span>
                  )}
                </div>
                <p className="text-lg lg:text-2xl font-bold text-text">{messages.length}</p>
                <p className="text-[10px] lg:text-xs text-muted">Poruke</p>
              </div>
            </div>

            {/* Products Tab */}
            {activeTab === 'products' && (
              <div>
                <div className="flex items-center justify-between mb-4 lg:mb-6">
                  <div>
                    <h2 className="text-lg lg:text-xl font-semibold text-text">Proizvodi</h2>
                    <p className="text-xs text-muted mt-0.5 hidden lg:block">Upravljajte proizvodima</p>
                  </div>
                  <button
                    onClick={() => { setEditingProduct(null); setShowProductModal(true) }}
                    className="flex items-center gap-1.5 bg-primary hover:bg-primary/90 text-white px-3 lg:px-5 py-2 lg:py-2.5 rounded-xl transition-colors shadow-lg shadow-primary/25 text-sm"
                  >
                    <Plus className="w-4 h-4" />
                    <span className="hidden sm:inline">Dodaj</span>
                  </button>
                </div>

                {loading ? (
                  <div className="text-center py-12 text-muted text-sm">Učitavanje...</div>
                ) : products.length === 0 ? (
                  <div className="text-center py-12 bg-surface rounded-2xl border border-white/5">
                    <Package className="w-12 h-12 text-muted mx-auto mb-3" />
                    <p className="text-sm text-muted mb-4">Nema proizvoda</p>
                    <button
                      onClick={() => { setEditingProduct(null); setShowProductModal(true) }}
                      className="bg-primary hover:bg-primary/90 text-white px-5 py-2 rounded-xl transition-colors text-sm"
                    >
                      Dodaj prvi proizvod
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2 lg:space-y-0 lg:bg-surface lg:rounded-2xl lg:overflow-hidden lg:border lg:border-white/5">
                    {/* Mobile Cards */}
                    <div className="lg:hidden space-y-2">
                      {products.map(product => {
                        const isImg = product.image?.startsWith('http') || product.image?.startsWith('data:') || product.image?.startsWith('/')
                        return (
                          <div key={product.id} className="bg-surface rounded-xl p-3 border border-white/5">
                            <div className="flex gap-3">
                              <div className="w-16 h-16 bg-white/5 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0">
                                {isImg ? (
                                  <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                                ) : (
                                  <span className="text-2xl">{product.image}</span>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2">
                                  <div className="min-w-0 flex-1">
                                    <p className="text-sm text-text font-medium line-clamp-1">{product.name}</p>
                                    <p className="text-[11px] text-muted mt-0.5">{product.category}</p>
                                  </div>
                                  <div className="flex items-center gap-0.5 flex-shrink-0">
                                    <button
                                      onClick={() => { setEditingProduct(product); setShowProductModal(true) }}
                                      className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                                    >
                                      <Pencil className="w-3.5 h-3.5 text-muted" />
                                    </button>
                                    <button
                                      onClick={() => product.id && handleDeleteProduct(product.id)}
                                      className="p-1.5 hover:bg-danger/10 rounded-lg transition-colors"
                                    >
                                      <Trash2 className="w-3.5 h-3.5 text-danger" />
                                    </button>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 mt-1.5">
                                  <span className="text-sm text-primary font-bold">{product.price.toFixed(2)} KM</span>
                                  {product.originalPrice && product.originalPrice > product.price && (
                                    <span className="text-[10px] text-muted line-through">{product.originalPrice.toFixed(2)}</span>
                                  )}
                                  {product.badge && (
                                    <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium ${
                                      product.badge === 'sale' ? 'bg-danger/20 text-danger' : 'bg-accent/20 text-accent'
                                    }`}>
                                      {product.badge === 'sale' ? 'Akcija' : 'Novo'}
                                    </span>
                                  )}
                                  {product.isFlashDeal && (
                                    <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-orange-500/20 text-orange-400 font-medium">🔥</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>

                    {/* Desktop Table */}
                    <div className="hidden lg:block overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-white/5">
                            <th className="text-left p-4 text-xs font-medium text-muted">Proizvod</th>
                            <th className="text-left p-4 text-xs font-medium text-muted">Kategorija</th>
                            <th className="text-left p-4 text-xs font-medium text-muted">Cijena</th>
                            <th className="text-left p-4 text-xs font-medium text-muted">Status</th>
                            <th className="text-right p-4 text-xs font-medium text-muted">Akcije</th>
                          </tr>
                        </thead>
                        <tbody>
                          {products.map(product => {
                            const isImg = product.image?.startsWith('http') || product.image?.startsWith('data:') || product.image?.startsWith('/')
                            return (
                            <tr key={product.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]">
                              <td className="p-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                                    {isImg ? (
                                      <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                                    ) : (
                                      <span className="text-lg">{product.image}</span>
                                    )}
                                  </div>
                                  <p className="text-sm text-text font-medium truncate max-w-[200px]">{product.name}</p>
                                </div>
                              </td>
                              <td className="p-4 text-sm text-muted">{product.category}</td>
                              <td className="p-4">
                                <span className="text-sm text-primary font-semibold">{product.price.toFixed(2)} KM</span>
                              </td>
                              <td className="p-4">
                                {product.badge && (
                                  <span className={`text-xs px-2 py-1 rounded-md ${
                                    product.badge === 'sale' ? 'bg-danger/20 text-danger' : 'bg-accent/20 text-accent'
                                  }`}>
                                    {product.badge === 'sale' ? 'Akcija' : 'Novo'}
                                  </span>
                                )}
                              </td>
                              <td className="p-4">
                                <div className="flex items-center justify-end gap-1">
                                  <button
                                    onClick={() => { setEditingProduct(product); setShowProductModal(true) }}
                                    className="p-2 hover:bg-white/5 rounded-lg"
                                  >
                                    <Pencil className="w-4 h-4 text-muted" />
                                  </button>
                                  <button
                                    onClick={() => product.id && handleDeleteProduct(product.id)}
                                    className="p-2 hover:bg-danger/10 rounded-lg"
                                  >
                                    <Trash2 className="w-4 h-4 text-danger" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          )})}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}


            {/* Categories Tab */}
            {activeTab === 'categories' && (
              <div>
                <div className="flex items-center justify-between mb-4 lg:mb-6">
                  <div>
                    <h2 className="text-lg lg:text-xl font-semibold text-text">Kategorije</h2>
                    <p className="text-xs text-muted mt-0.5 hidden lg:block">Organizirajte proizvode</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => { setEditingSubcategory(null); setShowSubcategoryModal(true) }}
                      className="flex items-center gap-1.5 bg-accent hover:bg-accent/90 text-white px-3 lg:px-4 py-2 lg:py-2.5 rounded-xl transition-colors shadow-lg shadow-accent/25 text-sm"
                    >
                      <Plus className="w-4 h-4" />
                      <span className="hidden sm:inline">Podkategorija</span>
                    </button>
                    <button
                      onClick={() => { setEditingCategory(null); setShowCategoryModal(true) }}
                      className="flex items-center gap-1.5 bg-primary hover:bg-primary/90 text-white px-3 lg:px-5 py-2 lg:py-2.5 rounded-xl transition-colors shadow-lg shadow-primary/25 text-sm"
                    >
                      <Plus className="w-4 h-4" />
                      <span className="hidden sm:inline">Kategorija</span>
                    </button>
                  </div>
                </div>

                {categories.length === 0 ? (
                  <div className="text-center py-12 bg-surface rounded-2xl border border-white/5">
                    <FolderOpen className="w-10 h-10 text-muted mx-auto mb-3" />
                    <p className="text-sm text-muted">Nema kategorija</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {categories.map(category => {
                      const categorySubcategories = subcategories.filter(s => s.categoryId === category.id)
                      return (
                        <div key={category.id} className="bg-surface rounded-xl border border-white/5 overflow-hidden">
                          {/* Category Header */}
                          <div className="p-4 flex items-center justify-between border-b border-white/5">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                                <span className="text-lg">{category.icon}</span>
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <p className="font-medium text-text text-sm">{category.name}</p>
                                  {category.showOnHome !== false && (
                                    <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-primary/20 text-primary font-medium">Početna</span>
                                  )}
                                </div>
                                <p className="text-[10px] text-muted">{category.slug} • {categorySubcategories.length} podkategorija</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-0.5">
                              <button
                                onClick={() => { setEditingCategory(category); setShowCategoryModal(true) }}
                                className="p-2 hover:bg-white/5 rounded-lg"
                              >
                                <Pencil className="w-3.5 h-3.5 text-muted" />
                              </button>
                              <button
                                onClick={() => category.id && handleDeleteCategory(category.id)}
                                className="p-2 hover:bg-danger/10 rounded-lg"
                              >
                                <Trash2 className="w-3.5 h-3.5 text-danger" />
                              </button>
                            </div>
                          </div>
                          
                          {/* Subcategories */}
                          {categorySubcategories.length > 0 && (
                            <div className="p-3 bg-background/50">
                              <div className="flex flex-wrap gap-2">
                                {categorySubcategories.map(sub => (
                                  <div key={sub.id} className="flex items-center gap-2 bg-surface px-3 py-1.5 rounded-lg border border-white/5">
                                    <span className="text-xs text-text">{sub.name}</span>
                                    <div className="flex items-center gap-0.5">
                                      <button
                                        onClick={() => { setEditingSubcategory(sub); setShowSubcategoryModal(true) }}
                                        className="p-1 hover:bg-white/10 rounded"
                                      >
                                        <Pencil className="w-3 h-3 text-muted" />
                                      </button>
                                      <button
                                        onClick={() => sub.id && handleDeleteSubcategory(sub.id)}
                                        className="p-1 hover:bg-danger/10 rounded"
                                      >
                                        <Trash2 className="w-3 h-3 text-danger" />
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )}


            {/* Messages Tab */}
            {activeTab === 'messages' && (
              <div>
                <div className="flex items-center justify-between mb-4 lg:mb-6">
                  <div>
                    <h2 className="text-lg lg:text-xl font-semibold text-text">Poruke</h2>
                    <p className="text-xs text-muted mt-0.5 hidden lg:block">Upiti kupaca</p>
                  </div>
                  {unreadCount > 0 && (
                    <span className="text-xs text-danger bg-danger/10 px-2.5 py-1 rounded-full">{unreadCount} novo</span>
                  )}
                </div>

                {messages.length === 0 ? (
                  <div className="text-center py-12 bg-surface rounded-2xl border border-white/5">
                    <MessageSquare className="w-10 h-10 text-muted mx-auto mb-3" />
                    <p className="text-sm text-muted">Nema poruka</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {messages.map(message => (
                      <div 
                        key={message.id} 
                        className={`bg-surface rounded-xl p-4 border border-white/5 ${!message.read ? 'border-l-2 border-l-primary' : ''}`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-9 h-9 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-medium text-primary">{message.name.charAt(0).toUpperCase()}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-medium text-text text-sm">{message.name}</span>
                              {!message.read && (
                                <span className="text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded-full">Novo</span>
                              )}
                            </div>
                            <span className="text-[10px] text-muted block">{message.email}</span>
                            <p className="text-sm text-text/80 mt-2 leading-relaxed">{message.message}</p>
                            <p className="text-[10px] text-muted mt-2">
                              {toDate(message.createdAt)?.toLocaleString('bs-BA') || 'Nepoznato'}
                            </p>
                            
                            {message.adminReply && (
                              <div className="mt-3 p-2.5 bg-accent/10 rounded-lg border border-accent/20">
                                <div className="flex items-center gap-1.5 mb-1">
                                  <Reply className="w-3 h-3 text-accent" />
                                  <span className="text-[10px] font-medium text-accent">Vaš odgovor</span>
                                </div>
                                <p className="text-xs text-text/80">{message.adminReply}</p>
                              </div>
                            )}

                            {replyingTo === message.id && (
                              <div className="mt-3 space-y-2">
                                <textarea
                                  value={replyText}
                                  onChange={(e) => setReplyText(e.target.value)}
                                  placeholder="Napišite odgovor..."
                                  className="w-full bg-background border border-white/10 rounded-lg px-3 py-2 text-sm text-text placeholder:text-muted resize-none h-20 focus:outline-none focus:border-primary"
                                />
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => { setReplyingTo(null); setReplyText('') }}
                                    className="px-3 py-1.5 text-xs text-muted hover:text-text hover:bg-white/5 rounded-lg"
                                  >
                                    Odustani
                                  </button>
                                  <button
                                    onClick={() => message.id && handleReplyMessage(message.id)}
                                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-primary text-white rounded-lg hover:bg-primary/90"
                                  >
                                    <Send className="w-3 h-3" />
                                    Pošalji
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-white/5 flex-wrap">
                          <a
                            href={`mailto:${message.email}?subject=Re: Vaša poruka&body=Poštovani ${message.name},%0D%0A%0D%0A`}
                            className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-primary hover:bg-primary/10 rounded-lg"
                          >
                            <Mail className="w-3 h-3" />
                            Email
                          </a>
                          {!message.adminReply && replyingTo !== message.id && (
                            <button
                              onClick={() => { setReplyingTo(message.id!); setReplyText('') }}
                              className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-accent hover:bg-accent/10 rounded-lg"
                            >
                              <Reply className="w-3 h-3" />
                              Odgovori
                            </button>
                          )}
                          {!message.read && (
                            <button
                              onClick={() => message.id && markMessageAsRead(message.id)}
                              className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-muted hover:text-text hover:bg-white/5 rounded-lg"
                            >
                              <Eye className="w-3 h-3" />
                              Pročitano
                            </button>
                          )}
                          <button
                            onClick={() => message.id && handleDeleteMessage(message.id)}
                            className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-danger hover:bg-danger/10 rounded-lg ml-auto"
                          >
                            <Trash2 className="w-3 h-3" />
                            Obriši
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Orders Tab */}
            {activeTab === 'orders' && (
              <div>
                {/* Header with filter */}
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-lg lg:text-xl font-semibold text-text">Narudžbe</h2>
                    <p className="text-[11px] text-muted mt-0.5">{orders.length} ukupno</p>
                  </div>
                  {newOrdersCount > 0 && (
                    <div className="flex items-center gap-2 bg-danger/10 px-3 py-1.5 rounded-full animate-pulse">
                      <div className="w-2 h-2 bg-danger rounded-full animate-ping" />
                      <span className="text-xs text-danger font-medium">{newOrdersCount} novih</span>
                    </div>
                  )}
                </div>

                {orders.length === 0 ? (
                  <div className="text-center py-16 bg-gradient-to-br from-surface to-background rounded-3xl border border-white/5">
                    <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-4">
                      <ShoppingBag className="w-10 h-10 text-primary/50" />
                    </div>
                    <p className="text-sm text-muted mb-1">Nema narudžbi</p>
                    <p className="text-xs text-muted/60">Narudžbe će se pojaviti ovdje</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {orders.map(order => {
                      const isNew = !order.seen
                      const statusConfig: Record<string, { bg: string, text: string, icon: string }> = {
                        'new': { bg: 'bg-gradient-to-r from-danger/20 to-danger/10', text: 'text-danger', icon: '🆕' },
                        'processing': { bg: 'bg-gradient-to-r from-yellow-500/20 to-yellow-500/10', text: 'text-yellow-500', icon: '⏳' },
                        'shipped': { bg: 'bg-gradient-to-r from-blue-500/20 to-blue-500/10', text: 'text-blue-500', icon: '🚚' },
                        'delivered': { bg: 'bg-gradient-to-r from-accent/20 to-accent/10', text: 'text-accent', icon: '✅' },
                        'cancelled': { bg: 'bg-gradient-to-r from-muted/20 to-muted/10', text: 'text-muted', icon: '❌' }
                      }
                      const statusLabels: Record<string, string> = {
                        'new': 'Nova',
                        'processing': 'U obradi',
                        'shipped': 'Poslano',
                        'delivered': 'Dostavljeno',
                        'cancelled': 'Otkazano'
                      }
                      const config = statusConfig[order.status]
                      
                      return (
                        <div 
                          key={order.id} 
                          className={`bg-surface rounded-2xl overflow-hidden border transition-all ${
                            isNew ? 'border-danger/30 ring-2 ring-danger/20' : 'border-white/5'
                          }`}
                        >
                          {/* Status Bar */}
                          <div className={`${config.bg} px-4 py-2 flex items-center justify-between`}>
                            <div className="flex items-center gap-2">
                              <span className="text-sm">{config.icon}</span>
                              <span className={`text-xs font-medium ${config.text}`}>{statusLabels[order.status]}</span>
                            </div>
                            <span className="text-[10px] text-muted">
                              {toDate(order.createdAt)?.toLocaleDateString('bs-BA', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>

                          <div className="p-4">
                            {/* Customer Info - Compact */}
                            <div className="flex items-center gap-3 mb-4">
                              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                                isNew ? 'bg-gradient-to-br from-danger to-danger/60' : 'bg-gradient-to-br from-primary to-primary/60'
                              }`}>
                                <span className="text-white font-bold text-lg">
                                  {order.customerName.charAt(0)}{order.customerSurname.charAt(0)}
                                </span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <h3 className="font-semibold text-text text-sm truncate">
                                    {order.customerName} {order.customerSurname}
                                  </h3>
                                  {isNew && (
                                    <span className="flex-shrink-0 text-[9px] bg-danger text-white px-2 py-0.5 rounded-full font-bold animate-pulse">
                                      NOVA
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-muted truncate">{order.customerCity}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-lg font-bold text-primary">{order.totalPrice.toFixed(0)}</p>
                                <p className="text-[10px] text-muted">KM</p>
                              </div>
                            </div>

                            {/* Products Preview - Horizontal Scroll */}
                            <div className="flex gap-2 overflow-x-auto pb-2 mb-3 scrollbar-hide -mx-1 px-1">
                              {order.items.map((item, idx) => (
                                <div key={idx} className="flex-shrink-0 w-20">
                                  <div className="w-20 h-20 bg-background rounded-xl overflow-hidden mb-1.5 border border-white/5">
                                    {item.productImage?.startsWith('data:') || item.productImage?.startsWith('http') ? (
                                      <img src={item.productImage} alt={item.productName} className="w-full h-full object-cover" />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center">
                                        <Package className="w-6 h-6 text-muted" />
                                      </div>
                                    )}
                                  </div>
                                  <p className="text-[10px] text-muted truncate">{item.productName}</p>
                                  <p className="text-[10px] text-text font-medium">{item.quantity}x {item.price.toFixed(0)} KM</p>
                                </div>
                              ))}
                            </div>

                            {/* Contact Info - Pills */}
                            <div className="flex flex-wrap gap-2 mb-4">
                              <a href={`tel:${order.customerPhone}`} className="flex items-center gap-1.5 bg-background px-3 py-1.5 rounded-full text-xs text-text hover:bg-primary/10 hover:text-primary transition-colors">
                                <span>📞</span>
                                <span>{order.customerPhone}</span>
                              </a>
                              <a href={`mailto:${order.customerEmail}`} className="flex items-center gap-1.5 bg-background px-3 py-1.5 rounded-full text-xs text-muted hover:bg-primary/10 hover:text-primary transition-colors truncate max-w-[180px]">
                                <span>✉️</span>
                                <span className="truncate">{order.customerEmail}</span>
                              </a>
                            </div>

                            {/* Address */}
                            <div className="bg-background rounded-xl p-3 mb-4">
                              <div className="flex items-start gap-2">
                                <span className="text-sm">📍</span>
                                <div>
                                  <p className="text-xs text-text">{order.customerAddress}</p>
                                  <p className="text-xs text-muted">{order.customerCity}</p>
                                </div>
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2">
                              {/* Status Selector */}
                              <div className="flex-1 relative">
                                <select
                                  value={order.status}
                                  onChange={(e) => order.id && updateOrder(order.id, { status: e.target.value as Order['status'] })}
                                  className="w-full bg-background border border-white/10 rounded-xl px-3 py-2.5 text-xs text-text appearance-none cursor-pointer focus:outline-none focus:border-primary pr-8"
                                >
                                  <option value="new">🆕 Nova</option>
                                  <option value="processing">⏳ U obradi</option>
                                  <option value="shipped">🚚 Poslano</option>
                                  <option value="delivered">✅ Dostavljeno</option>
                                  <option value="cancelled">❌ Otkazano</option>
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
                              </div>

                              {/* Mark as Seen */}
                              {isNew && (
                                <button
                                  onClick={() => order.id && markOrderAsSeen(order.id)}
                                  className="p-2.5 bg-accent/10 hover:bg-accent/20 text-accent rounded-xl transition-colors"
                                  title="Označi kao viđeno"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                              )}

                              {/* Delete */}
                              <button
                                onClick={() => {
                                  if (confirm('Jeste li sigurni da želite obrisati ovu narudžbu?')) {
                                    order.id && deleteOrder(order.id)
                                  }
                                }}
                                className="p-2.5 bg-danger/10 hover:bg-danger/20 text-danger rounded-xl transition-colors"
                                title="Obriši"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>

                            {/* Tracking Note */}
                            <div className="mt-3">
                              <label className="block text-[10px] text-muted uppercase tracking-wider mb-1">Napomena o dostavi (vidljivo kupcu)</label>
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  defaultValue={order.trackingNote || ''}
                                  placeholder="Npr. Paket je poslan BEX-om, očekivana dostava 2-3 dana..."
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter' && order.id) {
                                      updateOrder(order.id, { trackingNote: (e.target as HTMLInputElement).value })
                                    }
                                  }}
                                  className="flex-1 bg-background border border-white/10 rounded-xl px-3 py-2 text-xs text-text placeholder:text-muted/50 focus:outline-none focus:border-primary"
                                />
                                <button
                                  onClick={(e) => {
                                    const input = (e.currentTarget.previousElementSibling as HTMLInputElement)
                                    if (order.id) updateOrder(order.id, { trackingNote: input.value })
                                  }}
                                  className="px-3 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-xl transition-colors text-xs font-medium"
                                >
                                  Sačuvaj
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Analytics Tab */}
            {activeTab === 'analytics' && (
              <div className="space-y-4 overflow-x-hidden">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-text">📊 Statistika</h2>
                    <p className="text-[11px] text-muted mt-0.5">Pregled prodaje i analitike</p>
                  </div>
                </div>

                {/* Hero Stats Card */}
                <div className="bg-gradient-to-br from-primary via-primary/80 to-accent rounded-2xl p-4 text-white relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-8 -mt-8" />
                  <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/5 rounded-full -ml-6 -mb-6" />
                  <div className="relative">
                    <p className="text-white/70 text-xs mb-1">Ukupni prihod</p>
                    <p className="text-3xl font-bold mb-3">{analytics.totalRevenue.toFixed(0)} <span className="text-sm font-normal text-white/70">KM</span></p>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="flex items-center gap-1.5">
                        <div className="w-7 h-7 bg-white/20 rounded-lg flex items-center justify-center">
                          <ShoppingCart className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <p className="text-sm font-bold">{analytics.totalOrders}</p>
                          <p className="text-[9px] text-white/60">narudžbi</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-7 h-7 bg-white/20 rounded-lg flex items-center justify-center">
                          <Users className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <p className="text-sm font-bold">{analytics.uniqueCustomers}</p>
                          <p className="text-[9px] text-white/60">kupaca</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${analytics.monthlyGrowth >= 0 ? 'bg-accent/40' : 'bg-danger/40'}`}>
                          {analytics.monthlyGrowth >= 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                        </div>
                        <div>
                          <p className="text-sm font-bold">{analytics.monthlyGrowth >= 0 ? '+' : ''}{analytics.monthlyGrowth}%</p>
                          <p className="text-[9px] text-white/60">rast</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Period Stats - Grid on Mobile */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-surface rounded-xl p-3 border border-white/5">
                    <div className="flex items-center gap-1.5 mb-2">
                      <span className="text-base">📅</span>
                      <span className="text-[10px] text-muted">Ovaj tjedan</span>
                    </div>
                    <p className="text-lg font-bold text-primary">{analytics.revenueThisWeek.toFixed(0)} KM</p>
                    <p className="text-[9px] text-muted">{analytics.ordersThisWeek} narudžbi</p>
                  </div>
                  <div className="bg-surface rounded-xl p-3 border border-white/5">
                    <div className="flex items-center gap-1.5 mb-2">
                      <span className="text-base">🗓️</span>
                      <span className="text-[10px] text-muted">Ovaj mjesec</span>
                    </div>
                    <p className="text-lg font-bold text-accent">{analytics.revenueThisMonth.toFixed(0)} KM</p>
                    <p className="text-[9px] text-muted">{analytics.ordersThisMonth} narudžbi</p>
                  </div>
                  <div className="bg-surface rounded-xl p-3 border border-white/5">
                    <div className="flex items-center gap-1.5 mb-2">
                      <span className="text-base">📆</span>
                      <span className="text-[10px] text-muted">Ova godina</span>
                    </div>
                    <p className="text-lg font-bold text-secondary">{analytics.revenueThisYear.toFixed(0)} KM</p>
                    <p className="text-[9px] text-muted">{analytics.ordersThisYear} narudžbi</p>
                  </div>
                  <div className="bg-gradient-to-br from-secondary/20 to-secondary/5 rounded-xl p-3 border border-secondary/20">
                    <div className="flex items-center gap-1.5 mb-2">
                      <span className="text-base">💰</span>
                      <span className="text-[10px] text-muted">Prosjek</span>
                    </div>
                    <p className="text-lg font-bold text-secondary">{analytics.avgOrderValue.toFixed(0)} KM</p>
                    <p className="text-[9px] text-muted">po narudžbi</p>
                  </div>
                </div>

                {/* Order Status - Wrap on Mobile */}
                <div className="flex flex-wrap gap-1.5">
                  <div className="bg-primary/10 rounded-full px-2.5 py-1 flex items-center gap-1">
                    <span className="text-xs">🆕</span>
                    <span className="text-[10px] font-medium text-primary">{analytics.ordersByStatus.new} Novih</span>
                  </div>
                  <div className="bg-yellow-500/10 rounded-full px-2.5 py-1 flex items-center gap-1">
                    <span className="text-xs">⏳</span>
                    <span className="text-[10px] font-medium text-yellow-500">{analytics.ordersByStatus.processing} Obrada</span>
                  </div>
                  <div className="bg-blue-500/10 rounded-full px-2.5 py-1 flex items-center gap-1">
                    <span className="text-xs">📦</span>
                    <span className="text-[10px] font-medium text-blue-500">{analytics.ordersByStatus.shipped} Poslano</span>
                  </div>
                  <div className="bg-accent/10 rounded-full px-2.5 py-1 flex items-center gap-1">
                    <span className="text-xs">✅</span>
                    <span className="text-[10px] font-medium text-accent">{analytics.ordersByStatus.delivered} Gotovo</span>
                  </div>
                  <div className="bg-muted/10 rounded-full px-2.5 py-1 flex items-center gap-1">
                    <span className="text-xs">❌</span>
                    <span className="text-[10px] font-medium text-muted">{analytics.ordersByStatus.cancelled} Otkaz</span>
                  </div>
                </div>

                {/* Daily Chart - Modern */}
                <div className="bg-surface rounded-xl p-3 border border-white/5">
                  <h3 className="text-xs font-semibold text-text mb-3 flex items-center gap-1.5">
                    <span>📈</span> Zadnjih 7 dana
                  </h3>
                  <div className="flex items-end justify-between gap-1 h-28">
                    {analytics.dailyOrders.map((day, idx) => {
                      const maxRevenue = Math.max(...analytics.dailyOrders.map(d => d.revenue), 1)
                      const height = (day.revenue / maxRevenue) * 100
                      const isToday = idx === analytics.dailyOrders.length - 1
                      return (
                        <div key={idx} className="flex-1 flex flex-col items-center gap-0.5">
                          <span className="text-[8px] text-muted font-medium">{day.revenue.toFixed(0)}</span>
                          <div 
                            className={`w-full rounded-lg transition-all relative overflow-hidden ${isToday ? 'bg-primary/30' : 'bg-white/10'}`}
                            style={{ height: `${Math.max(height, 10)}%` }}
                          >
                            <div 
                              className={`absolute bottom-0 left-0 right-0 rounded-lg ${isToday ? 'bg-gradient-to-t from-primary to-primary/60' : 'bg-gradient-to-t from-white/30 to-white/10'}`}
                              style={{ height: '100%' }}
                            />
                          </div>
                          <span className={`text-[8px] ${isToday ? 'text-primary font-bold' : 'text-muted'}`}>{day.date.slice(0, 3)}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Monthly Chart - Modern */}
                <div className="bg-surface rounded-xl p-3 border border-white/5">
                  <h3 className="text-xs font-semibold text-text mb-3 flex items-center gap-1.5">
                    <span>📊</span> Zadnjih 6 mjeseci
                  </h3>
                  <div className="flex items-end justify-between gap-1.5 h-28">
                    {analytics.monthlyOrders.map((month, idx) => {
                      const maxRevenue = Math.max(...analytics.monthlyOrders.map(m => m.revenue), 1)
                      const height = (month.revenue / maxRevenue) * 100
                      const isCurrentMonth = idx === analytics.monthlyOrders.length - 1
                      return (
                        <div key={idx} className="flex-1 flex flex-col items-center gap-0.5">
                          <span className="text-[8px] text-muted font-medium">{month.revenue.toFixed(0)}</span>
                          <div 
                            className={`w-full rounded-lg transition-all relative overflow-hidden ${isCurrentMonth ? 'bg-accent/30' : 'bg-white/10'}`}
                            style={{ height: `${Math.max(height, 10)}%` }}
                          >
                            <div 
                              className={`absolute bottom-0 left-0 right-0 rounded-lg ${isCurrentMonth ? 'bg-gradient-to-t from-accent to-accent/60' : 'bg-gradient-to-t from-white/30 to-white/10'}`}
                              style={{ height: '100%' }}
                            />
                          </div>
                          <span className={`text-[8px] ${isCurrentMonth ? 'text-accent font-bold' : 'text-muted'}`}>{month.month}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Top Products - Grid Layout */}
                <div className="bg-surface rounded-xl p-3 border border-white/5">
                  <h3 className="text-xs font-semibold text-text mb-2 flex items-center gap-1.5">
                    <span>🏆</span> Najprodavaniji proizvodi
                  </h3>
                  {analytics.topProducts.length === 0 ? (
                    <p className="text-xs text-muted text-center py-3">Nema podataka</p>
                  ) : (
                    <div className="space-y-1.5">
                      {analytics.topProducts.slice(0, 5).map((product, idx) => (
                        <div key={product.id} className="flex items-center gap-2 p-1.5 bg-background rounded-lg">
                          <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold flex-shrink-0 ${
                            idx === 0 ? 'bg-yellow-500 text-black' :
                            idx === 1 ? 'bg-gray-400 text-black' :
                            idx === 2 ? 'bg-orange-600 text-white' :
                            'bg-white/20 text-white'
                          }`}>
                            {idx + 1}
                          </span>
                          <div className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                            {product.image?.startsWith('data:') || product.image?.startsWith('http') ? (
                              <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                            ) : (
                              <Package className="w-3.5 h-3.5 text-muted" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[10px] text-text truncate">{product.name}</p>
                            <p className="text-[9px] text-muted">{product.quantity} prodano</p>
                          </div>
                          <span className="text-[10px] font-medium text-accent">{product.revenue.toFixed(0)} KM</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Worst Products - Compact List */}
                <div className="bg-surface rounded-xl p-3 border border-white/5">
                  <h3 className="text-xs font-semibold text-text mb-2 flex items-center gap-1.5">
                    <span>📉</span> Najmanje prodavani
                  </h3>
                  {analytics.worstProducts.length === 0 ? (
                    <p className="text-xs text-muted text-center py-3">Nema podataka</p>
                  ) : (
                    <div className="space-y-1.5">
                      {analytics.worstProducts.slice(0, 3).map((product) => (
                        <div key={product.id} className="flex items-center gap-2 p-1.5 bg-background rounded-lg">
                          <div className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                            {product.image?.startsWith('data:') || product.image?.startsWith('http') ? (
                              <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                            ) : (
                              <Package className="w-3.5 h-3.5 text-muted" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[10px] text-text truncate">{product.name}</p>
                            <p className="text-[9px] text-muted">{product.quantity} prodano</p>
                          </div>
                          <span className="text-[10px] font-medium text-danger">{product.revenue.toFixed(0)} KM</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Product Views Analytics */}
                <ProductViewsAnalytics productViews={productViews} products={products} />
              </div>
            )}
          </div>
        </main>
      </div>

      {/* New Order Alert Modal */}
      {showNewOrderAlert && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <div className="bg-surface rounded-3xl w-full max-w-md p-8 border border-danger/30 shadow-2xl shadow-danger/20 animate-pulse">
            <div className="text-center">
              <div className="w-24 h-24 bg-danger/20 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                <Bell className="w-12 h-12 text-danger" />
              </div>
              <h2 className="text-3xl font-bold text-danger mb-3">NOVA NARUDŽBA!</h2>
              <p className="text-muted mb-8 text-lg">Imate novu narudžbu za pregled</p>
              <button
                onClick={() => { setShowNewOrderAlert(false); setActiveTab('orders') }}
                className="w-full py-4 bg-danger hover:bg-danger/90 text-white rounded-2xl font-bold text-lg transition-colors shadow-lg shadow-danger/25"
              >
                Pogledaj narudžbu
              </button>
            </div>
          </div>
        </div>
      )}      {/* Product Modal */}
      {showProductModal && (
        <ProductModal
          product={editingProduct}
          categories={categories}
          subcategories={subcategories}
          onClose={() => setShowProductModal(false)}
          onSave={async (data) => {
            if (editingProduct?.id) {
              await updateProduct(editingProduct.id, data)
            } else {
              await addProduct(data as Omit<Product, 'id'>)
            }
            setShowProductModal(false)
          }}
        />
      )}

      {/* Category Modal */}
      {showCategoryModal && (
        <CategoryModal
          category={editingCategory}
          onClose={() => setShowCategoryModal(false)}
          onSave={async (data) => {
            if (editingCategory?.id) {
              await updateCategory(editingCategory.id, data)
            } else {
              await addCategory(data as Omit<Category, 'id'>)
            }
            setShowCategoryModal(false)
          }}
        />
      )}

      {/* Subcategory Modal */}
      {showSubcategoryModal && (
        <SubcategoryModal
          subcategory={editingSubcategory}
          categories={categories}
          onClose={() => setShowSubcategoryModal(false)}
          onSave={async (data) => {
            if (editingSubcategory?.id) {
              await updateSubcategory(editingSubcategory.id, data)
            } else {
              await addSubcategory(data as Omit<Subcategory, 'id'>)
            }
            setShowSubcategoryModal(false)
          }}
        />
      )}
    </div>
  )
}


// Product Modal Component
function ProductModal({ 
  product, 
  categories,
  subcategories,
  onClose, 
  onSave 
}: { 
  product: Product | null
  categories: Category[]
  subcategories: Subcategory[]
  onClose: () => void
  onSave: (data: Partial<Product>) => Promise<void>
}) {
  // Combine Firebase categories with local fallback
  const allCategories = categories.length > 0 
    ? categories 
    : localCategories.map(c => ({ ...c, id: c.id })) as Category[]
  
  const [formData, setFormData] = useState({
    name: product?.name || '',
    slug: product?.slug || generateSlug(product?.name || ''),
    price: product?.price || 0,
    originalPrice: product?.originalPrice || 0,
    category: product?.category || '',
    categorySlug: product?.categorySlug || '',
    subcategoryId: product?.subcategoryId || '',
    subcategorySlug: product?.subcategorySlug || '',
    image: product?.image || '📦',
    images: product?.images || [] as string[],
    videoUrl: product?.videoUrl || '',
    description: product?.description || '',
    rating: product?.rating || 5,
    reviews: product?.reviews || 0,
    stock: product?.stock || 0,
    badge: product?.badge || '',
    discountPercent: product?.discountPercent || 0,
    soldPercent: product?.soldPercent || 0,
    isFlashDeal: product?.isFlashDeal || false,
    showInHero: product?.showInHero || false,
    heroSubtitle: product?.heroSubtitle || '',
    features: product?.features?.join('\n') || '',
    productReviews: product?.productReviews || [] as { id: string; name: string; rating: number; comment: string; date: string; avatar?: string }[],
    variants: product?.variants || [] as ProductVariant[],
    hideStandardVariant: product?.hideStandardVariant || false,
    standardVariantLabel: product?.standardVariantLabel || 'Standardna',
    warrantyText: product?.warrantyText || '',
    deliveryTime: product?.deliveryTime || '',
    returnDays: product?.returnDays || 0,
  })
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadingGallery, setUploadingGallery] = useState(false)
  const [showReviews, setShowReviews] = useState(false)
  const [showVariants, setShowVariants] = useState(false)
  const [newReview, setNewReview] = useState({ name: '', rating: 5, comment: '', avatar: '👤', date: '' })
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null)
  const [editReview, setEditReview] = useState({ name: '', rating: 5, comment: '', avatar: '👤', date: '' })
  const [showAvatarPicker, setShowAvatarPicker] = useState(false)
  const [showEditAvatarPicker, setShowEditAvatarPicker] = useState(false)
  const [newVariantValue, setNewVariantValue] = useState('')
  const [newVariantPrice, setNewVariantPrice] = useState<number | ''>('')
  const [newVariantStock, setNewVariantStock] = useState<number | ''>('')
  const [editingVariantId, setEditingVariantId] = useState<string | null>(null)
  const [editVariant, setEditVariant] = useState({ value: '', price: 0 as number | '', stock: '' as number | '' })
  const [editingStandardVariant, setEditingStandardVariant] = useState(false)
  const [editStandardVariant, setEditStandardVariant] = useState({ label: '', price: 0 as number | '' })
  const [autoCalcDiscount, setAutoCalcDiscount] = useState(() => {
    // Default to checked if there's an old price and the discount matches the calculated value
    if (product?.originalPrice && product?.price && product?.discountPercent) {
      const calc = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      return calc === product.discountPercent
    }
    return true
  })
  
  const avatarEmojis = ['👤', '👨', '👩', '🧑', '👴', '👵', '👦', '👧', '🧔', '👱', '👩‍🦰', '👨‍🦰', '👩‍🦱', '👨‍🦱', '🧑‍🦳', '👩‍🦳']

  // Variant management functions
  const addVariant = () => {
    if (!newVariantValue.trim() || newVariantPrice === '' || newVariantPrice <= 0) return
    const newVariant: ProductVariant = {
      id: Date.now().toString(),
      value: newVariantValue.trim(),
      price: newVariantPrice,
      stock: newVariantStock !== '' ? newVariantStock : undefined
    }
    setFormData({ ...formData, variants: [...formData.variants, newVariant] })
    setNewVariantValue('')
    setNewVariantPrice('')
    setNewVariantStock('')
  }

  const removeVariant = (variantId: string) => {
    setFormData({
      ...formData,
      variants: formData.variants.filter(v => v.id !== variantId)
    })
  }

  const startEditVariant = (variant: ProductVariant) => {
    setEditingVariantId(variant.id)
    setEditVariant({
      value: variant.value,
      price: variant.price,
      stock: variant.stock ?? ''
    })
  }

  const saveEditVariant = () => {
    if (!editVariant.value.trim() || editVariant.price === '' || editVariant.price <= 0) return
    setFormData({
      ...formData,
      variants: formData.variants.map(v =>
        v.id === editingVariantId
          ? { ...v, value: editVariant.value.trim(), price: editVariant.price as number, stock: editVariant.stock !== '' ? editVariant.stock as number : undefined }
          : v
      )
    })
    setEditingVariantId(null)
    setEditVariant({ value: '', price: '', stock: '' })
  }

  const cancelEditVariant = () => {
    setEditingVariantId(null)
    setEditVariant({ value: '', price: '', stock: '' })
  }

  // Convert file to base64 and store directly
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    // Check file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert('Slika je prevelika. Maksimalna veličina je 2MB.')
      return
    }

    setUploading(true)
    
    try {
      // Convert to base64 data URL
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64String = reader.result as string
        setFormData({ ...formData, image: base64String })
        setUploading(false)
      }
      reader.onerror = () => {
        alert('Greška pri učitavanju slike.')
        setUploading(false)
      }
      reader.readAsDataURL(file)
    } catch (error) {
      console.error('Error uploading image:', error)
      alert('Greška pri uploadu slike.')
      setUploading(false)
    }
  }

  // Handle gallery image upload
  const handleGalleryImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return
    
    setUploadingGallery(true)
    
    const newImages: string[] = []
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      
      if (file.size > 2 * 1024 * 1024) {
        alert(`Slika ${file.name} je prevelika. Maksimalna veličina je 2MB.`)
        continue
      }
      
      try {
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader()
          reader.onloadend = () => resolve(reader.result as string)
          reader.onerror = reject
          reader.readAsDataURL(file)
        })
        newImages.push(base64)
      } catch (error) {
        console.error('Error uploading image:', error)
      }
    }
    
    setFormData({ ...formData, images: [...formData.images, ...newImages] })
    setUploadingGallery(false)
  }

  const removeGalleryImage = (index: number) => {
    setFormData({ 
      ...formData, 
      images: formData.images.filter((_, i) => i !== index) 
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    await onSave({
      ...formData,
      slug: formData.slug || generateSlug(formData.name),
      features: formData.features.split('\n').filter(f => f.trim()),
      images: formData.images.length > 0 ? formData.images : undefined,
      videoUrl: formData.videoUrl || undefined,
      originalPrice: formData.originalPrice || undefined,
      discountPercent: formData.discountPercent || undefined,
      soldPercent: formData.soldPercent || undefined,
      badge: formData.badge as Product['badge'] || undefined,
      heroSubtitle: formData.heroSubtitle || undefined,
      subcategoryId: formData.subcategoryId || undefined,
      subcategorySlug: formData.subcategorySlug || undefined,
      productReviews: formData.productReviews.length > 0 ? formData.productReviews : undefined,
      reviews: formData.productReviews.length || formData.reviews,
      variants: formData.variants.length > 0 ? formData.variants : undefined,
      hideStandardVariant: formData.hideStandardVariant || undefined,
      standardVariantLabel: formData.standardVariantLabel && formData.standardVariantLabel !== 'Standardna' ? formData.standardVariantLabel : undefined,
      warrantyText: formData.warrantyText || undefined,
      deliveryTime: formData.deliveryTime || undefined,
      returnDays: formData.returnDays || undefined,
    })
    setSaving(false)
  }

  const addReview = () => {
    if (!newReview.name.trim() || !newReview.comment.trim()) return
    
    const review = {
      id: Date.now().toString(),
      name: newReview.name,
      rating: newReview.rating,
      comment: newReview.comment,
      date: newReview.date.trim() || new Date().toLocaleDateString('bs-BA', { day: 'numeric', month: 'short', year: 'numeric' }),
      avatar: newReview.avatar
    }
    
    setFormData({
      ...formData,
      productReviews: [...formData.productReviews, review]
    })
    setNewReview({ name: '', rating: 5, comment: '', avatar: '👤', date: '' })
  }

  const removeReview = (id: string) => {
    setFormData({
      ...formData,
      productReviews: formData.productReviews.filter(r => r.id !== id)
    })
  }

  const startEditReview = (review: typeof formData.productReviews[0]) => {
    setEditingReviewId(review.id)
    setEditReview({
      name: review.name,
      rating: review.rating,
      comment: review.comment,
      avatar: review.avatar || '👤',
      date: review.date || ''
    })
  }

  const saveEditReview = () => {
    if (!editReview.name.trim() || !editReview.comment.trim()) return
    
    setFormData({
      ...formData,
      productReviews: formData.productReviews.map(r => 
        r.id === editingReviewId 
          ? { ...r, name: editReview.name, rating: editReview.rating, comment: editReview.comment, avatar: editReview.avatar, date: editReview.date || r.date }
          : r
      )
    })
    setEditingReviewId(null)
    setEditReview({ name: '', rating: 5, comment: '', avatar: '👤', date: '' })
  }

  const cancelEditReview = () => {
    setEditingReviewId(null)
    setEditReview({ name: '', rating: 5, comment: '', avatar: '👤', date: '' })
  }

  const handleCategoryChange = (categoryName: string) => {
    const cat = allCategories.find(c => c.name === categoryName)
    setFormData({
      ...formData,
      category: categoryName,
      categorySlug: cat?.slug || categoryName.toLowerCase().replace(/\s+/g, '-'),
      subcategoryId: '', // Reset subcategory when category changes
      subcategorySlug: ''
    })
  }

  const handleSubcategoryChange = (subcategoryId: string) => {
    const sub = subcategories.find(s => s.id === subcategoryId)
    setFormData({
      ...formData,
      subcategoryId: subcategoryId,
      subcategorySlug: sub?.slug || ''
    })
  }

  // Get subcategories for selected category
  const selectedCategory = allCategories.find(c => c.name === formData.category)
  const availableSubcategories = selectedCategory 
    ? subcategories.filter(s => s.categoryId === selectedCategory.id)
    : []


  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end lg:items-center justify-center">
      <div className="bg-surface w-full lg:w-auto lg:min-w-[600px] lg:max-w-2xl max-h-[95vh] lg:max-h-[90vh] rounded-t-3xl lg:rounded-3xl overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary/20 to-accent/20 px-6 py-5 flex items-center justify-between border-b border-white/5">
          <div>
            <h3 className="text-xl font-bold text-text">
              {product ? 'Uredi proizvod' : 'Novi proizvod'}
            </h3>
            <p className="text-sm text-muted mt-0.5">Popunite informacije o proizvodu</p>
          </div>
          <button onClick={onClose} className="p-2.5 bg-white/10 hover:bg-white/20 rounded-xl transition-colors">
            <X className="w-5 h-5 text-text" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            
            {/* Main Image Upload */}
            <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl p-5 border border-white/5">
              <label className="block text-sm font-medium text-text mb-3">Glavna slika proizvoda</label>
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="w-28 h-28 bg-background rounded-2xl flex items-center justify-center overflow-hidden border-2 border-dashed border-white/20">
                  {formData.image && formData.image.startsWith('data:') ? (
                    <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center">
                      <span className="text-3xl block mb-1">📷</span>
                      <span className="text-xs text-muted">Nema slike</span>
                    </div>
                  )}
                </div>
                <div className="flex-1 w-full sm:w-auto">
                  <label className="flex items-center justify-center gap-3 bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-xl cursor-pointer transition-all hover:scale-[1.02] shadow-lg shadow-primary/25 font-medium">
                    <Upload className="w-5 h-5" />
                    <span>{uploading ? 'Učitavanje...' : 'Odaberi sliku'}</span>
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" disabled={uploading} />
                  </label>
                  <p className="text-xs text-muted mt-2 text-center sm:text-left">JPG, PNG ili WebP • Max 2MB</p>
                </div>
              </div>
            </div>

            {/* Basic Info */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-text flex items-center gap-2">
                <span className="w-6 h-6 bg-primary/20 rounded-lg flex items-center justify-center text-xs text-primary">1</span>
                Osnovne informacije
              </h4>
              
              <div>
                <label className="block text-sm text-muted mb-1.5">Naziv proizvoda *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => {
                    const newName = e.target.value
                    const autoSlug = !product || formData.slug === generateSlug(formData.name)
                    setFormData({
                      ...formData,
                      name: newName,
                      ...(autoSlug ? { slug: generateSlug(newName) } : {})
                    })
                  }}
                  placeholder="Unesite naziv proizvoda"
                  className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-text placeholder:text-muted/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-muted mb-1.5">URL slug</label>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted flex-shrink-0">/product/</span>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={e => setFormData({...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-')})}
                    placeholder={generateSlug(formData.name) || 'url-slug'}
                    className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-text placeholder:text-muted/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-sm"
                  />
                </div>
                <p className="text-[10px] text-muted mt-1">Automatski se generiše iz naziva. Možete ga promijeniti.</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-muted mb-1.5">Cijena (KM) *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price || ''}
                    onChange={e => {
                      const newPrice = parseFloat(e.target.value) || 0
                      const updates: Partial<typeof formData> = { price: newPrice }
                      if (autoCalcDiscount) {
                        if (formData.originalPrice && newPrice > 0) {
                          updates.discountPercent = Math.round(((formData.originalPrice - newPrice) / formData.originalPrice) * 100)
                        } else {
                          updates.discountPercent = 0
                        }
                      }
                      setFormData({...formData, ...updates})
                    }}
                    placeholder="0.00"
                    className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-text placeholder:text-muted/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-muted mb-1.5">Stara cijena</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.originalPrice || ''}
                    onChange={e => {
                      const newOldPrice = parseFloat(e.target.value) || 0
                      const updates: Partial<typeof formData> = { originalPrice: newOldPrice }
                      if (autoCalcDiscount) {
                        if (newOldPrice > 0 && formData.price > 0) {
                          updates.discountPercent = Math.round(((newOldPrice - formData.price) / newOldPrice) * 100)
                        } else {
                          updates.discountPercent = 0
                        }
                      }
                      setFormData({...formData, ...updates})
                    }}
                    placeholder="0.00"
                    className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-text placeholder:text-muted/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>
              </div>

              {/* Discount row */}
              <div className="flex items-start gap-3">
                <div className="flex-1">
                  <label className="block text-sm text-muted mb-1.5">Popust (%)</label>
                  <input
                    type="number"
                    value={formData.discountPercent || ''}
                    onChange={e => setFormData({...formData, discountPercent: parseInt(e.target.value) || 0})}
                    placeholder="npr. 20"
                    disabled={autoCalcDiscount}
                    className={`w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-text placeholder:text-muted/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all ${autoCalcDiscount ? 'opacity-60 cursor-not-allowed' : ''}`}
                  />
                </div>
                <div className="pt-8">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={autoCalcDiscount}
                      onChange={e => {
                        const checked = e.target.checked
                        setAutoCalcDiscount(checked)
                        if (checked && formData.originalPrice && formData.price > 0) {
                          setFormData({...formData, discountPercent: Math.round(((formData.originalPrice - formData.price) / formData.originalPrice) * 100)})
                        }
                      }}
                      className="w-4 h-4 rounded border-white/20 bg-background accent-[var(--primary)] cursor-pointer"
                    />
                    <span className="text-xs text-muted whitespace-nowrap">Auto</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm text-muted mb-1.5">Količina na stanju</label>
                <input
                  type="number"
                  value={formData.stock || ''}
                  onChange={e => setFormData({...formData, stock: parseInt(e.target.value) || 0})}
                  placeholder="Unesite količinu (npr. 50)"
                  className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-text placeholder:text-muted/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                />
                <p className="text-xs text-muted mt-1.5">Ostavite prazno za neograničenu količinu</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-muted mb-1.5">Kategorija *</label>
                  <select
                    value={formData.category}
                    onChange={e => handleCategoryChange(e.target.value)}
                    className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-text focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                    required
                  >
                    <option value="">Odaberi</option>
                    {allCategories.map(cat => (
                      <option key={cat.id} value={cat.name}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-muted mb-1.5">Podkategorija</label>
                  <select
                    value={formData.subcategoryId}
                    onChange={e => handleSubcategoryChange(e.target.value)}
                    className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-text focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                    disabled={availableSubcategories.length === 0}
                  >
                    <option value="">Bez podkategorije</option>
                    {availableSubcategories.map(sub => (
                      <option key={sub.id} value={sub.id}>{sub.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-muted mb-1.5">Status</label>
                  <select
                    value={formData.badge}
                    onChange={e => setFormData({...formData, badge: e.target.value})}
                    className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-text focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  >
                    <option value="">Bez statusa</option>
                    <option value="new">🆕 Novo</option>
                    <option value="sale">🔥 Akcija</option>
                    <option value="discount">💰 Popust</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm text-muted mb-1.5">Opis proizvoda</label>
                
                {/* Formatting Toolbar */}
                <div className="flex items-center gap-1 mb-2 p-2 bg-background border border-white/10 rounded-t-xl">
                  <button
                    type="button"
                    onClick={() => {
                      const textarea = document.getElementById('description-textarea') as HTMLTextAreaElement
                      const start = textarea.selectionStart
                      const end = textarea.selectionEnd
                      const selectedText = formData.description.substring(start, end)
                      const newText = formData.description.substring(0, start) + `**${selectedText}**` + formData.description.substring(end)
                      setFormData({...formData, description: newText})
                      setTimeout(() => {
                        textarea.focus()
                        textarea.setSelectionRange(start + 2, end + 2)
                      }, 0)
                    }}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors group"
                    title="Bold (Ctrl+B)"
                  >
                    <span className="font-bold text-text text-sm">B</span>
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => {
                      const textarea = document.getElementById('description-textarea') as HTMLTextAreaElement
                      const start = textarea.selectionStart
                      const end = textarea.selectionEnd
                      const selectedText = formData.description.substring(start, end)
                      const newText = formData.description.substring(0, start) + `*${selectedText}*` + formData.description.substring(end)
                      setFormData({...formData, description: newText})
                      setTimeout(() => {
                        textarea.focus()
                        textarea.setSelectionRange(start + 1, end + 1)
                      }, 0)
                    }}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    title="Italic (Ctrl+I)"
                  >
                    <span className="italic text-text text-sm">I</span>
                  </button>
                  
                  <div className="w-px h-6 bg-white/10 mx-1" />
                  
                  <button
                    type="button"
                    onClick={() => {
                      const textarea = document.getElementById('description-textarea') as HTMLTextAreaElement
                      const start = textarea.selectionStart
                      const lines = formData.description.substring(0, start).split('\n')
                      const currentLineStart = start - lines[lines.length - 1].length
                      const newText = formData.description.substring(0, currentLineStart) + '• ' + formData.description.substring(currentLineStart)
                      setFormData({...formData, description: newText})
                    }}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    title="Bullet point"
                  >
                    <span className="text-text text-sm">•</span>
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => {
                      const textarea = document.getElementById('description-textarea') as HTMLTextAreaElement
                      const start = textarea.selectionStart
                      const end = textarea.selectionEnd
                      const selectedText = formData.description.substring(start, end)
                      const newText = formData.description.substring(0, start) + `⭐ ${selectedText}` + formData.description.substring(end)
                      setFormData({...formData, description: newText})
                    }}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    title="Add star"
                  >
                    <span className="text-sm">⭐</span>
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => {
                      const textarea = document.getElementById('description-textarea') as HTMLTextAreaElement
                      const start = textarea.selectionStart
                      const end = textarea.selectionEnd
                      const selectedText = formData.description.substring(start, end)
                      const newText = formData.description.substring(0, start) + `📹 ${selectedText}` + formData.description.substring(end)
                      setFormData({...formData, description: newText})
                    }}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    title="Add camera emoji"
                  >
                    <span className="text-sm">📹</span>
                  </button>
                  
                  <div className="ml-auto text-xs text-muted">
                    **bold** *italic* • bullets
                  </div>
                </div>
                
                <textarea
                  id="description-textarea"
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  rows={6}
                  placeholder="Opišite proizvod... Koristite **tekst** za bold, *tekst* za italic"
                  className="w-full bg-background border border-white/10 border-t-0 rounded-b-xl px-4 py-3 text-text placeholder:text-muted/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none font-mono text-sm"
                />
                
                {/* Preview */}
                {formData.description && (
                  <div className="mt-2 p-3 bg-white/5 rounded-xl border border-white/5">
                    <p className="text-xs text-muted mb-2">Preview:</p>
                    <div 
                      className="text-sm text-text whitespace-pre-line"
                      dangerouslySetInnerHTML={{ 
                        __html: formData.description
                          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                          .replace(/\*(.*?)\*/g, '<em>$1</em>')
                      }}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Gallery & Video */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-text flex items-center gap-2">
                <span className="w-6 h-6 bg-accent/20 rounded-lg flex items-center justify-center text-xs text-accent">2</span>
                Galerija i video
              </h4>
              
              {/* Gallery */}
              <div>
                <label className="block text-sm text-muted mb-2">Dodatne slike</label>
                <div className="flex flex-wrap gap-2">
                  {formData.images.map((img, index) => (
                    <div key={index} className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border border-white/10 group">
                      <img src={img} alt={`Gallery ${index + 1}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeGalleryImage(index)}
                        className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                      >
                        <X className="w-5 h-5 text-white" />
                      </button>
                    </div>
                  ))}
                  <label className="w-16 h-16 sm:w-20 sm:h-20 bg-background rounded-xl border-2 border-dashed border-white/20 flex items-center justify-center cursor-pointer hover:border-accent/50 hover:bg-accent/5 transition-all">
                    {uploadingGallery ? (
                      <div className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Plus className="w-6 h-6 text-muted" />
                    )}
                    <input type="file" accept="image/*" multiple onChange={handleGalleryImageUpload} className="hidden" disabled={uploadingGallery} />
                  </label>
                </div>
              </div>

              {/* Video */}
              <div>
                <label className="block text-sm text-muted mb-2">Video URL (YouTube, Vimeo, ili direktni link)</label>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <input
                      type="url"
                      value={formData.videoUrl}
                      onChange={e => setFormData({...formData, videoUrl: e.target.value})}
                      placeholder="https://www.youtube.com/watch?v=... ili direktni video link"
                      className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-text placeholder:text-muted/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-sm"
                    />
                  </div>
                  {formData.videoUrl && (
                    <button 
                      type="button" 
                      onClick={() => setFormData({...formData, videoUrl: ''})} 
                      className="px-3 py-2 bg-danger/20 hover:bg-danger/30 text-danger rounded-xl transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <p className="text-xs text-muted mt-1.5">Podržani formati: YouTube, Vimeo, ili direktni link na video (.mp4, .webm)</p>
              </div>
            </div>

            {/* Features */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-text flex items-center gap-2">
                <span className="w-6 h-6 bg-primary/20 rounded-lg flex items-center justify-center text-xs text-primary">3</span>
                Karakteristike
              </h4>
              <textarea
                value={formData.features}
                onChange={e => setFormData({...formData, features: e.target.value})}
                rows={3}
                placeholder="WiFi povezivanje&#10;Full HD rezolucija&#10;Noćni vid"
                className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-text placeholder:text-muted/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none text-sm"
              />
              <p className="text-xs text-muted">Svaka karakteristika u novom redu</p>
            </div>

            {/* Trust Badges - Dostava, Garancija, Povrat */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-text flex items-center gap-2">
                <span className="w-6 h-6 bg-green-500/20 rounded-lg flex items-center justify-center text-xs text-green-400">🛡</span>
                Dostava, Garancija & Povrat
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-muted mb-1.5">🚚 Dostava</label>
                  <input
                    type="text"
                    value={formData.deliveryTime}
                    onChange={e => setFormData({...formData, deliveryTime: e.target.value})}
                    placeholder="npr. 1-2 dana"
                    className="w-full bg-background border border-white/10 rounded-xl px-3 py-2.5 text-sm text-text placeholder:text-muted/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs text-muted mb-1.5">🛡️ Garancija</label>
                  <input
                    type="text"
                    value={formData.warrantyText}
                    onChange={e => setFormData({...formData, warrantyText: e.target.value})}
                    placeholder="npr. 12 mjeseci"
                    className="w-full bg-background border border-white/10 rounded-xl px-3 py-2.5 text-sm text-text placeholder:text-muted/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs text-muted mb-1.5">🔄 Povrat (dana)</label>
                  <input
                    type="number"
                    value={formData.returnDays || ''}
                    onChange={e => setFormData({...formData, returnDays: parseInt(e.target.value) || 0})}
                    placeholder="npr. 14"
                    className="w-full bg-background border border-white/10 rounded-xl px-3 py-2.5 text-sm text-text placeholder:text-muted/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>
              </div>
              <p className="text-xs text-muted">Ovi podaci se prikazuju na stranici proizvoda ispod slike</p>
            </div>

            {/* Special Options */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-text flex items-center gap-2">
                <span className="w-6 h-6 bg-accent/20 rounded-lg flex items-center justify-center text-xs text-accent">4</span>
                Posebne opcije
              </h4>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                  formData.isFlashDeal ? 'bg-danger/10 border-danger/30' : 'bg-background border-white/10 hover:border-white/20'
                }`}>
                  <input
                    type="checkbox"
                    checked={formData.isFlashDeal}
                    onChange={e => setFormData({...formData, isFlashDeal: e.target.checked})}
                    className="w-5 h-5 rounded accent-danger"
                  />
                  <div>
                    <span className="text-sm font-medium text-text block">🔥 Flash ponuda</span>
                    <span className="text-xs text-muted">Prikaži u flash sekciji</span>
                  </div>
                </label>

                <label className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                  formData.showInHero ? 'bg-primary/10 border-primary/30' : 'bg-background border-white/10 hover:border-white/20'
                }`}>
                  <input
                    type="checkbox"
                    checked={formData.showInHero}
                    onChange={e => setFormData({...formData, showInHero: e.target.checked})}
                    className="w-5 h-5 rounded accent-primary"
                  />
                  <div>
                    <span className="text-sm font-medium text-text block">⭐ Hero banner</span>
                    <span className="text-xs text-muted">Prikaži na naslovnici</span>
                  </div>
                </label>
              </div>

              {(formData.isFlashDeal || formData.showInHero || formData.badge) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  {formData.isFlashDeal && (
                    <div>
                      <label className="block text-sm text-muted mb-1.5">Prodano (%)</label>
                      <input
                        type="number"
                        value={formData.soldPercent || ''}
                        onChange={e => setFormData({...formData, soldPercent: parseInt(e.target.value) || 0})}
                        placeholder="npr. 75"
                        className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-text placeholder:text-muted/50 focus:outline-none focus:border-danger focus:ring-2 focus:ring-danger/20 transition-all"
                      />
                    </div>
                  )}
                  {formData.showInHero && (
                    <div>
                      <label className="block text-sm text-muted mb-1.5">Hero podnaslov</label>
                      <input
                        type="text"
                        value={formData.heroSubtitle}
                        onChange={e => setFormData({...formData, heroSubtitle: e.target.value})}
                        placeholder="npr. Bestseller"
                        className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-text placeholder:text-muted/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                      />
                    </div>
                  )}

                </div>
              )}
            </div>

            {/* Reviews Section */}
            <div className="space-y-4">
              <button
                type="button"
                onClick={() => setShowReviews(!showReviews)}
                className="w-full flex items-center justify-between text-sm font-semibold text-text"
              >
                <span className="flex items-center gap-2">
                  <span className="w-6 h-6 bg-secondary/20 rounded-lg flex items-center justify-center text-xs text-secondary">5</span>
                  Recenzije ({formData.productReviews.length})
                </span>
                <ChevronDown className={`w-4 h-4 text-muted transition-transform ${showReviews ? 'rotate-180' : ''}`} />
              </button>

              {showReviews && (
                <div className="space-y-4 pt-2">
                  {/* Existing Reviews */}
                  {formData.productReviews.length > 0 && (
                    <div className="space-y-2">
                      {formData.productReviews.map((review) => (
                        <div key={review.id} className="bg-background rounded-xl p-3 border border-white/5">
                          {editingReviewId === review.id ? (
                            /* Edit Mode */
                            <div className="space-y-3">
                              <div className="flex gap-3 items-end">
                                {/* Avatar Selector */}
                                <div className="flex-shrink-0">
                                  <span className="text-xs text-muted block mb-1">Ikona</span>
                                  <div className="relative">
                                    <button
                                      type="button"
                                      onClick={() => setShowEditAvatarPicker(!showEditAvatarPicker)}
                                      className="w-10 h-10 bg-surface border border-white/10 rounded-lg flex items-center justify-center text-xl hover:border-primary/50 transition-colors"
                                    >
                                      {editReview.avatar}
                                    </button>
                                    {showEditAvatarPicker && (
                                      <div className="absolute left-0 top-full mt-1 bg-surface border border-white/10 rounded-xl p-2 grid grid-cols-8 gap-1 z-50 shadow-xl min-w-[200px]">
                                        {avatarEmojis.map((emoji) => (
                                          <button
                                            key={emoji}
                                            type="button"
                                            onClick={() => { setEditReview({...editReview, avatar: emoji}); setShowEditAvatarPicker(false); }}
                                            className={`w-8 h-8 rounded-lg flex items-center justify-center text-lg hover:bg-white/10 transition-colors ${editReview.avatar === emoji ? 'bg-primary/20' : ''}`}
                                          >
                                            {emoji}
                                          </button>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                </div>
                                <div className="flex-1">
                                  <span className="text-xs text-muted block mb-1">Ime</span>
                                  <input
                                    type="text"
                                    value={editReview.name}
                                    onChange={e => setEditReview({...editReview, name: e.target.value})}
                                    placeholder="Ime korisnika"
                                    className="w-full bg-background border border-white/20 rounded-lg px-3 py-2 text-sm text-text placeholder:text-muted/50 focus:outline-none focus:border-primary"
                                  />
                                </div>
                              </div>
                              <div className="space-y-3">
                                <div>
                                  <span className="text-xs text-muted block mb-1">Datum</span>
                                  <input
                                    type="text"
                                    value={editReview.date}
                                    onChange={e => setEditReview({...editReview, date: e.target.value})}
                                    placeholder="npr. 15. dec 2024"
                                    className="w-full bg-background border border-white/20 rounded-lg px-3 py-2 text-sm text-text placeholder:text-muted/50 focus:outline-none focus:border-primary"
                                  />
                                </div>
                                <div>
                                  <span className="text-xs text-muted block mb-1">Ocjena</span>
                                  <div className="flex items-center gap-1">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                      <button
                                        key={star}
                                        type="button"
                                        onClick={() => setEditReview({...editReview, rating: star})}
                                        className="hover:scale-110 transition-transform"
                                      >
                                        <Star className={`w-6 h-6 ${star <= editReview.rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted/30'}`} />
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              </div>
                              <div>
                                <span className="text-xs text-muted block mb-1">Komentar</span>
                                <textarea
                                  value={editReview.comment}
                                  onChange={e => setEditReview({...editReview, comment: e.target.value})}
                                  rows={2}
                                  placeholder="Komentar recenzije..."
                                  className="w-full bg-background border border-white/20 rounded-lg px-3 py-2 text-sm text-text placeholder:text-muted/50 focus:outline-none focus:border-primary resize-none"
                                />
                              </div>
                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={saveEditReview}
                                  className="flex-1 py-1.5 bg-primary/20 hover:bg-primary/30 text-primary rounded-lg text-xs font-medium transition-colors"
                                >
                                  Spremi
                                </button>
                                <button
                                  type="button"
                                  onClick={cancelEditReview}
                                  className="flex-1 py-1.5 bg-white/5 hover:bg-white/10 text-muted rounded-lg text-xs font-medium transition-colors"
                                >
                                  Odustani
                                </button>
                              </div>
                            </div>
                          ) : (
                            /* View Mode */
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-start gap-2 flex-1 min-w-0">
                                <span className="text-xl flex-shrink-0">{review.avatar || '👤'}</span>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="text-sm font-medium text-text">{review.name}</span>
                                    <div className="flex items-center gap-0.5">
                                      {Array.from({ length: 5 }).map((_, i) => (
                                        <Star key={i} className={`w-3 h-3 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted/30'}`} />
                                      ))}
                                    </div>
                                  </div>
                                  <p className="text-xs text-muted line-clamp-2">{review.comment}</p>
                                  <span className="text-[10px] text-muted/60 mt-1 block">{review.date}</span>
                                </div>
                              </div>
                              <div className="flex gap-1 flex-shrink-0">
                                <button
                                  type="button"
                                  onClick={() => startEditReview(review)}
                                  className="p-1.5 hover:bg-primary/10 rounded-lg transition-colors"
                                >
                                  <Pencil className="w-3.5 h-3.5 text-primary" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => removeReview(review.id)}
                                  className="p-1.5 hover:bg-danger/10 rounded-lg transition-colors"
                                >
                                  <Trash2 className="w-3.5 h-3.5 text-danger" />
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add New Review */}
                  <div className="bg-background rounded-xl p-4 border border-white/10 space-y-3">
                    <h5 className="text-xs font-medium text-muted">Dodaj novu recenziju</h5>
                    
                    <div className="flex gap-3">
                      {/* Avatar Selector */}
                      <div className="flex-shrink-0">
                        <span className="text-xs text-muted block mb-1.5">Ikona</span>
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() => setShowAvatarPicker(!showAvatarPicker)}
                            className="w-12 h-12 bg-surface border border-white/10 rounded-xl flex items-center justify-center text-2xl hover:border-primary/50 transition-colors"
                          >
                            {newReview.avatar}
                          </button>
                          {showAvatarPicker && (
                            <div className="absolute left-0 bottom-full mb-1 bg-surface border border-white/10 rounded-xl p-2 grid grid-cols-8 gap-1 z-50 shadow-xl min-w-[200px]">
                              {avatarEmojis.map((emoji) => (
                                <button
                                  key={emoji}
                                  type="button"
                                  onClick={() => { setNewReview({...newReview, avatar: emoji}); setShowAvatarPicker(false); }}
                                  className={`w-8 h-8 rounded-lg flex items-center justify-center text-lg hover:bg-white/10 transition-colors ${newReview.avatar === emoji ? 'bg-primary/20' : ''}`}
                                >
                                  {emoji}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Name Input */}
                      <div className="flex-1">
                        <span className="text-xs text-muted block mb-1.5">Ime</span>
                        <input
                          type="text"
                          value={newReview.name}
                          onChange={e => setNewReview({...newReview, name: e.target.value})}
                          placeholder="Ime korisnika"
                          className="w-full bg-surface border border-white/10 rounded-lg px-3 py-2.5 text-sm text-text placeholder:text-muted/50 focus:outline-none focus:border-primary"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <span className="text-xs text-muted block mb-1.5">Datum (opciono)</span>
                        <input
                          type="text"
                          value={newReview.date}
                          onChange={e => setNewReview({...newReview, date: e.target.value})}
                          placeholder="npr. 15. dec 2024"
                          className="w-full bg-surface border border-white/10 rounded-lg px-3 py-2.5 text-sm text-text placeholder:text-muted/50 focus:outline-none focus:border-primary"
                        />
                      </div>
                      <div>
                        <span className="text-xs text-muted block mb-1.5">Ocjena</span>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setNewReview({...newReview, rating: star})}
                              className="hover:scale-110 transition-transform"
                            >
                              <Star className={`w-7 h-7 ${star <= newReview.rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted/30'}`} />
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <textarea
                      value={newReview.comment}
                      onChange={e => setNewReview({...newReview, comment: e.target.value})}
                      placeholder="Komentar recenzije..."
                      rows={2}
                      className="w-full bg-surface border border-white/10 rounded-lg px-3 py-2 text-sm text-text placeholder:text-muted/50 focus:outline-none focus:border-primary resize-none"
                    />
                    
                    <button
                      type="button"
                      onClick={addReview}
                      disabled={!newReview.name.trim() || !newReview.comment.trim()}
                      className="w-full py-2 bg-secondary/20 hover:bg-secondary/30 text-secondary rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      + Dodaj recenziju
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Variants Section */}
            <div className="space-y-4">
              <button
                type="button"
                onClick={() => setShowVariants(!showVariants)}
                className="w-full flex items-center justify-between text-sm font-semibold text-text"
              >
                <span className="flex items-center gap-2">
                  <span className="w-6 h-6 bg-accent/20 rounded-lg flex items-center justify-center">
                    <Layers className="w-3.5 h-3.5 text-accent" />
                  </span>
                  Varijante ({formData.variants.length + (formData.variants.length > 0 && !formData.hideStandardVariant ? 1 : 0)})
                </span>
                <ChevronDown className={`w-4 h-4 text-muted transition-transform ${showVariants ? 'rotate-180' : ''}`} />
              </button>

              {showVariants && (
                <div className="space-y-4 pt-2">
                  {/* Standard Variant Card */}
                  {formData.variants.length > 0 && (
                    <div className="space-y-2">
                      {!formData.hideStandardVariant ? (
                        <div className="bg-background rounded-xl p-3 border border-primary/20">
                          {editingStandardVariant ? (
                            /* Edit Mode */
                            <div className="space-y-3">
                              <div>
                                <span className="text-xs text-muted block mb-1">Naziv standardne varijante</span>
                                <input
                                  type="text"
                                  value={editStandardVariant.label}
                                  onChange={e => setEditStandardVariant({...editStandardVariant, label: e.target.value})}
                                  placeholder="npr. Standardna"
                                  className="w-full bg-background border border-white/20 rounded-lg px-3 py-2 text-sm text-text placeholder:text-muted/50 focus:outline-none focus:border-primary"
                                />
                              </div>
                              <div>
                                <span className="text-xs text-muted block mb-1">Cijena (KM)</span>
                                <input
                                  type="number"
                                  value={editStandardVariant.price}
                                  onChange={e => setEditStandardVariant({...editStandardVariant, price: e.target.value ? parseFloat(e.target.value) : ''})}
                                  placeholder="Cijena"
                                  className="w-full bg-background border border-white/20 rounded-lg px-3 py-2 text-sm text-text placeholder:text-muted/50 focus:outline-none focus:border-primary"
                                />
                              </div>
                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (!editStandardVariant.label.trim() || editStandardVariant.price === '' || editStandardVariant.price <= 0) return
                                    setFormData({
                                      ...formData,
                                      standardVariantLabel: editStandardVariant.label.trim(),
                                      price: editStandardVariant.price as number
                                    })
                                    setEditingStandardVariant(false)
                                  }}
                                  disabled={!editStandardVariant.label.trim() || editStandardVariant.price === '' || editStandardVariant.price <= 0}
                                  className="flex-1 py-1.5 bg-primary/20 hover:bg-primary/30 text-primary rounded-lg text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  Spremi
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setEditingStandardVariant(false)}
                                  className="flex-1 py-1.5 bg-white/5 hover:bg-white/10 text-muted rounded-lg text-xs font-medium transition-colors"
                                >
                                  Odustani
                                </button>
                              </div>
                            </div>
                          ) : (
                            /* View Mode */
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-3 flex-1 min-w-0">
                                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                                  <Star className="w-4 h-4 text-primary" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium text-text block">{formData.standardVariantLabel || 'Standardna'}</span>
                                    <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-md font-medium">Osnovna</span>
                                  </div>
                                  <div className="flex items-center gap-2 mt-0.5">
                                    <span className="text-sm text-accent font-bold">{formData.price} KM</span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex gap-1 flex-shrink-0">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingStandardVariant(true)
                                    setEditStandardVariant({
                                      label: formData.standardVariantLabel || 'Standardna',
                                      price: formData.price
                                    })
                                  }}
                                  className="p-1.5 hover:bg-primary/10 rounded-lg transition-colors"
                                >
                                  <Pencil className="w-3.5 h-3.5 text-primary" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setFormData({ ...formData, hideStandardVariant: true })}
                                  className="p-1.5 hover:bg-danger/10 rounded-lg transition-colors"
                                >
                                  <Trash2 className="w-3.5 h-3.5 text-danger" />
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        /* Hidden Standard Variant - Restore Option */
                        <div className="bg-background rounded-xl p-3 border border-dashed border-white/10 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted">Standardna varijanta je sakrivena</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setFormData({ ...formData, hideStandardVariant: false })}
                            className="text-xs text-primary hover:text-primary/80 font-medium transition-colors"
                          >
                            Vrati
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Existing Variants */}
                  {formData.variants.length > 0 && (
                    <div className="space-y-2">
                      {formData.variants.map((variant) => (
                        <div key={variant.id} className="bg-background rounded-xl p-3 border border-white/5">
                          {editingVariantId === variant.id ? (
                            /* Edit Mode */
                            <div className="space-y-3">
                              <div>
                                <span className="text-xs text-muted block mb-1">Naziv varijante</span>
                                <input
                                  type="text"
                                  value={editVariant.value}
                                  onChange={e => setEditVariant({...editVariant, value: e.target.value})}
                                  placeholder="Naziv (npr. XL, Crvena)"
                                  className="w-full bg-background border border-white/20 rounded-lg px-3 py-2 text-sm text-text placeholder:text-muted/50 focus:outline-none focus:border-primary"
                                />
                              </div>
                              <div className="flex gap-2">
                                <div className="flex-1">
                                  <span className="text-xs text-muted block mb-1">Cijena (KM)</span>
                                  <input
                                    type="number"
                                    value={editVariant.price}
                                    onChange={e => setEditVariant({...editVariant, price: e.target.value ? parseFloat(e.target.value) : ''})}
                                    placeholder="Cijena"
                                    className="w-full bg-background border border-white/20 rounded-lg px-3 py-2 text-sm text-text placeholder:text-muted/50 focus:outline-none focus:border-primary"
                                  />
                                </div>
                                <div className="flex-1">
                                  <span className="text-xs text-muted block mb-1">Količina</span>
                                  <input
                                    type="number"
                                    value={editVariant.stock}
                                    onChange={e => setEditVariant({...editVariant, stock: e.target.value ? parseInt(e.target.value) : ''})}
                                    placeholder="Opciono"
                                    className="w-full bg-background border border-white/20 rounded-lg px-3 py-2 text-sm text-text placeholder:text-muted/50 focus:outline-none focus:border-primary"
                                  />
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={saveEditVariant}
                                  disabled={!editVariant.value.trim() || editVariant.price === '' || editVariant.price <= 0}
                                  className="flex-1 py-1.5 bg-primary/20 hover:bg-primary/30 text-primary rounded-lg text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  Spremi
                                </button>
                                <button
                                  type="button"
                                  onClick={cancelEditVariant}
                                  className="flex-1 py-1.5 bg-white/5 hover:bg-white/10 text-muted rounded-lg text-xs font-medium transition-colors"
                                >
                                  Odustani
                                </button>
                              </div>
                            </div>
                          ) : (
                            /* View Mode */
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-3 flex-1 min-w-0">
                                <div className="w-8 h-8 bg-accent/10 rounded-lg flex items-center justify-center flex-shrink-0">
                                  <Layers className="w-4 h-4 text-accent" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <span className="text-sm font-medium text-text block">{variant.value}</span>
                                  <div className="flex items-center gap-2 mt-0.5">
                                    <span className="text-sm text-accent font-bold">{variant.price} KM</span>
                                    {variant.stock !== undefined && (
                                      <span className="text-xs text-muted">• {variant.stock} kom</span>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div className="flex gap-1 flex-shrink-0">
                                <button
                                  type="button"
                                  onClick={() => startEditVariant(variant)}
                                  className="p-1.5 hover:bg-primary/10 rounded-lg transition-colors"
                                >
                                  <Pencil className="w-3.5 h-3.5 text-primary" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => removeVariant(variant.id)}
                                  className="p-1.5 hover:bg-danger/10 rounded-lg transition-colors"
                                >
                                  <Trash2 className="w-3.5 h-3.5 text-danger" />
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add New Variant */}
                  <div className="bg-background rounded-xl p-4 border border-white/10 space-y-3">
                    <h5 className="text-xs font-medium text-muted">Dodaj novu varijantu</h5>
                    <div className="flex gap-2 flex-wrap">
                      <input
                        type="text"
                        value={newVariantValue}
                        onChange={e => setNewVariantValue(e.target.value)}
                        placeholder="Naziv (npr. XL, Crvena)"
                        className="flex-1 min-w-[150px] bg-surface border border-white/10 rounded-lg px-3 py-2.5 text-sm text-text placeholder:text-muted/50 focus:outline-none focus:border-primary"
                      />
                      <input
                        type="number"
                        value={newVariantPrice}
                        onChange={e => setNewVariantPrice(e.target.value ? parseFloat(e.target.value) : '')}
                        placeholder="Cijena (KM)"
                        className="w-28 bg-surface border border-white/10 rounded-lg px-3 py-2.5 text-sm text-text placeholder:text-muted/50 focus:outline-none focus:border-primary"
                      />
                      <input
                        type="number"
                        value={newVariantStock}
                        onChange={e => setNewVariantStock(e.target.value ? parseInt(e.target.value) : '')}
                        placeholder="Količina"
                        className="w-24 bg-surface border border-white/10 rounded-lg px-3 py-2.5 text-sm text-text placeholder:text-muted/50 focus:outline-none focus:border-primary"
                      />
                      <button
                        type="button"
                        onClick={addVariant}
                        disabled={!newVariantValue.trim() || newVariantPrice === '' || newVariantPrice <= 0}
                        className="px-4 py-2.5 bg-accent/20 hover:bg-accent/30 text-accent rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        + Dodaj
                      </button>
                    </div>
                    <p className="text-[10px] text-muted">
                      Primjeri: XL - 45 KM - 20 kom, Crvena - 35 KM - 15 kom
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="sticky bottom-0 bg-surface border-t border-white/5 px-6 py-4 flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 px-6 py-3.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-text font-medium transition-colors">
              Odustani
            </button>
            <button type="submit" disabled={saving} className="flex-1 px-6 py-3.5 bg-primary hover:bg-primary/90 text-white rounded-xl font-medium transition-all hover:scale-[1.02] shadow-lg shadow-primary/25 disabled:opacity-50 disabled:hover:scale-100">
              {saving ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Spremanje...
                </span>
              ) : (
                product ? 'Spremi promjene' : 'Dodaj proizvod'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}


// Category Modal Component
function CategoryModal({ 
  category, 
  onClose, 
  onSave 
}: { 
  category: Category | null
  onClose: () => void
  onSave: (data: Partial<Category>) => Promise<void>
}) {
  const [formData, setFormData] = useState({
    name: category?.name || '',
    slug: category?.slug || '',
    icon: category?.icon || '📁',
    showOnHome: category?.showOnHome ?? true,
  })
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    await onSave({
      ...formData,
      slug: formData.slug || formData.name.toLowerCase().replace(/\s+/g, '-')
    })
    setSaving(false)
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-surface rounded-2xl w-full max-w-md">
        <div className="border-b border-white/5 px-6 py-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-text">
            {category ? 'Uredi kategoriju' : 'Nova kategorija'}
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-lg">
            <X className="w-5 h-5 text-muted" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm text-muted mb-1">Naziv</label>
            <input
              type="text"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              className="w-full bg-background border border-white/10 rounded-xl px-4 py-2.5 text-text focus:outline-none focus:border-primary"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-muted mb-1">Slug (URL)</label>
            <input
              type="text"
              value={formData.slug}
              onChange={e => setFormData({...formData, slug: e.target.value})}
              placeholder="wifi-kamere"
              className="w-full bg-background border border-white/10 rounded-xl px-4 py-2.5 text-text focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-sm text-muted mb-1">Ikona (emoji)</label>
            <input
              type="text"
              value={formData.icon}
              onChange={e => setFormData({...formData, icon: e.target.value})}
              className="w-full bg-background border border-white/10 rounded-xl px-4 py-2.5 text-text focus:outline-none focus:border-primary"
            />
          </div>

          <label className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
            formData.showOnHome ? 'bg-primary/10 border-primary/30' : 'bg-background border-white/10 hover:border-white/20'
          }`}>
            <input
              type="checkbox"
              checked={formData.showOnHome}
              onChange={e => setFormData({...formData, showOnHome: e.target.checked})}
              className="w-5 h-5 rounded accent-primary"
            />
            <div>
              <span className="text-sm font-medium text-text block">Prikaži na početnoj</span>
              <span className="text-xs text-muted">Kategorija će biti vidljiva na početnoj stranici</span>
            </div>
          </label>

          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 border border-white/10 rounded-xl text-text hover:bg-white/5 transition-colors">
              Odustani
            </button>
            <button type="submit" disabled={saving} className="flex-1 px-4 py-2.5 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50">
              {saving ? 'Spremanje...' : 'Spremi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}


// Subcategory Modal Component
function SubcategoryModal({ 
  subcategory, 
  categories,
  onClose, 
  onSave 
}: { 
  subcategory: Subcategory | null
  categories: Category[]
  onClose: () => void
  onSave: (data: Partial<Subcategory>) => Promise<void>
}) {
  const [formData, setFormData] = useState({
    name: subcategory?.name || '',
    slug: subcategory?.slug || '',
    categoryId: subcategory?.categoryId || '',
  })
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    await onSave({
      ...formData,
      slug: formData.slug || formData.name.toLowerCase().replace(/\s+/g, '-')
    })
    setSaving(false)
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-surface rounded-2xl w-full max-w-md">
        <div className="border-b border-white/5 px-6 py-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-text">
            {subcategory ? 'Uredi podkategoriju' : 'Nova podkategorija'}
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-lg">
            <X className="w-5 h-5 text-muted" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm text-muted mb-1">Kategorija *</label>
            <select
              value={formData.categoryId}
              onChange={e => setFormData({...formData, categoryId: e.target.value})}
              className="w-full bg-background border border-white/10 rounded-xl px-4 py-2.5 text-text focus:outline-none focus:border-primary"
              required
            >
              <option value="">Odaberi kategoriju</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-muted mb-1">Naziv podkategorije *</label>
            <input
              type="text"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              placeholder="npr. Unutrašnje kamere"
              className="w-full bg-background border border-white/10 rounded-xl px-4 py-2.5 text-text focus:outline-none focus:border-primary"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-muted mb-1">Slug (URL)</label>
            <input
              type="text"
              value={formData.slug}
              onChange={e => setFormData({...formData, slug: e.target.value})}
              placeholder="unutrasnje-kamere"
              className="w-full bg-background border border-white/10 rounded-xl px-4 py-2.5 text-text focus:outline-none focus:border-primary"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 border border-white/10 rounded-xl text-text hover:bg-white/5 transition-colors">
              Odustani
            </button>
            <button type="submit" disabled={saving} className="flex-1 px-4 py-2.5 bg-accent text-white rounded-xl hover:bg-accent/90 transition-colors disabled:opacity-50">
              {saving ? 'Spremanje...' : 'Spremi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}


// Product Views Analytics Component
function ProductViewsAnalytics({ 
  productViews, 
  products 
}: { 
  productViews: ProductView[]
  products: Product[]
}) {
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null)
  const [viewPeriod, setViewPeriod] = useState<'today' | 'week' | 'month' | 'all'>('all')

  // Calculate views per product
  const viewsByProduct = useMemo(() => {
    const grouped: Record<string, { productId: string, productName: string, views: ProductView[], totalViews: number }> = {}
    
    productViews.forEach(view => {
      if (!grouped[view.productId]) {
        grouped[view.productId] = {
          productId: view.productId,
          productName: view.productName,
          views: [],
          totalViews: 0
        }
      }
      grouped[view.productId].views.push(view)
      grouped[view.productId].totalViews++
    })
    
    return Object.values(grouped).sort((a, b) => b.totalViews - a.totalViews)
  }, [productViews])

  // Filter views by period
  const filterViewsByPeriod = (views: ProductView[]) => {
    const now = new Date()
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const startOfWeek = new Date(now)
    startOfWeek.setDate(now.getDate() - 7)
    const startOfMonth = new Date(now)
    startOfMonth.setDate(now.getDate() - 30)

    return views.filter(view => {
      const viewDate = toDate(view.viewedAt)
      if (!viewDate) return false
      
      switch (viewPeriod) {
        case 'today':
          return viewDate >= startOfToday
        case 'week':
          return viewDate >= startOfWeek
        case 'month':
          return viewDate >= startOfMonth
        default:
          return true
      }
    })
  }

  // Get selected product views
  const selectedProductViews = selectedProductId 
    ? filterViewsByPeriod(viewsByProduct.find(p => p.productId === selectedProductId)?.views || [])
    : []

  // Group views by date for the selected product
  const viewsByDate = useMemo(() => {
    const grouped: Record<string, { date: string, count: number, views: ProductView[] }> = {}
    
    selectedProductViews.forEach(view => {
      const viewDate = toDate(view.viewedAt)
      if (!viewDate) return
      
      const dateKey = viewDate.toLocaleDateString('bs-BA', { day: 'numeric', month: 'short', year: 'numeric' })
      
      if (!grouped[dateKey]) {
        grouped[dateKey] = { date: dateKey, count: 0, views: [] }
      }
      grouped[dateKey].count++
      grouped[dateKey].views.push(view)
    })
    
    return Object.values(grouped).sort((a, b) => {
      const dateA = toDate(a.views[0]?.viewedAt) || new Date(0)
      const dateB = toDate(b.views[0]?.viewedAt) || new Date(0)
      return dateB.getTime() - dateA.getTime()
    })
  }, [selectedProductViews])

  const selectedProduct = products.find(p => p.id === selectedProductId)

  return (
    <div className="bg-surface rounded-xl p-4 border border-white/5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Eye className="w-5 h-5 text-primary" />
          <h3 className="text-sm font-semibold text-text">Pregledi proizvoda</h3>
        </div>
        <span className="text-xs text-muted">{productViews.length} ukupno pregleda</span>
      </div>

      {viewsByProduct.length === 0 ? (
        <p className="text-sm text-muted text-center py-8">Nema podataka o pregledima</p>
      ) : (
        <div className="space-y-4">
          {/* Product Selector */}
          <div className="flex flex-col sm:flex-row gap-2">
            <select
              value={selectedProductId || ''}
              onChange={(e) => setSelectedProductId(e.target.value || null)}
              className="flex-1 bg-background border border-white/10 rounded-lg px-3 py-2 text-sm text-text focus:outline-none focus:border-primary"
            >
              <option value="">Odaberi proizvod za detalje</option>
              {viewsByProduct.map(item => (
                <option key={item.productId} value={item.productId}>
                  {item.productName} ({item.totalViews} pregleda)
                </option>
              ))}
            </select>
            
            <select
              value={viewPeriod}
              onChange={(e) => setViewPeriod(e.target.value as typeof viewPeriod)}
              className="bg-background border border-white/10 rounded-lg px-3 py-2 text-sm text-text focus:outline-none focus:border-primary"
            >
              <option value="all">Svi pregledi</option>
              <option value="today">Danas</option>
              <option value="week">Zadnjih 7 dana</option>
              <option value="month">Zadnjih 30 dana</option>
            </select>
          </div>

          {/* Top Viewed Products List */}
          {!selectedProductId && (
            <div className="space-y-2">
              <h4 className="text-xs text-muted font-medium">Najpregledaniji proizvodi</h4>
              {viewsByProduct.slice(0, 10).map((item, idx) => {
                const product = products.find(p => p.id === item.productId)
                return (
                  <button
                    key={item.productId}
                    onClick={() => setSelectedProductId(item.productId)}
                    className="w-full flex items-center gap-3 p-2 bg-background rounded-lg hover:bg-white/5 transition-colors text-left"
                  >
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      idx === 0 ? 'bg-yellow-500/20 text-yellow-500' :
                      idx === 1 ? 'bg-gray-400/20 text-gray-400' :
                      idx === 2 ? 'bg-orange-600/20 text-orange-600' :
                      'bg-white/10 text-muted'
                    }`}>
                      {idx + 1}
                    </span>
                    <div className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                      {product?.image?.startsWith('data:') || product?.image?.startsWith('http') ? (
                        <img src={product.image} alt={item.productName} className="w-full h-full object-cover" />
                      ) : (
                        <Package className="w-4 h-4 text-muted" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-text truncate">{item.productName}</p>
                    </div>
                    <div className="flex items-center gap-1 text-primary">
                      <Eye className="w-3 h-3" />
                      <span className="text-sm font-medium">{item.totalViews}</span>
                    </div>
                  </button>
                )
              })}
            </div>
          )}

          {/* Selected Product Details */}
          {selectedProductId && (
            <div className="space-y-4">
              {/* Product Header */}
              <div className="flex items-center gap-3 p-3 bg-primary/10 rounded-lg">
                <div className="w-12 h-12 bg-white/5 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                  {selectedProduct?.image?.startsWith('data:') || selectedProduct?.image?.startsWith('http') ? (
                    <img src={selectedProduct.image} alt={selectedProduct?.name} className="w-full h-full object-cover" />
                  ) : (
                    <Package className="w-6 h-6 text-muted" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text truncate">{selectedProduct?.name}</p>
                  <p className="text-xs text-muted">{selectedProductViews.length} pregleda ({viewPeriod === 'all' ? 'ukupno' : viewPeriod === 'today' ? 'danas' : viewPeriod === 'week' ? 'zadnjih 7 dana' : 'zadnjih 30 dana'})</p>
                </div>
                <button
                  onClick={() => setSelectedProductId(null)}
                  className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4 text-muted" />
                </button>
              </div>

              {/* Views by Date */}
              {viewsByDate.length === 0 ? (
                <p className="text-sm text-muted text-center py-4">Nema pregleda u odabranom periodu</p>
              ) : (
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {viewsByDate.map(dateGroup => (
                    <div key={dateGroup.date} className="bg-background rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-text">{dateGroup.date}</span>
                        <span className="text-xs text-primary bg-primary/10 px-2 py-0.5 rounded-full">{dateGroup.count} pregleda</span>
                      </div>
                      <div className="space-y-1">
                        {dateGroup.views.slice(0, 10).map((view, idx) => {
                          const viewTime = toDate(view.viewedAt)
                          return (
                            <div key={view.id || idx} className="flex items-center justify-between text-xs text-muted py-1 border-b border-white/5 last:border-0">
                              <span>{viewTime?.toLocaleTimeString('bs-BA', { hour: '2-digit', minute: '2-digit' })}</span>
                              <span className="truncate max-w-[150px]" title={view.userAgent}>
                                {view.userAgent?.includes('Mobile') ? '📱 Mobitel' : '💻 Desktop'}
                              </span>
                            </div>
                          )
                        })}
                        {dateGroup.views.length > 10 && (
                          <p className="text-[10px] text-muted text-center pt-1">+ još {dateGroup.views.length - 10} pregleda</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
