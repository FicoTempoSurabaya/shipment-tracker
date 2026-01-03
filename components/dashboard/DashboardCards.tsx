'use client'

import { Package, CheckCircle, XCircle } from 'lucide-react'

interface DashboardCardsProps {
  hk: number
  hke: number
  hkne: number
}

export default function DashboardCards({ hk, hke, hkne }: DashboardCardsProps) {
  const cards = [
    {
      title: 'HK (Hari Kerja)',
      value: hk,
      // Warna Biru (Total Hari)
      icon: Package,
      iconColor: 'text-blue-600',
      shadowColor: 'shadow-blue-200',
      borderColor: 'border-blue-100',
      desc: 'Total tanggal (exclude Minggu)'
    },
    {
      title: 'HKE (Efektif)',
      value: hke,
      // Warna Hijau (Good/Efektif)
      icon: CheckCircle,
      iconColor: 'text-emerald-600',
      shadowColor: 'shadow-emerald-200',
      borderColor: 'border-emerald-100',
      desc: 'Tanpa Freelance'
    },
    {
      title: 'HKNE (Non-Efektif)',
      value: hkne,
      // Warna Merah (Warning/Non-Efektif)
      icon: XCircle,
      iconColor: 'text-rose-600',
      shadowColor: 'shadow-rose-200',
      borderColor: 'border-rose-100',
      desc: 'Menggunakan Freelance'
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {cards.map((card) => (
        <div 
          key={card.title} 
          className="relative bg-azure-surface p-6 rounded-3xl shadow-neu-flat border border-white/60 group hover:-translate-y-1 transition-transform duration-300"
        >
          <div className="flex items-start justify-between mb-4">
            {/* Icon Container (Pressed/Embossed Effect) */}
            <div className={`
              w-14 h-14 rounded-2xl flex items-center justify-center
              bg-azure-surface shadow-neu-pressed
              ${card.iconColor} transition-colors duration-300
            `}>
              <card.icon size={28} strokeWidth={2} />
            </div>
            
            {/* Visual Indicator Pill */}
            <span className={`
               px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider
               bg-azure-surface shadow-neu-flat border ${card.borderColor} ${card.iconColor}
            `}>
              {card.title.split(' ')[0]} 
            </span>
          </div>

          <div>
            <h3 className="text-4xl font-black text-text-primary tracking-tight mb-1">
              {card.value.toLocaleString()}
            </h3>
            <p className="text-sm font-bold text-text-secondary uppercase tracking-wide">
              {card.title.replace(/HK.*\(|\)/g, '')} {/* Clean text display */}
            </p>
             <p className="text-xs text-text-muted mt-2 font-medium">
              {card.desc}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}