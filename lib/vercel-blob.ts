import { put, del } from '@vercel/blob'

const BLOB_READ_WRITE_TOKEN = process.env.BLOB_READ_WRITE_TOKEN

export async function uploadFile(file: File, path: string) {
  if (!BLOB_READ_WRITE_TOKEN) {
    throw new Error('BLOB_READ_WRITE_TOKEN is not set')
  }
  
  const blob = await put(path, file, {
    access: 'public',
    token: BLOB_READ_WRITE_TOKEN,
  })
  
  return blob.url
}

export async function deleteFile(url: string) {
  if (!BLOB_READ_WRITE_TOKEN) {
    throw new Error('BLOB_READ_WRITE_TOKEN is not set')
  }
  
  await del(url, {
    token: BLOB_READ_WRITE_TOKEN,
  })
}