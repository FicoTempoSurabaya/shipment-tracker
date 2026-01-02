import { query } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Check database connection
    const dbResult = await query('SELECT NOW() as time')
    
    // Check environment variables
    const envVars = {
      nodeEnv: process.env.NODE_ENV,
      databaseUrl: process.env.DATABASE_URL ? 'Set' : 'Not set',
      nextauthUrl: process.env.NEXTAUTH_URL ? 'Set' : 'Not set',
    }
    
    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: {
        status: 'connected',
        time: dbResult.rows[0].time
      },
      environment: envVars,
      uptime: process.uptime(),
      memory: process.memoryUsage(),
    })
    
  } catch (error) {
    console.error('Health check failed:', error)
    
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
      uptime: process.uptime(),
    }, { status: 500 })
  }
}