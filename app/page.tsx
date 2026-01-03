'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Truck, Eye, EyeOff, Info, ArrowRight } from 'lucide-react'
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
      <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 relative">
        
        {/* --- MAIN LOGIN CARD --- */}
        <div className="w-full max-w-md bg-azure-surface rounded-3xl shadow-neu-flat p-8 sm:p-12 animate-scale-in border border-white/40">
          
          {/* Header Section */}
          <div className="flex flex-col items-center text-center mb-10 space-y-4">
            {/* Logo Icon Container */}
            <div className="w-24 h-24 rounded-full bg-azure-surface shadow-neu-flat flex items-center justify-center text-accent-primary animate-float mb-2">
              <Truck strokeWidth={1.5} className="w-10 h-10 drop-shadow-sm" />
            </div>
            
            <div className="space-y-1">
              <h1 className="text-2xl font-bold text-text-primary tracking-tight">
                Selamat Datang
              </h1>
              <p className="text-text-secondary text-sm font-medium leading-relaxed">
                Silakan masuk untuk mengakses<br/>Shipment Tracker System
              </p>
            </div>
          </div>

          {/* Form Login */}
          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* Username Input Group */}
            <div className="space-y-2 animate-fade-up animate-delay-100">
              <label className="text-xs font-bold text-text-secondary uppercase tracking-wider ml-3">
                Username
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-azure-surface rounded-2xl px-6 py-4 text-text-primary font-medium placeholder-text-muted outline-none shadow-neu-pressed focus:shadow-neu-pressed-sm transition-all duration-300 border-2 border-transparent focus:border-white/50"
                  placeholder="Ketik username anda..."
                  required
                />
              </div>
            </div>

            {/* Password Input Group */}
            <div className="space-y-2 animate-fade-up animate-delay-200">
              <label className="text-xs font-bold text-text-secondary uppercase tracking-wider ml-3">
                Password
              </label>
              <div className="relative group">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-azure-surface rounded-2xl px-6 py-4 text-text-primary font-medium placeholder-text-muted outline-none shadow-neu-pressed focus:shadow-neu-pressed-sm transition-all duration-300 border-2 border-transparent focus:border-white/50 pr-14"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-5 top-1/2 transform -translate-y-1/2 text-text-muted hover:text-accent-primary transition-colors p-1"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="animate-fade-in p-4 rounded-xl bg-error-bg shadow-neu-pressed-sm border border-error-bg text-error-text text-sm flex items-center gap-3">
                 <Info className="h-5 w-5 shrink-0" />
                 <span className="font-medium">{error}</span>
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-2 animate-fade-up animate-delay-300">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-accent-gradient-start to-accent-gradient-end text-white font-bold shadow-neu-flat hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 relative overflow-hidden group"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {loading ? (
                    <>
                      <div className="h-5 w-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                      <span>Memproses...</span>
                    </>
                  ) : (
                    <>
                      <span>Masuk Sekarang</span>
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </span>
                {/* Shine Effect */}
                <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent z-0" />
              </button>
            </div>
          </form>

          {/* Footer Actions */}
          <div className="mt-10 flex flex-col items-center gap-6 animate-fade-up animate-delay-300">
            <button
              onClick={() => setShowFreelanceModal(true)}
              className="group flex items-center gap-2 text-sm font-medium text-text-secondary hover:text-accent-primary transition-colors duration-300"
            >
              <span>Masuk sebagai</span>
              <span className="px-3 py-1 rounded-lg bg-azure-surface shadow-neu-flat group-hover:shadow-neu-pressed transition-all duration-300 text-accent-primary font-bold">
                Freelance
              </span>
            </button>
            
            {/* Disclaimer */}
            <div className="w-full text-center">
              <p className="text-[10px] text-text-muted/70 font-medium tracking-wide">
                SYSTEM RESTRICTED • ADMIN ONLY
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