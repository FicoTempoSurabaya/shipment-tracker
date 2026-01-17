'use client'

import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, HelpCircle } from 'lucide-react';

interface SystemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  title: string;
  message: string;
  type: 'success' | 'error' | 'confirm';
}

export default function SystemModal({ isOpen, onClose, onConfirm, title, message, type }: SystemModalProps) {
  const config = {
    success: { icon: <CheckCircle2 size={60} className="text-emerald-500" />, btn: 'bg-emerald-500', bg: 'bg-emerald-50' },
    error: { icon: <XCircle size={60} className="text-rose-500" />, btn: 'bg-rose-500', bg: 'bg-rose-50' },
    confirm: { icon: <HelpCircle size={60} className="text-amber-500" />, btn: 'bg-amber-500', bg: 'bg-amber-50' }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-slate-900/40 backdrop-blur-md" />
          <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white rounded-[2.5rem] shadow-2xl p-8 w-full max-w-sm relative z-10 text-center border border-slate-100">
            <div className={`mx-auto w-24 h-24 ${config[type].bg} rounded-full flex items-center justify-center mb-6`}>
              {config[type].icon}
            </div>
            <h3 className="text-xl font-black text-slate-800 mb-2 uppercase tracking-tight">{title}</h3>
            <p className="text-slate-500 text-sm font-medium mb-8 leading-relaxed">{message}</p>
            
            <div className="flex gap-3">
              {type === 'confirm' && (
                <button type="button" onClick={onClose} className="flex-1 py-3 font-bold text-slate-400 hover:bg-slate-50 rounded-2xl transition-all">Batal</button>
              )}
              <button 
                type="button"
                onClick={type === 'confirm' ? onConfirm : onClose} 
                className={`flex-1 py-3 text-white font-black rounded-2xl shadow-lg transition-all active:scale-95 ${config[type].btn}`}
              >
                {type === 'confirm' ? 'Lanjutkan' : 'Oke, Dimengerti'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}