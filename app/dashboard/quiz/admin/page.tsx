import React from 'react';
import { 
  getAllQuestions, 
  getAdminDashboardStats, 
  getQuestionCountByType,
  getParticipatedUsers,
  getPendingUsers 
} from '@/app/quiz-admin-actions';
import AdminDashboardClient from './AdminDashboardClient';

// Tipe data untuk koordinasi antara Server dan Client
export interface QuestionSummary {
  question_id: string;
  question_text: string;
  type_name: string;
  category_count: number;
}

export interface UserStatusData {
  user_id: string;
  nama_lengkap: string;
  email: string;
  no_telp: string;
  total_score?: number;
  user_test_id?: string;
}

export interface TypeStat {
  type_name: string;
  total: number;
}

export default async function QuizAdminPage() {
  // Ambil semua data secara paralel untuk performa maksimal
  const [
    questionsRaw, 
    stats, 
    typeStatsRaw, 
    participatedRaw, 
    pendingRaw
  ] = await Promise.all([
    getAllQuestions(),
    getAdminDashboardStats(),
    getQuestionCountByType(),
    getParticipatedUsers(),
    getPendingUsers()
  ]);

  // Casting data ke tipe yang sesuai
  const questions = questionsRaw as unknown as QuestionSummary[];
  const typeStats = typeStatsRaw as unknown as TypeStat[];
  const participatedUsers = participatedRaw as unknown as UserStatusData[];
  const pendingUsers = pendingRaw as unknown as UserStatusData[];

  return (
    <div className="p-4 md:p-8">
      {/* Header Utama */}
      <div className="mb-8">
        <h1 className="text-4xl font-black text-slate-800 tracking-tight">
          Quiz Control Center
        </h1>
        <p className="text-slate-500 font-medium">
          Monitor performa peserta dan kelola bank soal secara real-time.
        </p>
      </div>

      {/* Teruskan data ke Client Component untuk interaksi dinamis */}
      <AdminDashboardClient 
        questions={questions}
        stats={stats}
        typeStats={typeStats}
        participatedUsers={participatedUsers}
        pendingUsers={pendingUsers}
      />
    </div>
  );
}