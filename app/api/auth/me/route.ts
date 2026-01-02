import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET() {
  const cookieStore = await cookies()
  const token = cookieStore.get('auth-token')?.value
  
  if (!token) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }
  
  try {
    const tokenData = JSON.parse(Buffer.from(token, 'base64').toString())
    
    // Cek expired
    if (tokenData.exp < Date.now()) {
      cookieStore.delete('auth-token')
      return NextResponse.json({ error: 'Token expired' }, { status: 401 })
    }
    
    return NextResponse.json({ user: tokenData })
  } catch {
    cookieStore.delete('auth-token')
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
  }
}