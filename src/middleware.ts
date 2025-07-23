import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl
    const { token } = req.nextauth

    // Redirect to sign in if not authenticated and trying to access protected routes
    if (!token && pathname.startsWith('/dashboard')) {
      return NextResponse.redirect(new URL('/auth/signin', req.url))
    }

    // Redirect to sign in if not authenticated and trying to access artist routes
    if (!token && pathname.startsWith('/artist')) {
      return NextResponse.redirect(new URL('/auth/signin', req.url))
    }

    // Check if user is an artist for artist-only routes
    if (token && pathname.startsWith('/artist') && !token.isArtist) {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl
        
        // Allow access to auth pages without authentication
        if (pathname.startsWith('/auth/')) {
          return true
        }
        
        // Allow access to public pages
        if (pathname === '/' || pathname.startsWith('/track/') || pathname.startsWith('/album/')) {
          return true
        }
        
        // Require authentication for protected routes
        if (pathname.startsWith('/dashboard') || pathname.startsWith('/artist')) {
          return !!token
        }
        
        return true
      },
    },
  }
)

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/artist/:path*',
    '/auth/:path*',
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
