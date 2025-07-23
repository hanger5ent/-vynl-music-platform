# Authentication Setup Guide

This guide will help you set up user authentication for your music streaming platform using NextAuth.js.

## What's Included

✅ **NextAuth.js Configuration**
- Email sign-in with magic links
- Google OAuth provider
- GitHub OAuth provider
- Prisma database adapter
- Session management

✅ **Authentication Pages**
- Sign-in page (`/auth/signin`)
- Error handling page (`/auth/error`)

✅ **Protected Routes**
- Dashboard (`/dashboard`)
- Artist area (`/artist`)
- Route protection middleware

✅ **UI Components**
- User dropdown menu
- Header with authentication buttons
- Authentication provider wrapper

## Setup Instructions

### 1. Database Migration

Your Prisma schema already includes the necessary NextAuth.js tables. Run the migration:

```bash
npx prisma migrate dev --name "add-auth-tables"
```

### 2. Environment Variables

Update your `.env.local` file with the following OAuth provider credentials:

```env
# Generate a random string for this
NEXTAUTH_SECRET=your-secret-key-here

# Google OAuth (get from Google Cloud Console)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# GitHub OAuth (get from GitHub Developer Settings)
GITHUB_ID=your-github-client-id
GITHUB_SECRET=your-github-client-secret

# Email settings (already configured in your .env.local)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
```

### 3. OAuth Provider Setup

#### Google OAuth Setup:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth client ID"
5. Set authorized redirect URIs to: `http://localhost:3000/api/auth/callback/google`

#### GitHub OAuth Setup:
1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Set Authorization callback URL to: `http://localhost:3000/api/auth/callback/github`

### 4. Generate NextAuth Secret

Generate a secure random string for `NEXTAUTH_SECRET`:

```bash
openssl rand -base64 32
```

### 5. Email Provider Setup

The email provider is already configured to use your existing SMTP settings. Users will receive magic links to sign in.

## Usage

### Authentication in Pages

```tsx
'use client'

import { useRequireAuth } from '@/hooks/useAuth'

export default function ProtectedPage() {
  const { user, isLoading } = useRequireAuth()

  if (isLoading) return <div>Loading...</div>

  return <div>Welcome {user?.name}!</div>
}
```

### Authentication in Components

```tsx
'use client'

import { useAuth } from '@/hooks/useAuth'

export function MyComponent() {
  const { user, isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    return <div>Please sign in</div>
  }

  return <div>Hello {user?.name}!</div>
}
```

### Sign Out

```tsx
import { signOut } from 'next-auth/react'

// Sign out and redirect to home
await signOut({ callbackUrl: '/' })
```

## Routes

- **Sign In**: `/auth/signin`
- **Dashboard**: `/dashboard` (protected)
- **Artist Dashboard**: `/artist` (protected, artists only)
- **Error Page**: `/auth/error`

## Features

### User Roles
- Regular users can access dashboard
- Artists can access both dashboard and artist area
- Auto-upgrade to artist through application process

### Session Management
- Persistent sessions using database storage
- Automatic session refresh
- Secure session tokens

### Profile Information
- Username auto-generated from email
- Profile pictures from OAuth providers
- Bio and additional profile data

## Security

- CSRF protection built-in
- Secure session handling
- Protected API routes
- Middleware-based route protection

## Troubleshooting

### Common Issues

1. **OAuth redirect URI mismatch**: Ensure callback URLs match exactly
2. **Email not sending**: Check SMTP credentials and Gmail app passwords
3. **Database connection**: Verify PostgreSQL is running and DATABASE_URL is correct
4. **Environment variables**: Ensure all required variables are set

### Development Notes

- The sign-in page includes both OAuth and email options
- Users are automatically redirected after successful authentication
- The middleware protects routes based on authentication status
- Session data includes user roles and profile information

## Next Steps

1. Set up OAuth providers with your credentials
2. Test authentication flow
3. Customize the sign-in page styling
4. Add more profile fields as needed
5. Implement password reset functionality if needed
