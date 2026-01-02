'use client'

import { useState } from 'react'
import RekapShipmentTable from '@/components/dashboard/RekapShipmentTable'
import DateRangeFilter from '@/components/dashboard/DateRangeFilter'
import { getDefaultDateRange } from '@/lib/utils'

export default function RekapShipmentPage() {
  const [dateRange, setDateRange] = useState(getDefaultDateRange())

  const handleDateChange = (startDate: Date, endDate: Date) => {
    setDateRange({ startDate, endDate })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Rekap Shipment</h1>
          <p className="text-text-secondary">Laporan komprehensif performa shipment</p>
        </div>
      </div>

      {/* Date Filter */}
      <DateRangeFilter
        onDateChange={handleDateChange}
        initialStartDate={dateRange.startDate}
        initialEndDate={dateRange.endDate}
      />

      {/* Rekap Table */}
      <RekapShipmentTable />
    </div>
  )
}