'use client'

import { useState, useEffect, useMemo } from 'react';
import { getRekapShipmentData, getCurrentUserSession } from './rekap-actions';
import { getDriversList } from '@/app/shipment-actions';
import AdminEditShipmentModal from '@/components/modals/AdminEditShipmentModal';
import AdminInputShipmentModal from '@/components/modals/AdminInputShipmentModal';
import Sidebar from '@/components/Sidebar';
import { ShipmentData, DriverOption, UserData } from '@/types'; 
import { format, eachDayOfInterval, isSunday, parseISO, addMonths, subMonths, setDate } from 'date-fns';
import { id } from 'date-fns/locale';
import { CircleChevronRight, Calendar, RotateCcw } from 'lucide-react';

type ColumnType = {
  id: string | number;
  name: string;
  role: string;
  type: 'user' | 'freelance';
};

// --- LOGIKA 1: PERIODE CUT-OFF 16-15 ---
const getCutoffPeriod = () => {
  const today = new Date();
  const currentDay = today.getDate();
  
  let start, end;

  if (currentDay >= 16) {
    start = setDate(today, 16);
    end = setDate(addMonths(today, 1), 15);
  } else {
    start = setDate(subMonths(today, 1), 16);
    end = setDate(today, 15);
  }

  return {
    startStr: format(start, 'yyyy-MM-dd'),
    endStr: format(end, 'yyyy-MM-dd')
  };
};

export default function RekapShipmentPage() {
  const [currentUser, setCurrentUser] = useState<UserData | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // State Tanggal
  const defaultPeriod = getCutoffPeriod();
  const [startDate, setStartDate] = useState<string>(defaultPeriod.startStr);
  const [endDate, setEndDate] = useState<string>(defaultPeriod.endStr);
  
  // State Data
  const [data, setData] = useState<{
    users: UserData[];
    freelancers: string[];
    shipments: ShipmentData[];
  }>({ users: [], freelancers: [], shipments: [] });
  
  const [drivers, setDrivers] = useState<DriverOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Modal State
  const [editData, setEditData] = useState<ShipmentData | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isInputOpen, setIsInputOpen] = useState(false);

  // --- FETCH DATA ---
  useEffect(() => {
    getCurrentUserSession().then(user => {
        if(user) setCurrentUser(user);
    });
    getDriversList().then(res => setDrivers(res));
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const res = await getRekapShipmentData(startDate, endDate);
      setData(res);
      setIsLoading(false);
    };
    fetchData();
  }, [startDate, endDate]);

  const handleResetDate = () => {
    const period = getCutoffPeriod();
    setStartDate(period.startStr);
    setEndDate(period.endStr);
  };

  // --- LOGIKA UTAMA ---
  const dateRange = useMemo(() => {
    try {
        return eachDayOfInterval({
            start: parseISO(startDate),
            end: parseISO(endDate)
        });
    } catch { 
        return [];
    }
  }, [startDate, endDate]);

  const columns: ColumnType[] = useMemo(() => {
    const userCols = data.users.map(u => ({
      id: u.user_id,
      name: u.nama_lengkap,
      role: u.user_role_as,
      type: 'user' as const
    }));

    const freelanceCols = data.freelancers.map(f => ({
      id: f,
      name: f,
      role: 'freelance',
      type: 'freelance' as const
    }));

    return [...userCols, ...freelanceCols];
  }, [data.users, data.freelancers]);

  // LOGIKA 2: Kepemilikan Shipment (Freelance vs User)
  const checkShipmentOwnership = (s: ShipmentData, col: ColumnType) => {
    if (col.type === 'freelance') {
      return s.nama_freelance === col.name;
    } 
    if (col.type === 'user') {
      // Milik user reguler HANYA JIKA kolom nama_freelance kosong
      const hasFreelance = s.nama_freelance && s.nama_freelance.trim() !== '';
      return s.user_id === col.id && !hasFreelance;
    }
    return false;
  };

  const findShipment = (date: Date, col: ColumnType) => {
    const columnDateStr = format(date, 'yyyy-MM-dd');
    
    return data.shipments.find(s => {
      const sDate = typeof s.tanggal === 'string' ? s.tanggal.slice(0, 10) : format(s.tanggal, 'yyyy-MM-dd');
      if (sDate !== columnDateStr) return false;
      return checkShipmentOwnership(s, col);
    });
  };

  const getColumnTotal = (col: ColumnType) => {
    return data.shipments.filter(s => {
       return checkShipmentOwnership(s, col);
    }).length;
  };

  const totalHariKerja = dateRange.filter(d => !isSunday(d)).length;
  const grandTotalShipments = data.shipments.length;

  const handleCellClick = (shipment: ShipmentData | undefined) => {
    if (shipment) {
      setEditData(shipment);
      setIsEditOpen(true);
    } else {
      setIsInputOpen(true);
    }
  };

  // --- CONFIG STICKY COLUMNS ---
  // Lebar Kolom: No(3rem/w-12), Tgl(8rem/w-32), Hari(6rem/w-24), Jml(4rem/w-16)
  
  // Posisi Left (akumulasi lebar)
  const POS_NO = "left-0"; 
  const POS_TGL = "left-[3rem]";  // 3rem
  const POS_HARI = "left-[11rem]"; // 3 + 8 = 11rem
  const POS_JML = "left-[17rem]"; // 11 + 6 = 17rem
  
  // Class Dasar untuk Sticky Header (Z-Index 50 agar paling atas)
  const thStickyClass = "sticky z-50 bg-slate-800 border-r border-slate-600";
  // Class Tambahan untuk Kolom Terakhir yang Sticky (Jml) agar ada bayangan
  const shadowClass = "shadow-[4px_0_5px_-2px_rgba(0,0,0,0.3)]";

  // Class Dasar untuk Sticky Body (Z-Index 30 agar di atas sel biasa, tapi di bawah header)
  const tdStickyClass = "sticky z-30 border-r border-slate-200 transition-colors";

  if (!currentUser) return <div className="p-10 text-center">Loading Session...</div>;

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
      
      <Sidebar 
        role={currentUser.user_role_as as 'admin' | 'regular'} 
        isOpen={isSidebarOpen} 
        setIsOpen={setIsSidebarOpen} 
      />
      
      {/* WRAPPER UTAMA: min-w-0 agar horizontal scroll aktif */}
      <main className={`flex-1 flex flex-col min-w-0 transition-all duration-500 ease-in-out ${isSidebarOpen ? 'ml-72' : 'ml-0'}`}>
        
        {/* HEADER */}
        <header className="bg-white border-b border-slate-200 h-20 flex-none flex items-center justify-between px-8 sticky top-0 z-30 shadow-sm">
            <div className="flex items-center gap-4">
                <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-slate-100 rounded-xl transition-all">
                    <CircleChevronRight size={25} className={`text-slate-600 transition-transform duration-500 ${isSidebarOpen ? 'rotate-180' : 'rotate-0'}`} />
                </button>
                
                <h1 className="text-xl font-black text-slate-800 uppercase tracking-tight">REKAP SHIPMENT</h1>

                <div className="hidden md:flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200 ml-4">
                    <Calendar size={14} className="text-indigo-600 ml-2" />
                    <input 
                        type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} 
                        className="bg-transparent text-xs font-bold outline-none cursor-pointer text-slate-600 w-24" 
                    />
                    <span className="text-slate-400">/</span>
                    <input 
                        type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} 
                        className="bg-transparent text-xs font-bold outline-none cursor-pointer text-slate-600 w-24" 
                    />
                    <button onClick={handleResetDate} title="Reset ke Periode Cut Off" className="p-2 hover:bg-white rounded-xl text-slate-400 hover:text-indigo-600 transition-all">
                      <RotateCcw size={14}/>
                    </button>
                </div>
            </div>

            <div className="text-right hidden md:block">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Periode Laporan</p>
                <p className="text-sm font-black text-slate-800">
                    {format(parseISO(startDate), 'dd MMM', { locale: id })} - {format(parseISO(endDate), 'dd MMM yyyy', { locale: id })}
                </p>
            </div>
        </header>

        {/* CONTENT AREA */}
        <div className="flex-1 p-4 md:p-8 min-h-0 overflow-hidden flex flex-col">
            
            {/* TABLE CARD */}
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 flex flex-col flex-1 overflow-hidden min-w-0">
                
                {/* SCROLL AREA */}
                <div className="flex-1 overflow-auto w-full relative">
                  <table className="min-w-max border-collapse text-sm whitespace-nowrap">
                      
                      {/* --- HEADER (Z-Index 50) --- */}
                      <thead className="bg-slate-800 text-white sticky top-0 z-50">
                        {/* Baris 1: Judul Utama */}
                        <tr>
                            <th className={`p-3 w-12 border-b ${thStickyClass} ${POS_NO}`}>No.</th>
                            <th className={`p-3 w-32 border-b ${thStickyClass} ${POS_TGL}`}>Tanggal</th>
                            <th className={`p-3 w-24 border-b ${thStickyClass} ${POS_HARI}`}>Hari</th>
                            <th className={`p-3 w-16 border-b ${thStickyClass} ${POS_JML} ${shadowClass}`}>Jml</th>
                            
                            {/* Scrollable Header */}
                            <th colSpan={columns.length} className="p-3 text-center border-b border-slate-600 font-black tracking-wider bg-slate-800 z-40">
                              NAMA PERSONIL
                            </th>
                        </tr>
                        
                        {/* Baris 2: Nama Personil */}
                        <tr>
                            <th className={`${thStickyClass} ${POS_NO}`}></th>
                            <th className={`${thStickyClass} ${POS_TGL}`}></th>
                            <th className={`${thStickyClass} ${POS_HARI}`}></th>
                            <th className={`${thStickyClass} ${POS_JML} ${shadowClass}`}></th>
                            
                            {columns.map((col, idx) => (
                              <th key={`name-${idx}`} className="p-2 min-w-30 border-b border-r border-slate-600 text-xs font-bold text-center bg-slate-800 z-40">
                                  {col.name}
                              </th>
                            ))}
                        </tr>

                        {/* Baris 3: Role */}
                        <tr>
                            <th className={`border-b ${thStickyClass} ${POS_NO}`}></th>
                            <th className={`border-b ${thStickyClass} ${POS_TGL}`}></th>
                            <th className={`border-b ${thStickyClass} ${POS_HARI}`}></th>
                            <th className={`border-b ${thStickyClass} ${POS_JML} ${shadowClass}`}></th>
                            
                            {columns.map((col, idx) => (
                              <th key={`role-${idx}`} className="p-1 border-b border-r border-slate-600 text-[10px] uppercase text-slate-400 font-medium text-center bg-slate-800 z-40">
                                  {col.role}
                              </th>
                            ))}
                        </tr>
                      </thead>

                      {/* --- BODY (Sticky Cols Z-Index 30) --- */}
                      <tbody>
                      {isLoading ? (
                          <tr><td colSpan={4 + columns.length} className="p-10 text-center text-slate-500">Memuat Data...</td></tr>
                      ) : (
                          dateRange.map((date, index) => {
                          const isMinggu = isSunday(date);
                          const dateStr = format(date, 'yyyy-MM-dd');
                          
                          const countPerDate = data.shipments.filter(s => {
                              const sDate = typeof s.tanggal === 'string' ? s.tanggal.slice(0, 10) : format(s.tanggal, 'yyyy-MM-dd');
                              return sDate === dateStr;
                          }).length;
                          
                          // Kita harus set background explisit pada sticky column agar tidak transparan saat discroll
                          const bgClass = isMinggu ? 'bg-rose-50' : 'bg-white';
                          const hoverClass = 'hover:bg-slate-100';

                          return (
                              <tr key={index} className={`${bgClass} ${hoverClass} border-b border-slate-200 group`}>
                                {/* Sticky Columns */}
                                <td className={`p-3 text-center font-bold text-slate-500 ${tdStickyClass} ${POS_NO} ${bgClass} group-hover:bg-slate-100`}>
                                  {index + 1}
                                </td>
                                
                                <td className={`p-3 font-medium text-slate-700 ${tdStickyClass} ${POS_TGL} ${bgClass} group-hover:bg-slate-100`}>
                                  {format(date, 'yyyy-MM-dd')}
                                </td>
                                
                                <td className={`p-3 font-medium ${tdStickyClass} ${POS_HARI} ${bgClass} group-hover:bg-slate-100 ${isMinggu ? 'text-rose-600 font-bold' : 'text-slate-700'}`}>
                                    {format(date, 'eeee', { locale: id })}
                                </td>
                                
                                <td className={`p-3 text-center font-black ${tdStickyClass} ${POS_JML} ${bgClass} group-hover:bg-slate-100 ${shadowClass} ${countPerDate > 0 ? 'text-indigo-600' : 'text-slate-300'}`}>
                                    {countPerDate}
                                </td>
                                
                                {/* Scrollable Columns */}
                                {columns.map((col, colIdx) => {
                                    const shipment = findShipment(date, col);
                                    return (
                                    <td key={`cell-${index}-${colIdx}`} onClick={() => handleCellClick(shipment)} className="p-2 border-r border-slate-200 text-center cursor-pointer hover:bg-indigo-50 transition-colors z-0">
                                        {shipment ? (
                                        <span className="inline-block px-2 py-1 rounded bg-indigo-100 text-indigo-700 font-mono text-xs font-bold shadow-sm">{shipment.shipment_id}</span>
                                        ) : (
                                        <span className="text-slate-300 font-bold">-</span>
                                        )}
                                    </td>
                                    );
                                })}
                              </tr>
                          );
                          })
                      )}
                      </tbody>

                      {/* --- FOOTER (Sticky Cols Z-Index 50) --- */}
                      {!isLoading && (
                      <tfoot className="bg-slate-100 font-bold text-slate-800 sticky bottom-0 z-50 shadow-[0_-2px_10px_rgba(0,0,0,0.1)]">
                          <tr>
                            <td className={`p-3 border-t border-slate-300 sticky z-50 bg-slate-200 ${POS_NO}`}>TOTAL</td>
                            <td className={`p-3 border-t border-slate-300 text-center sticky z-50 bg-slate-200 ${POS_TGL}`}>{totalHariKerja} HK</td>
                            <td className={`p-3 border-t border-slate-300 sticky z-50 bg-slate-200 ${POS_HARI}`}></td>
                            <td className={`p-3 text-center text-indigo-700 text-lg border-t border-slate-300 sticky z-50 bg-slate-200 ${POS_JML} ${shadowClass}`}>{grandTotalShipments}</td>
                            
                            {/* Scrollable Footer */}
                            {columns.map((col, idx) => (
                                <td key={`total-${idx}`} className="p-3 text-center border-t border-r border-slate-300 bg-slate-100 z-40">{getColumnTotal(col)}</td>
                            ))}
                          </tr>
                      </tfoot>
                      )}
                  </table>
                </div>
            </div>
        </div>
      </main>

      <AdminEditShipmentModal isOpen={isEditOpen} onClose={() => { setIsEditOpen(false); setEditData(null); }} drivers={drivers} data={editData} />
      <AdminInputShipmentModal isOpen={isInputOpen} onClose={() => setIsInputOpen(false)} drivers={drivers} />

    </div>
  );
}