# Deployment Guide

## Fixed Issues

✅ **routes-manifest.json Error**: Removed `output: 'standalone'` from Next.js config  
✅ **Vercel Configuration**: Updated vercel.json to use standard Next.js deployment  
✅ **Build Configuration**: Fixed serverExternalPackages configuration warning  
✅ **Build Success**: All 22 pages generated successfully  

## Environment Variables Required

Before deploying, make sure to set these environment variables in your Vercel dashboard:

### Required Variables
```bash
# Database
DATABASE_URL="your-postgresql-connection-string"

# NextAuth.js
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="https://your-app-domain.vercel.app"

# OAuth Providers (Optional)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GITHUB_CLIENT_ID="your-github-client-id"  
GITHUB_CLIENT_SECRET="your-github-client-secret"

# Email (Optional)
EMAIL_SERVER_HOST="smtp.gmail.com"
EMAIL_SERVER_PORT="587"
EMAIL_SERVER_USER="your-email@gmail.com"
EMAIL_SERVER_PASSWORD="your-app-password"
EMAIL_FROM="your-email@gmail.com"

# Stripe (Optional)
STRIPE_PUBLIC_KEY="pk_live_..."
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
```

## Deployment Steps

### Option 1: Vercel CLI (Recommended)
```bash
# Install Vercel CLI globally
npm install -g vercel

# Deploy to preview
npm run deploy:preview

# Deploy to production
npm run deploy
```

### Option 2: Git Integration
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy automatically on push

### Option 3: Vercel Dashboard
1. Go to [vercel.com](https://vercel.com)
2. Import your project from Git
3. Configure environment variables
4. Deploy

## Database Setup

### PostgreSQL (Recommended)
1. Create a PostgreSQL database (Supabase, PlanetScale, or Neon)
2. Set the `DATABASE_URL` environment variable
3. Run migrations: `npx prisma db push`

### Local Development
```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma db push

# View database
npx prisma studio
```

## Post-Deployment Checklist

- [ ] Set all required environment variables
- [ ] Configure database connection
- [ ] Test authentication flows
- [ ] Verify API endpoints work
- [ ] Check subscription functionality
- [ ] Test file uploads (if any)
- [ ] Configure domain (if custom)

## Monitoring

- Check Vercel dashboard for deployment logs
- Monitor function execution times
- Set up error tracking (Sentry recommended)
- Configure analytics (Vercel Analytics)

## Support

If you encounter issues:
1. Check Vercel function logs
2. Verify environment variables are set
3. Check database connectivity
4. Review Next.js build output
