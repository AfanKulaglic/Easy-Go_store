'use client'

import Link from 'next/link'
import { Mail, Phone, MapPin, Facebook, Instagram, MessageCircle } from 'lucide-react'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="hidden lg:block bg-surface border-t border-white/5 mt-auto">
      <div className="max-w-7xl mx-auto px-8 py-12">
        <div className="grid grid-cols-4 gap-8">
          {/* Logo & About */}
          <div className="col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <img src="/assets/images/full-logo.png" alt="EasyGo" className="h-8 w-auto" />
            </Link>
            <p className="text-sm text-muted leading-relaxed mb-4">
              Vaša pouzdana online destinacija za kupovinu. Kvalitetni proizvodi po najboljim cijenama.
            </p>
            <div className="flex items-center gap-3">
              <a href="https://www.facebook.com/profile.php?id=61569683799611" target="_blank" rel="noopener noreferrer" className="p-2 bg-white/5 rounded-lg hover:bg-primary/20 hover:text-primary transition-colors">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="https://www.instagram.com/easygo.bih/" target="_blank" rel="noopener noreferrer" className="p-2 bg-white/5 rounded-lg hover:bg-primary/20 hover:text-primary transition-colors">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="https://www.youtube.com/@easygo-reviews" target="_blank" rel="noopener noreferrer" className="p-2 bg-white/5 rounded-lg hover:bg-primary/20 hover:text-primary transition-colors">
                <MessageCircle className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-text mb-4">Brzi linkovi</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-sm text-muted hover:text-primary transition-colors">
                  Početna
                </Link>
              </li>
              <li>
                <Link href="/products" className="text-sm text-muted hover:text-primary transition-colors">
                  Svi proizvodi
                </Link>
              </li>
              <li>
                <Link href="/cart" className="text-sm text-muted hover:text-primary transition-colors">
                  Korpa
                </Link>
              </li>
              <li>
                <Link href="/chat" className="text-sm text-muted hover:text-primary transition-colors">
                  Kontakt
                </Link>
              </li>
            </ul>
          </div>

          {/* Informacije */}
          <div>
            <h4 className="text-sm font-semibold text-text mb-4">Informacije</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/o-nama" className="text-sm text-muted hover:text-primary transition-colors">
                  O nama
                </Link>
              </li>
              <li>
                <Link href="/dostava" className="text-sm text-muted hover:text-primary transition-colors">
                  Dostava
                </Link>
              </li>
              <li>
                <Link href="/garancija" className="text-sm text-muted hover:text-primary transition-colors">
                  Garancija
                </Link>
              </li>
              <li>
                <Link href="/reklamacije" className="text-sm text-muted hover:text-primary transition-colors">
                  Reklamacije i povrat
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-semibold text-text mb-4">Kontakt</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm text-muted">
                <Phone className="w-4 h-4 text-primary" />
                <span>+387 67 123 5249</span>
              </li>
              <li className="flex items-center gap-2 text-sm text-muted">
                <Mail className="w-4 h-4 text-primary" />
                <span>podrska@easygo.ba</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-muted">
                <MapPin className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                <span>Bosna i Hercegovina</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/5 mt-8 pt-6 flex items-center justify-between">
          <p className="text-xs text-muted">
            © {currentYear} EasyGo. Sva prava zadržana.
          </p>
          <div className="flex items-center gap-4">
            <span className="text-xs text-muted">Plaćanje pouzećem</span>
            <span className="text-xs text-accent">Besplatna dostava</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
