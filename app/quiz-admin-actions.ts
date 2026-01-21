'use server';

import pool from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { randomUUID } from 'crypto';

// --- 1. GET REFERENCE DATA (Untuk Dropdown Tipe & Checkbox Kategori) ---
export async function getQuizReferenceData() {
  const client = await pool.connect();
  try {
    const typesRes = await client.query('SELECT * FROM question_type ORDER BY type_id');
    const categoriesRes = await client.query('SELECT * FROM question_category ORDER BY category_label');
    
    return {
      types: typesRes.rows as { type_id: string; type_name: string }[],
      categories: categoriesRes.rows as { category_id: string; category_label: string }[]
    };
  } finally {
    client.release();
  }
}

// --- 2. GET ALL QUESTIONS (Untuk Tabel Dashboard Admin) ---
export async function getAllQuestions() {
  const client = await pool.connect();
  try {
    // Mengambil data soal + nama tipe + jumlah kategori yang terhubung
    const query = `
      SELECT q.*, 
             qt.type_name,
             (SELECT COUNT(*) FROM question_category_map qcm WHERE qcm.question_id = q.question_id) as category_count
      FROM question_list q
      LEFT JOIN question_type qt ON q.type_id = qt.type_id
      ORDER BY q.question_id DESC
    `;
    const res = await client.query(query);
    return res.rows;
  } catch (error) {
    console.error('Error fetching questions:', error);
    return [];
  } finally {
    client.release();
  }
}

// --- 3. GET SINGLE QUESTION DETAIL (Untuk Halaman Edit) ---
export async function getQuestionDetail(questionId: string) {
  const client = await pool.connect();
  try {
    // A. Ambil Data Utama Soal
    const qRes = await client.query('SELECT * FROM question_list WHERE question_id = $1', [questionId]);
    if (qRes.rowCount === 0) return null;
    const question = qRes.rows[0];

    // B. Ambil Jawaban (Urutkan sesuai sort_order)
    const aRes = await client.query('SELECT * FROM question_answer WHERE question_id = $1 ORDER BY sort_order ASC', [questionId]);
    
    // C. Ambil Kategori yang terpilih
    const cRes = await client.query(`
      SELECT qc.* FROM question_category_map qcm
      JOIN question_category qc ON qcm.category_id = qc.category_id
      WHERE qcm.question_id = $1
    `, [questionId]);

    return {
      ...question,
      answers: aRes.rows,
      categories: cRes.rows
    };
  } finally {
    client.release();
  }
}

// --- 4. CREATE / UPDATE QUESTION (Inti Fitur Simpan) ---
export async function saveQuestion(formData: {
  question_id?: string; // Jika ada = Edit, Kosong = Baru
  question_text: string;
  question_image_url?: string;
  type_id: string;
  is_scored: boolean;
  category_ids: string[]; // Array ID kategori yang dicentang
  answers: {
    answer_text: string;
    is_correct: boolean;
    score_value: number;
    sort_order: number;
  }[];
}) {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN'); // Mulai Transaksi Database

    let qId = formData.question_id;

    // A. INSERT / UPDATE HEADER SOAL
    if (qId) {
      // --- MODE EDIT ---
      await client.query(`
        UPDATE question_list 
        SET question_text = $1, question_image_url = $2, type_id = $3, is_scored = $4
        WHERE question_id = $5
      `, [formData.question_text, formData.question_image_url, formData.type_id, formData.is_scored, qId]);
      
      // Hapus data relasi lama agar bersih (cara paling aman untuk update one-to-many & many-to-many)
      await client.query('DELETE FROM question_category_map WHERE question_id = $1', [qId]);
      await client.query('DELETE FROM question_answer WHERE question_id = $1', [qId]);

    } else {
      // --- MODE BARU ---
      qId = randomUUID(); // Generate ID unik
      await client.query(`
        INSERT INTO question_list (question_id, question_text, question_image_url, type_id, is_scored)
        VALUES ($1, $2, $3, $4, $5)
      `, [qId, formData.question_text, formData.question_image_url, formData.type_id, formData.is_scored]);
    }

    // B. INSERT KATEGORI (MAPPING)
    if (formData.category_ids && formData.category_ids.length > 0) {
      for (const catId of formData.category_ids) {
        await client.query(`
          INSERT INTO question_category_map (question_id, category_id)
          VALUES ($1, $2)
        `, [qId, catId]);
      }
    }

    // C. INSERT JAWABAN
    if (formData.answers && formData.answers.length > 0) {
      for (const ans of formData.answers) {
        const ansId = randomUUID();
        await client.query(`
          INSERT INTO question_answer (answer_id, question_id, answer_text, is_correct, score_value, sort_order)
          VALUES ($1, $2, $3, $4, $5, $6)
        `, [ansId, qId, ans.answer_text, ans.is_correct, ans.score_value, ans.sort_order]);
      }
    }

    await client.query('COMMIT'); // Simpan Permanen
    revalidatePath('/dashboard/quiz/admin'); // Refresh halaman admin agar data terbaru muncul
    return { success: true, message: 'Soal berhasil disimpan!' };

  } catch (error) {
    await client.query('ROLLBACK'); // Batalkan semua perubahan jika ada error
    console.error('Failed to save question:', error);
    return { success: false, message: 'Gagal menyimpan soal.' };
  } finally {
    client.release();
  }
}

// --- 5. DELETE QUESTION ---
export async function deleteQuestion(questionId: string) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    // Hapus anak-anaknya dulu (Constraint Foreign Key)
    await client.query('DELETE FROM question_category_map WHERE question_id = $1', [questionId]);
    await client.query('DELETE FROM question_answer WHERE question_id = $1', [questionId]);
    // Hapus induk
    await client.query('DELETE FROM question_list WHERE question_id = $1', [questionId]);
    
    await client.query('COMMIT');
    revalidatePath('/dashboard/quiz/admin');
    return { success: true };
  } catch (_error) {
    console.error('Delete error:', _error);
    await client.query('ROLLBACK');
    return { success: false, error: 'Gagal menghapus soal' };
  } finally {
    client.release();
  }
}

// --- 6. GET DASHBOARD STATISTICS (Untuk Kartu di Halaman Admin) ---
export async function getAdminDashboardStats() {
  const client = await pool.connect();
  try {
    // 1. Total User Regular
    const totalUserRes = await client.query(
      "SELECT COUNT(*) FROM users_data WHERE user_role_as = 'regular'"
    );
    const totalUsers = parseInt(totalUserRes.rows[0].count);

    // 2. User yang Sudah Ikut Tes (Status COMPLETE)
    const takenRes = await client.query(
      "SELECT COUNT(DISTINCT user_id) FROM user_test WHERE test_status = 'COMPLETE'"
    );
    const takenCount = parseInt(takenRes.rows[0].count);

    // 3. Rata-rata Skor
    // Logic: Jumlahkan skor per user, lalu rata-ratakan total skor tersebut
    const avgRes = await client.query(`
      WITH UserScores AS (
        SELECT 
          user_id, 
          SUM(score_value) as total_score
        FROM user_answers
        GROUP BY user_id
      )
      SELECT AVG(total_score) as avg_score FROM UserScores
    `);
    
    // Safety check jika null (belum ada yang tes), default ke 0
    const avgScore = Math.round(parseFloat(avgRes.rows[0]?.avg_score || '0'));

    return {
      totalUsers,
      takenCount,
      notTakenCount: totalUsers - takenCount,
      avgScore
    };
  } catch (error) {
    console.error('Stats error:', error);
    return { totalUsers: 0, takenCount: 0, notTakenCount: 0, avgScore: 0 };
  } finally {
    client.release();
  }
}

// Ambil daftar user yang sudah selesai (COMPLETE)
export async function getParticipatedUsers() {
  const client = await pool.connect();
  try {
    const res = await client.query(`
      SELECT u.user_id, u.nama_lengkap, u.email, u.no_telp, t.user_test_id,
             (SELECT SUM(score_value) FROM user_answers WHERE user_id = u.user_id) as total_score
      FROM users_data u
      JOIN user_test t ON u.user_id = t.user_id
      WHERE t.test_status = 'COMPLETE' AND u.user_role_as = 'regular'
      ORDER BY t.completed_at DESC
    `);
    return res.rows;
  } finally {
    client.release();
  }
}

// Ambil daftar user yang belum ikut tes
export async function getPendingUsers() {
  const client = await pool.connect();
  try {
    const res = await client.query(`
      SELECT user_id, nama_lengkap, email, no_telp 
      FROM users_data 
      WHERE user_role_as = 'regular' 
      AND user_id NOT IN (SELECT user_id FROM user_test WHERE test_status = 'COMPLETE')
    `);
    return res.rows;
  } finally {
    client.release();
  }
}

// Ambil jumlah pertanyaan berdasarkan jenis
export async function getQuestionCountByType() {
  const client = await pool.connect();
  try {
    const res = await client.query(`
      SELECT qt.type_name, COUNT(q.question_id) as total
      FROM question_type qt
      LEFT JOIN question_list q ON qt.type_id = q.type_id
      GROUP BY qt.type_name
    `);
    return res.rows;
  } finally {
    client.release();
  }
}