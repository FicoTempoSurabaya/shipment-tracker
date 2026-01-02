'use client'

import { useState, useEffect } from 'react'
import { Plus, Loader2 } from 'lucide-react'
import Modal from '@/components/ui/Modal'
import { query } from '@/lib/db'

interface AdminInputShipmentModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

interface User {
  user_id: string
  nama_lengkap: string
}

export default function AdminInputShipmentModal({
  isOpen,
  onClose,
  onSuccess
}: AdminInputShipmentModalProps) {
  const [loading, setLoading] = useState(false)
  const [users, setUsers] = useState<User[]>([])
  const [formData, setFormData] = useState({
    user_id: '',
    nama_lengkap: '',
    nama_freelance: '',
    tanggal: new Date().toISOString().split('T')[0],
    shipment_id: '',
    jumlah_toko: '',
    terkirim: '',
    gagal: '',
    alasan: ''
  })

  useEffect(() => {
    if (isOpen) {
      fetchUsers()
    }
  }, [isOpen])

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users')
      const data = await response.json()
      if (response.ok) {
        setUsers(data.users)
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    }
  }

  const handleUserChange = (userId: string) => {
    const selectedUser = users.find(user => user.user_id === userId)
    setFormData({
      ...formData,
      user_id: userId,
      nama_lengkap: selectedUser?.nama_lengkap || ''
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/shipment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          jumlah_toko: parseInt(formData.jumlah_toko),
          terkirim: parseInt(formData.terkirim),
          gagal: parseInt(formData.gagal),
          shipment_id: parseInt(formData.shipment_id)
        })
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
      nama_lengkap: '',
      nama_freelance: '',
      tanggal: new Date().toISOString().split('T')[0],
      shipment_id: '',
      jumlah_toko: '',
      terkirim: '',
      gagal: '',
      alasan: ''
    })
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Input Shipment Baru"
      size="lg"
    >
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          {/* User Selection */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Pilih Driver *
            </label>
            <select
              value={formData.user_id}
              onChange={(e) => handleUserChange(e.target.value)}
              required
              className="w-full px-4 py-2 border border-azure-shadow-dark rounded-lg focus:outline-none focus:border-accent-primary"
            >
              <option value="">Pilih Driver</option>
              {users.map(user => (
                <option key={user.user_id} value={user.user_id}>
                  {user.nama_lengkap} ({user.user_id})
                </option>
              ))}
            </select>
          </div>

          {/* Freelance Field */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Nama Freelance (Opsional)
            </label>
            <input
              type="text"
              value={formData.nama_freelance}
              onChange={(e) => setFormData({...formData, nama_freelance: e.target.value})}
              className="w-full px-4 py-2 border border-azure-shadow-dark rounded-lg focus:outline-none focus:border-accent-primary"
              placeholder="Masukkan nama freelance jika ada"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Tanggal */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Tanggal *
              </label>
              <input
                type="date"
                value={formData.tanggal}
                onChange={(e) => setFormData({...formData, tanggal: e.target.value})}
                required
                className="w-full px-4 py-2 border border-azure-shadow-dark rounded-lg focus:outline-none focus:border-accent-primary"
              />
            </div>

            {/* Shipment ID */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Shipment ID *
              </label>
              <input
                type="number"
                value={formData.shipment_id}
                onChange={(e) => setFormData({...formData, shipment_id: e.target.value})}
                required
                className="w-full px-4 py-2 border border-azure-shadow-dark rounded-lg focus:outline-none focus:border-accent-primary"
                placeholder="Masukkan shipment ID"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Jumlah Toko */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Jumlah Toko *
              </label>
              <input
                type="number"
                value={formData.jumlah_toko}
                onChange={(e) => setFormData({...formData, jumlah_toko: e.target.value})}
                required
                className="w-full px-4 py-2 border border-azure-shadow-dark rounded-lg focus:outline-none focus:border-accent-primary"
                placeholder="Jumlah toko"
              />
            </div>

            {/* Terkirim */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Terkirim *
              </label>
              <input
                type="number"
                value={formData.terkirim}
                onChange={(e) => setFormData({...formData, terkirim: e.target.value})}
                required
                className="w-full px-4 py-2 border border-azure-shadow-dark rounded-lg focus:outline-none focus:border-accent-primary"
                placeholder="Jumlah terkirim"
              />
            </div>

            {/* Gagal */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Gagal *
              </label>
              <input
                type="number"
                value={formData.gagal}
                onChange={(e) => setFormData({...formData, gagal: e.target.value})}
                required
                className="w-full px-4 py-2 border border-azure-shadow-dark rounded-lg focus:outline-none focus:border-accent-primary"
                placeholder="Jumlah gagal"
              />
            </div>
          </div>

          {/* Alasan */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Alasan Kegagalan (Opsional)
            </label>
            <textarea
              value={formData.alasan}
              onChange={(e) => setFormData({...formData, alasan: e.target.value})}
              rows={3}
              className="w-full px-4 py-2 border border-azure-shadow-dark rounded-lg focus:outline-none focus:border-accent-primary"
              placeholder="Masukkan alasan jika ada yang gagal"
            />
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
                <Plus className="mr-2" size={20} />
                Simpan Shipment
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  )
}