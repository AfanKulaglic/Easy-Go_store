'use client'

import { useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useCartStore } from '@/store/cartStore'

export function CartSync() {
  const { user } = useAuth()
  const setUserId = useCartStore((state) => state.setUserId)

  useEffect(() => {
    setUserId(user?.uid || null)
  }, [user?.uid, setUserId])

  return null
}
