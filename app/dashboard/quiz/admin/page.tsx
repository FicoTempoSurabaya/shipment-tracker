import React from 'react';
import pool from '@/lib/db';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import DashboardClient from '../../DashboardClient';
import AdminDashboardClient from './AdminDashboardClient';
import { 
  getAllQuestions, 
  getAdminDashboardStats, 
  getQuestionCountByType,
  getParticipatedUsers,
  getPendingUsers 
} from '@/app/quiz-admin-actions';

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
  const cookieStore = await cookies();
  const userId = cookieStore.get('user_id')?.value;
  const userRole = cookieStore.get('user_role')?.value;

  if (!userId || userRole !== 'admin') redirect('/');

  // Ambil Data User untuk DashboardClient
  const userRes = await pool.query(
    'SELECT user_id, nama_lengkap, user_role_as FROM users_data WHERE user_id = $1', 
    [userId]
  );
  const userProfile = userRes.rows[0];

  // Ambil Data Quiz
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

  const questions = questionsRaw as unknown as QuestionSummary[];
  const typeStats = typeStatsRaw as unknown as TypeStat[];
  const participatedUsers = participatedRaw as unknown as UserStatusData[];
  const pendingUsers = pendingRaw as unknown as UserStatusData[];

  return (
    <DashboardClient 
      user={userProfile} 
      allData={[]} 
      drivers={[]} 
      initialPeriod={{start: '', end: ''}}
    >
      <AdminDashboardClient 
        questions={questions}
        stats={stats}
        typeStats={typeStats}
        participatedUsers={participatedUsers}
        pendingUsers={pendingUsers}
      />
    </DashboardClient>
  );
}