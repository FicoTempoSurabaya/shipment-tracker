'use client'

import { Search, Home } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function NotFound() {
  const router = useRouter()

  return (
    <div className="min-h-screen flex items-center justify-center bg-azure-bg p-4">
      <div className="w-full max-w-md">
        <div className="neumorphic p-8 text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 mb-4">
            <Search className="h-8 w-8 text-blue-600" />
          </div>
          
          <h1 className="text-2xl font-bold text-text-primary mb-2">
            Halaman Tidak Ditemukan
          </h1>
          
          <p className="text-text-secondary mb-6">
            Halaman yang Anda cari tidak ditemukan atau telah dipindahkan.
          </p>
          
          <div className="space-y-3">
            <button
              onClick={() => router.back()}
              className="flex items-center justify-center w-full py-3 border border-azure-shadow-dark text-text-primary rounded-lg hover:bg-azure-bg"
            >
              Kembali ke Halaman Sebelumnya
            </button>
            
            <button
              onClick={() => router.push('/')}
              className="flex items-center justify-center w-full py-3 bg-accent-primary text-white rounded-lg hover:bg-blue-600"
            >
              <Home className="mr-2" size={20} />
              Kembali ke Dashboard
            </button>
          </div>
          
          <div className="mt-6 text-sm text-text-secondary">
            <p>Error 404 • Halaman tidak ditemukan</p>
          </div>
        </div>
      </div>
    </div>
  )
}