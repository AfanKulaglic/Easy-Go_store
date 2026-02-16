'use client'

import Link from 'next/link'
import { ChevronLeft, Heart, Users, Headphones, TrendingUp, Award } from 'lucide-react'

export default function ONamaPage() {
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
            <h1 className="text-xl lg:text-2xl font-bold text-text">O nama</h1>
            <p className="text-xs text-muted">Upoznajte EasyGo</p>
          </div>
        </div>

        <div className="space-y-6">

          {/* Hero / Welcome */}
          <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl p-6 lg:p-8 border border-primary/20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center mx-auto mb-4">
              <img src="/assets/images/full-logo.png" alt="EasyGo" className="h-8 w-auto" />
            </div>
            <h2 className="text-lg font-bold text-text mb-3">Dobrodošli u EasyGo</h2>
            <p className="text-sm text-muted leading-relaxed max-w-lg mx-auto">
              Od samog početka, glavni cilj je bio da našim kupcima pružimo mogućnost uštede vremena nudeći im raznovrstan asortiman proizvoda.
            </p>
          </div>

          {/* Šta radimo */}
          <div className="bg-surface rounded-2xl p-5 lg:p-6 border border-white/5">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-text mb-1">Više od online kupovine</h2>
              </div>
            </div>
            <p className="text-sm text-muted leading-relaxed">
              Online prodaja EasyGo nije samo kupovina putem interneta, već uključuje i pružanje tehničke podrške kupcima. Naš tim stručnjaka je tu da odgovori na sva pitanja i pruži potrebne informacije kako bi kupci donijeli informisanu odluku prilikom kupovine. Na taj način želimo da obezbijedimo najbolje iskustvo kupovine našim kupcima i da im pomognemo da pronađu proizvod koji najbolje odgovara njihovim potrebama.
            </p>
          </div>

          {/* Posebna narudžba */}
          <div className="bg-surface rounded-2xl p-5 lg:p-6 border border-white/5">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center flex-shrink-0">
                <Headphones className="w-5 h-5 text-accent" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-text mb-1">Posebne narudžbe</h2>
              </div>
            </div>
            <p className="text-sm text-muted leading-relaxed">
              Prateći potrebe naših kupaca i poslovnih partnera za specifičnim i teško dostupnim proizvodima, omogućavamo im mogućnost provjere dostupnosti traženog proizvoda kao i mogućnost narudžbe uz precizno određen rok isporuke.
            </p>
          </div>

          {/* Misija */}
          <div className="bg-surface rounded-2xl p-5 lg:p-6 border border-white/5">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center flex-shrink-0">
                <Heart className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-text mb-1">Vaše povjerenje — naša misija</h2>
              </div>
            </div>
            <p className="text-sm text-muted leading-relaxed">
              Vaše povjerenje od samog osnivanja je naša najveća nagrada i neprekidni podsticaj. Duboko usađena u našoj misiji, posvećenost će nastaviti da nas vodi ka proširenju asortimana proizvoda, unapređenju podrške tokom kupovine i širenju dostupnosti naših usluga. <span className="text-text font-medium">Vaše zadovoljstvo i dalje ostaje naš najviši prioritet.</span>
            </p>
          </div>

        </div>
      </div>
    </div>
  )
}
