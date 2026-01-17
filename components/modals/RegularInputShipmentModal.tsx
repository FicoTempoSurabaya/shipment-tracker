'use client'

import { useActionState, useEffect, useState } from 'react';
import { createShipmentRegular, ActionState } from '@/app/dashboard/actions';
import { X, Send, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserFullName: string;
}

export default function RegularInputShipmentModal({ isOpen, onClose, currentUserFullName }: ModalProps) {
  const [state, action, isPending] = useActionState<ActionState, FormData>(createShipmentRegular, null);
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
            className="fixed inset-0 z-50 bg-indigo-900/40 backdrop-blur-sm"
            onClick={onClose}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden pointer-events-auto border border-white/50"
            >
              <div className="bg-indigo-600 p-6 flex justify-between items-center text-white">
                <h3 className="font-bold text-lg tracking-tight">Setoran Pengiriman</h3>
                <button onClick={onClose} className="text-indigo-100 hover:text-white transition-colors"><X /></button>
              </div>

              <form action={action} className="p-6 space-y-5">
                {state?.error && (
                  <div className="bg-rose-50 text-rose-600 p-3 rounded-xl text-sm flex items-center gap-2 border border-rose-100">
                    <AlertCircle size={16} /> {state.error}
                  </div>
                )}

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <span className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Driver Aktif</span>
                  <div className="font-bold text-slate-800 text-lg">{currentUserFullName}</div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold text-slate-700">Tanggal</label>
                    <input type="date" name="tanggal" required className="w-full mt-1 p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-slate-700">No. Shipment (10 Digit)</label>
                    <input 
                       type="text" name="shipment_id" required inputMode="numeric" minLength={10} maxLength={10} pattern="\d{10}"
                       onKeyPress={(e) => { if (!/[0-9]/.test(e.key)) e.preventDefault(); }}
                       className="w-full mt-1 p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" 
                       placeholder="1234567890"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Total</label>
                    <input type="number" name="jumlah_toko" min="0" required onChange={(e) => setJmlToko(Number(e.target.value))} className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-emerald-600 uppercase">Sukses</label>
                    <input type="number" name="terkirim" min="0" max={jmlToko} required onChange={(e) => setTerkirim(Number(e.target.value))} className="w-full p-3 border border-emerald-100 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-rose-600 uppercase">Gagal</label>
                    <input type="number" readOnly value={gagal} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-400" />
                  </div>
                </div>

                {gagal > 0 && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}>
                     <label className="text-sm font-semibold text-rose-700">Berikan Keterangan Gagal</label>
                     <input type="text" name="alasan" required className="w-full mt-1 p-3 border border-rose-200 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none" placeholder="Contoh: Ban pecah / Toko tutup" />
                  </motion.div>
                )}

                <button type="submit" disabled={isPending} className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/30 flex justify-center items-center gap-2 active:scale-95 disabled:opacity-50">
                  {isPending ? 'Mengirim Data...' : <><Send size={18} /> Kirim Laporan</>}
                </button>
              </form>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}