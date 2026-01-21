'use client'

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  Truck, 
  User, 
  LogOut, 
  ChevronRight,
  ChevronLeft,
  FileSpreadsheet,
  BrainCircuit
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { logout } from '@/app/dashboard/actions';
import SystemModal from './modals/SystemModals';

interface SidebarProps {
  role: 'admin' | 'regular';
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export default function Sidebar({ role, isOpen, setIsOpen }: SidebarProps) {
  const pathname = usePathname();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogoutAction = async () => {
    await logout();
  };

  return (
    <>
      <AnimatePresence mode="wait">
        {isOpen && (
          <>
            {/* Overlay Mobile */}
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden"
            />
            
            {/* Sidebar */}
            <motion.aside 
              initial={{ x: -300, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -300, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200, mass: 0.8 }}
              className="fixed left-0 top-0 h-full w-72 bg-slate-900 text-white z-50 flex flex-col shadow-[10px_0_30px_rgba(0,0,0,0.3)] border-r border-white/5"
            >
              {/* Header */}
              <div className="p-8 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-600 rounded-xl">
                    <Truck className="text-white" size={24}/>
                  </div>
                  <h1 className="font-black text-lg tracking-tighter">
                    SHIPMENT<span className="text-indigo-500">.</span>
                  </h1>
                </div>
                <button onClick={() => setIsOpen(false)} className="lg:hidden p-2 hover:bg-white/10 rounded-xl text-slate-400">
                  <ChevronLeft size={20}/>
                </button>
              </div>

              {/* Menu */}
              <div className="flex-1 px-4 py-2 space-y-6 overflow-y-auto">
                <nav className="space-y-1.5">
                  <SidebarLink 
                    href="/dashboard" 
                    icon={<LayoutDashboard size={18}/>} 
                    label="DASHBOARD" 
                    active={pathname === '/dashboard'} 
                  />

                  <SidebarLink 
                    href="/dashboard/profile" 
                    icon={<User size={18}/>} 
                    label="PROFILE" 
                    active={pathname.startsWith('/dashboard/profile')}
                  />

                  {/* ADMIN ONLY MENU */}
                  {role === 'admin' && (
                    <SidebarLink 
                      href="/dashboard/rekap" 
                      icon={<FileSpreadsheet size={18}/>} 
                      label="REKAP SHIPMENT" 
                      active={pathname.startsWith('/dashboard/rekap')}
                    />
                  )}

                  {/* QUIZ MENU - UNTUK SEMUA ROLE */}
                  <SidebarLink 
                    href="/dashboard/quiz" 
                    icon={<BrainCircuit size={18}/>} 
                    label="QUIZ & TEST" 
                    active={pathname.startsWith('/dashboard/quiz')}
                  />
                </nav>
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-white/5">
                <button 
                  onClick={() => setShowLogoutConfirm(true)}
                  className="w-full flex items-center justify-between p-4 bg-rose-500/10 text-rose-400 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all duration-300 group"
                >
                  <div className="flex items-center gap-3">
                    <LogOut size={18} />
                    <span>LOG OUT</span>
                  </div>
                  <ChevronRight size={14} className="opacity-50" />
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <SystemModal 
        isOpen={showLogoutConfirm} 
        onClose={() => setShowLogoutConfirm(false)} 
        onConfirm={handleLogoutAction}
        type="confirm"
        title="KONFIRMASI LOG OUT"
        message="Apakah Anda yakin ingin keluar dari sistem?"
      />
    </>
  );
}

// ... SidebarLink Component (tidak perlu diubah, tapi disertakan untuk kelengkapan) ...
interface SidebarLinkProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  comingSoon?: boolean;
}

function SidebarLink({ href, icon, label, active = false, comingSoon = false }: SidebarLinkProps) {
  if (comingSoon) {
    return (
      <div className="flex items-center justify-between px-4 py-3.5 rounded-2xl text-sm font-bold text-slate-600 opacity-50 cursor-not-allowed">
        <div className="flex items-center gap-3">
          {icon}
          <span>{label}</span>
        </div>
        <span className="text-[8px] bg-slate-800 text-slate-400 px-2 py-1 rounded">Soon</span>
      </div>
    );
  }

  return (
    <Link href={href} className="block">
      <div className={`
        flex items-center justify-between px-4 py-3.5 rounded-2xl text-sm font-bold transition-all duration-300
        ${active 
          ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/30' 
          : 'text-slate-400 hover:bg-white/5 hover:text-white'
        }
      `}>
        <div className="flex items-center gap-3">
          {icon}
          {label}
        </div>
        {active && <div className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_10px_#fff]" />}
      </div>
    </Link>
  );
}