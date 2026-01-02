import { query } from '@/lib/db'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

// GET: Get freelance costs
export async function GET(request: Request) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('auth-token')?.value
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { searchParams } = new URL(request.url)
    const freelanceName = searchParams.get('nama_freelance')
    const status = searchParams.get('status')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    
    let sqlQuery = `
      SELECT 
        fc.id,
        fc.submit_id,
        fc.user_id,
        fc.nama_lengkap,
        fc.nama_freelance,
        fc.tanggal,
        fc.status_cost,
        fc.bbm,
        fc.dp_awal,
        fc.fee_harian,
        fc.tol,
        fc.parkir,
        fc.tkbm,
        fc.perdinas,
        fc.lain_lain,
        fc.sub_total,
        fc.grand_total,
        fc.created_at,
        sd.shipment_id,
        sd.jumlah_toko,
        sd.terkirim,
        sd.gagal
      FROM freelance_cost fc
      LEFT JOIN shipment_data sd ON fc.submit_id = sd.submit_id
      WHERE 1=1
    `
    
    const params: any[] = []
    let paramIndex = 1
    
    if (freelanceName) {
      sqlQuery += ` AND fc.nama_freelance = $${paramIndex}`
      params.push(freelanceName)
      paramIndex++
    }
    
    if (status) {
      sqlQuery += ` AND fc.status_cost = $${paramIndex}`
      params.push(status)
      paramIndex++
    }
    
    if (startDate && endDate) {
      sqlQuery += ` AND fc.tanggal BETWEEN $${paramIndex} AND $${paramIndex + 1}`
      params.push(startDate, endDate)
      paramIndex += 2
    }
    
    sqlQuery += ' ORDER BY fc.tanggal DESC, fc.created_at DESC'
    
    const result = await query(sqlQuery, params)
    
    return NextResponse.json({ costs: result.rows })
    
  } catch (error) {
    console.error('Error fetching freelance costs:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST: Create freelance cost
export async function POST(request: Request) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('auth-token')?.value
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const tokenData = JSON.parse(Buffer.from(token, 'base64').toString())
    
    const body = await request.json()
    
    // Get user info
    const userResult = await query(
      'SELECT user_id, nama_lengkap FROM users_data WHERE user_id = $1',
      [tokenData.userId]
    )
    
    const user = userResult.rows[0]
    
    const result = await query(
      `INSERT INTO freelance_cost (
        submit_id, user_id, nama_lengkap, nama_freelance, tanggal,
        status_cost, bbm, dp_awal, fee_harian, tol, parkir,
        tkbm, perdinas, lain_lain, sub_total, grand_total
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
      RETURNING *`,
      [
        body.submit_id,
        user.user_id,
        user.nama_lengkap,
        body.nama_freelance,
        body.tanggal,
        body.status_cost,
        body.bbm || 0,
        body.dp_awal || 0,
        body.fee_harian || 0,
        body.tol || 0,
        body.parkir || 0,
        body.tkbm || 0,
        body.perdinas || 0,
        body.lain_lain || 0,
        body.sub_total || 0,
        body.grand_total || 0
      ]
    )
    
    return NextResponse.json({
      success: true,
      cost: result.rows[0]
    })
    
  } catch (error) {
    console.error('Error creating freelance cost:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT: Update freelance cost status
export async function PUT(request: Request) {
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
    const { id, status_cost } = body
    
    const result = await query(
      `UPDATE freelance_cost 
       SET status_cost = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING *`,
      [status_cost, id]
    )
    
    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Freelance cost not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      success: true,
      cost: result.rows[0]
    })
    
  } catch (error) {
    console.error('Error updating freelance cost:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}