'use client'

import { useState, useEffect } from 'react'
import { 
  LayoutDashboard, 
  User, 
  FileText, 
  HelpCircle, 
  LogOut,
  ChevronLeft,
  Menu,
  X,
  Truck
} from 'lucide-react'
import { useRouter, usePathname } from 'next/navigation'

interface AdminSidebarProps {
  userName: string
}

export default function AdminSidebar({ userName }: AdminSidebarProps) {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  // Auto close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  const handleLogout = async () => {
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
    { icon: HelpCircle, label: 'Manajemen Quiz', path: '/admin/quiz' },
  ]

  return (
    <>
      {/* --- MOBILE HAMBURGER BUTTON (Visible only on mobile) --- */}
      <button 
        onClick={() => setMobileOpen(true)}
        className="fixed top-4 left-4 z-40 p-3 rounded-xl bg-azure-surface text-text-primary shadow-neu-flat md:hidden hover:text-accent-primary transition-all active:scale-95"
      >
        <Menu size={24} />
      </button>

      {/* --- MOBILE OVERLAY (Glass Effect) --- */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm md:hidden animate-fade-in"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* --- SIDEBAR CONTAINER --- */}
      <aside 
        className={`
          fixed md:static inset-y-0 left-0 z-50
          h-screen bg-azure-surface
          transition-all duration-300 ease-in-out
          ${collapsed ? 'w-24' : 'w-72'}
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          flex flex-col border-r border-white/50 shadow-2xl md:shadow-none
        `}
      >
        {/* --- HEADER / TOGGLE AREA (Modified) --- */}
        {/* Area ini sekarang clickable untuk toggle collapse di desktop */}
        <div className="h-24 relative flex items-center justify-center">
          <button 
            onClick={() => setCollapsed(!collapsed)}
            className="w-full h-full flex items-center justify-center gap-3 group outline-none"
            title={collapsed ? "Expand Menu" : "Collapse Menu"}
          >
            {/* Logo Icon */}
            <div className={`
              w-10 h-10 rounded-xl bg-gradient-to-br from-accent-primary to-blue-600 text-white flex items-center justify-center shadow-lg
              transition-transform duration-300 group-hover:scale-110 group-active:scale-95
            `}>
              <Truck size={20} />
            </div>

            {/* Logo Text & Collapse Indicator */}
            {!collapsed && (
              <div className="animate-fade-in flex flex-col items-start">
                <h1 className="text-xl font-bold text-text-primary tracking-tight leading-none">
                  Tracker<span className="text-accent-primary">.io</span>
                </h1>
                {/* Visual Hint untuk Collapse */}
                <div className="flex items-center gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                   <span className="text-[10px] text-text-secondary font-medium uppercase tracking-wider">Minimize</span>
                   <ChevronLeft size={10} className="text-accent-primary" />
                </div>
              </div>
            )}
            
            {/* Close Button (Mobile Only - Tetap ada untuk UX mobile yang baik) */}
            <div 
              onClick={(e) => { e.stopPropagation(); setMobileOpen(false); }}
              className="absolute top-8 right-6 md:hidden text-text-secondary p-2 active:scale-90 transition-transform"
            >
              <X size={24} />
            </div>
          </button>
        </div>

        {/* --- USER INFO (Neumorphic Inset) --- */}
        <div className={`mx-4 mb-6 transition-all duration-300 ${collapsed ? 'px-2' : 'px-4'}`}>
          <div className={`
            bg-azure-surface rounded-2xl p-4 flex items-center gap-3
            shadow-neu-pressed border border-white/20 overflow-hidden
            ${collapsed ? 'justify-center' : ''}
          `}>
            <div className="w-8 h-8 rounded-full bg-accent-primary/20 text-accent-primary flex items-center justify-center font-bold shrink-0">
              {userName?.charAt(0).toUpperCase()}
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <p className="text-sm font-bold text-text-primary truncate">{userName}</p>
                <p className="text-[10px] text-text-secondary uppercase tracking-wider">Administrator</p>
              </div>
            )}
          </div>
        </div>

        {/* --- NAVIGATION MENU --- */}
        <nav className="flex-1 px-4 space-y-3 overflow-y-auto custom-scrollbar py-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.path
            return (
              <button
                key={item.path}
                onClick={() => router.push(item.path)}
                className={`
                  w-full relative flex items-center p-3.5 rounded-2xl transition-all duration-300 group
                  ${isActive 
                    ? 'text-accent-primary shadow-neu-pressed font-bold' 
                    : 'text-text-secondary shadow-neu-flat hover:shadow-neu-pressed hover:text-text-primary bg-azure-surface'
                  }
                  ${collapsed ? 'justify-center' : ''}
                `}
                title={collapsed ? item.label : ''}
              >
                <item.icon 
                  size={22} 
                  className={`transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} 
                  strokeWidth={isActive ? 2.5 : 2}
                />
                
                {!collapsed && (
                  <span className="ml-4 text-sm whitespace-nowrap animate-fade-in">
                    {item.label}
                  </span>
                )}
                
                {/* Active Indicator Dot */}
                {isActive && !collapsed && (
                  <div className="absolute right-4 w-2 h-2 rounded-full bg-accent-primary shadow-[0_0_8px_rgba(56,189,248,0.6)]" />
                )}
              </button>
            )
          })}
        </nav>

        {/* --- FOOTER (Hanya Tombol Logout) --- */}
        <div className="p-4 mt-auto">
          <button
            id="logout-btn"
            onClick={handleLogout}
            className={`
              w-full flex items-center p-3 rounded-2xl text-error-text transition-all duration-300
              hover:bg-error-bg/10 shadow-neu-flat hover:shadow-neu-pressed group
              ${collapsed ? 'justify-center' : ''}
            `}
            title={collapsed ? "Keluar Aplikasi" : ""}
          >
            <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
            {!collapsed && <span className="ml-3 font-bold text-sm">Keluar</span>}
          </button>
        </div>
      </aside>
    </>
  )
}