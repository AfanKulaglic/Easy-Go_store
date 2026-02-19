'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  User, Mail, Phone, MapPin, Globe, Edit3, Save, X, LogOut, Package, Shield,
  ChevronRight, Camera, Clock, ShoppingBag, Truck, CheckCircle, XCircle,
  Settings, CreditCard, Heart, ArrowLeft, Smartphone, Bell
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { getOrdersByUserId, Order } from '@/lib/realtimeProducts'
import DarkModeToggle from '@/components/DarkModeToggle'

export default function ProfilePage() {
  const { user, userProfile, logout, updateUserProfile, loading } = useAuth()
  const router = useRouter()
  const [editMode, setEditMode] = useState(false)
  const [editData, setEditData] = useState({
    displayName: '',
    phone: '',
    address: '',
    city: '',
  })
  const [saving, setSaving] = useState(false)
  const [orders, setOrders] = useState<Order[]>([])
  const [ordersLoading, setOrdersLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'settings'>('overview')

  // Load user orders
  useEffect(() => {
    if (user) {
      getOrdersByUserId(user.uid).then(o => {
        setOrders(o)
        setOrdersLoading(false)
      }).catch(() => setOrdersLoading(false))
    } else {
      setOrdersLoading(false)
    }
  }, [user])

  const startEdit = () => {
    setEditData({
      displayName: userProfile?.displayName || '',
      phone: userProfile?.phone || '',
      address: userProfile?.address || '',
      city: userProfile?.city || '',
    })
    setEditMode(true)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await updateUserProfile(editData)
      setEditMode(false)
    } catch (e) {
      console.error('Error updating profile:', e)
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = async () => {
    await logout()
    router.push('/')
  }

  // Stats
  const totalOrders = orders.length
  const deliveredOrders = orders.filter(o => o.status === 'delivered').length
  const totalSpent = orders.filter(o => o.status !== 'cancelled').reduce((sum, o) => sum + o.totalPrice, 0)
  const recentOrders = orders.slice(0, 3)

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'new': return { label: 'Nova', color: 'text-blue-400', bg: 'bg-blue-500/10', icon: Clock }
      case 'processing': return { label: 'U obradi', color: 'text-yellow-400', bg: 'bg-yellow-500/10', icon: Package }
      case 'shipped': return { label: 'Poslano', color: 'text-purple-400', bg: 'bg-purple-500/10', icon: Truck }
      case 'delivered': return { label: 'Dostavljeno', color: 'text-accent', bg: 'bg-accent/10', icon: CheckCircle }
      case 'cancelled': return { label: 'Otkazano', color: 'text-danger', bg: 'bg-danger/10', icon: XCircle }
      default: return { label: status, color: 'text-muted', bg: 'bg-white/5', icon: Package }
    }
  }

  const memberSince = userProfile?.createdAt
    ? new Date(userProfile.createdAt).toLocaleDateString('bs-BA', { year: 'numeric', month: 'long' })
    : ''

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <User className="w-10 h-10 text-primary" />
        </div>
        <h1 className="text-xl font-bold text-text mb-2">Niste prijavljeni</h1>
        <p className="text-muted text-sm mb-6">Prijavite se da pristupite svom profilu.</p>
        <Link
          href="/auth/login"
          className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-xl font-medium transition-all"
        >
          Prijavi se
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 lg:px-8 pb-24 lg:pb-8">
      {/* Profile Header / Hero */}
      <div className="relative rounded-2xl overflow-hidden mb-6">
        {/* Gradient background */}
        <div className="h-32 lg:h-40 bg-gradient-to-br from-primary via-blue-600 to-indigo-700 relative">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djZoNnYtNmgtNnptMC0zMHY2aDZ2LTZoLTZ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-50" />
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-2xl" />
          <div className="absolute -top-10 -left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
        </div>

        {/* Profile info overlay */}
        <div className="bg-surface border border-white/5 px-4 lg:px-6 pb-5 pt-14 lg:pt-16 relative">
          {/* Avatar */}
          <div className="absolute -top-10 lg:-top-12 left-4 lg:left-6">
            {user.photoURL ? (
              <img
                src={user.photoURL}
                alt=""
                className="w-20 h-20 lg:w-24 lg:h-24 rounded-2xl object-cover border-4 border-surface shadow-xl"
              />
            ) : (
              <div className="w-20 h-20 lg:w-24 lg:h-24 rounded-2xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center border-4 border-surface shadow-xl">
                <span className="text-3xl lg:text-4xl font-bold text-white">
                  {(userProfile?.displayName || user.email || '?')[0].toUpperCase()}
                </span>
              </div>
            )}
          </div>

          {/* Edit button */}
          <div className="absolute top-3 right-4 lg:right-6">
            {!editMode && (
              <button
                onClick={startEdit}
                className="flex items-center gap-1.5 bg-primary/10 hover:bg-primary/20 text-primary px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
              >
                <Edit3 className="w-3.5 h-3.5" />
                Uredi profil
              </button>
            )}
          </div>

          {/* Name & email */}
          <div className="mb-4">
            <h1 className="text-xl lg:text-2xl font-bold text-text">
              {userProfile?.displayName || 'Korisnik'}
            </h1>
            <p className="text-sm text-muted">{user.email}</p>
            {memberSince && (
              <p className="text-xs text-muted/60 mt-1 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Član od {memberSince}
              </p>
            )}
          </div>

          {/* Quick info pills */}
          <div className="flex flex-wrap gap-2">
            {userProfile?.phone && (
              <span className="inline-flex items-center gap-1.5 bg-white/5 text-muted text-xs px-3 py-1.5 rounded-lg border border-white/5">
                <Phone className="w-3 h-3" /> {userProfile.phone}
              </span>
            )}
            {userProfile?.city && (
              <span className="inline-flex items-center gap-1.5 bg-white/5 text-muted text-xs px-3 py-1.5 rounded-lg border border-white/5">
                <MapPin className="w-3 h-3" /> {userProfile.city}
              </span>
            )}
            {userProfile?.address && (
              <span className="inline-flex items-center gap-1.5 bg-white/5 text-muted text-xs px-3 py-1.5 rounded-lg border border-white/5">
                <Globe className="w-3 h-3" /> {userProfile.address}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-surface rounded-xl p-4 border border-white/5 text-center">
          <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center mx-auto mb-2">
            <ShoppingBag className="w-5 h-5 text-blue-400" />
          </div>
          <p className="text-lg lg:text-xl font-bold text-text">{totalOrders}</p>
          <p className="text-[11px] text-muted">Narudžbe</p>
        </div>
        <div className="bg-surface rounded-xl p-4 border border-white/5 text-center">
          <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center mx-auto mb-2">
            <CheckCircle className="w-5 h-5 text-accent" />
          </div>
          <p className="text-lg lg:text-xl font-bold text-text">{deliveredOrders}</p>
          <p className="text-[11px] text-muted">Dostavljeno</p>
        </div>
        <div className="bg-surface rounded-xl p-4 border border-white/5 text-center">
          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-2">
            <CreditCard className="w-5 h-5 text-primary" />
          </div>
          <p className="text-lg lg:text-xl font-bold text-text">{totalSpent.toFixed(0)}</p>
          <p className="text-[11px] text-muted">KM potrošeno</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex bg-surface rounded-xl p-1 mb-6 border border-white/5">
        {[
          { key: 'overview' as const, label: 'Pregled', icon: User },
          { key: 'orders' as const, label: 'Narudžbe', icon: Package },
          { key: 'settings' as const, label: 'Postavke', icon: Settings },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.key
                ? 'bg-primary text-white shadow-lg shadow-primary/20'
                : 'text-muted hover:text-text'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-4">
          {/* Edit Form */}
          {editMode && (
            <div className="bg-surface rounded-2xl p-5 border border-white/5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-text flex items-center gap-2">
                  <Edit3 className="w-4 h-4 text-primary" />
                  Uredi profil
                </h3>
                <button onClick={() => setEditMode(false)} className="p-1.5 rounded-lg hover:bg-white/5 transition-colors">
                  <X className="w-4 h-4 text-muted" />
                </button>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-muted mb-1 block">Ime i prezime</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                    <input
                      type="text"
                      value={editData.displayName}
                      onChange={e => setEditData({ ...editData, displayName: e.target.value })}
                      className="w-full bg-background border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-text focus:outline-none focus:border-primary transition-colors"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-muted mb-1 block">Telefon</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                    <input
                      type="tel"
                      value={editData.phone}
                      onChange={e => setEditData({ ...editData, phone: e.target.value })}
                      placeholder="+387 XX XXX XXX"
                      className="w-full bg-background border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-text placeholder:text-muted focus:outline-none focus:border-primary transition-colors"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-muted mb-1 block">Adresa</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                    <input
                      type="text"
                      value={editData.address}
                      onChange={e => setEditData({ ...editData, address: e.target.value })}
                      placeholder="Ulica i broj"
                      className="w-full bg-background border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-text placeholder:text-muted focus:outline-none focus:border-primary transition-colors"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-muted mb-1 block">Grad</label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                    <input
                      type="text"
                      value={editData.city}
                      onChange={e => setEditData({ ...editData, city: e.target.value })}
                      placeholder="Vaš grad"
                      className="w-full bg-background border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-text placeholder:text-muted focus:outline-none focus:border-primary transition-colors"
                    />
                  </div>
                </div>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full bg-primary hover:bg-primary/90 text-white py-2.5 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {saving ? 'Sprema se...' : (
                    <>
                      <Save className="w-4 h-4" />
                      Spremi promjene
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Personal Information */}
          {!editMode && (
            <div className="bg-surface rounded-2xl border border-white/5 overflow-hidden">
              <div className="p-4 border-b border-white/5">
                <h3 className="text-sm font-semibold text-text flex items-center gap-2">
                  <User className="w-4 h-4 text-primary" />
                  Lični podaci
                </h3>
              </div>
              <div className="divide-y divide-white/5">
                <div className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center">
                      <User className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted">Ime i prezime</p>
                      <p className="text-sm text-text font-medium">{userProfile?.displayName || '—'}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-blue-500/10 rounded-lg flex items-center justify-center">
                      <Mail className="w-4 h-4 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-xs text-muted">Email</p>
                      <p className="text-sm text-text font-medium">{user.email || '—'}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-accent/10 rounded-lg flex items-center justify-center">
                      <Phone className="w-4 h-4 text-accent" />
                    </div>
                    <div>
                      <p className="text-xs text-muted">Telefon</p>
                      <p className="text-sm text-text font-medium">{userProfile?.phone || 'Nije uneseno'}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-purple-500/10 rounded-lg flex items-center justify-center">
                      <MapPin className="w-4 h-4 text-purple-400" />
                    </div>
                    <div>
                      <p className="text-xs text-muted">Adresa</p>
                      <p className="text-sm text-text font-medium">{userProfile?.address || 'Nije uneseno'}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-orange-500/10 rounded-lg flex items-center justify-center">
                      <Globe className="w-4 h-4 text-orange-400" />
                    </div>
                    <div>
                      <p className="text-xs text-muted">Grad</p>
                      <p className="text-sm text-text font-medium">{userProfile?.city || 'Nije uneseno'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Recent Orders */}
          <div className="bg-surface rounded-2xl border border-white/5 overflow-hidden">
            <div className="p-4 border-b border-white/5 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-text flex items-center gap-2">
                <Package className="w-4 h-4 text-primary" />
                Nedavne narudžbe
              </h3>
              {orders.length > 3 && (
                <button
                  onClick={() => setActiveTab('orders')}
                  className="text-xs text-primary font-medium hover:underline"
                >
                  Vidi sve
                </button>
              )}
            </div>
            {ordersLoading ? (
              <div className="p-8 flex justify-center">
                <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
              </div>
            ) : recentOrders.length === 0 ? (
              <div className="p-8 text-center">
                <ShoppingBag className="w-10 h-10 text-muted/30 mx-auto mb-3" />
                <p className="text-sm text-muted">Nemate narudžbi</p>
                <Link href="/products" className="text-xs text-primary font-medium hover:underline mt-1 inline-block">
                  Počnite kupovinu
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {recentOrders.map(order => {
                  const status = getStatusConfig(order.status)
                  const StatusIcon = status.icon
                  return (
                    <div key={order.id} className="p-4 hover:bg-white/[0.02] transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className={`w-7 h-7 rounded-lg ${status.bg} flex items-center justify-center`}>
                            <StatusIcon className={`w-3.5 h-3.5 ${status.color}`} />
                          </div>
                          <span className={`text-xs font-medium ${status.color}`}>{status.label}</span>
                        </div>
                        <span className="text-xs text-muted">
                          {new Date(order.createdAt).toLocaleDateString('bs-BA')}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-text truncate max-w-[200px]">
                          {order.items.map(i => i.productName).join(', ')}
                        </p>
                        <span className="text-sm font-semibold text-text">{order.totalPrice.toFixed(2)} KM</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Quick Links */}
          <div className="bg-surface rounded-2xl border border-white/5 overflow-hidden">
            <div className="p-4 border-b border-white/5">
              <h3 className="text-sm font-semibold text-text flex items-center gap-2">
                <ChevronRight className="w-4 h-4 text-primary" />
                Brzi linkovi
              </h3>
            </div>
            <div className="divide-y divide-white/5">
              <Link href="/tracking" className="flex items-center justify-between p-4 hover:bg-white/[0.02] transition-colors group">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-blue-500/10 rounded-lg flex items-center justify-center">
                    <Truck className="w-4 h-4 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm text-text font-medium">Praćenje narudžbi</p>
                    <p className="text-xs text-muted">Pratite status svojih narudžbi</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-muted group-hover:text-text transition-colors" />
              </Link>
              <Link href="/contact" className="flex items-center justify-between p-4 hover:bg-white/[0.02] transition-colors group">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-accent/10 rounded-lg flex items-center justify-center">
                    <Phone className="w-4 h-4 text-accent" />
                  </div>
                  <div>
                    <p className="text-sm text-text font-medium">Kontakt</p>
                    <p className="text-xs text-muted">Javite nam se za pomoć</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-muted group-hover:text-text transition-colors" />
              </Link>
              <Link href="/reklamacije" className="flex items-center justify-between p-4 hover:bg-white/[0.02] transition-colors group">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-yellow-500/10 rounded-lg flex items-center justify-center">
                    <Shield className="w-4 h-4 text-yellow-400" />
                  </div>
                  <div>
                    <p className="text-sm text-text font-medium">Reklamacije</p>
                    <p className="text-xs text-muted">Podnesite zahtjev za reklamaciju</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-muted group-hover:text-text transition-colors" />
              </Link>
              <Link href="/garancija" className="flex items-center justify-between p-4 hover:bg-white/[0.02] transition-colors group">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-purple-500/10 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-sm text-text font-medium">Garancija</p>
                    <p className="text-xs text-muted">Informacije o garanciji</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-muted group-hover:text-text transition-colors" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Orders Tab */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {ordersLoading ? (
            <div className="bg-surface rounded-2xl p-8 flex justify-center border border-white/5">
              <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
            </div>
          ) : orders.length === 0 ? (
            <div className="bg-surface rounded-2xl p-12 text-center border border-white/5">
              <ShoppingBag className="w-14 h-14 text-muted/20 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-text mb-1">Nema narudžbi</h3>
              <p className="text-sm text-muted mb-4">Još uvijek nemate nijednu narudžbu.</p>
              <Link
                href="/products"
                className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-all"
              >
                <ShoppingBag className="w-4 h-4" />
                Počnite kupovinu
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map(order => {
                const status = getStatusConfig(order.status)
                const StatusIcon = status.icon
                return (
                  <div key={order.id} className="bg-surface rounded-2xl border border-white/5 overflow-hidden">
                    <div className="p-4">
                      {/* Order header */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className={`w-8 h-8 rounded-lg ${status.bg} flex items-center justify-center`}>
                            <StatusIcon className={`w-4 h-4 ${status.color}`} />
                          </div>
                          <div>
                            <span className={`text-xs font-semibold ${status.color}`}>{status.label}</span>
                            <p className="text-[11px] text-muted">
                              {new Date(order.createdAt).toLocaleDateString('bs-BA', {
                                day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                              })}
                            </p>
                          </div>
                        </div>
                        <span className="text-base font-bold text-text">{order.totalPrice.toFixed(2)} KM</span>
                      </div>

                      {/* Order items */}
                      <div className="space-y-2">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex items-center gap-3 bg-white/[0.02] rounded-xl p-2.5">
                            {item.productImage && (
                              <img src={item.productImage} alt="" className="w-10 h-10 rounded-lg object-cover bg-white/5" />
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-text truncate">{item.productName}</p>
                              {item.selectedVariants && (
                                <p className="text-[11px] text-muted">{item.selectedVariants}</p>
                              )}
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium text-text">{item.price.toFixed(2)} KM</p>
                              <p className="text-[11px] text-muted">x{item.quantity}</p>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Tracking note */}
                      {order.trackingNote && (
                        <div className="mt-3 bg-primary/5 border border-primary/10 rounded-xl p-3">
                          <p className="text-xs text-primary flex items-center gap-1.5">
                            <Truck className="w-3.5 h-3.5" />
                            {order.trackingNote}
                          </p>
                        </div>
                      )}

                      {/* Delivery info */}
                      <div className="mt-3 pt-3 border-t border-white/5 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-muted">
                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {order.customerAddress}, {order.customerCity}</span>
                        <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {order.customerPhone}</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div className="space-y-4">
          {/* Dark Mode */}
          <DarkModeToggle />

          {/* Account Security */}
          <div className="bg-surface rounded-2xl border border-white/5 overflow-hidden">
            <div className="p-4 border-b border-white/5">
              <h3 className="text-sm font-semibold text-text flex items-center gap-2">
                <Shield className="w-4 h-4 text-primary" />
                Račun i sigurnost
              </h3>
            </div>
            <div className="divide-y divide-white/5">
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Mail className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-text font-medium">Email</p>
                    <p className="text-xs text-muted">{user.email}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-accent/10 rounded-lg flex items-center justify-center">
                    <Shield className="w-4 h-4 text-accent" />
                  </div>
                  <div>
                    <p className="text-sm text-text font-medium">Način prijave</p>
                    <p className="text-xs text-muted">
                      {user.providerData?.[0]?.providerId === 'google.com' ? 'Google račun' : 'Email i lozinka'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* App Info */}
          <div className="bg-surface rounded-2xl border border-white/5 overflow-hidden">
            <div className="p-4 border-b border-white/5">
              <h3 className="text-sm font-semibold text-text flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-primary" />
                Aplikacija
              </h3>
            </div>
            <div className="divide-y divide-white/5">
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-blue-500/10 rounded-lg flex items-center justify-center">
                    <Smartphone className="w-4 h-4 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm text-text font-medium">EasyGo App</p>
                    <p className="text-xs text-muted">Verzija 1.0.0</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-accent/10 rounded-lg flex items-center justify-center">
                    <Globe className="w-4 h-4 text-accent" />
                  </div>
                  <div>
                    <p className="text-sm text-text font-medium">Region</p>
                    <p className="text-xs text-muted">Bosna i Hercegovina</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Legal */}
          <div className="bg-surface rounded-2xl border border-white/5 overflow-hidden">
            <div className="divide-y divide-white/5">
              <Link href="/terms" className="flex items-center justify-between p-4 hover:bg-white/[0.02] transition-colors group">
                <span className="text-sm text-text">Uslovi korištenja</span>
                <ChevronRight className="w-4 h-4 text-muted group-hover:text-text transition-colors" />
              </Link>
              <Link href="/privacy" className="flex items-center justify-between p-4 hover:bg-white/[0.02] transition-colors group">
                <span className="text-sm text-text">Politika privatnosti</span>
                <ChevronRight className="w-4 h-4 text-muted group-hover:text-text transition-colors" />
              </Link>
              <Link href="/reklamacije" className="flex items-center justify-between p-4 hover:bg-white/[0.02] transition-colors group">
                <span className="text-sm text-text">Reklamacije</span>
                <ChevronRight className="w-4 h-4 text-muted group-hover:text-text transition-colors" />
              </Link>
            </div>
          </div>

          {/* Sign Out */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full p-4 bg-surface rounded-2xl hover:bg-danger/5 transition-colors border border-white/5"
          >
            <div className="w-9 h-9 bg-danger/10 rounded-xl flex items-center justify-center">
              <LogOut className="w-4 h-4 text-danger" />
            </div>
            <div className="text-left">
              <span className="text-sm text-danger font-medium block">Odjava</span>
              <span className="text-[11px] text-muted">Odjavite se sa svog računa</span>
            </div>
          </button>
        </div>
      )}
    </div>
  )
}
