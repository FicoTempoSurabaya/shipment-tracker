'use client'

import { Users, Package, DollarSign, TrendingUp } from 'lucide-react'

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
      color: 'bg-blue-100 text-blue-600',
      change: '+2 dari bulan lalu',
      positive: true
    },
    {
      title: 'Total Shipment',
      value: totalShipments.toLocaleString('id-ID'),
      icon: Package,
      color: 'bg-purple-100 text-purple-600',
      change: `${growthRate > 0 ? '+' : ''}${growthRate}%`,
      positive: growthRate >= 0
    },
    {
      title: 'Pendapatan',
      value: `Rp ${totalRevenue.toLocaleString('id-ID')}`,
      icon: DollarSign,
      color: 'bg-green-100 text-green-600',
      change: '+15% dari target',
      positive: true
    },
    {
      title: 'Trend',
      value: `${growthRate > 0 ? '+' : ''}${growthRate}%`,
      icon: TrendingUp,
      color: growthRate >= 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600',
      change: growthRate >= 0 ? 'Meningkat' : 'Menurun',
      positive: growthRate >= 0
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      {cards.map((card) => (
        <div key={card.title} className="neumorphic p-6">
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-full ${card.color}`}>
              <card.icon size={24} />
            </div>
            <span className={`text-sm font-medium ${
              card.positive ? 'text-green-600' : 'text-red-600'
            }`}>
              {card.change}
            </span>
          </div>
          
          <div>
            <p className="text-text-secondary text-sm mb-1">{card.title}</p>
            <p className="text-2xl font-bold text-text-primary">{card.value}</p>
          </div>
          
          <div className="mt-4 pt-3 border-t border-azure-shadow-dark/30">
            <div className="flex items-center text-sm text-text-secondary">
              <span>Bulan ini</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}