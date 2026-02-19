import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { ThemeProvider } from '@/context/ThemeContext'
import { AuthProvider } from '@/context/AuthContext'
import { DataCacheProvider } from '@/context/DataCacheContext'
import { GlobalLoader } from '@/components/GlobalLoader'
import { IframeSync } from '@/components/IframeSync'
import { CartSync } from '@/components/CartSync'
import LazyCookieConsent from '@/components/LazyCookieConsent'

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  preload: true,
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: {
    default: 'EasyGo - Smart Solutions',
    template: '%s | EasyGo'
  },
  description: 'Vasa pouzdana online destinacija za kupovinu. Kvalitetni proizvodi po najboljim cijenama. Brza dostava sirom BiH.',
  keywords: ['online shop', 'prodavnica', 'BiH', 'smart solutions', 'easygo', 'kupovina online'],
  authors: [{ name: 'EasyGo' }],
  creator: 'EasyGo',
  publisher: 'EasyGo',
  icons: {
    icon: '/assets/images/logo.png',
    apple: '/assets/images/logo.png',
  },
  manifest: '/manifest.json',
  openGraph: {
    type: 'website',
    locale: 'bs_BA',
    url: 'https://easygo.ba',
    title: 'EasyGo - Smart Solutions',
    description: 'Vasa pouzdana online destinacija za kupovinu',
    siteName: 'EasyGo',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="bs" data-theme="dark" suppressHydrationWarning>
      <head>
        <link rel="dns-prefetch" href="https://easygo-a9fd0-default-rtdb.firebaseio.com" />
        <link rel="preconnect" href="https://easygo-a9fd0-default-rtdb.firebaseio.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://firebasestorage.googleapis.com" />
      </head>
      <body className={`${inter.className} bg-background text-text min-h-screen flex flex-col antialiased`} suppressHydrationWarning>
        <ThemeProvider>
          <AuthProvider>
          <DataCacheProvider>
            <GlobalLoader>
              <CartSync />
              <IframeSync />
              <Header />
              <main className="pt-16 lg:pt-20 pb-8 flex-1">
                  {children}
              </main>
              <Footer />
              <LazyCookieConsent />
            </GlobalLoader>
          </DataCacheProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
