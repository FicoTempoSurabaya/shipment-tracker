'use client'

import { Users, Package, DollarSign, TrendingUp, ArrowUpRight, ArrowDownRight } from 'lucide-react'

interface SummaryCardsProps {
  totalDrivers: number
  totalShipments: number
  totalRevenue: number
  growthRate: number
}

export default function SummaryCards({
  totalDrivers = 0,
  totalShipments = 0,
  totalRevenue = 0,
  growthRate = 0
}: SummaryCardsProps) {
  
  const cards = [
    {
      title: 'Total Driver',
      value: totalDrivers,
      icon: Users,
      iconColor: 'text-blue-600',
      change: '+2 User',
      isPositive: true
    },
    {
      title: 'Total Shipment',
      value: totalShipments.toLocaleString('id-ID'),
      icon: Package,
      iconColor: 'text-purple-600',
      change: `${growthRate > 0 ? '+' : ''}${growthRate}%`,
      isPositive: growthRate >= 0
    },
    {
      title: 'Pendapatan',
      value: `Rp ${totalRevenue.toLocaleString('id-ID')}`,
      icon: DollarSign,
      iconColor: 'text-emerald-600',
      change: '+15% Target',
      isPositive: true
    },
    {
      title: 'Trend Performa',
      value: `${growthRate > 0 ? '+' : ''}${growthRate}%`,
      icon: TrendingUp,
      iconColor: growthRate >= 0 ? 'text-accent-primary' : 'text-error-text',
      change: growthRate >= 0 ? 'Meningkat' : 'Menurun',
      isPositive: growthRate >= 0
    }
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
      {cards.map((card, idx) => (
        <div 
          key={card.title} 
          className="bg-azure-surface p-6 rounded-3xl shadow-neu-flat border border-white/40 hover:shadow-lg transition-all duration-300"
        >
          <div className="flex items-start justify-between mb-4">
            <div className={`
              p-3 rounded-xl shadow-neu-sm bg-azure-surface
              ${card.iconColor}
            `}>
              <card.icon size={22} />
            </div>
            
            <div className={`
              flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg
              ${card.isPositive 
                ? 'bg-green-100 text-green-700' 
                : 'bg-red-100 text-red-700'}
            `}>
              {card.isPositive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
              {card.change}
            </div>
          </div>
          
          <div>
            <p className="text-text-secondary text-xs font-bold uppercase tracking-wider mb-1">
              {card.title}
            </p>
            <h4 className="text-xl font-bold text-text-primary truncate">
              {card.value}
            </h4>
          </div>
        </div>
      ))}
    </div>
  )
}