'use client'

import { useState, useEffect } from 'react'
import { DollarSign, Calculator, Loader2, Save, X } from 'lucide-react'
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
      // Fetch existing cost if needed (opsional, logic existing tetap jalan)
    }
  }, [shipmentId, freelanceName, isOpen])

  // Hitung total otomatis
  const calculateTotals = () => {
    const parse = (val: string) => parseInt(val) || 0
    
    const subTotal = 
      parse(formData.bbm) + 
      parse(formData.fee_harian) + 
      parse(formData.tol) + 
      parse(formData.parkir) + 
      parse(formData.tkbm) + 
      parse(formData.perdinas) + 
      parse(formData.lain_lain)

    const grandTotal = subTotal - parse(formData.dp_awal)

    setFormData(prev => ({
      ...prev,
      sub_total: subTotal.toString(),
      grand_total: grandTotal.toString()
    }))
  }

  // Auto calculate when inputs change
  useEffect(() => {
    calculateTotals()
  }, [
    formData.bbm, formData.dp_awal, formData.fee_harian, formData.tol, 
    formData.parkir, formData.tkbm, formData.perdinas, formData.lain_lain
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
          submit_id: shipmentId,
          // Konversi string ke number untuk API
          bbm: parseInt(formData.bbm) || 0,
          dp_awal: parseInt(formData.dp_awal) || 0,
          fee_harian: parseInt(formData.fee_harian) || 0,
          tol: parseInt(formData.tol) || 0,
          parkir: parseInt(formData.parkir) || 0,
          tkbm: parseInt(formData.tkbm) || 0,
          perdinas: parseInt(formData.perdinas) || 0,
          lain_lain: parseInt(formData.lain_lain) || 0,
          sub_total: parseInt(formData.sub_total) || 0,
          grand_total: parseInt(formData.grand_total) || 0,
        }),
      })

      if (response.ok) {
        onSuccess()
      } else {
        alert('Gagal menyimpan biaya')
      }
    } catch (error) {
      alert('Terjadi kesalahan')
    } finally {
      setLoading(false)
    }
  }

  // Helper UI Components
  const Label = ({ children }: { children: string }) => (
    <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-1.5 ml-1">
      {children}
    </label>
  )
  
  const inputClass = "w-full bg-azure-surface rounded-xl px-4 py-2.5 text-text-primary font-medium placeholder-text-muted outline-none shadow-neu-pressed focus:shadow-neu-pressed-sm transition-all duration-300 border-transparent focus:border-white/50 text-sm"

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="bg-azure-surface p-6 sm:p-8 rounded-3xl text-text-primary max-h-[90vh] overflow-y-auto custom-scrollbar w-full max-w-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-azure-surface shadow-neu-flat flex items-center justify-center text-accent-primary">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-text-primary">Input Biaya</h2>
              <p className="text-xs text-text-secondary font-medium">
                Shipment ID: <span className="text-accent-primary font-bold">#{shipmentId}</span> • {freelanceName}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-text-muted hover:text-error-text transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Main Cost Inputs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <Label>BBM (Bensin)</Label>
              <input type="number" placeholder="0" className={inputClass}
                value={formData.bbm} onChange={e => setFormData({...formData, bbm: e.target.value})}
              />
            </div>
            <div>
              <Label>Fee Harian</Label>
              <input type="number" placeholder="0" className={inputClass}
                value={formData.fee_harian} onChange={e => setFormData({...formData, fee_harian: e.target.value})}
              />
            </div>
            <div>
              <Label>Tol</Label>
              <input type="number" placeholder="0" className={inputClass}
                value={formData.tol} onChange={e => setFormData({...formData, tol: e.target.value})}
              />
            </div>
            <div>
              <Label>Parkir</Label>
              <input type="number" placeholder="0" className={inputClass}
                value={formData.parkir} onChange={e => setFormData({...formData, parkir: e.target.value})}
              />
            </div>
            <div>
              <Label>TKBM (Bongkar Muat)</Label>
              <input type="number" placeholder="0" className={inputClass}
                value={formData.tkbm} onChange={e => setFormData({...formData, tkbm: e.target.value})}
              />
            </div>
            <div>
              <Label>Perdinas</Label>
              <input type="number" placeholder="0" className={inputClass}
                value={formData.perdinas} onChange={e => setFormData({...formData, perdinas: e.target.value})}
              />
            </div>
            <div>
               <Label>Lain-Lain</Label>
               <input type="number" placeholder="0" className={inputClass}
                 value={formData.lain_lain} onChange={e => setFormData({...formData, lain_lain: e.target.value})}
               />
            </div>
            <div>
               <Label>DP Awal (Potongan)</Label>
               <input type="number" placeholder="0" className={`${inputClass} text-error-text`}
                 value={formData.dp_awal} onChange={e => setFormData({...formData, dp_awal: e.target.value})}
               />
            </div>
          </div>

          {/* Summary Section */}
          <div className="mt-8 p-5 rounded-2xl bg-azure-surface shadow-neu-flat border border-white/60">
             <div className="flex flex-col gap-3">
                <div className="flex justify-between items-center text-sm">
                   <span className="text-text-secondary font-medium">Sub Total Biaya</span>
                   <span className="font-bold text-text-primary">Rp {parseInt(formData.sub_total).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                   <span className="text-text-secondary font-medium">Potongan DP</span>
                   <span className="font-bold text-error-text">- Rp {parseInt(formData.dp_awal || '0').toLocaleString()}</span>
                </div>
                <div className="h-px bg-gray-300 my-1"></div>
                <div className="flex justify-between items-center text-lg">
                   <span className="font-bold text-text-primary">Grand Total</span>
                   <span className="font-black text-accent-primary text-xl">Rp {parseInt(formData.grand_total).toLocaleString()}</span>
                </div>
             </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-6 py-3 rounded-xl text-text-secondary font-bold hover:bg-black/5 transition-colors text-sm"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 rounded-xl bg-gradient-to-r from-accent-gradient-start to-accent-gradient-end text-white font-bold shadow-neu-flat hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 relative overflow-hidden group text-sm"
            >
              <span className="relative z-10 flex items-center gap-2">
                {loading ? <Loader2 className="animate-spin w-4 h-4" /> : <Save className="w-4 h-4" />}
                <span>Simpan Biaya</span>
              </span>
            </button>
          </div>

        </form>
      </div>
    </Modal>
  )
}