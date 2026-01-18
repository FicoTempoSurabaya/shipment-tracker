'use client'

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import { getCurrentUserSession } from '@/app/dashboard/rekap/rekap-actions'; 
import { getAllUsers, UserPayload } from '@/app/profile-actions';
import { CircleChevronRight, Search, UserPlus, Edit, Shield, User, Truck, Phone, MapPin } from 'lucide-react';

import AdminInputProfileModal from '@/components/modals/profile/AdminInputProfileModal';
import AdminEditProfileModal from '@/components/modals/profile/AdminEditProfileModal';
import RegularEditProfileModal from '@/components/modals/profile/RegularEditProfileModal';

export default function ProfilePage() {
  // --- STATE ---
  const [currentUser, setCurrentUser] = useState<UserPayload | null>(null); 
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // State untuk Data Admin
  const [allUsers, setAllUsers] = useState<UserPayload[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // State Modal
  const [isInputOpen, setIsInputOpen] = useState(false);
  const [isAdminEditOpen, setIsAdminEditOpen] = useState(false);
  const [isRegularEditOpen, setIsRegularEditOpen] = useState(false);
  
  const [selectedUser, setSelectedUser] = useState<UserPayload | null>(null);

  // --- HELPER: FORMAT TANGGAL ---
  // Mencegah error "Objects are not valid as a React child"
  const formatDate = (dateInput: string | Date | null) => {
    if (!dateInput) return '-';
    try {
        const date = new Date(dateInput);
        if (isNaN(date.getTime())) return '-'; // Invalid Date
        // Format ke Indonesia: 20 Januari 2024
        return date.toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    } catch {
        return '-';
    }
  };

  // --- FETCH DATA ---
  useEffect(() => {
    const initData = async () => {
      setIsLoading(true);
      
      const session = await getCurrentUserSession();
      
      if (session) {
        const sessionUser = session as unknown as UserPayload; 
        setCurrentUser(sessionUser);

        if (sessionUser.user_role_as === 'admin') {
            const users = await getAllUsers();
            setAllUsers(users as UserPayload[]);
        } else {
            const users = await getAllUsers();
            const myData = (users as UserPayload[]).find((u) => u.user_id === sessionUser.user_id);
            if(myData) setSelectedUser(myData);
        }
      }
      setIsLoading(false);
    };
    initData();
  }, []);

  // --- HANDLERS ---
  const filteredUsers = allUsers.filter(user => 
    (user.nama_lengkap || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (user.user_id || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAdminEditClick = (user: UserPayload) => {
    setSelectedUser(user);
    setIsAdminEditOpen(true);
  };

  const handleRegularEditClick = () => {
    setIsRegularEditOpen(true);
  };

  if (isLoading) return <div className="flex h-screen items-center justify-center bg-slate-50 text-slate-400 font-bold">Memuat Profil...</div>;
  if (!currentUser) return <div className="flex h-screen items-center justify-center bg-slate-50 text-rose-500 font-bold">Akses Ditolak. Silakan Login.</div>;

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans overflow-x-hidden">
      
      <Sidebar 
        role={currentUser.user_role_as} 
        isOpen={isSidebarOpen} 
        setIsOpen={setIsSidebarOpen} 
      />
      
      <main className={`flex-1 flex flex-col transition-all duration-500 ease-in-out ${isSidebarOpen ? 'ml-72' : 'ml-0'}`}>
        
        {/* HEADER PAGE */}
        <header className="bg-white border-b border-slate-200 h-20 flex items-center justify-between px-8 sticky top-0 z-30 shadow-sm">
            <div className="flex items-center gap-4">
                <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-slate-100 rounded-xl transition-all">
                    <CircleChevronRight size={25} className={`text-slate-600 transition-transform duration-500 ${isSidebarOpen ? 'rotate-180' : 'rotate-0'}`} />
                </button>
                <h1 className="text-xl font-black text-slate-800 uppercase tracking-tight">
                    {currentUser.user_role_as === 'admin' ? 'MANAJEMEN USER' : 'PROFIL SAYA'}
                </h1>
            </div>

            {/* Fitur Header Admin */}
            {currentUser.user_role_as === 'admin' && (
                <div className="flex items-center gap-3">
                    <div className="hidden md:flex items-center bg-slate-100 px-3 py-2 rounded-xl border border-slate-200 w-64">
                        <Search size={16} className="text-slate-400 mr-2" />
                        <input 
                            type="text" 
                            placeholder="Cari Nama / ID..." 
                            className="bg-transparent border-none outline-none text-sm font-semibold text-slate-700 placeholder:text-slate-400 w-full"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <button 
                        onClick={() => setIsInputOpen(true)}
                        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl font-bold text-sm shadow-lg shadow-indigo-200 transition-all active:scale-95"
                    >
                        <UserPlus size={18} />
                        <span className="hidden md:inline">User Baru</span>
                    </button>
                </div>
            )}
        </header>

        {/* CONTENT */}
        <div className="p-8">
            
            {/* TAMPILAN ADMIN: TABEL USER */}
            {currentUser.user_role_as === 'admin' ? (
                <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className="bg-slate-800 text-white">
                                <tr>
                                    <th className="p-4 font-bold border-b border-slate-700">Nama Lengkap</th>
                                    <th className="p-4 font-bold border-b border-slate-700">Role</th>
                                    <th className="p-4 font-bold border-b border-slate-700">Unit / SIM</th>
                                    <th className="p-4 font-bold border-b border-slate-700">Kontak</th>
                                    <th className="p-4 font-bold border-b border-slate-700 text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredUsers.map((user, index) => (
                                    <tr key={user.user_id ? user.user_id : `empty-${index}`} className="hover:bg-slate-50 transition-colors">
                                        <td className="p-4">
                                            <div className="font-bold text-slate-800">{user.nama_lengkap}</div>
                                            <div className="text-xs text-slate-400 font-mono">{user.user_id}</div>
                                        </td>
                                        <td className="p-4">
                                            {user.user_role_as === 'admin' ? (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-100 text-indigo-700 text-xs font-black">
                                                    <Shield size={12} /> ADMIN
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 text-xs font-bold">
                                                    <User size={12} /> REGULAR
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-4 text-slate-600">
                                            <div className="flex flex-col gap-1">
                                                {user.jenis_unit && (
                                                    <span className="text-xs font-bold bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded w-fit">
                                                        {user.jenis_unit} - {user.nopol}
                                                    </span>
                                                )}
                                                <span className="text-xs">SIM {user.license_type}</span>
                                            </div>
                                        </td>
                                        <td className="p-4 text-slate-600 text-xs font-medium">
                                            <div>{user.no_telp}</div>
                                            <div className="text-slate-400">{user.email}</div>
                                        </td>
                                        <td className="p-4 text-center">
                                            <button 
                                                onClick={() => handleAdminEditClick(user)}
                                                className="p-2 bg-slate-100 hover:bg-indigo-100 text-slate-400 hover:text-indigo-600 rounded-lg transition-colors"
                                                title="Edit User"
                                            >
                                                <Edit size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {filteredUsers.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="p-10 text-center text-slate-400 font-medium italic">
                                            Tidak ada user ditemukan.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                /* TAMPILAN REGULAR: PROFILE CARD */
                <div className="max-w-4xl mx-auto">
                     {selectedUser ? (
                        <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden relative">
                            {/* Background decoration */}
                            <div className="h-32 bg-slate-800"></div>
                            
                            <div className="px-8 pb-8">
                                <div className="relative flex justify-between items-end -mt-12 mb-6">
                                    <div className="flex items-end gap-6">
                                        <div className="w-24 h-24 bg-white rounded-2xl p-1 shadow-lg">
                                            <div className="w-full h-full bg-slate-100 rounded-xl flex items-center justify-center text-slate-300">
                                                <User size={40} />
                                            </div>
                                        </div>
                                        <div className="mb-1">
                                            <h2 className="text-2xl font-black text-slate-800">{selectedUser.nama_lengkap}</h2>
                                            <p className="text-slate-500 font-medium">ID: {selectedUser.user_id}</p>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={handleRegularEditClick}
                                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-indigo-200 transition-all flex items-center gap-2"
                                    >
                                        <Edit size={16} /> Edit Profil
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {/* Data Diri */}
                                    <div className="space-y-4">
                                        <h3 className="text-sm font-black text-slate-400 uppercase border-b pb-2">Informasi Pribadi</h3>
                                        <div className="grid grid-cols-1 gap-4">
                                            <div className="flex items-start gap-3">
                                                <div className="p-2 bg-slate-50 rounded-lg text-indigo-500"><MapPin size={18} /></div>
                                                <div>
                                                    <p className="text-xs font-bold text-slate-400 uppercase">Alamat</p>
                                                    <p className="font-semibold text-slate-700">{selectedUser.alamat}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-3">
                                                <div className="p-2 bg-slate-50 rounded-lg text-emerald-500"><Phone size={18} /></div>
                                                <div>
                                                    <p className="text-xs font-bold text-slate-400 uppercase">Kontak</p>
                                                    <p className="font-semibold text-slate-700">{selectedUser.no_telp}</p>
                                                    <p className="text-sm text-slate-500">{selectedUser.email}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Data Kendaraan */}
                                    <div className="space-y-4">
                                        <h3 className="text-sm font-black text-slate-400 uppercase border-b pb-2">Data Operasional</h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                                <p className="text-xs font-bold text-slate-400 uppercase mb-1">Unit Kendaraan</p>
                                                <div className="flex items-center gap-2 text-indigo-700">
                                                    <Truck size={20} />
                                                    <span className="font-black text-lg">{selectedUser.jenis_unit || '-'}</span>
                                                </div>
                                                <p className="text-sm font-mono font-bold text-slate-600 mt-1">{selectedUser.nopol || 'Belum diassign'}</p>
                                            </div>
                                            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                                <p className="text-xs font-bold text-slate-400 uppercase mb-1">SIM Driver</p>
                                                <div className="flex items-center gap-2 text-orange-600">
                                                    <span className="font-black text-2xl">SIM {selectedUser.license_type}</span>
                                                </div>
                                                {/* FIX: Menggunakan formatDate disini */}
                                                <p className="text-xs text-slate-500 mt-1">Exp: {formatDate(selectedUser.masa_berlaku)}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                     ) : (
                         <div className="text-center p-10 text-slate-400">Data profil tidak ditemukan.</div>
                     )}
                </div>
            )}
        </div>

      </main>

      <AdminInputProfileModal 
        isOpen={isInputOpen} 
        onClose={() => setIsInputOpen(false)} 
      />
      
      <AdminEditProfileModal 
        isOpen={isAdminEditOpen} 
        onClose={() => { setIsAdminEditOpen(false); setSelectedUser(null); }} 
        userData={selectedUser}
      />

      <RegularEditProfileModal 
        isOpen={isRegularEditOpen} 
        onClose={() => setIsRegularEditOpen(false)} 
        userData={selectedUser}
      />

    </div>
  );
}