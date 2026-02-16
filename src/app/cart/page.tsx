'use client'

import { Trash2, Plus, Minus, ShoppingBag, ShoppingCart } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCartStore } from '@/store/cartStore'

const isImageUrl = (str: string) => str?.startsWith('http') || str?.startsWith('/') || str?.startsWith('data:')

export default function CartPage() {
  const router = useRouter()
  const { items, removeFromCart, updateQuantity, clearCart, getTotalPrice } = useCartStore()

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
        <div className="w-24 h-24 bg-surface rounded-2xl flex items-center justify-center mb-6 border border-white/5">
          <ShoppingBag className="w-12 h-12 text-muted" />
        </div>
        <h2 className="text-xl font-bold text-text mb-2">Vaša korpa je prazna</h2>
        <p className="text-muted text-center mb-6 max-w-xs">
          Izgleda da još niste dodali ništa u korpu. Istražite naše proizvode!
        </p>
        <Link
          href="/"
          className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-xl font-medium transition-all hover:shadow-lg hover:shadow-primary/25"
        >
          Počni kupovinu
        </Link>
      </div>
    )
  }

  return (
    <div className="px-4 py-6 lg:px-8 lg:max-w-4xl lg:mx-auto">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg shadow-primary/25">
            <ShoppingCart className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg lg:text-xl font-bold text-text">Korpa</h1>
            <p className="text-xs text-muted">{items.length} {items.length === 1 ? 'proizvod' : 'proizvoda'}</p>
          </div>
        </div>
        <button
          onClick={clearCart}
          className="text-sm text-danger hover:bg-danger/10 px-3 py-1.5 rounded-lg transition-colors"
        >
          Isprazni
        </button>
      </div>

      {/* Cart Items */}
      <div className="space-y-3 mb-6">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex gap-4 bg-surface p-4 rounded-2xl border border-white/5"
          >
            <div className="w-20 h-20 lg:w-24 lg:h-24 bg-white/5 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden">
              {isImageUrl(item.image) ? (
                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-3xl">{item.image || '📦'}</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-medium text-text line-clamp-2 mb-1">{item.name}</h3>
              <p className="text-primary font-bold text-lg">{item.price.toFixed(2)} KM</p>
              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center gap-1 bg-white/5 rounded-xl p-1">
                  <button
                    onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                    className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors text-text"
                    aria-label="Smanji količinu"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-8 text-center text-sm font-medium text-text">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors text-text"
                    aria-label="Povećaj količinu"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <button
                  onClick={() => removeFromCart(item.id)}
                  className="p-2.5 text-danger hover:bg-danger/10 rounded-xl transition-colors"
                  aria-label="Ukloni proizvod"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Order Summary */}
      <div className="bg-surface rounded-2xl p-5 mb-6 border border-white/5">
        <h3 className="font-semibold text-text mb-4">Pregled narudžbe</h3>
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted">Međuzbir</span>
            <span className="text-text font-medium">{getTotalPrice().toFixed(2)} KM</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted">Dostava</span>
            <span className="text-accent font-medium">Besplatna</span>
          </div>
          <div className="border-t border-white/10 pt-3 mt-3">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-text">Ukupno</span>
              <span className="font-bold text-primary text-xl">
                {getTotalPrice().toFixed(2)} KM
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Checkout Button */}
      <button 
        onClick={() => router.push('/checkout/cart')}
        className="w-full bg-primary hover:bg-primary/90 text-white py-4 rounded-xl font-semibold transition-all hover:shadow-lg hover:shadow-primary/25 flex items-center justify-center gap-2"
      >
        <ShoppingBag className="w-5 h-5" />
        Nastavi na plaćanje
      </button>
    </div>
  )
}
