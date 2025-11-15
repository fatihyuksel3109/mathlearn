import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import connectDB from '@/lib/db';
import GameSession from '@/models/GameSession';
import User from '@/models/User';
import { calculateXP } from '@/lib/gameUtils';
import { checkAllBadges } from '@/lib/badgeSystem';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { sessionId, correct, wrong, timeSpent, questionAnswers } = await request.json();

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
    }

    await connectDB();

    // If user made any wrong answers, they don't earn XP from this session
    const xpEarned = wrong > 0 ? 0 : calculateXP(correct);

    const updateData: any = {
      correct,
      wrong,
      timeSpent,
      xpEarned,
    };

    // Add questionAnswers if provided
    if (questionAnswers && Array.isArray(questionAnswers)) {
      updateData.questionAnswers = questionAnswers.map((qa: any) => ({
        questionType: qa.questionType,
        isCorrect: qa.isCorrect,
        timeSpent: qa.timeSpent,
        timestamp: qa.timestamp ? new Date(qa.timestamp) : new Date(),
      }));
    }

    const gameSession = await GameSession.findByIdAndUpdate(
      sessionId,
      updateData,
      { new: true }
    );

    if (!gameSession) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // Update user XP and streak
    const user = await User.findById((session.user as any).id);
    if (user) {
      user.xp += xpEarned;
      
      // Calculate streak from game history (more reliable)
      const allGames = await GameSession.find({
        userId: (session.user as any).id,
      })
        .sort({ date: 1 })
        .lean();

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

      if (sortedDates.length > 0) {
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

        user.streak = streak;
      } else {
        user.streak = 1; // First game
      }
      
      await user.save();

      // Check for new badges
      const newlyEarnedBadges = await checkAllBadges(
        (session.user as any).id,
        gameSession
      );

      return NextResponse.json(
        {
          message: 'Game submitted successfully',
          xpEarned,
          totalXP: user.xp,
          newlyEarnedBadges,
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        message: 'Game submitted successfully',
        xpEarned,
        totalXP: 0,
        newlyEarnedBadges: [],
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

