'use client'

import Link from 'next/link'
import { ArrowRight, Sparkles } from 'lucide-react'

interface PromoBannerProps {
  title: string
  subtitle?: string
  buttonText: string
  href: string
  variant?: 'primary' | 'danger' | 'accent' | 'women'
  emoji?: string
}

export default function PromoBanner({ 
  title, 
  subtitle,
  buttonText, 
  href,
  variant = 'danger',
  emoji = '💄'
}: PromoBannerProps) {
  const gradients = {
    danger: 'from-danger via-red-500 to-orange-500',
    primary: 'from-primary via-indigo-500 to-purple-500',
    accent: 'from-accent via-emerald-500 to-teal-500',
    women: 'from-pink-500 via-rose-400 to-fuchsia-500'
  }

  // Specijalni dizajn za žensku ponudu
  if (variant === 'women') {
    return (
      <section className="px-4 py-4 lg:px-0 lg:py-0">
        <Link 
          href={href}
          className="group block bg-gradient-to-br from-pink-500 via-rose-400 to-fuchsia-500 rounded-2xl lg:rounded-3xl p-6 lg:p-8 relative overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-pink-500/30 hover:scale-[1.01]"
        >
          {/* Animated background elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl animate-pulse" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-fuchsia-300/20 rounded-full translate-y-1/2 -translate-x-1/4 blur-2xl" />
            <div className="absolute top-1/2 left-1/2 w-32 h-32 bg-rose-200/10 rounded-full blur-xl" />
            
            {/* Floating sparkles */}
            <Sparkles className="absolute top-4 right-12 w-6 h-6 text-white/40 animate-bounce" style={{ animationDelay: '0.2s' }} />
            <Sparkles className="absolute bottom-8 right-1/4 w-4 h-4 text-white/30 animate-bounce" style={{ animationDelay: '0.5s' }} />
            <Sparkles className="absolute top-1/3 left-1/3 w-5 h-5 text-white/20 animate-bounce" style={{ animationDelay: '0.8s' }} />
          </div>
          
          <div className="relative z-10 flex items-center justify-between">
            <div className="max-w-[55%] lg:max-w-[60%]">
              {/* Discount badge */}
              <div className="inline-flex items-center gap-1.5 bg-white/25 backdrop-blur-sm text-white text-xs lg:text-sm font-bold px-3 py-1.5 rounded-full mb-3 lg:mb-4">
                <Sparkles className="w-3.5 h-3.5" />
                <span>POSEBNA PONUDA</span>
              </div>
              
              <h3 className="text-2xl lg:text-3xl xl:text-4xl font-extrabold text-white mb-2 lg:mb-3 leading-tight drop-shadow-sm">
                {title}
              </h3>
              
              {subtitle && (
                <p className="text-white/90 text-sm lg:text-base mb-4 lg:mb-5 font-medium">{subtitle}</p>
              )}
              
              <span className="inline-flex items-center gap-2 bg-white text-pink-600 text-sm lg:text-base font-bold px-6 py-3 lg:px-7 lg:py-3.5 rounded-full shadow-lg transition-all duration-300 group-hover:gap-3 group-hover:shadow-xl group-hover:bg-pink-50">
                {buttonText}
                <ArrowRight className="w-4 h-4 lg:w-5 lg:h-5 transition-transform group-hover:translate-x-1" />
              </span>
            </div>
            
            {/* Decorative emoji section */}
            <div className="flex items-center justify-center relative">
              <div className="absolute inset-0 bg-white/10 rounded-full blur-2xl scale-150" />
              <div className="relative flex flex-col items-center gap-1">
                <span className="text-5xl lg:text-7xl xl:text-8xl drop-shadow-2xl transition-transform duration-500 group-hover:scale-110">
                  👗
                </span>
                <span className="text-3xl lg:text-4xl xl:text-5xl drop-shadow-xl transition-transform duration-500 group-hover:scale-110 -mt-2">
                  👠💄
                </span>
              </div>
            </div>
          </div>
        </Link>
      </section>
    )
  }

  return (
    <section className="px-4 py-4 lg:px-0 lg:py-0">
      <Link 
        href={href}
        className={`group block bg-gradient-to-r ${gradients[variant]} rounded-2xl lg:rounded-3xl p-6 lg:p-8 relative overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-${variant}/20 hover:scale-[1.01]`}
      >
        {/* Background decorations */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
        <div className="absolute bottom-0 left-1/4 w-32 h-32 bg-white/10 rounded-full translate-y-1/2 blur-xl" />
        <div className="absolute top-1/2 right-1/4 w-20 h-20 bg-white/5 rounded-full blur-lg" />
        
        <div className="relative z-10 flex items-center justify-between">
          <div className="max-w-[60%] lg:max-w-[65%]">
            <h3 className="text-xl lg:text-2xl xl:text-3xl font-bold text-white mb-2 lg:mb-3 leading-tight">
              {title}
            </h3>
            {subtitle && (
              <p className="text-white/80 text-sm lg:text-base mb-4 lg:mb-5">{subtitle}</p>
            )}
            <span className="inline-flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white text-sm lg:text-base font-semibold px-5 py-2.5 lg:px-6 lg:py-3 rounded-xl transition-all group-hover:gap-3">
              {buttonText}
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </span>
          </div>
          
          {/* Emoji/Image */}
          <div className="flex items-center justify-center">
            <span className="text-6xl lg:text-8xl xl:text-9xl drop-shadow-2xl transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6">
              {emoji}
            </span>
          </div>
        </div>
      </Link>
    </section>
  )
}
