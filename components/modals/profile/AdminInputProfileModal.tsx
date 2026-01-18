'use client'

import { useState } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';
import { createUser, UserPayload } from '@/app/profile-actions';
import { motion, AnimatePresence } from 'framer-motion';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AdminInputProfileModal({ isOpen, onClose }: ModalProps) {
  const [formData, setFormData] = useState<UserPayload>({
    user_id: '',
    nama_lengkap: '',
    tanggal_lahir: '',
    tempat_lahir: '',
    alamat: '',
    no_telp: '',
    email: '',
    license_type: 'A',
    license_id: '',
    masa_berlaku: '',
    jenis_unit: null,
    nopol: '',
    username: '',
    password: '',
    user_role_as: 'regular'
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const result = await createUser(formData);
      if (result.success) {
        onClose();
        window.location.reload();
      } else {
        setError(result.message || 'Gagal menambahkan user');
      }
    } catch {
      setError('Terjadi kesalahan sistem');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  // Styles
  const inputClass = "w-full p-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none";
  const labelClass = "block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5";

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-slate-50 w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden pointer-events-auto flex flex-col max-h-[90vh] border border-slate-200">
          
          <div className="p-5 border-b border-slate-200 bg-white flex justify-between items-center">
            <h2 className="text-lg font-black text-slate-800 uppercase">INPUT USER BARU</h2>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-rose-500"><X size={20} /></button>
          </div>

          <div className="p-6 overflow-y-auto">
            {error && <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-600 text-sm font-bold flex gap-2"><AlertCircle size={18}/>{error}</div>}
            
            <form id="inputProfileForm" onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">
              
              {/* KOLOM KIRI: Data Diri */}
              <div className="space-y-4">
                <h3 className="text-sm font-black text-indigo-600 border-b pb-2 mb-3">DATA PRIBADI</h3>
                
                <div><label className={labelClass}>User ID (NIK/KTP)</label><input type="text" required className={inputClass} value={formData.user_id} onChange={e => setFormData({...formData, user_id: e.target.value})} /></div>
                <div><label className={labelClass}>Nama Lengkap</label><input type="text" required className={inputClass} value={formData.nama_lengkap} onChange={e => setFormData({...formData, nama_lengkap: e.target.value})} /></div>
                
                <div className="grid grid-cols-2 gap-3">
                   <div><label className={labelClass}>Tempat Lahir</label><input type="text" required className={inputClass} value={formData.tempat_lahir} onChange={e => setFormData({...formData, tempat_lahir: e.target.value})} /></div>
                   <div><label className={labelClass}>Tanggal Lahir</label><input type="date" required className={inputClass} value={formData.tanggal_lahir} onChange={e => setFormData({...formData, tanggal_lahir: e.target.value})} /></div>
                </div>

                <div><label className={labelClass}>Alamat Lengkap</label><textarea required rows={2} className={inputClass} value={formData.alamat} onChange={e => setFormData({...formData, alamat: e.target.value})} /></div>
                
                <div className="grid grid-cols-2 gap-3">
                   <div><label className={labelClass}>No. Telp (+62)</label><input type="text" required placeholder="08..." className={inputClass} value={formData.no_telp} onChange={e => setFormData({...formData, no_telp: e.target.value})} /></div>
                   <div><label className={labelClass}>Email</label><input type="email" required className={inputClass} value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} /></div>
                </div>
              </div>

              {/* KOLOM KANAN: Data SIM & Akun */}
              <div className="space-y-4">
                <h3 className="text-sm font-black text-indigo-600 border-b pb-2 mb-3">DATA KENDARAAN & AKUN</h3>

                <div className="grid grid-cols-3 gap-3">
                   <div className="col-span-1">
                      <label className={labelClass}>Jenis SIM</label>
                      <select className={inputClass} value={formData.license_type} onChange={e => setFormData({...formData, license_type: e.target.value})}>
                        {['A', 'B1', 'B1 UMUM', 'B2', 'B2 UMUM', 'C'].map(o => <option key={o} value={o}>{o}</option>)}
                      </select>
                   </div>
                   <div className="col-span-2">
                      <label className={labelClass}>No. SIM</label>
                      <input type="text" required className={inputClass} value={formData.license_id} onChange={e => setFormData({...formData, license_id: e.target.value.replace(/\D/g,'')})} />
                   </div>
                </div>

                <div><label className={labelClass}>Masa Berlaku SIM</label><input type="date" required className={inputClass} value={formData.masa_berlaku} onChange={e => setFormData({...formData, masa_berlaku: e.target.value})} /></div>

                <div className="grid grid-cols-2 gap-3">
                   <div>
                     <label className={labelClass}>Jenis Unit</label>
                     <select className={inputClass} value={formData.jenis_unit || ''} onChange={e => setFormData({...formData, jenis_unit: e.target.value || null})}>
                        <option value="">-- Non Driver --</option>
                        {['R2', 'L300', 'CDE', 'CDD'].map(o => <option key={o} value={o}>{o}</option>)}
                     </select>
                   </div>
                   <div><label className={labelClass}>Nopol</label><input type="text" className={inputClass} placeholder="L 1234 XX" value={formData.nopol || ''} onChange={e => setFormData({...formData, nopol: e.target.value})} /></div>
                </div>

                <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 space-y-3 mt-4">
                    <div><label className={labelClass}>Username</label><input type="text" required className={inputClass} value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} /></div>
                    <div><label className={labelClass}>Password</label><input type="text" required className={inputClass} value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} /></div>
                    <div>
                        <label className={labelClass}>Role User</label>
                        <select className={inputClass} value={formData.user_role_as} onChange={e => setFormData({...formData, user_role_as: e.target.value as 'admin'|'regular'})}>
                            <option value="regular">Regular (Driver/Staff)</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>
                </div>
              </div>

            </form>
          </div>

          <div className="p-5 border-t border-slate-200 bg-white flex justify-end gap-3">
             <button onClick={onClose} className="px-6 py-3 font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition">Batal</button>
             <button type="submit" form="inputProfileForm" disabled={isLoading} className="px-8 py-3 bg-slate-900 text-white font-black rounded-xl hover:bg-slate-800 transition shadow-lg disabled:opacity-50 flex items-center gap-2">{isLoading ? 'Menyimpan...' : <><Save size={18}/> Simpan Data</>}</button>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
}