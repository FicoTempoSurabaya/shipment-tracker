'use client'

import { useState } from 'react'
import { UserPlus, Loader2 } from 'lucide-react'
import Modal from '@/components/ui/Modal'

interface InputProfileModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function InputProfileModal({
  isOpen,
  onClose,
  onSuccess
}: InputProfileModalProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    user_id: '',
    username: '',
    password: '',
    user_role_as: 'regular',
    nama_lengkap: '',
    tempat_lahir: '',
    tanggal_lahir: '',
    alamat: '',
    no_telp: '',
    email: '',
    license_type: 'A',
    license_id: '',
    masa_berlaku: '',
    jenis_unit: 'Motor',
    nopol: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        onSuccess()
        onClose()
        resetForm()
      } else {
        const error = await response.json()
        alert(error.error || 'Gagal menyimpan data')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Terjadi kesalahan')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      user_id: '',
      username: '',
      password: '',
      user_role_as: 'regular',
      nama_lengkap: '',
      tempat_lahir: '',
      tanggal_lahir: '',
      alamat: '',
      no_telp: '',
      email: '',
      license_type: 'A',
      license_id: '',
      masa_berlaku: '',
      jenis_unit: 'Motor',
      nopol: ''
    })
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Tambah Driver Baru"
      size="xl"
    >
      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          {/* Section 1: Account Info */}
          <div>
            <h4 className="text-lg font-semibold text-text-primary mb-4 pb-2 border-b border-azure-shadow-dark">
              Informasi Akun
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  NIK Kerja (User ID) *
                </label>
                <input
                  type="text"
                  value={formData.user_id}
                  onChange={(e) => setFormData({...formData, user_id: e.target.value})}
                  required
                  className="w-full px-4 py-2 border border-azure-shadow-dark rounded-lg focus:outline-none focus:border-accent-primary"
                  placeholder="Contoh: DRV001"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Username *
                </label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({...formData, username: e.target.value})}
                  required
                  className="w-full px-4 py-2 border border-azure-shadow-dark rounded-lg focus:outline-none focus:border-accent-primary"
                  placeholder="Username untuk login"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Password *
                </label>
                <input
                  type="text"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  required
                  className="w-full px-4 py-2 border border-azure-shadow-dark rounded-lg focus:outline-none focus:border-accent-primary"
                  placeholder="Password untuk login"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Personal Info */}
          <div>
            <h4 className="text-lg font-semibold text-text-primary mb-4 pb-2 border-b border-azure-shadow-dark">
              Informasi Pribadi
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Nama Lengkap *
                </label>
                <input
                  type="text"
                  value={formData.nama_lengkap}
                  onChange={(e) => setFormData({...formData, nama_lengkap: e.target.value})}
                  required
                  className="w-full px-4 py-2 border border-azure-shadow-dark rounded-lg focus:outline-none focus:border-accent-primary"
                  placeholder="Nama lengkap driver"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Tempat Lahir
                </label>
                <input
                  type="text"
                  value={formData.tempat_lahir}
                  onChange={(e) => setFormData({...formData, tempat_lahir: e.target.value})}
                  className="w-full px-4 py-2 border border-azure-shadow-dark rounded-lg focus:outline-none focus:border-accent-primary"
                  placeholder="Kota tempat lahir"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Tanggal Lahir *
                </label>
                <input
                  type="date"
                  value={formData.tanggal_lahir}
                  onChange={(e) => setFormData({...formData, tanggal_lahir: e.target.value})}
                  required
                  className="w-full px-4 py-2 border border-azure-shadow-dark rounded-lg focus:outline-none focus:border-accent-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  No. Telepon
                </label>
                <input
                  type="tel"
                  value={formData.no_telp}
                  onChange={(e) => setFormData({...formData, no_telp: e.target.value})}
                  className="w-full px-4 py-2 border border-azure-shadow-dark rounded-lg focus:outline-none focus:border-accent-primary"
                  placeholder="0812-3456-7890"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Alamat
                </label>
                <textarea
                  value={formData.alamat}
                  onChange={(e) => setFormData({...formData, alamat: e.target.value})}
                  rows={2}
                  className="w-full px-4 py-2 border border-azure-shadow-dark rounded-lg focus:outline-none focus:border-accent-primary"
                  placeholder="Alamat lengkap"
                />
              </div>
            </div>
          </div>

          {/* Section 3: License & Vehicle Info */}
          <div>
            <h4 className="text-lg font-semibold text-text-primary mb-4 pb-2 border-b border-azure-shadow-dark">
              Informasi SIM & Kendaraan
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Jenis SIM *
                </label>
                <select
                  value={formData.license_type}
                  onChange={(e) => setFormData({...formData, license_type: e.target.value})}
                  required
                  className="w-full px-4 py-2 border border-azure-shadow-dark rounded-lg focus:outline-none focus:border-accent-primary"
                >
                  <option value="A">A</option>
                  <option value="B1">B1</option>
                  <option value="B1 UMUM">B1 UMUM</option>
                  <option value="B2">B2</option>
                  <option value="B2 UMUM">B2 UMUM</option>
                  <option value="C">C</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  No. SIM *
                </label>
                <input
                  type="text"
                  value={formData.license_id}
                  onChange={(e) => setFormData({...formData, license_id: e.target.value})}
                  required
                  className="w-full px-4 py-2 border border-azure-shadow-dark rounded-lg focus:outline-none focus:border-accent-primary"
                  placeholder="Nomor SIM"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Masa Berlaku SIM *
                </label>
                <input
                  type="date"
                  value={formData.masa_berlaku}
                  onChange={(e) => setFormData({...formData, masa_berlaku: e.target.value})}
                  required
                  className="w-full px-4 py-2 border border-azure-shadow-dark rounded-lg focus:outline-none focus:border-accent-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Jenis Unit
                </label>
                <select
                  value={formData.jenis_unit}
                  onChange={(e) => setFormData({...formData, jenis_unit: e.target.value})}
                  className="w-full px-4 py-2 border border-azure-shadow-dark rounded-lg focus:outline-none focus:border-accent-primary"
                >
                  <option value="R2">R2 (Motor)</option>
                  <option value="L300">L300</option>
                  <option value="CDE">CDE</option>
                  <option value="CDD">CDD</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  No. Polisi
                </label>
                <input
                  type="text"
                  value={formData.nopol}
                  onChange={(e) => setFormData({...formData, nopol: e.target.value})}
                  className="w-full px-4 py-2 border border-azure-shadow-dark rounded-lg focus:outline-none focus:border-accent-primary"
                  placeholder="B 1234 ABC"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-4 py-2 border border-azure-shadow-dark rounded-lg focus:outline-none focus:border-accent-primary"
                  placeholder="email@contoh.com"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-azure-shadow-dark">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 border border-azure-shadow-dark text-text-primary rounded-lg hover:bg-azure-bg disabled:opacity-50"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center px-4 py-2 bg-accent-primary text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin mr-2" size={20} />
                Menyimpan...
              </>
            ) : (
              <>
                <UserPlus className="mr-2" size={20} />
                Simpan Driver
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  )
}