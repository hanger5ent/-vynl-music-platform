# 🧪 VYNL Platform Testing Guide

## 📋 Complete Feature Testing Checklist

### 🏠 **Homepage (/) Features**
- [ ] Beta banner displays when `NEXT_PUBLIC_BETA_MODE=true`
- [ ] Beta banner can be dismissed and stays dismissed
- [ ] Navigation menu works (all links)
- [ ] Sign in/Sign up buttons work
- [ ] Responsive design on mobile/tablet/desktop
- [ ] Footer links work
- [ ] Logo redirects to home

### 🔐 **Authentication System**
#### Sign In Page (/auth/signin)
- [ ] Credentials login works
- [ ] Form validation (empty fields)
- [ ] Error messages display correctly
- [ ] Redirect to dashboard after successful login
- [ ] "Remember me" functionality

#### Sign Up Page (/auth/signup)
- [ ] User registration works
- [ ] Email validation
- [ ] Password strength requirements
- [ ] Confirmation email flow (if implemented)
- [ ] Redirect after registration

#### Authentication State
- [ ] User dropdown appears when logged in
- [ ] User can sign out
- [ ] Protected routes redirect to login
- [ ] Session persists on page refresh

### 🎵 **Music Discovery (/discover)**
- [ ] Search functionality works
- [ ] Genre filters work
- [ ] Tab switching (Tracks/Artists/Playlists)
- [ ] Track like/unlike functionality
- [ ] Beta AI recommendations section (when enabled)
- [ ] Responsive grid layout
- [ ] Loading states

### 👨‍🎤 **Artist Features**
#### Artist Profile (/artist/[id])
- [ ] Artist information displays
- [ ] Track list loads
- [ ] Follow/Unfollow button works
- [ ] Social links work
- [ ] Album/track navigation

#### Artist Dashboard (/creator)
- [ ] Creator application form
- [ ] File upload functionality
- [ ] Form validation
- [ ] Success/error messages
- [ ] Track management

#### Creator Application (/creator/apply)
- [ ] All form fields work
- [ ] File upload for music samples
- [ ] Social media link validation
- [ ] Form submission
- [ ] Success confirmation

### 🛒 **E-commerce Features**
#### Shop Page (/creator/shop)
- [ ] Product creation form
- [ ] Image upload
- [ ] Price validation
- [ ] Product listing
- [ ] Cart functionality
- [ ] Checkout process

#### Cart System
- [ ] Add to cart works
- [ ] Cart badge updates
- [ ] Cart sidebar opens/closes
- [ ] Quantity adjustment
- [ ] Remove items
- [ ] Total calculation

### 👥 **User Management**
#### Dashboard (/dashboard)
- [ ] User stats display
- [ ] Recent activity
- [ ] Navigation to other features
- [ ] Profile settings access

#### Profile (/profile)
- [ ] Profile information editable
- [ ] Avatar upload
- [ ] Settings save correctly
- [ ] Privacy settings

### 🛡️ **Admin Features** (Admin users only)
#### Admin Dashboard (/admin)
- [ ] Access control (only admin emails)
- [ ] Overview tab with statistics
- [ ] User management tab
- [ ] Invite creation tab
- [ ] Content moderation tab
- [ ] Analytics tab
- [ ] System settings tab
- [ ] Beta features tab

#### Invite System
- [ ] Create invites with email
- [ ] Set expiration dates
- [ ] Invite validation works
- [ ] Email notifications (if implemented)

### 🚀 **Beta Features**
- [ ] Beta banner shows/hides correctly
- [ ] Beta settings accessible to all users
- [ ] Feature toggles work in real-time
- [ ] Beta badges display on beta features
- [ ] Local storage saves preferences
- [ ] Reset to defaults works

### 📱 **Responsive Design**
- [ ] Mobile navigation (hamburger menu)
- [ ] Touch-friendly buttons
- [ ] Readable text on small screens
- [ ] Images scale properly
- [ ] Forms work on mobile

### ⚡ **Performance & Technical**
- [ ] Pages load under 3 seconds
- [ ] No console errors
- [ ] No TypeScript compilation errors
- [ ] Environment variables loaded correctly
- [ ] Database connections work (if using DB)
- [ ] File uploads work
- [ ] Error boundaries catch errors

---

## 🔧 **Testing Commands**

### Development Server
```bash
npm run dev              # Start development server
npm run build           # Test production build
npm run start          # Test production server
npm run lint           # Check for code issues
```

### Environment Testing
```bash
# Test with beta mode ON
NEXT_PUBLIC_BETA_MODE=true npm run dev

# Test with beta mode OFF  
NEXT_PUBLIC_BETA_MODE=false npm run dev
```

---

## 🚨 **Common Issues to Check**

### Authentication Issues
- [ ] NextAuth configuration correct
- [ ] Session provider wraps app
- [ ] Protected routes have auth checks
- [ ] Admin emails configured correctly

### Beta Feature Issues
- [ ] Environment variables in .env and .env.local
- [ ] Beta components imported correctly
- [ ] LocalStorage works in all browsers
- [ ] Feature toggles update UI immediately

### Styling Issues
- [ ] Tailwind CSS classes working
- [ ] PostCSS configuration correct
- [ ] Images and assets loading
- [ ] Responsive breakpoints working

### API Issues
- [ ] API routes return correct responses
- [ ] Error handling in API calls
- [ ] CORS configuration (if needed)
- [ ] Request/response validation

---

## 📊 **Browser Testing Matrix**

| Browser | Desktop | Mobile | Tablet |
|---------|---------|--------|--------|
| Chrome  | ✅      | ✅     | ✅     |
| Firefox | ✅      | ✅     | ✅     |
| Safari  | ✅      | ✅     | ✅     |
| Edge    | ✅      | ✅     | ✅     |

---

## 🔍 **Debug Tools**

### Browser DevTools
- Network tab: Check API calls
- Console: Look for JavaScript errors
- Application tab: Check localStorage/sessionStorage
- Lighthouse: Performance audit

### React DevTools
- Component tree inspection
- Props and state debugging
- Performance profiling

---

## 📝 **Testing Log Template**

Create a testing log for each page:

```
Page: /discover
Date: [DATE]
Browser: Chrome 120
Screen: 1920x1080

✅ Search works
✅ Filters work  
❌ Like button not working - needs fixing
✅ Beta AI section shows when enabled
✅ Responsive on mobile

Issues Found:
1. Like button doesn't update state
2. Search is case sensitive (should be insensitive)

Next Steps:
- Fix like button state management
- Improve search functionality
```
