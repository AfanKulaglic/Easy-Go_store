'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  ChevronLeft, ChevronDown, Package, Truck, CheckCircle, Clock,
  XCircle, MapPin, ShoppingBag, LogIn, Phone, Mail, User, FileText, Clipboard
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { Order, subscribeToUserOrders, subscribeToGuestOrders, getGuestDeviceId, updateOrder } from '@/lib/realtimeProducts'

const statusSteps = [
  { key: 'new', label: 'Primljena', description: 'Narudžba je zaprimljena', icon: ShoppingBag, emoji: '🛒' },
  { key: 'processing', label: 'U obradi', description: 'Pripremamo vaš paket', icon: Clock, emoji: '⏳' },
  { key: 'shipped', label: 'Poslano', description: 'Paket je na putu', icon: Truck, emoji: '🚚' },
  { key: 'delivered', label: 'Dostavljeno', description: 'Uspješno dostavljeno', icon: CheckCircle, emoji: '✅' },
] as const

const statusConfig: Record<string, { color: string; bg: string; border: string; label: string; icon: typeof Package }> = {
  new: { color: 'text-primary', bg: 'bg-primary/10', border: 'border-primary/20', label: 'Narudžba primljena', icon: ShoppingBag },
  processing: { color: 'text-yellow-500', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20', label: 'U obradi', icon: Clock },
  shipped: { color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/20', label: 'Poslano', icon: Truck },
  delivered: { color: 'text-green-500', bg: 'bg-green-500/10', border: 'border-green-500/20', label: 'Dostavljeno', icon: CheckCircle },
  cancelled: { color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/20', label: 'Otkazano', icon: XCircle },
}

function getStepIndex(status: string): number {
  const idx = statusSteps.findIndex(s => s.key === status)
  return idx >= 0 ? idx : -1
}

function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString('sr-Latn-BA', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString('sr-Latn-BA', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatShortDate(ts: number): string {
  return new Date(ts).toLocaleDateString('sr-Latn-BA', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function GuestOrderCard({ order }: { order: Order }) {
  const [cancelling, setCancelling] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const config = statusConfig[order.status] || statusConfig.new
  const StatusIcon = config.icon
  const currentStep = getStepIndex(order.status)
  const canCancel = order.status === 'new'
  const isCancelled = order.status === 'cancelled'

  const handleCancel = async () => {
    if (!order.id) return
    setCancelling(true)
    try {
      await updateOrder(order.id, { status: 'cancelled' })
    } catch (e) {
      console.error('Failed to cancel order:', e)
    } finally {
      setCancelling(false)
      setShowConfirm(false)
    }
  }

  return (
    <div className="bg-surface border border-white/5 rounded-2xl overflow-hidden">
      {/* Status bar */}
      <div className={`px-4 py-2.5 flex items-center justify-between ${config.bg} border-b ${config.border}`}>
        <div className="flex items-center gap-2">
          <StatusIcon className={`w-4 h-4 ${config.color}`} />
          <span className={`text-xs font-semibold ${config.color}`}>{config.label}</span>
        </div>
        <span className="text-[10px] text-muted">{formatShortDate(order.createdAt)}</span>
      </div>

      {/* Simple status progress */}
      {!isCancelled && (
        <div className="px-4 pt-3 pb-1">
          <div className="flex items-center gap-1">
            {statusSteps.map((step, i) => {
              const isCompleted = i <= currentStep
              const isCurrent = i === currentStep
              return (
                <div key={step.key} className="flex-1 flex flex-col items-center gap-1.5">
                  <div className={`w-full h-1.5 rounded-full ${
                    isCompleted ? 'bg-primary' : 'bg-white/10'
                  } ${isCurrent ? 'shadow-sm shadow-primary/40' : ''}`} />
                  <div className="flex items-center gap-1">
                    <step.icon className={`w-3 h-3 ${isCompleted ? 'text-primary' : 'text-muted/40'}`} />
                    <span className={`text-[9px] font-medium ${isCurrent ? 'text-primary' : isCompleted ? 'text-text' : 'text-muted/40'}`}>
                      {step.label}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Products list */}
      <div className="p-4 space-y-3">
        {order.items.map((item, i) => (
          <div key={i} className="flex items-center gap-3">
            {item.productImage ? (
              <img
                src={item.productImage}
                alt={item.productName}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover border border-white/5"
              />
            ) : (
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-white/5 flex items-center justify-center">
                <Package className="w-6 h-6 text-muted" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-text line-clamp-2">{item.productName}</p>
              {item.selectedVariants && (
                <span className="inline-block text-[10px] font-medium text-muted bg-white/5 px-2 py-0.5 rounded-md mt-1">
                  {item.selectedVariants}
                </span>
              )}
              <p className="text-xs text-muted mt-1">Količina: {item.quantity}</p>
            </div>
            <p className="text-sm font-bold text-primary flex-shrink-0">{(item.price * item.quantity).toFixed(2)} KM</p>
          </div>
        ))}
      </div>

      {/* Total + Cancel section */}
      <div className="px-4 pb-4 space-y-3">
        <div className="flex items-center justify-between pt-3 border-t border-white/5">
          <span className="text-xs text-muted">Ukupno</span>
          <span className="text-sm font-bold text-text">{order.totalPrice.toFixed(2)} KM</span>
        </div>

        {isCancelled ? (
          <div className="flex items-center gap-2 p-3 bg-red-500/5 border border-red-500/10 rounded-xl">
            <XCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
            <p className="text-xs text-red-400 font-medium">Ova narudžba je otkazana.</p>
          </div>
        ) : canCancel ? (
          !showConfirm ? (
            <>
              <button
                onClick={() => setShowConfirm(true)}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-red-500/10 text-red-400 text-sm font-medium rounded-xl border border-red-500/15 hover:bg-red-500/20 transition-colors"
              >
                <XCircle className="w-4 h-4" />
                Otkaži narudžbu
              </button>
              <p className="text-[10px] text-muted text-center mt-1.5">Narudžbu je moguće otkazati samo dok je u statusu &quot;Narudžba primljena&quot;.</p>
            </>
          ) : (
            <div className="p-3 bg-red-500/5 border border-red-500/10 rounded-xl space-y-2.5">
              <p className="text-xs text-text text-center">Da li ste sigurni da želite otkazati ovu narudžbu?</p>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowConfirm(false)}
                  className="flex-1 py-2 text-xs font-medium text-muted bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                >
                  Ne, zadrži
                </button>
                <button
                  onClick={handleCancel}
                  disabled={cancelling}
                  className="flex-1 py-2 text-xs font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
                >
                  {cancelling ? 'Otkazujem...' : 'Da, otkaži'}
                </button>
              </div>
            </div>
          )
        ) : (
          <p className="text-[10px] text-muted text-center">
            Otkazivanje nije moguće jer je narudžba već u statusu: {config.label.toLowerCase()}
          </p>
        )}
      </div>
    </div>
  )
}

function OrderCard({ order }: { order: Order }) {
  const [expanded, setExpanded] = useState(false)
  const [cancelling, setCancelling] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const config = statusConfig[order.status] || statusConfig.new
  const StatusIcon = config.icon
  const currentStep = getStepIndex(order.status)
  const isCancelled = order.status === 'cancelled'
  const isDelivered = order.status === 'delivered'
  const canCancel = order.status === 'new'
  const firstImage = order.items[0]?.productImage

  const handleCancel = async () => {
    if (!order.id) return
    setCancelling(true)
    try {
      await updateOrder(order.id, { status: 'cancelled' })
    } catch (e) {
      console.error('Failed to cancel order:', e)
    } finally {
      setCancelling(false)
      setShowConfirm(false)
    }
  }

  return (
    <div className={`bg-surface border rounded-2xl overflow-hidden transition-all duration-300 ${
      expanded ? 'border-white/10 shadow-lg shadow-black/20' : 'border-white/5 hover:border-white/10'
    }`}>
      {/* Card Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-4 flex items-start gap-3 text-left transition-colors"
      >
        {/* Product image thumbnail */}
        <div className="relative flex-shrink-0">
          {firstImage ? (
            <img
              src={firstImage}
              alt=""
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl object-cover border border-white/5"
            />
          ) : (
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-white/5 flex items-center justify-center">
              <Package className="w-6 h-6 text-muted" />
            </div>
          )}
          {/* Status badge on image */}
          <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full ${config.bg} border-2 border-surface flex items-center justify-center`}>
            <StatusIcon className={`w-3 h-3 ${config.color}`} />
          </div>
          {/* Multiple items indicator */}
          {order.items.length > 1 && (
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-primary rounded-full text-[10px] text-white font-bold flex items-center justify-center border-2 border-surface">
              {order.items.length}
            </div>
          )}
        </div>

        {/* Order info */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-text truncate mb-0.5">
            {order.items.length === 1
              ? order.items[0].productName
              : `${order.items[0].productName} +${order.items.length - 1}`
            }
          </p>
          <div className="flex items-center gap-1.5 mb-1.5">
            <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md ${config.bg} ${config.color}`}>
              {config.label}
            </span>
          </div>
          <p className="text-[11px] text-muted">{formatShortDate(order.createdAt)}</p>
        </div>

        {/* Price & expand */}
        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          <p className="text-sm font-bold text-text">{order.totalPrice.toFixed(2)} KM</p>
          <p className="text-[10px] text-muted">{order.items.reduce((a, i) => a + i.quantity, 0)} artikl(a)</p>
          <ChevronDown className={`w-4 h-4 text-muted transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {/* Expanded Content */}
      {expanded && (
        <div className="border-t border-white/5">
          {/* Status Timeline */}
          <div className="p-4 sm:p-5">
            {!isCancelled ? (
              <div className="relative pl-8 sm:pl-10 space-y-0">
                {statusSteps.map((step, i) => {
                  const isCompleted = i <= currentStep
                  const isCurrent = i === currentStep
                  const isLast = i === statusSteps.length - 1

                  return (
                    <div key={step.key} className="relative pb-6 last:pb-0">
                      {/* Vertical line */}
                      {!isLast && (
                        <div className={`absolute left-[-20px] sm:left-[-24px] top-8 bottom-0 w-0.5 ${
                          i < currentStep ? 'bg-primary' : 'bg-white/10'
                        }`} />
                      )}
                      {/* Circle */}
                      <div className={`absolute left-[-28px] sm:left-[-33px] top-0.5 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-all ${
                        isCompleted
                          ? isCurrent
                            ? 'bg-primary text-white shadow-lg shadow-primary/40 ring-4 ring-primary/20'
                            : 'bg-primary/20 text-primary'
                          : 'bg-white/5 text-muted border border-white/10'
                      }`}>
                        {isCompleted && !isCurrent ? (
                          <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        ) : (
                          <step.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        )}
                      </div>
                      {/* Content */}
                      <div>
                        <div className="flex items-center gap-2">
                          <p className={`text-sm font-medium ${isCompleted ? 'text-text' : 'text-muted'}`}>
                            {step.emoji} {step.label}
                          </p>
                          {isCurrent && (
                            <span className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
                            </span>
                          )}
                        </div>
                        <p className={`text-xs mt-0.5 ${isCompleted ? 'text-muted' : 'text-muted/50'}`}>
                          {step.description}
                        </p>
                        {isCurrent && order.updatedAt && (
                          <p className="text-[10px] text-muted/70 mt-1">
                            Ažurirano: {formatShortDate(order.updatedAt)}
                          </p>
                        )}
                        {i === 0 && (
                          <p className="text-[10px] text-muted/70 mt-1">
                            {formatDate(order.createdAt)} u {formatTime(order.createdAt)}
                          </p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="flex items-center gap-3 p-4 bg-red-500/5 border border-red-500/10 rounded-xl">
                <div className="w-10 h-10 bg-red-500/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <XCircle className="w-5 h-5 text-red-500" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-red-400">Narudžba je otkazana</p>
                  <p className="text-xs text-muted mt-0.5">Ova narudžba je otkazana i neće biti dostavljena.</p>
                </div>
              </div>
            )}
          </div>

          {/* Delivery Note from Admin */}
          {order.trackingNote && (
            <div className="mx-4 sm:mx-5 mb-4">
              <div className="relative p-4 bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/15 rounded-xl">
                <div className="absolute top-3 right-3">
                  <FileText className="w-4 h-4 text-blue-500/30" />
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-500/15 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Clipboard className="w-4 h-4 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-blue-400 uppercase tracking-wider mb-1">Napomena o dostavi</p>
                    <p className="text-sm text-text leading-relaxed">{order.trackingNote}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Products */}
          <div className="mx-4 sm:mx-5 mb-4">
            <p className="text-[11px] font-semibold text-muted uppercase tracking-wider mb-2">Naručeni proizvodi</p>
            <div className="space-y-2">
              {order.items.map((item, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-background rounded-xl border border-white/5">
                  {item.productImage ? (
                    <img
                      src={item.productImage}
                      alt={item.productName}
                      className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover border border-white/5"
                    />
                  ) : (
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-white/5 flex items-center justify-center">
                      <Package className="w-6 h-6 text-muted" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text mb-0.5 line-clamp-2">{item.productName}</p>
                    {item.selectedVariants && (
                      <span className="inline-block text-[10px] font-medium text-muted bg-white/5 px-2 py-0.5 rounded-md mb-1">
                        {item.selectedVariants}
                      </span>
                    )}
                    <div className="flex items-center gap-2 text-xs text-muted">
                      <span>Količina: {item.quantity}</span>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-bold text-primary">{(item.price * item.quantity).toFixed(2)} KM</p>
                    {item.quantity > 1 && (
                      <p className="text-[10px] text-muted">{item.price.toFixed(2)} KM/kom</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary & Details Grid */}
          <div className="mx-4 sm:mx-5 mb-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Delivery Address */}
            <div className="p-3 bg-background rounded-xl border border-white/5">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="w-3.5 h-3.5 text-primary" />
                <p className="text-[11px] font-semibold text-muted uppercase tracking-wider">Adresa dostave</p>
              </div>
              <p className="text-sm text-text">{order.customerName} {order.customerSurname}</p>
              <p className="text-xs text-muted mt-0.5">{order.customerAddress}</p>
              <p className="text-xs text-muted">{order.customerCity}</p>
            </div>

            {/* Contact Info */}
            <div className="p-3 bg-background rounded-xl border border-white/5">
              <div className="flex items-center gap-2 mb-2">
                <User className="w-3.5 h-3.5 text-primary" />
                <p className="text-[11px] font-semibold text-muted uppercase tracking-wider">Kontakt podaci</p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <Phone className="w-3 h-3 text-muted" />
                  <p className="text-xs text-text">{order.customerPhone}</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <Mail className="w-3 h-3 text-muted" />
                  <p className="text-xs text-text truncate">{order.customerEmail}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Price Summary */}
          <div className="mx-4 sm:mx-5 mb-4 p-3 bg-background rounded-xl border border-white/5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted">Ukupno proizvoda ({order.items.reduce((a, i) => a + i.quantity, 0)})</span>
              <span className="text-xs text-text">{order.totalPrice.toFixed(2)} KM</span>
            </div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted">Dostava</span>
              <span className="text-xs text-green-500 font-medium">Besplatna</span>
            </div>
            <div className="border-t border-white/5 pt-2 flex items-center justify-between">
              <span className="text-sm font-semibold text-text">Ukupno za platiti</span>
              <span className="text-sm font-bold text-primary">{order.totalPrice.toFixed(2)} KM</span>
            </div>
            <p className="text-[10px] text-muted mt-1">Plaćanje pouzećem</p>
          </div>

          {/* Cancel order button for logged-in users */}
          {canCancel && !isCancelled && (
            <div className="mx-4 sm:mx-5 mb-4">
              {!showConfirm ? (
                <>
                  <button
                    onClick={() => setShowConfirm(true)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 bg-red-500/10 text-red-400 text-sm font-medium rounded-xl border border-red-500/15 hover:bg-red-500/20 transition-colors"
                  >
                    <XCircle className="w-4 h-4" />
                    Otkaži narudžbu
                  </button>
                  <p className="text-[10px] text-muted text-center mt-1.5">Narudžbu je moguće otkazati samo dok je u statusu &quot;Narudžba primljena&quot;.</p>
                </>
              ) : (
                <div className="p-3 bg-red-500/5 border border-red-500/10 rounded-xl space-y-2.5">
                  <p className="text-xs text-text text-center">Da li ste sigurni da želite otkazati ovu narudžbu?</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowConfirm(false)}
                      className="flex-1 py-2 text-xs font-medium text-muted bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                    >
                      Ne, zadrži
                    </button>
                    <button
                      onClick={handleCancel}
                      disabled={cancelling}
                      className="flex-1 py-2 text-xs font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
                    >
                      {cancelling ? 'Otkazujem...' : 'Da, otkaži'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Order ID */}
          <div className="mx-4 sm:mx-5 mb-4 flex items-center justify-between text-[10px] text-muted/60">
            <span>ID narudžbe: {order.id?.slice(0, 12)}...</span>
            <span>Naručeno: {formatDate(order.createdAt)}</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default function TrackingPage() {
  const { user, loading: authLoading } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [guestOrders, setGuestOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [guestLoading, setGuestLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all')

  // Subscribe to authenticated user orders
  useEffect(() => {
    if (authLoading) return
    if (!user) {
      setLoading(false)
      return
    }

    setLoading(true)
    const unsub = subscribeToUserOrders(user.uid, (userOrders) => {
      setOrders(userOrders)
      setLoading(false)
    })
    return () => unsub?.()
  }, [user, authLoading])

  // Subscribe to guest orders (by device ID)
  useEffect(() => {
    if (authLoading) return
    if (user) {
      setGuestLoading(false)
      return
    }

    const deviceId = getGuestDeviceId()
    if (!deviceId) {
      setGuestLoading(false)
      return
    }

    setGuestLoading(true)
    const unsub = subscribeToGuestOrders(deviceId, (orders) => {
      setGuestOrders(orders)
      setGuestLoading(false)
    })
    return () => unsub?.()
  }, [user, authLoading])

  const filteredOrders = orders.filter(o => {
    if (filter === 'active') return !['delivered', 'cancelled'].includes(o.status)
    if (filter === 'completed') return ['delivered', 'cancelled'].includes(o.status)
    return true
  })

  const activeCount = orders.filter(o => !['delivered', 'cancelled'].includes(o.status)).length

  // Guest view — not logged in
  if (!authLoading && !user) {
    return (
      <div className="min-h-screen bg-background pb-24">
        <div className="bg-background border-b border-white/5 sticky top-0 z-40">
          <div className="flex items-center justify-between px-4 py-3 lg:px-8 lg:max-w-4xl lg:mx-auto">
            <Link href="/" className="p-1.5 -ml-1.5 hover:bg-white/5 rounded-lg transition-colors">
              <ChevronLeft className="w-5 h-5 text-text" />
            </Link>
            <h1 className="text-sm font-medium text-text">Moje narudžbe</h1>
            <div className="w-8" />
          </div>
        </div>

        <div className="px-4 py-4 lg:px-8 lg:max-w-4xl lg:mx-auto">
          {/* Login prompt banner */}
          <div className="p-4 mb-4 bg-surface border border-white/5 rounded-2xl">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <LogIn className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-text mb-0.5">Prijavite se za detaljno praćenje</p>
                <p className="text-xs text-muted mb-3">Prijavom dobivate status dostave u realnom vremenu, napomene od prodavca i historiju svih narudžbi.</p>
                <div className="flex gap-2">
                  <Link href="/auth/login" className="inline-flex items-center gap-1.5 text-xs font-medium bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors">
                    <LogIn className="w-3.5 h-3.5" />
                    Prijava
                  </Link>
                  <Link href="/auth/register" className="inline-flex items-center gap-1.5 text-xs font-medium bg-white/5 text-text px-4 py-2 rounded-lg hover:bg-white/10 transition-colors border border-white/10">
                    Registracija
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Guest orders list */}
          {guestLoading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
              <p className="text-xs text-muted">Učitavanje narudžbi...</p>
            </div>
          ) : guestOrders.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-surface rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/5">
                <Package className="w-10 h-10 text-muted" />
              </div>
              <p className="text-text font-semibold mb-1">Nemate narudžbi na ovom uređaju</p>
              <p className="text-xs text-muted mb-6 max-w-xs mx-auto">
                Ako ste narudžbu napravili na drugom uređaju, prijavite se da biste je vidjeli.
              </p>
              <Link
                href="/products"
                className="inline-flex items-center gap-2 bg-primary text-white text-sm font-medium px-5 py-2.5 rounded-xl hover:bg-primary/90 transition-colors"
              >
                <ShoppingBag className="w-4 h-4" />
                Pogledaj proizvode
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-[11px] font-semibold text-muted uppercase tracking-wider">Narudžbe sa ovog uređaja ({guestOrders.length})</p>
              {guestOrders.map(order => (
                <GuestOrderCard key={order.id} order={order} />
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="bg-background border-b border-white/5 sticky top-0 z-40">
        <div className="flex items-center justify-between px-4 py-3 lg:px-8 lg:max-w-4xl lg:mx-auto">
          <Link href="/" className="p-1.5 -ml-1.5 hover:bg-white/5 rounded-lg transition-colors">
            <ChevronLeft className="w-5 h-5 text-text" />
          </Link>
          <div className="text-center">
            <h1 className="text-sm font-medium text-text">Moje narudžbe</h1>
            {orders.length > 0 && (
              <p className="text-[10px] text-muted">{orders.length} narudžb(i) • {activeCount} aktivn(e/ih)</p>
            )}
          </div>
          <div className="w-8" />
        </div>
      </div>

      {/* Filter tabs */}
      <div className="px-4 pt-4 pb-2 lg:px-8 lg:max-w-4xl lg:mx-auto">
        <div className="flex gap-2 bg-surface p-1 rounded-xl border border-white/5">
          {([
            { key: 'all' as const, label: 'Sve', count: orders.length },
            { key: 'active' as const, label: 'Aktivne', count: activeCount },
            { key: 'completed' as const, label: 'Završene', count: orders.length - activeCount },
          ]).map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg transition-all ${
                filter === tab.key
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-muted hover:text-text'
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                  filter === tab.key ? 'bg-white/20' : 'bg-white/5'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-4 lg:px-8 lg:max-w-4xl lg:mx-auto space-y-3">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
            <p className="text-xs text-muted">Učitavanje narudžbi...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-surface rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/5">
              <Package className="w-10 h-10 text-muted" />
            </div>
            <p className="text-text font-semibold mb-1">
              {filter === 'all' ? 'Nemate narudžbi' : filter === 'active' ? 'Nema aktivnih narudžbi' : 'Nema završenih narudžbi'}
            </p>
            <p className="text-xs text-muted mb-6 max-w-xs mx-auto">
              {filter === 'all'
                ? 'Kada naručite proizvod, ovdje možete pratiti status.'
                : filter === 'active'
                  ? 'Nemate narudžbi koje su trenutno u obradi ili na putu.'
                  : 'Još nemate završenih narudžbi.'
              }
            </p>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 bg-primary text-white text-sm font-medium px-5 py-2.5 rounded-xl hover:bg-primary/90 transition-colors"
            >
              <ShoppingBag className="w-4 h-4" />
              Pogledaj proizvode
            </Link>
          </div>
        ) : (
          filteredOrders.map(order => (
            <OrderCard key={order.id} order={order} />
          ))
        )}
      </div>
    </div>
  )
}
