import { query } from '@/lib/db'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('auth-token')?.value
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const tokenData = JSON.parse(Buffer.from(token, 'base64').toString())
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    
    if (tokenData.role === 'admin' && userId) {
      // Admin viewing specific user's results
      const results = await query(`
        SELECT 
          ut.user_test_id,
          ut.test_id,
          ut.user_id,
          ut.nama_lengkap,
          ut.test_status,
          ut.started_at,
          ut.completed_at,
          ut.reset_by_admin,
          (
            SELECT json_agg(
              json_build_object(
                'question_id', ua.question_id,
                'answer_id', ua.answer_id,
                'question_text', ql.question_text,
                'answer_text', qa.answer_text,
                'is_correct', qa.is_correct,
                'score_value', COALESCE(qa.score_value, 0)
              )
            )
            FROM user_answers ua
            LEFT JOIN question_list ql ON ua.question_id = ql.question_id
            LEFT JOIN question_answer qa ON ua.answer_id = qa.answer_id
            WHERE ua.test_id = ut.test_id AND ua.user_id = ut.user_id
          ) as answers,
          (
            SELECT SUM(qa.score_value)
            FROM user_answers ua
            LEFT JOIN question_answer qa ON ua.answer_id = qa.answer_id
            WHERE ua.test_id = ut.test_id 
              AND ua.user_id = ut.user_id 
              AND qa.is_correct = true
          ) as total_score
        FROM user_test ut
        WHERE ut.user_id = $1
        ORDER BY ut.completed_at DESC NULLS LAST, ut.started_at DESC
        LIMIT 10
      `, [userId])
      
      return NextResponse.json({ results: results.rows })
      
    } else if (tokenData.role === 'regular') {
      // Regular user viewing their own results
      const results = await query(`
        SELECT 
          ut.user_test_id,
          ut.test_id,
          ut.test_status,
          ut.started_at,
          ut.completed_at,
          (
            SELECT json_agg(
              json_build_object(
                'question_id', ua.question_id,
                'answer_id', ua.answer_id,
                'question_text', ql.question_text,
                'answer_text', qa.answer_text,
                'is_correct', qa.is_correct,
                'score_value', COALESCE(qa.score_value, 0)
              )
            )
            FROM user_answers ua
            LEFT JOIN question_list ql ON ua.question_id = ql.question_id
            LEFT JOIN question_answer qa ON ua.answer_id = qa.answer_id
            WHERE ua.test_id = ut.test_id AND ua.user_id = $1
          ) as answers,
          (
            SELECT SUM(qa.score_value)
            FROM user_answers ua
            LEFT JOIN question_answer qa ON ua.answer_id = qa.answer_id
            WHERE ua.test_id = ut.test_id 
              AND ua.user_id = $1 
              AND qa.is_correct = true
          ) as total_score
        FROM user_test ut
        WHERE ut.user_id = $1
        ORDER BY ut.completed_at DESC NULLS LAST, ut.started_at DESC
        LIMIT 5
      `, [tokenData.userId])
      
      return NextResponse.json({ results: results.rows })
      
    } else {
      // Admin viewing all results
      const results = await query(`
        SELECT 
          ut.user_test_id,
          ut.test_id,
          ut.user_id,
          ut.nama_lengkap,
          ut.test_status,
          ut.started_at,
          ut.completed_at,
          ud.jenis_unit,
          ud.nopol,
          (
            SELECT COUNT(*)
            FROM user_answers ua
            WHERE ua.test_id = ut.test_id AND ua.user_id = ut.user_id
          ) as total_answered,
          (
            SELECT SUM(qa.score_value)
            FROM user_answers ua
            LEFT JOIN question_answer qa ON ua.answer_id = qa.answer_id
            WHERE ua.test_id = ut.test_id 
              AND ua.user_id = ut.user_id 
              AND qa.is_correct = true
          ) as total_score
        FROM user_test ut
        LEFT JOIN users_data ud ON ut.user_id = ud.user_id
        WHERE ut.test_status = 'completed'
        ORDER BY ut.completed_at DESC
        LIMIT 50
      `)
      
      return NextResponse.json({ results: results.rows })
    }
    
  } catch (error) {
    console.error('Error fetching quiz results:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}