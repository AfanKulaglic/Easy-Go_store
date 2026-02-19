import Link from 'next/link'
import { ChevronLeft, Shield, CheckCircle, XCircle, Package, Phone, Mail } from 'lucide-react'

export default function GarancijaPage() {
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
            <h1 className="text-xl lg:text-2xl font-bold text-text">Garancija</h1>
            <p className="text-xs text-muted">Informacije o garanciji na proizvode</p>
          </div>
        </div>

        <div className="space-y-6">

          {/* Garantni period */}
          <div className="bg-surface rounded-2xl p-5 lg:p-6 border border-white/5">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-text mb-1">Garantni period</h2>
                <p className="text-sm text-muted leading-relaxed">
                  Svi proizvodi kupljeni putem našeg online shopa su pokriveni garantnim periodom, definisanim od strane proizvođača. Garancija važi od datuma isporuke proizvoda.
                </p>
              </div>
            </div>
          </div>

          {/* Šta pokriva */}
          <div className="bg-surface rounded-2xl p-5 lg:p-6 border border-white/5">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-5 h-5 text-accent" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-text mb-1">Šta pokriva garancija?</h2>
                <p className="text-sm text-muted leading-relaxed">
                  Garancija pokriva startno neispravne/oštećene proizvode, te fabričke greške koje utiču na ispravnost kupljenog proizvoda. Ukoliko se proizvod pokaže neispravnim u toku garantnog perioda, imaš pravo na <span className="text-text font-medium">popravku, zamjenu ili povrat novca</span>, u skladu sa važećim zakonima.
                </p>
              </div>
            </div>
          </div>

          {/* Izuzeci */}
          <div className="bg-surface rounded-2xl p-5 lg:p-6 border border-white/5">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-danger/20 flex items-center justify-center flex-shrink-0">
                <XCircle className="w-5 h-5 text-danger" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-text mb-1">Izuzeci od garancije</h2>
                <p className="text-sm text-muted leading-relaxed">
                  Garancija ne pokriva štetu prouzrokovanu nepravilnim korištenjem, fizičkim oštećenjem, nepažnjom ili bilo kojim drugim postupkom koji nije u skladu sa uputstvima za upotrebu.
                </p>
              </div>
            </div>
          </div>

          {/* Obaveze kupca */}
          <div className="bg-surface rounded-2xl p-5 lg:p-6 border border-white/5">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-yellow-500/20 flex items-center justify-center flex-shrink-0">
                <Package className="w-5 h-5 text-yellow-400" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-text mb-1">Obaveze kupca</h2>
                <p className="text-sm text-muted leading-relaxed">
                  Kupac je dužan čuvati originalnu ambalažu uređaja dok ne ustanovi potpunu ispravnost istog.
                </p>
              </div>
            </div>
          </div>

          {/* Kontakt */}
          <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl p-5 lg:p-6 border border-primary/20">
            <h2 className="text-base font-semibold text-text mb-4">Kontakt za garanciju</h2>
            <p className="text-sm text-muted mb-4">Za sve upite u vezi sa garancijom, molimo te da nas kontaktiraš putem:</p>
            <div className="space-y-3">
              <a href="mailto:podrska@easygo.ba" className="flex items-center gap-3 text-sm text-muted hover:text-primary transition-colors">
                <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center">
                  <Mail className="w-4 h-4 text-primary" />
                </div>
                podrska@easygo.ba
              </a>
              <a href="tel:+38767123524" className="flex items-center gap-3 text-sm text-muted hover:text-primary transition-colors">
                <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center">
                  <Phone className="w-4 h-4 text-primary" />
                </div>
                +387 67 123 5249
              </a>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
