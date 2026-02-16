'use client'

import Link from 'next/link'
import { ChevronLeft, Shield, Eye, Database, Cookie, UserCheck, Trash2, Mail } from 'lucide-react'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background pb-8">
      <div className="max-w-3xl mx-auto px-4 py-6 lg:px-8">

        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Link
            href="/"
            className="w-10 h-10 rounded-xl bg-surface border border-white/10 flex items-center justify-center hover:bg-white/5 transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-muted" />
          </Link>
          <div>
            <h1 className="text-xl lg:text-2xl font-bold text-text">Politika privatnosti</h1>
            <p className="text-xs text-muted">Posljednje ažuriranje: februar 2026.</p>
          </div>
        </div>

        <div className="space-y-6">

          {/* Uvod */}
          <div className="bg-surface rounded-2xl p-5 lg:p-6 border border-white/5">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-text mb-1">Uvod</h2>
                <p className="text-sm text-muted leading-relaxed">
                  EasyGo (u daljem tekstu: &quot;mi&quot;, &quot;naš&quot; ili &quot;stranica&quot;) poštuje privatnost svojih korisnika. Ova politika privatnosti objašnjava koje podatke prikupljamo, kako ih koristimo i kako ih štitimo, u skladu s Općom uredbom o zaštiti podataka (GDPR) i ePrivacy Direktivom Evropske unije.
                </p>
              </div>
            </div>
          </div>

          {/* Koje podatke prikupljamo */}
          <div className="bg-surface rounded-2xl p-5 lg:p-6 border border-white/5">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center flex-shrink-0">
                <Database className="w-5 h-5 text-accent" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-text mb-1">Koje podatke prikupljamo?</h2>
                <div className="text-sm text-muted leading-relaxed space-y-3 mt-2">
                  <div>
                    <p className="text-text font-medium mb-1">Podaci koje nam dajete direktno:</p>
                    <ul className="list-disc list-inside space-y-1 ml-1">
                      <li>Ime i prezime, email adresa, broj telefona (pri registraciji ili narudžbi)</li>
                      <li>Adresa za dostavu i grad</li>
                      <li>Podaci za prijavu (email i lozinka, šifrovani)</li>
                    </ul>
                  </div>
                  <div>
                    <p className="text-text font-medium mb-1">Podaci koje automatski prikupljamo:</p>
                    <ul className="list-disc list-inside space-y-1 ml-1">
                      <li>Kolačići (cookie) — uz vaš izričit pristanak za neobavezne kategorije</li>
                      <li>Anonimni podaci o pregledu stranica (analitički kolačići)</li>
                      <li>Informacije o uređaju i pregledniku</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Kolačići */}
          <div className="bg-surface rounded-2xl p-5 lg:p-6 border border-white/5">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-secondary/20 flex items-center justify-center flex-shrink-0">
                <Cookie className="w-5 h-5 text-secondary" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-text mb-1">Kolačići (Cookies)</h2>
                <div className="text-sm text-muted leading-relaxed space-y-3 mt-2">
                  <p>Koristimo kolačiće raspoređene u četiri kategorije prema EU GDPR i ePrivacy smjernicama:</p>
                  <div className="space-y-2">
                    <div className="bg-background/60 rounded-xl p-3 border border-white/[0.04]">
                      <p className="text-text font-medium text-xs uppercase tracking-wider mb-1">Neophodni kolačići</p>
                      <p className="text-xs text-muted">Uvijek aktivni. Potrebni za rad stranice — sesija, sigurnost. (easygo_session, easygo_csrf)</p>
                    </div>
                    <div className="bg-background/60 rounded-xl p-3 border border-white/[0.04]">
                      <p className="text-text font-medium text-xs uppercase tracking-wider mb-1">Funkcionalni kolačići</p>
                      <p className="text-xs text-muted">Služe za zapamćivanje vaših postavki poput teme, jezika i nedavno pregledanih proizvoda. (easygo_theme, easygo_lang, easygo_recent)</p>
                    </div>
                    <div className="bg-background/60 rounded-xl p-3 border border-white/[0.04]">
                      <p className="text-text font-medium text-xs uppercase tracking-wider mb-1">Analitički kolačići</p>
                      <p className="text-xs text-muted">Pomažu nam razumjeti kako koristite stranicu. Svi podaci su anonimizirani. (easygo_sid, easygo_pageviews, easygo_first_visit)</p>
                    </div>
                    <div className="bg-background/60 rounded-xl p-3 border border-white/[0.04]">
                      <p className="text-text font-medium text-xs uppercase tracking-wider mb-1">Marketinški kolačići</p>
                      <p className="text-xs text-muted">Koriste se za praćenje izvora posjeta i interesa korisnika. (easygo_ref, easygo_interests)</p>
                    </div>
                  </div>
                  <p>Možete upravljati svojim postavkama kolačića u bilo koje vrijeme klikom na ikonu kolačića u donjem desnom uglu stranice.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Kako koristimo podatke */}
          <div className="bg-surface rounded-2xl p-5 lg:p-6 border border-white/5">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
                <Eye className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-text mb-1">Kako koristimo vaše podatke?</h2>
                <div className="text-sm text-muted leading-relaxed mt-2">
                  <ul className="list-disc list-inside space-y-1 ml-1">
                    <li>Za obradu i dostavu vaših narudžbi</li>
                    <li>Za kreiranje i upravljanje vašim korisničkim računom</li>
                    <li>Za komunikaciju u vezi s narudžbama ili upitima</li>
                    <li>Za poboljšanje funkcionalnosti i sadržaja stranice</li>
                    <li>Za anonimnu analizu korištenja stranice (uz vaš pristanak)</li>
                  </ul>
                  <p className="mt-3">Vaše podatke <span className="text-text font-medium">nikada ne prodajemo</span> trećim stranama.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Vaša prava */}
          <div className="bg-surface rounded-2xl p-5 lg:p-6 border border-white/5">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center flex-shrink-0">
                <UserCheck className="w-5 h-5 text-accent" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-text mb-1">Vaša prava prema GDPR-u</h2>
                <div className="text-sm text-muted leading-relaxed mt-2">
                  <p className="mb-2">Prema Općoj uredbi o zaštiti podataka (GDPR), imate sljedeća prava:</p>
                  <ul className="list-disc list-inside space-y-1 ml-1">
                    <li><span className="text-text font-medium">Pravo pristupa</span> — zatražite kopiju svih podataka koje imamo o vama</li>
                    <li><span className="text-text font-medium">Pravo na ispravku</span> — ispravite netačne podatke</li>
                    <li><span className="text-text font-medium">Pravo na brisanje</span> — zatražite brisanje vaših podataka</li>
                    <li><span className="text-text font-medium">Pravo na ograničenje obrade</span> — ograničite kako koristimo vaše podatke</li>
                    <li><span className="text-text font-medium">Pravo na prenosivost</span> — dobijte vaše podatke u strukturiranom formatu</li>
                    <li><span className="text-text font-medium">Pravo na prigovor</span> — uložite prigovor na obradu vaših podataka</li>
                    <li><span className="text-text font-medium">Pravo na povlačenje pristanka</span> — povucite pristanak za kolačiće ili obradu podataka u bilo koje vrijeme</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Brisanje podataka */}
          <div className="bg-surface rounded-2xl p-5 lg:p-6 border border-white/5">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-danger/20 flex items-center justify-center flex-shrink-0">
                <Trash2 className="w-5 h-5 text-danger" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-text mb-1">Brisanje podataka</h2>
                <p className="text-sm text-muted leading-relaxed">
                  Možete zatražiti potpuno brisanje svih vaših podataka slanjem emaila na adresu ispod. Zahtjev će biti obrađen u roku od 30 dana, u skladu s GDPR-om.
                </p>
              </div>
            </div>
          </div>

          {/* Kontakt */}
          <div className="bg-surface rounded-2xl p-5 lg:p-6 border border-white/5">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
                <Mail className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-text mb-1">Kontakt za privatnost</h2>
                <p className="text-sm text-muted leading-relaxed">
                  Za sva pitanja u vezi s vašom privatnošću ili ostvarivanje vaših prava, kontaktirajte nas putem{' '}
                  <Link href="/contact" className="text-primary hover:underline">stranice za kontakt</Link>{' '}
                  ili na email: <span className="text-text font-medium">privacy@easygo.ba</span>
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
