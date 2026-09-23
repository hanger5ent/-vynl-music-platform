// Authentication middleware
import { withAuth } from 'next-auth/middleware'

export default withAuth(
  function middleware(req) {
    // Add any additional middleware logic here if needed
    return
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Allow access to auth pages without token
        if (req.nextUrl.pathname.startsWith('/auth/')) {
          return true
        }
        
        // Allow access to public pages
        if (req.nextUrl.pathname === '/' ||
            req.nextUrl.pathname.startsWith('/api/auth/') ||
            req.nextUrl.pathname.startsWith('/_next/') ||
            req.nextUrl.pathname.startsWith('/favicon.ico')) {
          return true
        }

        // Stripe and Mux call these server-to-server with no user session —
        // each has its own auth (a signature header, verified inside the
        // route), so they can't be gated behind a login redirect like the
        // rest of the app.
        if (req.nextUrl.pathname === '/api/stripe/webhook' || req.nextUrl.pathname === '/api/mux/webhook') {
          return true
        }

        // Require authentication for protected routes
        return !!token
      },
    },
  }
)

export const config = {
  matcher: [
    '/((?!api/auth|_next/static|_next/image|favicon.ico|public).*)',
  ]
}
