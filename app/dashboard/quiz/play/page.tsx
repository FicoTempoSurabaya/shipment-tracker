import React from 'react';
import { getUserSession } from '@/lib/db'; // Asumsi auth kamu
import { initiateQuizSession, getExamQuestions } from '@/app/quiz-play-actions';
import { redirect } from 'next/navigation';
import QuizPlayerClient from './QuizPlayerClient'; // Kita akan buat ini di Langkah 3

export default async function QuizLobbyPage() {
  // 1. Ambil User Login
  const user = await getUserSession();
  if (!user) redirect('/');

  // 2. Inisialisasi Sesi (Cek status)
  const session = await initiateQuizSession(user.id);

  // Jika sudah selesai, lempar ke halaman hasil
  if (session.status === 'COMPLETED') {
    redirect('/dashboard/quiz/result');
  }

  // 3. Ambil Soal
  const questions = await getExamQuestions();

  if (questions.length === 0) {
    return (
      <div className="p-8 text-center text-slate-500">
        <h2 className="text-xl font-bold mb-2">Soal Belum Tersedia</h2>
        <p>Hubungi admin untuk mengaktifkan bank soal.</p>
      </div>
    );
  }

  // 4. Render Client Component (Player)
  return (
    <div className="max-w-3xl mx-auto py-8">
      <QuizPlayerClient 
        userId={user.id} 
        testId={session.testId} 
        questions={questions} 
      />
    </div>
  );
}