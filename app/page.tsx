'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Truck } from 'lucide-react'
import FreelanceShipmentModal from '@/components/modals/FreelanceShipmentModal'

export default function LoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showFreelanceModal, setShowFreelanceModal] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })

      const data = await response.json()

      if (response.ok) {
        // Redirect berdasarkan role
        if (data.user.role === 'admin') {
          router.push('/admin/dashboard')
        } else {
          router.push('/regular/dashboard')
        }
      } else {
        setError(data.error || 'Login gagal')
      }
    } catch (err) {
      setError('Terjadi kesalahan pada server')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="min-h-screen flex items-center justify-center bg-azure-bg p-4">
        <div className="w-full max-w-md">
          <div className="bg-azure-surface rounded-2xl p-8 shadow-neumorphic">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <Truck className="h-16 w-16 text-accent-primary" />
              </div>
              <h1 className="text-2xl font-bold text-text-primary mb-2">
                SELAMAT DATANG
              </h1>
              <p className="text-text-secondary text-sm">
                Shipment Tracking Report & Engagement Support System
              </p>
            </div>

            {/* Form Login */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-white border border-azure-shadow-dark focus:border-accent-primary focus:outline-none"
                  placeholder="Masukkan username"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-white border border-azure-shadow-dark focus:border-accent-primary focus:outline-none"
                    placeholder="Masukkan password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-text-secondary hover:text-text-primary"
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-warning-bg text-warning-text text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-accent-primary text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Memproses...' : 'Masuk'}
              </button>
            </form>

            {/* Freelance Link */}
            <div className="mt-6 text-center">
              <button
                onClick={() => setShowFreelanceModal(true)}
                className="text-accent-secondary hover:text-cyan-500 text-sm"
              >
                Freelance
              </button>
            </div>

            {/* Note */}
            <div className="mt-8 p-4 bg-azure-bg rounded-lg text-sm text-text-secondary">
              <p className="text-center">
                Tidak ada fitur Register atau Lupa password. Semua diatur oleh admin baik di frontend ataupun di backend.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Freelance Shipment Modal */}
      <FreelanceShipmentModal
        isOpen={showFreelanceModal}
        onClose={() => setShowFreelanceModal(false)}
      />
    </>
  )
}