'use client';

import React, { useState } from 'react';
import { 
  Plus, CheckCircle2, XCircle, Trophy, 
  Eye, Edit, Trash2, Mail, MessageCircle, FileText, ChevronUp, ChevronDown 
} from 'lucide-react';
import Link from 'next/link';
import { QuestionSummary, UserStatusData, TypeStat } from './page';

interface AdminDashboardClientProps {
  questions: QuestionSummary[];
  stats: {
    totalUsers: number;
    takenCount: number;
    notTakenCount: number;
    avgScore: number;
  };
  typeStats: TypeStat[];
  participatedUsers: UserStatusData[];
  pendingUsers: UserStatusData[];
}

export default function AdminDashboardClient({ 
  questions, stats, typeStats, participatedUsers, pendingUsers 
}: AdminDashboardClientProps) {
  const [view, setView] = useState<'main' | 'participated' | 'pending'>('main');
  const [searchTerm] = useState(''); // Bisa dihubungkan ke input jika ingin search aktif
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<{ key: keyof QuestionSummary; direction: 'asc' | 'desc' }>({ 
    key: 'question_text', 
    direction: 'asc' 
  });

  // --- Logic Tabel Soal ---
  const sortedQuestions = [...questions].sort((a, b) => {
    const aValue = a[sortConfig.key] ?? '';
    const bValue = b[sortConfig.key] ?? '';
    if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  const filteredQuestions = sortedQuestions.filter(q => 
    q.question_text.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredQuestions.length / itemsPerPage);
  const currentQuestions = filteredQuestions.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const requestSort = (key: keyof QuestionSummary) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
    setSortConfig({ key, direction });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* 1. CARDBOARD GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card Jenis Soal */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase mb-4 tracking-widest">Jenis Pertanyaan</p>
          <div className="space-y-2">
            {typeStats.map((t) => (
              <div key={t.type_name} className="flex justify-between text-sm">
                <span className="text-slate-600 font-medium">{t.type_name}</span>
                <span className="font-bold text-indigo-600">{t.total}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Card Rata-rata */}
        <div className="bg-linear-to-br from-amber-500 to-orange-600 p-6 rounded-3xl text-white shadow-lg shadow-orange-200/50">
          <Trophy className="mb-4 opacity-50" size={32} />
          <p className="text-xs font-bold uppercase opacity-80 tracking-widest">Rata-rata Skor</p>
          <h2 className="text-4xl font-black">{stats.avgScore}<span className="text-lg font-normal">/100</span></h2>
        </div>

        {/* Card Selesai */}
        <div 
          onClick={() => setView('participated')}
          className={`p-6 rounded-3xl border-2 transition-all shadow-sm group cursor-pointer ${
            view === 'participated' ? 'border-green-500 bg-green-50/30' : 'bg-white border-green-100 hover:border-green-400'
          }`}
        >
          <CheckCircle2 className="text-green-500 mb-4 group-hover:scale-110 transition-transform" size={32} />
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Selesai Quiz</p>
          <h2 className="text-4xl font-black text-slate-800">{stats.takenCount}</h2>
          <p className="text-xs text-green-600 mt-2 font-bold">Lihat Detail →</p>
        </div>

        {/* Card Belum */}
        <div 
          onClick={() => setView('pending')}
          className={`p-6 rounded-3xl border-2 transition-all shadow-sm group cursor-pointer ${
            view === 'pending' ? 'border-rose-500 bg-rose-50/30' : 'bg-white border-rose-100 hover:border-rose-400'
          }`}
        >
          <XCircle className="text-rose-500 mb-4 group-hover:scale-110 transition-transform" size={32} />
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Belum Quiz</p>
          <h2 className="text-4xl font-black text-slate-800">{stats.notTakenCount}</h2>
          <p className="text-xs text-rose-600 mt-2 font-bold">Follow Up →</p>
        </div>
      </div>

      {/* 2. AREA DINAMIS */}
      {view === 'main' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden border-b-4 border-b-indigo-500">
          <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
            <h3 className="text-xl font-black text-slate-800 tracking-tight">Daftar Pertanyaan</h3>
            <Link href="/dashboard/quiz/admin/create" className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-indigo-100">
              <Plus size={18}/> Tambah Soal
            </Link>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-500 text-[10px] font-black uppercase tracking-tighter">
                <tr>
                  <th className="p-5 w-16">No</th>
                  <th className="p-5 cursor-pointer hover:text-indigo-600" onClick={() => requestSort('question_text')}>
                    Pertanyaan {sortConfig.key === 'question_text' && (sortConfig.direction === 'asc' ? <ChevronUp className="inline" size={14}/> : <ChevronDown className="inline" size={14}/>)}
                  </th>
                  <th className="p-5 cursor-pointer hover:text-indigo-600" onClick={() => requestSort('type_name')}>
                    Tipe {sortConfig.key === 'type_name' && (sortConfig.direction === 'asc' ? <ChevronUp className="inline" size={14}/> : <ChevronDown className="inline" size={14}/>)}
                  </th>
                  <th className="p-5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {currentQuestions.map((q, idx) => (
                  <tr key={q.question_id} className="hover:bg-slate-50 transition-colors group">
                    <td className="p-5 text-slate-400 font-mono text-xs">{(currentPage-1)*10 + idx + 1}</td>
                    <td className="p-5 font-bold text-slate-700 max-w-md truncate">{q.question_text}</td>
                    <td className="p-5"><span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-[10px] font-black border border-indigo-100">{q.type_name}</span></td>
                    <td className="p-5">
                      <div className="flex justify-end gap-2">
                        <button title="Preview" className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"><Eye size={18}/></button>
                        <Link href={`/dashboard/quiz/admin/edit/${q.question_id}`} title="Edit" className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-all"><Edit size={18}/></Link>
                        <button title="Delete" className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"><Trash2 size={18}/></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="p-6 bg-slate-50 flex justify-center gap-2">
            {Array.from({ length: totalPages }).map((_, i) => (
              <button 
                key={i} 
                onClick={() => setCurrentPage(i+1)}
                className={`w-10 h-10 rounded-xl font-bold transition-all ${currentPage === i+1 ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'bg-white text-slate-400 hover:bg-indigo-50'}`}
              >
                {i+1}
              </button>
            ))}
          </div>
        </div>
      )}

      {view === 'participated' && (
        <UserListView 
          title="User Sudah Quiz" 
          users={participatedUsers} 
          onBack={() => setView('main')}
          type="done" 
        />
      )}

      {view === 'pending' && (
        <UserListView 
          title="User Belum Quiz" 
          users={pendingUsers} 
          onBack={() => setView('main')}
          type="pending" 
        />
      )}
    </div>
  );
}

function UserListView({ title, users, onBack, type }: { title: string; users: UserStatusData[]; onBack: () => void; type: 'done' | 'pending' }) {
  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 animate-in slide-in-from-bottom-4 duration-300">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <h3 className="text-2xl font-black text-slate-800 tracking-tight underline decoration-indigo-500 decoration-4 underline-offset-8">{title}</h3>
        <button onClick={onBack} className="px-4 py-2 rounded-xl bg-slate-100 text-sm font-bold text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all">← Kembali ke Dashboard</button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {users.map((u) => (
          <div key={u.user_id} className="flex items-center justify-between p-5 bg-slate-50/50 rounded-2xl border border-slate-100 hover:border-indigo-200 transition-all">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center font-black text-xl shadow-lg shadow-indigo-100">{u.nama_lengkap[0]}</div>
              <div>
                <p className="font-black text-slate-800">{u.nama_lengkap}</p>
                <p className="text-xs text-slate-400 font-medium">{u.email || u.no_telp}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {type === 'done' ? (
                <>
                  <div className="text-right mr-2">
                    <span className="block text-xs font-black text-slate-400 uppercase">Skor</span>
                    <span className="font-black text-indigo-600 text-lg">{u.total_score || 0}</span>
                  </div>
                  <button title="Lihat Hasil" className="p-3 bg-white rounded-xl shadow-sm text-slate-400 hover:text-indigo-600 transition-all"><Eye size={20}/></button>
                  <button title="Download PDF" className="p-3 bg-white rounded-xl shadow-sm text-slate-400 hover:text-rose-600 transition-all"><FileText size={20}/></button>
                </>
              ) : (
                <>
                  <a href={`mailto:${u.email}`} title="Email" className="p-3 bg-white rounded-xl shadow-sm text-slate-400 hover:text-indigo-600 transition-all"><Mail size={20}/></a>
                  <a href={`https://wa.me/${u.no_telp}`} title="WA" className="p-3 bg-white rounded-xl shadow-sm text-slate-400 hover:text-green-600 transition-all"><MessageCircle size={20}/></a>
                </>
              )}
            </div>
          </div>
        ))}
        {users.length === 0 && <p className="text-slate-400 font-medium italic p-4 text-center col-span-2">Data tidak ditemukan.</p>}
      </div>
    </div>
  );
}