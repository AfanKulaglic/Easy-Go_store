'use client'

import { useEffect, useState } from 'react'

interface Loading3DProps {
  progress?: number
  text?: string
  showProgress?: boolean
}

export function Loading3D({ progress = 0, text = 'Učitavanje...', showProgress = true }: Loading3DProps) {
  const [smoothProgress, setSmoothProgress] = useState(0)
  const [fakeProgress, setFakeProgress] = useState(0)
  
  // Fake progress that climbs toward 99% with diminishing speed, then snaps to real progress when it catches up
  useEffect(() => {
    if (progress >= 100) {
      setFakeProgress(100)
      return
    }
    if (progress > fakeProgress) {
      setFakeProgress(progress)
      return
    }
    const interval = setInterval(() => {
      setFakeProgress(prev => {
        if (prev >= 99) {
          clearInterval(interval)
          return 99
        }
        // Fast at first, slows down as it approaches 99
        const remaining = 99 - prev
        const increment = Math.max(0.3, remaining * 0.08)
        return Math.min(prev + increment, 99)
      })
    }, 50)
    return () => clearInterval(interval)
  }, [progress, fakeProgress])
  
  // Smooth animation for display
  useEffect(() => {
    const target = Math.max(fakeProgress, progress)
    const step = () => {
      setSmoothProgress(prev => {
        const diff = target - prev
        if (Math.abs(diff) < 0.5) return target
        return prev + diff * 0.15
      })
    }
    const interval = setInterval(step, 16)
    return () => clearInterval(interval)
  }, [fakeProgress, progress])

  const displayProgress = Math.min(smoothProgress, 100)

  return (
    <div className="fixed inset-0 bg-background z-[9999] flex items-center justify-center">
      <div className="text-center w-full max-w-xs px-6">
        
        {/* Brand name above */}
        <h2 className="text-2xl font-bold text-text mb-10">EasyGo</h2>

        {/* Progress bar with logo at the end */}
        {showProgress && (
          <div className="relative mb-8">
            {/* Progress bar track */}
            <div className="h-1.5 bg-white/10 rounded-full overflow-visible relative">
              {/* Progress fill */}
              <div 
                className="h-full rounded-full"
                style={{ 
                  width: `${displayProgress}%`,
                  background: 'linear-gradient(90deg, #3B82F6, #00C9A7)',
                  boxShadow: '0 0 15px rgba(59,130,246,0.5)',
                  transition: 'width 0.15s ease-out'
                }}
              />
              
              {/* Logo at the end of progress */}
              <div 
                className="absolute top-1/2 -translate-y-1/2 transition-all duration-150 ease-out"
                style={{ 
                  left: `${displayProgress}%`,
                  transform: `translateX(-50%) translateY(-50%)`
                }}
              >
                {/* Glow */}
                <div className="absolute inset-0 bg-primary/50 rounded-full blur-lg scale-150" />
                
                {/* Logo */}
                <div className="relative w-10 h-10">
                  <img 
                    src="/assets/images/logo.png" 
                    alt="EasyGo" 
                    className="w-full h-full object-contain drop-shadow-[0_0_10px_rgba(59,130,246,0.8)]"
                  />
                </div>
              </div>
            </div>
            
            {/* Percentage */}
            <p className="text-sm text-muted mt-6 font-medium">{Math.round(displayProgress)}%</p>
          </div>
        )}

        {/* Loading text */}
        <p className="text-sm text-muted">{text}</p>

        {/* Animated dots */}
        <div className="flex items-center justify-center gap-1.5 mt-3">
          <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]" />
          <div className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce [animation-delay:-0.15s]" />
          <div className="w-1.5 h-1.5 bg-secondary rounded-full animate-bounce" />
        </div>
      </div>
    </div>
  )
}

export function Loading3DSmall() {
  return (
    <div className="flex items-center gap-2">
      <div className="w-6 h-6">
        <img 
          src="/assets/images/logo.png" 
          alt="Loading" 
          className="w-full h-full object-contain animate-pulse"
        />
      </div>
      <div className="flex items-center gap-1">
        <div className="w-1 h-1 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]" />
        <div className="w-1 h-1 bg-accent rounded-full animate-bounce [animation-delay:-0.15s]" />
        <div className="w-1 h-1 bg-secondary rounded-full animate-bounce" />
      </div>
    </div>
  )
}
