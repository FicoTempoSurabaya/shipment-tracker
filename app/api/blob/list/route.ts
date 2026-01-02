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
    
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')
    
    const result = await query(
      `SELECT 
        image_id,
        image_url,
        image_name,
        uploaded_by,
        created_at
       FROM image_data
       ORDER BY created_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    )
    
    const countResult = await query('SELECT COUNT(*) FROM image_data')
    
    return NextResponse.json({
      images: result.rows,
      total: parseInt(countResult.rows[0].count),
      limit,
      offset
    })
    
  } catch (error) {
    console.error('Error listing files:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}