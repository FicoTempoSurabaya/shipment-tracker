'use client'

import { useActionState, useEffect, useState } from 'react';
import { createShipmentFreelance, ActionState } from '@/app/dashboard/actions';
import { X, Package, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { DriverOption } from '@/types';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  drivers?: DriverOption[];
}

export default function FreelanceShipmentModal({ isOpen, onClose, drivers = [] }: ModalProps) {
  const [state, action, isPending] = useActionState<ActionState, FormData>(createShipmentFreelance, null);
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
            onClick={onClose}
            className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm"
          />
          
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 10 }}
              className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden pointer-events-auto border border-white/20 flex flex-col max-h-[90vh]"
            >
              <div className="bg-linear-to-r from-teal-600 to-emerald-600 p-6 flex justify-between items-start shrink-0 text-white">
                <div>
                  <h3 className="font-bold text-xl flex items-center gap-2">
                    <Package className="w-6 h-6 text-teal-100" />
                    Input Freelance
                  </h3>
                  <p className="text-teal-100 text-sm mt-1">Form khusus mitra tanpa login</p>
                </div>
                <button onClick={onClose} className="hover:bg-white/10 p-2 rounded-full transition-colors"><X size={20} /></button>
              </div>

              <div className="p-6 overflow-y-auto">
                <form action={action} className="space-y-4">
                  {state?.error && (
                    <div className="p-3 bg-rose-50 border border-rose-100 text-rose-600 text-sm rounded-xl font-medium">
                      {state.error}
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-semibold text-slate-700">Driver Penanggung Jawab</label>
                    <select name="user_id" required className="w-full mt-1 p-3 border border-slate-300 rounded-xl bg-slate-50 focus:ring-2 focus:ring-teal-500 outline-none">
                      <option value="">-- Pilih Driver Regular --</option>
                      {drivers.map(d => (
                        <option key={d.user_id} value={d.user_id}>{d.nama_lengkap}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700">Nama Anda (Freelance)</label>
                    <input type="text" name="nama_freelance" required placeholder="Masukkan nama lengkap" className="w-full mt-1 p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-semibold text-slate-700">Tanggal</label>
                      <input type="date" name="tanggal" required className="w-full mt-1 p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none" />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-slate-700">ID Shipment (10 Digit)</label>
                      <input 
                        type="text" 
                        inputMode="numeric"
                        name="shipment_id" 
                        required 
                        minLength={10}
                        maxLength={10}
                        pattern="\d{10}"
                        placeholder="1234567890"
                        onKeyPress={(e) => { if (!/[0-9]/.test(e.key)) e.preventDefault(); }}
                        className="w-full mt-1 p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none" 
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <div>
                       <span className="text-[10px] font-bold text-slate-500 uppercase">Total</span>
                       <input type="number" name="jumlah_toko" min="0" required onChange={(e) => setJmlToko(Number(e.target.value))} className="w-full p-2 border border-slate-200 rounded-lg mt-1" />
                    </div>
                    <div>
                       <span className="text-[10px] font-bold text-emerald-600 uppercase">Sukses</span>
                       <input type="number" name="terkirim" min="0" max={jmlToko} required onChange={(e) => setTerkirim(Number(e.target.value))} className="w-full p-2 border border-emerald-200 rounded-lg mt-1 focus:ring-2 focus:ring-emerald-500 outline-none" />
                    </div>
                    <div>
                       <span className="text-[10px] font-bold text-rose-600 uppercase">Gagal</span>
                       <input type="number" value={gagal} readOnly className="w-full p-2 bg-slate-200 border border-slate-200 rounded-lg mt-1 font-bold text-slate-600" />
                    </div>
                  </div>

                  {gagal > 0 && (
                     <textarea name="alasan" rows={2} required className="w-full p-3 border border-rose-300 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none" placeholder="Alasan kegagalan..." />
                  )}

                  <button type="submit" disabled={isPending} className="w-full py-4 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-2xl shadow-lg shadow-teal-600/20 flex justify-center items-center gap-2 transition-all active:scale-95 disabled:opacity-50">
                    {isPending ? 'Mengirim...' : <><Send size={18} /> Kirim Laporan</>}
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}