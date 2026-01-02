'use client'

import { useState } from 'react'
import { 
  LayoutDashboard, 
  User, 
  LogOut,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { useRouter } from 'next/navigation'

interface RegularSidebarProps {
  userName: string
}

export default function RegularSidebar({ userName }: RegularSidebarProps) {
  const [collapsed, setCollapsed] = useState(false)
  const router = useRouter()

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/')
  }

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/regular/dashboard' },
    { icon: User, label: 'Profile', path: '/regular/profile' },
  ]

  return (
    <div className={`h-screen bg-azure-surface transition-all duration-300 ${collapsed ? 'w-20' : 'w-64'}`}>
      <div className="p-4 border-b border-azure-shadow-dark">
        <div className="flex items-center justify-between">
          {!collapsed && (
            <h2 className="text-lg font-semibold text-text-primary">Driver Panel</h2>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-2 rounded-lg hover:bg-azure-bg"
          >
            {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>
        {!collapsed && (
          <p className="text-sm text-text-secondary mt-2">Selamat Datang, {userName}</p>
        )}
      </div>

      <nav className="p-4 space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.label}
            onClick={() => router.push(item.path)}
            className="flex items-center w-full p-3 rounded-lg hover:bg-azure-bg transition-colors text-text-primary"
          >
            <item.icon size={20} />
            {!collapsed && <span className="ml-3">{item.label}</span>}
          </button>
        ))}

        <button
          onClick={handleLogout}
          className="flex items-center w-full p-3 rounded-lg hover:bg-red-50 hover:text-red-600 transition-colors text-text-primary mt-8"
        >
          <LogOut size={20} />
          {!collapsed && <span className="ml-3">Log Out</span>}
        </button>
      </nav>
    </div>
  )
}