'use server';

import pool from '@/lib/db';
import { randomUUID } from 'crypto';
import { revalidatePath } from 'next/cache';

// 1. CEK STATUS & MULAI SESI
export async function initiateQuizSession(userId: string) {
  const client = await pool.connect();
  try {
    // Cek apakah user sudah pernah tes?
    const existingTest = await client.query(
      `SELECT * FROM user_test WHERE user_id = $1 ORDER BY started_at DESC LIMIT 1`,
      [userId]
    );

    // Skenario A: Sudah pernah tes
    if (existingTest.rowCount && existingTest.rowCount > 0) {
      const test = existingTest.rows[0];
      
      // Jika sudah SELESAI -> Blokir
      if (test.test_status === 'COMPLETE') {
        return { 
          status: 'COMPLETED', 
          message: 'Anda sudah menyelesaikan tes ini.',
          testId: test.user_test_id 
        };
      }
      
      // Jika masih START (mungkin putus koneksi) -> Lanjutkan
      return { 
        status: 'RESUME', 
        message: 'Melanjutkan sesi sebelumnya...',
        testId: test.user_test_id 
      };
    }

    // Skenario B: Belum pernah tes -> Buat Sesi Baru
    const newTestId = randomUUID();
    await client.query(
      `INSERT INTO user_test (user_test_id, user_id, test_status, started_at) 
       VALUES ($1, $2, 'START', NOW())`,
      [newTestId, userId]
    );

    return { 
      status: 'NEW', 
      message: 'Sesi ujian dimulai.',
      testId: newTestId 
    };

  } catch (error) {
    console.error('Init quiz error:', error);
    throw new Error('Gagal memulai sesi ujian.');
  } finally {
    client.release();
  }
}

// 2. AMBIL SOAL (Diacak/Randomized)
export async function getExamQuestions() {
  const client = await pool.connect();
  try {
    // Ambil semua soal aktif (bisa tambahkan LIMIT jika ingin membatasi jumlah soal)
    // Kita gunakan ORDER BY RANDOM() agar urutan soal beda-beda tiap user
    const questionsRes = await client.query(`
      SELECT 
        q.question_id, 
        q.question_text, 
        q.question_image_url, 
        q.type_id
      FROM question_list q
      WHERE q.is_scored = true
      ORDER BY RANDOM()
    `);

    const questions = questionsRes.rows;

    // Untuk setiap soal, ambil opsi jawabannya
    // (Kita fetch terpisah agar lebih rapi, atau bisa pakai JSON_AGG di query atas)
    for (const q of questions) {
      const ansRes = await client.query(`
        SELECT answer_id, answer_text 
        FROM question_answer 
        WHERE question_id = $1 
        ORDER BY sort_order ASC -- Atau RANDOM() jika ingin opsi diacak juga
      `, [q.question_id]);
      
      // PERHATIAN: Jangan kirim 'is_correct' atau 'score_value' ke frontend!
      // Biar user tidak bisa intip jawaban lewat Inspect Element.
      q.options = ansRes.rows;
    }

    return questions;
  } finally {
    client.release();
  }
}

// 3. SIMPAN JAWABAN (Save on Next)
export async function submitSingleAnswer(userId: string, questionId: string, answerId: string) {
  const client = await pool.connect();
  try {
    // Cek dulu berapa skor jawaban ini (Ambil dari master key)
    const keyRes = await client.query(
      `SELECT score_value FROM question_answer WHERE answer_id = $1`,
      [answerId]
    );
    
    const score = keyRes.rows[0]?.score_value || 0;

    // Upsert (Insert or Update) ke tabel user_answers
    // Jika user refresh dan jawab ulang soal yg sama, kita update saja.
    await client.query(`
      INSERT INTO user_answers (user_id, question_id, answer_id, score_value)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (user_id, question_id) 
      DO UPDATE SET answer_id = EXCLUDED.answer_id, score_value = EXCLUDED.score_value
    `, [userId, questionId, answerId, score]);

    return { success: true };
  } catch (error) {
    console.error('Submit answer error:', error);
    return { success: false };
  } finally {
    client.release();
  }
}

// 4. SELESAI UJIAN
export async function finalizeQuiz(userId: string, testId: string) {
  const client = await pool.connect();
  try {
    await client.query(`
      UPDATE user_test 
      SET test_status = 'COMPLETE', completed_at = NOW()
      WHERE user_test_id = $1 AND user_id = $2
    `, [testId, userId]);

    revalidatePath('/dashboard/profile'); // Update status di halaman profile
    return { success: true };
  } catch (error) {
    console.error('Finalize error:', error);
    return { success: false };
  } finally {
    client.release();
  }
}