'use client'

import { useEffect, Suspense, useRef } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

function IframeSyncInner() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const lastSentPath = useRef<string>('')

  useEffect(() => {
    // Provjeri da li smo unutar iframe-a
    const isInIframe = window.parent !== window
    
    if (isInIframe) {
      const query = searchParams.toString()
      const fullPath = pathname + (query ? '?' + query : '')
      
      // Izbjegni slanje duplikata
      if (lastSentPath.current === fullPath) return
      lastSentPath.current = fullPath
      
      const sendMessage = () => {
        console.log('[IframeSync] Sending navigation:', fullPath)
        
        try {
          window.parent.postMessage({
            type: 'navigation',
            path: fullPath,
            title: document.title || 'EasyGo Store'
          }, '*')
        } catch (e) {
          console.error('[IframeSync] Error sending message:', e)
        }
      }
      
      // Pošalji odmah
      sendMessage()
      
      // Pošalji ponovo nakon kratkog delay-a (za slučaj da parent nije spreman)
      const timeout = setTimeout(sendMessage, 100)
      
      return () => clearTimeout(timeout)
    }
  }, [pathname, searchParams])

  return null
}

export function IframeSync() {
  return (
    <Suspense fallback={null}>
      <IframeSyncInner />
    </Suspense>
  )
}
