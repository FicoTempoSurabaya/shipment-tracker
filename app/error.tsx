'use client'

import { useEffect } from 'react'
import { AlertTriangle, Home, RefreshCw } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const router = useRouter()

  useEffect(() => {
    // Log error to monitoring service
    console.error('Application error:', error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-azure-bg p-4">
      <div className="w-full max-w-md">
        <div className="neumorphic p-8 text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
          
          <h1 className="text-2xl font-bold text-text-primary mb-2">
            Terjadi Kesalahan
          </h1>
          
          <p className="text-text-secondary mb-6">
            Maaf, terjadi kesalahan pada aplikasi. Silakan coba lagi.
          </p>
          
          {error.digest && (
            <p className="text-sm text-text-secondary mb-4">
              Error ID: {error.digest}
            </p>
          )}
          
          <div className="space-y-3">
            <button
              onClick={reset}
              className="flex items-center justify-center w-full py-3 bg-accent-primary text-white rounded-lg hover:bg-blue-600"
            >
              <RefreshCw className="mr-2" size={20} />
              Coba Lagi
            </button>
            
            <button
              onClick={() => router.push('/')}
              className="flex items-center justify-center w-full py-3 border border-azure-shadow-dark text-text-primary rounded-lg hover:bg-azure-bg"
            >
              <Home className="mr-2" size={20} />
              Kembali ke Halaman Utama
            </button>
          </div>
          
          <div className="mt-6 p-4 bg-azure-bg rounded-lg text-sm text-text-secondary">
            <p className="font-medium mb-1">Jika masalah berlanjut:</p>
            <p>1. Periksa koneksi internet Anda</p>
            <p>2. Clear cache browser</p>
            <p>3. Hubungi tim IT support</p>
          </div>
        </div>
      </div>
    </div>
  )
}