import { query } from '@/lib/db'
import { NextResponse } from 'next/server'

// GET: Get freelance shipments (public access for freelance form)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const namaFreelance = searchParams.get('nama_freelance')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    
    let sqlQuery = `
      SELECT 
        submit_id,
        nama_freelance,
        tanggal,
        shipment_id,
        jumlah_toko,
        terkirim,
        gagal,
        alasan,
        created_at
      FROM shipment_data
      WHERE nama_freelance IS NOT NULL 
        AND nama_freelance != ''
    `
    
    const params: any[] = []
    let paramIndex = 1
    
    if (namaFreelance) {
      sqlQuery += ` AND nama_freelance = $${paramIndex}`
      params.push(namaFreelance)
      paramIndex++
    }
    
    if (startDate && endDate) {
      sqlQuery += ` AND tanggal BETWEEN $${paramIndex} AND $${paramIndex + 1}`
      params.push(startDate, endDate)
      paramIndex += 2
    }
    
    sqlQuery += ' ORDER BY tanggal DESC'
    
    const result = await query(sqlQuery, params)
    
    return NextResponse.json({ shipments: result.rows })
    
  } catch (error) {
    console.error('Error fetching freelance shipments:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST: Create freelance shipment (public access)
export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    // Generate submit_id (using timestamp for uniqueness)
    const submitId = Date.now()
    
    const result = await query(
      `INSERT INTO shipment_data (
        submit_id, nama_freelance, tanggal, 
        shipment_id, jumlah_toko, terkirim, gagal, alasan
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *`,
      [
        submitId,
        body.nama_freelance,
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
    console.error('Error creating freelance shipment:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}