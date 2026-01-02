'use client'

import { useState, useEffect } from 'react'
import { Edit, BarChart3 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import EditProfileModal from '@/components/modals/EditProfileModal'
import SuccessModal from '@/components/modals/SuccessModal'
import PieChart from '@/components/charts/PieChart'

interface UserProfile {
  user_id: string
  username: string
  password: string  // ✅ Tambahkan ini
  user_role_as: string
  nama_lengkap: string
  tempat_lahir?: string
  tanggal_lahir: string
  alamat?: string
  no_telp?: string
  email?: string
  license_type: string
  license_id: string
  masa_berlaku: string
  jenis_unit?: string
  nopol?: string
}

interface PerformanceData {
  total_shipments: number
  total_hk: number
  total_hke: number
  total_hkne: number
}

export default function RegularProfilePage() {
  const router = useRouter()
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [performance, setPerformance] = useState<PerformanceData | null>(null)
  const [loading, setLoading] = useState(true)
  
  // Modal states
  const [showEditModal, setShowEditModal] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)

  useEffect(() => {
    fetchUserData()
  }, [])

  const fetchUserData = async () => {
    try {
      setLoading(true)
      
      // Get current user info
      const authResponse = await fetch('/api/auth/me')
      const authData = await authResponse.json()
      
      if (authResponse.ok && authData.user) {
        const userId = authData.user.userId
        
        // Get user profile
        const userResponse = await fetch(`/api/users/${userId}`)
        const userData = await userResponse.json()
        
        if (userResponse.ok) {
          setUserProfile(userData.user)
          setPerformance(userData.performance)
        }
      }
    } catch (error) {
      console.error('Error fetching user data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleProfileUpdate = () => {
    fetchUserData()
    setShowSuccessModal(true)
  }

  const handleViewQuizResults = () => {
    router.push('/regular/quiz')
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-accent-primary"></div>
        <p className="mt-2 text-text-secondary">Memuat data...</p>
      </div>
    )
  }

  if (!userProfile) {
    return (
      <div className="text-center py-12">
        <p className="text-text-secondary">Data profil tidak ditemukan</p>
      </div>
    )
  }

  const pieChartData = [
    { name: 'Terkirim', value: performance?.total_hke || 0 },
    { name: 'Gagal', value: performance?.total_hkne || 0 }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Profil Saya</h1>
          <p className="text-text-secondary">NIK Kerja: {userProfile.user_id}</p>
        </div>
        <button
          onClick={() => setShowEditModal(true)}
          className="flex items-center px-4 py-2 bg-accent-primary text-white rounded-lg hover:bg-blue-600"
        >
          <Edit size={20} className="mr-2" />
          Edit Profil
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile Info Section */}
        <div className="neumorphic p-6">
          <h2 className="text-xl font-semibold text-text-primary mb-6">
            INFORMASI PRIBADI
          </h2>
          
          <div className="space-y-4">
            <InfoRow label="User ID" value={userProfile.user_id} />
            <InfoRow label="Nama Lengkap" value={userProfile.nama_lengkap} />
            <InfoRow label="Tempat/Tanggal Lahir" 
              value={`${userProfile.tempat_lahir || '-'}, ${formatDate(userProfile.tanggal_lahir)}`} 
            />
            <InfoRow label="Alamat" value={userProfile.alamat || '-'} />
            <InfoRow label="No. Telepon" value={userProfile.no_telp || '-'} />
            <InfoRow label="Email" value={userProfile.email || '-'} />
            <InfoRow label="Jenis SIM" value={userProfile.license_type} />
            <InfoRow label="No. SIM" value={userProfile.license_id} />
            <InfoRow label="Masa Berlaku" value={formatDate(userProfile.masa_berlaku)} />
            <InfoRow label="Jenis Unit" value={userProfile.jenis_unit || '-'} />
            <InfoRow label="No. Polisi" value={userProfile.nopol || '-'} />
            <InfoRow label="Role" value={userProfile.user_role_as} />
            <InfoRow label="Username" value={userProfile.username} />
            <InfoRow label="Password" value="••••••••" />
          </div>
        </div>

        {/* Performance Section */}
        <div className="space-y-6">
          <div className="neumorphic p-6">
            <h2 className="text-xl font-semibold text-text-primary mb-6">
              REKAP PERFORMA DRIVER
            </h2>
            
            <div className="mb-6">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <StatCard
                  title="Total Shipment"
                  value={performance?.total_shipments || 0}
                  color="bg-blue-100 text-blue-600"
                />
                <StatCard
                  title="Total HK"
                  value={performance?.total_hk || 0}
                  color="bg-purple-100 text-purple-600"
                />
                <StatCard
                  title="Total HKE"
                  value={performance?.total_hke || 0}
                  color="bg-green-100 text-green-600"
                />
                <StatCard
                  title="Total HKNE"
                  value={performance?.total_hkne || 0}
                  color="bg-red-100 text-red-600"
                />
              </div>
            </div>
            
            <div className="h-64">
              <PieChart
                data={pieChartData}
                title="Perbandingan Terkirim vs Gagal"
                height={250}
              />
            </div>
          </div>

          {/* Quiz Results Button */}
          <div className="neumorphic p-6">
            <div className="text-center">
              <button
                onClick={handleViewQuizResults}
                className="flex items-center justify-center w-full px-4 py-3 bg-accent-secondary text-white rounded-lg hover:bg-cyan-600"
              >
                <BarChart3 size={20} className="mr-2" />
                Lihat Hasil Quiz
              </button>
              <p className="text-sm text-text-secondary mt-2">
                Klik untuk melihat hasil quiz dan performance test
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <EditProfileModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSuccess={handleProfileUpdate}
        profile={userProfile}
        isAdmin={false}
      />

      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="Berhasil!"
        message="Profil berhasil diperbarui."
      />
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex border-b border-azure-shadow-dark/30 pb-3">
      <span className="font-medium text-text-primary w-40">{label}:</span>
      <span className="text-text-secondary flex-1">{value}</span>
    </div>
  )
}

function StatCard({ title, value, color }: { title: string; value: number; color: string }) {
  return (
    <div className="neumorphic-flat p-4 text-center">
      <p className="text-sm text-text-secondary mb-2">{title}</p>
      <p className={`text-2xl font-bold ${color}`}>{value.toLocaleString()}</p>
    </div>
  )
}