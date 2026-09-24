// Authentication middleware.
//
// This used to blanket-deny every path except a short allowlist (/, /auth/*,
// /api/auth/*, the two webhooks), which meant a signed-out visitor couldn't
// reach /discover, /artists, /legal/*, /for-artists, or any public API
// (/api/artists, /api/search, /api/music/tracks, ...) - the entire app was
// unreachable without an account. Every route that actually needs auth
// already enforces it itself via getServerSession (verified throughout this
// codebase), so this is now an explicit allowlist of what to protect,
// scoped by the matcher below, rather than a blanket gate on everything.
import { withAuth } from 'next-auth/middleware'

export default withAuth({
  pages: {
    signIn: '/auth/signin',
  },
})

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/profile/:path*',
    '/settings/:path*',
    '/library/:path*',
    '/following/:path*',
    '/purchases/:path*',
    '/playlists',
    '/fan/:path*',
    '/creator/:path*',
    '/admin/:path*',
    '/creator-invite-test/:path*',
    '/email-test/:path*',
    '/stripe-test/:path*',
    // Dev/debug endpoints with no auth check of their own - one of them
    // (resend-config) echoes the RESEND_API_KEY prefix, and the other two
    // let the caller make the app send an arbitrary email to any address.
    // They were only ever protected as a side effect of the old blanket
    // gate, so they need to stay listed explicitly now that it's gone.
    '/api/test/:path*',
  ],
}
