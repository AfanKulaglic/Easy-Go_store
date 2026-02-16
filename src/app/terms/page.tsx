'use client'

import Link from 'next/link'
import { ChevronLeft, FileText, ShoppingCart, Ban, RotateCcw, Scale, AlertTriangle, Mail } from 'lucide-react'

export default function TermsPage() {
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
            <h1 className="text-xl lg:text-2xl font-bold text-text">Uslovi korištenja</h1>
            <p className="text-xs text-muted">Posljednje ažuriranje: februar 2026.</p>
          </div>
        </div>

        <div className="space-y-6">

          {/* Opći uslovi */}
          <div className="bg-surface rounded-2xl p-5 lg:p-6 border border-white/5">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-text mb-1">Opći uslovi</h2>
                <div className="text-sm text-muted leading-relaxed space-y-2">
                  <p>
                    Korištenjem web stranice EasyGo (u daljem tekstu: &quot;stranica&quot;) prihvatate ove uslove korištenja u cijelosti. Ako se ne slažete s bilo kojim dijelom ovih uslova, molimo vas da ne koristite stranicu.
                  </p>
                  <p>
                    Zadržavamo pravo izmjene ovih uslova u bilo kojem trenutku. Promjene stupaju na snagu objavljivanjem na stranici. Nastavak korištenja stranice nakon objave promjena smatra se prihvatanjem novih uslova.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Kupovina i narudžbe */}
          <div className="bg-surface rounded-2xl p-5 lg:p-6 border border-white/5">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center flex-shrink-0">
                <ShoppingCart className="w-5 h-5 text-accent" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-text mb-1">Kupovina i narudžbe</h2>
                <div className="text-sm text-muted leading-relaxed space-y-2">
                  <ul className="list-disc list-inside space-y-1 ml-1">
                    <li>Sve cijene na stranici su izražene u konvertibilnim markama (KM) i uključuju PDV.</li>
                    <li>Narudžba se smatra potvrđenom nakon što dobijete potvrdu putem e-maila ili telefona.</li>
                    <li>Zadržavamo pravo odbijanja narudžbe u slučaju nedostupnosti proizvoda ili grešaka u cijenama.</li>
                    <li>Isporuka se vrši na adresu navedenu prilikom narudžbe.</li>
                    <li>Rokovi isporuke su navedeni na stranici <Link href="/dostava" className="text-primary hover:underline">Dostava</Link>.</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Pravo na odustajanje */}
          <div className="bg-surface rounded-2xl p-5 lg:p-6 border border-white/5">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-secondary/20 flex items-center justify-center flex-shrink-0">
                <RotateCcw className="w-5 h-5 text-secondary" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-text mb-1">Pravo na odustajanje</h2>
                <div className="text-sm text-muted leading-relaxed space-y-2">
                  <p>
                    U skladu sa Zakonom o zaštiti potrošača u BiH, imate pravo odustati od kupovine u roku od <span className="text-text font-medium">14 dana</span> od dana prijema proizvoda, bez navođenja razloga.
                  </p>
                  <ul className="list-disc list-inside space-y-1 ml-1">
                    <li>Proizvod mora biti neoštećen, u originalnom pakovanju.</li>
                    <li>Troškove povratne dostave snosi kupac, osim u slučaju neispravnog proizvoda.</li>
                    <li>Povrat novca se vrši u roku od 14 dana od prijema vraćenog proizvoda.</li>
                  </ul>
                  <p>Za više detalja, pogledajte stranicu <Link href="/reklamacije" className="text-primary hover:underline">Reklamacije</Link>.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Ograničenje odgovornosti */}
          <div className="bg-surface rounded-2xl p-5 lg:p-6 border border-white/5">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-danger/20 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5 text-danger" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-text mb-1">Ograničenje odgovornosti</h2>
                <div className="text-sm text-muted leading-relaxed space-y-2">
                  <ul className="list-disc list-inside space-y-1 ml-1">
                    <li>Trudimo se da sve informacije na stranici budu tačne i ažurne, ali ne garantujemo apsolutnu tačnost.</li>
                    <li>Slike proizvoda mogu se razlikovati od stvarnog izgleda.</li>
                    <li>Ne odgovaramo za štetu nastalu zbog nepravilnog korištenja proizvoda.</li>
                    <li>Stranica može povremeno biti nedostupna zbog održavanja ili tehničkih razloga.</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Zabranjena upotreba */}
          <div className="bg-surface rounded-2xl p-5 lg:p-6 border border-white/5">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-danger/20 flex items-center justify-center flex-shrink-0">
                <Ban className="w-5 h-5 text-danger" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-text mb-1">Zabranjena upotreba</h2>
                <div className="text-sm text-muted leading-relaxed">
                  <p className="mb-2">Zabranjeno je:</p>
                  <ul className="list-disc list-inside space-y-1 ml-1">
                    <li>Korištenje stranice za nezakonite svrhe</li>
                    <li>Pokušaj neovlaštenog pristupa sistemima ili podacima</li>
                    <li>Kopiranje, distribuiranje ili modifikovanje sadržaja bez dozvole</li>
                    <li>Korištenje automatiziranih alata za prikupljanje podataka</li>
                    <li>Slanje neželjene pošte ili lažnih narudžbi</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Primjenjivo pravo */}
          <div className="bg-surface rounded-2xl p-5 lg:p-6 border border-white/5">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
                <Scale className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-text mb-1">Primjenjivo pravo</h2>
                <p className="text-sm text-muted leading-relaxed">
                  Na ove uslove korištenja primjenjuje se zakonodavstvo Bosne i Hercegovine. Svi eventualni sporovi rješavat će se pred nadležnim sudom u BiH.
                  Za pitanja o zaštiti podataka, primjenjuju se odredbe GDPR-a Evropske unije.
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
                <h2 className="text-base font-semibold text-text mb-1">Kontakt</h2>
                <p className="text-sm text-muted leading-relaxed">
                  Za sva pitanja u vezi s uslovima korištenja, kontaktirajte nas putem{' '}
                  <Link href="/contact" className="text-primary hover:underline">stranice za kontakt</Link>{' '}
                  ili na email: <span className="text-text font-medium">info@easygo.ba</span>
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
