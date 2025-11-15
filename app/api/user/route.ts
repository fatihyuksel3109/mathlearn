import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import connectDB from '@/lib/db';
import User from '@/models/User';
import GameSession from '@/models/GameSession';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const user = await User.findById((session.user as any).id).lean();

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get recent games (last 5 for display) - exclude games with 0 correct and 0 wrong
    const recentGames = await GameSession.find({
      userId: (session.user as any).id,
      $or: [
        { correct: { $gt: 0 } },
        { wrong: { $gt: 0 } }
      ]
    })
      .sort({ date: -1 })
      .limit(5)
      .lean();

    // Get game sessions from last 7 days for chart
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const gameSessions = await GameSession.find({
      userId: (session.user as any).id,
      date: { $gte: sevenDaysAgo },
    })
      .sort({ date: 1 })
      .lean();

    // Group by date and sum XP
    const chartDataMap = new Map<string, number>();
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dayOrder: string[] = [];
    
    // Initialize all 7 days with 0 in chronological order
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      const dayName = dayNames[date.getDay()];
      dayOrder.push(dayName);
      chartDataMap.set(dayName, 0);
    }
    
    // Aggregate XP by day
    gameSessions.forEach((game) => {
      const gameDate = new Date(game.date);
      const dayName = dayNames[gameDate.getDay()];
      const currentXP = chartDataMap.get(dayName) || 0;
      chartDataMap.set(dayName, currentXP + (game.xpEarned || 0));
    });
    
    // Convert to array format for chart in chronological order
    const chartData = dayOrder.map((dayName) => ({
      date: dayName,
      xp: chartDataMap.get(dayName) || 0,
    }));

    // Calculate game progress for each game type
    const gameTypes = ['quick-race', 'balloon-pop', 'adventure', 'fractions', 'geometry', 'word-stories'];
    const gameProgressMap = new Map<string, { gamesPlayed: number; totalXP: number; totalCorrect: number; totalWrong: number }>();
    
    // Initialize all game types
    gameTypes.forEach((gameType) => {
      gameProgressMap.set(gameType, { gamesPlayed: 0, totalXP: 0, totalCorrect: 0, totalWrong: 0 });
    });
    
    // Aggregate stats by game type
    const allGames = await GameSession.find({ userId: (session.user as any).id }).lean();
    allGames.forEach((game) => {
      const gameType = game.gameType;
      if (gameProgressMap.has(gameType)) {
        const stats = gameProgressMap.get(gameType)!;
        stats.gamesPlayed += 1;
        stats.totalXP += game.xpEarned || 0;
        stats.totalCorrect += game.correct || 0;
        stats.totalWrong += game.wrong || 0;
      }
    });
    
    // Calculate progress percentage (based on games played, max 20 games = 100%)
    const gameProgress = gameTypes.map((gameType) => {
      const stats = gameProgressMap.get(gameType)!;
      const maxGames = 20; // 20 games = 100% progress
      const progress = Math.min(100, Math.round((stats.gamesPlayed / maxGames) * 100));
      
      return {
        gameType,
        progress,
        gamesPlayed: stats.gamesPlayed,
        totalXP: stats.totalXP,
        totalCorrect: stats.totalCorrect,
        totalWrong: stats.totalWrong,
      };
    });

    // Calculate current streak from game history
    const calculateStreak = () => {
      if (allGames.length === 0) return 0;

      // Get unique dates when games were played (as Date objects normalized to midnight)
      const gameDates = new Set<string>();
      allGames.forEach((game) => {
        const gameDate = new Date(game.date);
        gameDate.setHours(0, 0, 0, 0);
        gameDates.add(gameDate.toISOString().split('T')[0]);
      });

      // Convert to sorted array of dates (most recent first)
      const sortedDates = Array.from(gameDates)
        .map(d => new Date(d + 'T00:00:00.000Z'))
        .sort((a, b) => b.getTime() - a.getTime());

      if (sortedDates.length === 0) return 0;

      // Count consecutive days starting from most recent
      let streak = 1;
      for (let i = 0; i < sortedDates.length - 1; i++) {
        const currentDate = sortedDates[i];
        const nextDate = sortedDates[i + 1];
        
        // Calculate days difference
        const daysDiff = Math.floor(
          (currentDate.getTime() - nextDate.getTime()) / (1000 * 60 * 60 * 24)
        );
        
        if (daysDiff === 1) {
          // Consecutive day
          streak++;
        } else {
          // Gap found, streak ends
          break;
        }
      }

      return streak;
    };

    const calculatedStreak = calculateStreak();

    // Update user streak if it's different (to keep it in sync)
    if (calculatedStreak !== user.streak) {
      await User.findByIdAndUpdate((session.user as any).id, { streak: calculatedStreak });
    }

    return NextResponse.json(
      {
        user: {
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          xp: user.xp,
          streak: calculatedStreak,
          badges: user.badges,
        },
        recentGames: recentGames.map((game) => ({
          gameType: game.gameType,
          correct: game.correct,
          wrong: game.wrong,
          xpEarned: game.xpEarned,
          date: game.date,
        })),
        chartData,
        gameProgress,
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Server error' },
      { status: 500 }
    );
  }
}

