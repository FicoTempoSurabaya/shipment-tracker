'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import AdminSidebar from '@/components/sidebar/AdminSidebar'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me')
      const data = await response.json()
      
      if (response.ok && data.user.role === 'admin') {
        setUser(data.user)
      } else {
        router.push('/')
      }
    } catch (error) {
      router.push('/')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-azure-bg flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
           <div className="w-12 h-12 rounded-full border-4 border-azure-surface border-t-accent-primary animate-spin shadow-neu-flat"></div>
           <p className="text-text-secondary font-medium animate-pulse">Memuat Dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="flex h-screen bg-azure-bg overflow-hidden relative">
      {/* Sidebar */}
      <AdminSidebar userName={user.namaLengkap} />

      {/* Main Content Area */}
      <main className="flex-1 overflow-x-hidden overflow-y-auto relative scroll-smooth">
        <div className="container mx-auto px-4 py-20 md:py-8 max-w-7xl">
           {children}
        </div>
      </main>
    </div>
  )
}