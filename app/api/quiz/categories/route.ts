import { query } from '@/lib/db'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('auth-token')?.value
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const result = await query(`
      SELECT category_id, category_label 
      FROM question_category 
      ORDER BY category_label
    `)
    
    return NextResponse.json({ categories: result.rows })
    
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
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
    
    const body = await request.json()
    const { category_label } = body
    
    const categoryId = `cat_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`
    
    const result = await query(
      `INSERT INTO question_category (category_id, category_label)
       VALUES ($1, $2) RETURNING *`,
      [categoryId, category_label]
    )
    
    return NextResponse.json({ 
      success: true, 
      category: result.rows[0] 
    })
    
  } catch (error) {
    console.error('Error creating category:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}