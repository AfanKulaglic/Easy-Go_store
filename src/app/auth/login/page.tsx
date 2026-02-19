'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle, CheckCircle, ShieldCheck } from 'lucide-react'
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

  return (
    <div className="min-h-[calc(100vh-5rem)] flex flex-col relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/[0.07] rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-600/[0.05] rounded-full blur-3xl" />
        <div className="absolute top-1/3 left-1/4 w-64 h-64 bg-accent/[0.03] rounded-full blur-3xl" />
      </div>

      <div className="flex-1 flex flex-col justify-center px-4 py-8 lg:py-12 relative z-10">
        <div className="w-full max-w-[440px] mx-auto">

          {/* Logo & Welcome */}
          <div className="text-center mb-8">
            <div className="relative inline-flex items-center justify-center mb-6">
              <div className="absolute inset-0 bg-primary/20 rounded-3xl blur-2xl scale-[2]" />
              <div className="relative h-16 w-16 rounded-2xl bg-gradient-to-br from-primary via-blue-500 to-blue-600 flex items-center justify-center shadow-xl shadow-primary/30 ring-1 ring-white/10">
                <img src="/assets/images/logo.png" alt="Logo" className="h-10 w-10 object-contain" />
              </div>
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold text-text tracking-tight">Dobrodošli nazad</h1>
            <p className="text-muted mt-2 text-sm">Prijavite se za nastavak kupovine</p>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-3 bg-danger/10 border border-danger/20 text-danger rounded-2xl p-4 mb-6 animate-[fadeIn_0.2s_ease-out] backdrop-blur-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <p className="text-sm leading-relaxed">{error}</p>
            </div>
          )}

          {/* Reset Password */}
          {showReset ? (
            <div className="bg-surface/80 backdrop-blur-xl rounded-3xl p-7 border border-white/[0.08] shadow-2xl shadow-black/20">
              {resetSent ? (
                <div className="text-center py-4">
                  <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center mx-auto mb-4 ring-1 ring-accent/20">
                    <CheckCircle className="w-8 h-8 text-accent" />
                  </div>
                  <h3 className="text-lg font-bold text-text mb-2">Email poslan!</h3>
                  <p className="text-sm text-muted mb-6 max-w-[260px] mx-auto leading-relaxed">Provjerite inbox za link za resetovanje lozinke.</p>
                  <button
                    onClick={() => { setShowReset(false); setResetSent(false) }}
                    className="text-primary text-sm font-semibold hover:underline"
                  >
                    ← Nazad na prijavu
                  </button>
                </div>
              ) : (
                <form onSubmit={handleResetPassword} className="space-y-5">
                  <div className="text-center mb-1">
                    <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 ring-1 ring-primary/20">
                      <Mail className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-lg font-bold text-text">Resetuj lozinku</h3>
                    <p className="text-sm text-muted mt-1.5">Poslat ćemo vam link za resetovanje</p>
                  </div>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-muted group-focus-within:text-primary transition-colors" />
                    <input
                      type="email"
                      value={resetEmail || email}
                      onChange={(e) => setResetEmail(e.target.value)}
                      placeholder="Email adresa"
                      className="w-full bg-background/60 border border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-text text-sm placeholder:text-muted/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 focus:bg-background transition-all"
                      required
                    />
                  </div>
                  <div className="flex gap-3 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowReset(false)}
                      className="flex-1 border border-white/10 text-text py-3.5 rounded-xl font-medium hover:bg-white/5 transition-all"
                    >
                      Nazad
                    </button>
                    <button
                      type="submit"
                      className="flex-1 bg-gradient-to-r from-primary to-blue-600 text-white py-3.5 rounded-xl font-semibold hover:shadow-lg hover:shadow-primary/25 transition-all active:scale-[0.98]"
                    >
                      Pošalji link
                    </button>
                  </div>
                </form>
              )}
            </div>
          ) : (
            <>
              {/* Main Card */}
              <div className="bg-surface/80 backdrop-blur-xl rounded-3xl p-7 border border-white/[0.08] shadow-2xl shadow-black/20">
                {/* Google Button */}
                <button
                  onClick={handleGoogle}
                  disabled={isLoading}
                  className="w-full bg-background/60 hover:bg-background border border-white/10 text-text py-3.5 rounded-xl font-medium transition-all flex items-center justify-center gap-3 disabled:opacity-50 hover:border-white/20 active:scale-[0.98]"
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
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/[0.08]"></div>
                  </div>
                  <div className="relative flex justify-center">
                    <span className="px-4 bg-surface text-[11px] text-muted/70 uppercase tracking-widest font-medium">ili</span>
                  </div>
                </div>

                {/* Email/Password Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="email" className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">
                      Email
                    </label>
                    <div className="relative group">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-muted group-focus-within:text-primary transition-colors" />
                      <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="vas@email.com"
                        className="w-full bg-background/60 border border-white/10 rounded-xl py-3.5 pl-11 pr-4 text-text text-sm placeholder:text-muted/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 focus:bg-background transition-all"
                        required
                        autoComplete="email"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label htmlFor="password" className="block text-xs font-semibold text-muted uppercase tracking-wider">
                        Lozinka
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowReset(true)}
                        className="text-xs text-primary/80 hover:text-primary font-medium transition-colors"
                      >
                        Zaboravili ste?
                      </button>
                    </div>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-muted group-focus-within:text-primary transition-colors" />
                      <input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-background/60 border border-white/10 rounded-xl py-3.5 pl-11 pr-12 text-text text-sm placeholder:text-muted/40 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 focus:bg-background transition-all"
                        required
                        autoComplete="current-password"
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
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 disabled:opacity-50 text-white py-3.5 rounded-xl font-semibold transition-all hover:shadow-lg hover:shadow-primary/25 flex items-center justify-center gap-2 mt-1 group active:scale-[0.98]"
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        <span>Prijava...</span>
                      </div>
                    ) : (
                      <>
                        Prijavi se
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* Register Link */}
              <div className="text-center mt-6">
                <p className="text-sm text-muted">
                  Nemate račun?{' '}
                  <Link href="/auth/register" className="text-primary font-semibold hover:underline">
                    Registrujte se
                  </Link>
                </p>
              </div>
            </>
          )}

          {/* Trust Badges */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <div className="flex items-center gap-1.5 text-muted/50">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span className="text-[11px]">SSL zaštita</span>
            </div>
            <div className="w-px h-3 bg-white/10" />
            <div className="flex items-center gap-1.5 text-muted/50">
              <Lock className="w-3.5 h-3.5" />
              <span className="text-[11px]">Sigurna prijava</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center py-4 border-t border-white/[0.04] relative z-10">
        <div className="flex items-center justify-center gap-3 text-xs text-muted/60">
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
