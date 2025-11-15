import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import connectDB from '@/lib/db';
import LevelProgress from '@/models/LevelProgress';
import GameSession from '@/models/GameSession';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    // Get all level progress for this user
    const levelProgresses = await LevelProgress.find({
      userId: (session.user as any).id,
    }).lean();

    // Get all adventure game sessions to calculate correct answers per level
    const adventureSessions = await GameSession.find({
      userId: (session.user as any).id,
      gameType: 'adventure',
    }).lean();

    // Calculate correct answers per level
    // For adventure games, we'll use a metadata field or match by levelId if available
    // For now, we'll aggregate all adventure correct answers and distribute by level requirements
    const correctAnswersByLevel: Record<string, number> = {};
    
    // Get all adventure sessions and calculate total correct answers
    // We'll need to track levelId in game sessions - for now use difficulty as proxy
    // But better approach: store levelId in session metadata
    adventureSessions.forEach((session) => {
      // Use levelId if available, otherwise skip (we need levelId for proper tracking)
      if (session.levelId) {
        if (!correctAnswersByLevel[session.levelId]) {
          correctAnswersByLevel[session.levelId] = 0;
        }
        correctAnswersByLevel[session.levelId] += session.correct || 0;
      }
    });

    // Create a map of level progress
    const progressMap = new Map();
    levelProgresses.forEach((progress) => {
      progressMap.set(progress.levelId, {
        completed: progress.completed,
        stars: progress.stars,
      });
    });

    return NextResponse.json(
      {
        levelProgresses: Array.from(progressMap.entries()).map(([levelId, data]) => ({
          levelId,
          ...data,
        })),
        correctAnswersByLevel,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Level progress API error:', error);
    return NextResponse.json(
      { error: error.message || 'Server error' },
      { status: 500 }
    );
  }
}

