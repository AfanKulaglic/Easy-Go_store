'use client'

import { useState, useEffect, useRef } from 'react'
import { migrateFirestoreToRealtime } from '@/lib/migrateToRealtime'
import Link from 'next/link'

export default function MigratePage() {
  const [status, setStatus] = useState<'idle' | 'running' | 'success' | 'error'>('idle')
  const [log, setLog] = useState<string[]>([])
  const [result, setResult] = useState<any>(null)
  const logRef = useRef<HTMLDivElement>(null)

  // Auto-scroll log to bottom
  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight
    }
  }, [log])

  const runMigration = async () => {
    setStatus('running')
    setLog([])
    setResult(null)
    
    // Override console.log to capture output
    const originalLog = console.log
    const originalError = console.error
    const originalWarn = console.warn
    
    const addLog = (prefix: string, ...args: any[]) => {
      const message = args.map(a => {
        if (typeof a === 'object') {
          try {
            return JSON.stringify(a)
          } catch {
            return String(a)
          }
        }
        return String(a)
      }).join(' ')
      setLog(prev => [...prev, prefix + message])
    }
    
    console.log = (...args) => {
      originalLog(...args)
      addLog('', ...args)
    }
    console.error = (...args) => {
      originalError(...args)
      addLog('❌ ', ...args)
    }
    console.warn = (...args) => {
      originalWarn(...args)
      addLog('⚠️ ', ...args)
    }

    try {
      const data = await migrateFirestoreToRealtime()
      setResult(data)
      setStatus('success')
    } catch (error: any) {
      setStatus('error')
      addLog('❌ ', 'Migration failed:', error?.message || error)
    } finally {
      console.log = originalLog
      console.error = originalError
      console.warn = originalWarn
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-xl md:text-2xl font-bold mb-6">Firestore → Realtime Database Migration</h1>
        
        <div className="bg-gray-800 rounded-xl p-4 md:p-6 mb-6">
          <p className="text-gray-300 mb-4 text-sm md:text-base">
            This will copy all data from your Firestore database to the Realtime Database.
            Images are kept as URL strings (not re-uploaded). Run this only once!
          </p>
          
          <div className="flex gap-3">
            <button
              onClick={runMigration}
              disabled={status === 'running'}
              className={`px-4 md:px-6 py-2 md:py-3 rounded-lg font-medium transition-colors text-sm md:text-base ${
                status === 'running' 
                  ? 'bg-gray-600 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {status === 'running' ? '⏳ Migrating...' : '🚀 Start Migration'}
            </button>
            
            {status === 'running' && (
              <div className="flex items-center text-yellow-400 text-sm">
                <span className="animate-pulse">Processing... check console for details</span>
              </div>
            )}
          </div>
        </div>

        {/* Log Output */}
        <div className="bg-gray-800 rounded-xl p-4 md:p-6 mb-6">
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
            Migration Log
            {status === 'running' && <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>}
          </h2>
          <div 
            ref={logRef}
            className="bg-black rounded-lg p-3 md:p-4 font-mono text-xs md:text-sm h-80 md:h-96 overflow-y-auto"
          >
            {log.length === 0 ? (
              <div className="text-gray-500">Click "Start Migration" to begin...</div>
            ) : (
              log.map((line, i) => (
                <div 
                  key={i} 
                  className={`${
                    line.startsWith('❌') ? 'text-red-400' :
                    line.startsWith('⚠') ? 'text-yellow-400' :
                    line.startsWith('✓') || line.startsWith('✅') ? 'text-green-400' :
                    line.startsWith('===') ? 'text-blue-400 font-bold' :
                    line.startsWith('---') ? 'text-purple-400 font-semibold' :
                    'text-gray-300'
                  }`}
                >
                  {line}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Results */}
        {status === 'success' && result && (
          <div className="bg-green-900/30 border border-green-500 rounded-xl p-4 md:p-6 mb-6">
            <h2 className="text-lg font-semibold text-green-400 mb-3">✅ Migration Complete!</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
              <div className="bg-black/30 rounded-lg p-3">
                <div className="text-2xl font-bold">{Object.keys(result.products || {}).length}</div>
                <div className="text-gray-400">Products</div>
              </div>
              <div className="bg-black/30 rounded-lg p-3">
                <div className="text-2xl font-bold">{Object.keys(result.categories || {}).length}</div>
                <div className="text-gray-400">Categories</div>
              </div>
              <div className="bg-black/30 rounded-lg p-3">
                <div className="text-2xl font-bold">{Object.keys(result.subcategories || {}).length}</div>
                <div className="text-gray-400">Subcategories</div>
              </div>
              <div className="bg-black/30 rounded-lg p-3">
                <div className="text-2xl font-bold">{Object.keys(result.messages || {}).length}</div>
                <div className="text-gray-400">Messages</div>
              </div>
              <div className="bg-black/30 rounded-lg p-3">
                <div className="text-2xl font-bold">{Object.keys(result.orders || {}).length}</div>
                <div className="text-gray-400">Orders</div>
              </div>
              <div className="bg-black/30 rounded-lg p-3">
                <div className="text-2xl font-bold">{Object.keys(result.views || {}).length}</div>
                <div className="text-gray-400">Views</div>
              </div>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="bg-red-900/30 border border-red-500 rounded-xl p-4 md:p-6 mb-6">
            <h2 className="text-lg font-semibold text-red-400 mb-2">❌ Migration Failed</h2>
            <p className="text-gray-300 text-sm">Check the log above for error details.</p>
          </div>
        )}

        <div className="flex gap-4">
          <Link href="/admin" className="text-blue-400 hover:underline text-sm">
            ← Back to Admin
          </Link>
          <Link href="/" className="text-gray-400 hover:underline text-sm">
            ← Back to Store
          </Link>
        </div>
      </div>
    </div>
  )
}
