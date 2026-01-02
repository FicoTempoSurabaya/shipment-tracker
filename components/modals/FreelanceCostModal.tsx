'use client'

import { useState, useEffect } from 'react'
import { DollarSign, Calculator, Loader2 } from 'lucide-react'
import Modal from '@/components/ui/Modal'

interface FreelanceCostModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  shipmentId?: number
  freelanceName?: string
}

export default function FreelanceCostModal({
  isOpen,
  onClose,
  onSuccess,
  shipmentId,
  freelanceName = ''
}: FreelanceCostModalProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    submit_id: shipmentId || 0,
    nama_freelance: freelanceName,
    tanggal: new Date().toISOString().split('T')[0],
    status_cost: 'pending',
    bbm: '',
    dp_awal: '',
    fee_harian: '',
    tol: '',
    parkir: '',
    tkbm: '',
    perdinas: '',
    lain_lain: '',
    sub_total: '0',
    grand_total: '0'
  })

  useEffect(() => {
    if (freelanceName) {
      setFormData(prev => ({ ...prev, nama_freelance: freelanceName }))
    }
    if (shipmentId) {
      setFormData(prev => ({ ...prev, submit_id: shipmentId }))
    }
  }, [freelanceName, shipmentId])

  const calculateTotals = () => {
    const bbm = parseFloat(formData.bbm) || 0
    const dpAwal = parseFloat(formData.dp_awal) || 0
    const feeHarian = parseFloat(formData.fee_harian) || 0
    const tol = parseFloat(formData.tol) || 0
    const parkir = parseFloat(formData.parkir) || 0
    const tkbm = parseFloat(formData.tkbm) || 0
    const perdinas = parseFloat(formData.perdinas) || 0
    const lainLain = parseFloat(formData.lain_lain) || 0

    const subTotal = bbm + tol + parkir + tkbm + perdinas + lainLain
    const grandTotal = subTotal + dpAwal + feeHarian

    setFormData(prev => ({
      ...prev,
      sub_total: subTotal.toString(),
      grand_total: grandTotal.toString()
    }))
  }

  useEffect(() => {
    calculateTotals()
  }, [
    formData.bbm,
    formData.dp_awal,
    formData.fee_harian,
    formData.tol,
    formData.parkir,
    formData.tkbm,
    formData.perdinas,
    formData.lain_lain
  ])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/freelance-cost', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          bbm: parseFloat(formData.bbm) || 0,
          dp_awal: parseFloat(formData.dp_awal) || 0,
          fee_harian: parseFloat(formData.fee_harian) || 0,
          tol: parseFloat(formData.tol) || 0,
          parkir: parseFloat(formData.parkir) || 0,
          tkbm: parseFloat(formData.tkbm) || 0,
          perdinas: parseFloat(formData.perdinas) || 0,
          lain_lain: parseFloat(formData.lain_lain) || 0,
          sub_total: parseFloat(formData.sub_total) || 0,
          grand_total: parseFloat(formData.grand_total) || 0
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
      submit_id: shipmentId || 0,
      nama_freelance: freelanceName,
      tanggal: new Date().toISOString().split('T')[0],
      status_cost: 'pending',
      bbm: '',
      dp_awal: '',
      fee_harian: '',
      tol: '',
      parkir: '',
      tkbm: '',
      perdinas: '',
      lain_lain: '',
      sub_total: '0',
      grand_total: '0'
    })
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Biaya Freelance"
      size="lg"
    >
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          {/* Info Dasar */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Nama Freelance *
              </label>
              <input
                type="text"
                value={formData.nama_freelance}
                onChange={(e) => setFormData({...formData, nama_freelance: e.target.value})}
                required
                className="w-full px-4 py-2 border border-azure-shadow-dark rounded-lg focus:outline-none focus:border-accent-primary"
              />
            </div>
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
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Status Biaya *
              </label>
              <select
                value={formData.status_cost}
                onChange={(e) => setFormData({...formData, status_cost: e.target.value})}
                required
                className="w-full px-4 py-2 border border-azure-shadow-dark rounded-lg focus:outline-none focus:border-accent-primary"
              >
                <option value="pending">Pending</option>
                <option value="paid">Dibayar</option>
                <option value="rejected">Ditolak</option>
              </select>
            </div>
          </div>

          {/* Biaya Transportasi */}
          <div>
            <h4 className="text-lg font-semibold text-text-primary mb-4">
              Biaya Transportasi
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  BBM
                </label>
                <input
                  type="number"
                  value={formData.bbm}
                  onChange={(e) => setFormData({...formData, bbm: e.target.value})}
                  className="w-full px-4 py-2 border border-azure-shadow-dark rounded-lg focus:outline-none focus:border-accent-primary"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Tol
                </label>
                <input
                  type="number"
                  value={formData.tol}
                  onChange={(e) => setFormData({...formData, tol: e.target.value})}
                  className="w-full px-4 py-2 border border-azure-shadow-dark rounded-lg focus:outline-none focus:border-accent-primary"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Parkir
                </label>
                <input
                  type="number"
                  value={formData.parkir}
                  onChange={(e) => setFormData({...formData, parkir: e.target.value})}
                  className="w-full px-4 py-2 border border-azure-shadow-dark rounded-lg focus:outline-none focus:border-accent-primary"
                  placeholder="0"
                />
              </div>
            </div>
          </div>

          {/* Biaya Lainnya */}
          <div>
            <h4 className="text-lg font-semibold text-text-primary mb-4">
              Biaya Lainnya
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  DP Awal
                </label>
                <input
                  type="number"
                  value={formData.dp_awal}
                  onChange={(e) => setFormData({...formData, dp_awal: e.target.value})}
                  className="w-full px-4 py-2 border border-azure-shadow-dark rounded-lg focus:outline-none focus:border-accent-primary"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Fee Harian
                </label>
                <input
                  type="number"
                  value={formData.fee_harian}
                  onChange={(e) => setFormData({...formData, fee_harian: e.target.value})}
                  className="w-full px-4 py-2 border border-azure-shadow-dark rounded-lg focus:outline-none focus:border-accent-primary"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  TKBM
                </label>
                <input
                  type="number"
                  value={formData.tkbm}
                  onChange={(e) => setFormData({...formData, tkbm: e.target.value})}
                  className="w-full px-4 py-2 border border-azure-shadow-dark rounded-lg focus:outline-none focus:border-accent-primary"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Perdin (Perjalanan Dinas)
                </label>
                <input
                  type="number"
                  value={formData.perdinas}
                  onChange={(e) => setFormData({...formData, perdinas: e.target.value})}
                  className="w-full px-4 py-2 border border-azure-shadow-dark rounded-lg focus:outline-none focus:border-accent-primary"
                  placeholder="0"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Lain-lain
                </label>
                <input
                  type="number"
                  value={formData.lain_lain}
                  onChange={(e) => setFormData({...formData, lain_lain: e.target.value})}
                  className="w-full px-4 py-2 border border-azure-shadow-dark rounded-lg focus:outline-none focus:border-accent-primary"
                  placeholder="0"
                />
              </div>
            </div>
          </div>

          {/* Total */}
          <div className="bg-azure-bg p-4 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Sub Total
                </label>
                <div className="px-4 py-2 bg-white border border-azure-shadow-dark rounded-lg">
                  Rp {parseFloat(formData.sub_total).toLocaleString('id-ID')}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Grand Total
                </label>
                <div className="px-4 py-2 bg-white border border-azure-shadow-dark rounded-lg font-semibold">
                  Rp {parseFloat(formData.grand_total).toLocaleString('id-ID')}
                </div>
              </div>
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={calculateTotals}
                  className="w-full px-4 py-2 bg-accent-secondary text-white rounded-lg hover:bg-cyan-600 flex items-center justify-center"
                >
                  <Calculator className="mr-2" size={20} />
                  Hitung Ulang
                </button>
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
                <DollarSign className="mr-2" size={20} />
                Simpan Biaya
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  )
}