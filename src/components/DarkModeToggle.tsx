'use client'

import { Moon, Sun, Sparkles } from 'lucide-react'
import { useTheme } from '@/context/ThemeContext'

export default function DarkModeToggle() {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <div className="bg-gradient-to-r from-surface via-surface to-primary/5 rounded-2xl p-4 lg:p-5 border border-white/5 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
      
      <div className="relative flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 lg:w-12 lg:h-12 rounded-xl flex items-center justify-center transition-all duration-500 ${
            isDark 
              ? 'bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/30' 
              : 'bg-gradient-to-br from-yellow-400 to-orange-500 shadow-lg shadow-yellow-500/30'
          }`}>
            {isDark ? (
              <Moon className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
            ) : (
              <Sun className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
            )}
          </div>
          <div>
            <h3 className="text-sm lg:text-base font-semibold text-text flex items-center gap-1.5">
              {isDark ? 'Tamni mod' : 'Svijetli mod'}
              <Sparkles className="w-3.5 h-3.5 text-primary" />
            </h3>
            <p className="text-[11px] lg:text-xs text-muted">
              {isDark ? 'Ugodan za oči u mraku' : 'Klasičan svijetli izgled'}
            </p>
          </div>
        </div>
        
        {/* Toggle Switch */}
        <button
          onClick={toggleTheme}
          className={`relative w-14 h-7 lg:w-16 lg:h-8 rounded-full transition-all duration-300 flex-shrink-0 ${
            isDark 
              ? 'bg-gradient-to-r from-indigo-500 to-purple-600' 
              : 'bg-gradient-to-r from-yellow-400 to-orange-500'
          }`}
        >
          <div className={`absolute top-1 w-5 h-5 lg:w-6 lg:h-6 bg-white rounded-full shadow-lg transition-all duration-300 flex items-center justify-center ${
            isDark ? 'left-1' : 'left-8 lg:left-9'
          }`}>
            {isDark ? (
              <Moon className="w-3 h-3 lg:w-3.5 lg:h-3.5 text-indigo-600" />
            ) : (
              <Sun className="w-3 h-3 lg:w-3.5 lg:h-3.5 text-orange-500" />
            )}
          </div>
        </button>
      </div>
    </div>
  )
}
