'use client'

import { useState } from 'react'
import { Calendar, Filter } from 'lucide-react'
import { getDefaultDateRange } from '@/lib/utils'

interface DateRangeFilterProps {
  onDateChange: (startDate: Date, endDate: Date) => void
  initialStartDate?: Date
  initialEndDate?: Date
}

export default function DateRangeFilter({ 
  onDateChange, 
  initialStartDate, 
  initialEndDate 
}: DateRangeFilterProps) {
  const defaultRange = getDefaultDateRange()
  
  const [startDate, setStartDate] = useState<Date>(
    initialStartDate || defaultRange.startDate
  )
  const [endDate, setEndDate] = useState<Date>(
    initialEndDate || defaultRange.endDate
  )

  const handleApply = () => {
    onDateChange(startDate, endDate)
  }

  const handleReset = () => {
    const defaultRange = getDefaultDateRange()
    setStartDate(defaultRange.startDate)
    setEndDate(defaultRange.endDate)
    onDateChange(defaultRange.startDate, defaultRange.endDate)
  }

  return (
    <div className="neumorphic p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Filter size={20} className="text-text-secondary" />
          <h3 className="font-semibold text-text-primary">Filter Periode</h3>
        </div>
        <button
          onClick={handleReset}
          className="text-sm text-accent-secondary hover:text-cyan-600"
        >
          Reset ke Default
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            Tanggal Mulai
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary" size={18} />
            <input
              type="date"
              value={startDate.toISOString().split('T')[0]}
              onChange={(e) => setStartDate(new Date(e.target.value))}
              className="w-full pl-10 pr-4 py-2 border border-azure-shadow-dark rounded-lg focus:outline-none focus:border-accent-primary"
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            Tanggal Selesai
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary" size={18} />
            <input
              type="date"
              value={endDate.toISOString().split('T')[0]}
              onChange={(e) => setEndDate(new Date(e.target.value))}
              className="w-full pl-10 pr-4 py-2 border border-azure-shadow-dark rounded-lg focus:outline-none focus:border-accent-primary"
            />
          </div>
        </div>
        
        <div className="flex items-end">
          <button
            onClick={handleApply}
            className="w-full py-2 px-4 bg-accent-primary text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Terapkan Filter
          </button>
        </div>
      </div>
      
      <div className="mt-4 text-sm text-text-secondary">
        <p>
          Periode default: {defaultRange.startDate.toLocaleDateString('id-ID')} -{' '}
          {defaultRange.endDate.toLocaleDateString('id-ID')}
        </p>
        <p className="text-xs mt-1">
          Aturan cut-off 16-15: Jika hari ini {'<'} 16, periode = 16 bulan sebelumnya sampai 15 bulan ini.
          Jika hari ini {'>'} 15, periode = 16 bulan ini sampai 15 bulan depan.
        </p>
      </div>
    </div>
  )
}