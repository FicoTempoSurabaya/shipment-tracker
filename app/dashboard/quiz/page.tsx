import { getUserSession } from '@/lib/db';
import { redirect } from 'next/navigation';
import pool from '@/lib/db';

export default async function QuizGatewayPage() {
  const user = await getUserSession();
  if (!user) redirect('/');

  // 1. Jika ADMIN -> Arahkan ke Dashboard Bank Soal
  if (user.role === 'admin') {
    redirect('/dashboard/quiz/admin');
  }

  // 2. Jika REGULAR -> Cek apakah sudah pernah tes?
  const client = await pool.connect();
  try {
    const testRes = await client.query(
      `SELECT test_status FROM user_test WHERE user_id = $1 ORDER BY started_at DESC LIMIT 1`,
      [user.id]
    );

    const lastTest = testRes.rows[0];

    // Jika sudah selesai -> Arahkan ke Hasil
    if (lastTest && lastTest.test_status === 'COMPLETE') {
      redirect('/dashboard/quiz/result');
    }

    // Jika belum -> Arahkan ke Lobby/Play
    redirect('/dashboard/quiz/play');

  } finally {
    client.release();
  }
}