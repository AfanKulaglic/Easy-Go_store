'use client'

import { useState, useRef, useCallback, useEffect, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { Heart, ChevronLeft, Check, Plus, Star, ChevronRight, ShoppingCart, Share2, Shield, Truck, RotateCcw, Play, X } from 'lucide-react'
import Link from 'next/link'
import { useCartStore } from '@/store/cartStore'
import { useProductBySlug, useRelatedProducts, useProducts } from '@/hooks/useProducts'
import { Product, updateProduct, trackProductView } from '@/lib/realtimeProducts'
import { trackRecentProduct, trackPageView, trackInterest } from '@/lib/cookieManager'

const avatarEmojis = ['👤', '👨', '👩', '🧑', '👴', '👵', '👦', '👧', '🧔', '👱', '👩‍🦰', '👨‍🦰', '👩‍🦱', '👨‍🦱', '🧑‍🦳', '👩‍🦳']

export default function ProductPage() {
  const router = useRouter()
  const params = useParams()
  const slugOrId = params.id as string
  
  const { product, loading } = useProductBySlug(slugOrId)
  const { related: relatedProducts } = useRelatedProducts(slugOrId, 5)
  const { products } = useProducts()

  const [isWishlisted, setIsWishlisted] = useState(false)
  const [quantity, setQuantity] = useState(1)
  const [selectedColor, setSelectedColor] = useState(0)
  const [selectedImage, setSelectedImage] = useState(0)
  const [showVideoModal, setShowVideoModal] = useState(false)
  const [showImageModal, setShowImageModal] = useState(false)
  const [relatedWishlisted, setRelatedWishlisted] = useState<Set<string>>(new Set())
  const [reviewRating, setReviewRating] = useState(0)
  const [reviewText, setReviewText] = useState('')
  const [reviewName, setReviewName] = useState('')
  const [reviewAvatar, setReviewAvatar] = useState('👤')
  const [showAvatarPicker, setShowAvatarPicker] = useState(false)
  const [submittingReview, setSubmittingReview] = useState(false)
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({})
  const addToCart = useCartStore((state) => state.addToCart)

  // Drag scroll for thumbnail gallery
  const thumbnailRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [scrollLeft, setScrollLeft] = useState(0)

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!thumbnailRef.current) return
    setIsDragging(true)
    setStartX(e.pageX - thumbnailRef.current.offsetLeft)
    setScrollLeft(thumbnailRef.current.scrollLeft)
  }, [])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging || !thumbnailRef.current) return
    e.preventDefault()
    const x = e.pageX - thumbnailRef.current.offsetLeft
    const walk = (x - startX) * 2
    thumbnailRef.current.scrollLeft = scrollLeft - walk
  }, [isDragging, startX, scrollLeft])

  const displayProduct = product || products[0]

  // Track product view
  useEffect(() => {
    if (displayProduct?.id && displayProduct?.name) {
      trackProductView(displayProduct.id, displayProduct.name)
      // Set real browser cookies (only if user consented to those categories)
      trackRecentProduct(displayProduct.id)
      trackPageView()
      if (displayProduct.category) trackInterest(displayProduct.category)
    }
  }, [displayProduct?.id, displayProduct?.name, displayProduct?.category])

  // Auto-select first variant when standard is hidden
  useEffect(() => {
    if (displayProduct?.hideStandardVariant && displayProduct?.variants?.length && !selectedVariants['variant']) {
      setSelectedVariants({ variant: displayProduct.variants[0].id })
    }
  }, [displayProduct?.hideStandardVariant, displayProduct?.variants, selectedVariants])

  // Calculate price - use selected variant price, otherwise base price
  const calculatedPrice = useMemo(() => {
    if (!displayProduct) return 0
    
    // Check if a variant is selected
    if (displayProduct.variants && selectedVariants['variant']) {
      const selectedVariant = displayProduct.variants.find(v => v.id === selectedVariants['variant'])
      if (selectedVariant) {
        return selectedVariant.price
      }
    }
    
    return displayProduct.price // Return base price if no variant selected
  }, [displayProduct, selectedVariants])

  // Get selected variant label for cart
  const getSelectedVariantLabels = () => {
    if (!displayProduct?.variants || displayProduct.variants.length === 0) return ''
    if (!selectedVariants['variant']) return displayProduct?.standardVariantLabel || 'Standardna' // Default option
    const selectedVariant = displayProduct.variants.find(v => v.id === selectedVariants['variant'])
    return selectedVariant ? selectedVariant.value : displayProduct?.standardVariantLabel || 'Standardna'
  }

  if (loading || !displayProduct) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full"></div>
      </div>
    )
  }

  const allImages = [displayProduct.image, ...(displayProduct.images || [])].filter(img => img && (img.startsWith('data:') || img.startsWith('http') || img.startsWith('/')))
  const currentImage = allImages[selectedImage] || displayProduct.image
  const hasVideo = !!displayProduct.videoUrl

  const handleAddToCart = () => {
    const variantLabels = getSelectedVariantLabels()
    const productName = variantLabels ? `${displayProduct.name} (${variantLabels})` : displayProduct.name
    const variantKey = variantLabels || undefined
    for (let i = 0; i < quantity; i++) {
      addToCart({ id: displayProduct.id!, name: productName, price: calculatedPrice, image: displayProduct.image, variantKey })
    }
  }

  const toggleRelatedWishlist = (e: React.MouseEvent, id: string) => {
    e.preventDefault()
    setRelatedWishlisted(prev => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next })
  }

  const handleAddRelatedToCart = (e: React.MouseEvent, item: Product) => {
    e.preventDefault()
    addToCart({ id: item.id!, name: item.name, price: item.price, image: item.image })
  }

  const handleSubmitReview = async () => {
    if (!reviewName.trim() || !reviewText.trim() || reviewRating === 0) return
    
    setSubmittingReview(true)
    try {
      const newReview = {
        id: Date.now().toString(),
        name: reviewName,
        rating: reviewRating,
        comment: reviewText,
        date: new Date().toLocaleDateString('bs-BA', { day: 'numeric', month: 'short', year: 'numeric' }),
        avatar: reviewAvatar
      }
      
      const existingReviews = displayProduct.productReviews || []
      await updateProduct(displayProduct.id!, {
        productReviews: [...existingReviews, newReview],
        reviews: existingReviews.length + 1
      })
      
      // Reset form
      setReviewName('')
      setReviewText('')
      setReviewRating(0)
      setReviewAvatar('👤')
    } catch (error) {
      console.error('Error submitting review:', error)
      alert('Greška pri slanju recenzije. Pokušajte ponovo.')
    } finally {
      setSubmittingReview(false)
    }
  }

  const renderStars = (rating: number) => Array.from({ length: 5 }).map((_, i) => (
    <Star key={i} className={`w-3 h-3 ${i < Math.floor(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-muted/30'}`} />
  ))

  const getBadgeStyle = (item: Product) => {
    if (item.discountPercent) return { text: `-${item.discountPercent}%`, className: 'bg-danger text-white' }
    if (item.badge === 'sale') return { text: 'Akcija', className: 'bg-danger text-white' }
    if (item.badge === 'new') return { text: 'Novo', className: 'bg-accent text-white' }
    return null
  }

  const isImageData = (str: string) => str?.startsWith('data:image') || str?.startsWith('http') || str?.startsWith('/')

  const discount = displayProduct.originalPrice 
    ? Math.round(((displayProduct.originalPrice - displayProduct.price) / displayProduct.originalPrice) * 100)
    : 0

  const nextImage = () => setSelectedImage(prev => (prev + 1) % allImages.length)
  const prevImage = () => setSelectedImage(prev => (prev - 1 + allImages.length) % allImages.length)

  // Auto-scroll thumbnail strip to keep the selected thumbnail visible
  useEffect(() => {
    if (!thumbnailRef.current) return
    const container = thumbnailRef.current
    const thumbnails = container.children
    if (!thumbnails[selectedImage]) return
    const thumb = thumbnails[selectedImage] as HTMLElement
    const thumbLeft = thumb.offsetLeft
    const thumbWidth = thumb.offsetWidth
    const containerWidth = container.clientWidth
    const scrollTarget = thumbLeft - (containerWidth / 2) + (thumbWidth / 2)
    container.scrollTo({ left: scrollTarget, behavior: 'smooth' })
  }, [selectedImage])

  // Helper to get YouTube/Vimeo embed URL
  const getVideoEmbedUrl = (url: string) => {
    if (!url) return null
    
    // YouTube
    const youtubeMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
    if (youtubeMatch) {
      return `https://www.youtube.com/embed/${youtubeMatch[1]}?autoplay=1`
    }
    
    // Vimeo
    const vimeoMatch = url.match(/vimeo\.com\/(?:video\/)?(\d+)/)
    if (vimeoMatch) {
      return `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1`
    }
    
    // Direct video URL
    return url
  }

  const isEmbedVideo = (url: string) => {
    return url?.includes('youtube.com') || url?.includes('youtu.be') || url?.includes('vimeo.com')
  }

  return (
    <div className="min-h-screen bg-background pb-36 lg:pb-8 max-w-7xl mx-auto">
      {/* Video Modal */}
      {showVideoModal && hasVideo && (
        <div className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center p-4" onClick={() => setShowVideoModal(false)}>
          <button className="absolute top-4 right-4 p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors z-10">
            <X className="w-6 h-6 text-white" />
          </button>
          <div className="w-full max-w-4xl aspect-video" onClick={e => e.stopPropagation()}>
            {isEmbedVideo(displayProduct.videoUrl!) ? (
              <iframe
                src={getVideoEmbedUrl(displayProduct.videoUrl!) || ''}
                className="w-full h-full rounded-2xl"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <video
                src={displayProduct.videoUrl}
                controls
                autoPlay
                className="w-full h-full rounded-2xl"
              />
            )}
          </div>
        </div>
      )}

      {/* Image Lightbox Modal */}
      {showImageModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4" onClick={() => setShowImageModal(false)}>
          <button className="absolute top-4 right-4 p-2 bg-white/10 backdrop-blur-sm rounded-full hover:bg-white/20 transition-colors z-10">
            <X className="w-6 h-6 text-white" />
          </button>
          
          {/* Navigation Arrows */}
          {allImages.length > 1 && (
            <>
              <button 
                onClick={(e) => { e.stopPropagation(); prevImage(); }}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 backdrop-blur-sm rounded-full hover:bg-white/20 transition-colors z-10"
              >
                <ChevronLeft className="w-6 h-6 text-white" />
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); nextImage(); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 backdrop-blur-sm rounded-full hover:bg-white/20 transition-colors z-10"
              >
                <ChevronRight className="w-6 h-6 text-white" />
              </button>
            </>
          )}

          {/* Image */}
          <div className="max-w-5xl max-h-[85vh] flex items-center justify-center" onClick={e => e.stopPropagation()}>
            <img 
              src={currentImage} 
              alt={displayProduct.name} 
              className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl" 
            />
          </div>

          {/* Image Counter */}
          {allImages.length > 1 && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
              <span className="text-sm text-white font-medium">{selectedImage + 1} / {allImages.length}</span>
            </div>
          )}
        </div>
      )}

      {/* Secondary Header - Product Details (Fixed below main header) */}
      <div className="fixed top-[60px] lg:top-[72px] left-0 right-0 z-40 bg-background border-b border-white/5">
        <div className="flex items-center justify-between px-4 py-2 lg:px-8 lg:max-w-7xl lg:mx-auto">
          <button onClick={() => router.back()} className="p-1.5 -ml-1.5 hover:bg-white/5 rounded-lg transition-colors">
            <ChevronLeft className="w-5 h-5 text-text" />
          </button>
          <h1 className="text-sm font-medium text-text">Detalji proizvoda</h1>
          <button className="p-1.5 -mr-1.5 hover:bg-white/5 rounded-lg transition-colors">
            <Share2 className="w-4 h-4 text-muted" />
          </button>
        </div>
      </div>

      {/* Spacer for fixed secondary header */}
      <div className="h-10"></div>

      <div className="lg:max-w-7xl lg:mx-auto lg:px-8 lg:py-8">
        {/* Desktop Layout - Images on left, Info on right */}
        <div className="lg:grid lg:grid-cols-2 lg:gap-10">
          
          {/* Left Column - Images */}
          <div className="lg:sticky lg:top-24 lg:self-start lg:px-0">
            {/* Main Image */}
            <div className="relative bg-gradient-to-br from-primary/20 via-surface to-accent/10 lg:rounded-3xl overflow-hidden">
              <div 
                className="aspect-square flex items-center justify-center cursor-pointer"
                onClick={() => isImageData(currentImage) && setShowImageModal(true)}
              >
                {isImageData(currentImage) ? (
                  <img src={currentImage} alt={displayProduct.name} className="w-full h-full object-contain drop-shadow-2xl" />
                ) : (
                  <div className="text-muted text-center flex flex-col items-center justify-center">
                    <img src="/assets/images/logo.png" alt={displayProduct.name} className="w-24 h-24 lg:w-32 lg:h-32 object-contain opacity-30 mb-2" />
                  </div>
                )}
              </div>

              {/* Play Video Button */}
              {hasVideo && (
                <button 
                  onClick={() => setShowVideoModal(true)}
                  className="absolute top-4 left-4 flex items-center gap-2 bg-background text-text px-4 py-2 rounded-xl hover:bg-background/90 transition-colors shadow-lg"
                >
                  <Play className="w-4 h-4 fill-primary text-primary" />
                  <span className="text-sm font-medium">Video</span>
                </button>
              )}

              {/* Discount Badge */}
              {discount > 0 && (
                <div className={`absolute ${hasVideo ? 'top-16' : 'top-4'} left-4 bg-danger text-white text-sm font-bold px-3 py-1.5 rounded-xl`}>
                  -{discount}%
                </div>
              )}

              {/* Wishlist Button */}
              <button 
                onClick={() => setIsWishlisted(!isWishlisted)} 
                className="absolute top-4 right-4 p-3 bg-background rounded-xl hover:bg-background/90 transition-colors"
              >
                <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-danger text-danger' : 'text-muted'}`} />
              </button>

              {/* Navigation Arrows */}
              {allImages.length > 1 && (
                <>
                  <button onClick={prevImage} className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-background rounded-full hover:bg-background/90 transition-colors">
                    <ChevronLeft className="w-5 h-5 text-text" />
                  </button>
                  <button onClick={nextImage} className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-background rounded-full hover:bg-background/90 transition-colors">
                    <ChevronRight className="w-5 h-5 text-text" />
                  </button>
                </>
              )}

              {/* Image Counter */}
              {allImages.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-background px-3 py-1.5 rounded-full">
                  <span className="text-xs text-text font-medium">{selectedImage + 1} / {allImages.length}</span>
                </div>
              )}
            </div>

            {/* Thumbnail Gallery - Shows 4 at a time, scroll/drag for more */}
            {allImages.length > 1 && (
              <div className="mt-3 px-4 lg:px-0 overflow-hidden">
                <div 
                  ref={thumbnailRef}
                  onMouseDown={handleMouseDown}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                  onMouseMove={handleMouseMove}
                  className={`flex gap-2 overflow-x-auto pb-2 scrollbar-hide ${isDragging ? 'cursor-grabbing select-none' : 'cursor-grab'}`}
                >
                  {allImages.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => !isDragging && setSelectedImage(index)}
                      className={`w-[calc((100%-32px)/4.2)] min-w-[calc((100%-32px)/4.2)] aspect-square rounded-xl overflow-hidden border-2 transition-colors flex-shrink-0 ${
                        selectedImage === index 
                          ? 'border-primary shadow-lg shadow-primary/20' 
                          : 'border-white/10 hover:border-white/30'
                      }`}
                    >
                      <img 
                        src={img} 
                        alt={`${displayProduct.name} ${index + 1}`} 
                        className="w-full h-full object-cover pointer-events-none" 
                        draggable={false}
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Product Info */}
          <div className="px-5 lg:px-0 lg:sticky lg:top-24 lg:self-start">
            {/* Category & Badge */}
            <div className="flex items-center gap-2 mt-6 lg:mt-0 mb-3">
              <Link href={`/category/${displayProduct.categorySlug}`} className="text-sm text-primary hover:underline">
                {displayProduct.category}
              </Link>
              {displayProduct.badge && (
                <span className={`text-xs font-medium px-2 py-1 rounded-md ${
                  displayProduct.badge === 'sale' ? 'bg-danger/20 text-danger' :
                  displayProduct.badge === 'new' ? 'bg-accent/20 text-accent' : 'bg-primary/20 text-primary'
                }`}>
                  {displayProduct.badge === 'sale' ? 'Akcija' : displayProduct.badge === 'new' ? 'Novo' : displayProduct.badge}
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="text-2xl lg:text-3xl font-bold text-text mb-4 leading-tight">
              {displayProduct.name}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-3 mb-5">
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`w-5 h-5 ${i < Math.floor(displayProduct.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-muted/30'}`} />
                ))}
              </div>
              <span className="text-sm text-muted">({displayProduct.reviews} recenzija)</span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-5">
              <span className="text-3xl lg:text-4xl font-bold text-primary">{calculatedPrice.toFixed(2)} KM</span>
              {displayProduct.originalPrice && (
                <span className="text-lg text-muted line-through">{displayProduct.originalPrice.toFixed(2)} KM</span>
              )}
            </div>

            {/* Variants Selector */}
            {displayProduct.variants && displayProduct.variants.length > 0 && (
              <div className="mb-5 bg-gradient-to-br from-surface/80 to-surface/40 rounded-2xl p-3 lg:p-4 border border-white/10 backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-1 h-4 bg-primary rounded-full"></div>
                  <label className="text-xs lg:text-sm font-semibold text-text">
                    Odaberi opciju
                  </label>
                </div>
                <div className="flex flex-wrap gap-2">
                  {/* Default/Standard Option - Base Price */}
                  {!displayProduct.hideStandardVariant && (
                  <button
                    type="button"
                    onClick={() => setSelectedVariants({})}
                    className={`relative px-3 py-2 rounded-lg text-left transition-all duration-200 ${
                      !selectedVariants['variant']
                        ? 'bg-primary text-white shadow-md shadow-primary/25'
                        : 'bg-surface/80 border border-white/10 text-text hover:border-primary/50 hover:bg-white/5'
                    }`}
                  >
                    <span className={`text-xs font-medium ${!selectedVariants['variant'] ? 'text-white' : 'text-text'}`}>
                      {displayProduct.standardVariantLabel || 'Standardna'}
                    </span>
                    <span className={`ml-1.5 text-xs font-bold ${!selectedVariants['variant'] ? 'text-white/90' : 'text-accent'}`}>
                      {displayProduct.price.toFixed(2)} KM
                    </span>
                  </button>
                  )}
                  
                  {/* Custom Variants */}
                  {displayProduct.variants.map((variant) => {
                    const isSelected = selectedVariants['variant'] === variant.id
                    return (
                      <button
                        key={variant.id}
                        type="button"
                        onClick={() => setSelectedVariants({ variant: variant.id })}
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
              </div>
            )}

            {/* Flash Sale Progress */}
            {displayProduct.soldPercent && (
              <div className="bg-danger/10 rounded-2xl p-4 mb-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-danger">🔥 Flash ponuda</span>
                  <span className="text-sm text-danger font-medium">{displayProduct.soldPercent}% prodano</span>
                </div>
                <div className="h-2 bg-danger/20 rounded-full overflow-hidden">
                  <div className="h-full bg-danger rounded-full transition-all" style={{ width: `${displayProduct.soldPercent}%` }} />
                </div>
              </div>
            )}

            {/* Features - Desktop Only */}
            {displayProduct.features && displayProduct.features.length > 0 && (
              <div className="hidden lg:block bg-surface rounded-2xl p-5 mb-5 border border-white/5">
                <h3 className="text-sm font-semibold text-text mb-3">Karakteristike</h3>
                <div className="lg:grid lg:grid-cols-2 lg:gap-3">
                  {displayProduct.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-3 text-sm text-muted">
                      <Check className="w-4 h-4 text-accent flex-shrink-0" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Colors */}
            {displayProduct.colors && displayProduct.colors.length > 0 && (
              <div className="mb-5">
                <span className="text-sm font-medium text-text mb-3 block">Boja</span>
                <div className="flex items-center gap-2">
                  {displayProduct.colors.map((color, index) => (
                    <button 
                      key={color} 
                      onClick={() => setSelectedColor(index)}
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                        selectedColor === index ? 'ring-2 ring-offset-2 ring-offset-background ring-primary scale-110' : 'hover:scale-105'
                      }`}
                      style={{ backgroundColor: color }}
                    >
                      {selectedColor === index && <Check className="w-5 h-5 text-white drop-shadow-md" />}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Stock Information */}
            {(displayProduct.stock !== undefined || (displayProduct.variants && displayProduct.variants.length > 0)) && (
              <div className="mb-4 p-3 bg-surface rounded-xl border border-white/5">
                {displayProduct.variants && displayProduct.variants.length > 0 ? (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted">Dostupnost:</span>
                    {(() => {
                      const selectedVariant = displayProduct.variants.find(v => v.value === selectedVariants['variant'])
                      if (selectedVariant && selectedVariant.stock !== undefined) {
                        return selectedVariant.stock > 0 ? (
                          <span className="text-sm text-accent font-medium">Na stanju ({selectedVariant.stock} kom)</span>
                        ) : (
                          <span className="text-sm text-danger font-medium">Nema na stanju</span>
                        )
                      }
                      return <span className="text-sm text-muted">Odaberite varijantu</span>
                    })()}
                  </div>
                ) : displayProduct.stock !== undefined ? (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted">Dostupnost:</span>
                    {displayProduct.stock > 0 ? (
                      <span className="text-sm text-accent font-medium">Na stanju ({displayProduct.stock} kom)</span>
                    ) : (
                      <span className="text-sm text-danger font-medium">Nema na stanju</span>
                    )}
                  </div>
                ) : null}
              </div>
            )}

            {/* Quantity & Add to Cart */}
            <div className="flex items-center gap-2 mb-5">
              <div className="flex items-center bg-surface rounded-lg border border-white/10">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))} 
                  className="w-10 h-10 lg:w-12 lg:h-12 flex items-center justify-center text-text hover:bg-white/5 rounded-l-lg transition-colors text-lg"
                >
                  −
                </button>
                <span className="w-10 lg:w-12 text-center text-text font-medium">{quantity}</span>
                <button 
                  onClick={() => setQuantity(quantity + 1)} 
                  className="w-10 h-10 lg:w-12 lg:h-12 flex items-center justify-center text-text hover:bg-white/5 rounded-r-lg transition-colors text-lg"
                >
                  +
                </button>
              </div>
              <button 
                onClick={handleAddToCart} 
                className="flex-1 flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white py-2.5 lg:py-3.5 px-4 lg:px-6 rounded-lg lg:rounded-xl font-medium lg:font-semibold text-sm lg:text-base transition-all hover:scale-[1.02] shadow-lg shadow-primary/25"
              >
                <ShoppingCart className="w-4 h-4 lg:w-5 lg:h-5" />
                Dodaj u korpu
              </button>
            </div>

            {/* Buy Now Button */}
            <button 
              onClick={() => {
                const variantParam = selectedVariants['variant'] ? `&variant=${selectedVariants['variant']}` : ''
                router.push(`/checkout/${displayProduct.id}?qty=${quantity}${variantParam}`)
              }}
              className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white py-3 lg:py-3.5 px-4 lg:px-6 rounded-lg lg:rounded-xl font-medium lg:font-semibold text-sm lg:text-base transition-all hover:scale-[1.02] shadow-lg shadow-orange-500/25 mb-5"
            >
              Kupi odmah
            </button>

            {/* Features - Mobile Only */}
            {displayProduct.features && displayProduct.features.length > 0 && (
              <div className="lg:hidden bg-surface rounded-2xl p-5 mb-5 border border-white/5">
                <h3 className="text-sm font-semibold text-text mb-3">Karakteristike</h3>
                <div className="space-y-2">
                  {displayProduct.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-3 text-sm text-muted">
                      <Check className="w-4 h-4 text-accent flex-shrink-0" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Description - Mobile Only */}
            <div className="lg:hidden mb-5">
              <div 
                className="text-muted leading-relaxed text-center whitespace-pre-line"
                dangerouslySetInnerHTML={{ 
                  __html: displayProduct.description
                    ?.replace(/\*\*(.*?)\*\*/g, '<strong class="text-text font-semibold">$1</strong>')
                    .replace(/\*(.*?)\*/g, '<em>$1</em>') || ''
                }}
              />
              
              {/* Product Video - Below Description on Mobile */}
              {hasVideo && (
                <div className="mt-5 pt-5 border-t border-white/5 -mx-5">
                  <div className="relative overflow-hidden w-full">
                    {isEmbedVideo(displayProduct.videoUrl!) ? (
                      <iframe
                        src={getVideoEmbedUrl(displayProduct.videoUrl!)?.replace('?autoplay=1', '') || ''}
                        className="w-full aspect-video"
                        allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    ) : (
                      <video
                        src={displayProduct.videoUrl}
                        controls
                        className="w-full aspect-video"
                        poster={isImageData(displayProduct.image) ? displayProduct.image : undefined}
                      />
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-surface rounded-xl p-3 text-center border border-white/5">
                <Truck className="w-5 h-5 text-accent mx-auto mb-1" />
                <span className="text-xs text-muted">{displayProduct.deliveryTime ? `Dostava ${displayProduct.deliveryTime}` : 'Brza dostava'}</span>
              </div>
              <div className="bg-surface rounded-xl p-3 text-center border border-white/5">
                <Shield className="w-5 h-5 text-accent mx-auto mb-1" />
                <span className="text-xs text-muted">{displayProduct.warrantyText ? `Garancija ${displayProduct.warrantyText}` : 'Garancija'}</span>
              </div>
              <div className="bg-surface rounded-xl p-3 text-center border border-white/5">
                <RotateCcw className="w-5 h-5 text-accent mx-auto mb-1" />
                <span className="text-xs text-muted">{displayProduct.returnDays ? `Povrat ${displayProduct.returnDays} dana` : 'Povrat 14 dana'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Full Width Description - Desktop Only */}
        <div className="hidden lg:block mt-10">
          <div className="bg-surface rounded-2xl p-8 border border-white/5 text-center">
            <h3 className="text-xl font-semibold text-text mb-6">Opis proizvoda</h3>
            <div 
              className="text-muted leading-relaxed max-w-4xl mx-auto text-lg whitespace-pre-line"
              dangerouslySetInnerHTML={{ 
                __html: displayProduct.description
                  ?.replace(/\*\*(.*?)\*\*/g, '<strong class="text-text font-semibold">$1</strong>')
                  .replace(/\*(.*?)\*/g, '<em>$1</em>') || ''
              }}
            />
            
            {/* Product Video - Below Description */}
            {hasVideo && (
              <div className="mt-8 pt-8 border-t border-white/5 -mx-8">
                <div className="relative overflow-hidden w-full">
                  {isEmbedVideo(displayProduct.videoUrl!) ? (
                    <iframe
                      src={getVideoEmbedUrl(displayProduct.videoUrl!)?.replace('?autoplay=1', '') || ''}
                      className="w-full aspect-video"
                      allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <video
                      src={displayProduct.videoUrl}
                      controls
                      className="w-full aspect-video"
                      poster={isImageData(displayProduct.image) ? displayProduct.image : undefined}
                    />
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-12 px-5 lg:px-0">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-text">Slični proizvodi</h2>
              <Link href="/products" className="text-sm text-primary hover:underline">Vidi sve</Link>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 lg:gap-4">
              {relatedProducts.map((item, index) => {
                const badgeInfo = getBadgeStyle(item)
                return (
                  <Link 
                    key={item.id} 
                    href={`/product/${item.slug || item.id}`} 
                    className={`group bg-surface rounded-2xl overflow-hidden hover:shadow-xl hover:shadow-black/20 transition-all border border-white/5 ${index >= 2 ? 'hidden lg:block' : ''}`}
                  >
                    <div className="relative aspect-square bg-gradient-to-br from-white/5 to-transparent flex items-center justify-center overflow-hidden">
                      {item.image && isImageData(item.image) ? (
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <img src="/assets/images/logo.png" alt={item.name} className="w-12 h-12 object-contain opacity-30" />
                      )}
                      {badgeInfo && (
                        <span className={`absolute top-3 left-3 text-[10px] font-medium px-2 py-1 rounded-lg ${badgeInfo.className}`}>
                          {badgeInfo.text}
                        </span>
                      )}
                      <button 
                        onClick={(e) => toggleRelatedWishlist(e, item.id!)} 
                        className="absolute top-3 right-3 p-2 bg-surface/80 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Heart className={`w-4 h-4 ${relatedWishlisted.has(item.id!) ? 'fill-danger text-danger' : 'text-muted'}`} />
                      </button>
                    </div>
                    <div className="p-4">
                      <h4 className="text-sm text-text font-medium truncate mb-2">{item.name}</h4>
                      <div className="flex items-center gap-1 mb-2">
                        {renderStars(item.rating)}
                        <span className="text-xs text-muted ml-1">({item.reviews})</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-primary font-bold">{item.price.toFixed(2)} KM</span>
                          {item.originalPrice && (
                            <span className="text-xs text-muted line-through ml-2">{item.originalPrice.toFixed(2)} KM</span>
                          )}
                        </div>
                        <button 
                          onClick={(e) => handleAddRelatedToCart(e, item)} 
                          className="w-9 h-9 rounded-full bg-primary flex items-center justify-center hover:bg-primary/80 transition-colors"
                        >
                          <Plus className="w-4 h-4 text-white" />
                        </button>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        )}

        {/* Reviews Section */}
        <div className="mt-12 px-5 lg:px-0">
          <h2 className="text-xl font-bold text-text mb-6">Ocjene i recenzije</h2>
          
          {/* Review Summary */}
          {(() => {
            const reviews = displayProduct.productReviews || []
            const totalReviews = reviews.length
            const avgRating = totalReviews > 0 
              ? (reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1)
              : '0.0'
            const ratingCounts = [5, 4, 3, 2, 1].map(stars => 
              reviews.filter(r => r.rating === stars).length
            )
            
            return (
              <div className="bg-surface rounded-2xl p-6 mb-6 border border-white/5">
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-text mb-1">{avgRating}</div>
                    <div className="flex items-center gap-1 justify-center mb-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={`w-4 h-4 ${i < Math.floor(parseFloat(avgRating)) ? 'fill-yellow-400 text-yellow-400' : 'text-muted/30'}`} />
                      ))}
                    </div>
                    <div className="text-xs text-muted">
                      {totalReviews} recenzija
                    </div>
                  </div>
                  <div className="flex-1 space-y-2">
                    {[5, 4, 3, 2, 1].map((stars, index) => {
                      const count = ratingCounts[index]
                      const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0
                      return (
                        <div key={stars} className="flex items-center gap-2">
                          <span className="text-xs text-muted w-3">{stars}</span>
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-yellow-400 rounded-full" 
                              style={{ width: `${percentage}%` }} 
                            />
                          </div>
                          <span className="text-xs text-muted w-6 text-right">{count}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            )
          })()}

          {/* Reviews List */}
          <div className="space-y-4 mb-8">
            {displayProduct.productReviews && displayProduct.productReviews.length > 0 ? (
              displayProduct.productReviews.map((review) => (
                <div key={review.id} className="bg-surface rounded-2xl p-5 border border-white/5">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-2xl">{review.avatar || '👤'}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-text">{review.name}</span>
                        <span className="text-xs text-muted">{review.date}</span>
                      </div>
                      <div className="flex items-center gap-1 mb-2">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted/30'}`} />
                        ))}
                      </div>
                      <p className="text-sm text-muted leading-relaxed">{review.comment}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-surface rounded-2xl p-8 border border-white/5 text-center">
                <Star className="w-12 h-12 text-muted/30 mx-auto mb-3" />
                <p className="text-muted">Još nema recenzija za ovaj proizvod.</p>
                <p className="text-sm text-muted/70 mt-1">Budite prvi koji će ostaviti recenziju!</p>
              </div>
            )}
          </div>

          {/* Write Review */}
          <div className="bg-surface rounded-2xl p-6 border border-white/5">
            <h3 className="text-lg font-semibold text-text mb-4">Napišite recenziju</h3>
            
            <div className="space-y-4">
              {/* Avatar and Name Row */}
              <div className="flex gap-3 items-end">
                {/* Avatar Selector */}
                <div className="flex-shrink-0">
                  <span className="text-xs text-muted block mb-1.5">Ikona</span>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowAvatarPicker(!showAvatarPicker)}
                      className="w-12 h-12 bg-background border border-white/10 rounded-xl flex items-center justify-center text-2xl hover:border-primary/50 transition-colors"
                    >
                      {reviewAvatar}
                    </button>
                    {showAvatarPicker && (
                      <div className="absolute left-0 bottom-full mb-1 bg-surface border border-white/10 rounded-xl p-2 grid grid-cols-8 gap-1 z-50 shadow-xl min-w-[200px]">
                        {avatarEmojis.map((emoji) => (
                          <button
                            key={emoji}
                            type="button"
                            onClick={() => { setReviewAvatar(emoji); setShowAvatarPicker(false); }}
                            className={`w-8 h-8 rounded-lg flex items-center justify-center text-lg hover:bg-white/10 transition-colors ${reviewAvatar === emoji ? 'bg-primary/20' : ''}`}
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
                    value={reviewName}
                    onChange={e => setReviewName(e.target.value)}
                    placeholder="Vaše ime"
                    className="w-full bg-background border border-white/10 rounded-lg px-3 py-2.5 text-sm text-text placeholder:text-muted/50 focus:outline-none focus:border-primary"
                  />
                </div>
              </div>
              
              {/* Rating */}
              <div>
                <span className="text-xs text-muted block mb-1.5">Ocjena</span>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button 
                      key={star} 
                      onClick={() => setReviewRating(star)} 
                      className="hover:scale-110 transition-transform"
                    >
                      <Star className={`w-7 h-7 ${star <= reviewRating ? 'fill-yellow-400 text-yellow-400' : 'text-muted/30 hover:text-yellow-400/50'}`} />
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Comment */}
              <div>
                <span className="text-xs text-muted block mb-1.5">Komentar</span>
                <textarea 
                  value={reviewText} 
                  onChange={(e) => setReviewText(e.target.value)} 
                  placeholder="Podijelite vaše iskustvo sa ovim proizvodom..."
                  className="w-full bg-background border border-white/10 rounded-xl p-4 text-sm text-text placeholder:text-muted resize-none h-28 focus:outline-none focus:border-primary/50" 
                />
              </div>
              
              <button 
                onClick={handleSubmitReview}
                disabled={!reviewName.trim() || !reviewText.trim() || reviewRating === 0 || submittingReview}
                className="w-full bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submittingReview ? 'Slanje...' : 'Pošalji recenziju'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Fixed Bottom Bar - At the very bottom */}
      <div className="fixed bottom-0 left-0 right-0 bg-surface border-t border-white/5 px-4 py-3 lg:hidden z-50 shadow-2xl">
        <div className="flex items-center gap-2">
          {/* Quantity Controls */}
          <div className="flex items-center bg-background rounded-xl border border-white/10">
            <button 
              onClick={() => setQuantity(Math.max(1, quantity - 1))} 
              className="w-10 h-10 flex items-center justify-center text-text hover:bg-white/5 rounded-l-xl transition-colors text-lg font-medium"
            >
              −
            </button>
            <span className="w-10 text-center text-text font-semibold">{quantity}</span>
            <button 
              onClick={() => setQuantity(quantity + 1)} 
              className="w-10 h-10 flex items-center justify-center text-text hover:bg-white/5 rounded-r-xl transition-colors text-lg font-medium"
            >
              +
            </button>
          </div>
          
          {/* Add to Cart Button */}
          <button 
            onClick={handleAddToCart} 
            className="flex-1 flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white py-2.5 rounded-xl font-semibold text-sm transition-all shadow-lg shadow-primary/25"
          >
            <ShoppingCart className="w-4 h-4" />
            Dodaj
          </button>
          
          {/* Buy Now Button */}
          <button 
            onClick={() => {
              const variantParam = selectedVariants['variant'] ? `&variant=${selectedVariants['variant']}` : ''
              router.push(`/checkout/${displayProduct.id}?qty=${quantity}${variantParam}`)
            }}
            className="flex-1 flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white py-2.5 rounded-xl font-semibold text-sm transition-all shadow-lg shadow-orange-500/25"
          >
            Kupi odmah
          </button>
        </div>
      </div>
    </div>
  )
}
