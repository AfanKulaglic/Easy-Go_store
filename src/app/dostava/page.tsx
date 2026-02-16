'use client'

import Link from 'next/link'
import { ChevronLeft, Truck, MapPin, Package, Search, Headphones, CreditCard, Calendar } from 'lucide-react'

export default function DostavaPage() {
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
            <h1 className="text-xl lg:text-2xl font-bold text-text">Dostava</h1>
            <p className="text-xs text-muted">Sve informacije o dostavi vaših narudžbi</p>
          </div>
        </div>

        {/* Intro */}
        <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl p-5 lg:p-6 border border-primary/20 mb-6">
          <p className="text-sm text-muted leading-relaxed">
            Kako bi ti omogućili brzu i pouzdanu dostavu tvojih narudžbi, koristimo usluge <span className="text-text font-medium">X Express</span> i <span className="text-text font-medium">BH Express</span> brze pošte. Evo nekoliko važnih informacija o tome kako funkcionira dostava putem brze pošte:
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">

          {/* Brza dostava */}
          <div className="bg-surface rounded-2xl p-5 border border-white/5">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center mb-3">
              <Truck className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-base font-semibold text-text mb-2">Brza i efikasna dostava</h2>
            <p className="text-sm text-muted leading-relaxed">
              Naša partnerska brza pošta omogućuje nam isporuku vaših narudžbi brzo i efikasno. To znači da ćeš svoje proizvode dobiti u roku od <span className="text-text font-medium">1-2 radna dana</span>.
            </p>
          </div>

          {/* Praćenje */}
          <div className="bg-surface rounded-2xl p-5 border border-white/5">
            <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center mb-3">
              <Search className="w-5 h-5 text-accent" />
            </div>
            <h2 className="text-base font-semibold text-text mb-2">Prati tvoju pošiljku</h2>
            <p className="text-sm text-muted leading-relaxed">
              Nakon što vaša narudžba bude poslana, dobit ćeš broj za praćenje pošiljke putem mail-a. To ti omogućava da jednostavno pratiš status isporuke putem interneta i budeš informiran o kretanju tvoje narudžbe.
            </p>
          </div>

          {/* Sigurno pakovanje */}
          <div className="bg-surface rounded-2xl p-5 border border-white/5">
            <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center mb-3">
              <Package className="w-5 h-5 text-green-400" />
            </div>
            <h2 className="text-base font-semibold text-text mb-2">Sigurno pakovanje</h2>
            <p className="text-sm text-muted leading-relaxed">
              Tvoji proizvodi bit će pažljivo i sigurno zapakovani kako bi se osiguralo da stignu u savršenom stanju.
            </p>
          </div>

          {/* Podrška */}
          <div className="bg-surface rounded-2xl p-5 border border-white/5">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center mb-3">
              <Headphones className="w-5 h-5 text-blue-400" />
            </div>
            <h2 className="text-base font-semibold text-text mb-2">Briga o tvojim potrebama</h2>
            <p className="text-sm text-muted leading-relaxed">
              Naš tim za podršku kupcima stoji vam na raspolaganju kako bi odgovorio na bilo kakva pitanja ili pružio pomoć u vezi s dostavom. Kontaktiraj nas ako trebaš dodatne informacije ili ako se suočavaš s bilo kakvim izazovima tokom dostave.
            </p>
          </div>

          {/* Troškovi */}
          <div className="bg-surface rounded-2xl p-5 border border-white/5">
            <div className="w-10 h-10 rounded-xl bg-yellow-500/20 flex items-center justify-center mb-3">
              <CreditCard className="w-5 h-5 text-yellow-400" />
            </div>
            <h2 className="text-base font-semibold text-text mb-2">Troškovi dostave</h2>
            <p className="text-sm text-muted leading-relaxed">
              Troškove dostave snosimo mi, plaćate samo cijenu proizvoda prilikom preuzimanja <span className="text-text font-medium">bez skrivenih troškova</span>.
            </p>
          </div>

          {/* Dostupnost */}
          <div className="bg-surface rounded-2xl p-5 border border-white/5">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center mb-3">
              <Calendar className="w-5 h-5 text-purple-400" />
            </div>
            <h2 className="text-base font-semibold text-text mb-2">Dostupnost dostave</h2>
            <p className="text-sm text-muted leading-relaxed">
              Dostava putem Brze Pošte dostupna je na području <span className="text-text font-medium">cijele BiH</span> tokom 5 radnih dana. Dostava proizvoda se vrši do ulaza kuće ili zgrade. Dostava ne podrazumijeva unos u stan/kuću, kao ni montažu uređaja.
            </p>
          </div>

        </div>
      </div>
    </div>
  )
}
