import NextAuth from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name?: string | null
      image?: string | null
      username?: string
      isArtist?: boolean
      isVerified?: boolean
      isAdmin?: boolean
      bio?: string | null
      avatar?: string | null
    }
  }

  interface User {
    id: string
    email: string
    name?: string | null
    image?: string | null
    username?: string
    isArtist?: boolean
    isVerified?: boolean
    isAdmin?: boolean
    bio?: string | null
    avatar?: string | null
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    username?: string
    isArtist?: boolean
    isVerified?: boolean
    isAdmin?: boolean
    bio?: string | null
    avatar?: string | null
  }
}
