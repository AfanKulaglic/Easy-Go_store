'use client'

import Link from 'next/link'
import { ChevronLeft, AlertTriangle, Camera, Clock, Phone, Mail, PackageX, CheckCircle, XCircle } from 'lucide-react'

export default function ReklamacijePage() {
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
            <h1 className="text-xl lg:text-2xl font-bold text-text">Reklamacije i povrat</h1>
            <p className="text-xs text-muted">Informacije o reklamacijama i povratu proizvoda</p>
          </div>
        </div>

        <div className="space-y-6">

          {/* Intro */}
          <div className="bg-surface rounded-2xl p-5 lg:p-6 border border-white/5">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-warning/20 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5 text-yellow-400" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-text mb-1">Rok za prijavu</h2>
                <p className="text-sm text-muted leading-relaxed">
                  Molimo da sve primjedbe na proizvod prijaviš unutar <span className="text-text font-medium">7 dana</span> od datuma kupovine.
                </p>
              </div>
            </div>
          </div>

          {/* Pregled pri preuzimanju */}
          <div className="bg-surface rounded-2xl p-5 lg:p-6 border border-white/5">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
                <Camera className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-text mb-1">Pregled pri preuzimanju</h2>
              </div>
            </div>
            <div className="space-y-3 text-sm text-muted leading-relaxed">
              <p>
                Kupac je nakon preuzimanja proizvoda dužan da pregleda da li na istom ima vidljivih fizičkih oštećenja do kojih je eventualno došlo prilikom dostave, te isti dan dostavi fotografije oštećenja. <span className="text-text font-medium">Sve naknadne primjedbe o oštećenjima nastalim prilikom dostave kurirskom službom nećemo uzimati u obzir.</span>
              </p>
              <p>
                Primjedbe na oštećene proizvode potrebno je da nam prijaviš u što kraćem roku. Prilikom preuzimanja pošiljke od strane kurirske službe molimo te da otvoriš i pregledaš pošiljku.
              </p>
              <p>
                Ukoliko ista ima fizička oštećenja potrebno je da nam odmah putem Viber broja dostaviš slike oštećenja i ambalažu proizvoda u što kraćem roku od preuzimanja pošiljke.
              </p>
            </div>
          </div>

          {/* Troškovi i rokovi */}
          <div className="bg-surface rounded-2xl p-5 lg:p-6 border border-white/5">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center flex-shrink-0">
                <Clock className="w-5 h-5 text-accent" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-text mb-1">Troškovi i rokovi povrata</h2>
              </div>
            </div>
            <div className="space-y-3 text-sm text-muted leading-relaxed">
              <p>
                Direktne troškove vraćanja robe u slučaju povrata snosi kupac. Po isteku roka od <span className="text-text font-medium">7 dana</span> od dana kada je primljena pošiljka, proizvod se više ne može vratiti.
              </p>
              <p>
                Po prijemu proizvoda, utvrdiće se da li je proizvod ispravan i neoštećen. Kupac odgovara za neispravnost ili oštećenje proizvoda koji su rezultat neadekvatnog rukovanja proizvodom, tj. kupac je isključivo odgovoran za umanjenu vrijednost proizvoda koja nastane kao posljedica rukovanja robom na način koji nije adekvatan.
              </p>
              <p>
                Ukoliko se utvrdi da je nastupila neispravnost ili oštećenje proizvoda krivicom kupca, odbiće se povrat i proizvod će mu biti vraćen na njegov trošak.
              </p>
            </div>
          </div>

          {/* Izuzeci */}
          <div className="bg-surface rounded-2xl p-5 lg:p-6 border border-white/5">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-danger/20 flex items-center justify-center flex-shrink-0">
                <XCircle className="w-5 h-5 text-danger" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-text mb-1">Kada ne možemo uvažiti reklamaciju</h2>
              </div>
            </div>
            <ul className="space-y-2.5 text-sm text-muted">
              <li className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-danger mt-1.5 flex-shrink-0" />
                Kada proizvod pokaže znakove oštećenja uzrokovanih nestručnim rukovanjem ili upotrebom.
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-danger mt-1.5 flex-shrink-0" />
                Kada je očigledno da je proizvod korišten.
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-danger mt-1.5 flex-shrink-0" />
                Kada su prisutna mehanička i fizička oštećenja na proizvodu.
              </li>
            </ul>
            <p className="text-sm text-muted mt-4 leading-relaxed">
              U slučaju povrata proizvoda koji nema oštećenja i tehničkih nedostataka, trošak povrata proizvoda snosi kupac.
            </p>
          </div>

          {/* Kontakt */}
          <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl p-5 lg:p-6 border border-primary/20">
            <h2 className="text-base font-semibold text-text mb-4">Prijavi reklamaciju</h2>
            <p className="text-sm text-muted mb-4">Sve reklamacije i primjedbe možete prijaviti na sljedeći način:</p>
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
