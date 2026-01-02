'use client'

import { Package, PackageCheck, PackageX } from 'lucide-react'

interface DashboardCardsProps {
  hk: number
  hke: number
  hkne: number
}

export default function DashboardCards({ hk, hke, hkne }: DashboardCardsProps) {
  const cards = [
    {
      title: 'HK',
      value: hk,
      icon: Package,
      color: 'bg-blue-100 text-blue-600',
    },
    {
      title: 'HKE',
      value: hke,
      icon: PackageCheck,
      color: 'bg-green-100 text-green-600',
    },
    {
      title: 'HKNE',
      value: hkne,
      icon: PackageX,
      color: 'bg-red-100 text-red-600',
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      {cards.map((card) => (
        <div key={card.title} className="neumorphic p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-secondary text-sm">{card.title}</p>
              <p className="text-3xl font-bold mt-2">{card.value.toLocaleString()}</p>
            </div>
            <div className={`p-3 rounded-full ${card.color}`}>
              <card.icon size={24} />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}