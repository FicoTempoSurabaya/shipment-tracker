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
    const role = searchParams.get('role')
    
    let sqlQuery = `
      SELECT 
        user_id,
        username,
        user_role_as,
        nama_lengkap,
        tempat_lahir,
        tanggal_lahir,
        alamat,
        no_telp,
        email,
        license_type,
        license_id,
        masa_berlaku,
        jenis_unit,
        nopol,
        created_at
      FROM users_data
      WHERE 1=1
    `
    
    const params: any[] = []
    
    // Filter berdasarkan role (admin bisa lihat semua, regular hanya bisa lihat sendiri)
    if (tokenData.role === 'regular') {
      sqlQuery += ' AND user_id = $1'
      params.push(tokenData.userId)
    } else if (role) {
      sqlQuery += ' AND user_role_as = $1'
      params.push(role)
    }
    
    sqlQuery += ' ORDER BY user_role_as DESC, nama_lengkap ASC'
    
    const result = await query(sqlQuery, params)
    
    return NextResponse.json({ users: result.rows })
    
  } catch (error) {
    console.error('Error fetching users:', error)
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
    
    // Hanya admin yang bisa membuat user baru
    if (tokenData.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden: Admin only' },
        { status: 403 }
      )
    }
    
    const body = await request.json()
    
    // Check if username already exists
    const existingUser = await query(
      'SELECT user_id FROM users_data WHERE username = $1 OR user_id = $2',
      [body.username, body.user_id]
    )
    
    if (existingUser.rows.length > 0) {
      return NextResponse.json(
        { error: 'Username atau User ID sudah terdaftar' },
        { status: 400 }
      )
    }
    
    // Insert new user
    const result = await query(
      `INSERT INTO users_data (
        user_id, username, password, user_role_as,
        nama_lengkap, tempat_lahir, tanggal_lahir, alamat,
        no_telp, email, license_type, license_id,
        masa_berlaku, jenis_unit, nopol
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
        $11, $12, $13, $14, $15
      ) RETURNING *`,
      [
        body.user_id,
        body.username,
        body.password, // Disimpan sebagai plain text sesuai SSoT
        body.user_role_as || 'regular',
        body.nama_lengkap,
        body.tempat_lahir || null,
        body.tanggal_lahir,
        body.alamat || null,
        body.no_telp || null,
        body.email || null,
        body.license_type,
        body.license_id,
        body.masa_berlaku,
        body.jenis_unit || null,
        body.nopol || null
      ]
    )
    
    return NextResponse.json({
      success: true,
      user: result.rows[0]
    })
    
  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}