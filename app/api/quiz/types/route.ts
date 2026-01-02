import { query } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const result = await query(`
      SELECT type_id, type_name 
      FROM question_type 
      ORDER BY type_name
    `)
    
    return NextResponse.json({ types: result.rows })
    
  } catch (error) {
    console.error('Error fetching question types:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}