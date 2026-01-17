'use client'

import { useActionState, useState } from 'react';
import { loginAction } from './actions';
import { Truck, Eye, EyeOff, Lock, User, ArrowRight } from 'lucide-react';
import FreelanceShipmentModal from '@/components/FreelanceShipmentModal';
import { motion, Variants } from 'framer-motion';
import { DriverOption } from '@/types'; // Import tipe

// Tambahkan interface Props di sini
interface LoginPageClientProps {
  drivers: DriverOption[];
}

export default function LoginPageClient({ drivers }: LoginPageClientProps) {
  const [state, action, isPending] = useActionState(loginAction, null);
  const [showPassword, setShowPassword] = useState(false);
  const [isFreelanceModalOpen, setFreelanceModalOpen] = useState(false);

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1,
        delayChildren: 0.2 
      }
    }
  };

  const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1, 
      transition: { type: "spring", stiffness: 100 } 
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-slate-50">
      
      {/* BACKGROUND ABSTRACT ELEMENTS */}
      <div className="absolute top-[-20%] left-[-10%] w-125 h-125 bg-indigo-200/40 rounded-full blur-3xl opacity-50 mix-blend-multiply animate-blob" />
      <div className="absolute bottom-[-20%] right-[-10%] w-125 h-125 bg-teal-200/40 rounded-full blur-3xl opacity-50 mix-blend-multiply animate-blob animation-delay-2000" />
      
      {/* MAIN CARD */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-105 bg-white/80 backdrop-blur-xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/50 relative z-10 overflow-hidden"
      >
        
        {/* Header Section */}
        <div className="pt-10 pb-6 px-8 text-center">
          <motion.div variants={itemVariants} className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-linear-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/30 mb-6">
            <Truck className="text-white w-8 h-8" />
          </motion.div>
          
          <motion.h1 variants={itemVariants} className="text-2xl font-bold text-slate-800 tracking-tight">
            Shipment Tracker
          </motion.h1>
          <motion.p variants={itemVariants} className="text-slate-500 text-sm mt-2">
            Silakan masuk untuk mengelola logistik.
          </motion.p>
        </div>

        {/* Form Section */}
        <div className="p-8 pt-2">
          <form action={action} className="space-y-5">
            {state?.error && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-3 text-sm text-rose-600 bg-rose-50 border border-rose-100 rounded-xl text-center font-medium"
              >
                {state.error}
              </motion.div>
            )}

            <motion.div variants={itemVariants} className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600 ml-1 uppercase tracking-wider">Username</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                </div>
                <input
                  type="text"
                  name="username"
                  required
                  className="block w-full pl-11 pr-4 py-3.5 bg-slate-50 border-0 text-slate-900 rounded-xl ring-1 ring-slate-200 focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all placeholder:text-slate-400 sm:text-sm shadow-sm"
                  placeholder="ID Pengguna"
                />
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600 ml-1 uppercase tracking-wider">Password</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  required
                  className="block w-full pl-11 pr-11 py-3.5 bg-slate-50 border-0 text-slate-900 rounded-xl ring-1 ring-slate-200 focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all placeholder:text-slate-400 sm:text-sm shadow-sm"
                  placeholder="Kata Sandi"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-indigo-600 focus:outline-none transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="pt-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isPending}
                className="w-full flex justify-center items-center gap-2 py-3.5 px-4 rounded-xl shadow-lg shadow-indigo-500/20 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isPending ? 'Memproses...' : <>MASUK SEKARANG <ArrowRight size={18} /></>}
              </motion.button>
            </motion.div>
          </form>

          <motion.div variants={itemVariants} className="mt-8 pt-6 border-t border-slate-100 text-center">
            <button 
              onClick={() => setFreelanceModalOpen(true)}
              className="text-sm text-slate-500 hover:text-indigo-600 font-medium transition-colors flex items-center justify-center gap-1 mx-auto group"
            >
              Mode Freelance 
              <span className="group-hover:translate-x-0.5 transition-transform">→</span>
            </button>
          </motion.div>
        </div>
      </motion.div>

      <FreelanceShipmentModal 
        isOpen={isFreelanceModalOpen} 
        onClose={() => setFreelanceModalOpen(false)} 
        drivers={drivers} // Data drivers diteruskan ke modal
      />
      
    </div>
  );
}