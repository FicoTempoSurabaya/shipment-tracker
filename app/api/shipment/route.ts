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
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const userId = searchParams.get('userId')
    
    let sqlQuery = `
      SELECT 
        submit_id,
        user_id,
        nama_lengkap,
        nama_freelance,
        tanggal,
        shipment_id,
        jumlah_toko,
        terkirim,
        gagal,
        alasan,
        created_at
      FROM shipment_data
      WHERE 1=1
    `
    
    const params: any[] = []
    let paramIndex = 1
    
    if (startDate && endDate) {
      sqlQuery += ` AND tanggal BETWEEN $${paramIndex} AND $${paramIndex + 1}`
      params.push(startDate, endDate)
      paramIndex += 2
    }
    
    if (userId) {
      sqlQuery += ` AND user_id = $${paramIndex}`
      params.push(userId)
    }
    
    sqlQuery += ' ORDER BY tanggal DESC, created_at DESC'
    
    const result = await query(sqlQuery, params)
    
    // Calculate totals for dashboard
    const totals = await query(`
      SELECT 
        COALESCE(SUM(jumlah_toko), 0) as total_hk,
        COALESCE(SUM(terkirim), 0) as total_hke,
        COALESCE(SUM(gagal), 0) as total_hkne
      FROM shipment_data
      ${startDate && endDate ? 'WHERE tanggal BETWEEN $1 AND $2' : ''}
    `, startDate && endDate ? [startDate, endDate] : [])
    
    // Chart data (group by date)
    const chartData = await query(`
      SELECT 
        tanggal as date,
        SUM(jumlah_toko) as hk,
        SUM(terkirim) as hke,
        SUM(gagal) as hkne
      FROM shipment_data
      ${startDate && endDate ? 'WHERE tanggal BETWEEN $1 AND $2' : ''}
      GROUP BY tanggal
      ORDER BY tanggal
    `, startDate && endDate ? [startDate, endDate] : [])
    
    // Performance by user
    const performanceData = await query(`
      SELECT 
        nama_lengkap as name,
        SUM(jumlah_toko) as total,
        SUM(terkirim) as success,
        SUM(gagal) as failed
      FROM shipment_data
      ${startDate && endDate ? 'WHERE tanggal BETWEEN $1 AND $2' : ''}
      GROUP BY nama_lengkap
      ORDER BY SUM(terkirim) DESC
      LIMIT 10
    `, startDate && endDate ? [startDate, endDate] : [])
    
    return NextResponse.json({
      shipments: result.rows,
      totals: totals.rows[0],
      chartData: chartData.rows,
      performanceData: performanceData.rows
    })
    
  } catch (error) {
    console.error('Error fetching shipments:', error)
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
    
    const body = await request.json()
    
    const result = await query(
      `INSERT INTO shipment_data (
        user_id, nama_lengkap, nama_freelance, tanggal, 
        shipment_id, jumlah_toko, terkirim, gagal, alasan
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *`,
      [
        tokenData.userId,
        body.nama_lengkap,
        body.nama_freelance || null,
        body.tanggal,
        body.shipment_id,
        body.jumlah_toko,
        body.terkirim,
        body.gagal,
        body.alasan || null
      ]
    )
    
    return NextResponse.json({
      success: true,
      shipment: result.rows[0]
    })
    
  } catch (error) {
    console.error('Error creating shipment:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}