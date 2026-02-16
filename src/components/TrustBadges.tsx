'use client'

import { Truck, ShieldCheck, RefreshCw, Award, BadgeCheck } from 'lucide-react'

const badges = [
  {
    icon: Truck,
    title: 'BESPLATNA DOSTAVA',
    description: 'Besplatna dostava širom BiH, vrijeme isporuke za narudžbe 24-48 sati.',
    gradient: 'from-primary to-indigo-600'
  },
  {
    icon: ShieldCheck,
    title: 'Sigurna kupovina',
    description: '100% Sigurno plaćanje prilikom preuzimanja uz mogućnost pregleda proizvoda.',
    gradient: 'from-accent to-emerald-600'
  },
  {
    icon: RefreshCw,
    title: 'Povrat - Zamjena',
    description: 'Nešto nije u redu sa artiklom? Rješavamo zamjenu ili povrat bez komplikacija.',
    gradient: 'from-orange-500 to-red-500'
  },
  {
    icon: Award,
    title: 'Garancija',
    description: 'Dajemo garanciju za sve naše proizvode za sigurnu i bezbrižnu kupovinu.',
    gradient: 'from-yellow-500 to-orange-500'
  }
]

export default function TrustBadges() {
  return (
    <section className="px-4 py-6 lg:px-8 lg:py-10">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6 lg:mb-8">
        <div className="w-10 h-10 bg-gradient-to-br from-accent to-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-accent/25">
          <BadgeCheck className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-lg lg:text-xl font-bold text-text">Benefiti</h2>
          <p className="text-xs text-muted hidden sm:block">Zašto kupovati kod nas</p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        {badges.map((badge, index) => {
          const Icon = badge.icon
          
          return (
            <div 
              key={index}
              className="group bg-surface rounded-2xl p-4 lg:p-5 border border-white/5 hover:border-white/10 transition-all duration-300 hover:shadow-xl hover:shadow-black/20 hover:-translate-y-1"
            >
              <div className={`w-11 h-11 lg:w-12 lg:h-12 bg-gradient-to-br ${badge.gradient} rounded-xl flex items-center justify-center mb-3 lg:mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                <Icon className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
              </div>
              <h3 className="text-xs lg:text-sm font-bold text-text mb-1.5 lg:mb-2 uppercase tracking-wide">
                {badge.title}
              </h3>
              <p className="text-[10px] lg:text-xs text-muted leading-relaxed line-clamp-3">
                {badge.description}
              </p>
            </div>
          )
        })}
      </div>
    </section>
  )
}
