import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'

export const authOptions: NextAuthOptions = {
  providers: [
    // Credentials provider for testing
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email) return null
        
        // For development - allow any email with password "password"
        if (credentials.password === "password") {
          return {
            id: "1",
            email: credentials.email,
            name: credentials.email.split('@')[0],
          }
        }
        return null
      }
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // Allow all sign-ins for development
      return true
    },
    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url
      return `${baseUrl}/dashboard`
    },
    async session({ session, token }) {
      // Add user info to session from JWT token
      if (session.user && token) {
        session.user.id = token.id as string
        session.user.username = token.username as string || session.user.email?.split('@')[0]
        session.user.isArtist = token.isArtist as boolean || false
        session.user.isVerified = token.isVerified as boolean || false
        session.user.isAdmin = token.isAdmin as boolean || false
      }
      return session
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.username = user.name || user.email?.split('@')[0] || 'user'
        token.isArtist = false
        token.isVerified = false
        token.isAdmin = false
      }
      return token
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt', // Use JWT instead of database for development
  },
}
