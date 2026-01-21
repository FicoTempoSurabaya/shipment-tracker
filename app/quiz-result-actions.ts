'use server';

import pool from '@/lib/db';

export interface RadarDataPoint {
  category: string;
  score: number;
  fullMark: number;
}

export async function getQuizResultData(userId: string) {
  const client = await pool.connect();
  try {
    const testRes = await client.query(
      `SELECT * FROM user_test WHERE user_id = $1 AND test_status = 'COMPLETE' ORDER BY completed_at DESC LIMIT 1`,
      [userId]
    );
    
    if (testRes.rowCount === 0) return null;
    const testData = testRes.rows[0];

    const rawData = await client.query(`
      SELECT 
        qa.score_value as user_score,
        qcm.category_id,
        qc.category_label,
        (SELECT MAX(score_value) FROM question_answer WHERE question_id = qa.question_id) as max_possible_score
      FROM user_answers ua
      JOIN question_answer qa ON ua.answer_id = qa.answer_id
      JOIN question_category_map qcm ON ua.question_id = qcm.question_id
      JOIN question_category qc ON qcm.category_id = qc.category_id
      WHERE ua.user_id = $1
    `, [userId]);

    const categoryStats: Record<string, { current: number; max: number; label: string }> = {};
    
    // HAPUS variabel totalUserScore & totalMaxScore yang tidak terpakai

    rawData.rows.forEach(row => {
      const catId = row.category_id;
      
      if (!categoryStats[catId]) {
        categoryStats[catId] = { current: 0, max: 0, label: row.category_label };
      }

      categoryStats[catId].current += row.user_score;
      categoryStats[catId].max += row.max_possible_score;
    });

    const radarChartData: RadarDataPoint[] = Object.values(categoryStats).map(stat => ({
      category: stat.label.toUpperCase(),
      score: stat.max > 0 ? Math.round((stat.current / stat.max) * 100) : 0, // Safety check
      fullMark: 100
    }));

    const finalScore = radarChartData.length > 0 
      ? Math.round(radarChartData.reduce((acc, curr) => acc + curr.score, 0) / radarChartData.length)
      : 0;

    return {
      testDate: testData.completed_at,
      finalScore,
      radarData: radarChartData,
      summary: generateSummary(finalScore)
    };

  } finally {
    client.release();
  }
}

function generateSummary(score: number) {
  if (score >= 90) return "Luar Biasa! Anda memiliki kompetensi sangat tinggi.";
  if (score >= 75) return "Kompeten. Pertahankan kinerja Anda.";
  if (score >= 60) return "Cukup Baik, namun perlu peningkatan di beberapa aspek.";
  return "Perlu Perhatian Khusus. Disarankan mengikuti pelatihan ulang.";
}