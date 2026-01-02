import { deleteFile } from '@/lib/vercel-blob'
import { query } from '@/lib/db'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function DELETE(request: Request) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('auth-token')?.value
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { searchParams } = new URL(request.url)
    const imageId = searchParams.get('imageId')
    
    if (!imageId) {
      return NextResponse.json(
        { error: 'imageId is required' },
        { status: 400 }
      )
    }
    
    // Get image URL from database
    const result = await query(
      'SELECT image_url, uploaded_by FROM image_data WHERE image_id = $1',
      [imageId]
    )
    
    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Image not found' },
        { status: 404 }
      )
    }
    
    const imageUrl = result.rows[0].image_url
    const uploadedBy = result.rows[0].uploaded_by
    
    // Check permission
    const tokenData = JSON.parse(Buffer.from(token, 'base64').toString())
    if (tokenData.role !== 'admin' && tokenData.userId !== uploadedBy) {
      return NextResponse.json(
        { error: 'Forbidden: You can only delete your own images' },
        { status: 403 }
      )
    }
    
    // Delete from blob storage
    await deleteFile(imageUrl)
    
    // Delete from database
    await query(
      'DELETE FROM image_data WHERE image_id = $1',
      [imageId]
    )
    
    return NextResponse.json({ success: true })
    
  } catch (error) {
    console.error('Error deleting file:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}