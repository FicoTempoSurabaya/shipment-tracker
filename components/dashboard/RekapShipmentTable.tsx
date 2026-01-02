'use client'

import { useState, useEffect } from 'react'
import { Calendar, Download, Printer, Filter, ChevronDown, ChevronUp } from 'lucide-react'
import { getDefaultDateRange } from '@/lib/utils'

interface Column {
  id: string
  label: string
  type: 'index' | 'date' | 'day' | 'count' | 'user' | 'freelance'
  userId?: string
  freelanceName?: string
  role?: string
  rowspan?: number
}

interface RekapData {
  columns: Column[]
  data: Array<{
    no: number
    tanggal: string
    hari: string
    jumlah: number
    isSunday: boolean
    [key: string]: any
  }>
  totalRow: {
    no: string
    tanggal: string
    hari: string
    jumlah: number
    [key: string]: any
  }
  summary: {
    dateRange: {
      startDate: string
      endDate: string
    }
    totalUsers: number
    totalFreelances: number
    totalDays: number
    workingDays: number
  }
}

interface RekapShipmentTableProps {
  data?: RekapData
}

export default function RekapShipmentTable({ data }: RekapShipmentTableProps) {
  const [rekapData, setRekapData] = useState<RekapData | null>(data || null)
  const [loading, setLoading] = useState(!data)
  const [dateRange, setDateRange] = useState(getDefaultDateRange())
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set())

  useEffect(() => {
    if (!data) {
      fetchRekapData()
    }
  }, [])

  const fetchRekapData = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        startDate: dateRange.startDate.toISOString().split('T')[0],
        endDate: dateRange.endDate.toISOString().split('T')[0]
      })
      
      const response = await fetch(`/api/shipment/rekap?${params}`)
      const result = await response.json()
      
      if (response.ok) {
        setRekapData(result)
      }
    } catch (error) {
      console.error('Error fetching rekap data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDateChange = (startDate: Date, endDate: Date) => {
    setDateRange({ startDate, endDate })
    // Fetch data akan dipanggil oleh useEffect
  }

  useEffect(() => {
    if (dateRange) {
      fetchRekapData()
    }
  }, [dateRange])

  const toggleRow = (index: number) => {
    const newExpandedRows = new Set(expandedRows)
    if (newExpandedRows.has(index)) {
      newExpandedRows.delete(index)
    } else {
      newExpandedRows.add(index)
    }
    setExpandedRows(newExpandedRows)
  }

  const handleExportCSV = () => {
    if (!rekapData) return
    
    const headers = [
      'No.',
      'Tanggal',
      'Hari',
      'Jumlah',
      ...rekapData.columns
        .filter(col => col.type === 'user' || col.type === 'freelance')
        .map(col => col.label)
    ]
    
    const rows = rekapData.data.map(row => {
      return [
        row.no,
        new Date(row.tanggal).toLocaleDateString('id-ID'),
        row.hari,
        row.jumlah,
        ...rekapData.columns
          .filter(col => col.type === 'user' || col.type === 'freelance')
          .map(col => row[col.id] || '-')
      ]
    })
    
    // Add total row
    rows.push([
      'TOTAL HK',
      '',
      '',
      rekapData.totalRow.jumlah,
      ...rekapData.columns
        .filter(col => col.type === 'user' || col.type === 'freelance')
        .map(col => rekapData.totalRow[col.id] || '0')
    ])
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n')
    
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `rekap-shipment-${dateRange.startDate.toISOString().split('T')[0]}-${dateRange.endDate.toISOString().split('T')[0]}.csv`
    link.click()
  }

  const handlePrint = () => {
    window.print()
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-accent-primary"></div>
        <p className="mt-2 text-text-secondary">Menyiapkan rekap shipment...</p>
      </div>
    )
  }

  if (!rekapData) {
    return (
      <div className="text-center py-12">
        <p className="text-text-secondary">Tidak ada data rekap shipment</p>
      </div>
    )
  }

  // PERBAIKAN BAGIAN EXPANDED ROWS
  const renderExpandedRow = (rowIndex: number) => {
    const row = rekapData.data[rowIndex]
    
    return (
      <tr key={`expanded-${rowIndex}`} className="bg-azure-bg/30">
        <td colSpan={4} className="border border-azure-shadow-dark px-4 py-2 text-sm text-text-secondary">
          Detail Shipment:
        </td>
        {rekapData.columns
          .filter(col => col.type === 'user' || col.type === 'freelance')
          .map((column) => {
            const cellValue = row[column.id]
            const shipments = cellValue && cellValue !== '-' 
              ? cellValue.split(',').map((s: string) => s.trim())
              : []
            
            return (
              <td
                key={`detail-${rowIndex}-${column.id}`}
                className="border border-azure-shadow-dark px-4 py-2 text-sm"
              >
                {shipments.length > 1 ? (
                  <div className="space-y-1">
                    {shipments.map((shipment: string, idx: number) => (
                      <div key={idx} className="text-left">
                        • {shipment}
                      </div>
                    ))}
                  </div>
                ) : (
                  <span className="text-text-secondary">-</span>
                )}
              </td>
            )
          })}
      </tr>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">REKAP SHIPMENT</h1>
          <p className="text-text-secondary">
            Periode: {new Date(rekapData.summary.dateRange.startDate).toLocaleDateString('id-ID')} 
            {' '}sampai dengan{' '}
            {new Date(rekapData.summary.dateRange.endDate).toLocaleDateString('id-ID')}
          </p>
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center px-4 py-2 border border-azure-shadow-dark text-text-primary rounded-lg hover:bg-azure-bg"
          >
            <Download size={20} className="mr-2" />
            Export CSV
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center px-4 py-2 bg-accent-primary text-white rounded-lg hover:bg-blue-600"
          >
            <Printer size={20} className="mr-2" />
            Cetak
          </button>
        </div>
      </div>

      {/* Date Filter */}
      <div className="neumorphic p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <Calendar className="mr-2 text-text-secondary" size={20} />
              <span className="text-text-primary font-medium">Filter Periode:</span>
            </div>
            <div className="flex space-x-2">
              <input
                type="date"
                value={dateRange.startDate.toISOString().split('T')[0]}
                onChange={(e) => handleDateChange(new Date(e.target.value), dateRange.endDate)}
                className="px-3 py-1 border border-azure-shadow-dark rounded-lg"
              />
              <span className="text-text-secondary">s/d</span>
              <input
                type="date"
                value={dateRange.endDate.toISOString().split('T')[0]}
                onChange={(e) => handleDateChange(dateRange.startDate, new Date(e.target.value))}
                className="px-3 py-1 border border-azure-shadow-dark rounded-lg"
              />
            </div>
          </div>
          
          <div className="text-sm text-text-secondary">
            {rekapData.summary.totalDays} hari ({rekapData.summary.workingDays} hari kerja) • 
            {' '}{rekapData.summary.totalUsers} driver • 
            {' '}{rekapData.summary.totalFreelances} freelance
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto border border-azure-shadow-dark rounded-lg">
        <table className="w-full border-collapse">
          <thead className="bg-azure-bg">
            {/* Row 1: Main Headers */}
            <tr>
              {rekapData.columns.map((column) => (
                <th
                  key={`header-1-${column.id}`}
                  rowSpan={column.rowspan || 3}
                  className="border border-azure-shadow-dark px-4 py-3 text-left font-semibold text-text-primary"
                  style={{
                    position: 'sticky',
                    top: 0,
                    zIndex: 10,
                    backgroundColor: 'var(--azure-bg)'
                  }}
                >
                  {column.label}
                </th>
              ))}
            </tr>
            
            {/* Row 2: Nama Header */}
            <tr>
              {rekapData.columns
                .filter(col => col.type === 'user' || col.type === 'freelance')
                .map((column) => (
                  <th
                    key={`header-2-${column.id}`}
                    colSpan={1}
                    className="border border-azure-shadow-dark px-4 py-2 text-center font-medium text-text-primary"
                    style={{
                      position: 'sticky',
                      top: '48px',
                      zIndex: 9,
                      backgroundColor: 'var(--azure-bg)'
                    }}
                  >
                    {column.label}
                  </th>
                ))}
            </tr>
            
            {/* Row 3: Role Header */}
            <tr>
              {rekapData.columns
                .filter(col => col.type === 'user' || col.type === 'freelance')
                .map((column) => (
                  <th
                    key={`header-3-${column.id}`}
                    colSpan={1}
                    className="border border-azure-shadow-dark px-4 py-2 text-center text-sm text-text-secondary"
                    style={{
                      position: 'sticky',
                      top: '80px',
                      zIndex: 8,
                      backgroundColor: 'var(--azure-bg)'
                    }}
                  >
                    {column.type === 'user' ? column.role : 'freelance'}
                  </th>
                ))}
            </tr>
          </thead>
          
          <tbody>
            {rekapData.data.map((row, rowIndex) => (
              <>
                <tr
                  key={`row-${rowIndex}`}
                  className={`hover:bg-azure-bg/50 ${row.isSunday ? 'bg-red-50' : ''}`}
                >
                  {/* Fixed Columns */}
                  <td className="border border-azure-shadow-dark px-4 py-2 text-center font-medium">
                    {row.no}
                  </td>
                  <td className="border border-azure-shadow-dark px-4 py-2">
                    {new Date(row.tanggal).toLocaleDateString('id-ID')}
                  </td>
                  <td className="border border-azure-shadow-dark px-4 py-2">
                    {row.hari}
                  </td>
                  <td className="border border-azure-shadow-dark px-4 py-2 text-center font-medium">
                    {row.jumlah}
                  </td>
                  
                  {/* Dynamic Columns */}
                  {rekapData.columns
                    .filter(col => col.type === 'user' || col.type === 'freelance')
                    .map((column) => {
                      const cellValue = row[column.id]
                      const hasMultiple = cellValue && cellValue !== '-' && cellValue.includes(',')
                      
                      return (
                        <td
                          key={`cell-${rowIndex}-${column.id}`}
                          className={`border border-azure-shadow-dark px-4 py-2 text-center ${
                            row.isSunday ? 'text-red-600 font-medium' : ''
                          }`}
                        >
                          {hasMultiple ? (
                            <div className="flex items-center justify-between">
                              <span className="truncate">
                                {cellValue.split(',')[0].trim()}
                                {cellValue.split(',').length > 1 && '...'}
                              </span>
                              <button
                                onClick={() => toggleRow(rowIndex)}
                                className="ml-1 text-text-secondary hover:text-text-primary"
                              >
                                {expandedRows.has(rowIndex) ? (
                                  <ChevronUp size={16} />
                                ) : (
                                  <ChevronDown size={16} />
                                )}
                              </button>
                            </div>
                          ) : (
                            cellValue
                          )}
                        </td>
                      )
                    })}
                </tr>
                
                {/* Expanded Row for Multiple Shipments */}
                {expandedRows.has(rowIndex) && renderExpandedRow(rowIndex)}
              </>
            ))}
            
            {/* Total Row */}
            <tr className="bg-accent-primary/10 font-semibold">
              <td className="border border-azure-shadow-dark px-4 py-3">
                {rekapData.totalRow.no}
              </td>
              <td className="border border-azure-shadow-dark px-4 py-3">
                {rekapData.totalRow.tanggal}
              </td>
              <td className="border border-azure-shadow-dark px-4 py-3">
                {rekapData.totalRow.hari}
              </td>
              <td className="border border-azure-shadow-dark px-4 py-3 text-center">
                {rekapData.totalRow.jumlah}
              </td>
              
              {rekapData.columns
                .filter(col => col.type === 'user' || col.type === 'freelance')
                .map((column) => (
                  <td
                    key={`total-${column.id}`}
                    className="border border-azure-shadow-dark px-4 py-3 text-center font-bold"
                  >
                    {rekapData.totalRow[column.id] || '0'}
                  </td>
                ))}
            </tr>
          </tbody>
        </table>
      </div>

      {/* Table Legend */}
      <div className="flex flex-wrap gap-4 text-sm text-text-secondary">
        <div className="flex items-center">
          <div className="w-4 h-4 bg-red-50 border border-red-200 mr-2"></div>
          <span>Hari Minggu</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-accent-primary/10 mr-2"></div>
          <span>Baris Total</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-azure-bg mr-2"></div>
          <span>Header (Sticky)</span>
        </div>
      </div>
    </div>
  )
}