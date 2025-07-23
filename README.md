# VYNL - Music Streaming Platform

A modern, production-ready music streaming platform with **Direct-to-Consumer (D2C)** support and powerful **community building** features. Built with Next.js 14, TypeScript, and Prisma.

🌐 **Live Demo**: [https://vynl-6o3covpkk-vynl-app.vercel.app](https://vynl-6o3covpkk-vynl-app.vercel.app)

## 🚀 Features

### Core Features
- **🎵 Music Streaming**: High-quality audio playback with advanced player controls
- **💰 Direct-to-Consumer Sales**: Artists sell directly to fans with transparent pricing
- **👥 Community Building**: Social features, forums, and fan engagement tools
- **📈 Artist Analytics**: Comprehensive insights for artists and creators
- **🔍 Advanced Search**: Discover music by genre, artist, or mood
- **🎨 Modern UI**: Beautiful, responsive design with Tailwind CSS
- **🔐 Secure Authentication**: NextAuth.js with multiple providers
- **📧 Email Integration**: Resend API for notifications and marketing

### D2C Features
- **Artist Dashboard**: Upload, manage, and sell music directly
- **Payment Processing**: Secure payments with Stripe integration
- **Digital Downloads**: Secure file delivery system
- **Revenue Analytics**: Track sales, streams, and earnings
- **Fan Funding**: Crowdfunding for new releases
- **Creator Tools**: Advanced campaign management and subscriber tools

### Community Features
- **Social Profiles**: Follow artists and create collections
- **Comments & Reviews**: Engage with tracks and albums
- **Community Forums**: Genre-based discussions
- **Live Events**: Virtual concerts and listening parties
- **Direct Messaging**: Artist-fan communication
- **Beta Testing Program**: User feedback and feature testing

## 🛠 Tech Stack

- **Frontend**: Next.js 14.2.16, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM 6.12.0
- **Database**: PostgreSQL (ready for production)
- **Authentication**: NextAuth.js with Prisma adapter
- **Payments**: Stripe integration (configured)
- **Email**: Resend API for transactional emails
- **UI Components**: Headless UI 2.2.4, Heroicons, Lucide Icons
- **Forms**: React Hook Form with Zod validation
- **Deployment**: Vercel (optimized build pipeline)

## 📦 Installation & Setup

### Prerequisites
- **Node.js** 18+ and npm
- **PostgreSQL** database (local or cloud)
- **Stripe** account for payments
- **Resend** account for emails

### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/hanger5ent/vynl-music-platform.git
   cd vynl-music-platform
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create `.env.local` file:
   ```bash
   # Database
   DATABASE_URL="postgresql://username:password@localhost:5432/vynl"
   
   # NextAuth
   NEXTAUTH_SECRET="your-nextauth-secret"
   NEXTAUTH_URL="http://localhost:3000"
   
   # Stripe (optional for testing)
   STRIPE_PUBLISHABLE_KEY="pk_test_..."
   STRIPE_SECRET_KEY="sk_test_..."
   
   # Email (Resend)
   RESEND_API_KEY="re_..."
   EMAIL_FROM="noreply@yourdomain.com"
   ```

4. **Set up the database**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

6. **Build for production**
   ```bash
   npm run build
   npm start
   ```

## 🏗 Project Structure

```
src/
├── app/                     # Next.js 14 App Router
│   ├── (auth)/             # Authentication pages
│   ├── api/                # API routes
│   ├── creator/            # Creator dashboard
│   ├── fan/               # Fan interface
│   └── admin/             # Admin panel
├── components/             # React components
│   ├── ui/                # Reusable UI components
│   ├── auth/              # Authentication components
│   ├── creator/           # Creator-specific components
│   ├── player/            # Audio player
│   └── admin/             # Admin components
├── lib/                   # Utilities and configs
├── hooks/                 # Custom React hooks
├── types/                 # TypeScript definitions
└── middleware.ts          # Next.js middleware
prisma/
└── schema.prisma          # Database schema
```

## 🎨 Key Features & Pages

### 🏠 Homepage
- Hero section with platform overview
- Featured artists and trending content
- Newsletter signup integration
- Modern gradient design

### 🎵 Music Player
- Advanced audio controls
- Queue management
- Real-time playback status
- Responsive design

### 👨‍🎨 Creator Dashboard (`/creator`)
- Campaign composer for marketing
- Subscriber management system  
- Revenue analytics
- Shop management for direct sales
- Invite system for new creators

### 👥 Fan Interface (`/fan`)
- Artist discovery and following
- Subscription management
- Personalized content feed
- Community interaction tools

### 🔐 Authentication
- Secure sign-in/sign-up flows
- Social login integration ready
- Role-based access (Admin, Creator, Fan)
- Profile management

### 🛍 E-Commerce
- Direct artist-to-fan sales
- Stripe payment processing
- Digital product delivery
- Shopping cart functionality

### 📧 Email System
- Welcome emails for new users
- Payment confirmations
- Marketing campaigns
- Transactional notifications

## 🌐 API Routes

### Authentication
- `POST /api/auth/[...nextauth]` - NextAuth endpoints

### Creator Management  
- `GET /api/creator/campaigns` - Campaign data
- `GET /api/creator/subscribers` - Subscriber analytics

### Invitations
- `POST /api/invites/create` - Create invitations
- `POST /api/invites/validate` - Validate invite codes
- `GET /api/invites/creator` - Creator invitations

### Commerce
- `POST /api/shop/create` - Create products
- `POST /api/stripe/create-payment` - Process payments
- `POST /api/stripe/webhook` - Stripe webhooks

### Email & Testing
- `POST /api/newsletter/subscribe` - Newsletter signup
- `GET /api/test/resend-config` - Email configuration test
- `POST /api/test/email-welcome` - Test welcome emails

## � Deployment

### Vercel (Recommended)
The application is optimized for Vercel deployment:

```bash
# Deploy via CLI
npm run deploy

# Or connect GitHub repository to Vercel for automatic deployments
```

**Live Demo**: [https://vynl-6o3covpkk-vynl-app.vercel.app](https://vynl-6o3covpkk-vynl-app.vercel.app)

### Environment Variables for Production
Set these in your Vercel dashboard:
- `DATABASE_URL` - PostgreSQL connection string
- `NEXTAUTH_SECRET` - Authentication secret
- `NEXTAUTH_URL` - Your production URL
- `RESEND_API_KEY` - Email API key
- `STRIPE_SECRET_KEY` - Stripe secret (optional)

### Alternative Platforms
- **Netlify**: Compatible with Next.js
- **Railway**: Good PostgreSQL integration  
- **Render**: Simple deployment process

## 📊 Current Status

✅ **Production Ready**
- ✅ 41 routes successfully building
- ✅ TypeScript compilation passing
- ✅ All components functional
- ✅ Database schema complete
- ✅ Authentication system working
- ✅ Email integration active
- ✅ Payment system configured

🚧 **In Development**
- 🔄 Advanced audio player features
- 🔄 File upload system
- 🔄 Advanced analytics dashboard
- 🔄 Mobile app companion

## 📱 Browser Support

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## 🧪 Testing

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

## � Key Technologies

- **Next.js 14.2.16** - React framework with App Router
- **TypeScript** - Type safety and developer experience
- **Prisma 6.12.0** - Database ORM and migrations
- **Tailwind CSS** - Utility-first styling
- **NextAuth.js** - Authentication solution
- **Stripe** - Payment processing
- **Resend** - Email delivery service
- **Vercel** - Deployment and hosting

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### Development Workflow
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 Support & Contact

For questions, support, or collaboration:
- **GitHub**: [hanger5ent/vynl-music-platform](https://github.com/hanger5ent/vynl-music-platform)
- **Issues**: Report bugs or request features
- **Discussions**: Join the community conversation

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Prisma for excellent database tooling
- Vercel for seamless deployment
- The open-source community

---

**Built with ❤️ for the music community**

*Empowering artists and connecting fans through technology*
