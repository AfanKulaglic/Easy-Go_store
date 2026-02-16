'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Mail, Lock, Eye, EyeOff, User, ArrowRight, AlertCircle, Check, ShieldCheck } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

export default function RegisterPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const { register, loginWithGoogle } = useAuth()

  const getErrorMessage = (code: string) => {
    switch (code) {
      case 'auth/email-already-in-use':
        return 'Ovaj email se već koristi'
      case 'auth/invalid-email':
        return 'Neispravan email format'
      case 'auth/weak-password':
        return 'Lozinka mora imati najmanje 6 karaktera'
      case 'auth/network-request-failed':
        return 'Greška u povezivanju. Provjerite internet vezu'
      default:
        return 'Greška pri registraciji. Pokušajte ponovo'
    }
  }

  const passwordStrength = () => {
    if (password.length === 0) return { level: 0, label: '', color: '' }
    if (password.length < 6) return { level: 1, label: 'Slaba', color: 'bg-danger' }
    const hasUpper = /[A-Z]/.test(password)
    const hasNumber = /[0-9]/.test(password)
    const hasSpecial = /[^A-Za-z0-9]/.test(password)
    const score = [password.length >= 8, hasUpper, hasNumber, hasSpecial].filter(Boolean).length
    if (score <= 1) return { level: 1, label: 'Slaba', color: 'bg-danger' }
    if (score === 2) return { level: 2, label: 'Srednja', color: 'bg-yellow-500' }
    if (score === 3) return { level: 3, label: 'Dobra', color: 'bg-accent' }
    return { level: 4, label: 'Odlična', color: 'bg-accent' }
  }

  const strength = passwordStrength()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (password.length < 6) {
      setError('Lozinka mora imati najmanje 6 karaktera')
      return
    }
    setIsLoading(true)
    try {
      await register(email, password, name)
      router.push('/')
    } catch (err: any) {
      setError(getErrorMessage(err?.code || ''))
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogle = async () => {
    setError('')
    setIsLoading(true)
    try {
      await loginWithGoogle()
      router.push('/')
    } catch (err: any) {
      if (err?.code !== 'auth/popup-closed-by-user') {
        setError('Greška pri prijavi sa Google računom')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const requirements = [
    { met: password.length >= 6, label: 'Min. 6 karaktera' },
    { met: /[A-Z]/.test(password), label: 'Veliko slovo' },
    { met: /[0-9]/.test(password), label: 'Broj' },
  ]

  return (
    <div className="min-h-[calc(100vh-5rem)] flex flex-col px-4 py-6 lg:py-10">
      <div className="flex-1 flex flex-col justify-center w-full max-w-[420px] mx-auto">

        {/* Logo & Welcome */}
        <div className="text-center mb-8">
          <div className="relative inline-flex items-center justify-center mb-5">
            <div className="absolute inset-0 bg-primary/20 rounded-2xl blur-xl scale-150" />
            <div className="relative h-14 w-14 rounded-2xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center shadow-lg shadow-primary/30">
              <img src="/assets/images/logo.png" alt="Logo" className="h-9 w-9 object-contain" />
            </div>
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold text-text">Kreiraj račun</h1>
          <p className="text-muted mt-1.5 text-sm">Pridružite se za brzu i sigurnu kupovinu</p>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-start gap-3 bg-danger/10 border border-danger/20 text-danger rounded-2xl p-4 mb-5 animate-[fadeIn_0.2s_ease-out]">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <p className="text-sm leading-relaxed">{error}</p>
          </div>
        )}

        {/* Google Button — top for quick access */}
        <button
          onClick={handleGoogle}
          disabled={isLoading}
          className="w-full bg-surface hover:bg-surface/80 border border-white/[0.08] text-text py-3.5 rounded-2xl font-medium transition-all flex items-center justify-center gap-3 disabled:opacity-50 shadow-lg shadow-black/5 hover:shadow-xl hover:shadow-black/10 mb-5"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Nastavi sa Google
        </button>

        {/* Divider */}
        <div className="relative my-1 mb-5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/[0.06]"></div>
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="px-3 bg-background text-muted uppercase tracking-wider">ili sa emailom</span>
          </div>
        </div>

        {/* Register Form */}
        <div className="bg-surface rounded-2xl p-6 border border-white/[0.06] shadow-xl shadow-black/10">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">
                Ime i prezime
              </label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-muted group-focus-within:text-primary transition-colors" />
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Vaše ime"
                  className="w-full bg-background border border-white/10 rounded-xl py-3.5 pl-11 pr-4 text-text text-sm placeholder:text-muted/60 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all"
                  required
                  autoComplete="name"
                />
              </div>
            </div>

            <div>
              <label htmlFor="reg-email" className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">
                Email
              </label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-muted group-focus-within:text-primary transition-colors" />
                <input
                  id="reg-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="vas@email.com"
                  className="w-full bg-background border border-white/10 rounded-xl py-3.5 pl-11 pr-4 text-text text-sm placeholder:text-muted/60 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all"
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div>
              <label htmlFor="reg-password" className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">
                Lozinka
              </label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-muted group-focus-within:text-primary transition-colors" />
                <input
                  id="reg-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 6 karaktera"
                  className="w-full bg-background border border-white/10 rounded-xl py-3.5 pl-11 pr-12 text-text text-sm placeholder:text-muted/60 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all"
                  required
                  minLength={6}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-muted hover:text-text rounded-lg hover:bg-white/5 transition-all"
                  aria-label={showPassword ? 'Sakrij lozinku' : 'Prikaži lozinku'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Password Strength Bar */}
              {password.length > 0 && (
                <div className="mt-3">
                  <div className="flex gap-1 mb-1.5">
                    {[1, 2, 3, 4].map(i => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                          i <= strength.level ? strength.color : 'bg-white/[0.06]'
                        }`}
                      />
                    ))}
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex flex-wrap gap-x-3 gap-y-1">
                      {requirements.map(({ met, label }) => (
                        <div key={label} className="flex items-center gap-1.5">
                          <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center transition-all duration-200 ${
                            met ? 'bg-accent scale-100' : 'bg-white/[0.08] scale-90'
                          }`}>
                            {met && <Check className="w-2.5 h-2.5 text-white" />}
                          </div>
                          <span className={`text-[11px] transition-colors ${met ? 'text-accent' : 'text-muted/60'}`}>{label}</span>
                        </div>
                      ))}
                    </div>
                    <span className={`text-[11px] font-medium ${
                      strength.level <= 1 ? 'text-danger' : strength.level === 2 ? 'text-yellow-500' : 'text-accent'
                    }`}>
                      {strength.label}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 disabled:opacity-50 disabled:hover:from-primary disabled:hover:to-blue-600 text-white py-3.5 rounded-xl font-semibold transition-all hover:shadow-lg hover:shadow-primary/25 flex items-center justify-center gap-2 mt-2 group"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <span>Kreiranje...</span>
                </div>
              ) : (
                <>
                  Kreiraj račun
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Login Link */}
        <p className="text-center text-muted mt-6 text-sm">
          Već imate račun?{' '}
          <Link href="/auth/login" className="text-primary font-semibold hover:underline">
            Prijavite se
          </Link>
        </p>

        {/* Trust Badge */}
        <div className="flex items-center justify-center gap-1.5 mt-6 text-muted/60">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span className="text-[11px]">Vaši podaci su sigurni i zaštićeni</span>
        </div>
      </div>

      {/* Footer — Terms & Privacy pinned bottom */}
      <div className="text-center pt-6 pb-2 mt-auto border-t border-white/[0.04]">
        <p className="text-[11px] text-muted/50 mb-2">Registracijom prihvatate naše</p>
        <div className="flex items-center justify-center gap-3 text-xs text-muted/70">
          <Link href="/terms" className="hover:text-text transition-colors">
            Uslovi korištenja
          </Link>
          <span className="text-white/10">|</span>
          <Link href="/privacy" className="hover:text-text transition-colors">
            Politika privatnosti
          </Link>
        </div>
      </div>
    </div>
  )
}
