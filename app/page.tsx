'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Truck, Eye, EyeOff, Info } from 'lucide-react'
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
      <div className="min-h-screen flex items-center justify-center p-4 relative z-10">
        
        {/* Main Card */}
        <div className="w-full max-w-md bg-azure-surface rounded-nm shadow-neumorphic p-8 sm:p-10 animate-scale-in border border-white/50 backdrop-blur-sm">
          
          {/* Header Section */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-6">
              <div className="neumorphic-icon w-20 h-20 animate-fade-in">
                <Truck className="h-10 w-10 text-accent-primary drop-shadow-md" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-text-primary mb-2 tracking-tight">
              Selamat Datang
            </h1>
            <p className="text-text-secondary text-sm font-medium">
              Shipment Tracking Report & <br /> Engagement Support System
            </p>
          </div>

          {/* Form Login */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-1 animate-slide-up animate-delay-100">
              <label className="block text-sm font-semibold text-text-primary ml-1">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="neumorphic-input transition-all duration-300 hover:shadow-neumorphic-inset"
                placeholder="Masukkan username anda"
                required
              />
            </div>

            <div className="space-y-1 animate-slide-up animate-delay-200">
              <label className="block text-sm font-semibold text-text-primary ml-1">
                Password
              </label>
              <div className="relative group">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="neumorphic-input pr-12 transition-all duration-300 hover:shadow-neumorphic-inset"
                  placeholder="Masukkan password anda"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-text-muted hover:text-accent-primary transition-colors focus:outline-none"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-4 rounded-nm-sm bg-warning-bg border border-warning-bg/50 text-warning-text text-sm flex items-center gap-2 animate-fade-in shadow-sm">
                 <Info className="h-4 w-4 shrink-0" />
                 <span>{error}</span>
              </div>
            )}

            <div className="pt-2 animate-slide-up animate-delay-300">
              <button
                type="submit"
                disabled={loading}
                className="neumorphic-btn neumorphic-btn-primary w-full group relative overflow-hidden"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {loading ? (
                    <>
                      <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                      Memproses...
                    </>
                  ) : (
                    'Masuk Sekarang'
                  )}
                </span>
                {/* Shine Effect on Hover */}
                <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent z-0" />
              </button>
            </div>
          </form>

          {/* Footer Actions */}
          <div className="mt-8 pt-6 border-t border-azure-shadow-dark/10 flex flex-col items-center gap-4 animate-fade-in animate-delay-300">
            <button
              onClick={() => setShowFreelanceModal(true)}
              className="text-sm font-medium text-text-secondary hover:text-accent-primary transition-colors duration-300 flex items-center gap-1 group"
            >
              Masuk sebagai <span className="underline decoration-transparent group-hover:decoration-accent-primary underline-offset-4 transition-all">Freelance</span>?
            </button>
            
            {/* Disclaimer Note */}
            <div className="w-full p-4 rounded-nm-sm bg-azure-bg/50 shadow-neumorphic-inset border border-white/20 text-xs text-text-muted text-center leading-relaxed">
              <p>
                Sistem tertutup. Registrasi dan pemulihan akun dikelola sepenuhnya oleh administrator.
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