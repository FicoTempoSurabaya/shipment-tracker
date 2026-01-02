import { query } from '@/lib/db'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('auth-token')?.value
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const tokenData = JSON.parse(Buffer.from(token, 'base64').toString())
    const { test_id } = await request.json()
    
    if (tokenData.role !== 'regular') {
      return NextResponse.json(
        { error: 'Forbidden: Regular users only' },
        { status: 403 }
      )
    }
    
    // Calculate score
    const scoreResult = await query(`
      SELECT 
        COUNT(*) as total_questions,
        SUM(CASE WHEN qa.is_correct THEN qa.score_value ELSE 0 END) as total_score,
        SUM(qa.score_value) as max_score
      FROM user_answers ua
      LEFT JOIN question_answer qa ON ua.answer_id = qa.answer_id
      WHERE ua.test_id = $1 AND ua.user_id = $2
    `, [test_id, tokenData.userId])
    
    const scoreData = scoreResult.rows[0]
    const totalScore = parseInt(scoreData.total_score) || 0
    const maxScore = parseInt(scoreData.max_score) || 100
    const percentage = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0
    
    // Update test status
    await query(`
      UPDATE user_test 
      SET test_status = 'completed', completed_at = CURRENT_TIMESTAMP
      WHERE test_id = $1 AND user_id = $2
    `, [test_id, tokenData.userId])
    
    return NextResponse.json({
      success: true,
      score: {
        total_score: totalScore,
        max_score: maxScore,
        percentage: percentage,
        total_questions: parseInt(scoreData.total_questions) || 0
      }
    })
    
  } catch (error) {
    console.error('Error submitting quiz:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}