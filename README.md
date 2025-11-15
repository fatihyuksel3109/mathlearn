# MathLearn - Fun Math Games for Kids 🦊

A colorful, animated math learning application built with Next.js for elementary school kids (ages 10-11) to improve their math skills through engaging games.

## Features

- 🎮 **6 Different Math Games**
  - Quick Math Race - 60-second timed math challenges
  - Balloon Pop - Pop balloons with correct answers
  - Adventure Map - Level-based progression system
  - Fraction Builder - Drag and drop fraction learning
  - Geometry Match - Shape matching game
  - Word Problem Stories - Animated story-based math problems

- 🏆 **Gamification**
  - XP system for earning points
  - Daily streak tracking
  - Badge collection
  - Leaderboard rankings

- 🎨 **Cute & Colorful UI**
  - Pastel color scheme
  - Animated mascot (fox)
  - Framer Motion animations
  - Responsive design

- 🔐 **User Authentication**
  - NextAuth with credentials
  - Secure password hashing
  - Email verification with OTP (6-digit code, 5 minutes validity)
  - User profiles with avatars
  
- 🌐 **Internationalization**
  - Multi-language support (Turkish/English)
  - Localized error messages
  - Language switching

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Database**: MongoDB with Mongoose
- **Authentication**: NextAuth.js
- **Email Service**: Nodemailer (SMTP)
- **Internationalization**: next-intl
- **State Management**: Zustand
- **Charts**: Recharts
- **Drag & Drop**: @dnd-kit

## Getting Started

### Prerequisites

- Node.js 18+ installed
- MongoDB running locally or MongoDB Atlas account

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd mathlearn
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.local.example .env.local
```

Edit `.env.local` and add your configuration:
```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here
MONGODB_URI=mongodb://localhost:27017/mathlearn
# Or for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/mathlearn

# Email Configuration (for OTP verification)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

**Note**: For Gmail, you need to generate an App Password (not your regular password):
1. Go to your Google Account settings
2. Enable 2-Step Verification
3. Generate an App Password
4. Use the generated password in `SMTP_PASS`

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
/app
  /api              # API routes
    /auth           # Authentication endpoints
      /otp          # OTP verification endpoints
    /game           # Game-related endpoints
    /user           # User management endpoints
    /badges         # Badge system endpoints
    /leaderboard    # Leaderboard endpoint
    /level          # Level completion endpoint
  /[locale]         # Localized pages (en/tr)
    /dashboard      # Dashboard page
    /games          # Game selection page
    /leaderboard    # Leaderboard page
    /profile        # Profile page
    /login          # Login page
    /signup         # Signup page
    /verify-email   # Email verification page
/components         # React components
/lib                # Utilities and services
  /emailService.ts  # Email service (nodemailer)
/models             # Mongoose models
  /User.ts         # User model
  /OTP.ts          # OTP model
  /GameSession.ts  # Game session model
  /LevelProgress.ts # Level progress model
/messages           # Translation files
  /en.json         # English translations
  /tr.json         # Turkish translations
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Features in Detail

### Games

1. **Quick Math Race**: Answer as many math questions as possible in 60 seconds
2. **Balloon Pop**: Click balloons with correct answers as they float up
3. **Adventure Map**: Complete levels to unlock new areas
4. **Fraction Builder**: Drag and drop blocks to build fractions
5. **Geometry Match**: Match shapes to their descriptions
6. **Word Stories**: Solve math problems from animated stories

### User Features

- **Account Management**
  - Create account with email verification
  - Secure login with credentials
  - Email verification via OTP (One-Time Password)
  - Choose from 6 cute avatars
  - Multi-language interface (Turkish/English)
  
- **Progress Tracking**
  - Track XP and daily streaks
  - Earn badges for achievements
  - View progress charts
  - Compete on leaderboard
  
- **Security**
  - Email verification required before login
  - 6-digit OTP codes with 5-minute expiration
  - Secure password hashing with bcrypt
  - Protected API routes

## Database Models

- **User**: Stores user information, XP, streaks, badges, verification status
- **OTP**: Stores email verification codes with expiration dates
- **GameSession**: Tracks game plays and results
- **LevelProgress**: Tracks level completion and stars

## Authentication Flow

1. **Signup**: User creates account with name, email, and password
2. **OTP Email**: System sends 6-digit verification code to user's email (valid for 5 minutes)
3. **Email Verification**: User enters OTP code on verification page
4. **Account Activation**: Once verified, user can login
5. **Login**: User logs in with email and password (verified users only)

## API Routes

### Authentication
- `POST /api/auth/signup` - Create new user account
- `POST /api/auth/otp/send` - Send OTP verification code
- `POST /api/auth/otp/verify` - Verify OTP code
- `POST /api/auth/[...nextauth]` - NextAuth authentication endpoints

### User
- `GET /api/user` - Get user information
- `POST /api/user/avatar` - Update user avatar

### Games
- `POST /api/game/start` - Start a game session
- `POST /api/game/submit` - Submit game results

### Other
- `GET /api/leaderboard` - Get leaderboard data
- `POST /api/badges/check` - Check for badge achievements
- `POST /api/level/complete` - Mark level as complete

## Contributing

This is a learning project. Feel free to fork and modify for your own use!

## License

MIT

