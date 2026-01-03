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
import { Plus, Filter } from 'lucide-react'
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
  // --- STATE MANAGEMENT ---
  const [data, setData] = useState<DashboardData>({
    shipments: [],
    totals: { total_hk: 0, total_hke: 0, total_hkne: 0 },
    chartData: [],
    performanceData: []
  })
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState(getDefaultDateRange())
  
  // Modal States
  const [showInputModal, setShowInputModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [showFreelanceCostModal, setShowFreelanceCostModal] = useState(false)
  
  // Selection States
  const [selectedShipment, setSelectedShipment] = useState<any>(null)
  const [selectedFreelance, setSelectedFreelance] = useState({ shipmentId: 0, name: '' })

  // --- EFFECTS ---
  useEffect(() => {
    fetchShipments()
  }, [dateRange])

  // --- DATA FETCHING (ORIGINAL LOGIC RESTORED) ---
  const fetchShipments = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        startDate: dateRange.startDate.toISOString().split('T')[0],
        endDate: dateRange.endDate.toISOString().split('T')[0]
      })
      
      // Menggunakan endpoint yang benar sesuai kode Anda
      const response = await fetch(`/api/shipment?${params}`)
      const result = await response.json()
      
      if (response.ok) {
        setData(result)
      } else {
        console.error('API Error:', result)
      }
    } catch (error) {
      console.error('Error fetching shipments:', error)
    } finally {
      setLoading(false)
    }
  }

  // --- HANDLERS ---
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

  // Logic khusus Freelance (menggunakan submit_id sesuai database Anda)
  const handleFreelanceCostClick = (shipment: any) => {
    if (shipment.nama_freelance) {
      setSelectedFreelance({
        shipmentId: shipment.submit_id, // FIX: Menggunakan submit_id
        name: shipment.nama_freelance
      })
      setShowFreelanceCostModal(true)
    }
  }

  const handleDeleteConfirm = async () => {
    if (!selectedShipment) return

    try {
      // FIX: Menggunakan submit_id untuk delete endpoint
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

  // --- RENDER UI (NEUMORPHISM STYLE) ---
  return (
    <div className="space-y-8 pb-10">
      
      {/* HEADER SECTION - Neumorphic Layout */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="animate-fade-up">
          <h1 className="text-3xl font-black text-text-primary tracking-tight">Dashboard Admin</h1>
          <p className="text-text-secondary mt-1 font-medium">
             Periode: {dateRange.startDate.toLocaleDateString('id-ID')} - {dateRange.endDate.toLocaleDateString('id-ID')}
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 animate-fade-up delay-100">
          <div className="bg-azure-surface p-1 rounded-2xl shadow-neu-flat border border-white/40">
             <DateRangeFilter
                onDateChange={handleDateChange}
                initialStartDate={dateRange.startDate}
                initialEndDate={dateRange.endDate}
             />
          </div>

          <button
            onClick={() => setShowInputModal(true)}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-accent-primary to-blue-600 text-white font-bold shadow-neu-flat hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
          >
            <Plus size={20} />
            <span>Input Shipment</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
           {[1,2,3].map(i => (
             <div key={i} className="h-40 bg-azure-surface rounded-3xl shadow-neu-flat opacity-50"></div>
           ))}
        </div>
      ) : (
        <>
          {/* CARDS SECTION - Only HK, HKE, HKNE */}
          <DashboardCards
            hk={data.totals.total_hk}
            hke={data.totals.total_hke}
            hkne={data.totals.total_hkne}
          />

{/* CHARTS SECTION - Horizontal Scroll on Mobile */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
            <div className="bg-azure-surface p-5 md:p-6 rounded-3xl shadow-neu-flat border border-white/40 overflow-hidden">
              <h3 className="text-base md:text-lg font-bold text-text-primary mb-6 flex items-center gap-2">
                <Filter size={18} className="text-accent-primary" />
                Tren Shipment Harian
              </h3>
              <div className="h-[350px]">
                <AreaLineDotChart data={data.chartData} />
              </div>
            </div>
            
            <div className="bg-azure-surface p-6 rounded-3xl shadow-neu-flat border border-white/40">
              <h3 className="text-lg font-bold text-text-primary mb-6">
                Performa Top 10 Driver
              </h3>
              <div className="h-[350px]">
                 <HorizontalStackedBarChart data={data.performanceData} />
              </div>
            </div>
          </div>

          {/* TABLE SECTION */}
          <div className="bg-azure-surface p-6 sm:p-8 rounded-3xl shadow-neu-flat border border-white/40 overflow-hidden">
             <div className="mb-6">
                <h3 className="text-xl font-bold text-text-primary">Data Shipment</h3>
                <p className="text-sm text-text-secondary">Daftar pengiriman periode terpilih.</p>
             </div>
             <ShipmentTable 
                data={data.shipments} 
                isAdmin={true}
                onEdit={handleEditClick}
                onDelete={handleDeleteClick}
                onFreelanceCost={handleFreelanceCostClick}
              />
          </div>
        </>
      )}

      {/* MODALS - Tetap menggunakan prop logic Anda */}
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
        message={`Apakah Anda yakin ingin menghapus shipment ID ${selectedShipment?.submit_id}?`}
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