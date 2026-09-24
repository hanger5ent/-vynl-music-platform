import { NextAuthOptions, DefaultSession } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const user = await prisma.user.findUnique({
          where: { email: credentials.email.toLowerCase() },
        })

        if (!user?.password) return null

        const isValid = await bcrypt.compare(credentials.password, user.password)
        if (!isValid) return null

        if (user.isSuspended) {
          throw new Error('This account has been suspended.')
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          username: user.username,
          isCreator: user.isCreator,
          isVerified: user.isVerified,
          isAdmin: user.isAdmin,
          bio: user.bio,
          avatar: user.avatar,
        }
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
    async session({ session, token }): Promise<DefaultSession | typeof session> {
      // A suspension (or account deletion) applied after this session's JWT
      // was issued is caught in the jwt callback below and marked here by
      // dropping session.user entirely - every route in the app already
      // gates on `session?.user`, so this makes a suspended user's existing
      // session behave exactly like being signed out, without needing to
      // touch each of those call sites individually.
      if (token?.isSuspended) {
        return { expires: session.expires }
      }

      if (session.user && token) {
        session.user.id = token.id as string
        session.user.username = token.username as string || session.user.email?.split('@')[0]
        session.user.isCreator = token.isCreator as boolean || false
        session.user.isVerified = token.isVerified as boolean || false
        session.user.isAdmin = token.isAdmin as boolean || false
      }
      return session
    },
    async jwt({ token, user }) {
      if (user) {
        // Initial sign-in - authorize() has already rejected a suspended
        // account at this point.
        token.id = user.id
        token.username = user.username || user.email?.split('@')[0] || 'user'
        token.isCreator = user.isCreator || false
        token.isVerified = user.isVerified || false
        token.isAdmin = user.isAdmin || false
        token.isSuspended = false
        return token
      }

      // Every later request re-checks the DB rather than trusting whatever
      // was true at sign-in. Without this, a role promotion/demotion or a
      // suspension applied by an admin has no effect on an already-issued
      // JWT (default lifetime 30 days) until it's naturally refreshed by a
      // fresh sign-in.
      if (token.id) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { isCreator: true, isVerified: true, isAdmin: true, isSuspended: true },
        })
        if (!dbUser) {
          token.isSuspended = true
        } else {
          token.isCreator = dbUser.isCreator
          token.isVerified = dbUser.isVerified
          token.isAdmin = dbUser.isAdmin
          token.isSuspended = dbUser.isSuspended
        }
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
