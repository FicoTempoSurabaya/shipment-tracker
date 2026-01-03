'use client'

import { useState } from 'react'
import { Calendar, Filter, ArrowRight } from 'lucide-react'
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

  // Style input Neumorphic (Pressed)
  const inputClass = "w-full bg-azure-surface rounded-xl pl-10 pr-4 py-2.5 text-sm text-text-primary font-medium outline-none shadow-neu-pressed focus:shadow-neu-pressed-sm transition-all duration-300 border-2 border-transparent focus:border-white/50"

  return (
    <div className="p-4 w-full">
      <div className="flex flex-col sm:flex-row items-end gap-4">
        
        {/* Start Date */}
        <div className="w-full sm:w-auto">
          <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-1.5 ml-1 block">
            Dari Tanggal
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted" size={16} />
            <input
              type="date"
              value={startDate.toISOString().split('T')[0]}
              onChange={(e) => setStartDate(new Date(e.target.value))}
              className={inputClass}
            />
          </div>
        </div>

        {/* Separator Arrow (Visual Only) */}
        <div className="hidden sm:flex pb-3 text-text-muted">
           <ArrowRight size={16} />
        </div>

        {/* End Date */}
        <div className="w-full sm:w-auto">
          <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-1.5 ml-1 block">
            Sampai Tanggal
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted" size={16} />
            <input
              type="date"
              value={endDate.toISOString().split('T')[0]}
              onChange={(e) => setEndDate(new Date(e.target.value))}
              className={inputClass}
            />
          </div>
        </div>
        
        {/* Filter Button */}
        <button
          onClick={handleApply}
          className="w-full sm:w-auto px-6 py-2.5 bg-azure-surface text-accent-primary font-bold rounded-xl shadow-neu-flat hover:shadow-neu-pressed hover:scale-95 transition-all duration-300 flex items-center justify-center gap-2 text-sm border border-white/40"
        >
          <Filter size={16} />
          <span>Terapkan</span>
        </button>
      </div>
    </div>
  )
}