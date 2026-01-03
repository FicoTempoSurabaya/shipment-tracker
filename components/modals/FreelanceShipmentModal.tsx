'use client'

import { useState } from 'react'
import { Package, Loader2, X, Calendar, User, Truck, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import Modal from '@/components/ui/Modal'

interface FreelanceShipmentModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function FreelanceShipmentModal({
  isOpen,
  onClose
}: FreelanceShipmentModalProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    nama_freelance: '',
    tanggal: new Date().toISOString().split('T')[0],
    shipment_id: '',
    jumlah_toko: '',
    terkirim: '',
    gagal: '',
    alasan: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // API endpoint untuk freelance shipment (tanpa auth)
      const response = await fetch('/api/freelance-shipment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          jumlah_toko: parseInt(formData.jumlah_toko),
          terkirim: parseInt(formData.terkirim),
          gagal: parseInt(formData.gagal),
          shipment_id: parseInt(formData.shipment_id)
        }),
      })

      if (response.ok) {
        alert('Data berhasil disimpan')
        onClose()
        // Reset form
        setFormData({
          nama_freelance: '',
          tanggal: new Date().toISOString().split('T')[0],
          shipment_id: '',
          jumlah_toko: '',
          terkirim: '',
          gagal: '',
          alasan: ''
        })
      } else {
        alert('Gagal menyimpan data')
      }
    } catch (error) {
      alert('Terjadi kesalahan')
    } finally {
      setLoading(false)
    }
  }

  // Helper untuk style label input
  const Label = ({ children, icon: Icon }: { children: React.ReactNode, icon?: any }) => (
    <label className="flex items-center gap-2 text-xs font-bold text-text-secondary uppercase tracking-wider mb-2 ml-1">
      {Icon && <Icon className="w-3 h-3" />}
      {children}
    </label>
  )

  // Class string untuk input Neumorphism (Pressed effect)
  const inputClass = "w-full bg-azure-surface rounded-xl px-4 py-3 text-text-primary font-medium placeholder-text-muted outline-none shadow-neu-pressed focus:shadow-neu-pressed-sm transition-all duration-300 border-transparent focus:border-white/50"

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      {/* WRAPPER UTAMA
         Kita pastikan backgroundnya sesuai tema (Azure Surface)
         dan memberikan padding yang cukup.
      */}
      <div className="bg-azure-surface p-6 sm:p-8 rounded-3xl text-text-primary max-h-[90vh] overflow-y-auto custom-scrollbar">
        
        {/* HEADER */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-azure-surface shadow-neu-flat flex items-center justify-center text-accent-primary">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-text-primary">Input Freelance</h2>
              <p className="text-xs text-text-secondary font-medium">Laporan pengiriman harian</p>
            </div>
          </div>
          
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-azure-surface shadow-neu-flat hover:shadow-neu-pressed flex items-center justify-center text-text-muted hover:text-error-text transition-all duration-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Row 1: Nama & Tanggal */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <Label icon={User}>Nama Freelance</Label>
              <input
                type="text"
                required
                value={formData.nama_freelance}
                onChange={(e) => setFormData({...formData, nama_freelance: e.target.value})}
                className={inputClass}
                placeholder="Nama Lengkap"
              />
            </div>
            <div>
              <Label icon={Calendar}>Tanggal</Label>
              <input
                type="date"
                required
                value={formData.tanggal}
                onChange={(e) => setFormData({...formData, tanggal: e.target.value})}
                className={inputClass}
              />
            </div>
          </div>

          {/* Row 2: Shipment ID & Jumlah Toko */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <Label icon={Truck}>ID Shipment</Label>
              <input
                type="number"
                required
                value={formData.shipment_id}
                onChange={(e) => setFormData({...formData, shipment_id: e.target.value})}
                className={inputClass}
                placeholder="Contoh: 1001"
              />
            </div>
            <div>
              <Label icon={Package}>Total Toko</Label>
              <input
                type="number"
                required
                value={formData.jumlah_toko}
                onChange={(e) => setFormData({...formData, jumlah_toko: e.target.value})}
                className={inputClass}
                placeholder="0"
              />
            </div>
          </div>

          {/* Row 3: Terkirim & Gagal (Visual Grouping) */}
          <div className="p-4 rounded-2xl bg-azure-surface shadow-neu-flat border border-white/40">
            <h3 className="text-sm font-bold text-text-secondary mb-4 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              STATUS PENGIRIMAN
            </h3>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <Label icon={CheckCircle}>Terkirim</Label>
                <input
                  type="number"
                  required
                  value={formData.terkirim}
                  onChange={(e) => setFormData({...formData, terkirim: e.target.value})}
                  className={`${inputClass} text-green-600 font-bold`}
                  placeholder="0"
                />
              </div>
              <div>
                <Label icon={XCircle}>Gagal</Label>
                <input
                  type="number"
                  required
                  value={formData.gagal}
                  onChange={(e) => setFormData({...formData, gagal: e.target.value})}
                  className={`${inputClass} text-error-text font-bold`}
                  placeholder="0"
                />
              </div>
            </div>
          </div>

          {/* Row 4: Alasan */}
          <div>
            <Label>Catatan / Alasan Gagal</Label>
            <textarea
              value={formData.alasan}
              onChange={(e) => setFormData({...formData, alasan: e.target.value})}
              rows={3}
              className={`${inputClass} resize-none`}
              placeholder="Tuliskan keterangan jika ada pengiriman yang gagal..."
            />
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-4 pt-4 mt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-6 py-3 rounded-xl bg-azure-surface text-text-secondary font-bold shadow-neu-flat hover:shadow-neu-pressed hover:text-text-primary transition-all duration-300 text-sm"
            >
              Batal
            </button>
            
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 rounded-xl bg-gradient-to-r from-accent-gradient-start to-accent-gradient-end text-white font-bold shadow-neu-flat hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 relative overflow-hidden group text-sm disabled:opacity-70 disabled:cursor-not-allowed"
            >
              <span className="relative z-10 flex items-center gap-2">
                {loading ? (
                  <>
                    <Loader2 className="animate-spin w-4 h-4" />
                    <span>Menyimpan...</span>
                  </>
                ) : (
                  <>
                    <span>Simpan Data</span>
                    <Package className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </span>
              {/* Shine Effect */}
              <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent z-0" />
            </button>
          </div>

        </form>
      </div>
    </Modal>
  )
}