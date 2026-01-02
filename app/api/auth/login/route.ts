import { query } from '@/lib/db'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json()
    
    // Query ke database - password tanpa hash (sesuai SSoT)
    const result = await query(
      `SELECT user_id, username, user_role_as, nama_lengkap 
       FROM users_data 
       WHERE username = $1 AND password = $2`,
      [username, password]
    )
    
    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Username atau password salah' },
        { status: 401 }
      )
    }
    
    const user = result.rows[0]
    
    // Buat token sederhana (bukan JWT standard, hanya untuk demo)
    const tokenData = {
      userId: user.user_id,
      username: user.username,
      role: user.user_role_as,
      namaLengkap: user.nama_lengkap,
      exp: Date.now() + 24 * 60 * 60 * 1000 // 24 jam
    }
    
    const token = Buffer.from(JSON.stringify(tokenData)).toString('base64')
    
    // Set cookie
    const cookieStore = await cookies()
    cookieStore.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60, // 24 jam
      path: '/',
    })
    
    return NextResponse.json({
      success: true,
      user: {
        id: user.user_id,
        username: user.username,
        role: user.user_role_as,
        namaLengkap: user.nama_lengkap
      }
    })
    
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan pada server' },
      { status: 500 }
    )
  }
}