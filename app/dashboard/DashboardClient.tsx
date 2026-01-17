'use client'

import { useState, useMemo, useCallback } from 'react';
import Sidebar from '@/components/Sidebar';
import { 
  Search, Plus, Calendar, RotateCcw, Edit2, CircleChevronRight, 
  Trash2, DollarSign, ChevronLeft, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, Legend, Brush
} from 'recharts';

// Import Modals
import AdminInputShipmentModal from '@/components/modals/AdminInputShipmentModal';
import RegularInputShipmentModal from '@/components/modals/RegularInputShipmentModal';
import AdminEditShipmentModal from '@/components/modals/AdminEditShipmentModal';
import RegularEditShipmentModal from '@/components/modals/RegularEditShipmentModal';
import FreelanceCostModal from '@/components/modals/FreelanceCostModal';
import SystemModal from '@/components/modals/SystemModals';

import { DriverOption, ShipmentData } from '@/types';
import { deleteShipment } from './actions';

interface DashboardProps {
  user: { user_id: string; nama_lengkap: string; user_role_as: 'admin' | 'regular' };
  allData: ShipmentData[];
  drivers: DriverOption[];
  initialPeriod: { start: string; end: string };
}

interface DailyAcc {
  [key: string]: { name: string; terkirim: number; gagal: number };
}

export default function DashboardClient({ user, allData = [], drivers, initialPeriod }: DashboardProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<'adminInput' | 'regInput' | 'adminEdit' | 'regEdit' | 'cost' | 'sysSuccess' | 'sysError' | 'sysConfirm' | null>(null);
  const [modalMessage, setModalMessage] = useState({ title: '', message: '' });
  
  const [editData, setEditData] = useState<ShipmentData | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);
  const [dateStart, setDateStart] = useState(initialPeriod.start);
  const [dateEnd, setDateEnd] = useState(initialPeriod.end);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  const [sortConfig, setSortConfig] = useState<{ key: keyof ShipmentData | 'driver_name'; direction: 'asc' | 'desc' } | null>(null);

  // --- Chart Legend Filter State ---
  const [visibleTerkirim, setVisibleTerkirim] = useState(true);
  const [visibleGagal, setVisibleGagal] = useState(true);

  const handleReset = useCallback(() => {
    setDateStart(initialPeriod.start);
    setDateEnd(initialPeriod.end);
    setSearchQuery('');
    setSortConfig(null);
    setCurrentPage(1);
  }, [initialPeriod]);

  const requestSort = (key: keyof ShipmentData | 'driver_name') => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key: string) => {
    if (!sortConfig || sortConfig.key !== key) return <ArrowUpDown size={12} className="ml-1 opacity-30" />;
    return sortConfig.direction === 'asc' ? <ArrowUp size={12} className="ml-1 text-indigo-600" /> : <ArrowDown size={12} className="ml-1 text-indigo-600" />;
  };

  const filteredAndSortedData = useMemo(() => {
    let result = Array.isArray(allData) ? [...allData] : [];
    if (user.user_role_as === 'regular') {
      result = result.filter(item => String(item.user_id) === String(user.user_id));
    }
    result = result.filter(item => {
      const itemDate = new Date(item.tanggal).toLocaleDateString('en-CA');
      const matchesDate = itemDate >= dateStart && itemDate <= dateEnd;
      const sLower = searchQuery.toLowerCase();
      return matchesDate && (
        item.shipment_id?.toString().includes(sLower) ||
        (item.driver_name || '').toLowerCase().includes(sLower) ||
        (item.nama_freelance || '').toLowerCase().includes(sLower)
      );
    });
    if (sortConfig !== null) {
      result.sort((a, b) => {
        const aVal = (a[sortConfig.key] ?? '').toString().toLowerCase();
        const bVal = (b[sortConfig.key] ?? '').toString().toLowerCase();
        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return result;
  }, [allData, dateStart, dateEnd, searchQuery, user, sortConfig]);

  const stats = useMemo(() => {
    const hke = filteredAndSortedData.filter(item => !item.nama_freelance).length;
    const hkne = filteredAndSortedData.filter(item => item.nama_freelance).length;
    return { hk: hke + hkne, hke, hkne };
  }, [filteredAndSortedData]);

  const { chartData, percentage } = useMemo(() => {
    const daily = filteredAndSortedData.reduce((acc: DailyAcc, curr) => {
      const d = new Date(curr.tanggal).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
      if (!acc[d]) acc[d] = { name: d, terkirim: 0, gagal: 0 };
      acc[d].terkirim += curr.terkirim;
      acc[d].gagal += curr.gagal;
      return acc;
    }, {});
    const totalT = filteredAndSortedData.reduce((s, c) => s + c.terkirim, 0);
    const totalG = filteredAndSortedData.reduce((s, c) => s + c.gagal, 0);
    const totalAll = totalT + totalG || 1;
    return {
      chartData: Object.values(daily),
      percentage: {
        terkirim: ((totalT / totalAll) * 100).toFixed(1),
        gagal: ((totalG / totalAll) * 100).toFixed(1)
      }
    };
  }, [filteredAndSortedData]);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedData.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAndSortedData, currentPage]);

  const totalPages = Math.ceil(filteredAndSortedData.length / itemsPerPage);

  const handleEditClick = (row: ShipmentData) => {
    setEditData(row);
    setActiveModal(user.user_role_as === 'admin' ? 'adminEdit' : 'regEdit');
  };

  const handleDelete = async () => {
    if (deleteTarget) {
      const res = await deleteShipment(deleteTarget);
      if (res?.success) {
        setModalMessage({ title: 'Sukses', message: 'Data Berhasil Dihapus!' });
        setActiveModal('sysSuccess');
      }
      setDeleteTarget(null);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900 overflow-x-hidden">
      <Sidebar role={user.user_role_as} isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      
      <main className={`flex-1 flex flex-col transition-all duration-500 ease-in-out ${isSidebarOpen ? 'ml-72' : 'ml-0'}`}>
        <header className="bg-white border-b border-slate-200 h-20 flex items-center justify-between px-8 sticky top-0 z-30 shadow-sm">
          <div className="flex items-center gap-4">
             <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-slate-100 rounded-xl transition-all">
                <CircleChevronRight size={25} className={`text-slate-600 transition-transform duration-500 ${isSidebarOpen ? 'rotate-180' : 'rotate-0'}`} />
             </button>
             <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Dashboard</h2>
             <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200 ml-4">
                <Calendar size={14} className="text-indigo-600 ml-2" />
                <input type="date" value={dateStart} onChange={(e) => setDateStart(e.target.value)} className="bg-transparent text-xs font-bold outline-none cursor-pointer" />
                <span className="text-slate-400">/</span>
                <input type="date" value={dateEnd} onChange={(e) => setDateEnd(e.target.value)} className="bg-transparent text-xs font-bold outline-none cursor-pointer" />
                <button onClick={handleReset} className="p-2 hover:bg-white rounded-xl text-slate-400 transition-all"><RotateCcw size={14}/></button>
             </div>
          </div>
          <div className="flex items-center gap-3">
             <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Cari..." className="pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 w-64 outline-none transition-all" />
             </div>
             <button onClick={() => setActiveModal(user.user_role_as === 'admin' ? 'adminInput' : 'regInput')} className="bg-slate-900 text-white px-6 py-2.5 rounded-2xl text-sm font-bold shadow-lg hover:scale-105 transition-all">
               <Plus size={18} /> INPUT DATA
             </button>
          </div>
        </header>

        <div className="p-8 space-y-8 overflow-y-auto">
          {/* STATS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div className="bg-white p-7 rounded-4xl border border-slate-200 border-b-4 border-b-slate-900 shadow-sm">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total HK (HKE+HKNE)</p>
              <p className="text-5xl font-black mt-2 text-slate-900">{stats.hk}</p>
            </div>
            <div className="bg-white p-7 rounded-4xl border border-slate-200 border-b-4 border-b-emerald-500 shadow-sm">
              <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Total HKE (Efektif)</p>
              <p className="text-5xl font-black mt-2 text-emerald-600">{stats.hke}</p>
            </div>
            <div className="bg-white p-7 rounded-4xl border border-slate-200 border-b-4 border-b-rose-500 shadow-sm">
              <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest">Total HKNE (Non-Efektif)</p>
              <p className="text-5xl font-black mt-2 text-rose-600">{stats.hkne}</p>
            </div>
          </div>

          {/* CHART SECTION */}
          <div className="bg-white p-8 rounded-4xl border border-slate-200 shadow-sm">
             <div className="flex justify-between items-center mb-6">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Performa Pengiriman (Periode Terpilih)</h3>
                <div className="flex gap-4 text-[10px] font-black uppercase text-slate-500">
                   <span>Terkirim: {percentage.terkirim}%</span>
                   <span>Gagal: {percentage.gagal}%</span>
                </div>
             </div>
             <div className="h-96 w-full">
               <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold'}} minTickGap={20} />
                    <YAxis hide />
                    <Tooltip contentStyle={{borderRadius: '15px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}} />
                    
                    <Legend 
                      verticalAlign="top" 
                      align="right" 
                      iconType="circle"
                      onClick={(props) => {
                        if (props.dataKey === 'terkirim') setVisibleTerkirim(!visibleTerkirim);
                        if (props.dataKey === 'gagal') setVisibleGagal(!visibleGagal);
                      }}
                      wrapperStyle={{ paddingBottom: '20px', fontSize: '10px', fontWeight: '900', textTransform: 'uppercase', cursor: 'pointer' }}
                    />

                    <Area type="monotone" dataKey="terkirim" name="terkirim" stroke="#6366f1" fill="#6366f1" fillOpacity={0.1} strokeWidth={3} hide={!visibleTerkirim} dot={{ r: 3, fill: '#6366f1', stroke: '#fff' }} />
                    <Area type="monotone" dataKey="gagal" name="gagal" stroke="#f43f5e" fill="#f43f5e" fillOpacity={0.1} strokeWidth={3} hide={!visibleGagal} dot={{ r: 3, fill: '#f43f5e', stroke: '#fff' }} />
                    
                    <Brush dataKey="name" height={30} stroke="#e2e8f0" fill="#f8fafc" travellerWidth={10} />
                  </AreaChart>
               </ResponsiveContainer>
             </div>
          </div>

          {/* TABLE SECTION */}
          <div className="bg-white rounded-[3rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col mb-10 text-center">
            <div className="p-7 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
               <h3 className="font-black text-slate-800 flex items-center gap-3 uppercase text-xs tracking-widest">Laporan Shipment</h3>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{filteredAndSortedData.length} Baris Terfilter</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead className="bg-slate-100 text-slate-900 text-[10px] font-black uppercase tracking-widest border-b-2 border-slate-200">
                  <tr>
                    <th onClick={() => requestSort('driver_name')} className="px-6 py-5 border-r border-slate-200 cursor-pointer hover:bg-slate-200">
                      NAMA DRIVER {getSortIcon('driver_name')}
                    </th>
                    {user.user_role_as === 'admin' && (
                      <th onClick={() => requestSort('nama_freelance')} className="px-6 py-5 border-r border-slate-200 cursor-pointer hover:bg-slate-200">
                        FREELANCE {getSortIcon('nama_freelance')}
                      </th>
                    )}
                    <th onClick={() => requestSort('tanggal')} className="px-6 py-5 border-r border-slate-200 cursor-pointer hover:bg-slate-200">
                      TANGGAL {getSortIcon('tanggal')}
                    </th>
                    <th onClick={() => requestSort('shipment_id')} className="px-6 py-5 border-r border-slate-200 cursor-pointer hover:bg-slate-200">
                      SHIPMENT ID {getSortIcon('shipment_id')}
                    </th>
                    <th className="px-6 py-5 border-r border-slate-200">RINCIAN</th>
                    <th className="px-6 py-5">AKSI</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-center">
                  {paginatedData.map((row) => (
                    <tr key={row.submit_id} className="hover:bg-indigo-50/40 transition-all">
                      <td className="px-6 py-5 font-bold text-slate-800 uppercase">{row.driver_name || '-'}</td>
                      {user.user_role_as === 'admin' && (
                        <td className="px-6 py-5 text-indigo-600 font-bold uppercase relative">
                          <div className="flex items-center justify-center gap-2">
                            {row.nama_freelance || '-'}
                            {row.nama_freelance && (
                              <button onClick={() => { setEditData(row); setActiveModal('cost'); }} className="p-1 bg-indigo-50 rounded text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all shadow-sm">
                                <DollarSign size={10}/>
                              </button>
                            )}
                          </div>
                        </td>
                      )}
                      <td className="px-6 py-5 text-slate-600 font-bold">{new Date(row.tanggal).toLocaleDateString('id-ID')}</td>
                      <td className="px-6 py-5 font-mono font-black text-indigo-600">{row.shipment_id}</td>
                      
                      <td className="px-6 py-2 border-r border-slate-100 min-w-50">
                        <div className="flex flex-col gap-1.5 py-1">
                          <div className="text-[10px] flex justify-between items-center px-2 bg-emerald-50 text-emerald-700 rounded py-0.5 border border-emerald-100">
                            <span className="font-bold uppercase text-[9px]">Terkirim :</span>
                            <span className="font-black">{row.terkirim}</span>
                          </div>
                          <div className="text-[10px] flex justify-between items-center px-2 bg-rose-50 text-rose-700 rounded py-0.5 border border-rose-100">
                            <span className="font-bold uppercase text-[9px]">Gagal :</span>
                            <span className="font-black text-rose-700">{row.gagal}</span>
                          </div>
                          <div className="text-[9px] flex items-start gap-1 px-2 pt-0.5">
                            <span className="font-bold text-slate-500 uppercase shrink-0 text-left">Alasan :</span>
                            <span className="text-slate-400 italic truncate max-w-35 text-left">
                              {row.alasan && row.alasan.trim() !== "" ? row.alasan : "-"}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-5">
                        <div className="flex items-center justify-center gap-2">
                          <button onClick={() => handleEditClick(row)} className="p-2 text-slate-400 hover:text-indigo-600 transition-all"><Edit2 size={14} /></button>
                          <button onClick={() => { setDeleteTarget(row.submit_id); setActiveModal('sysConfirm'); }} className="p-2 text-slate-400 hover:text-rose-600 transition-all"><Trash2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
               <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="p-2 bg-white border border-slate-200 rounded-xl disabled:opacity-30 shadow-sm"><ChevronLeft size={16}/></button>
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Halaman {currentPage} Dari {totalPages || 1}</span>
               <button disabled={currentPage >= totalPages} onClick={() => setCurrentPage(p => p + 1)} className="p-2 bg-white border border-slate-200 rounded-xl disabled:opacity-30 shadow-sm"><ChevronRight size={16}/></button>
            </div>
          </div>
        </div>
      </main>

      <AdminInputShipmentModal isOpen={activeModal === 'adminInput'} onClose={() => setActiveModal(null)} drivers={drivers} />
      <RegularInputShipmentModal isOpen={activeModal === 'regInput'} onClose={() => setActiveModal(null)} currentUserFullName={user.nama_lengkap} />
      <AdminEditShipmentModal key={`admin-edit-${editData?.submit_id}`} isOpen={activeModal === 'adminEdit'} onClose={() => setActiveModal(null)} drivers={drivers} data={editData} />
      <RegularEditShipmentModal key={`reg-edit-${editData?.submit_id}`} isOpen={activeModal === 'regEdit'} onClose={() => setActiveModal(null)} data={editData} currentUserFullName={user.nama_lengkap} />
      <FreelanceCostModal key={`cost-${editData?.submit_id}`} isOpen={activeModal === 'cost'} onClose={() => setActiveModal(null)} data={editData} />

      <SystemModal isOpen={activeModal === 'sysSuccess'} onClose={() => setActiveModal(null)} type="success" title={modalMessage.title} message={modalMessage.message} />
      <SystemModal isOpen={activeModal === 'sysError'} onClose={() => setActiveModal(null)} type="error" title={modalMessage.title} message={modalMessage.message} />
      <SystemModal isOpen={activeModal === 'sysConfirm'} onClose={() => setActiveModal(null)} onConfirm={handleDelete} type="confirm" title="Konfirmasi Hapus" message="Apakah Anda yakin ingin menghapus data ini?" />
    </div>
  );
}
