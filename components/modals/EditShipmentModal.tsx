'use client'

import { useState, useEffect } from 'react'
import { Save, Loader2 } from 'lucide-react'
import Modal from '@/components/ui/Modal'

interface ShipmentData {
  submit_id: number
  user_id: string
  nama_lengkap: string
  nama_freelance?: string
  tanggal: string
  shipment_id: number
  jumlah_toko: number
  terkirim: number
  gagal: number
  alasan?: string
}

interface EditShipmentModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  shipment: ShipmentData | null
}

export default function EditShipmentModal({
  isOpen,
  onClose,
  onSuccess,
  shipment
}: EditShipmentModalProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<Partial<ShipmentData>>({
    nama_lengkap: '',
    nama_freelance: '',
    tanggal: '',
    shipment_id: 0,
    jumlah_toko: 0,
    terkirim: 0,
    gagal: 0,
    alasan: ''
  })

  useEffect(() => {
    if (shipment) {
      setFormData({
        ...shipment,
        tanggal: shipment.tanggal.split('T')[0]
      })
    }
  }, [shipment])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!shipment) return

    setLoading(true)

    try {
      const response = await fetch(`/api/shipment/${shipment.submit_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        onSuccess()
        onClose()
      } else {
        const error = await response.json()
        alert(error.error || 'Gagal mengupdate data')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Terjadi kesalahan')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Shipment"
      size="lg"
    >
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          {/* Nama Lengkap */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Nama Lengkap
            </label>
            <input
              type="text"
              value={formData.nama_lengkap}
              onChange={(e) => setFormData({...formData, nama_lengkap: e.target.value})}
              required
              className="w-full px-4 py-2 border border-azure-shadow-dark rounded-lg focus:outline-none focus:border-accent-primary"
              disabled
            />
          </div>

          {/* Freelance Field */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Nama Freelance (Opsional)
            </label>
            <input
              type="text"
              value={formData.nama_freelance || ''}
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
                onChange={(e) => setFormData({...formData, shipment_id: parseInt(e.target.value)})}
                required
                className="w-full px-4 py-2 border border-azure-shadow-dark rounded-lg focus:outline-none focus:border-accent-primary"
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
                onChange={(e) => setFormData({...formData, jumlah_toko: parseInt(e.target.value)})}
                required
                className="w-full px-4 py-2 border border-azure-shadow-dark rounded-lg focus:outline-none focus:border-accent-primary"
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
                onChange={(e) => setFormData({...formData, terkirim: parseInt(e.target.value)})}
                required
                className="w-full px-4 py-2 border border-azure-shadow-dark rounded-lg focus:outline-none focus:border-accent-primary"
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
                onChange={(e) => setFormData({...formData, gagal: parseInt(e.target.value)})}
                required
                className="w-full px-4 py-2 border border-azure-shadow-dark rounded-lg focus:outline-none focus:border-accent-primary"
              />
            </div>
          </div>

          {/* Alasan */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Alasan Kegagalan (Opsional)
            </label>
            <textarea
              value={formData.alasan || ''}
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
                <Save className="mr-2" size={20} />
                Update Shipment
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  )
}