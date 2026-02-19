'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, MessageCircle, ShoppingCart, Package } from 'lucide-react'
import { useCartStore } from '@/store/cartStore'
import { useState, useEffect } from 'react'

export default function BottomNav() {
  const pathname = usePathname()
  const totalItems = useCartStore((state) => state.getTotalItems())
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const navItems = [
    { href: '/', icon: Home, label: 'Početna' },
    { href: '/chat', icon: MessageCircle, label: 'Chat' },
    { href: '/cart', icon: ShoppingCart, label: 'Korpa', badge: totalItems },
    { href: '/tracking', icon: Package, label: 'Narudžbe' },
  ]

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-surface border-t border-white/10 z-40 safe-area-inset-bottom">
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map(({ href, icon: Icon, label, badge }) => {
          const isActive = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-xl transition-all min-w-[70px] ${
                isActive 
                  ? 'text-primary' 
                  : 'text-text/60 hover:text-text hover:bg-white/5'
              }`}
            >
              <div className="relative">
                <Icon className="w-5 h-5" />
                {badge && mounted && badge > 0 && (
                  <span className="absolute -top-2 -right-2 w-4 h-4 bg-danger rounded-full text-[10px] flex items-center justify-center text-white font-bold">
                    {badge > 9 ? '9+' : badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
