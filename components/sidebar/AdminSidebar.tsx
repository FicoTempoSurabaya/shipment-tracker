'use client'

import { useState } from 'react'
import { 
  LayoutDashboard, 
  User, 
  FileText, 
  HelpCircle, 
  LogOut,
  ChevronLeft,
  ChevronRight,
  Truck
} from 'lucide-react'
import { useRouter, usePathname } from 'next/navigation'

interface AdminSidebarProps {
  userName: string
}

export default function AdminSidebar({ userName }: AdminSidebarProps) {
  const [collapsed, setCollapsed] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  const handleLogout = async () => {
    // Efek visual feedback sebelum logout
    const btn = document.getElementById('logout-btn')
    if (btn) btn.style.transform = 'scale(0.95)'
    
    setTimeout(async () => {
      await fetch('/api/auth/logout', { method: 'POST' })
      router.push('/')
    }, 200)
  }

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/admin/dashboard' },
    { icon: User, label: 'Profile', path: '/admin/profile' },
    { icon: FileText, label: 'Rekap Shipment', path: '/admin/rekap-shipment' },
    { icon: HelpCircle, label: 'Manajemen Quiz', path: '/admin/quiz' }, // Label diperjelas
  ]

  return (
    <aside 
      className={`
        relative h-screen bg-sky-50 z-40 transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)]
        border-r border-white/40 shadow-xl shadow-slate-200/50
        ${collapsed ? 'w-24' : 'w-72'}
      `}
    >
      {/* --- Header Section --- */}
      <div className="p-6 mb-2 flex items-center justify-between relative">
        <div className={`flex items-center gap-3 transition-opacity duration-300 ${collapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'}`}>
          <div className="neumorphic-icon w-10 h-10 shrink-0">
            <Truck className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-800 leading-tight">Admin Panel</h2>
            <p className="text-xs text-slate-500 font-medium truncate w-32">Halo, {userName}</p>
          </div>
        </div>

        {/* Toggle Button - Floating on edge */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={`
            neumorphic-btn !p-2 !w-10 !h-10 !rounded-xl
            absolute top-6 ${collapsed ? 'left-1/2 -translate-x-1/2' : 'right-4'}
            z-50
          `}
          aria-label={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* --- Navigation Menu --- */}
      <nav className="px-4 space-y-4">
        {menuItems.map((item) => {
          const isActive = pathname === item.path || pathname.startsWith(`${item.path}/`)
          
          return (
            <button
              key={item.path}
              onClick={() => router.push(item.path)}
              className={`
                group flex items-center w-full p-3 rounded-2xl transition-all duration-300 relative overflow-hidden
                ${isActive 
                  ? 'text-sky-600 shadow-[inset_4px_4px_8px_#BDCFE0,inset_-4px_-4px_8px_#FFFFFF]' 
                  : 'text-slate-600 hover:text-sky-500 hover:-translate-y-0.5 shadow-[6px_6px_12px_#BDCFE0,-6px_-6px_12px_#FFFFFF]'
                }
                ${collapsed ? 'justify-center' : 'justify-start'}
              `}
            >
              <div className={`relative z-10 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
                <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              
              {!collapsed && (
                <span className={`ml-3 font-semibold text-sm whitespace-nowrap transition-all duration-300 ${isActive ? 'font-bold' : ''}`}>
                  {item.label}
                </span>
              )}
              
              {/* Active Indicator Bar (Left) */}
              {isActive && !collapsed && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-sky-500 rounded-r-md" />
              )}
            </button>
          )
        })}
      </nav>

      {/* --- Footer / Logout --- */}
      <div className="absolute bottom-8 left-0 w-full px-4">
        <button
          id="logout-btn"
          onClick={handleLogout}
          className={`
            group flex items-center w-full p-3 rounded-2xl text-red-500 transition-all duration-300
            hover:bg-red-50 hover:shadow-[inset_4px_4px_8px_rgba(239,68,68,0.1),inset_-4px_-4px_8px_rgba(255,255,255,0.8)]
            shadow-[6px_6px_12px_#BDCFE0,-6px_-6px_12px_#FFFFFF] border border-white/20
            ${collapsed ? 'justify-center' : 'justify-start'}
          `}
        >
          <LogOut size={22} className="transition-transform group-hover:-translate-x-1" />
          {!collapsed && <span className="ml-3 font-semibold text-sm">Keluar Aplikasi</span>}
        </button>
      </div>
    </aside>
  )
}