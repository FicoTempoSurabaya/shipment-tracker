'use client'

import { useActionState, useEffect, useState } from 'react';
import { updateShipment, ActionState } from '@/app/dashboard/actions';
import { X, Save, AlertCircle, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShipmentData } from '@/types';

interface EditModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: ShipmentData | null;
  currentUserFullName: string;
}

export default function RegularEditShipmentModal({ isOpen, onClose, data, currentUserFullName }: EditModalProps) {
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
    return d.toLocaleDateString('en-CA'); 
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 z-50 bg-indigo-900/40 backdrop-blur-sm" />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden pointer-events-auto border border-white">
              <div className="bg-indigo-600 p-6 flex justify-between items-center text-white font-bold">
                <h3 className="text-lg uppercase tracking-widest">Edit Shipment Regular</h3>
                <button type="button" onClick={onClose} className="hover:bg-white/10 p-2 rounded-full transition-colors"><X size={20} /></button>
              </div>

              <div className="p-8">
                <form action={action} className="space-y-5">
                  <input type="hidden" name="submit_id" value={data.submit_id} />
                  <input type="hidden" name="user_id" value={data.user_id} />
                  {state?.error && <div className="p-3 bg-rose-50 border border-rose-100 text-rose-600 text-sm rounded-xl font-bold flex items-center gap-2"><AlertCircle size={16} /> {state.error}</div>}

                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center gap-4">
                    <div className="p-3 bg-white rounded-xl shadow-sm"><User className="text-indigo-600" size={20} /></div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nama Driver (Read Only)</p>
                      <p className="font-bold text-slate-800">{currentUserFullName}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1 text-center">Tanggal</label>
                      <input 
                        type="date" 
                        name="tanggal" 
                        defaultValue={formatValueDate(data.tanggal)} 
                        required 
                        className="w-full p-3 border border-slate-200 rounded-xl bg-white text-sm outline-none text-center font-bold" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1 text-center">Shipment ID</label>
                      <input type="text" name="shipment_id" defaultValue={data.shipment_id} required maxLength={10} pattern="\d{10}" className="w-full p-3 border border-slate-200 rounded-xl bg-white text-sm font-mono font-bold outline-none text-center" />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1 text-center">
                      <label className="text-[10px] font-black text-slate-400 uppercase">Total</label>
                      <input type="number" name="jumlah_toko" value={jmlToko} onChange={(e) => setJmlToko(Number(e.target.value))} required className="w-full p-3 border border-slate-200 rounded-xl text-sm font-bold outline-none text-center" />
                    </div>
                    <div className="space-y-1 text-center">
                      <label className="text-[10px] font-black text-emerald-600 uppercase">Sukses</label>
                      <input type="number" name="terkirim" value={terkirim} onChange={(e) => setTerkirim(Number(e.target.value))} required className="w-full p-3 border border-emerald-100 rounded-xl text-sm font-bold outline-none text-center" />
                    </div>
                    <div className="space-y-1 text-center">
                      <label className="text-[10px] font-black text-rose-600 uppercase">Gagal</label>
                      <input type="number" value={gagal} readOnly className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-black text-slate-400 text-center" />
                    </div>
                  </div>

                  {gagal > 0 && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}>
                      <label className="text-xs font-bold text-rose-700 uppercase ml-1 block text-center">Keterangan Gagal (Wajib)</label>
                      <input type="text" name="alasan" defaultValue={data.alasan || ''} required className="w-full mt-1 p-3 border border-rose-200 bg-rose-50 rounded-xl text-sm outline-none text-center" placeholder="Sampaikan alasan..." />
                    </motion.div>
                  )}

                  <button type="submit" disabled={isPending} className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm hover:bg-indigo-700 disabled:opacity-50 flex justify-center items-center gap-2 shadow-lg shadow-indigo-200 transition-all active:scale-95">
                    {isPending ? 'Memproses...' : <><Save size={18} /> Simpan Perubahan</>}
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