'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Edit, BarChart3 } from 'lucide-react'
import PieChart from '@/components/charts/PieChart'
import EditProfileModal from '@/components/modals/EditProfileModal'
import SuccessModal from '@/components/modals/SuccessModal'
import { LicenseType, VehicleType, UserRole } from '@/lib/db-types'

interface UserProfile {
  user_id: string
  username: string
  password: string
  user_role_as: UserRole
  nama_lengkap: string
  tempat_lahir?: string
  tanggal_lahir: string
  alamat?: string
  no_telp?: string
  email?: string
  license_type: LicenseType
  license_id: string
  masa_berlaku: string
  jenis_unit?: VehicleType
  nopol?: string
}

interface PerformanceData {
  total_shipments: number
  total_hk: number
  total_hke: number
  total_hkne: number
}

export default function DriverDetailPage() {
  const params = useParams()
  const router = useRouter()
  const driverId = params.id as string
  
  const [driver, setDriver] = useState<UserProfile | null>(null)
  const [performance, setPerformance] = useState<PerformanceData | null>(null)
  const [loading, setLoading] = useState(true)
  
  // Modal states
  const [showEditModal, setShowEditModal] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)

  useEffect(() => {
    if (driverId) {
      fetchDriverData()
    }
  }, [driverId])

  const fetchDriverData = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/users/${driverId}`)
      const data = await response.json()
      
      if (response.ok) {
        setDriver(data.user)
        setPerformance(data.performance)
      } else {
        console.error('Error:', data.error)
      }
    } catch (error) {
      console.error('Error fetching driver data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleProfileUpdate = () => {
    fetchDriverData()
    setShowSuccessModal(true)
  }

  const handleViewQuizResults = () => {
    router.push(`/admin/quiz/result?userId=${driverId}`)
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

  if (!driver) {
    return (
      <div className="text-center py-12">
        <p className="text-text-secondary">Driver tidak ditemukan</p>
        <button
          onClick={() => router.push('/admin/profile')}
          className="mt-4 px-4 py-2 bg-accent-primary text-white rounded-lg hover:bg-blue-600"
        >
          Kembali ke Daftar Driver
        </button>
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
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <button
            onClick={() => router.push('/admin/profile')}
            className="mr-4 p-2 rounded-lg hover:bg-azure-bg"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-text-primary">
              {driver.nama_lengkap}
            </h1>
            <p className="text-text-secondary">NIK Kerja: {driver.user_id}</p>
          </div>
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
        {/* Driver Bio Section */}
        <div className="neumorphic p-6">
          <h2 className="text-xl font-semibold text-text-primary mb-6">
            BIODATA DRIVER
          </h2>
          
          <div className="space-y-4">
            <InfoRow label="Nama Lengkap" value={driver.nama_lengkap} />
            <InfoRow label="NIK Kerja" value={driver.user_id} />
            <InfoRow label="Tempat Lahir" value={driver.tempat_lahir || '-'} />
            <InfoRow label="Tanggal Lahir" value={formatDate(driver.tanggal_lahir)} />
            <InfoRow label="Alamat" value={driver.alamat || '-'} />
            <InfoRow label="No. Telepon" value={driver.no_telp || '-'} />
            <InfoRow label="Email" value={driver.email || '-'} />
            <InfoRow label="Jenis SIM" value={driver.license_type} />
            <InfoRow label="No. SIM" value={driver.license_id} />
            <InfoRow label="Masa Berlaku" value={formatDate(driver.masa_berlaku)} />
            <InfoRow label="Jenis Unit" value={driver.jenis_unit || '-'} />
            <InfoRow label="No. Polisi" value={driver.nopol || '-'} />
            <InfoRow label="Username" value={driver.username} />
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
        profile={driver}
        isAdmin={true}
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