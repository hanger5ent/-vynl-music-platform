# 🚀 Deployment Checklist for User Testing

## Pre-Deployment Setup

### 1. Environment Variables
Create a `.env.local` file with these required variables:
```env
# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3002
NEXTAUTH_SECRET=your-secret-key-here

# Admin Configuration
ADMIN_EMAILS=your-email@example.com,admin2@example.com

# Beta Mode
NEXT_PUBLIC_BETA_MODE=true
NEXT_PUBLIC_ENABLE_BETA_BANNER=true

# Database (if using)
DATABASE_URL=your-database-connection-string

# Email Service (for notifications)
EMAIL_SERVICE_API_KEY=your-email-service-key
```

### 2. Build and Test Locally
```powershell
# Install dependencies
npm install

# Run development server
npm run dev

# Test production build
npm run build
npm start
```

### 3. Database Setup (if needed)
```powershell
# If using Prisma
npx prisma generate
npx prisma db push
```

## Quick Deployment Options

### Option 1: Vercel (Recommended - Free Tier)

1. **Push to GitHub**
   ```powershell
   git add .
   git commit -m "Ready for user testing"
   git push origin main
   ```

2. **Deploy to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Connect your GitHub repository
   - Add environment variables in Vercel dashboard
   - Deploy automatically

3. **Custom Domain (Optional)**
   - Add your domain in Vercel settings
   - Update NEXTAUTH_URL to your domain

### Option 2: Railway (Great for Full-Stack Apps)

1. **Connect GitHub Repository**
   - Go to [railway.app](https://railway.app)
   - Connect your GitHub repo
   - Add environment variables

2. **Configure Services**
   - Web service: Your Next.js app
   - Database service: PostgreSQL (if needed)

### Option 3: Netlify (Static Sites + Serverless)

1. **Deploy to Netlify**
   - Connect GitHub repository
   - Build command: `npm run build`
   - Publish directory: `.next`

### Option 4: Local Testing with ngrok (Quick & Free)

```powershell
# Install ngrok globally
npm install -g ngrok

# Start your development server
npm run dev

# In another terminal, expose your local server
ngrok http 3002
```

Your app will be available at the ngrok URL (e.g., `https://abc123.ngrok.io`)

## Post-Deployment Testing

### 1. Verify Core Features
```powershell
# Run your testing script
node scripts/test-features.js

# Check environment
node scripts/check-env.js
```

### 2. Test User Flows
- [ ] Sign up/Login works
- [ ] Creator dashboard accessible
- [ ] Fan dashboard functional
- [ ] Admin dashboard (for admin users)
- [ ] Feedback widget appears
- [ ] Beta features work (if enabled)

### 3. Browser Testing
Test in these browsers:
- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Edge
- [ ] Mobile browsers

### 4. Performance Check
- [ ] Page load times < 3 seconds
- [ ] Images load properly
- [ ] No JavaScript errors in console
- [ ] Responsive on mobile devices

## User Invitation Process

### 1. Prepare Test Accounts
Create some pre-made accounts for easier testing:
```javascript
// Add to your database or use mock data
const testAccounts = [
  {
    email: 'creator-test@example.com',
    password: 'TestCreator123!',
    role: 'creator'
  },
  {
    email: 'fan-test@example.com', 
    password: 'TestFan123!',
    role: 'fan'
  },
  {
    email: 'admin-test@example.com',
    password: 'TestAdmin123!',
    role: 'admin'
  }
];
```

### 2. Send Invitations

**Subject**: 🎵 Help Test My Music Platform - [Your App Name]

**Email Template**:
```
Hi [Name],

I've been working on a music streaming platform that connects artists with fans, and I'd love your feedback!

🔗 **Test Site**: [YOUR_DEPLOYED_URL]
📧 **Test Credentials**: 
   - Email: [test-account@example.com]
   - Password: [TestPassword123!]
   
🎯 **What to Test**:
- Sign up and explore the platform
- Try both creator and fan experiences
- Click the purple feedback button for any issues
- Test on your phone too!

⏰ **Testing Period**: [Date Range]

Thanks for helping make this awesome! 🚀

[Your Name]
```

### 3. Monitor Feedback

```powershell
# Collect feedback data
node scripts/collect-feedback.js

# Check server logs (if deployed)
# Vercel: Check function logs in dashboard
# Railway: Check deployment logs
# Local: Check terminal output
```

## Troubleshooting Common Issues

### Authentication Issues
- Verify NEXTAUTH_URL matches your domain
- Check NEXTAUTH_SECRET is set
- Ensure admin emails are correctly configured

### Database Issues
- Verify DATABASE_URL connection string
- Run database migrations if needed
- Check database service is running (for cloud deployments)

### Performance Issues
- Enable image optimization
- Check bundle size: `npm run build`
- Monitor Vercel analytics or similar

### Mobile Issues
- Test responsive design
- Check touch interactions
- Verify viewport meta tag

## Success Metrics

Track these during testing:
- [ ] Number of testers who complete signup
- [ ] Pages visited per session
- [ ] Feedback submissions
- [ ] Error rates in logs
- [ ] User completion of key flows

## Emergency Plan

If critical issues arise:
1. **Quick Fix**: Deploy hotfix immediately
2. **Rollback**: Revert to previous version
3. **Communication**: Email testers about the issue
4. **Extended Timeline**: Give testers more time if needed

---

## Quick Commands Reference

```powershell
# Start development
npm run dev

# Build for production
npm run build && npm start

# Run tests
npm run test

# Collect feedback
node scripts/collect-feedback.js

# Check deployment status
curl [YOUR_DEPLOYED_URL]
```

**Ready to launch your testing phase?** 🎵✨

Choose your deployment method, send those invitations, and get ready for valuable user feedback!
