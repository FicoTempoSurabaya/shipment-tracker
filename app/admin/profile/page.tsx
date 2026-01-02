'use client'

import { useState, useEffect } from 'react'
import { UserPlus, Edit, Trash2, Eye, BarChart3 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import InputProfileModal from '@/components/modals/InputProfileModal'
import EditProfileModal from '@/components/modals/EditProfileModal'
import ConfirmationModal from '@/components/modals/ConfirmationModal'
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

export default function AdminProfilePage() {
  const router = useRouter()
  const [adminProfile, setAdminProfile] = useState<UserProfile | null>(null)
  const [drivers, setDrivers] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)
  
  // Modal states
  const [showInputModal, setShowInputModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  
  const [selectedDriver, setSelectedDriver] = useState<UserProfile | null>(null)
  const [performanceData, setPerformanceData] = useState<PerformanceData | null>(null)

  useEffect(() => {
    fetchAdminProfile()
    fetchDrivers()
  }, [])

  const fetchAdminProfile = async () => {
    try {
      const response = await fetch('/api/auth/me')
      const data = await response.json()
      
      if (response.ok && data.user) {
        const userResponse = await fetch(`/api/users/${data.user.userId}`)
        const userData = await userResponse.json()
        
        if (userResponse.ok) {
          setAdminProfile(userData.user)
        }
      }
    } catch (error) {
      console.error('Error fetching admin profile:', error)
    }
  }

  const fetchDrivers = async () => {
    try {
      const response = await fetch('/api/users?role=regular')
      const data = await response.json()
      
      if (response.ok) {
        setDrivers(data.users)
      }
    } catch (error) {
      console.error('Error fetching drivers:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEditClick = (driver: UserProfile) => {
    setSelectedDriver(driver)
    setShowEditModal(true)
  }

  const handleDeleteClick = (driver: UserProfile) => {
    setSelectedDriver(driver)
    setShowDeleteModal(true)
  }

  const handleViewProfile = (driverId: string) => {
    router.push(`/admin/profile/${driverId}`)
  }

  const handleDeleteConfirm = async () => {
    if (!selectedDriver) return

    try {
      const response = await fetch(`/api/users/${selectedDriver.user_id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setShowDeleteModal(false)
        setShowSuccessModal(true)
        fetchDrivers()
      } else {
        const error = await response.json()
        alert(error.error || 'Gagal menghapus driver')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Terjadi kesalahan')
    }
  }

  const handleProfileUpdate = () => {
    fetchAdminProfile()
    fetchDrivers()
    setShowSuccessModal(true)
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

  return (
    <div className="space-y-8">
      {/* Admin Profile Section */}
      <div className="neumorphic p-6">
        <h1 className="text-2xl font-bold text-text-primary mb-6">
          Profil Admin
        </h1>
        
        {adminProfile && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column - Personal Info */}
            <div>
              <h3 className="text-lg font-semibold text-text-primary mb-4">
                Biodata Diri
              </h3>
              <div className="space-y-3">
                <InfoRow label="User ID" value={adminProfile.user_id} />
                <InfoRow label="Nama Lengkap" value={adminProfile.nama_lengkap} />
                <InfoRow label="Tempat/Tanggal Lahir" 
                  value={`${adminProfile.tempat_lahir || '-'}, ${formatDate(adminProfile.tanggal_lahir)}`} 
                />
                <InfoRow label="Alamat" value={adminProfile.alamat || '-'} />
                <InfoRow label="No. Telepon" value={adminProfile.no_telp || '-'} />
                <InfoRow label="Email" value={adminProfile.email || '-'} />
              </div>
            </div>
            
            {/* Right Column - License & Account Info */}
            <div>
              <h3 className="text-lg font-semibold text-text-primary mb-4">
                Informasi SIM & Akun
              </h3>
              <div className="space-y-3">
                <InfoRow label="Jenis SIM" value={adminProfile.license_type} />
                <InfoRow label="No. SIM" value={adminProfile.license_id} />
                <InfoRow label="Masa Berlaku" value={formatDate(adminProfile.masa_berlaku)} />
                <InfoRow label="Jenis Unit" value={adminProfile.jenis_unit || '-'} />
                <InfoRow label="No. Polisi" value={adminProfile.nopol || '-'} />
                <InfoRow label="Role" value={adminProfile.user_role_as} />
                <InfoRow label="Username" value={adminProfile.username} />
                <InfoRow label="Password" value="••••••••" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Separator Line */}
      <div className="border-t border-azure-shadow-dark"></div>

      {/* Drivers List Section */}
      <div className="neumorphic p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-text-primary">
            Daftar Biodata Driver
          </h2>
          <button
            onClick={() => setShowInputModal(true)}
            className="flex items-center px-4 py-2 bg-accent-primary text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <UserPlus size={20} className="mr-2" />
            Tambah Driver
          </button>
        </div>

        {drivers.length === 0 ? (
          <div className="text-center py-8 text-text-secondary">
            Belum ada driver yang terdaftar
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {drivers.map((driver) => (
              <DriverCard
                key={driver.user_id}
                driver={driver}
                onEdit={() => handleEditClick(driver)}
                onDelete={() => handleDeleteClick(driver)}
                onView={() => handleViewProfile(driver.user_id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      <InputProfileModal
        isOpen={showInputModal}
        onClose={() => setShowInputModal(false)}
        onSuccess={handleProfileUpdate}
      />

      <EditProfileModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSuccess={handleProfileUpdate}
        profile={selectedDriver}
        isAdmin={true}
      />

      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteConfirm}
        title="Hapus Driver"
        message={`Apakah Anda yakin ingin menghapus driver ${selectedDriver?.nama_lengkap}?`}
        confirmText="Ya, Hapus Driver"
      />

      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="Berhasil!"
        message="Operasi berhasil disimpan."
      />
    </div>
  )
}

// Helper Components
function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex border-b border-azure-shadow-dark/30 pb-2">
      <span className="font-medium text-text-primary w-40">{label}:</span>
      <span className="text-text-secondary flex-1">{value}</span>
    </div>
  )
}

function DriverCard({ 
  driver, 
  onEdit, 
  onDelete, 
  onView 
}: { 
  driver: UserProfile
  onEdit: () => void
  onDelete: () => void
  onView: () => void
}) {
  return (
    <div className="neumorphic p-4 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h4 className="font-semibold text-text-primary">{driver.nama_lengkap}</h4>
          <p className="text-sm text-text-secondary">ID: {driver.user_id}</p>
        </div>
        <div className="flex space-x-1">
          <button
            onClick={onEdit}
            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
            title="Edit"
          >
            <Edit size={16} />
          </button>
          <button
            onClick={onDelete}
            className="p-1 text-red-600 hover:bg-red-50 rounded"
            title="Hapus"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
      
      <div className="space-y-2 text-sm text-text-secondary mb-4">
        <div className="flex">
          <span className="w-24">Unit:</span>
          <span>{driver.jenis_unit || '-'}</span>
        </div>
        <div className="flex">
          <span className="w-24">No. Polisi:</span>
          <span>{driver.nopol || '-'}</span>
        </div>
        <div className="flex">
          <span className="w-24">SIM:</span>
          <span>{driver.license_type} - {driver.license_id}</span>
        </div>
      </div>
      
      <div className="flex justify-between pt-3 border-t border-azure-shadow-dark/30">
        <button
          onClick={onView}
          className="flex items-center text-sm text-accent-primary hover:text-blue-600"
        >
          <Eye size={16} className="mr-1" />
          Lihat Detail
        </button>
        <button
          onClick={onView}
          className="flex items-center text-sm text-accent-secondary hover:text-cyan-600"
        >
          <BarChart3 size={16} className="mr-1" />
          Lihat Performa
        </button>
      </div>
    </div>
  )
}