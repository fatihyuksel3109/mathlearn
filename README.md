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
  - User profiles with avatars

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Database**: MongoDB with Mongoose
- **Authentication**: NextAuth.js
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
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
/app
  /api              # API routes
  /games            # Game pages
  /dashboard        # Dashboard page
  /leaderboard      # Leaderboard page
  /profile          # Profile page
  /login            # Login page
  /signup           # Signup page
/components         # React components
/lib                # Utilities and stores
/models             # Mongoose models
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

- Create account and login
- Choose from 6 cute avatars
- Track XP and daily streaks
- Earn badges for achievements
- View progress charts
- Compete on leaderboard

## Database Models

- **User**: Stores user information, XP, streaks, badges
- **GameSession**: Tracks game plays and results
- **LevelProgress**: Tracks level completion and stars

## Contributing

This is a learning project. Feel free to fork and modify for your own use!

## License

MIT

