import { NextRequest, NextResponse } from 'next/server'

const PROTECTED = ['/conta', '/admin']
const ADMIN_ONLY = ['/admin']

// Decodifica o payload do JWT (sem verificar assinatura) só para gate de UI.
// A autorização real é feita no backend em cada chamada de API.
function isAdmin(token: string): boolean {
  try {
    const payload = token.split('.')[1]
    const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'))
    const claims = JSON.parse(json) as { permissoes?: string[] }
    return Array.isArray(claims.permissoes) && claims.permissoes.includes('ADMIN_FULL')
  } catch {
    return false
  }
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isProtected = PROTECTED.some((p) => pathname.startsWith(p))

  if (!isProtected) return NextResponse.next()

  const token = request.cookies.get('auth-token')?.value
  if (!token) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  const isAdminRoute = ADMIN_ONLY.some((p) => pathname.startsWith(p))
  if (isAdminRoute && !isAdmin(token)) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/conta/:path*', '/admin/:path*'],
}
