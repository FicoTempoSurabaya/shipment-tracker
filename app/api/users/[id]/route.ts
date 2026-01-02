import { query } from '@/lib/db'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('auth-token')?.value
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const tokenData = JSON.parse(Buffer.from(token, 'base64').toString())
    const userId = params.id
    
    // Regular users can only view their own profile
    if (tokenData.role === 'regular' && tokenData.userId !== userId) {
      return NextResponse.json(
        { error: 'Forbidden: You can only view your own profile' },
        { status: 403 }
      )
    }
    
    const result = await query(
      `SELECT 
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
        created_at,
        updated_at
      FROM users_data 
      WHERE user_id = $1`,
      [userId]
    )
    
    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }
    
    // Get shipment performance for this user
    const performance = await query(
      `SELECT 
        COUNT(*) as total_shipments,
        SUM(jumlah_toko) as total_hk,
        SUM(terkirim) as total_hke,
        SUM(gagal) as total_hkne
      FROM shipment_data 
      WHERE user_id = $1`,
      [userId]
    )
    
    const userData = result.rows[0]
    const performanceData = performance.rows[0]
    
    return NextResponse.json({
      user: userData,
      performance: {
        total_shipments: parseInt(performanceData.total_shipments) || 0,
        total_hk: parseInt(performanceData.total_hk) || 0,
        total_hke: parseInt(performanceData.total_hke) || 0,
        total_hkne: parseInt(performanceData.total_hkne) || 0
      }
    })
    
  } catch (error) {
    console.error('Error fetching user:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('auth-token')?.value
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const tokenData = JSON.parse(Buffer.from(token, 'base64').toString())
    const userId = params.id
    
    // Regular users can only update their own profile
    if (tokenData.role === 'regular' && tokenData.userId !== userId) {
      return NextResponse.json(
        { error: 'Forbidden: You can only update your own profile' },
        { status: 403 }
      )
    }
    
    const body = await request.json()
    
    // Build dynamic update query
    const updates: string[] = []
    const values: any[] = []
    let valueIndex = 1
    
    // Add fields to update
    const fields = [
      'username', 'password', 'user_role_as', 'nama_lengkap',
      'tempat_lahir', 'tanggal_lahir', 'alamat', 'no_telp',
      'email', 'license_type', 'license_id', 'masa_berlaku',
      'jenis_unit', 'nopol'
    ]
    
    fields.forEach(field => {
      if (body[field] !== undefined) {
        updates.push(`${field} = $${valueIndex}`)
        values.push(body[field])
        valueIndex++
      }
    })
    
    if (updates.length === 0) {
      return NextResponse.json(
        { error: 'No fields to update' },
        { status: 400 }
      )
    }
    
    updates.push('updated_at = CURRENT_TIMESTAMP')
    values.push(userId)
    
    const sqlQuery = `
      UPDATE users_data 
      SET ${updates.join(', ')}
      WHERE user_id = $${valueIndex}
      RETURNING *
    `
    
    const result = await query(sqlQuery, values)
    
    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      success: true,
      user: result.rows[0]
    })
    
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('auth-token')?.value
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const tokenData = JSON.parse(Buffer.from(token, 'base64').toString())
    const userId = params.id
    
    // Hanya admin yang bisa menghapus user
    if (tokenData.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden: Admin only' },
        { status: 403 }
      )
    }
    
    // Cek jika user mencoba menghapus diri sendiri
    if (tokenData.userId === userId) {
      return NextResponse.json(
        { error: 'Cannot delete your own account' },
        { status: 400 }
      )
    }
    
    const result = await query(
      'DELETE FROM users_data WHERE user_id = $1 RETURNING user_id',
      [userId]
    )
    
    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      success: true,
      message: `User ${userId} deleted successfully`
    })
    
  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}