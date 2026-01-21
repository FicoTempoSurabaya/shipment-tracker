'use client';

import React, { useState } from 'react';
import { 
  Plus, CheckCircle2, XCircle, Trophy, 
  Eye, Edit, Trash2, Mail, MessageCircle, FileText, ChevronUp, ChevronDown, X 
} from 'lucide-react';
import Link from 'next/link';
import { QuestionSummary, UserStatusData, TypeStat } from './page';
import { deleteQuestion } from '@/app/quiz-admin-actions'; // Pastikan action ini ada

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
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<{ key: keyof QuestionSummary; direction: 'asc' | 'desc' }>({ 
    key: 'question_text', 
    direction: 'asc' 
  });

  // State untuk Preview & Delete
  const [previewData, setPreviewData] = useState<QuestionSummary | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // --- Logika Sorting ---
  const sortedQuestions = [...questions].sort((a, b) => {
    const aVal = a[sortConfig.key] ?? '';
    const bVal = b[sortConfig.key] ?? '';
    if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  const itemsPerPage = 10;
  const totalPages = Math.ceil(sortedQuestions.length / itemsPerPage);
  const currentQuestions = sortedQuestions.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const requestSort = (key: keyof QuestionSummary) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // --- Fungsi Hapus Soal ---
  const handleDelete = async (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus pertanyaan ini?')) {
      setIsDeleting(true);
      const res = await deleteQuestion(id);
      if (res.success) {
        alert('Soal berhasil dihapus');
        window.location.reload(); // Refresh untuk update data
      } else {
        alert('Gagal menghapus soal');
      }
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-8 relative">
      
      {/* 1. CARDBOARD SECTION */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Jenis Soal</p>
          <div className="space-y-2">
            {typeStats.map((t) => (
              <div key={t.type_name} className="flex justify-between text-xs font-bold">
                <span className="text-slate-500">{t.type_name}</span>
                <span className="text-indigo-600">{t.total}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-linear-to-br from-amber-500 to-orange-600 p-6 rounded-3xl text-white shadow-lg shadow-orange-200">
          <Trophy size={32} className="mb-4 opacity-50" />
          <p className="text-[10px] font-bold uppercase opacity-80 tracking-widest">Rata-rata Skor</p>
          <h2 className="text-4xl font-black">{stats.avgScore}</h2>
        </div>

        <button 
          onClick={() => setView('participated')}
          className={`text-left p-6 rounded-3xl border-2 transition-all shadow-sm group ${
            view === 'participated' ? 'border-green-500 bg-green-50' : 'bg-white border-slate-200 hover:border-green-400'
          }`}
        >
          <CheckCircle2 size={32} className="text-green-500 mb-4" />
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Selesai Quiz</p>
          <h2 className="text-4xl font-black text-slate-800">{stats.takenCount}</h2>
        </button>

        <button 
          onClick={() => setView('pending')}
          className={`text-left p-6 rounded-3xl border-2 transition-all shadow-sm group ${
            view === 'pending' ? 'border-rose-500 bg-rose-50' : 'bg-white border-slate-200 hover:border-rose-400'
          }`}
        >
          <XCircle size={32} className="text-rose-500 mb-4" />
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Belum Quiz</p>
          <h2 className="text-4xl font-black text-slate-800">{stats.notTakenCount}</h2>
        </button>
      </div>

      {/* 2. MAIN TABLE / LIST VIEW */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {view === 'main' ? (
          <>
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-black text-slate-800 uppercase tracking-widest text-sm">Daftar Pertanyaan</h3>
              <Link href="/dashboard/quiz/admin/create" className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-indigo-200 transition-transform hover:scale-105">
                <Plus size={18}/> TAMBAH SOAL
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-500 text-[10px] font-black uppercase">
                  <tr>
                    <th className="p-5 w-16">No</th>
                    <th className="p-5 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => requestSort('question_text')}>
                      Pertanyaan {sortConfig.key === 'question_text' && (sortConfig.direction === 'asc' ? <ChevronUp size={12} className="inline ml-1"/> : <ChevronDown size={12} className="inline ml-1"/>)}
                    </th>
                    <th className="p-5 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => requestSort('type_name')}>
                      Tipe {sortConfig.key === 'type_name' && (sortConfig.direction === 'asc' ? <ChevronUp size={12} className="inline ml-1"/> : <ChevronDown size={12} className="inline ml-1"/>)}
                    </th>
                    <th className="p-5 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {currentQuestions.map((q, idx) => (
                    <tr key={q.question_id} className="hover:bg-slate-50 transition-colors group">
                      <td className="p-5 text-slate-400 font-mono text-xs">{(currentPage-1)*10 + idx + 1}</td>
                      <td className="p-5 font-bold text-slate-700">{q.question_text}</td>
                      <td className="p-5">
                        <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-[10px] font-black border border-indigo-100">
                          {q.type_name}
                        </span>
                      </td>
                      <td className="p-5">
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => setPreviewData(q)}
                            title="Preview" 
                            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                          >
                            <Eye size={18}/>
                          </button>
                          <Link 
                            href={`/dashboard/quiz/admin/edit/${q.question_id}`} 
                            title="Edit" 
                            className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-all"
                          >
                            <Edit size={18}/>
                          </Link>
                          <button 
                            onClick={() => handleDelete(q.question_id)}
                            disabled={isDeleting}
                            title="Delete" 
                            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all disabled:opacity-30"
                          >
                            <Trash2 size={18}/>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-6 bg-slate-50 flex justify-center gap-2">
              {Array.from({ length: totalPages }).map((_, i) => (
                <button 
                  key={i} 
                  onClick={() => setCurrentPage(i+1)} 
                  className={`w-10 h-10 rounded-xl font-bold transition-all ${currentPage === i+1 ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-slate-400 hover:bg-indigo-50'}`}
                >
                  {i+1}
                </button>
              ))}
            </div>
          </>
        ) : (
          <UserListView 
            title={view === 'participated' ? 'User Sudah Quiz' : 'User Belum Quiz'} 
            users={view === 'participated' ? participatedUsers : pendingUsers} 
            onBack={() => setView('main')}
            type={view === 'participated' ? 'done' : 'pending'} 
          />
        )}
      </div>

      {/* 3. MODAL PREVIEW (OVERLAY) */}
      {previewData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <span className="px-3 py-1 bg-indigo-600 text-white rounded-full text-[10px] font-black uppercase tracking-widest">
                Preview Soal
              </span>
              <button onClick={() => setPreviewData(null)} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400">
                <X size={20}/>
              </button>
            </div>
            <div className="p-8 space-y-6">
              <div className="space-y-2">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pertanyaan:</p>
                <p className="text-xl font-black text-slate-800 leading-tight">{previewData.question_text}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-[9px] font-bold text-slate-400 uppercase">Tipe</p>
                  <p className="font-black text-indigo-600 text-xs">{previewData.type_name}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-[9px] font-bold text-slate-400 uppercase">Kategori Terkait</p>
                  <p className="font-black text-slate-800 text-xs">{previewData.category_count} Kategori</p>
                </div>
              </div>
              <div className="pt-4 border-t border-slate-100">
                <p className="text-[10px] font-bold text-amber-500 italic">* Tampilan ini adalah ringkasan data. Gunakan menu Edit untuk mengubah isi soal.</p>
              </div>
            </div>
            <div className="p-6 bg-slate-50 text-right">
              <button 
                onClick={() => setPreviewData(null)}
                className="px-6 py-2 bg-slate-800 text-white rounded-xl font-bold text-sm hover:bg-slate-700 transition-colors"
              >
                Tutup Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Sub-component untuk List User
function UserListView({ title, users, onBack, type }: { title: string; users: UserStatusData[]; onBack: () => void; type: 'done' | 'pending' }) {
  return (
    <div className="p-8 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center mb-8">
        <h3 className="text-xl font-black text-slate-800 uppercase tracking-tighter underline decoration-indigo-500 decoration-4 underline-offset-8">{title}</h3>
        <button onClick={onBack} className="px-4 py-2 rounded-xl bg-slate-100 text-xs font-black text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all">← KEMBALI</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {users.map((u) => (
          <div key={u.user_id} className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl border border-slate-100 hover:border-indigo-200 transition-all">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-indigo-600 text-white rounded-full flex items-center justify-center font-black">{u.nama_lengkap[0]}</div>
              <div>
                <p className="font-black text-slate-800 text-sm">{u.nama_lengkap}</p>
                <p className="text-[10px] text-slate-400 font-bold">{u.email || u.no_telp}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {type === 'done' ? (
                <>
                  <span className="font-black text-indigo-600 text-sm mr-2">{u.total_score} pts</span>
                  <button className="p-2 bg-white rounded-xl shadow-sm text-slate-400 hover:text-indigo-600"><Eye size={18}/></button>
                  <button className="p-2 bg-white rounded-xl shadow-sm text-slate-400 hover:text-rose-600"><FileText size={18}/></button>
                </>
              ) : (
                <>
                  <a href={`mailto:${u.email}`} className="p-2 bg-white rounded-xl shadow-sm text-slate-400 hover:text-indigo-600"><Mail size={18}/></a>
                  <a href={`https://wa.me/${u.no_telp}`} className="p-2 bg-white rounded-xl shadow-sm text-slate-400 hover:text-green-600"><MessageCircle size={18}/></a>
                </>
              )}
            </div>
          </div>
        ))}
        {users.length === 0 && <p className="text-center text-slate-400 col-span-2 py-10 italic">Tidak ada data untuk ditampilkan.</p>}
      </div>
    </div>
  );
}