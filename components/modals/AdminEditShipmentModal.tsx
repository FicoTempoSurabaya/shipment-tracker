'use client'

import { useActionState, useEffect, useState } from 'react';
import { updateShipment, ActionState } from '@/app/dashboard/actions';
import { X, Save, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { DriverOption, ShipmentData } from '@/types';

interface EditModalProps {
  isOpen: boolean;
  onClose: () => void;
  drivers: DriverOption[];
  data: ShipmentData | null;
}

export default function AdminEditShipmentModal({ isOpen, onClose, drivers, data }: EditModalProps) {
  const [state, action, isPending] = useActionState<ActionState, FormData>(updateShipment, null);
  
  const [jmlToko, setJmlToko] = useState(data?.jumlah_toko || 0);
  const [terkirim, setTerkirim] = useState(data?.terkirim || 0);
  const gagal = Math.max(0, jmlToko - terkirim);

  useEffect(() => {
    if (state?.success) {
      onClose();
    }
  }, [state, onClose]);

  if (!data) return null;

  // FIX TIMEZONE: Fungsi untuk konversi tanggal ke format YYYY-MM-DD tanpa pergeseran UTC
  const formatValueDate = (dateInput: string | Date) => {
    const d = new Date(dateInput);
    return d.toLocaleDateString('en-CA'); // en-CA menghasilkan format YYYY-MM-DD yang stabil
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm" />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden pointer-events-auto border border-slate-200">
              <div className="bg-slate-800 p-6 flex justify-between items-center text-white font-bold">
                <h3 className="text-xl uppercase tracking-tight">Edit Shipment Admin</h3>
                <button type="button" onClick={onClose} className="hover:bg-white/10 p-2 rounded-full transition-colors"><X size={20} /></button>
              </div>

              <div className="p-8">
                <form action={action} className="space-y-5">
                  <input type="hidden" name="submit_id" value={data.submit_id} />
                  {state?.error && <div className="p-3 bg-rose-50 border border-rose-100 text-rose-600 text-sm rounded-xl font-bold flex items-center gap-2"><AlertCircle size={16} /> {state.error}</div>}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-black text-slate-500 uppercase mb-1 ml-1 text-center">Nama Driver</label>
                      <select name="user_id" defaultValue={data.user_id} required className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none text-center">
                        {drivers.map(d => (<option key={d.user_id} value={d.user_id}>{d.nama_lengkap}</option>))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-black text-slate-500 uppercase mb-1 ml-1 text-center">Nama Freelance</label>
                      <input type="text" name="nama_freelance" defaultValue={data.nama_freelance || ''} className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 text-sm focus:ring-2 focus:ring-indigo-500 outline-none text-center" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-black text-slate-500 uppercase mb-1 ml-1 text-center">Tanggal</label>
                      <input 
                        type="date" 
                        name="tanggal" 
                        defaultValue={formatValueDate(data.tanggal)} 
                        required 
                        className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 text-sm focus:ring-2 focus:ring-indigo-500 outline-none text-center font-bold" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-black text-slate-500 uppercase mb-1 ml-1 text-center">Shipment ID (10 Digit)</label>
                      <input type="text" name="shipment_id" defaultValue={data.shipment_id} required maxLength={10} pattern="\d{10}" className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 text-sm font-mono font-bold focus:ring-2 focus:ring-indigo-500 outline-none text-center" />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 p-5 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="text-center">
                      <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Jml Toko</label>
                      <input type="number" name="jumlah_toko" value={jmlToko} onChange={(e) => setJmlToko(Number(e.target.value))} required className="w-full p-2 border border-slate-200 rounded-lg text-sm font-bold outline-none text-center" />
                    </div>
                    <div className="text-center">
                      <label className="block text-[10px] font-black text-emerald-500 uppercase mb-1">Terkirim</label>
                      <input type="number" name="terkirim" value={terkirim} onChange={(e) => setTerkirim(Number(e.target.value))} required className="w-full p-2 border border-emerald-200 rounded-lg text-sm font-bold outline-none text-center" />
                    </div>
                    <div className="text-center">
                      <label className="block text-[10px] font-black text-rose-500 uppercase mb-1">Gagal</label>
                      <input type="number" value={gagal} readOnly className="w-full p-2 bg-slate-200 border border-slate-300 rounded-lg text-sm font-black text-slate-500 text-center" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-black text-slate-500 uppercase mb-1 ml-1 text-center">Alasan Kegagalan</label>
                    <textarea name="alasan" defaultValue={data.alasan || ''} required={gagal > 0} rows={2} className={`w-full p-3 border rounded-xl text-sm outline-none text-center ${gagal > 0 ? 'border-rose-300 bg-rose-50' : 'border-slate-200 bg-slate-50'}`} />
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                    <button type="button" onClick={onClose} className="px-6 py-3 text-sm font-bold text-slate-500 hover:bg-slate-100 rounded-2xl">Batal</button>
                    <button type="submit" disabled={isPending} className="px-8 py-3 bg-slate-900 text-white text-sm font-black rounded-2xl hover:bg-slate-800 disabled:opacity-50 flex items-center gap-2 shadow-xl shadow-slate-200">
                      {isPending ? 'Menyimpan...' : <><Save size={18} /> Simpan Perubahan</>}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}