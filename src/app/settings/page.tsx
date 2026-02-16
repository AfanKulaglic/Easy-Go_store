'use client'

import { useState } from 'react'
import { User, Bell, Shield, CreditCard, HelpCircle, LogOut, ChevronRight, Settings, Smartphone, Globe, Save, Package, MapPin, Phone, Mail, Edit3, Check, X } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import DarkModeToggle from '@/components/DarkModeToggle'
import { useAuth } from '@/context/AuthContext'

export default function SettingsPage() {
  const { user, userProfile, logout, updateUserProfile, loading } = useAuth()
  const router = useRouter()
  const [editMode, setEditMode] = useState(false)
  const [editData, setEditData] = useState({
    displayName: '',
    phone: '',
    address: '',
    city: '',
  })
  const [saving, setSaving] = useState(false)

  const startEdit = () => {
    setEditData({
      displayName: userProfile?.displayName || '',
      phone: userProfile?.phone || '',
      address: userProfile?.address || '',
      city: userProfile?.city || '',
    })
    setEditMode(true)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await updateUserProfile(editData)
      setEditMode(false)
    } catch (e) {
      console.error('Error updating profile:', e)
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = async () => {
    await logout()
    router.push('/')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="px-4 py-6 lg:px-8 lg:max-w-2xl lg:mx-auto pb-8">
      {/* Page Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg shadow-primary/25">
          <Settings className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
        </div>
        <div>
          <h1 className="text-lg lg:text-xl font-bold text-text">Postavke</h1>
          <p className="text-xs text-muted">Upravljajte svojim računom</p>
        </div>
      </div>

      {/* User Profile Card */}
      {user ? (
        <div className="bg-surface rounded-2xl p-4 mb-4 border border-white/5">
          {editMode ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-text">Uredi profil</h3>
                <div className="flex gap-2">
                  <button onClick={() => setEditMode(false)} className="p-1.5 rounded-lg hover:bg-white/5 transition-colors">
                    <X className="w-4 h-4 text-muted" />
                  </button>
                </div>
              </div>
              <div>
                <label className="text-xs text-muted mb-1 block">Ime i prezime</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                  <input
                    type="text"
                    value={editData.displayName}
                    onChange={e => setEditData({...editData, displayName: e.target.value})}
                    className="w-full bg-background border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-text focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-muted mb-1 block">Telefon</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                  <input
                    type="tel"
                    value={editData.phone}
                    onChange={e => setEditData({...editData, phone: e.target.value})}
                    placeholder="+387 XX XXX XXX"
                    className="w-full bg-background border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-text placeholder:text-muted focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-muted mb-1 block">Adresa</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                  <input
                    type="text"
                    value={editData.address}
                    onChange={e => setEditData({...editData, address: e.target.value})}
                    placeholder="Ulica i broj"
                    className="w-full bg-background border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-text placeholder:text-muted focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-muted mb-1 block">Grad</label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                  <input
                    type="text"
                    value={editData.city}
                    onChange={e => setEditData({...editData, city: e.target.value})}
                    placeholder="Vaš grad"
                    className="w-full bg-background border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-text placeholder:text-muted focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
              </div>
              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full bg-primary hover:bg-primary/90 text-white py-2.5 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {saving ? (
                  <span>Sprema se...</span>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Spremi promjene
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              {user.photoURL ? (
                <img src={user.photoURL} alt="" className="w-14 h-14 rounded-xl object-cover" />
              ) : (
                <div className="w-14 h-14 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl flex items-center justify-center">
                  <span className="text-2xl font-bold text-primary">
                    {(userProfile?.displayName || user.email || '?')[0].toUpperCase()}
                  </span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h2 className="font-semibold text-text text-sm lg:text-base truncate">
                  {userProfile?.displayName || 'Korisnik'}
                </h2>
                <p className="text-xs text-muted truncate">{user.email}</p>
                {userProfile?.phone && (
                  <p className="text-xs text-muted">{userProfile.phone}</p>
                )}
              </div>
              <button
                onClick={startEdit}
                className="bg-primary/10 hover:bg-primary/20 text-primary px-3 py-2 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5"
              >
                <Edit3 className="w-3.5 h-3.5" />
                Uredi
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-surface rounded-2xl p-4 mb-4 border border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl flex items-center justify-center">
              <User className="w-7 h-7 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="font-semibold text-text text-sm lg:text-base">Gost korisnik</h2>
              <p className="text-xs text-muted">Prijavite se za sve funkcije</p>
            </div>
            <Link
              href="/auth/login"
              className="bg-primary hover:bg-primary/90 text-white px-3 py-2 rounded-xl text-xs font-medium transition-all hover:shadow-lg hover:shadow-primary/25"
            >
              Prijava
            </Link>
          </div>
        </div>
      )}

      {/* Saved Info Summary (when logged in) */}
      {user && userProfile && (userProfile.address || userProfile.city) && (
        <div className="bg-surface rounded-2xl p-4 mb-4 border border-white/5">
          <h3 className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">Dostava informacije</h3>
          <div className="space-y-2">
            {userProfile.address && (
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="w-4 h-4 text-muted flex-shrink-0" />
                <span className="text-text">{userProfile.address}</span>
              </div>
            )}
            {userProfile.city && (
              <div className="flex items-center gap-2 text-sm">
                <Globe className="w-4 h-4 text-muted flex-shrink-0" />
                <span className="text-text">{userProfile.city}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Dark Mode Toggle */}
      <div className="mb-4">
        <DarkModeToggle />
      </div>

      {/* App Info */}
      <div className="mt-4 bg-surface rounded-2xl p-4 border border-white/5">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 bg-accent/10 rounded-xl flex items-center justify-center">
            <Smartphone className="w-4 h-4 text-accent" />
          </div>
          <div>
            <span className="text-sm text-text font-medium block">EasyGo App</span>
            <span className="text-[11px] text-muted">Verzija 1.0.0</span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted">
          <Globe className="w-3.5 h-3.5" />
          <span>Bosna i Hercegovina</span>
        </div>
      </div>

      {/* Sign Out Button */}
      {user && (
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full p-3.5 mt-4 bg-surface rounded-2xl hover:bg-danger/5 transition-colors border border-white/5"
        >
          <div className="w-9 h-9 bg-danger/10 rounded-xl flex items-center justify-center">
            <LogOut className="w-4 h-4 text-danger" />
          </div>
          <span className="text-sm text-danger font-medium">Odjava</span>
        </button>
      )}
    </div>
  )
}
