import { query } from '@/lib/db'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

// Mapping untuk question types
const questionTypeMapping: Record<string, string> = {
  'multiple_choice': 'MC',
  'image_choice': 'IC', 
  'likert': 'LKT',
  'table_choice': 'TC',
  'yes_no': 'YNC'
}

const reverseQuestionTypeMapping: Record<string, string> = {
  'MC': 'multiple_choice',
  'IC': 'image_choice', 
  'LKT': 'likert',
  'TC': 'table_choice',
  'YNC': 'yes_no'
}

// GET: Get all questions (admin) or active questions (regular)
export async function GET(request: Request) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('auth-token')?.value
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const tokenData = JSON.parse(Buffer.from(token, 'base64').toString())
    const { searchParams } = new URL(request.url)
    
    if (tokenData.role === 'admin') {
      // Admin: Get all questions with answers and categories
      const questions = await query(`
        SELECT 
          ql.question_id,
          ql.question_text,
          ql.question_image_url,
          ql.type_id,
          qt.type_name,
          ql.is_scored,
          ql.created_at,
          ql.updated_at,
          (
            SELECT json_agg(
              json_build_object(
                'answer_id', qa.answer_id,
                'answer_text', qa.answer_text,
                'is_correct', qa.is_correct,
                'score_value', qa.score_value,
                'sort_order', qa.sort_order
              ) ORDER BY qa.sort_order
            )
            FROM question_answer qa
            WHERE qa.question_id = ql.question_id
          ) as answers,
          (
            SELECT json_agg(
              json_build_object(
                'category_id', qc.category_id,
                'category_label', qc.category_label
              )
            )
            FROM question_category_map qcm
            JOIN question_category qc ON qcm.category_id = qc.category_id
            WHERE qcm.question_id = ql.question_id
          ) as categories
        FROM question_list ql
        JOIN question_type qt ON ql.type_id = qt.type_id
        ORDER BY ql.created_at DESC
      `)
      
      // Map type_id untuk frontend
      const mappedQuestions = questions.rows.map(question => ({
        ...question,
        type_id: reverseQuestionTypeMapping[question.type_id] || question.type_id
      }))
      
      return NextResponse.json({ questions: mappedQuestions })
      
    } else {
      // Regular user: Get active test or create new one
      const userId = tokenData.userId
      
      // Check if user has active test
      const activeTest = await query(`
        SELECT * FROM user_test 
        WHERE user_id = $1 AND test_status IN ('START', 'PROCESS')
        ORDER BY created_at DESC LIMIT 1
      `, [userId])
      
      let testData
      
      if (activeTest.rows.length === 0) {
        // Create new test
        const testId = `test_${Date.now()}_${userId}`
        
        await query(`
          INSERT INTO user_test (
            user_test_id, user_id, nama_lengkap, test_id,
            test_status, reset_by_admin
          ) VALUES ($1, $2, $3, $4, 'START', false)
        `, [testId, userId, tokenData.namaLengkap, testId])
        
        // Get random questions for the test (limit 20 questions)
        const questions = await query(`
          SELECT 
            ql.question_id,
            ql.question_text,
            ql.question_image_url,
            ql.type_id,
            qt.type_name,
            ql.is_scored,
            (
              SELECT json_agg(
                json_build_object(
                  'answer_id', qa.answer_id,
                  'answer_text', qa.answer_text,
                  'sort_order', qa.sort_order
                ) ORDER BY qa.sort_order
              )
              FROM question_answer qa
              WHERE qa.question_id = ql.question_id
            ) as answers
          FROM question_list ql
          JOIN question_type qt ON ql.type_id = qt.type_id
          WHERE ql.is_scored = true
          ORDER BY RANDOM()
          LIMIT 20
        `)
        
        // Map type_id untuk frontend
        const mappedQuestions = questions.rows.map(question => ({
          ...question,
          type_id: reverseQuestionTypeMapping[question.type_id] || question.type_id
        }))
        
        testData = {
          test_id: testId,
          questions: mappedQuestions,
          started_at: new Date().toISOString()
        }
      } else {
        // Get questions for existing test
        const testId = activeTest.rows[0].test_id
        
        const questions = await query(`
          SELECT 
            ql.question_id,
            ql.question_text,
            ql.question_image_url,
            ql.type_id,
            qt.type_name,
            ql.is_scored,
            (
              SELECT json_agg(
                json_build_object(
                  'answer_id', qa.answer_id,
                  'answer_text', qa.answer_text,
                  'sort_order', qa.sort_order
                ) ORDER BY qa.sort_order
              )
              FROM question_answer qa
              WHERE qa.question_id = ql.question_id
            ) as answers,
            (
              SELECT answer_id 
              FROM user_answers 
              WHERE test_id = $1 AND question_id = ql.question_id
              LIMIT 1
            ) as user_answer_id
          FROM question_list ql
          JOIN question_type qt ON ql.type_id = qt.type_id
          WHERE ql.question_id IN (
            SELECT question_id FROM user_answers 
            WHERE test_id = $1
            UNION
            SELECT question_id FROM question_list 
            WHERE is_scored = true 
            ORDER BY RANDOM() 
            LIMIT 20
          )
        `, [testId])
        
        // Map type_id untuk frontend
        const mappedQuestions = questions.rows.map(question => ({
          ...question,
          type_id: reverseQuestionTypeMapping[question.type_id] || question.type_id
        }))
        
        testData = {
          test_id: testId,
          questions: mappedQuestions,
          started_at: activeTest.rows[0].started_at
        }
      }
      
      return NextResponse.json(testData)
    }
    
  } catch (error) {
    console.error('Error in quiz API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST: Submit quiz answers
export async function POST(request: Request) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('auth-token')?.value
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const tokenData = JSON.parse(Buffer.from(token, 'base64').toString())
    const body = await request.json()
    
    if (tokenData.role === 'admin') {
      // Admin: Create or update question
      const { question_id, question_text, type_id, is_scored, answers, categories } = body
      
      // Map type_id untuk database
      const dbTypeId = questionTypeMapping[type_id] || type_id
      
      if (question_id) {
        // Update existing question
        await query(
          `UPDATE question_list 
           SET question_text = $1, type_id = $2, is_scored = $3, updated_at = CURRENT_TIMESTAMP
           WHERE question_id = $4`,
          [question_text, dbTypeId, is_scored, question_id]
        )
        
        // Delete existing answers and categories
        await query('DELETE FROM question_answer WHERE question_id = $1', [question_id])
        await query('DELETE FROM question_category_map WHERE question_id = $1', [question_id])
      } else {
        // Create new question
        const newQuestionId = `q_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        
        await query(
          `INSERT INTO question_list (question_id, question_text, type_id, is_scored)
           VALUES ($1, $2, $3, $4)`,
          [newQuestionId, question_text, dbTypeId, is_scored]
        )
        
        body.question_id = newQuestionId
      }
      
      // Insert answers
      if (answers && Array.isArray(answers)) {
        for (const [index, answer] of answers.entries()) {
          const answerId = `a_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
          
          await query(
            `INSERT INTO question_answer 
             (answer_id, question_id, answer_text, is_correct, score_value, sort_order)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [
              answerId,
              body.question_id,
              answer.answer_text,
              answer.is_correct || false,
              answer.score_value || 0,
              index
            ]
          )
        }
      }
      
      // Insert categories
      if (categories && Array.isArray(categories)) {
        for (const category of categories) {
          await query(
            `INSERT INTO question_category_map (question_id, category_id)
             VALUES ($1, $2)
             ON CONFLICT (question_id, category_id) DO NOTHING`,
            [body.question_id, category.category_id]
          )
        }
      }
      
      return NextResponse.json({ 
        success: true, 
        question_id: body.question_id 
      })
      
    } else {
      // Regular user: Submit answers
      const { test_id, answers } = body
      const userId = tokenData.userId
      
      // Verify test belongs to user
      const testCheck = await query(
        'SELECT * FROM user_test WHERE test_id = $1 AND user_id = $2',
        [test_id, userId]
      )
      
      if (testCheck.rows.length === 0) {
        return NextResponse.json(
          { error: 'Test not found or unauthorized' },
          { status: 404 }
        )
      }
      
      // Update test status to PROCESS jika masih START
      if (testCheck.rows[0].test_status === 'START') {
        await query(
          `UPDATE user_test 
           SET test_status = 'PROCESS', started_at = CURRENT_TIMESTAMP
           WHERE test_id = $1 AND user_id = $2`,
          [test_id, userId]
        )
      }
      
      // Save each answer
      for (const answer of answers) {
        await query(
          `INSERT INTO user_answers 
           (test_id, user_id, nama_lengkap, question_id, answer_id)
           VALUES ($1, $2, $3, $4, $5)
           ON CONFLICT (test_id, user_id, question_id) 
           DO UPDATE SET answer_id = $5, updated_at = CURRENT_TIMESTAMP`,
          [
            test_id,
            userId,
            tokenData.namaLengkap,
            answer.question_id,
            answer.answer_id
          ]
        )
      }
      
      return NextResponse.json({ success: true })
    }
    
  } catch (error) {
    console.error('Error in quiz API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE: Delete a question
export async function DELETE(request: Request) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('auth-token')?.value
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const tokenData = JSON.parse(Buffer.from(token, 'base64').toString())
    
    if (tokenData.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden: Admin only' },
        { status: 403 }
      )
    }
    
    const { searchParams } = new URL(request.url)
    const questionId = searchParams.get('questionId')
    
    if (!questionId) {
      return NextResponse.json(
        { error: 'questionId is required' },
        { status: 400 }
      )
    }
    
    // Delete question and related data
    await query('DELETE FROM question_answer WHERE question_id = $1', [questionId])
    await query('DELETE FROM question_category_map WHERE question_id = $1', [questionId])
    await query('DELETE FROM question_list WHERE question_id = $1', [questionId])
    
    return NextResponse.json({ 
      success: true,
      message: 'Question deleted successfully'
    })
    
  } catch (error) {
    console.error('Error deleting question:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}