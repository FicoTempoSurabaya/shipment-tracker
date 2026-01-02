'use client'

import { useState, useEffect } from 'react'
import DashboardCards from '@/components/dashboard/DashboardCards'
import DateRangeFilter from '@/components/dashboard/DateRangeFilter'
import ShipmentTable from '@/components/dashboard/ShipmentTable'
import AreaLineDotChart from '@/components/charts/AreaLineDotChart'
import HorizontalStackedBarChart from '@/components/charts/HorizontalStackedBarChart'
import AdminInputShipmentModal from '@/components/modals/AdminInputShipmentModal'
import EditShipmentModal from '@/components/modals/EditShipmentModal'
import ConfirmationModal from '@/components/modals/ConfirmationModal'
import SuccessModal from '@/components/modals/SuccessModal'
import FreelanceCostModal from '@/components/modals/FreelanceCostModal'
import { Plus } from 'lucide-react'
import { getDefaultDateRange } from '@/lib/utils'

interface DashboardData {
  shipments: any[]
  totals: {
    total_hk: number
    total_hke: number
    total_hkne: number
  }
  chartData: Array<{
    date: string
    hk: number
    hke: number
    hkne: number
  }>
  performanceData: Array<{
    name: string
    total: number
    success: number
    failed: number
  }>
}

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData>({
    shipments: [],
    totals: { total_hk: 0, total_hke: 0, total_hkne: 0 },
    chartData: [],
    performanceData: []
  })
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState(getDefaultDateRange())
  
  // Modal states
  const [showInputModal, setShowInputModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [showFreelanceCostModal, setShowFreelanceCostModal] = useState(false)
  
  const [selectedShipment, setSelectedShipment] = useState<any>(null)
  const [selectedFreelance, setSelectedFreelance] = useState({ shipmentId: 0, name: '' })

  useEffect(() => {
    fetchShipments()
  }, [dateRange])

  const fetchShipments = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        startDate: dateRange.startDate.toISOString().split('T')[0],
        endDate: dateRange.endDate.toISOString().split('T')[0]
      })
      
      const response = await fetch(`/api/shipment?${params}`)
      const result = await response.json()
      
      if (response.ok) {
        setData(result)
      }
    } catch (error) {
      console.error('Error fetching shipments:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDateChange = (startDate: Date, endDate: Date) => {
    setDateRange({ startDate, endDate })
  }

  const handleEditClick = (shipment: any) => {
    setSelectedShipment(shipment)
    setShowEditModal(true)
  }

  const handleDeleteClick = (shipment: any) => {
    setSelectedShipment(shipment)
    setShowDeleteModal(true)
  }

  const handleFreelanceCostClick = (shipment: any) => {
    if (shipment.nama_freelance) {
      setSelectedFreelance({
        shipmentId: shipment.submit_id,
        name: shipment.nama_freelance
      })
      setShowFreelanceCostModal(true)
    }
  }

  const handleDeleteConfirm = async () => {
    if (!selectedShipment) return

    try {
      const response = await fetch(`/api/shipment/${selectedShipment.submit_id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setShowDeleteModal(false)
        setShowSuccessModal(true)
        fetchShipments()
      } else {
        alert('Gagal menghapus data')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Terjadi kesalahan')
    }
  }

  const handleShipmentUpdate = () => {
    fetchShipments()
    setShowSuccessModal(true)
  }

  const handleFreelanceCostSuccess = () => {
    fetchShipments()
    setShowSuccessModal(true)
  }

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Dashboard Admin</h1>
          <p className="text-text-secondary">
            Periode: {dateRange.startDate.toLocaleDateString('id-ID')} -{' '}
            {dateRange.endDate.toLocaleDateString('id-ID')}
          </p>
        </div>
        <button
          onClick={() => setShowInputModal(true)}
          className="flex items-center px-4 py-2 bg-accent-primary text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          <Plus size={20} className="mr-2" />
          Input Shipment
        </button>
      </div>

      {/* Date Range Filter */}
      <DateRangeFilter
        onDateChange={handleDateChange}
        initialStartDate={dateRange.startDate}
        initialEndDate={dateRange.endDate}
      />

      {/* Loading State */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-accent-primary"></div>
          <p className="mt-2 text-text-secondary">Memuat data...</p>
        </div>
      ) : (
        <>
          {/* Cards */}
          <DashboardCards
            hk={data.totals.total_hk}
            hke={data.totals.total_hke}
            hkne={data.totals.total_hkne}
          />

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="neumorphic p-6">
              <h3 className="text-lg font-semibold text-text-primary mb-4">
                Trend Shipment Harian
              </h3>
              <AreaLineDotChart data={data.chartData} />
            </div>
            <div className="neumorphic p-6">
              <h3 className="text-lg font-semibold text-text-primary mb-4">
                Performa Top 10 Driver
              </h3>
              <HorizontalStackedBarChart data={data.performanceData} />
            </div>
          </div>

          {/* Shipment Table */}
          <ShipmentTable 
            data={data.shipments} 
            isAdmin={true}
            onEdit={handleEditClick}
            onDelete={handleDeleteClick}
            onFreelanceCost={handleFreelanceCostClick}
          />
        </>
      )}

      {/* Modals */}
      <AdminInputShipmentModal
        isOpen={showInputModal}
        onClose={() => setShowInputModal(false)}
        onSuccess={handleShipmentUpdate}
      />

      <EditShipmentModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSuccess={handleShipmentUpdate}
        shipment={selectedShipment}
      />

      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteConfirm}
        title="Hapus Shipment"
        message={`Apakah Anda yakin ingin menghapus shipment ID ${selectedShipment?.shipment_id}?`}
      />

      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="Berhasil!"
        message="Operasi berhasil disimpan."
      />

      <FreelanceCostModal
        isOpen={showFreelanceCostModal}
        onClose={() => setShowFreelanceCostModal(false)}
        onSuccess={handleFreelanceCostSuccess}
        shipmentId={selectedFreelance.shipmentId}
        freelanceName={selectedFreelance.name}
      />
    </div>
  )
}