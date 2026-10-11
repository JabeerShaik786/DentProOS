import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const urlEnv = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
  const keyEnv = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 'placeholder'

  const supabase = createServerClient(
    urlEnv,
    keyEnv,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Retrieve authenticated user
  const { data: { user } } = await supabase.auth.getUser()

  const url = request.nextUrl.clone()
  const pathname = url.pathname

  // Auth paths where authenticated staff should be redirected to /dashboard
  const authPaths = ['/login', '/forgot-password', '/reset-password']
  const isAuthPath = authPaths.some(path => pathname === path || pathname.startsWith(`${path}/`))

  // Explicit private/protected clinical workspace routes requiring staff authentication
  const protectedPaths = [
    '/dashboard',
    '/appointments',
    '/patients',
    '/treatments',
    '/billing',
    '/reports',
    '/settings'
  ]
  const isProtectedPath = protectedPaths.some(path => pathname === path || pathname.startsWith(`${path}/`))

  // 1. Redirect unauthenticated user attempting to access private clinical workspace route to /login
  if (!user && isProtectedPath) {
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // 2. Redirect authenticated staff accessing auth pages (/login, /forgot-password, etc.) to /dashboard
  if (user && isAuthPath) {
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  // Allow all public website routes (/ , /book-appointment, /about, /services, /contact, /privacy-policy, /terms-of-service, /preview-hub, etc.)
  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api routes
     */
    '/((?!_next/static|_next/image|favicon.ico|api|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
