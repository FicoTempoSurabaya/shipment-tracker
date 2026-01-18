'use client'

import { useState, useEffect } from 'react';
import { X, Save, AlertCircle, Trash2 } from 'lucide-react';
import { updateShipment, deleteShipment } from '@/app/shipment-actions'; 
import { DriverOption, ShipmentData } from '@/types';
import SystemModal from './SystemModals';
import { motion, AnimatePresence } from 'framer-motion';

// --- DEFINISI TIPE STATE FORM ---
interface EditFormData {
  shipment_id: string;
  driver_type: 'regular' | 'freelance';
  user_id: string | number;
  nama_freelance: string;
  tanggal: string;
  jumlah_toko: number;
  terkirim: number;
  alasan: string;
}

interface EditModalProps {
  isOpen: boolean;
  onClose: () => void;
  drivers: DriverOption[];
  data: ShipmentData | null;
}

export default function AdminEditShipmentModal({ isOpen, onClose, drivers, data }: EditModalProps) {
  const [formData, setFormData] = useState<EditFormData>({
    shipment_id: '',
    driver_type: 'regular',
    user_id: '',
    nama_freelance: '',
    tanggal: '',
    jumlah_toko: 0,
    terkirim: 0,
    alasan: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Auto Hitung Gagal
  const gagal = Math.max(0, Number(formData.jumlah_toko) - Number(formData.terkirim));

  // Load Data saat Modal Dibuka
  useEffect(() => {
    if (data) {
      setFormData({
        // FIX: Konversi shipment_id ke String agar tipe data cocok dengan Input Form
        shipment_id: String(data.shipment_id), 
        
        driver_type: data.nama_freelance ? 'freelance' : 'regular',
        user_id: data.user_id || '',
        nama_freelance: data.nama_freelance || '',
        tanggal: typeof data.tanggal === 'string' 
          ? data.tanggal.slice(0, 10) 
          : new Date(data.tanggal).toISOString().slice(0, 10),
        jumlah_toko: data.jumlah_toko,
        terkirim: data.terkirim,
        alasan: data.alasan || ''
      });
    }
  }, [data, isOpen]);

  // Handle Submit Manual
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data) return;

    setIsLoading(true);
    setError('');

    try {
      const payload = {
        submit_id: data.submit_id, 
        shipment_id: formData.shipment_id,
        tanggal: formData.tanggal,
        user_id: formData.driver_type === 'regular' ? Number(formData.user_id) : null,
        nama_freelance: formData.driver_type === 'freelance' ? formData.nama_freelance : null,
        jumlah_toko: Number(formData.jumlah_toko),
        terkirim: Number(formData.terkirim),
        gagal: gagal,
        alasan: formData.alasan
      };

      const result = await updateShipment(payload);

      if (result.success) {
        onClose();
        window.location.reload(); 
      } else {
        setError(result.message || 'Gagal memperbarui data');
      }
    } catch {
      setError('Terjadi kesalahan sistem');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!data) return;
    setIsLoading(true);
    try {
       const result = await deleteShipment(data.submit_id); 
       if(result.success) {
         setShowDeleteConfirm(false);
         onClose();
         window.location.reload();
       } else {
         setError('Gagal menghapus data');
       }
    } catch {
      setError('Gagal menghapus');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen || !data) return null;

  // Styles
  const inputClass = "w-full p-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 text-sm font-bold focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400";
  const labelClass = "block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5";

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
            onClick={onClose} 
            className="fixed inset-0 z-60 bg-slate-900/60 backdrop-blur-sm" 
          />
          
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 pointer-events-none">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} 
              className="bg-slate-50 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden pointer-events-auto border border-slate-200 flex flex-col max-h-[90vh]"
            >
              {/* Header */}
              <div className="bg-white p-6 border-b border-slate-200 flex justify-between items-center">
                <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">EDIT DATA ADMIN</h3>
                <button type="button" onClick={onClose} className="hover:bg-slate-100 p-2 rounded-full transition-colors text-slate-400 hover:text-rose-500">
                  <X size={20} />
                </button>
              </div>

              {/* Form Content */}
              <div className="p-8 overflow-y-auto">
                <form id="editForm" onSubmit={handleSubmit} className="space-y-5">
                  {error && (
                    <div className="p-3 bg-rose-50 border border-rose-200 text-rose-600 text-sm rounded-xl font-bold flex items-center gap-2">
                      <AlertCircle size={16} /> {error}
                    </div>
                  )}

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
                        maxLength={10} 
                        className={inputClass}
                        value={formData.shipment_id}
                        onChange={e => setFormData({...formData, shipment_id: e.target.value})}
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
                      <label className={labelClass}>Nama Driver</label>
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
                        className={inputClass}
                        value={formData.nama_freelance}
                        onChange={e => setFormData({...formData, nama_freelance: e.target.value})}
                      />
                    </div>
                  )}

                  {/* ROW 4: STATISTIK */}
                  <div className="grid grid-cols-3 gap-4 p-5 bg-white rounded-2xl border border-slate-200">
                    <div className="text-center">
                      <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Jml Toko</label>
                      <input 
                        type="number" 
                        min="0"
                        className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 text-sm font-bold outline-none text-center focus:ring-2 focus:ring-indigo-500"
                        value={formData.jumlah_toko} 
                        onChange={(e) => setFormData({...formData, jumlah_toko: Number(e.target.value)})} 
                      />
                    </div>
                    <div className="text-center">
                      <label className="block text-[10px] font-black text-emerald-500 uppercase mb-1">Terkirim</label>
                      <input 
                        type="number" 
                        min="0"
                        max={formData.jumlah_toko}
                        className="w-full p-2 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-700 text-sm font-bold outline-none text-center focus:ring-2 focus:ring-emerald-500"
                        value={formData.terkirim} 
                        onChange={(e) => setFormData({...formData, terkirim: Number(e.target.value)})} 
                      />
                    </div>
                    <div className="text-center">
                      <label className="block text-[10px] font-black text-rose-500 uppercase mb-1">Gagal</label>
                      <input 
                        type="number" 
                        value={gagal} 
                        readOnly 
                        className="w-full p-2 bg-slate-200 border border-slate-300 rounded-lg text-sm font-black text-slate-500 text-center cursor-not-allowed" 
                      />
                    </div>
                  </div>

                  {/* ROW 5: ALASAN */}
                  {gagal > 0 && (
                    <div className="animate-in fade-in slide-in-from-top-2">
                      <label className={labelClass}>Alasan Kegagalan</label>
                      <textarea 
                        required 
                        rows={2} 
                        className={`${inputClass} border-rose-300 focus:ring-rose-500`}
                        value={formData.alasan}
                        onChange={e => setFormData({...formData, alasan: e.target.value})}
                      />
                    </div>
                  )}

                </form>
              </div>

              {/* Footer Actions */}
              <div className="p-6 border-t border-slate-200 bg-white flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setShowDeleteConfirm(true)} 
                  className="p-3 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-2xl font-bold transition-colors"
                  title="Hapus Data"
                >
                  <Trash2 size={20} />
                </button>

                <button 
                  type="button" 
                  onClick={onClose} 
                  className="flex-1 py-3 text-sm font-bold text-slate-500 hover:bg-slate-100 rounded-2xl transition-colors"
                >
                  Batal
                </button>
                
                <button 
                  type="submit" 
                  form="editForm"
                  disabled={isLoading} 
                  // FIX: Menggunakan inline style untuk flex-grow: 2 jika flex-[2] bermasalah di linter
                  className="flex-2 py-3 bg-slate-900 text-white text-sm font-black rounded-2xl hover:bg-slate-800 disabled:opacity-50 flex items-center justify-center gap-2 shadow-xl shadow-slate-900/20 transition-all"
                >
                  {isLoading ? 'Menyimpan...' : <><Save size={18} /> Simpan Perubahan</>}
                </button>
              </div>

            </motion.div>
          </div>

          {/* Konfirmasi Hapus */}
          <SystemModal 
            isOpen={showDeleteConfirm} 
            onClose={() => setShowDeleteConfirm(false)}
            onConfirm={handleDelete}
            title="HAPUS DATA?"
            message="Data shipment ini akan dihapus permanen. Lanjutkan?"
            type="confirm" 
          />
        </>
      )}
    </AnimatePresence>
  );
}