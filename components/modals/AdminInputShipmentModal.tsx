'use client'

import { useActionState, useEffect, useState } from 'react';
import { createShipmentAdmin, ActionState } from '@/app/dashboard/actions';
import { X, Save, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { DriverOption } from '@/types';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  drivers: DriverOption[];
}

export default function AdminInputShipmentModal({ isOpen, onClose, drivers }: ModalProps) {
  const [state, action, isPending] = useActionState<ActionState, FormData>(createShipmentAdmin, null);
  const [jmlToko, setJmlToko] = useState(0);
  const [terkirim, setTerkirim] = useState(0);
  const gagal = Math.max(0, jmlToko - terkirim);

  useEffect(() => {
    if (state?.success) {
      alert(state.message);
      onClose();
    }
  }, [state, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden pointer-events-auto flex flex-col max-h-[90vh] border border-slate-200"
            >
              <div className="bg-slate-800 p-5 flex justify-between items-center shrink-0">
                <h3 className="text-white font-bold text-lg">Input Data Admin</h3>
                <button onClick={onClose} className="text-slate-400 hover:text-white transition"><X /></button>
              </div>

              <div className="p-6 overflow-y-auto">
                <form action={action} className="space-y-4">
                  {state?.error && (
                    <div className="bg-rose-50 text-rose-600 p-3 rounded-xl text-sm flex items-center gap-2 border border-rose-100">
                      <AlertCircle size={16} /> {state.error}
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Pilih Driver</label>
                    <select name="user_id" required className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-slate-50">
                      <option value="">-- Pilih Driver --</option>
                      {drivers.map(d => (
                        <option key={d.user_id} value={d.user_id}>{d.nama_lengkap}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">Tanggal</label>
                      <input type="date" name="tanggal" required className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">ID Shipment (10 Digit)</label>
                      <input 
                        type="text" name="shipment_id" required inputMode="numeric" minLength={10} maxLength={10} pattern="\d{10}"
                        onKeyPress={(e) => { if (!/[0-9]/.test(e.key)) e.preventDefault(); }}
                        placeholder="10 digit angka" className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" 
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 bg-slate-50 p-5 rounded-2xl border border-slate-200">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase">Total Toko</label>
                      <input type="number" name="jumlah_toko" min="0" required onChange={(e) => setJmlToko(Number(e.target.value))} className="w-full mt-1 p-2 border border-slate-300 rounded-lg" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-emerald-600 uppercase">Terkirim</label>
                      <input type="number" name="terkirim" min="0" max={jmlToko} required onChange={(e) => setTerkirim(Number(e.target.value))} className="w-full mt-1 p-2 border border-emerald-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-rose-600 uppercase">Gagal</label>
                      <input type="number" readOnly value={gagal} className="w-full mt-1 p-2 bg-slate-200 text-slate-600 border border-slate-300 rounded-lg font-bold" />
                    </div>
                  </div>

                  {gagal > 0 && (
                     <textarea name="alasan" required rows={2} className="w-full p-3 border border-rose-300 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none" placeholder="Berikan alasan keterlambatan/kegagalan..." />
                  )}

                  <div className="pt-4 flex justify-end gap-3 shrink-0">
                    <button type="button" onClick={onClose} className="px-6 py-3 text-slate-600 hover:bg-slate-100 rounded-xl font-medium transition-colors">Batal</button>
                    <button type="submit" disabled={isPending} className="px-8 py-3 bg-slate-800 text-white rounded-xl hover:bg-slate-900 flex items-center gap-2 disabled:opacity-50 transition-all active:scale-95 shadow-lg shadow-slate-800/20">
                      {isPending ? 'Menyimpan...' : <><Save size={18} /> Simpan Data</>}
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