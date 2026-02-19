'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { ChevronLeft, Package, MapPin, Phone, Mail, User, AlertCircle, CheckCircle, Truck } from 'lucide-react'
import Link from 'next/link'
import { useProductById } from '@/hooks/useProducts'
import { addOrder } from '@/lib/realtimeProducts'
import { getGuestDeviceId } from '@/lib/realtimeProducts'
import { useAuth } from '@/context/AuthContext'

export default function CheckoutPage() {
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const productId = params.id as string
  const quantity = parseInt(searchParams.get('qty') || '1')
  const preselectedVariant = searchParams.get('variant') || ''
  
  const { product, loading } = useProductById(productId)
  const { user, userProfile } = useAuth()
  
  const [selectedVariantId, setSelectedVariantId] = useState(() => {
    if (preselectedVariant) return preselectedVariant
    return ''
  })
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    phone: '',
    email: ''
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [orderComplete, setOrderComplete] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [showTrackingPopup, setShowTrackingPopup] = useState(false)

  // Auto-fill form with user data
  useEffect(() => {
    if (user && userProfile) {
      const nameParts = (userProfile.displayName || '').split(' ')
      setFormData(prev => ({
        firstName: prev.firstName || nameParts[0] || '',
        lastName: prev.lastName || nameParts.slice(1).join(' ') || '',
        address: prev.address || userProfile.address || '',
        city: prev.city || userProfile.city || '',
        phone: prev.phone || userProfile.phone || '',
        email: prev.email || user.email || '',
      }))
    }
  }, [user, userProfile])

  // Auto-select first variant when standard is hidden
  useEffect(() => {
    if (product?.hideStandardVariant && product?.variants?.length && !selectedVariantId) {
      setSelectedVariantId(product.variants[0].id)
    }
  }, [product?.hideStandardVariant, product?.variants, selectedVariantId])

  if (loading || !product) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full"></div>
      </div>
    )
  }

  // Get selected variant
  const selectedVariant = selectedVariantId ? product.variants?.find(v => v.id === selectedVariantId) : null
  const hasVariants = product.variants && product.variants.length > 0
  
  // Calculate price based on variant or base price
  const unitPrice = selectedVariant ? selectedVariant.price : product.price
  const totalPrice = unitPrice * quantity
  
  // Get product name with variant
  const standardLabel = product.standardVariantLabel || 'Standardna'
  const productNameWithVariant = selectedVariant 
    ? `${product.name} (${selectedVariant.value})`
    : hasVariants 
      ? `${product.name} (${standardLabel})`
      : product.name

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.firstName.trim()) newErrors.firstName = 'Ime je obavezno'
    if (!formData.lastName.trim()) newErrors.lastName = 'Prezime je obavezno'
    if (!formData.address.trim()) newErrors.address = 'Adresa je obavezna'
    if (!formData.city.trim()) newErrors.city = 'Grad je obavezan'
    if (!formData.phone.trim()) newErrors.phone = 'Broj telefona je obavezan'
    else if (!/^[\d\s\+\-]+$/.test(formData.phone)) newErrors.phone = 'Neispravan format broja'
    if (!formData.email.trim()) newErrors.email = 'Email je obavezan'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Neispravan email format'
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      setShowConfirmation(true)
    }
  }

  const handleConfirmOrder = async () => {
    setIsSubmitting(true)
    try {
      await addOrder({
        userId: user?.uid || undefined,
        guestDeviceId: !user ? getGuestDeviceId() : undefined,
        items: [{
          productId: product.id!,
          productName: productNameWithVariant,
          productImage: product.image,
          price: unitPrice,
          quantity: quantity,
          selectedVariants: selectedVariant?.value || (hasVariants ? standardLabel : undefined)
        }],
        totalPrice: totalPrice,
        customerName: formData.firstName,
        customerSurname: formData.lastName,
        customerEmail: formData.email,
        customerPhone: formData.phone,
        customerAddress: formData.address,
        customerCity: formData.city
      })
      setOrderComplete(true)
      setShowConfirmation(false)
    } catch (error) {
      console.error('Error creating order:', error)
      alert('Greška pri kreiranju narudžbe. Pokušajte ponovo.')
      setIsSubmitting(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleVariantSelect = (variantId: string) => {
    setSelectedVariantId(variantId)
    if (errors.variant) {
      setErrors(prev => ({ ...prev, variant: '' }))
    }
  }

  // Order Complete Screen
  if (orderComplete) {
    return (
      <div className="min-h-screen bg-background pb-8">
        <div className="bg-background border-b border-white/5 sticky top-0 z-40">
          <div className="flex items-center justify-between px-4 py-3 lg:px-8 lg:max-w-4xl lg:mx-auto">
            <Link href="/" className="p-1.5 -ml-1.5 hover:bg-white/5 rounded-lg transition-colors">
              <ChevronLeft className="w-5 h-5 text-text" />
            </Link>
            <h1 className="text-sm font-medium text-text">Narudžba završena</h1>
            <div className="w-8"></div>
          </div>
        </div>

        <div className="px-4 py-12 lg:px-8 lg:max-w-2xl lg:mx-auto text-center">
          <div className="w-20 h-20 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-accent" />
          </div>
          <h2 className="text-2xl font-bold text-text mb-3">Hvala vam na narudžbi!</h2>
          <p className="text-muted mb-8 leading-relaxed">
            Vaša narudžba je uspješno zaprimljena. Proizvod će biti poslan na vašu adresu. 
            Plaćanje se vrši prilikom preuzimanja pošiljke (pouzeće).
          </p>
          
          <div className="bg-surface rounded-2xl p-6 border border-white/5 mb-8 text-left">
            <h3 className="font-semibold text-text mb-4">Detalji narudžbe</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted">Proizvod:</span>
                <span className="text-text font-medium">{productNameWithVariant}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Količina:</span>
                <span className="text-text">{quantity} kom</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Ukupno za platiti:</span>
                <span className="text-primary font-bold">{totalPrice.toFixed(2)} KM</span>
              </div>
              <div className="border-t border-white/5 pt-3 mt-3">
                <span className="text-muted">Dostava na adresu:</span>
                <p className="text-text mt-1">{formData.firstName} {formData.lastName}</p>
                <p className="text-text">{formData.address}</p>
                <p className="text-text">{formData.city}</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => setShowTrackingPopup(true)}
              className="flex-1 bg-primary hover:bg-primary/90 text-white py-3 px-6 rounded-xl font-medium transition-colors text-center"
            >
              Nastavi kupovinu
            </button>
            <button
              onClick={() => setShowTrackingPopup(true)}
              className="flex-1 bg-surface hover:bg-white/5 text-text py-3 px-6 rounded-xl font-medium transition-colors border border-white/10 text-center"
            >
              Nazad na proizvod
            </button>
          </div>
        </div>

        {/* Tracking Popup */}
        {showTrackingPopup && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowTrackingPopup(false)}>
            <div className="bg-surface rounded-2xl w-full max-w-sm p-6 border border-white/5 text-center" onClick={e => e.stopPropagation()}>
              <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="w-8 h-8 text-blue-500" />
              </div>
              <h3 className="text-lg font-bold text-text mb-2">Želite pratiti vašu narudžbu?</h3>
              {user ? (
                <>
                  <p className="text-sm text-muted mb-5">Pratite status dostave u realnom vremenu na stranici vaših narudžbi.</p>
                  <Link
                    href="/tracking"
                    className="block w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-medium transition-colors mb-3"
                  >
                    Prati narudžbu
                  </Link>
                </>
              ) : (
                <>
                  <p className="text-sm text-muted mb-5">Prijavite se kako biste mogli pratiti status vaše narudžbe u realnom vremenu.</p>
                  <Link
                    href="/auth/login"
                    className="block w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-medium transition-colors mb-3"
                  >
                    Prijavi se
                  </Link>
                  <Link
                    href="/auth/register"
                    className="block w-full bg-white/5 hover:bg-white/10 text-text py-3 rounded-xl font-medium transition-colors mb-3 border border-white/10"
                  >
                    Registruj se
                  </Link>
                </>
              )}
              <button
                onClick={() => setShowTrackingPopup(false)}
                className="text-sm text-muted hover:text-text transition-colors mt-1"
              >
                Možda kasnije
              </button>
              <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-white/5">
                <Link
                  href="/"
                  className="w-full bg-primary/10 hover:bg-primary/20 text-primary py-2.5 rounded-xl text-sm font-medium transition-colors"
                >
                  Nastavi kupovinu
                </Link>
                <Link
                  href={`/product/${product.slug || productId}`}
                  className="w-full bg-white/5 hover:bg-white/10 text-text py-2.5 rounded-xl text-sm font-medium transition-colors"
                >
                  Nazad na proizvod
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pb-8">
      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface rounded-2xl w-full max-w-md p-6 border border-white/5">
            <div className="w-16 h-16 bg-secondary/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-secondary" />
            </div>
            <h3 className="text-xl font-bold text-text text-center mb-2">Potvrdite narudžbu</h3>
            <p className="text-muted text-center mb-6 text-sm leading-relaxed">
              Jeste li sigurni da želite naručiti ovaj proizvod? 
              Proizvod će biti poslan na vašu adresu, a plaćanje se vrši prilikom preuzimanja (pouzeće).
            </p>
            
            <div className="bg-background rounded-xl p-4 mb-6 border border-white/5">
              <div className="flex items-center gap-3 mb-3">
                {product.image && product.image.startsWith('data:') ? (
                  <img src={product.image} alt={product.name} className="w-16 h-16 rounded-lg object-cover" />
                ) : (
                  <div className="w-16 h-16 bg-white/5 rounded-lg flex items-center justify-center">
                    <Package className="w-6 h-6 text-muted" />
                  </div>
                )}
                <div className="flex-1">
                  <p className="text-sm font-medium text-text line-clamp-2">{productNameWithVariant}</p>
                  <p className="text-xs text-muted">Količina: {quantity}</p>
                </div>
              </div>
              <div className="flex justify-between items-center pt-3 border-t border-white/5">
                <span className="text-sm text-muted">Ukupno za platiti:</span>
                <span className="text-lg font-bold text-primary">{totalPrice.toFixed(2)} KM</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setShowConfirmation(false)} disabled={isSubmitting} className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-text rounded-xl font-medium transition-colors border border-white/10 disabled:opacity-50">
                Odustani
              </button>
              <button onClick={handleConfirmOrder} disabled={isSubmitting} className="flex-1 py-3 bg-primary hover:bg-primary/90 text-white rounded-xl font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Šaljem...
                  </>
                ) : 'Potvrdi narudžbu'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-background border-b border-white/5 sticky top-0 z-40">
        <div className="flex items-center justify-between px-4 py-3 lg:px-8 lg:max-w-4xl lg:mx-auto">
          <button onClick={() => router.back()} className="p-1.5 -ml-1.5 hover:bg-white/5 rounded-lg transition-colors">
            <ChevronLeft className="w-5 h-5 text-text" />
          </button>
          <h1 className="text-sm font-medium text-text">Narudžba</h1>
          <div className="w-8"></div>
        </div>
      </div>

      <div className="px-4 py-6 lg:px-8 lg:max-w-4xl lg:mx-auto">
        <div className="lg:grid lg:grid-cols-3 lg:gap-8">
          <div className="lg:col-span-2">
            {/* Payment Notice */}
            <div className="bg-secondary/10 border border-secondary/20 rounded-2xl p-4 mb-6">
              <div className="flex items-start gap-3">
                <Truck className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-secondary text-sm mb-1">Plaćanje pouzećem</h3>
                  <p className="text-sm text-secondary/80">
                    Plaćanje se vrši isključivo prilikom preuzimanja pošiljke.
                  </p>
                </div>
              </div>
            </div>

            {/* Variant Selection */}
            {hasVariants && (
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-1 h-4 bg-primary rounded-full"></div>
                  <h2 className="text-sm font-semibold text-text">Odaberite opciju</h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  {/* Default/Standard Option - Base Price */}
                  {!product.hideStandardVariant && (
                  <button
                    type="button"
                    onClick={() => handleVariantSelect('')}
                    className={`relative px-3 py-2 rounded-lg text-left transition-all duration-200 ${
                      selectedVariantId === ''
                        ? 'bg-primary text-white shadow-md shadow-primary/25'
                        : 'bg-surface/80 border border-white/10 text-text hover:border-primary/50 hover:bg-white/5'
                    }`}
                  >
                    <span className={`text-xs font-medium ${selectedVariantId === '' ? 'text-white' : 'text-text'}`}>
                      {standardLabel}
                    </span>
                    <span className={`ml-1.5 text-xs font-bold ${selectedVariantId === '' ? 'text-white/90' : 'text-accent'}`}>
                      {product.price.toFixed(2)} KM
                    </span>
                  </button>
                  )}
                  
                  {/* Custom Variants */}
                  {product.variants!.map((variant) => {
                    const isSelected = selectedVariantId === variant.id
                    return (
                      <button
                        key={variant.id}
                        type="button"
                        onClick={() => handleVariantSelect(variant.id)}
                        className={`relative px-3 py-2 rounded-lg text-left transition-all duration-200 ${
                          isSelected
                            ? 'bg-primary text-white shadow-md shadow-primary/25'
                            : 'bg-surface/80 border border-white/10 text-text hover:border-primary/50 hover:bg-white/5'
                        }`}
                      >
                        <span className={`text-xs font-medium ${isSelected ? 'text-white' : 'text-text'}`}>
                          {variant.value}
                        </span>
                        <span className={`ml-1.5 text-xs font-bold ${isSelected ? 'text-white/90' : 'text-accent'}`}>
                          {variant.price.toFixed(2)} KM
                        </span>
                      </button>
                    )
                  })}
                </div>
                {errors.variant && <p className="text-xs text-danger mt-2">{errors.variant}</p>}
              </div>
            )}

            <h2 className="text-lg font-semibold text-text mb-4">Podaci za dostavu</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted block mb-1.5">Ime *</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                    <input type="text" value={formData.firstName} onChange={e => handleChange('firstName', e.target.value)} placeholder="Vaše ime" className={`w-full bg-surface border rounded-xl py-3 pl-10 pr-4 text-sm text-text placeholder:text-muted/50 focus:outline-none focus:border-primary ${errors.firstName ? 'border-danger' : 'border-white/10'}`} />
                  </div>
                  {errors.firstName && <p className="text-xs text-danger mt-1">{errors.firstName}</p>}
                </div>
                <div>
                  <label className="text-xs text-muted block mb-1.5">Prezime *</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                    <input type="text" value={formData.lastName} onChange={e => handleChange('lastName', e.target.value)} placeholder="Vaše prezime" className={`w-full bg-surface border rounded-xl py-3 pl-10 pr-4 text-sm text-text placeholder:text-muted/50 focus:outline-none focus:border-primary ${errors.lastName ? 'border-danger' : 'border-white/10'}`} />
                  </div>
                  {errors.lastName && <p className="text-xs text-danger mt-1">{errors.lastName}</p>}
                </div>
              </div>

              <div>
                <label className="text-xs text-muted block mb-1.5">Adresa *</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                  <input type="text" value={formData.address} onChange={e => handleChange('address', e.target.value)} placeholder="Ulica i broj" className={`w-full bg-surface border rounded-xl py-3 pl-10 pr-4 text-sm text-text placeholder:text-muted/50 focus:outline-none focus:border-primary ${errors.address ? 'border-danger' : 'border-white/10'}`} />
                </div>
                {errors.address && <p className="text-xs text-danger mt-1">{errors.address}</p>}
              </div>

              <div>
                <label className="text-xs text-muted block mb-1.5">Grad *</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                  <input type="text" value={formData.city} onChange={e => handleChange('city', e.target.value)} placeholder="Vaš grad" className={`w-full bg-surface border rounded-xl py-3 pl-10 pr-4 text-sm text-text placeholder:text-muted/50 focus:outline-none focus:border-primary ${errors.city ? 'border-danger' : 'border-white/10'}`} />
                </div>
                {errors.city && <p className="text-xs text-danger mt-1">{errors.city}</p>}
              </div>

              <div>
                <label className="text-xs text-muted block mb-1.5">Broj telefona *</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                  <input type="tel" value={formData.phone} onChange={e => handleChange('phone', e.target.value)} placeholder="+387 6X XXX XXX" className={`w-full bg-surface border rounded-xl py-3 pl-10 pr-4 text-sm text-text placeholder:text-muted/50 focus:outline-none focus:border-primary ${errors.phone ? 'border-danger' : 'border-white/10'}`} />
                </div>
                {errors.phone && <p className="text-xs text-danger mt-1">{errors.phone}</p>}
              </div>

              <div>
                <label className="text-xs text-muted block mb-1.5">Email *</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                  <input type="email" value={formData.email} onChange={e => handleChange('email', e.target.value)} placeholder="vas@email.com" className={`w-full bg-surface border rounded-xl py-3 pl-10 pr-4 text-sm text-text placeholder:text-muted/50 focus:outline-none focus:border-primary ${errors.email ? 'border-danger' : 'border-white/10'}`} />
                </div>
                {errors.email && <p className="text-xs text-danger mt-1">{errors.email}</p>}
              </div>

              <button type="submit" className="w-full lg:hidden bg-primary hover:bg-primary/90 text-white py-3.5 rounded-xl font-semibold transition-colors shadow-lg shadow-primary/25 mt-6">
                Nastavi na potvrdu
              </button>
            </form>
          </div>

          {/* Order Summary - Sidebar */}
          <div className="hidden lg:block">
            <div className="bg-surface rounded-2xl p-6 border border-white/5 sticky top-20">
              <h3 className="font-semibold text-text mb-4">Vaša narudžba</h3>
              
              <div className="flex items-center gap-3 pb-4 border-b border-white/5">
                {product.image && product.image.startsWith('data:') ? (
                  <img src={product.image} alt={product.name} className="w-20 h-20 rounded-xl object-cover" />
                ) : (
                  <div className="w-20 h-20 bg-white/5 rounded-xl flex items-center justify-center">
                    <Package className="w-8 h-8 text-muted" />
                  </div>
                )}
                <div className="flex-1">
                  <p className="text-sm font-medium text-text line-clamp-2 mb-1">{productNameWithVariant}</p>
                  <p className="text-xs text-muted">Količina: {quantity}</p>
                  <p className="text-sm font-bold text-primary mt-1">{unitPrice.toFixed(2)} KM</p>
                </div>
              </div>

              <div className="space-y-2 py-4 border-b border-white/5">
                <div className="flex justify-between text-sm">
                  <span className="text-muted">Cijena proizvoda</span>
                  <span className="text-text">{(unitPrice * quantity).toFixed(2)} KM</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted">Dostava</span>
                  <span className="text-accent">Besplatna</span>
                </div>
              </div>

              <div className="flex justify-between items-center pt-4">
                <span className="font-semibold text-text">Ukupno</span>
                <span className="text-xl font-bold text-primary">{totalPrice.toFixed(2)} KM</span>
              </div>

              <button onClick={handleSubmit} className="w-full bg-primary hover:bg-primary/90 text-white py-3.5 rounded-xl font-semibold transition-colors shadow-lg shadow-primary/25 mt-6">
                Nastavi na potvrdu
              </button>

              <p className="text-xs text-muted text-center mt-4">
                Plaćanje se vrši prilikom preuzimanja pošiljke
              </p>
            </div>
          </div>
        </div>

        {/* Mobile Order Summary */}
        <div className="lg:hidden mt-6 bg-surface rounded-2xl p-4 border border-white/5">
          <div className="flex items-center gap-3">
            {product.image && product.image.startsWith('data:') ? (
              <img src={product.image} alt={product.name} className="w-16 h-16 rounded-xl object-cover" />
            ) : (
              <div className="w-16 h-16 bg-white/5 rounded-xl flex items-center justify-center">
                <Package className="w-6 h-6 text-muted" />
              </div>
            )}
            <div className="flex-1">
              <p className="text-sm font-medium text-text line-clamp-1">{productNameWithVariant}</p>
              <p className="text-xs text-muted">Količina: {quantity}</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-primary">{totalPrice.toFixed(2)} KM</p>
              <p className="text-xs text-accent">Besplatna dostava</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}