'use client'

import { useState } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';
import { createShipment } from '@/app/shipment-actions'; 
import { DriverOption } from '@/types';

interface AdminInputShipmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  drivers: DriverOption[];
}

export default function AdminInputShipmentModal({ isOpen, onClose, drivers }: AdminInputShipmentModalProps) {
  // Initial State
  const initialForm = {
    shipment_id: '',
    driver_type: 'regular', // 'regular' or 'freelance'
    user_id: '',
    nama_freelance: '',
    tanggal: new Date().toISOString().slice(0, 10),
    jumlah_toko: 0,
    terkirim: 0,
    alasan: ''
  };

  const [formData, setFormData] = useState(initialForm);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Auto Hitung Gagal
  const gagal = Math.max(0, formData.jumlah_toko - formData.terkirim);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const payload = {
        ...formData,
        gagal: gagal,
        // Logic switch User vs Freelance
        user_id: formData.driver_type === 'regular' ? Number(formData.user_id) : null,
        nama_freelance: formData.driver_type === 'freelance' ? formData.nama_freelance : null
      };

      const result = await createShipment(payload);

      if (result.success) {
        onClose();
        setFormData(initialForm); // Reset form
        window.location.reload(); 
      } else {
        setError(result.message || 'Gagal menyimpan data');
      }
    } catch { // FIX: Menghapus variabel 'err' yang tidak digunakan
      setError('Terjadi kesalahan sistem');
    } finally {
      setIsLoading(false);
    }
  };

  // --- STYLING ---
  const inputClass = "w-full p-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 text-sm font-bold focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400";
  const labelClass = "block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5";

  return (
    // FIX: z-[60] -> z-60
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-slate-50 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh] border border-slate-200">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex justify-between items-center bg-white">
          <h2 className="text-lg font-black text-slate-800">INPUT DATA ADMIN</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-rose-500 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Form Scrollable */}
        <div className="p-6 overflow-y-auto">
          {error && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-600 text-sm font-bold flex items-center gap-2">
              <AlertCircle size={18} />
              {error}
            </div>
          )}

          <form id="inputForm" onSubmit={handleSubmit} className="space-y-5">
            
            {/* ROW 1: TANGGAL & ID */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className={labelClass}>Tanggal</label>
                    <input 
                        type="date" 
                        required
                        className={inputClass}
                        value={formData.tanggal}
                        onChange={e => setFormData({...formData, tanggal: e.target.value})}
                    />
                </div>
                <div>
                    <label className={labelClass}>ID Shipment</label>
                    <input 
                        type="text" 
                        required
                        placeholder="10 Digit Angka"
                        className={inputClass}
                        maxLength={10}
                        value={formData.shipment_id}
                        onChange={e => setFormData({...formData, shipment_id: e.target.value.replace(/\D/g, '')})}
                    />
                </div>
            </div>

            {/* ROW 2: TIPE DRIVER SWITCH */}
            <div>
               <label className={labelClass}>Tipe Personil</label>
               <div className="flex bg-slate-200 p-1 rounded-xl">
                 <button 
                   type="button"
                   onClick={() => setFormData({...formData, driver_type: 'regular'})}
                   className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${formData.driver_type === 'regular' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                 >
                   DRIVER TETAP
                 </button>
                 <button 
                   type="button"
                   onClick={() => setFormData({...formData, driver_type: 'freelance'})}
                   className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${formData.driver_type === 'freelance' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                 >
                   FREELANCE
                 </button>
               </div>
            </div>

            {/* ROW 3: INPUT NAMA (CONDITIONAL) */}
            {formData.driver_type === 'regular' ? (
              <div>
                <label className={labelClass}>Pilih Driver</label>
                <select 
                  required
                  className={inputClass}
                  value={formData.user_id}
                  onChange={e => setFormData({...formData, user_id: e.target.value})}
                >
                  <option value="">-- Pilih Driver --</option>
                  {drivers.map(d => (
                    <option key={d.user_id} value={d.user_id}>{d.nama_lengkap}</option>
                  ))}
                </select>
              </div>
            ) : (
              <div>
                <label className={labelClass}>Nama Freelance</label>
                <input 
                  type="text"
                  required
                  placeholder="Masukkan Nama Lengkap"
                  className={inputClass}
                  value={formData.nama_freelance}
                  onChange={e => setFormData({...formData, nama_freelance: e.target.value})}
                />
              </div>
            )}

            {/* ROW 4: STATISTIK (AUTO CALC GAGAL) */}
            <div className="grid grid-cols-3 gap-4 bg-white p-4 rounded-2xl border border-slate-200">
               <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Total</label>
                  <input 
                    type="number" 
                    min="0"
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={formData.jumlah_toko}
                    onChange={e => setFormData({...formData, jumlah_toko: Number(e.target.value)})}
                  />
               </div>
               <div>
                  <label className="block text-[10px] font-bold text-emerald-600 uppercase mb-1">Terkirim</label>
                  <input 
                    type="number" 
                    min="0"
                    max={formData.jumlah_toko}
                    className="w-full p-2 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-700 font-bold focus:ring-2 focus:ring-emerald-500 outline-none"
                    value={formData.terkirim}
                    onChange={e => setFormData({...formData, terkirim: Number(e.target.value)})}
                  />
               </div>
               <div>
                  <label className="block text-[10px] font-bold text-rose-600 uppercase mb-1">Gagal</label>
                  {/* READ ONLY - Auto Calculated */}
                  <input 
                    type="number" 
                    readOnly
                    className="w-full p-2 bg-slate-200 border border-slate-300 rounded-lg text-slate-500 font-bold cursor-not-allowed"
                    value={gagal}
                  />
               </div>
            </div>

            {/* ROW 5: ALASAN (Muncul jika ada gagal) */}
            {gagal > 0 && (
              <div className="animate-in fade-in slide-in-from-top-2">
                <label className={labelClass}>Alasan Gagal / Retur</label>
                <textarea 
                  required
                  rows={2}
                  className={`${inputClass} border-rose-300 focus:ring-rose-500`}
                  placeholder="Wajib diisi: Alasan retur..."
                  value={formData.alasan}
                  onChange={e => setFormData({...formData, alasan: e.target.value})}
                />
              </div>
            )}

          </form>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-slate-200 bg-white flex gap-3">
           <button 
             type="button" 
             onClick={onClose}
             className="flex-1 py-3 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition-colors"
           >
             Batal
           </button>
           <button 
             type="submit" 
             form="inputForm"
             disabled={isLoading}
             // FIX: flex-[2] -> flex-2
             className="flex-2 py-3 rounded-xl font-bold bg-slate-900 text-white hover:bg-slate-800 shadow-lg shadow-slate-900/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
           >
             {isLoading ? 'Menyimpan...' : (
               <>
                 <Save size={18} /> Simpan Data
               </>
             )}
           </button>
        </div>

      </div>
    </div>
  );
}