'use client'

import { useActionState, useEffect, useState } from 'react';
import { saveFreelanceCost, ActionState } from '@/app/dashboard/actions';
import { X, Calculator } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShipmentData } from '@/types';

export default function FreelanceCostModal({ 
  isOpen, onClose, data 
}: { 
  isOpen: boolean; onClose: () => void; data: ShipmentData | null 
}) {
  const [state, action, isPending] = useActionState<ActionState, FormData>(saveFreelanceCost, null);
  
  const [costs, setCosts] = useState({
    dp_awal: 0, fee_harian: 0, perdinas: 0, bbm: 0, tol: 0, parkir: 0, tkbm: 0, lain_lain: 0
  });

  const subTotal = costs.fee_harian + costs.perdinas + costs.bbm + costs.tol + costs.parkir + costs.tkbm + costs.lain_lain;
  const grandTotal = costs.dp_awal - subTotal;

  useEffect(() => {
    if (state?.success) onClose();
  }, [state, onClose]);

  if (!data) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm" />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white w-full max-w-3xl rounded-4xl shadow-2xl overflow-hidden pointer-events-auto">
              <div className="bg-indigo-600 p-6 flex justify-between items-center text-white">
                <h3 className="font-bold text-lg uppercase flex items-center gap-2"><Calculator size={20}/> Input Biaya Freelance</h3>
                <button type="button" onClick={onClose} className="hover:bg-white/10 p-2 rounded-full"><X size={20}/></button>
              </div>

              <form action={action} className="p-8">
                <input type="hidden" name="user_id" value={data.user_id} />
                <input type="hidden" name="nama_lengkap" value={data.driver_name || ''} />
                <input type="hidden" name="tanggal" value={new Date(data.tanggal).toLocaleDateString('en-CA')} />
                <input type="hidden" name="shipment_id" value={data.shipment_id} />
                <input type="hidden" name="sub_total" value={subTotal} />
                <input type="hidden" name="grand_total" value={grandTotal} />

                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase">DP Awal (Kasbon)</label>
                      <input type="number" name="dp_awal" onChange={(e) => setCosts(prev => ({...prev, dp_awal: Number(e.target.value)}))} className="w-full p-3 bg-blue-50 border border-blue-100 rounded-xl font-bold outline-none" required />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      {['fee_harian', 'perdinas', 'bbm', 'tol', 'parkir', 'tkbm', 'lain_lain'].map((field) => (
                        <div key={field}>
                          <label className="text-[10px] font-bold text-slate-400 uppercase">{field.replace('_', ' ')}</label>
                          <input type="number" name={field} onChange={(e) => setCosts(prev => ({...prev, [field]: Number(e.target.value)}))} className="w-full p-2 border border-slate-200 rounded-lg text-sm outline-none" required />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-slate-900 rounded-3xl p-6 text-white flex flex-col justify-between">
                    <div>
                      <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Grand Total (Sisa)</p>
                      <p className={`text-4xl font-black mt-1 ${grandTotal < 0 ? 'text-rose-500' : 'text-emerald-400'}`}>
                        Rp {grandTotal.toLocaleString()}
                      </p>
                    </div>

                    <div className="space-y-4">
                      <select name="status_cost" required className="w-full p-3 bg-white/10 border border-white/20 rounded-xl text-sm font-bold outline-none">
                        <option value="Pending" className="text-slate-900">Pending</option>
                        <option value="Lunas" className="text-slate-900">Lunas</option>
                      </select>
                      <button type="submit" disabled={isPending} className="w-full py-4 bg-indigo-500 hover:bg-indigo-400 rounded-2xl font-black uppercase tracking-widest transition-all">
                        {isPending ? 'Saving...' : 'Simpan Biaya'}
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}