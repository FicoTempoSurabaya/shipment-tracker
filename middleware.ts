import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value
  
  // Public routes
  const publicPaths = ['/', '/api/auth/login']
  const isPublicPath = publicPaths.includes(request.nextUrl.pathname)
  
  // Jika tidak ada token dan bukan route public, redirect ke login
  if (!token && !isPublicPath) {
    return NextResponse.redirect(new URL('/', request.url))
  }
  
  // Jika sudah login tapi akses root, redirect ke dashboard sesuai role
  if (token && request.nextUrl.pathname === '/') {
    // Decode token sederhana untuk cek role
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      if (payload.role === 'admin') {
        return NextResponse.redirect(new URL('/admin/dashboard', request.url))
      } else {
        return NextResponse.redirect(new URL('/regular/dashboard', request.url))
      }
    } catch {
      // Token invalid, hapus cookie
      const response = NextResponse.redirect(new URL('/', request.url))
      response.cookies.delete('auth-token')
      return response
    }
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api/auth/login|_next/static|_next/image|favicon.ico).*)',
  ],
}