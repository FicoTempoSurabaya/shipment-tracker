import { query } from '@/lib/db'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

interface Column {
  id: string
  label: string
  type: string
  rowspan?: number
  userId?: string
  freelanceName?: string
  role?: string
}

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('auth-token')?.value
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const tokenData = JSON.parse(Buffer.from(token, 'base64').toString())
    
    // Hanya admin yang bisa akses rekap shipment
    if (tokenData.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden: Admin only' },
        { status: 403 }
      )
    }
    
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    
    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: 'startDate and endDate are required' },
        { status: 400 }
      )
    }
    
    // 1. Get all users (nama_lengkap) ordered by user_id
    const users = await query(`
      SELECT user_id, nama_lengkap, user_role_as 
      FROM users_data 
      WHERE user_role_as = 'regular'
      ORDER BY user_id
    `)
    
    // 2. Get unique freelance names from shipment_data
    const freelances = await query(`
      SELECT DISTINCT nama_freelance 
      FROM shipment_data 
      WHERE nama_freelance IS NOT NULL 
        AND nama_freelance != ''
        AND tanggal BETWEEN $1 AND $2
      ORDER BY nama_freelance
    `, [startDate, endDate])
    
    // 3. Generate date range
    const dateRangeResult = await query(`
      SELECT generate_series(
        $1::date,
        $2::date,
        '1 day'::interval
      )::date as tanggal
    `, [startDate, endDate])
    
    const dates = dateRangeResult.rows.map(row => row.tanggal)
    
    // 4. Get all shipment data for the date range
    const shipments = await query(`
      SELECT 
        tanggal,
        nama_lengkap,
        nama_freelance,
        shipment_id
      FROM shipment_data 
      WHERE tanggal BETWEEN $1 AND $2
      ORDER BY tanggal, nama_lengkap
    `, [startDate, endDate])
    
    // 5. Create the data structure
    const columns: Column[] = [
      { id: 'no', label: 'No.', type: 'index', rowspan: 3 },
      { id: 'tanggal', label: 'Tanggal', type: 'date', rowspan: 3 },
      { id: 'hari', label: 'Hari', type: 'day', rowspan: 3 },
      { id: 'jumlah', label: 'Jumlah', type: 'count', rowspan: 3 }
    ]
    
    // Add user columns
    users.rows.forEach(user => {
      columns.push({
        id: `user_${user.user_id}`,
        label: user.nama_lengkap,
        type: 'user',
        userId: user.user_id,
        role: user.user_role_as,
        rowspan: 1
      })
    })
    
    // Add freelance columns
    freelances.rows.forEach(freelance => {
      columns.push({
        id: `freelance_${freelance.nama_freelance}`,
        label: freelance.nama_freelance,
        type: 'freelance',
        freelanceName: freelance.nama_freelance,
        rowspan: 1
      })
    })
    
    // 6. Prepare table data
    const tableData = dates.map((date, index) => {
      const dayName = new Date(date).toLocaleDateString('id-ID', { weekday: 'long' })
      
      // Count shipments for this date
      const dateShipments = shipments.rows.filter(s => 
        new Date(s.tanggal).toDateString() === new Date(date).toDateString()
      )
      const shipmentCount = dateShipments.length
      
      // Initialize row data
      const rowData: any = {
        no: index + 1,
        tanggal: date,
        hari: dayName,
        jumlah: shipmentCount,
        isSunday: dayName.toLowerCase() === 'minggu'
      }
      
      // Add user shipment data
      users.rows.forEach(user => {
        const userShipments = dateShipments.filter(s => 
          s.nama_freelance === null && 
          s.nama_lengkap === user.nama_lengkap
        )
        
        if (userShipments.length > 0) {
          rowData[`user_${user.user_id}`] = userShipments.map((s: any) => s.shipment_id).join(', ')
        } else {
          rowData[`user_${user.user_id}`] = '-'
        }
      })
      
      // Add freelance shipment data
      freelances.rows.forEach(freelance => {
        const freelanceShipments = dateShipments.filter(s => 
          s.nama_freelance === freelance.nama_freelance
        )
        
        if (freelanceShipments.length > 0) {
          rowData[`freelance_${freelance.nama_freelance}`] = freelanceShipments.map((s: any) => s.shipment_id).join(', ')
        } else {
          rowData[`freelance_${freelance.nama_freelance}`] = '-'
        }
      })
      
      return rowData
    })
    
    // 7. Calculate totals
    const totalRow: any = {
      no: 'TOTAL HK',
      tanggal: '',
      hari: '',
      jumlah: 0
    }
    
    // Calculate total shipment count (exclude Sundays)
    const workingDays = tableData.filter(row => !row.isSunday)
    totalRow.jumlah = workingDays.reduce((sum, row) => sum + row.jumlah, 0)
    
    // Calculate totals for each user
    users.rows.forEach(user => {
      const columnId = `user_${user.user_id}`
      const userTotal = workingDays.reduce((sum, row) => {
        if (row[columnId] && row[columnId] !== '-') {
          // Count comma-separated shipment IDs
          const count = (row[columnId] as string).split(',').filter((id: string) => id.trim()).length
          return sum + count
        }
        return sum
      }, 0)
      totalRow[columnId] = userTotal
    })
    
    // Calculate totals for each freelance
    freelances.rows.forEach(freelance => {
      const columnId = `freelance_${freelance.nama_freelance}`
      const freelanceTotal = workingDays.reduce((sum, row) => {
        if (row[columnId] && row[columnId] !== '-') {
          const count = (row[columnId] as string).split(',').filter((id: string) => id.trim()).length
          return sum + count
        }
        return sum
      }, 0)
      totalRow[columnId] = freelanceTotal
    })
    
    return NextResponse.json({
      columns,
      data: tableData,
      totalRow,
      summary: {
        dateRange: { startDate, endDate },
        totalUsers: users.rows.length,
        totalFreelances: freelances.rows.length,
        totalDays: dates.length,
        workingDays: workingDays.length
      }
    })
    
  } catch (error) {
    console.error('Error fetching rekap shipment:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}