'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle, CheckCircle, Truck, Shield, CreditCard, HeadphonesIcon } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [resetSent, setResetSent] = useState(false)
  const [showReset, setShowReset] = useState(false)
  const [resetEmail, setResetEmail] = useState('')
  const [focusedField, setFocusedField] = useState<string | null>(null)
  const router = useRouter()
  const { login, loginWithGoogle, resetPassword } = useAuth()

  const getErrorMessage = (code: string) => {
    switch (code) {
      case 'auth/invalid-credential':
      case 'auth/wrong-password':
      case 'auth/user-not-found':
        return 'Pogrešan email ili lozinka'
      case 'auth/invalid-email':
        return 'Neispravan email format'
      case 'auth/user-disabled':
        return 'Ovaj račun je deaktiviran'
      case 'auth/too-many-requests':
        return 'Previše pokušaja. Pokušajte ponovo za par minuta'
      case 'auth/network-request-failed':
        return 'Greška u povezivanju. Provjerite internet vezu'
      default:
        return 'Greška pri prijavi. Pokušajte ponovo'
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)
    try {
      await login(email, password)
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

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      await resetPassword(resetEmail || email)
      setResetSent(true)
    } catch (err: any) {
      setError(err?.code === 'auth/user-not-found' ? 'Email adresa nije pronađena' : 'Greška pri slanju emaila')
    }
  }

  const features = [
    { icon: Truck, title: 'Brza dostava', desc: 'Na vašu adresu za 1-3 dana' },
    { icon: Shield, title: 'Sigurna kupovina', desc: 'Zaštićeni podaci i transakcije' },
    { icon: CreditCard, title: 'Plaćanje pouzećem', desc: 'Platite tek kad primite' },
    { icon: HeadphonesIcon, title: 'Podrška 24/7', desc: 'Uvijek tu za vas' },
  ]

  return (
    <div className="min-h-[calc(100vh-7rem)] flex">
      {/* Left Panel — Brand/Features (desktop only) */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-primary via-blue-600 to-indigo-700 flex-col justify-center items-center gap-10 p-10 xl:p-12 pb-24">
        {/* Decorative circles */}
        <div className="absolute -top-24 -left-24 w-64 h-64 bg-white/10 rounded-full blur-2xl" />
        <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-0 w-40 h-40 bg-white/5 rounded-full blur-2xl" />

        {/* Content wrapper */}
        <div className="relative z-10 w-full max-w-[380px] flex flex-col gap-10">
          {/* Top */}
          <div className="text-left">
            <div className="flex items-center gap-3 mb-12">
              <div className="h-11 w-11 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center ring-1 ring-white/20">
                <img src="/assets/images/logo.png" alt="Logo" className="h-7 w-7 object-contain" />
              </div>
              <span className="text-white/90 font-bold text-lg tracking-tight">Easy Go</span>
            </div>
            <h2 className="text-3xl xl:text-4xl font-bold text-white leading-tight mb-4">
              Vaša omiljena<br />online prodavnica
            </h2>
            <p className="text-white/60 text-sm leading-relaxed">
              Prijavite se i uživajte u najboljim ponudama, brzoj dostavi i sigurnoj kupovini.
            </p>
          </div>

          {/* Features */}
          <div className="space-y-4">
            {features.map((feat, i) => (
              <div key={i} className="flex items-center gap-4 group">
                <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center ring-1 ring-white/10 group-hover:bg-white/15 transition-colors flex-shrink-0">
                  <feat.icon className="w-5 h-5 text-white/80" />
                </div>
                <div className="text-left">
                  <p className="text-white text-sm font-semibold">{feat.title}</p>
                  <p className="text-white/50 text-xs">{feat.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom */}
          <div className="pt-4">
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {['😊', '🛒', '⭐'].map((emoji, i) => (
                  <div key={i} className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-sm ring-2 ring-primary flex items-center justify-center text-sm">
                    {emoji}
                  </div>
                ))}
              </div>
              <p className="text-white/50 text-xs mr-2">Više od <span className="text-white/80 font-semibold">1,000+</span> zadovoljnih kupaca</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel — Form */}
      <div className="flex-1 flex flex-col">
        <div className="flex-1 flex flex-col justify-center px-5 sm:px-8 lg:px-16 xl:px-20 py-8">
          <div className="w-full max-w-[400px] mx-auto lg:mx-0">
            
            {/* Mobile logo */}
            <div className="lg:hidden flex items-center gap-3 mb-8">
              <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center shadow-lg shadow-primary/20">
                <img src="/assets/images/logo.png" alt="Logo" className="h-7 w-7 object-contain" />
              </div>
              <span className="text-text font-bold text-lg">Easy Go</span>
            </div>

            {/* Heading */}
            <div className="mb-8">
              <h1 className="text-2xl lg:text-[28px] font-bold text-text tracking-tight">Prijava</h1>
              <p className="text-muted mt-2 text-sm">Dobrodošli nazad! Unesite vaše podatke.</p>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-start gap-3 bg-danger/10 border border-danger/20 text-danger rounded-xl p-3.5 mb-6">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <p className="text-sm">{error}</p>
              </div>
            )}

            {/* Reset Password */}
            {showReset ? (
              <div>
                {resetSent ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="w-8 h-8 text-accent" />
                    </div>
                    <h3 className="text-lg font-bold text-text mb-2">Email poslan!</h3>
                    <p className="text-sm text-muted mb-6 max-w-[280px] mx-auto">Provjerite inbox za link za resetovanje lozinke.</p>
                    <button onClick={() => { setShowReset(false); setResetSent(false) }} className="text-primary text-sm font-semibold hover:underline">
                      ← Nazad na prijavu
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleResetPassword} className="space-y-5">
                    <div className="text-center mb-2">
                      <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Mail className="w-6 h-6 text-primary" />
                      </div>
                      <h3 className="text-lg font-bold text-text">Resetuj lozinku</h3>
                      <p className="text-sm text-muted mt-1">Poslat ćemo vam link za resetovanje</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text mb-1.5">Email adresa</label>
                      <input
                        type="email"
                        value={resetEmail || email}
                        onChange={(e) => setResetEmail(e.target.value)}
                        placeholder="vas@email.com"
                        className="w-full bg-surface border border-white/10 rounded-xl py-3 px-4 text-text text-sm placeholder:text-muted/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                        required
                      />
                    </div>
                    <div className="flex gap-3">
                      <button type="button" onClick={() => setShowReset(false)} className="flex-1 border border-white/10 text-text py-3 rounded-xl font-medium hover:bg-white/5 transition-all">
                        Nazad
                      </button>
                      <button type="submit" className="flex-1 bg-primary text-white py-3 rounded-xl font-semibold hover:bg-primary/90 transition-all active:scale-[0.98]">
                        Pošalji link
                      </button>
                    </div>
                  </form>
                )}
              </div>
            ) : (
              <>
                {/* Google */}
                <button onClick={handleGoogle} disabled={isLoading} className="w-full bg-surface hover:bg-surface/80 border border-white/10 text-text py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-3 disabled:opacity-50 hover:border-white/20 active:scale-[0.98] mb-6">
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  Nastavi sa Google
                </button>

                {/* Divider */}
                <div className="relative mb-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/[0.08]"></div>
                  </div>
                  <div className="relative flex justify-center">
                    <span className="px-4 bg-background text-[11px] text-muted/60 uppercase tracking-widest">ili</span>
                  </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-text mb-1.5">Email</label>
                    <div className={`relative rounded-xl border transition-all ${focusedField === 'email' ? 'border-primary ring-2 ring-primary/20' : 'border-white/10 hover:border-white/20'}`}>
                      <Mail className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] transition-colors ${focusedField === 'email' ? 'text-primary' : 'text-muted'}`} />
                      <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onFocus={() => setFocusedField('email')}
                        onBlur={() => setFocusedField(null)}
                        placeholder="vas@email.com"
                        className="w-full bg-transparent rounded-xl py-3 pl-11 pr-4 text-text text-sm placeholder:text-muted/40 focus:outline-none"
                        required
                        autoComplete="email"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label htmlFor="password" className="block text-sm font-medium text-text">Lozinka</label>
                      <button type="button" onClick={() => setShowReset(true)} className="text-xs text-primary hover:text-primary/80 font-medium transition-colors">
                        Zaboravili ste?
                      </button>
                    </div>
                    <div className={`relative rounded-xl border transition-all ${focusedField === 'password' ? 'border-primary ring-2 ring-primary/20' : 'border-white/10 hover:border-white/20'}`}>
                      <Lock className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] transition-colors ${focusedField === 'password' ? 'text-primary' : 'text-muted'}`} />
                      <input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onFocus={() => setFocusedField('password')}
                        onBlur={() => setFocusedField(null)}
                        placeholder="••••••••"
                        className="w-full bg-transparent rounded-xl py-3 pl-11 pr-12 text-text text-sm placeholder:text-muted/30 focus:outline-none"
                        required
                        autoComplete="current-password"
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted hover:text-text transition-colors">
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-primary to-blue-600 disabled:opacity-50 text-white py-3 rounded-xl font-semibold transition-all hover:shadow-lg hover:shadow-primary/25 flex items-center justify-center gap-2 group active:scale-[0.98]"
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Prijava...
                      </div>
                    ) : (
                      <>
                        Prijavi se
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                      </>
                    )}
                  </button>
                </form>

                {/* Register Link */}
                <p className="text-center text-sm text-muted mt-8">
                  Nemate račun?{' '}
                  <Link href="/auth/register" className="text-primary font-semibold hover:underline">
                    Registrujte se
                  </Link>
                </p>
              </>
            )}
          </div>
        </div>

        {/* Bottom links */}
        <div className="px-5 sm:px-8 lg:px-16 xl:px-20 py-4 border-t border-white/[0.04]">
          <div className="flex items-center justify-between max-w-[400px] lg:max-w-none text-xs text-muted/50 mx-auto lg:mx-0">
            <div className="flex items-center gap-3">
              <Link href="/terms" className="hover:text-text transition-colors">Uslovi</Link>
              <Link href="/privacy" className="hover:text-text transition-colors">Privatnost</Link>
            </div>
            <span>© 2026 Easy Go</span>
          </div>
        </div>
      </div>
    </div>
  )
}
