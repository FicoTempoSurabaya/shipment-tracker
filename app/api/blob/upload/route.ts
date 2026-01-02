import { uploadFile } from '@/lib/vercel-blob'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('auth-token')?.value
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const formData = await request.formData()
    const file = formData.get('file') as File
    const type = formData.get('type') as string || 'general'
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }
    
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'File type not allowed. Only images are allowed.' },
        { status: 400 }
      )
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 5MB.' },
        { status: 400 }
      )
    }
    
    // Generate unique filename
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(7)
    const extension = file.name.split('.').pop()
    const filename = `${type}_${timestamp}_${randomString}.${extension}`
    
    // Upload to Vercel Blob
    const url = await uploadFile(file, `uploads/${filename}`)
    
    // Save to database
    const tokenData = JSON.parse(Buffer.from(token, 'base64').toString())
    
    const { query } = await import('@/lib/db')
    const result = await query(
      `INSERT INTO image_data (image_id, image_url, image_name, uploaded_by)
       VALUES (gen_random_uuid(), $1, $2, $3)
       RETURNING *`,
      [url, file.name, tokenData.userId]
    )
    
    return NextResponse.json({
      success: true,
      url,
      filename: file.name,
      imageId: result.rows[0].image_id
    })
    
  } catch (error) {
    console.error('Error uploading file:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}