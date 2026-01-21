'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Edit, Trash2, Search, ChevronLeft, ChevronRight, 
  Image as ImageIcon, MoreHorizontal 
} from 'lucide-react';

// Export interface ini agar bisa dipakai di page.tsx
export interface QuestionSummary {
  question_id: string;
  question_text: string;
  type_name?: string;
  category_count?: number | string;
  question_image_url?: string | null;
}

interface QuestionTableProps {
  questions: QuestionSummary[];
}

export default function AdminQuestionTable({ questions }: QuestionTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Safety check: pastikan questions adalah array
  const safeQuestions = Array.isArray(questions) ? questions : [];

  const filteredQuestions = safeQuestions.filter((q) => 
    (q.question_text || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (q.type_name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredQuestions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentData = filteredQuestions.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col h-full">
      
      {/* TOOLBAR */}
      <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
        <h3 className="font-bold text-slate-700 text-lg">Daftar Soal</h3>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text"
            placeholder="Cari pertanyaan..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
          />
        </div>
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50/50 text-slate-500 font-semibold border-b border-slate-100">
            <tr>
              <th className="p-4 w-16 text-center">#</th>
              <th className="p-4">Pertanyaan</th>
              <th className="p-4 w-32">Tipe</th>
              <th className="p-4 w-24 text-center">Kat.</th>
              <th className="p-4 w-24 text-center">Media</th>
              <th className="p-4 w-24 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {currentData.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-slate-400">
                  Tidak ada soal yang ditemukan.
                </td>
              </tr>
            ) : (
              currentData.map((q, idx) => (
                <tr key={q.question_id} className="hover:bg-slate-50/80 transition-colors group">
                  <td className="p-4 text-center text-slate-400">
                    {startIndex + idx + 1}
                  </td>
                  <td className="p-4">
                    <p className="font-medium text-slate-800 line-clamp-2 mb-1">{q.question_text}</p>
                    <div className="text-[10px] font-mono text-slate-400 bg-slate-100 inline-block px-1.5 rounded">
                      ID: {q.question_id.substring(0,8)}
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="px-2.5 py-1 bg-white border border-slate-200 text-slate-600 rounded-lg text-xs font-medium shadow-sm">
                      {q.type_name || 'Unknown'}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <span className="w-6 h-6 inline-flex items-center justify-center bg-indigo-50 text-indigo-600 rounded-full text-xs font-bold">
                      {q.category_count || 0}
                    </span>
                  </td>
                  <td className="p-4 text-center text-slate-400">
                    {q.question_image_url ? (
                      <ImageIcon size={18} className="mx-auto text-indigo-500" />
                    ) : (
                      '-'
                    )}
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                      <Link 
                        href={`/dashboard/quiz/admin/edit/${q.question_id}`}
                        className="p-2 bg-white border border-slate-200 text-slate-600 hover:text-indigo-600 hover:border-indigo-600 rounded-lg transition-all shadow-sm"
                      >
                        <Edit size={16} />
                      </Link>
                      <button className="p-2 bg-white border border-slate-200 text-slate-600 hover:text-red-600 hover:border-red-600 rounded-lg transition-all shadow-sm">
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <div className="sm:hidden text-slate-300">
                       <MoreHorizontal size={18} />
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* FOOTER */}
      <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/30 mt-auto">
        <span className="text-xs text-slate-500 font-medium">
          Halaman {currentPage} dari {totalPages || 1}
        </span>
        <div className="flex gap-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-2 bg-white border border-slate-200 rounded-lg disabled:opacity-50 hover:bg-slate-50 text-slate-600 transition-colors"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages || totalPages === 0}
            className="p-2 bg-white border border-slate-200 rounded-lg disabled:opacity-50 hover:bg-slate-50 text-slate-600 transition-colors"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

    </div>
  );
}