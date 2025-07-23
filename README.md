# VYNL - Music Streaming Platform

A modern, all-in-one music streaming platform with **Direct-to-Consumer (D2C)** support and powerful **community building** features. Built with Next.js 14, TypeScript, and Prisma.

## 🚀 Features

### Core Features
- **🎵 Music Streaming**: High-quality audio playback with advanced player controls
- **💰 Direct-to-Consumer Sales**: Artists sell directly to fans with transparent pricing
- **👥 Community Building**: Social features, forums, and fan engagement tools
- **📈 Artist Analytics**: Comprehensive insights for artists and creators
- **🔍 Advanced Search**: Discover music by genre, artist, or mood

### D2C Features
- **Artist Dashboard**: Upload, manage, and sell music directly
- **Payment Processing**: Secure payments with Stripe integration
- **Digital Downloads**: Secure file delivery system
- **Revenue Analytics**: Track sales, streams, and earnings
- **Fan Funding**: Crowdfunding for new releases

### Community Features
- **Social Profiles**: Follow artists and create collections
- **Comments & Reviews**: Engage with tracks and albums
- **Community Forums**: Genre-based discussions
- **Live Events**: Virtual concerts and listening parties
- **Direct Messaging**: Artist-fan communication

## 🛠 Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express, Prisma ORM
- **Database**: PostgreSQL
- **Authentication**: NextAuth.js
- **Payments**: Stripe
- **File Storage**: AWS S3
- **UI Components**: Headless UI, Lucide Icons
- **State Management**: Zustand

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/vynl.git
   cd vynl
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Copy `.env.local` and fill in your values:
   ```bash
   cp .env.local .env.local
   ```

   Required variables:
   - `DATABASE_URL`: PostgreSQL connection string
   - `NEXTAUTH_SECRET`: Authentication secret
   - `STRIPE_SECRET_KEY`: Stripe secret key
   - `AWS_ACCESS_KEY_ID`: AWS access key for file storage

4. **Set up the database**
   ```bash
   npx prisma migrate dev
   npx prisma generate
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🗂 Project Structure

```
src/
├── app/                    # Next.js app router pages
├── components/            # Reusable React components
│   ├── ui/               # Basic UI components
│   ├── player/           # Audio player components
│   ├── artist/           # Artist-specific components
│   └── community/        # Community features
├── lib/                   # Utility functions and configurations
├── hooks/                # Custom React hooks
├── stores/               # Zustand state management
├── types/                # TypeScript type definitions
└── styles/               # Global styles
```

## 🎨 Key Components

### Music Player
- Real-time audio streaming
- Waveform visualization
- Playlist management
- Queue system with shuffle/repeat

### Artist Dashboard
- Track/album upload interface
- Sales and streaming analytics
- Fan engagement metrics
- Revenue tracking

### Community Features
- User profiles and following system
- Comment and review system
- Forum discussions
- Live event integration

## 📱 API Routes

- `/api/tracks` - Track management
- `/api/artists` - Artist profiles
- `/api/payments` - Stripe payment processing
- `/api/upload` - File upload handling
- `/api/community` - Forum and social features

## 🔐 Authentication

The platform uses NextAuth.js for authentication with support for:
- Email/password authentication
- OAuth providers (Google, GitHub, etc.)
- Artist verification system
- Role-based access control

## 💳 Payment Integration

Stripe integration for:
- Direct track/album purchases
- Artist payouts
- Subscription management
- Crowdfunding campaigns

## 📊 Analytics

Comprehensive analytics for:
- Stream counts and demographics
- Sales performance
- Fan engagement metrics
- Revenue tracking
- Geographic distribution

## 🚀 Deployment

The application is optimized for deployment on:
- **Vercel** (recommended for Next.js)
- **Netlify**
- **AWS Amplify**
- **Self-hosted** with Docker

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📞 Support

For questions or support, please contact:
- Email: support@vynl.com
- Discord: [Join our community](https://discord.gg/vynl)
- Documentation: [docs.vynl.com](https://docs.vynl.com)

---

Built with ❤️ for the music community
