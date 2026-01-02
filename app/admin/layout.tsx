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
      <div className="h-screen flex items-center justify-center">
        <div className="text-text-secondary">Memuat...</div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="flex h-screen">
      <AdminSidebar userName={user.namaLengkap} />
      <main className="flex-1 overflow-auto p-6">
        {children}
      </main>
    </div>
  )
}